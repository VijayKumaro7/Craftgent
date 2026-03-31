"""
Phase 3 tests — memory, tools, agent stats, graph routing.
"""
import pytest
from unittest.mock import patch, MagicMock


# ── Memory service ────────────────────────────────────────────────────────

class TestMemoryService:
    def test_format_context_empty(self):
        from app.memory.service import MemoryService
        assert MemoryService.format_context([]) == ""

    def test_format_context_with_entries(self):
        from app.memory.service import MemoryService, MemoryEntry
        entries = [
            MemoryEntry("How does RAG work?", "user",      None,    0.9),
            MemoryEntry("RAG retrieves docs.", "assistant", "NEXUS", 0.85),
        ]
        ctx = MemoryService.format_context(entries)
        assert "Relevant context" in ctx
        assert "How does RAG work?" in ctx
        assert "NEXUS" in ctx

    def test_format_context_truncates_long_content(self):
        from app.memory.service import MemoryService, MemoryEntry
        entries = [MemoryEntry("x" * 400, "user", None, 0.8)]
        ctx = MemoryService.format_context(entries)
        assert "..." in ctx

    def test_store_message_handles_collection_error(self):
        from app.memory.service import MemoryService
        svc = object.__new__(MemoryService)
        svc.user_id = "u"
        svc.collection = MagicMock()
        svc.collection.upsert.side_effect = Exception("down")
        svc.store_message("id", "hi", "user", "sess")  # must not raise

    def test_retrieve_context_handles_collection_error(self):
        from app.memory.service import MemoryService
        svc = object.__new__(MemoryService)
        svc.user_id = "u"
        svc.collection = MagicMock()
        svc.collection.query.side_effect = Exception("down")
        assert svc.retrieve_context("q") == []


# ── Tools ─────────────────────────────────────────────────────────────────

class TestCodeExecTool:
    def test_runs_simple_python(self):
        from app.tools.code_exec import execute_python
        result = execute_python.invoke({"code": "print(2 + 2)"})
        assert "4" in result

    def test_blocks_subprocess_import(self):
        from app.tools.code_exec import execute_python
        result = execute_python.invoke({"code": "import subprocess; subprocess.run(['ls'])"})
        assert "SANDBOX BLOCKED" in result

    def test_handles_syntax_error(self):
        from app.tools.code_exec import execute_python
        result = execute_python.invoke({"code": "def broken(: pass"})
        assert result != "(no output)"

    def test_empty_output(self):
        from app.tools.code_exec import execute_python
        result = execute_python.invoke({"code": "x = 1 + 1"})
        assert result == "(no output)"

    def test_timeout_enforced(self):
        from app.tools.code_exec import execute_python
        with patch("app.tools.code_exec.get_settings") as m:
            m.return_value.code_exec_timeout = 1
            m.return_value.code_exec_timeout = 1
            result = execute_python.invoke({"code": "import time; time.sleep(10)"})
            assert "TIMEOUT" in result


class TestWebSearchTool:
    def test_returns_disabled_without_key(self):
        from app.tools.web_search import web_search
        with patch("app.tools.web_search.get_settings") as m:
            m.return_value.tavily_api_key = ""
            result = web_search.invoke({"query": "test"})
            assert "DISABLED" in result


class TestSqlTool:
    def test_blocks_write_statements(self):
        from app.tools.sql_tool import query_analytics
        for stmt in ["INSERT INTO users VALUES (1)", "DROP TABLE messages",
                     "UPDATE users SET username='x'", "DELETE FROM messages"]:
            assert "BLOCKED" in query_analytics.invoke({"sql": stmt})

    def test_allows_select(self):
        from app.tools.sql_tool import _is_read_only
        assert _is_read_only("SELECT * FROM messages") is True

    def test_blocks_write_in_subquery(self):
        from app.tools.sql_tool import _is_read_only
        assert _is_read_only("SELECT * FROM (DELETE FROM users) AS d") is False


# ── AgentStats ────────────────────────────────────────────────────────────

class FakeStat:
    """Pure Python stand-in for AgentStats — no SQLAlchemy."""
    XP_PER_LEVEL = 200
    MAX_LEVEL    = 50

    def __init__(self, xp=0, level=1, message_count=0, hp=100, mp=100):
        self.xp = xp; self.level = level
        self.message_count = message_count
        self.hp = hp; self.mp = mp

    def add_xp(self, amount):
        self.xp            += amount
        self.message_count += 1
        self.level = min(self.xp // self.XP_PER_LEVEL + 1, self.MAX_LEVEL)
        self.mp    = max(10, self.mp - 2)

    @property
    def xp_percent(self):
        return int((self.xp % self.XP_PER_LEVEL) / self.XP_PER_LEVEL * 100)


class TestAgentStats:
    def test_xp_increments_level(self):
        stat = FakeStat()
        for _ in range(4):
            stat.add_xp(FakeStat.XP_PER_LEVEL // 4)
        assert stat.level == 2
        assert stat.message_count == 4

    def test_xp_percent_at_halfway(self):
        stat = FakeStat(xp=FakeStat.XP_PER_LEVEL // 2)
        assert stat.xp_percent == 50

    def test_level_capped_at_max(self):
        stat = FakeStat(xp=FakeStat.XP_PER_LEVEL * 999, level=50)
        stat.add_xp(0)
        assert stat.level <= FakeStat.MAX_LEVEL

    def test_mp_drains(self):
        stat = FakeStat(mp=100)
        stat.add_xp(10)
        assert stat.mp < 100

    def test_mp_floor_is_ten(self):
        stat = FakeStat(mp=10)
        stat.add_xp(5)
        assert stat.mp == 10   # can't go below 10


# ── Graph routing ─────────────────────────────────────────────────────────

class TestGraphRouting:
    BASE = {"messages": [], "session_id": "", "user_id": "",
            "active_agent": "NEXUS", "final_response": "", "memory_context": ""}

    def test_routes(self):
        from app.agents.graph import route
        assert route({**self.BASE, "route_decision": "code"})   == "alex_code"
        assert route({**self.BASE, "route_decision": "data"})   == "vortex_data"
        assert route({**self.BASE, "route_decision": "answer"}) == "nexus_answer"
        assert route({**self.BASE, "route_decision": "???"})    == "nexus_answer"

    def test_graph_compiled(self):
        from app.agents.graph import agent_graph
        assert agent_graph is not None

    def test_tool_assignments(self):
        from app.agents.graph import AGENT_TOOLS
        from app.models.models import AgentName
        assert len(AGENT_TOOLS[AgentName.NEXUS])  >= 1
        assert len(AGENT_TOOLS[AgentName.ALEX])   >= 2
        assert len(AGENT_TOOLS[AgentName.VORTEX]) >= 2
