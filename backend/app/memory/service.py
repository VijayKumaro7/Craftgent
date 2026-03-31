"""
MemoryService — agent memory backed by ChromaDB.

Two operations:
  store_message()    — embed + upsert a message after it's sent
  retrieve_context() — semantic search for relevant past messages
                       before generating a response

Context retrieved is injected into the agent system prompt as:
  "Relevant context from past conversations:
   [user] how does X work?
   [NEXUS] X works by..."

This gives agents genuine long-term memory across sessions.
"""
import uuid
from datetime import datetime, timezone
from typing import NamedTuple
import structlog

from app.memory.chroma import get_memory_collection

logger = structlog.get_logger()

TOP_K = 5          # number of past messages to retrieve
MIN_RELEVANCE = 0.3  # cosine similarity threshold (0=unrelated, 1=identical)


class MemoryEntry(NamedTuple):
    content: str
    role: str
    agent: str | None
    relevance: float


class MemoryService:
    """
    Per-request instance — call store_message() after sending,
    retrieve_context() before generating.
    """

    def __init__(self, user_id: str):
        self.user_id   = user_id
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
        Embed and store a single message.
        Runs synchronously in the Celery worker after task completion.
        """
        try:
            self.collection.upsert(
                ids=[message_id],
                documents=[content],
                metadatas=[{
                    "user_id":    self.user_id,
                    "session_id": session_id,
                    "role":       role,
                    "agent":      agent or "",
                    "timestamp":  datetime.now(timezone.utc).isoformat(),
                }],
            )
        except Exception as e:
            # Memory storage is best-effort — never block the main flow
            logger.warning("memory_store_failed", error=str(e), message_id=message_id)

    # ── Retrieve ──────────────────────────────────────────────────────────

    def retrieve_context(
        self,
        query: str,
        exclude_session: str | None = None,
    ) -> list[MemoryEntry]:
        """
        Semantic search for relevant past messages.

        Args:
            query:           The user's current message (used as search query)
            exclude_session: Current session — exclude to avoid self-referencing

        Returns:
            List of MemoryEntry sorted by relevance (most relevant first).
        """
        try:
            where: dict = {"user_id": {"$eq": self.user_id}}
            if exclude_session:
                where = {
                    "$and": [
                        {"user_id":    {"$eq": self.user_id}},
                        {"session_id": {"$ne": exclude_session}},
                    ]
                }

            results = self.collection.query(
                query_texts=[query],
                n_results=TOP_K,
                where=where,
                include=["documents", "metadatas", "distances"],
            )

            entries: list[MemoryEntry] = []
            docs      = results.get("documents",  [[]])[0]
            metas     = results.get("metadatas",  [[]])[0]
            distances = results.get("distances",  [[]])[0]

            for doc, meta, dist in zip(docs, metas, distances):
                # ChromaDB returns L2 distance for cosine space — convert
                relevance = 1.0 - dist   # higher = more similar
                if relevance >= MIN_RELEVANCE:
                    entries.append(MemoryEntry(
                        content=doc,
                        role=meta.get("role", "user"),
                        agent=meta.get("agent") or None,
                        relevance=relevance,
                    ))

            return sorted(entries, key=lambda e: e.relevance, reverse=True)

        except Exception as e:
            logger.warning("memory_retrieve_failed", error=str(e))
            return []

    # ── Format for prompt injection ───────────────────────────────────────

    @staticmethod
    def format_context(entries: list[MemoryEntry]) -> str:
        """
        Format retrieved memories into a prompt-injectable string.
        Keeps it concise — agents don't need to see raw metadata.
        """
        if not entries:
            return ""

        lines = ["Relevant context from past conversations:"]
        for entry in entries:
            speaker = entry.agent if entry.role == "assistant" and entry.agent else entry.role
            # Truncate very long entries
            content = entry.content[:300] + "..." if len(entry.content) > 300 else entry.content
            lines.append(f"[{speaker}] {content}")

        return "\n".join(lines)
