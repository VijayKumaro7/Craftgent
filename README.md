# Craftgent ⛏

**Minecraft-style AI Agent Command Center**

A full-stack multi-agent chat application powered by Claude Sonnet, FastAPI, LangGraph, WebSockets, ChromaDB, and Celery. Four specialized AI agents — each with distinct personalities and capabilities — collaborate in real time to answer questions, write code, analyze data, and conduct deep research.

![UI Layout](./docs/images/ui-layout.png)

---

## Features at a Glance

- **4 Specialized AI Agents** with intelligent query routing via LangGraph
- **Real-time streaming** over WebSocket with per-token delivery
- **RAG memory** — ChromaDB stores and retrieves cross-session context per user
- **File upload** — attach CSV, JSON, PDF, Python, TypeScript and more
- **Prompt templates** — browse by category, search, and insert with one click
- **Multi-session tabs** — open and switch between independent chat sessions
- **Response customization** — choose format, tone, and output language
- **Agent stats & XP** — each agent tracks HP, MP, level, and experience
- **Minecraft-themed UI** — pixel fonts, scanlines, sky background, and Hotbar

---

## Stack

| Layer    | Technology                                                         |
|----------|--------------------------------------------------------------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Zustand                  |
| Backend  | FastAPI, Python 3.12, SQLAlchemy (async), Alembic                  |
| AI       | Anthropic Claude Sonnet 4, LangGraph, LangChain                    |
| Memory   | ChromaDB, sentence-transformers                                    |
| Tasks    | Celery 5, Redis 7                                                  |
| Auth     | JWT (python-jose), bcrypt, httpOnly refresh cookies                |
| Infra    | Docker Compose, Nginx, GitHub Actions                              |

---

## Architecture

```
Browser (React + Vite)
    │  WebSocket  │  REST
    ▼             ▼
Nginx → FastAPI (port 8000)
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
Celery    Redis    PostgreSQL
Worker   (broker   (users,
(agents)  + pubsub) sessions,
   │                messages, xp)
LangGraph
NEXUS → ALEX / VORTEX / RESEARCHER
   │
ChromaDB (RAG memory)
Tools: web_search, code_exec, sql_query
```

---

## Agents

![Agents Showcase](./docs/images/agents-showcase.png)

Craftgent features four specialized agents. On every message, a lightweight router reads the query and selects the best agent automatically.

| Agent | Class | Specialty | Routes when… |
|-------|-------|-----------|--------------|
| **NEXUS** | Research Mage | Research, analysis, Q&A | Default — ambiguous or general queries |
| **ALEX** | Code Warrior | Code generation, debugging, architecture | `code`, `function`, `debug`, `implement` … |
| **VORTEX** | Data Creeper | SQL, statistics, data pipelines | `data`, `sql`, `analyze`, `csv`, `dataset` … |
| **RESEARCHER** | Archaeologist | Deep research, source verification, synthesis | `research`, `investigate`, `survey`, `study` … |

### Routing Logic

```
User Query
    ↓
Router (NEXUS — single-word decision, 16 max tokens)
    ├─ "code"     → ALEX
    ├─ "data"     → VORTEX
    ├─ "research" → RESEARCHER
    └─ "answer"   → NEXUS (default)
```

### Agent Stats & Progression

Each agent maintains a live stat block visible in the sidebar:

- **HP** — endurance (drains with heavy use)
- **MP** — analytical capacity (drains per message, recovers over time)
- **Level** — `floor(XP / 200) + 1`, max 50
- **XP** — +1 per message handled

---

## Chat Interface

![Chat Interface](./docs/images/chat-interface-annotated.png)

The main chat shell is a three-column layout:

```
┌─────────────────────────────────────────────────────────────────┐
│  ⛏ CRAFTGENT v0.2.0   [ONLINE]  ⚙ CUSTOMIZATION   [LOGOUT] ✕ │  TopBar
├──────────────┬──────────────────────────────┬───────────────────┤
│              │ [Session 1 ✕][Session 2 ✕][+]│                   │  SessionTabs
│  PARTY       │                              │  TASKS /          │
│  MEMBERS     │  Agent messages stream here  │  HISTORY          │
│              │  with syntax-highlighted     │                   │
│  ◀ NEXUS     │  code blocks, markdown, and  │                   │
│    HP ████   │  typing indicators.          │                   │  ChatPanel
│    MP ███    │                              │                   │
│              │                              │                   │
│  ○ ALEX      │  [📎][T›][input...    ][SEND]│                   │  InputBar
│  ○ VORTEX    ├──────────────────────────────┤                   │
│  ○ RESRCH    │  ▶ TEMPLATES  ▶ SESSIONS     │                   │
│              │                              │                   │
├──────────────┴──────────────────────────────┴───────────────────┤
│  [1][2][3][4][5][6][7][8][9]                  Hotbar            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Features

![Frontend Features](./docs/images/ui-features.png)

### Multi-Session Tabs
Open multiple independent sessions simultaneously. Each tab keeps its own agent selection, message history, and WebSocket connection. Switch instantly or close with the ✕ button.

### Prompt Templates
Browse categorised templates (Code, Data, Research, General), search by name or content, and click to insert into the input bar. Templates persist in localStorage across sessions.

### File Upload
Drag-drop files directly into chat or click the 📎 button. Supported types: CSV, JSON, PDF, Python, JavaScript, TypeScript, Go, Rust, Markdown. Max 10 MB per file, 5 files per message. File content is referenced in the message sent to the agent.

### Response Customization
- **Format:** Detailed · Brief · Code Only
- **Tone:** Professional · Casual · ELI5
- **Output Language:** English · Spanish · French · German

Settings are saved to localStorage and applied to all future messages.

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `Esc` | Clear input |
| `/clear` | Clear message history |
| `/help` | Show available commands |
| `/agents` | List agents |

### Performance
- **Message virtualization** via `@tanstack/react-virtual` — renders 1000+ messages at 60 FPS
- **Lazy-loaded** ChatPanel and TaskPanel (code-split, ~200 KB chunk)
- **Skeleton loaders** for all async panels
- **Auto-reconnect** WebSocket with exponential backoff

---

## Authentication

![Authentication Flow](./docs/images/login-flow.png)

- Register with username + password
- Login returns a short-lived **access token** (JWT) and an httpOnly **refresh cookie**
- On hard-refresh the app calls `/api/auth/refresh` automatically to restore session
- Protected route `/chat` redirects unauthenticated users to landing page

---

## Getting Started

### Prerequisites

- Docker & Docker Compose (recommended), **or**
- Python 3.12+, PostgreSQL 14+, Redis 7+, Node 20+

### Quick Start with Docker

```bash
git clone https://github.com/vijaykumaro7/craftgent.git
cd craftgent

cp .env.example .env
# Edit .env — fill in ANTHROPIC_API_KEY and SECRET_KEY at minimum

docker compose up --build
```

Services started:
| Service | URL |
|---------|-----|
| Frontend (dev) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ChromaDB | http://localhost:8001 |

### Manual Setup (Backend)

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp ../.env.example .env
# Edit .env — required: ANTHROPIC_API_KEY, SECRET_KEY, DATABASE_URL

alembic upgrade head               # Run migrations
uvicorn app.main:app --reload --port 8000
```

### Manual Setup (Frontend)

```bash
cd frontend
npm install
npm run dev                        # Starts at http://localhost:5173
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | From console.anthropic.com |
| `SECRET_KEY` | Yes | JWT signing key (32+ chars) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `CHROMA_HOST` / `CHROMA_PORT` | Yes | ChromaDB connection |
| `TAVILY_API_KEY` | No | Enables web search tool |
| `VITE_API_URL` | Yes (frontend) | Backend base URL |
| `VITE_WS_URL` | Yes (frontend) | WebSocket base URL |

See `.env.example` for the full list with descriptions.

---

## API Reference

Interactive docs available at `http://localhost:8000/docs` when the backend is running.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create new account |
| `POST` | `/api/auth/login` | Get access + refresh tokens |
| `POST` | `/api/auth/refresh` | Refresh access token via cookie |
| `GET`  | `/api/auth/me` | Current user profile |

### Chat & Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `WS`   | `/api/ws/{session_id}` | Real-time chat WebSocket |
| `GET`  | `/api/sessions` | List user sessions |
| `GET`  | `/api/sessions/{id}` | Session + message history |
| `DELETE` | `/api/sessions/{id}` | Delete a session |

### Agents & Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/agents` | List agents with current stats |
| `GET`  | `/api/stats` | Live agent XP + level summary |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload file (multipart/form-data) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Service health + DB status |

### WebSocket Protocol

```
Client → Server:
  {"type": "chat", "message": "...", "agent": "NEXUS", "token": "jwt"}
  {"type": "ping"}

Server → Client:
  {"type": "connected",  "session_id": "..."}
  {"type": "token",      "data": "..."}          ← one event per token (streaming)
  {"type": "done",       "data": "full text", "agent": "NEXUS"}
  {"type": "handoff",    "from_agent": "NEXUS", "to_agent": "ALEX"}
  {"type": "system",     "data": "..."}
  {"type": "error",      "data": "..."}
  {"type": "pong"}
```

---

## Project Structure

```
craftgent/
├── README.md
├── CONTRIBUTING.md
├── DEPLOYMENT.md
├── docker-compose.yml           ← full dev stack (DB + Redis + Chroma + API + Worker)
├── docker-compose.prod.yml      ← production overrides
├── .env.example                 ← all environment variables documented
├── nginx/                       ← Nginx reverse-proxy config
│   ├── craftgent.conf
│   └── craftgent-https.conf
│
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app factory, CORS, rate limiter
│   │   ├── core/                ← config, structured logging (structlog), metrics
│   │   ├── db/                  ← async SQLAlchemy engine + session factory
│   │   ├── models/              ← User, ChatSession, Message, AgentStats, FileUpload
│   │   ├── schemas/             ← Pydantic request/response models
│   │   ├── auth/                ← JWT creation, bcrypt hashing, password policy
│   │   ├── agents/              ← LangGraph graph, system prompts, routing
│   │   ├── memory/              ← ChromaDB RAG — store + retrieve per user/agent
│   │   ├── tools/               ← web_search (Tavily), code_exec (subprocess), sql_query
│   │   ├── tasks/               ← Celery app, Redis pub/sub bus, agent task dispatch
│   │   ├── ws/                  ← WebSocket connection manager
│   │   └── api/                 ← routers: health, auth, chat, ws, stats, sessions, files, agents
│   ├── alembic/                 ← database migrations
│   └── tests/
│       ├── test_phase1.py       ← health, auth endpoints
│       ├── test_phase2.py       ← JWT, WebSocket manager
│       ├── test_phase3.py       ← memory, tools, XP, routing
│       └── test_phase4.py       ← file upload, sessions, agents API
│
├── frontend/
│   └── src/
│       ├── App.tsx              ← routing, auth gate, Shell layout
│       ├── pages/               ← LandingPage
│       ├── components/
│       │   ├── agents/          ← AgentSidebar, AgentHistoryPanel
│       │   ├── auth/            ← LoginScreen
│       │   ├── chat/            ← ChatPanel, ChatMessage, CodeBlock, FileUpload,
│       │   │                       SessionTabs, SessionHistory, TemplatesPanel,
│       │   │                       TypingIndicator, VirtualizedMessageList
│       │   ├── landing/         ← HeroSection, FeaturesSection, AgentShowcase, CTASection
│       │   ├── layout/          ← TopBar, Hotbar, CustomizationPanel, SkyBackground
│       │   ├── tasks/           ← TaskPanel
│       │   └── ui/              ← AgentAvatar, Leaderboard, McBar, NotificationStack,
│       │                           PixelHead, StatsDisplay, Toast, ErrorBoundary, …
│       ├── store/               ← Zustand: useAppStore, useAuthStore, usePreferencesStore,
│       │                           useNotificationStore, useTemplatesStore
│       ├── hooks/               ← useWebSocket, useFileUpload, useAgentStats,
│       │                           useSessionList, useKeyboardShortcut, useAgentHistory
│       ├── api/                 ← axios client, chat API helpers
│       └── types/               ← shared TypeScript interfaces
│
└── docs/
    ├── GETTING_STARTED.md
    ├── USER_GUIDE.md
    ├── FEATURES_OVERVIEW.md
    └── images/                  ← annotated screenshots used in this README
```

---

## Tests

```bash
cd backend
pytest tests/ -v                # all tests
pytest tests/test_phase1.py     # health + auth endpoints
pytest tests/test_phase2.py     # JWT, WebSocket manager
pytest tests/test_phase3.py     # memory, tools, XP, routing
pytest tests/test_phase4.py     # file upload, sessions, agents API
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](./docs/GETTING_STARTED.md) | 3-step quick start (5 min) |
| [User Guide](./docs/USER_GUIDE.md) | Full feature walkthrough |
| [Features Overview](./docs/FEATURES_OVERVIEW.md) | All capabilities in detail |
| [Deployment](./DEPLOYMENT.md) | Production deployment checklist |
| [Contributing](./CONTRIBUTING.md) | Dev workflow, migrations, style guide |

---

## License

[MIT](./LICENSE)
