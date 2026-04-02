# CraftAgent ⛏

**Minecraft-style AI Agent Command Center**

Multi-agent chat system powered by Claude Sonnet, FastAPI, LangGraph, WebSockets, ChromaDB, and Celery.

**📍 Project Status:** Currently in **Phase 1-2 (Backend Development)**. The backend infrastructure is scaffolded and functional. Frontend, deployment infrastructure, and agent refinement coming in Phase 3-4. See [ROADMAP.md](./ROADMAP.md) for details.

---

## Planned Architecture

```
Browser (React + Vite)          [Phase 3+]
    │  WebSocket  │  REST
    ▼             ▼
Nginx (prod) → FastAPI (8000)   [✅ In Progress]
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
       Celery    Redis    PostgreSQL
       Worker   (broker   (sessions,
       (agents)  + pubsub) messages, xp)
       [Phase 2] [Phase 1] [✅ Phase 1]
          │
     LangGraph
    NEXUS → ALEX / VORTEX
    [Phase 2+]
          │
    ChromaDB (RAG memory)
    [Phase 2+]
    Tools: web_search, code_exec, sql_query
```

## Stack (Target)

| Layer     | Technology                                              | Status |
|-----------|--------------------------------------------------------|--------|
| Frontend  | React 18, Vite, TypeScript, Tailwind, Zustand          | Phase 3+ |
| Backend   | FastAPI, Python 3.12, SQLAlchemy async, Alembic        | ✅ In Progress |
| AI        | Anthropic Claude Sonnet, LangGraph, LangChain           | Phase 2+ |
| Memory    | ChromaDB, sentence-transformers                        | Phase 2+ |
| Tasks     | Celery 5, Redis 7                                      | Phase 1+ |
| Auth      | JWT (python-jose), bcrypt                              | ✅ In Progress |
| Infra     | Docker, Nginx, GitHub Actions                          | Phase 3+ |

---

## Getting Started (Backend Development)

### Prerequisites
- Python 3.12+
- PostgreSQL 14+
- Redis 7+
- ANTHROPIC_API_KEY (get from [console.anthropic.com](https://console.anthropic.com))

### 1. Setup

```bash
git clone https://github.com/vijaykumaro7/craftgent.git
cd craftgent/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment (copy and fill in required variables)
cp ../.env.example .env
# Edit .env — required: ANTHROPIC_API_KEY, SECRET_KEY
```

### 2. Database Setup

```bash
# Ensure PostgreSQL is running, then:
alembic upgrade head    # Run all migrations
```

### 3. Run Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Open http://localhost:8000/docs for Swagger UI
```

### Quick Test

```bash
curl http://localhost:8000/api/health
```

---

## Development Workflow

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Running tests
- Code style and linting
- Creating migrations
- Contributing guidelines

---

## API Endpoints

```
GET  /api/health              → service health + DB status
POST /api/auth/register       → create account
POST /api/auth/login          → get access + refresh token
POST /api/auth/refresh        → refresh access token
GET  /api/auth/me             → current user info
WS   /api/ws/{session_id}     → main chat WebSocket [Phase 2+]
GET  /api/sessions/{id}       → session + message history [Phase 2+]
GET  /api/stats               → live agent XP + levels [Phase 2+]
GET  /docs                    → Swagger UI (dev only)
```

## WebSocket Protocol (Planned for Phase 2)

```
Client → Server:
  {"type": "chat", "message": "...", "agent": "NEXUS", "token": "jwt"}
  {"type": "ping"}

Server → Client:
  {"type": "connected",  "session_id": "..."}
  {"type": "token",      "data": "..."}          ← one per token
  {"type": "done",       "data": "full text", "agent": "NEXUS"}
  {"type": "handoff",    "from_agent": "NEXUS", "to_agent": "ALEX"}
  {"type": "system",     "data": "..."}
  {"type": "error",      "data": "..."}
  {"type": "pong"}
```

## Agents (Phase 2+)

| Agent  | Role           | Tools                      | Routes when...             |
|--------|----------------|----------------------------|-----------------------------|
| NEXUS  | Orchestrator   | web_search                 | Default — research, Q&A     |
| ALEX   | Code Warrior   | execute_python, web_search | Code generation/debugging   |
| VORTEX | Data Creeper   | query_analytics, web_search| SQL, stats, data analysis   |

## Environment Variables

| Variable            | Required | Default     | Description                     |
|---------------------|----------|-------------|---------------------------------|
| ANTHROPIC_API_KEY   | ✅       | —           | Anthropic API key               |
| SECRET_KEY          | ✅       | —           | JWT signing secret (32+ chars)  |
| DATABASE_URL        | ✅       | local pg    | PostgreSQL async URL            |
| REDIS_URL           | ✅       | local redis | Redis connection URL            |
| CHROMA_HOST         | —        | localhost   | ChromaDB host                   |
| CHROMA_PORT         | —        | 8001        | ChromaDB port                   |
| TAVILY_API_KEY      | —        | ""          | Tavily web search (optional)    |
| CORS_ORIGINS        | —        | :5173       | Allowed CORS origins            |
| APP_ENV             | —        | development | production disables /docs       |
| RATE_LIMIT_PER_MIN  | —        | 20          | API rate limit per user         |

---

## Tests

```bash
cd backend
pytest tests/ -v                # Run all tests
pytest tests/test_phase1.py     # Phase 1: health, auth endpoints
pytest tests/test_phase2.py     # Phase 2: JWT, WebSocket manager
pytest tests/test_phase3.py     # Phase 3: memory, tools, XP, routing
```

## Current Project Structure

```
craftgent/
├── README.md                   ✅ (you are here)
├── ROADMAP.md                  ✅ Project phases and timeline
├── CONTRIBUTING.md             ✅ Development guidelines
├── backend/                    ✅ Phase 1-2
│   ├── app/
│   │   ├── main.py             ← FastAPI app factory
│   │   ├── core/               ← config, logging, metrics
│   │   ├── db/                 ← async SQLAlchemy, models
│   │   ├── models/             ← User, ChatSession, Message, AgentStats
│   │   ├── schemas/            ← Pydantic request/response models
│   │   ├── auth/               ← JWT + bcrypt authentication
│   │   ├── agents/             ← LangGraph graph + system prompts [Phase 2+]
│   │   ├── memory/             ← ChromaDB RAG memory service [Phase 2+]
│   │   ├── tools/              ← web_search, code_exec, sql_query [Phase 2+]
│   │   ├── tasks/              ← Celery app, Redis bus, tasks [Phase 2+]
│   │   ├── ws/                 ← WebSocket connection manager [Phase 2+]
│   │   └── api/                ← routers: health, auth, chat (Phase 2+), ws, stats
│   ├── alembic/                ← Database migrations
│   └── tests/                  ← Test suite
├── frontend/                   [Phase 3+] Not yet implemented
│   └── src/
│       ├── components/
│       ├── store/              ← Zustand: app + auth state
│       └── types/              ← TypeScript interfaces
├── .github/workflows/          [Phase 3+] CI/CD pipelines - planned
├── docker-compose.yml          [Phase 3+] Full stack - planned
├── nginx/                      [Phase 3+] Reverse proxy - planned
└── Dockerfile / docker-compose configs for production - [Phase 3+]
```

---

## Resources

- **API Docs:** `http://localhost:8000/docs` (when running locally)
- **Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Project Plan:** See [ROADMAP.md](./ROADMAP.md)
- **Anthropic Claude API:** https://console.anthropic.com
