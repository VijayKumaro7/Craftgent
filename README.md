# CraftAgent ⛏

**Minecraft-style AI Agent Command Center**

Multi-agent chat system powered by Claude Sonnet, FastAPI, LangGraph, WebSockets, ChromaDB, and Celery.

**📍 Project Status:** 
- ✅ **Phase 1-2:** Backend (FastAPI, auth, chat) — **COMPLETE & FUNCTIONAL**
- ✅ **Phase 3:** Frontend (React + Vite) — **COMPLETE & READY TO TEST**
- ⏳ **Phase 4:** Deployment (Docker, Nginx, CI/CD) — **PLANNED**

See [ROADMAP.md](./ROADMAP.md) for detailed timeline and [frontend/README.md](./frontend/README.md) for frontend setup.

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
| Frontend  | React 18, Vite, TypeScript, Tailwind, Zustand          | ✅ Phase 3 Complete |
| Backend   | FastAPI, Python 3.12, SQLAlchemy async, Alembic        | ✅ Phase 1-2 Complete |
| AI        | Anthropic Claude Sonnet, LangGraph, LangChain           | Phase 2 (Planned) |
| Memory    | ChromaDB, sentence-transformers                        | Phase 2 (Planned) |
| Tasks     | Celery 5, Redis 7                                      | Phase 1+ Ready |
| Auth      | JWT (python-jose), bcrypt                              | ✅ Complete |
| Infra     | Docker, Nginx, GitHub Actions                          | Phase 4 (Planned) |

---

## Getting Started (Full Stack)

### Prerequisites

**Backend:**
- Python 3.12+
- PostgreSQL 14+
- Redis 7+
- ANTHROPIC_API_KEY from [console.anthropic.com](https://console.anthropic.com)

**Frontend:**
- Node.js 18+
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp ../.env.example .env
# Edit .env — set ANTHROPIC_API_KEY and SECRET_KEY

# Database migrations
alembic upgrade head

# Start backend (runs on port 8000)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend available at:**
- 🔌 API: `http://localhost:8000`
- 📚 Swagger UI: `http://localhost:8000/docs`

### 2. Frontend Setup

**In a new terminal:**

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Default is correct: VITE_API_URL=http://localhost:8000

# Start development server (runs on port 5173)
npm run dev
```

**Frontend available at:**
- 🎮 App: `http://localhost:5173`
- Automatically connects to backend API

### 3. Test the Application

1. **Open browser:** http://localhost:5173
2. **Register:** Create a new account
3. **Login:** Use your credentials
4. **Chat:** Send a message to an AI agent
5. **Enjoy:** Watch the response stream in real-time!

---

---

## Frontend (Phase 3) 🎮

### What's Implemented

✅ **Authentication**
- User registration and login
- JWT token management with auto-refresh
- Protected routes with auth guard
- Persistent sessions using localStorage

✅ **Chat Interface**
- Real-time message display with streaming (SSE)
- Agent selector (NEXUS/ALEX/VORTEX)
- Message bubbles with agent badges
- Auto-scrolling message list
- Responsive dark theme UI

✅ **User Experience**
- Minecraft-themed dark UI with Tailwind CSS
- Cobalt and emerald color scheme
- Smooth animations and transitions
- Mobile-responsive layout
- Session history sidebar

### Quick Start

```bash
cd frontend
npm install
npm run dev
```

**Then open:** http://localhost:5173

### Frontend Tech Stack

- **React 18** + **TypeScript** for type safety
- **Vite** for fast development
- **Zustand** for state management
- **Axios** with JWT interceptors
- **Tailwind CSS** for styling
- **React Router v6** for navigation

See [frontend/README.md](./frontend/README.md) for comprehensive documentation.

---

## API Documentation

### Interactive Swagger UI

The backend includes interactive **Swagger/OpenAPI** documentation. Once the backend is running, open your browser:

**👉 http://localhost:8000/docs**

The Swagger UI provides:
- ✅ Full endpoint listing with descriptions
- ✅ Request/response schemas with examples
- ✅ **Try-it-out** functionality to test endpoints directly
- ✅ Authentication examples and JWT workflows
- ✅ Type hints and validation rules

#### Key Endpoints to Explore

**Authentication Flow:**
1. `POST /api/auth/register` — Create a new account
2. `POST /api/auth/login` — Get access & refresh tokens
3. `GET /api/auth/me` — Get current user info
4. `POST /api/auth/refresh` — Refresh your access token

**Health & Status:**
- `GET /api/health` — Service health check

**Phase 2+ Endpoints** (in development):
- `WS /api/ws/{session_id}` — WebSocket chat connection
- `GET /api/sessions/{id}` — Retrieve chat history
- `GET /api/stats` — Agent XP and level stats

#### How to Test Endpoints

1. **Without Authentication:**
   - Click on `GET /api/health`
   - Click "Try it out"
   - Click "Execute"
   - View response

2. **With Authentication:**
   - First, register: `POST /api/auth/register` with email/password
   - Then login: `POST /api/auth/login` to get token
   - Copy the access token
   - Click the 🔒 lock icon in Swagger UI
   - Paste token in "Value" field
   - Now test authenticated endpoints

#### API Screenshots

For visual reference of the Swagger UI, see:
- [Swagger API Documentation](./docs/API-SCREENSHOTS.md) — Guide for capturing and viewing screenshots
- Screenshots will be added as development progresses

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

- **Interactive API Docs:** `http://localhost:8000/docs` (when backend running)
- **API Documentation Guide:** [docs/API-SCREENSHOTS.md](./docs/API-SCREENSHOTS.md)
- **Frontend Documentation:** [frontend/README.md](./frontend/README.md)
- **Project Roadmap:** [ROADMAP.md](./ROADMAP.md)
- **Contributing Guidelines:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Anthropic Claude API:** https://console.anthropic.com
