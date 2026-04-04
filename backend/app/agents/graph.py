"""
LangGraph multi-agent graph — Phase 3.
Tools + memory injection + streaming.
"""
import asyncio, uuid as uuid_mod, operator
from typing import TypedDict, Annotated, Literal
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
MAX_TOKENS = 2048

AGENT_TOOLS: dict[AgentName, list[BaseTool]] = {
    AgentName.NEXUS:      [web_search],
    AgentName.ALEX:       [execute_python, web_search],
    AgentName.VORTEX:     [query_analytics, web_search],
    AgentName.RESEARCHER: [web_search],  # Elite research agent with extended web search
}

class AgentState(TypedDict):
    messages:       Annotated[list[BaseMessage], operator.add]
    session_id:     str
    user_id:        str
    active_agent:   str
    route_decision: str
    final_response: str
    memory_context: str

def _llm(tools=None, streaming=True):
    llm = ChatAnthropic(model=MODEL, max_tokens=MAX_TOKENS,
                        api_key=get_settings().anthropic_api_key, streaming=streaming)
    return llm.bind_tools(tools) if tools else llm

# ── Router ────────────────────────────────────────────────────────────────
ROUTER_SYS = """You are NEXUS, orchestrator of CraftAgent.
Reply with ONE word only:
- "code"       → code generation, debugging, technical implementation
- "data"       → SQL, analytics, statistics, data pipelines
- "research"   → deep research, source verification, literature synthesis, academic analysis
- "answer"     → general explanations, casual questions"""

async def router_node(state: AgentState) -> dict:
    resp = await _llm(streaming=False).ainvoke(
        [SystemMessage(content=ROUTER_SYS)] + state["messages"])
    decision = resp.content.strip().lower()
    if decision not in ("code", "data", "research", "answer"):
        decision = "answer"
    logger.info("route", session=state["session_id"], decision=decision)
    return {"route_decision": decision}

def route(state: AgentState) -> Literal["nexus_answer", "alex_code", "vortex_data", "researcher_answer"]:
    return {
        "code": "alex_code",
        "data": "vortex_data",
        "research": "researcher_answer",
    }.get(state.get("route_decision", "answer"), "nexus_answer")

# ── Memory injection ──────────────────────────────────────────────────────
async def inject_memory(state: AgentState) -> dict:
    if not state.get("user_id"):
        return {"memory_context": ""}
    try:
        msg = next((m.content for m in reversed(state["messages"])
                    if isinstance(m, HumanMessage)), "")
        if not msg:
            return {"memory_context": ""}
        svc = MemoryService(user_id=state["user_id"])
        entries = svc.retrieve_context(msg, exclude_session=state.get("session_id"))
        ctx = MemoryService.format_context(entries)
        return {"memory_context": ctx}
    except Exception as e:
        logger.warning("memory_inject_failed", error=str(e))
        return {"memory_context": ""}

# ── Memory store (fire-and-forget) ───────────────────────────────────────
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
    tools    = AGENT_TOOLS[agent_name]
    tool_map = {t.name: t for t in tools}

    async def node(state: AgentState) -> dict:
        sid  = state["session_id"]
        uid  = state.get("user_id", "")
        ctx  = state.get("memory_context", "")
        sys  = get_system_prompt(agent_name)
        if ctx:
            sys = f"{sys}\n\n{ctx}"

        if agent_name != AgentName.NEXUS:
            publish_handoff(sid, AgentName.NEXUS.value, agent_name.value)
            await asyncio.sleep(0.05)

        llm   = _llm(tools=tools, streaming=True)
        msgs  = [SystemMessage(content=sys)] + state["messages"]
        full  = ""
        tcalls = []
        extra: list[BaseMessage] = []

        try:
            buf = None
            async for chunk in llm.astream(msgs):
                has_tc = hasattr(chunk, "tool_calls") and chunk.tool_calls
                has_txt = hasattr(chunk, "content") and chunk.content
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
            publish_token(sid, "\n\n⚙ *Calling tools...*\n\n")
            for tc in tcalls:
                fn = tool_map.get(tc["name"])
                try:
                    publish_token(sid, f"🔧 `{tc['name']}`\n")
                    res = fn.invoke(tc["args"]) if fn else f"Unknown tool: {tc['name']}"
                except Exception as e:
                    res = f"Tool error: {e}"
                extra.append(ToolMessage(content=str(res), tool_call_id=tc["id"]))

            # Second pass — synthesise with tool results
            full = ""
            try:
                async for chunk in _llm(streaming=True).astream(
                        [SystemMessage(content=sys)] + state["messages"] + extra):
                    if hasattr(chunk, "content") and chunk.content:
                        full += chunk.content
                        publish_token(sid, chunk.content)
            except Exception as e:
                full = f"[Synthesis error] {e}"

        publish_done(sid, full, agent_name.value)
        _store(uid, sid, full, "assistant", agent_name.value)

        return {
            "messages": [AIMessage(content=full)] + extra,
            "active_agent": agent_name.value,
            "final_response": full,
        }

    node.__name__ = f"{agent_name.value.lower()}_node"
    return node

# ── Build ─────────────────────────────────────────────────────────────────
def build_agent_graph():
    g = StateGraph(AgentState)
    g.add_node("inject_memory", inject_memory)
    g.add_node("router",        router_node)
    g.add_node("nexus_answer",  _make_agent_node(AgentName.NEXUS))
    g.add_node("alex_code",     _make_agent_node(AgentName.ALEX))
    g.add_node("vortex_data",   _make_agent_node(AgentName.VORTEX))
    g.add_node("researcher_answer", _make_agent_node(AgentName.RESEARCHER))
    g.set_entry_point("inject_memory")
    g.add_edge("inject_memory", "router")
    g.add_conditional_edges("router", route)
    g.add_edge("nexus_answer", END)
    g.add_edge("alex_code",    END)
    g.add_edge("vortex_data",  END)
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
        "memory_context": "",
    })
    return result.get("final_response", "")
