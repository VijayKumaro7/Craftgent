"""
LangGraph multi-agent graph — Phase 3.
Tools + memory injection + streaming.

Context-window optimizations:
  - Per-agent max_tokens: ALEX/RESEARCHER get 8096 for long outputs; router gets 16
  - Per-agent history window: messages are trimmed per agent before the LLM sees them
  - LLM instance caching: ChatAnthropic objects are built once per (agent, streaming, tools)
    key instead of being recreated on every request
  - Prompt caching: system prompt marked with cache_control so Anthropic caches
    the prefix and reduces both latency and token cost
"""
import asyncio, uuid as uuid_mod, operator
from typing import TypedDict, Annotated, Literal, Any
import structlog
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import (
    BaseMessage, HumanMessage, SystemMessage, AIMessage, ToolMessage
)
from langchain_core.tools import BaseTool
from langgraph.graph import StateGraph, END

from app.agents.prompts import get_system_prompt
from app.models.models import AgentName
from app.tasks.redis_bus import publish_token, publish_done, publish_handoff, publish_error
from app.core.config import get_settings
from app.memory.service import MemoryService
from app.tools.web_search import web_search
from app.tools.code_exec import execute_python
from app.tools.sql_tool import query_analytics

logger = structlog.get_logger()
MODEL = "claude-sonnet-4-20250514"

# ── Per-agent context-window config ───────────────────────────────────────
# max_tokens    : maximum output tokens (how much the agent can write per turn)
# history_window: how many recent messages from the conversation to include
#                 (older messages are dropped to save context; memory RAG covers
#                  cross-session recall so this window can stay tight)

AGENT_MAX_TOKENS: dict[AgentName, int] = {
    AgentName.NEXUS:      4096,   # research summaries, explanations
    AgentName.ALEX:       8096,   # full code files, test suites, multi-function modules
    AgentName.VORTEX:     4096,   # data analysis reports, SQL + commentary
    AgentName.RESEARCHER: 8096,   # deep literature reviews, long synthesis reports
}

AGENT_HISTORY_WINDOW: dict[AgentName, int] = {
    AgentName.NEXUS:      20,   # 10 turns — good general balance
    AgentName.ALEX:       14,   # 7 turns  — code context goes stale; keep it tight
    AgentName.VORTEX:     22,   # 11 turns — data analysis benefits from session history
    AgentName.RESEARCHER: 30,   # 15 turns — research threads need the deepest history
}

AGENT_TOOLS: dict[AgentName, list[BaseTool]] = {
    AgentName.NEXUS:      [web_search],
    AgentName.ALEX:       [execute_python, web_search],
    AgentName.VORTEX:     [query_analytics, web_search],
    AgentName.RESEARCHER: [web_search],
}


# ── LLM instance cache ────────────────────────────────────────────────────
# Avoids rebuilding ChatAnthropic + binding tools on every request.
# Keys: "{agent_value}_{with_tools}_{streaming}"
_llm_cache: dict[str, Any] = {}
_router_llm: ChatAnthropic | None = None


def _get_agent_llm(agent_name: AgentName, with_tools: bool = True, streaming: bool = True) -> Any:
    key = f"{agent_name.value}_{with_tools}_{streaming}"
    if key not in _llm_cache:
        llm = ChatAnthropic(
            model=MODEL,
            max_tokens=AGENT_MAX_TOKENS[agent_name],
            api_key=get_settings().anthropic_api_key,
            streaming=streaming,
        )
        tools = AGENT_TOOLS[agent_name] if with_tools else None
        _llm_cache[key] = llm.bind_tools(tools) if tools else llm
    return _llm_cache[key]


def _get_router_llm() -> ChatAnthropic:
    global _router_llm
    if _router_llm is None:
        # Router outputs a single word — 16 tokens is more than enough
        _router_llm = ChatAnthropic(
            model=MODEL,
            max_tokens=16,
            api_key=get_settings().anthropic_api_key,
            streaming=False,
        )
    return _router_llm


# ── AgentState ────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages:       Annotated[list[BaseMessage], operator.add]
    session_id:     str
    user_id:        str
    active_agent:   str
    route_decision: str
    final_response: str


# ── Router ────────────────────────────────────────────────────────────────
ROUTER_SYS = """You are NEXUS, orchestrator of CraftAgent.
Reply with ONE word only:
- "code"       → code generation, debugging, technical implementation
- "data"       → SQL, analytics, statistics, data pipelines
- "research"   → deep research, source verification, literature synthesis, academic analysis
- "answer"     → general explanations, casual questions"""

async def router_node(state: AgentState) -> dict:
    resp = await _get_router_llm().ainvoke(
        [SystemMessage(content=ROUTER_SYS)] + state["messages"])
    decision = resp.content.strip().lower()
    if decision not in ("code", "data", "research", "answer"):
        decision = "answer"
    logger.info("route", session=state["session_id"], decision=decision)
    return {"route_decision": decision}

def route(state: AgentState) -> Literal["nexus_answer", "alex_code", "vortex_data", "researcher_answer"]:
    return {
        "code":     "alex_code",
        "data":     "vortex_data",
        "research": "researcher_answer",
    }.get(state.get("route_decision", "answer"), "nexus_answer")


# ── Memory injection (agent-aware) ────────────────────────────────────────
async def _inject_memory_for_agent(state: AgentState, agent_name: AgentName) -> str:
    uid = state.get("user_id", "")
    if not uid:
        return ""
    try:
        msg = next(
            (m.content for m in reversed(state["messages"]) if isinstance(m, HumanMessage)),
            "",
        )
        if not msg:
            return ""
        svc     = MemoryService(user_id=uid)
        entries = svc.retrieve_context(
            msg,
            exclude_session=state.get("session_id"),
            agent_name=agent_name.value,
        )
        return MemoryService.format_context(entries, agent_name=agent_name.value)
    except Exception as e:
        logger.warning("memory_inject_failed", error=str(e))
        return ""


# ── Memory store (fire-and-forget) ────────────────────────────────────────
def _store(user_id: str, session_id: str, content: str, role: str, agent=None):
    if not user_id or not content:
        return
    try:
        MemoryService(user_id=user_id).store_message(
            str(uuid_mod.uuid4()), content, role, session_id, agent)
    except Exception as e:
        logger.warning("mem_store_fail", error=str(e))


# ── Agent node factory ────────────────────────────────────────────────────
def _make_agent_node(agent_name: AgentName):

    async def node(state: AgentState) -> dict:
        sid  = state["session_id"]
        uid  = state.get("user_id", "")
        ctx  = await _inject_memory_for_agent(state, agent_name)

        # Build system prompt; mark it for prompt caching so Anthropic
        # reuses the cached prefix and reduces latency + cost on repeat calls.
        sys_content = get_system_prompt(agent_name)
        if ctx:
            sys_content = f"{sys_content}\n\n{ctx}"
        sys_msg = SystemMessage(
            content=sys_content,
            additional_kwargs={"cache_control": {"type": "ephemeral"}},
        )

        if agent_name != AgentName.NEXUS:
            publish_handoff(sid, AgentName.NEXUS.value, agent_name.value)
            await asyncio.sleep(0.05)

        # Trim conversation history to the agent-specific window.
        # Older turns are dropped here because ChromaDB RAG already covers
        # long-range recall; keeping a tight window lowers token cost.
        window       = AGENT_HISTORY_WINDOW[agent_name]
        history_msgs = state["messages"][-window:]

        llm    = _get_agent_llm(agent_name, with_tools=True,  streaming=True)
        msgs   = [sys_msg] + history_msgs
        full   = ""
        tcalls = []
        extra: list[BaseMessage] = []

        try:
            buf = None
            async for chunk in llm.astream(msgs):
                has_tc  = hasattr(chunk, "tool_calls") and chunk.tool_calls
                has_txt = hasattr(chunk, "content")    and chunk.content
                if has_txt and not has_tc:
                    full += chunk.content
                    publish_token(sid, chunk.content)
                buf = chunk if buf is None else buf + chunk
            if buf and hasattr(buf, "tool_calls") and buf.tool_calls:
                tcalls = buf.tool_calls
                extra.append(buf)
        except Exception as e:
            publish_error(sid, str(e))
            return {"messages": [AIMessage(content=f"[ERROR] {e}")],
                    "active_agent": agent_name.value, "final_response": f"[ERROR] {e}"}

        # ── Tool execution ────────────────────────────────────────────
        if tcalls:
            tool_map = {t.name: t for t in AGENT_TOOLS[agent_name]}
            publish_token(sid, "\n\n⚙ *Calling tools...*\n\n")
            for tc in tcalls:
                fn = tool_map.get(tc["name"])
                try:
                    publish_token(sid, f"🔧 `{tc['name']}`\n")
                    res = fn.invoke(tc["args"]) if fn else f"Unknown tool: {tc['name']}"
                except Exception as e:
                    res = f"Tool error: {e}"
                extra.append(ToolMessage(content=str(res), tool_call_id=tc["id"]))

            # Second pass — synthesise with tool results (no tools bound)
            synth_llm = _get_agent_llm(agent_name, with_tools=False, streaming=True)
            full = ""
            try:
                async for chunk in synth_llm.astream(
                        [sys_msg] + history_msgs + extra):
                    if hasattr(chunk, "content") and chunk.content:
                        full += chunk.content
                        publish_token(sid, chunk.content)
            except Exception as e:
                full = f"[Synthesis error] {e}"

        publish_done(sid, full, agent_name.value)
        _store(uid, sid, full, "assistant", agent_name.value)

        return {
            "messages":       [AIMessage(content=full)] + extra,
            "active_agent":   agent_name.value,
            "final_response": full,
        }

    node.__name__ = f"{agent_name.value.lower()}_node"
    return node


# ── Build ─────────────────────────────────────────────────────────────────
def build_agent_graph():
    g = StateGraph(AgentState)
    g.add_node("router",             router_node)
    g.add_node("nexus_answer",       _make_agent_node(AgentName.NEXUS))
    g.add_node("alex_code",          _make_agent_node(AgentName.ALEX))
    g.add_node("vortex_data",        _make_agent_node(AgentName.VORTEX))
    g.add_node("researcher_answer",  _make_agent_node(AgentName.RESEARCHER))
    g.set_entry_point("router")
    g.add_conditional_edges("router", route)
    g.add_edge("nexus_answer",      END)
    g.add_edge("alex_code",         END)
    g.add_edge("vortex_data",       END)
    g.add_edge("researcher_answer", END)
    return g.compile()

agent_graph = build_agent_graph()


async def run_agent_graph(
    session_id: str, user_message: str,
    history: list[BaseMessage], user_id: str = ""
) -> str:
    _store(user_id, session_id, user_message, "user")
    result = await agent_graph.ainvoke({
        "messages":       history + [HumanMessage(content=user_message)],
        "session_id":     session_id,
        "user_id":        user_id,
        "active_agent":   AgentName.NEXUS.value,
        "route_decision": "",
        "final_response": "",
    })
    return result.get("final_response", "")
