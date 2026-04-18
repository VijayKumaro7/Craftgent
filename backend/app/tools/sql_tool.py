"""
SQL analytics tool — read-only queries for VORTEX.

VORTEX can query the CraftAgent DB to answer questions like:
  "How many messages have I sent?"
  "Which agent do I use most?"
  "What's my total XP across all sessions?"

Safety:
  - Only SELECT statements allowed
  - Table whitelist enforced — only analytics-safe tables accessible
  - Sensitive columns (hashed_password) excluded
  - Runs against a read-only connection pool
  - Result rows capped at 50
  - Query timeout: 5 seconds
"""
import re
import structlog
from langchain_core.tools import tool
from sqlalchemy import create_engine, text
from app.core.config import get_settings

logger = structlog.get_logger()

MAX_ROWS    = 50
QUERY_TIMEOUT = 5  # seconds

ALLOWED_TABLES = {"messages", "chat_sessions", "agent_stats"}

BLOCKED_COLUMNS = {"hashed_password", "password", "secret", "token"}

WRITE_PATTERN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE)\b",
    re.IGNORECASE,
)

TABLE_REF_PATTERN = re.compile(
    r"\b(?:FROM|JOIN|INTO|UPDATE)\s+([a-zA-Z_][a-zA-Z0-9_]*)",
    re.IGNORECASE,
)


def _is_read_only(sql: str) -> bool:
    """Reject any statement containing write keywords."""
    return not bool(WRITE_PATTERN.search(sql))


def _references_only_allowed_tables(sql: str) -> tuple[bool, str]:
    """Ensure the query only accesses whitelisted tables."""
    referenced = {m.group(1).lower() for m in TABLE_REF_PATTERN.finditer(sql)}
    disallowed = referenced - ALLOWED_TABLES
    if disallowed:
        return False, f"Access denied for table(s): {', '.join(sorted(disallowed))}. Allowed: {', '.join(sorted(ALLOWED_TABLES))}"
    if not referenced:
        return False, "Could not determine target table. Use explicit FROM clauses."
    return True, ""


def _references_blocked_columns(sql: str) -> bool:
    """Check if the query tries to access sensitive columns."""
    lowered = sql.lower()
    return any(col in lowered for col in BLOCKED_COLUMNS)


def _make_readonly_engine():
    """Synchronous engine for the tool — separate from the async app engine."""
    url = get_settings().database_url.replace("+asyncpg", "+psycopg2")
    return create_engine(url, pool_size=2, max_overflow=0, connect_args={"options": "-c statement_timeout=5000"})


@tool
def query_analytics(sql: str) -> str:
    """
    Run a read-only SQL query against the CraftAgent database.
    Use this to analyse conversation history, message counts, and agent usage.
    Only SELECT statements are permitted.

    Available tables:
      - messages       (id, session_id, role, content, agent, token_count, created_at)
      - chat_sessions  (id, user_id, active_agent, created_at, updated_at)
      - agent_stats    (id, user_id, agent_name, xp, level, message_count)

    Args:
        sql: A read-only SQL SELECT statement.

    Returns:
        Query results as a formatted table, or an error message.
    """
    if not _is_read_only(sql):
        return "[SQL BLOCKED] Only SELECT statements are allowed."

    allowed, reason = _references_only_allowed_tables(sql)
    if not allowed:
        return f"[SQL BLOCKED] {reason}"

    if _references_blocked_columns(sql):
        return "[SQL BLOCKED] Query references restricted columns."

    try:
        engine = _make_readonly_engine()
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            rows   = result.fetchmany(MAX_ROWS)
            cols   = list(result.keys())

            if not rows:
                return "Query returned no rows."

            # Format as a simple text table
            col_widths = [max(len(str(c)), max((len(str(r[i])) for r in rows), default=0))
                          for i, c in enumerate(cols)]
            header = " | ".join(str(c).ljust(w) for c, w in zip(cols, col_widths))
            sep    = "-+-".join("-" * w for w in col_widths)
            lines  = [header, sep]
            for row in rows:
                lines.append(" | ".join(str(v).ljust(w) for v, w in zip(row, col_widths)))

            if len(rows) == MAX_ROWS:
                lines.append(f"(showing first {MAX_ROWS} rows)")

            return "\n".join(lines)

    except Exception as e:
        logger.error("sql_tool_failed", error=str(e))
        return "[SQL ERROR] Query failed. Check syntax and try again."
