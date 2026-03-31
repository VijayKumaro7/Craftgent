"""
Web search tool — powered by Tavily.

If TAVILY_API_KEY is not set, returns a graceful "search disabled" message
so the agent can still function without it.

Used by NEXUS for research tasks.
"""
import structlog
from langchain_core.tools import tool
from app.core.config import get_settings

logger = structlog.get_logger()


@tool
def web_search(query: str) -> str:
    """
    Search the web for current information.
    Use this when you need up-to-date facts, recent news, or external data.

    Args:
        query: The search query string.

    Returns:
        A summary of the top search results.
    """
    settings = get_settings()

    if not settings.tavily_api_key:
        return (
            "[WEB SEARCH DISABLED] No Tavily API key configured. "
            "Add TAVILY_API_KEY to .env to enable web search. "
            "I'll answer from my training knowledge instead."
        )

    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=settings.tavily_api_key)

        response = client.search(
            query=query,
            search_depth="basic",
            max_results=4,
            include_answer=True,
        )

        parts = []

        # Include the synthesised answer if available
        if response.get("answer"):
            parts.append(f"Summary: {response['answer']}")

        # Include top results
        for r in response.get("results", [])[:3]:
            title   = r.get("title", "")
            url     = r.get("url", "")
            content = r.get("content", "")[:400]
            parts.append(f"\n[{title}]({url})\n{content}")

        return "\n".join(parts) if parts else "No results found."

    except Exception as e:
        logger.error("web_search_failed", error=str(e), query=query)
        return f"[SEARCH ERROR] {e}. Falling back to training knowledge."
