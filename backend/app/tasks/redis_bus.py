"""
Redis pub/sub channel helpers.

Flow:
  Celery worker generates token
      → publishes to channel  craftgent:session:{session_id}:tokens
  WebSocket hub subscribes to that channel
      → forwards each token to the connected client

This decouples the worker process from the FastAPI process cleanly.
"""
import json
import redis.asyncio as aioredis
import redis as syncredis
from app.core.config import get_settings

# Channel name templates
TOKEN_CHANNEL   = "craftgent:session:{session_id}:tokens"
CONTROL_CHANNEL = "craftgent:session:{session_id}:control"


def _sync_redis():
    return syncredis.from_url(get_settings().redis_url, decode_responses=True)


async def _async_redis():
    return await aioredis.from_url(get_settings().redis_url, decode_responses=True)


# ── Publisher (called from Celery worker — sync) ──────────────────────────

def publish_token(session_id: str, token: str) -> None:
    """Publish a single token to the session channel."""
    r = _sync_redis()
    channel = TOKEN_CHANNEL.format(session_id=session_id)
    r.publish(channel, json.dumps({"type": "token", "data": token}))
    r.close()


def publish_done(session_id: str, full_text: str, agent: str) -> None:
    """Signal that the agent has finished responding."""
    r = _sync_redis()
    channel = TOKEN_CHANNEL.format(session_id=session_id)
    r.publish(channel, json.dumps({"type": "done", "data": full_text, "agent": agent}))
    r.close()


def publish_error(session_id: str, error: str) -> None:
    """Signal an error to the WebSocket hub."""
    r = _sync_redis()
    channel = TOKEN_CHANNEL.format(session_id=session_id)
    r.publish(channel, json.dumps({"type": "error", "data": error}))
    r.close()


def publish_handoff(session_id: str, from_agent: str, to_agent: str) -> None:
    """Signal an agent delegation event."""
    r = _sync_redis()
    channel = TOKEN_CHANNEL.format(session_id=session_id)
    r.publish(channel, json.dumps({
        "type": "handoff",
        "from_agent": from_agent,
        "to_agent": to_agent,
    }))
    r.close()


# ── Subscriber (called from FastAPI — async) ──────────────────────────────

async def subscribe_session(session_id: str):
    """
    Async generator that yields parsed messages from the session channel.
    Used by the WebSocket endpoint to forward tokens to the client.
    """
    r = await _async_redis()
    pubsub = r.pubsub()
    channel = TOKEN_CHANNEL.format(session_id=session_id)
    await pubsub.subscribe(channel)

    try:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            try:
                data = json.loads(message["data"])
                yield data
                # Stop listening after done or error
                if data.get("type") in ("done", "error"):
                    break
            except json.JSONDecodeError:
                continue
    finally:
        await pubsub.unsubscribe(channel)
        await r.aclose()
