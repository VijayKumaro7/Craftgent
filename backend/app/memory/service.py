"""
MemoryService — agent memory backed by ChromaDB.

Optimizations vs v1:
  - Per-agent retrieval config (TOP_K, MIN_RELEVANCE, max_content_len)
  - Agent-biased retrieval: same-agent memories get a relevance boost so each
    agent's own history surfaces first, while cross-agent context fills the rest
  - Content-hash deduplication on store — prevents the same response being
    indexed twice on retries or duplicate Celery calls
  - Content truncation limit raised and made per-agent (code needs more chars)
  - Better context block formatting with a clear header/footer
"""
import hashlib
from datetime import datetime, timezone
from typing import NamedTuple
import structlog

from app.memory.chroma import get_memory_collection

logger = structlog.get_logger()

# ── Per-agent retrieval tuning ─────────────────────────────────────────────
# top_k          : how many past messages to surface
# min_relevance  : cosine-similarity floor  (0 = unrelated, 1 = identical)
# max_content_len: chars before truncation — code needs more room than prose
# agent_boost    : extra relevance added when the stored message is from THIS agent

_AGENT_CONFIG: dict[str, dict] = {
    "NEXUS":      {"top_k": 6, "min_relevance": 0.30, "max_content_len": 500, "agent_boost": 0.07},
    "ALEX":       {"top_k": 5, "min_relevance": 0.38, "max_content_len": 900, "agent_boost": 0.10},
    "VORTEX":     {"top_k": 5, "min_relevance": 0.33, "max_content_len": 700, "agent_boost": 0.08},
    "RESEARCHER": {"top_k": 8, "min_relevance": 0.25, "max_content_len": 550, "agent_boost": 0.06},
}
_DEFAULT_CONFIG = {"top_k": 5, "min_relevance": 0.30, "max_content_len": 500, "agent_boost": 0.07}


class MemoryEntry(NamedTuple):
    content:   str
    role:      str
    agent:     str | None
    relevance: float


class MemoryService:
    """
    Per-request instance.
    Call store_message() after sending, retrieve_context() before generating.
    """

    def __init__(self, user_id: str):
        self.user_id    = user_id
        self.collection = get_memory_collection()

    # ── Store ─────────────────────────────────────────────────────────────

    def store_message(
        self,
        message_id: str,
        content: str,
        role: str,
        session_id: str,
        agent: str | None = None,
    ) -> None:
        """
        Embed and upsert a single message.

        Uses a content-hash ID so identical content stored twice (retries,
        duplicate Celery calls) silently overwrites instead of duplicating.
        The caller-supplied message_id is kept in metadata for traceability.
        """
        if not content or not content.strip():
            return

        # Hash-based ID: same user + session + content = same slot
        dedup_id = hashlib.md5(
            f"{self.user_id}:{session_id}:{content[:250]}".encode()
        ).hexdigest()

        try:
            self.collection.upsert(
                ids=[dedup_id],
                documents=[content],
                metadatas=[{
                    "user_id":    self.user_id,
                    "session_id": session_id,
                    "role":       role,
                    "agent":      agent or "",
                    "message_id": message_id,
                    "timestamp":  datetime.now(timezone.utc).isoformat(),
                }],
            )
        except Exception as e:
            logger.warning("memory_store_failed", error=str(e), dedup_id=dedup_id)

    # ── Retrieve ──────────────────────────────────────────────────────────

    def retrieve_context(
        self,
        query: str,
        exclude_session: str | None = None,
        agent_name: str | None = None,
    ) -> list[MemoryEntry]:
        """
        Semantic search for relevant past messages.

        When agent_name is supplied the results are agent-biased: memories
        produced by that same agent get a small relevance boost so they rank
        higher than generic cross-agent context.

        Args:
            query:           The user's current message (search query)
            exclude_session: Exclude the active session to avoid self-reference
            agent_name:      Responding agent — enables per-agent config + boost
        """
        cfg       = _AGENT_CONFIG.get(agent_name or "", _DEFAULT_CONFIG)
        top_k     = cfg["top_k"]
        min_rel   = cfg["min_relevance"]
        boost     = cfg["agent_boost"]

        try:
            where: dict = {"user_id": {"$eq": self.user_id}}
            if exclude_session:
                where = {
                    "$and": [
                        {"user_id":    {"$eq": self.user_id}},
                        {"session_id": {"$ne": exclude_session}},
                    ]
                }

            # Fetch 2× top_k candidates so boosting + filtering have headroom
            results = self.collection.query(
                query_texts=[query],
                n_results=max(top_k * 2, 10),
                where=where,
                include=["documents", "metadatas", "distances"],
            )

            entries: list[MemoryEntry] = []
            docs      = results.get("documents",  [[]])[0]
            metas     = results.get("metadatas",  [[]])[0]
            distances = results.get("distances",  [[]])[0]

            for doc, meta, dist in zip(docs, metas, distances):
                # Defence in depth: the $ne where-clause should already exclude
                # the active session, but double-check here so a stale index
                # entry can never leak back into the same session's context.
                if exclude_session and meta.get("session_id") == exclude_session:
                    continue

                # dist is cosine distance (0=identical, 2=opposite)
                # → cosine similarity = 1 - dist
                relevance = 1.0 - dist

                # Agent boost — same-agent memories rank higher
                stored_agent = meta.get("agent", "")
                if agent_name and stored_agent == agent_name:
                    relevance = min(1.0, relevance + boost)

                if relevance >= min_rel:
                    entries.append(MemoryEntry(
                        content=doc,
                        role=meta.get("role", "user"),
                        agent=stored_agent or None,
                        relevance=relevance,
                    ))

            entries.sort(key=lambda e: e.relevance, reverse=True)
            return entries[:top_k]

        except Exception as e:
            logger.warning("memory_retrieve_failed", error=str(e))
            return []

    # ── Format for prompt injection ───────────────────────────────────────

    @staticmethod
    def format_context(
        entries: list[MemoryEntry],
        agent_name: str | None = None,
        max_content_len: int | None = None,
    ) -> str:
        """
        Format retrieved memories into a prompt-injectable block.
        If max_content_len is None the per-agent config value is used.
        """
        if not entries:
            return ""

        if max_content_len is None:
            cfg = _AGENT_CONFIG.get(agent_name or "", _DEFAULT_CONFIG)
            max_content_len = cfg["max_content_len"]

        label = f" ({agent_name}-prioritised)" if agent_name else ""
        lines = [f"[Memory context{label} — most relevant first]"]

        for entry in entries:
            speaker = (
                entry.agent if entry.role == "assistant" and entry.agent
                else entry.role
            )
            content = (
                entry.content[:max_content_len] + "…"
                if len(entry.content) > max_content_len
                else entry.content
            )
            lines.append(f"[{speaker}] {content}")

        lines.append("[End of memory context]")
        return "\n".join(lines)
