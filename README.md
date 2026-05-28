# 🏗️ Craftgent — AI Agent Command Center

> **A Minecraft-style multi-agent chat platform** where specialized AI agents collaborate in real-time to answer questions, write code, analyze data, and conduct deep research. Built with React, FastAPI, LangGraph, WebSockets, and Claude Sonnet.

![Craftgent Frontend](./frontend/landing-page-screenshot.png)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Agents & Routing](#agents--routing)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Craftgent** is a full-stack web application that brings AI-powered assistance to life with a Minecraft-inspired interface. Four specialized agents—NEXUS, ALEX, VORTEX, and RESEARCHER—work together to provide intelligent assistance across multiple domains.

### What Makes Craftgent Different?

- **Intelligent Query Routing:** Automatically selects the best agent based on your question
- **Real-time Streaming:** WebSocket-powered token streaming for instant responses
- **Persistent Memory:** RAG-enabled context awareness using ChromaDB
- **Session Management:** Multiple independent chat sessions with state persistence
- **File Intelligence:** Upload and analyze CSV, JSON, PDF, code files and more
- **Agent Progression:** Track agent stats (HP, MP, XP, Level) as they "level up"
- **Minecraft Aesthetics:** Pixel fonts, scanlines, hotbar interface, and sky background

---

## ✨ Key Features

### 🤖 Four Specialized AI Agents

Each agent is optimized for specific tasks and has distinct expertise:

| Agent | Role | Specialty | Auto-Routes On |
|-------|------|-----------|----------------|
| **NEXUS** | Research Mage | General Q&A, analysis, synthesis | General/ambiguous queries |
| **ALEX** | Code Warrior | Code generation, debugging, architecture | `code`, `debug`, `function` |
| **VORTEX** | Data Creeper | SQL, statistics, data pipelines | `data`, `sql`, `analyze` |
| **RESEARCHER** | Archaeologist | Deep research, fact-checking, surveys | `research`, `investigate` |

### 💬 Real-time Chat Interface

- **Multi-session tabs** — Open and switch between independent conversations
- **Live streaming** — See responses token-by-token as they're generated
- **Syntax highlighting** — Code blocks with language detection
- **Markdown support** — Full GitHub Flavored Markdown rendering
- **Typing indicators** — Know when agents are processing

### 📁 File Upload & Processing

- **Drag-and-drop** interface for easy file uploads
- **Supported formats:** CSV, JSON, PDF, Python, JavaScript, TypeScript, Go, Rust, Markdown
- **Smart context** — File content automatically included in agent queries
- **Size limits:** 10 MB per file, 5 files per message

### 🎨 Response Customization

Control how agents respond to your needs:

- **Format:** Detailed · Brief · Code Only
- **Tone:** Professional · Casual · ELI5
- **Language:** English · Spanish · French · German · [+more]
- **Persistent Settings:** All preferences saved to localStorage

### 🛠️ Prompt Templates

- **Categorized library** — Code, Data, Research, General, and custom categories
- **Quick search** — Find templates by name or content
- **One-click insert** — Add templates directly to chat input
- **User-managed** — Create, save, and organize your own templates

### 📊 Agent Stats & Progression

Monitor each agent's performance with real-time stats:

- **HP (Health Points):** Endurance meter, drains with heavy usage
- **MP (Mana Points):** Analytical capacity, recovers over time
- **XP (Experience):** +1 per message handled, persistent across sessions
- **Level:** `floor(XP / 200) + 1`, max level 50

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line in input |
| `Escape` | Clear input field |
| `/clear` | Clear message history |
| `/help` | Show available commands |
| `/agents` | List all agents with stats |

### 🚀 Performance & Optimization

- **Message virtualization** via @tanstack/react-virtual — handles 1000+ messages at 60 FPS
- **Code splitting** — ChatPanel and TaskPanel lazy-loaded on demand
- **Skeleton loaders** — Smooth loading states for all async operations
- **Auto-reconnect WebSocket** — Exponential backoff with connection recovery

### 🔐 Secure Authentication

- **JWT-based** authentication with httpOnly refresh cookies
- **Password hashing** with bcrypt
- **Session persistence** — Auto-restore session on browser refresh
- **Protected routes** — `/chat` requires valid authentication

---

## 🔧 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **Tanstack React Virtual** | Message virtualization |
| **Prism** | Syntax highlighting |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Web framework |
| **Python 3.12** | Runtime |
| **SQLAlchemy** | ORM (async) |
| **Alembic** | Database migrations |
| **Pydantic** | Data validation |
| **python-jose** | JWT handling |
| **bcrypt** | Password hashing |

### AI & Intelligence
| Technology | Purpose |
|------------|---------|
| **Claude Sonnet 4** | LLM backbone |
| **LangGraph** | Agent orchestration |
| **LangChain** | Tool integration |
| **ChromaDB** | RAG memory store |
| **sentence-transformers** | Embeddings |

### Infrastructure & Services
| Technology | Purpose |
|------------|---------|
| **PostgreSQL 14** | Primary database |
| **Redis 7** | Message broker & caching |
| **Celery 5** | Async task queue |
| **Docker Compose** | Local development |
| **Nginx** | Reverse proxy |
| **GitHub Actions** | CI/CD pipeline |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React + Vite)               │
│               Multi-session Chat Interface               │
└──────────────────────────┬──────────────────────────────┘
                          │
                    ┌─────┴──────┐
            WebSocket│            │REST
                    ▼            ▼
        ┌──────────────────────────────┐
        │      Nginx (Reverse Proxy)   │
        │      Load Balancer, CORS     │
        └──────────────────┬───────────┘
                          │
                    ┌─────▼──────┐
                    │   FastAPI   │ (port 8000)
                    │  Main App   │
                    └─────┬───────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌────────┐        ┌─────────┐      ┌─────────────┐
   │ Celery │        │ Redis   │      │ PostgreSQL  │
   │Workers │        │ 7       │      │ 14          │
   │ (Async)│        │ (Broker │      │ (Primary    │
   │        │        │ + Pub)  │      │ Database)   │
   └────┬───┘        └─────────┘      └─────────────┘
        │
        ▼
   ┌────────────────────────────────────────┐
   │        LangGraph Agent Orchestration    │
   │  ┌───────┐  ┌───────┐  ┌────────────┐ │
   │  │ NEXUS │  │ ALEX  │  │  VORTEX    │ │
   │  │Research│  │Code   │  │  Data      │ │
   │  └───────┘  └───────┘  └────────────┘ │
   │  ┌────────────────┐                    │
   │  │  RESEARCHER    │                    │
   │  │  Investigation │                    │
   │  └────────────────┘                    │
   │              │                         │
   │        ┌─────▼──────┐                  │
   │        │   Tools    │                  │
   │  ┌─────┴─────┬──────┴────┐             │
   │  │web_search │code_exec  │sql_query│  │
   │  └───────────┴───────────┴─────────┘  │
   └────────────────┬───────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │     ChromaDB         │
         │  (RAG Memory Store)  │
         │  Per-user, per-agent │
         │  Vector embeddings   │
         └──────────────────────┘
```

### Data Flow

1. **User Input** → Frontend form submission with optional files
2. **Query Routing** → LangGraph router selects best agent (1 token decision)
3. **Context Retrieval** → ChromaDB retrieves relevant past context
4. **Agent Processing** → Selected agent processes with tools (web, code, SQL)
5. **Real-time Streaming** → Tokens sent via WebSocket to frontend
6. **Memory Update** → Response stored in ChromaDB for future reference
7. **Stats Update** → Agent XP incremented, HP/MP adjusted in database

---

## 🤖 Agents & Routing

### Agent Profiles

#### **NEXUS** — The Research Mage
- **Specialty:** General Q&A, research synthesis, information gathering
- **Routes to:** Default agent for ambiguous or general queries
- **Best for:** "Explain X", "What is...", "How does...", "Analyze..."
- **Tools:** Web search (Tavily), code execution

#### **ALEX** — The Code Warrior
- **Specialty:** Code generation, debugging, architecture, implementation
- **Routes to:** Queries mentioning `code`, `debug`, `function`, `implement`, `refactor`
- **Best for:** "Write a function...", "Fix this bug...", "Design API..."
- **Tools:** Code execution (subprocess), web search

#### **VORTEX** — The Data Creeper
- **Specialty:** SQL queries, data analysis, statistics, data pipelines
- **Routes to:** Queries mentioning `data`, `sql`, `csv`, `dataset`, `analyze`
- **Best for:** "Write SQL...", "Analyze this CSV...", "What's the pattern..."
- **Tools:** SQL query execution, code execution

#### **RESEARCHER** — The Archaeologist
- **Specialty:** Deep research, fact-checking, comprehensive surveys, synthesis
- **Routes to:** Queries mentioning `research`, `investigate`, `survey`, `study`
- **Best for:** "Research...", "Compare...", "What are best practices..."
- **Tools:** Web search, comprehensive analysis

### Routing Algorithm

```
User Message
    ↓
NEXUS (as Router, 16 tokens max)
    ├─ Match keywords → identify domain
    ├─ Decision: "code" | "data" | "research" | "answer"
    └─ Route to appropriate agent
```

The router is extremely lightweight (1 token decision) to minimize latency while ensuring high-quality agent selection.

---

## 🚀 Getting Started

### Prerequisites

Choose your setup:

**Option A: Docker (Recommended)**
- Docker Desktop 4.10+
- Docker Compose 2.0+

**Option B: Local Development**
- Python 3.12+
- Node.js 20+
- PostgreSQL 14+
- Redis 7+

### Quick Start with Docker

```bash
# Clone repository
git clone https://github.com/vijaykumaro7/craftgent.git
cd craftgent

# Configure environment
cp .env.example .env
# Edit .env and set:
# - ANTHROPIC_API_KEY (get from console.anthropic.com)
# - SECRET_KEY (generate a random 32+ character string)

# Start all services
docker compose up --build

# Wait for services to initialize...
```

**Available Services:**
| Service | URL | Purpose |
|---------|-----|---------|
| Frontend Dev | http://localhost:5173 | React dev server |
| Backend API | http://localhost:8000 | FastAPI application |
| Swagger UI | http://localhost:8000/docs | Interactive API docs |
| ChromaDB | http://localhost:8001 | Vector database UI |

### Manual Setup — Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env with your settings

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### Manual Setup — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend available at http://localhost:5173
```

### Environment Variables

**Required Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Claude API key from Anthropic | `sk-ant-...` |
| `SECRET_KEY` | JWT signing key (32+ chars, random) | `your-super-secret-key-here` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/craftgent` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `CHROMA_HOST` | ChromaDB host | `localhost` |
| `CHROMA_PORT` | ChromaDB port | `8001` |

**Optional Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `TAVILY_API_KEY` | Tavily API for web search | None (disables web search) |
| `VITE_API_URL` | Backend API URL (frontend) | `http://localhost:8000` |
| `VITE_WS_URL` | WebSocket URL (frontend) | `ws://localhost:8000` |
| `LOG_LEVEL` | Backend logging level | `INFO` |
| `WORKER_COUNT` | Uvicorn worker processes | `2` |

See `.env.example` for complete documentation with descriptions.

---

## 📡 API Reference

Complete API documentation available at **http://localhost:8000/docs** when backend is running.

### Authentication Endpoints

| Method | Endpoint | Description | Request |
|--------|----------|-------------|---------|
| `POST` | `/api/auth/register` | Create new user account | `{username: string, password: string}` |
| `POST` | `/api/auth/login` | Get access & refresh tokens | `{username: string, password: string}` |
| `POST` | `/api/auth/refresh` | Refresh access token | Uses httpOnly cookie |
| `GET` | `/api/auth/me` | Get current user profile | Bearer token required |

### Chat & Session Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `WS` | `/api/ws/{session_id}` | WebSocket for real-time chat |
| `GET` | `/api/sessions` | List all user sessions |
| `POST` | `/api/sessions` | Create new session |
| `GET` | `/api/sessions/{id}` | Get session with message history |
| `DELETE` | `/api/sessions/{id}` | Delete session and all messages |
| `GET` | `/api/sessions/{id}/export` | Export session as JSON |

### Agent Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents` | List all agents with current stats |
| `GET` | `/api/agents/{name}` | Get specific agent details |
| `GET` | `/api/stats` | Get global XP and level summary |
| `POST` | `/api/agents/{name}/reset-stats` | Reset agent stats (admin) |

### File Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload file (multipart/form-data) |
| `GET` | `/api/files/{id}` | Retrieve uploaded file metadata |
| `DELETE` | `/api/files/{id}` | Delete file |

### Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health check & DB status |
| `GET` | `/api/metrics` | Prometheus metrics endpoint |

### WebSocket Protocol

**Client Messages:**

```json
{"type": "chat", "message": "your question", "agent": "NEXUS", "token": "jwt"}
{"type": "ping"}
```

**Server Messages:**

```json
{"type": "connected", "session_id": "uuid"}
{"type": "token", "data": "str"}
{"type": "done", "data": "full_response", "agent": "NEXUS"}
{"type": "handoff", "from_agent": "NEXUS", "to_agent": "ALEX"}
{"type": "system", "data": "system message"}
{"type": "error", "data": "error message"}
{"type": "pong"}
```

---

## 📁 Project Structure

```
craftgent/
├── README.md                        ← You are here
├── CONTRIBUTING.md                  ← Development guidelines
├── DEPLOYMENT.md                    ← Production deployment
├── LICENSE                          ← MIT License
├── .env.example                     ← Environment template
│
├── docker-compose.yml               ← Dev stack (all services)
├── docker-compose.prod.yml          ← Production overrides
│
├── nginx/                           ← Reverse proxy config
│   ├── craftgent.conf              ← HTTP config
│   └── craftgent-https.conf        ← HTTPS config
│
├── backend/                         ← FastAPI + LangGraph
│   ├── app/
│   │   ├── main.py                 ← FastAPI app factory
│   │   ├── core/                   ← Config & metrics
│   │   ├── db/                     ← SQLAlchemy engine
│   │   ├── models/                 ← ORM models
│   │   ├── schemas/                ← Pydantic schemas
│   │   ├── auth/                   ← JWT & bcrypt
│   │   ├── agents/                 ← LangGraph graph
│   │   ├── memory/                 ← ChromaDB RAG
│   │   ├── tools/                  ← web_search, code_exec, sql_query
│   │   ├── tasks/                  ← Celery task queue
│   │   ├── ws/                     ← WebSocket manager
│   │   └── api/                    ← Route handlers
│   ├── alembic/                    ← Database migrations
│   ├── tests/                      ← Test suite
│   ├── requirements.txt            ← Python dependencies
│   └── pyproject.toml             ← Project config
│
├── frontend/                        ← React + TypeScript
│   ├── src/
│   │   ├── App.tsx                 ← Router & auth gate
│   │   ├── pages/                  ← LandingPage
│   │   ├── components/
│   │   │   ├── agents/             ← Agent sidebar & history
│   │   │   ├── auth/               ← Login screen
│   │   │   ├── chat/               ← Chat UI components
│   │   │   ├── landing/            ← Marketing sections
│   │   │   ├── layout/             ← TopBar, Hotbar, etc
│   │   │   ├── tasks/              ← Task panel
│   │   │   └── ui/                 ← Reusable UI elements
│   │   ├── store/                  ← Zustand state
│   │   ├── hooks/                  ← Custom React hooks
│   │   ├── api/                    ← Axios clients
│   │   └── types/                  ← TypeScript interfaces
│   ├── public/                     ← Static assets
│   ├── package.json               ← npm dependencies
│   └── vite.config.ts             ← Vite configuration
│
└── docs/                           ← Documentation
    ├── GETTING_STARTED.md
    ├── USER_GUIDE.md
    ├── FEATURES_OVERVIEW.md
    └── images/                    ← Screenshots & diagrams
```

---

## 🧪 Testing

### Run All Tests

```bash
cd backend
pytest tests/ -v
```

### Run Test Suites by Phase

```bash
# Phase 1: Health & Auth endpoints
pytest tests/test_phase1.py -v

# Phase 2: JWT & WebSocket
pytest tests/test_phase2.py -v

# Phase 3: Memory, Tools, XP
pytest tests/test_phase3.py -v

# Phase 4: File upload, Sessions, Agents
pytest tests/test_phase4.py -v
```

### Run with Coverage

```bash
pytest tests/ --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

### Frontend Tests

```bash
cd frontend
npm run test              # Run vitest
npm run test:ui          # UI mode
npm run test:coverage    # Coverage report
```

---

## 📚 Documentation

Comprehensive guides available in the `/docs` directory:

| Document | Purpose |
|----------|---------|
| **[GETTING_STARTED.md](./docs/GETTING_STARTED.md)** | 5-minute quickstart |
| **[USER_GUIDE.md](./docs/USER_GUIDE.md)** | Feature walkthrough |
| **[FEATURES_OVERVIEW.md](./docs/FEATURES_OVERVIEW.md)** | Detailed feature breakdown |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Production deployment |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Development workflow |

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- Code style guide
- Commit message format
- Pull request process
- Testing requirements

### Quick Contribution Steps

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m "feat: add amazing feature"`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request with detailed description

---

## 📄 License

Craftgent is licensed under the [MIT License](./LICENSE) — feel free to use in personal and commercial projects.

---

## 🙏 Support & Feedback

- **Issues:** Found a bug? [Report it on GitHub](https://github.com/vijaykumaro7/craftgent/issues)
- **Discussions:** Questions or ideas? [Start a discussion](https://github.com/vijaykumaro7/craftgent/discussions)
- **Email:** vijaybgaddi07@gmail.com

---

<div align="center">

**Made with ⛏️ by the Craftgent Team**

⭐ If you find this project useful, please consider giving it a star!

</div>
