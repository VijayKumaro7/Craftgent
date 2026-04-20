"""
ChromaDB client + collection setup.

Collections:
  craftgent_memory — one collection, partitioned by user_id metadata filter.
  Each document = one message (user or assistant).
  Metadata: user_id, session_id, role, agent, timestamp.

We use ChromaDB's built-in embedding function (sentence-transformers
all-MiniLM-L6-v2 by default) — small, fast, runs locally with no API key.
"""
import chromadb
from chromadb.utils import embedding_functions
from functools import lru_cache
from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_chroma_client() -> chromadb.HttpClient:
    """
    Returns a cached ChromaDB HTTP client.
    In Docker: points to the chromadb service.
    In local dev without Docker: falls back to in-memory client.
    """
    settings = get_settings()
    try:
        client = chromadb.HttpClient(
            host=settings.chroma_host,
            port=settings.chroma_port,
        )
        client.heartbeat()   # raises if server not reachable
        return client
    except Exception:
        # Fallback: ephemeral in-memory client (dev without Docker)
        return chromadb.EphemeralClient()  # type: ignore[return-value]


@lru_cache(maxsize=1)
def get_embedding_fn() -> embedding_functions.SentenceTransformerEmbeddingFunction:
    """
    Local sentence-transformers embedding — no external API needed.
    Model: all-MiniLM-L6-v2 (22MB, fast, good quality for RAG).
    Cached so the model is only loaded once per process.
    """
    return embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )


@lru_cache(maxsize=1)
def get_memory_collection() -> chromadb.Collection:
    """
    Returns the shared memory collection, creating it if absent.
    Cached — avoids repeated collection lookups on every request.
    """
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=get_settings().chroma_collection,
        embedding_function=get_embedding_fn(),
        metadata={"hnsw:space": "cosine"},
    )
