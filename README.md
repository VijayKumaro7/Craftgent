# CraftAgent ⛏

**Minecraft-style AI Agent Command Center**

Multi-agent chat system powered by Claude claude-sonnet-4-20250514, FastAPI, LangGraph,
WebSockets, ChromaDB, and Celery. Built across 4 phases — from scaffold to production.

---

## Architecture

```
Browser (React + Vite)
    │  WebSocket  │  REST
    ▼             ▼
Nginx (prod) → FastAPI (8000)
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
       Celery    Redis    PostgreSQL
       Worker   (broker   (sessions,
       (agents)  + pubsub) messages, xp)
          │
     LangGraph
    NEXUS → ALEX / VORTEX
          │
    ChromaDB (RAG memory)
    Tools: web_search, code_exec, sql_query
```

## Stack

| Layer     | Technology                                              |
|-----------|--------------------------------------------------------|
| Frontend  | React 18, Vite, TypeScript, Tailwind, Zustand          |
| Backend   | FastAPI, Python 3.12, SQLAlchemy async, Alembic        |
| AI        | Anthropic claude-sonnet-4-20250514, LangGraph, LangChain       |
| Memory    | ChromaDB, sentence-transformers all-MiniLM-L6-v2       |
| Tasks     | Celery 5, Redis 7                                      |
| Auth      | JWT (python-jose), bcrypt                              |
| Infra     | Docker Compose, Nginx, GitHub Actions, Railway         |

---

## Quick Start (Local Dev)

### Prerequisites
- Docker Desktop
- Node 20+
- Python 3.12+

### 1. Clone + configure

```bash
git clone <your-repo>
cd craftgent
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY and SECRET_KEY at minimum
```

### 2. Start infrastructure (DB + Redis + ChromaDB)

```bash
docker compose up db redis chromadb -d
```

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head          # run all migrations
uvicorn app.main:app --reload # http://localhost:8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

### Or: one command (Docker)

```bash
docker compose up --build     # starts everything
# → open http://localhost:5173
```

---

## Production Deployment

### Railway (recommended)

```bash
# 1. Set secrets in GitHub repo settings:
#    RAILWAY_TOKEN, ANTHROPIC_API_KEY, SECRET_KEY
#    VITE_API_URL, VITE_WS_URL, POSTGRES_*, REDIS_PASSWORD

# 2. Push to main — CI runs automatically:
git push origin main
# → runs: test → build → push images → deploy
```

### Self-hosted (VPS)

```bash
cp .env.example .env.prod
# Fill all values

docker compose -f docker-compose.prod.yml up --build -d
# → Nginx on :80, API behind proxy, migrations run on startup
```

---

## Developer Commands

```bash
make install          # install all deps
make dev-backend      # FastAPI with hot reload
make dev-frontend     # Vite dev server
make test             # pytest (backend)
make lint             # ruff + mypy
make migrate          # alembic upgrade head
make migrate-new m="your message"  # new migration
make docker-up        # all services
make docker-down      # stop all
```

---

## API Endpoints

```
GET  /api/health              → service health + DB status
POST /api/auth/register       → create account
POST /api/auth/login          → get access + refresh token
POST /api/auth/refresh        → refresh access token
GET  /api/auth/me             → current user info
WS   /api/ws/{session_id}     → main chat WebSocket
GET  /api/sessions/{id}       → session + message history
GET  /api/stats               → live agent XP + levels
GET  /docs                    → Swagger UI (dev only)
GET  /metrics                 → Prometheus metrics
```

## WebSocket Protocol

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

## Agents

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
pytest tests/ -v           # 45 tests across all 4 phases
pytest tests/test_phase1.py  # Phase 1: health, chat endpoints
pytest tests/test_phase2.py  # Phase 2: auth, JWT, WebSocket manager
pytest tests/test_phase3.py  # Phase 3: memory, tools, XP, routing
```

## Project Structure

```
craftgent/
├── .github/workflows/ci.yml    ← GitHub Actions CI/CD
├── docker-compose.yml          ← dev: api + db + redis + chromadb + worker
├── docker-compose.prod.yml     ← prod: + nginx, hardened, internal network
├── nginx/craftgent.conf        ← reverse proxy config
├── Makefile                    ← developer shortcuts
├── backend/
│   ├── app/
│   │   ├── main.py             ← FastAPI app factory
│   │   ├── core/               ← config, logging, metrics
│   │   ├── db/                 ← async SQLAlchemy engine
│   │   ├── models/             ← User, ChatSession, Message, AgentStats
│   │   ├── schemas/            ← Pydantic request/response models
│   │   ├── auth/               ← JWT + bcrypt
│   │   ├── agents/             ← LangGraph graph + system prompts
│   │   ├── memory/             ← ChromaDB RAG memory service
│   │   ├── tools/              ← web_search, code_exec, sql_query
│   │   ├── tasks/              ← Celery app, Redis bus, agent tasks
│   │   ├── ws/                 ← WebSocket connection manager
│   │   └── api/                ← routers: health, chat, auth, ws, stats
│   ├── alembic/                ← DB migrations
│   └── tests/                  ← 45 tests
└── frontend/
    └── src/
        ├── types/              ← shared TypeScript interfaces
        ├── api/                ← axios client + SSE/fetch helpers
        ├── store/              ← Zustand: app state + auth state
        ├── hooks/              ← useWebSocket, useAgentStats
        └── components/
            ├── auth/           ← LoginScreen
            ├── layout/         ← TopBar, Hotbar, SkyBackground
            ├── chat/           ← ChatPanel (streaming)
            ├── agents/         ← AgentSidebar (pixel heads, XP bars)
            ├── tasks/          ← TaskPanel (inventory, quests, crafting)
            └── ui/             ← McBar, PixelHead
```
