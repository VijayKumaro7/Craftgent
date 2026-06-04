# Craftgent — Multi-Agent AI Command Center

> A modern, full-stack platform where specialized AI agents collaborate in real-time to provide intelligent assistance across code development, data analysis, research, and general problem-solving.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-green)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-blue)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-teal)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://react.dev/)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [How It Works](#how-it-works)
- [Agent Overview](#agent-overview)
- [Demo & Usage Guide](#demo--usage-guide)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Project Overview

### What is Craftgent?

Craftgent is an intelligent multi-agent collaboration platform that combines the power of advanced language models with specialized agent expertise. Unlike traditional single-AI chatbots, Craftgent intelligently routes queries to the most qualified agent, enabling better responses across diverse domains.

### The Problem It Solves

Traditional AI assistants treat all queries the same way, regardless of whether you need help with code, data analysis, or research. This leads to:
- **Suboptimal responses** — a code query doesn't benefit from research-focused reasoning
- **Inefficient context usage** — all agents carry knowledge they'll never use
- **No specialization** — answers lack domain-specific expertise and tool integration

### The Value Proposition

Craftgent solves this by:
- **Intelligent Routing** — automatically selects the best-fit agent for your query (1-token decision)
- **Specialized Expertise** — each agent is optimized for specific domains with dedicated tools
- **Real-time Collaboration** — agents can hand off to each other mid-conversation when needed
- **Persistent Learning** — RAG-enabled memory stores context across sessions
- **Developer-Friendly** — WebSocket streaming, file uploads, keyboard shortcuts, and more

### Who Should Use Craftgent?

- **Developers** — get code reviews, debug assistance, architecture guidance, and test generation
- **Data Analysts** — write and optimize SQL queries, analyze datasets, and visualize patterns
- **Researchers** — conduct deep web research, synthesize findings, and fact-check information
- **Knowledge Workers** — get detailed answers, explanations, and comprehensive breakdowns

---

## Core Features

### 🤖 Four Specialized AI Agents

Each agent brings domain-specific expertise and tools:

| Agent | Specialty | Best For | Auto-Routes On |
|-------|-----------|----------|----------------|
| **NEXUS** | General Q&A, synthesis, analysis | "Explain X", "How does...", "Analyze..." | General queries, default fallback |
| **ALEX** | Code generation, debugging, architecture | "Write a function", "Fix this bug", "Design API" | code, debug, function, implement, refactor |
| **VORTEX** | SQL, data analysis, statistics | "Write SQL", "Analyze CSV", "What's the pattern" | data, sql, csv, dataset, analyze |
| **RESEARCHER** | Deep research, fact-checking, surveys | "Research...", "Compare...", "Best practices" | research, investigate, survey, study |

### 💬 Modern Chat Interface

- **Multi-session Tabs** — Create and manage multiple independent conversations
- **Real-time Streaming** — See responses appear token-by-token as they're generated
- **Markdown Rendering** — Full GitHub Flavored Markdown support with syntax highlighting
- **Message Virtualization** — Smoothly handle 1000+ messages without performance degradation
- **Typing Indicators** — Real-time feedback showing which agent is processing

### 📁 Intelligent File Processing

- **Drag-and-Drop Upload** — Seamless file upload experience
- **Multiple Format Support** — CSV, JSON, PDF, Python, JavaScript, TypeScript, Go, Rust, Markdown, and more
- **Smart Context** — Files are automatically analyzed and included in agent responses
- **Flexible Limits** — 10 MB per file, up to 5 files per message

### 🎨 Response Customization

Fine-tune how agents respond to match your preferences:

- **Format Options** — Detailed · Brief · Code Only
- **Tone Options** — Professional · Casual · Explain Like I'm 5
- **Language Support** — English, Spanish, French, German, and 10+ additional languages
- **Persistent Preferences** — All settings saved to browser localStorage

### 🛠️ Prompt Template Library

- **Categorized Templates** — Pre-built prompts for Code, Data, Research, and General use cases
- **Quick Search** — Find templates by name or keyword
- **One-Click Insert** — Instantly populate chat input with templates
- **User-Managed** — Create, save, organize, and share custom templates

### 📊 Agent Performance Tracking

Monitor each agent's development and capacity:

- **HP (Health Points)** — Operational capacity; decreases with heavy usage
- **MP (Mana Points)** — Analytical capacity; recovers over time
- **XP (Experience Points)** — +1 per message handled; persistent across sessions
- **Level System** — Calculated as `floor(XP / 200) + 1`, with max level 50

### ⌨️ Power User Features

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line in input |
| `Escape` | Clear input field |
| `/clear` | Clear message history |
| `/help` | Show available commands |
| `/agents` | List all agents with stats |

### 🔐 Security

- **JWT Authentication** — Secure token-based authentication with refresh token rotation
- **Password Security** — bcrypt hashing with configurable work factor
- **Session Isolation** — Each user session is completely isolated
- **Protected Routes** — Chat interface accessible only to authenticated users
- **CORS Protection** — Configurable cross-origin request handling

---

## How It Works

### User Workflow

```
1. User Submits Query (+ optional files)
           ↓
2. Query Routing (1-token decision by NEXUS router)
           ↓
3. Agent Selection (ALEX, VORTEX, RESEARCHER, or NEXUS)
           ↓
4. Context Retrieval (RAG from ChromaDB for this user/agent/session)
           ↓
5. Tool Execution (web search, code execution, SQL query, etc.)
           ↓
6. Response Generation (streamed token-by-token via WebSocket)
           ↓
7. Memory Update (response stored in ChromaDB)
           ↓
8. Agent Stats Update (XP +1, HP/MP adjusted)
```

### Example Journey: "Write a Python function to validate email"

1. **User submits** the request via chat input
2. **Router detects** keywords: "write", "function" → routes to **ALEX (Code Expert)**
3. **ALEX retrieves** relevant prior code patterns from ChromaDB
4. **ALEX executes** code generation using Claude Sonnet
5. **ALEX uses tools** — potentially runs tests if `pytest` is available
6. **Frontend streams** the response in real-time, syntax-highlighted
7. **System stores** the interaction in ChromaDB for future reference
8. **ALEX gains +1 XP** for handling the query

---

## Agent Overview

### NEXUS — Research Specialist

**Purpose:** General-purpose Q&A, analysis, and information synthesis

**Primary Use Cases:**
- General knowledge questions ("What is blockchain?")
- Analysis and comparison ("Compare Python vs Go")
- Explanation requests ("Explain machine learning")
- Fallback routing for ambiguous queries

**Inputs:**
- Natural language questions
- File context (optional)
- Customization preferences (tone, format, language)

**Outputs:**
- Detailed explanations with citations
- Comparative analyses
- Synthesized information from multiple sources

**Example Workflow:**
```
User: "What are the latest developments in AI?"
→ NEXUS detects: general query, no specific domain
→ Retrieves context from past research on AI
→ Uses web search tool to fetch latest news
→ Returns: comprehensive summary with sources
```

---

### ALEX — Code Expert

**Purpose:** Code generation, debugging, architecture design, and implementation guidance

**Primary Use Cases:**
- Code generation ("Write a REST API in FastAPI")
- Debugging ("Why does this code throw a 404?")
- Architecture guidance ("Design a microservices architecture for X")
- Code review and refactoring ("Review this function")
- Test generation ("Write unit tests for this")

**Inputs:**
- Code snippets or full files
- Framework/language specifications
- Context about the project
- Test cases or error messages

**Outputs:**
- Well-documented, production-ready code
- Explanations of design decisions
- Test cases and usage examples
- Performance optimization suggestions

**Example Workflow:**
```
User: Upload Python file + "Fix the authentication bug"
→ ALEX detects: "debug", code file present
→ Analyzes uploaded file for issues
→ Uses code execution tool to test hypotheses
→ Returns: fixed code with explanation of the bug
```

---

### VORTEX — Data Analyst

**Purpose:** Data analysis, SQL query generation, and statistical insights

**Primary Use Cases:**
- SQL query generation ("Get users who spent >$100")
- CSV/data analysis ("Find outliers in this dataset")
- Statistical analysis ("Calculate correlation between X and Y")
- Data pipeline design ("How do I process 10GB of data?")
- Schema design ("Design a database for a e-commerce platform")

**Inputs:**
- CSV, JSON, or database schema files
- Data analysis requirements
- Query specifications
- Dataset characteristics

**Outputs:**
- Optimized SQL queries with explanations
- Data analysis results with visualizations
- Statistical summaries
- Performance optimization recommendations

**Example Workflow:**
```
User: Upload sales.csv + "Show me trends by month"
→ VORTEX detects: "analyze", CSV file present
→ Parses CSV and analyzes structure
→ Generates appropriate SQL/pandas queries
→ Returns: analysis with insights and recommendations
```

---

### RESEARCHER — Research Investigator

**Purpose:** Deep research, fact-checking, and comprehensive information gathering

**Primary Use Cases:**
- Market research ("Research the AI tooling market")
- Competitive analysis ("Compare companies in X industry")
- Fact-checking ("Verify this claim")
- Trend analysis ("What are the trends in X field?")
- Literature review ("Summarize recent research on X")

**Inputs:**
- Research topics
- Fact claims to verify
- Scope and depth specifications
- Target audience/use case

**Outputs:**
- Comprehensive research reports
- Fact-checked summaries
- Source citations and references
- Trend analysis and predictions

**Example Workflow:**
```
User: "Research the current state of quantum computing"
→ RESEARCHER detects: "research" keyword
→ Conducts multiple web searches for sources
→ Synthesizes findings from academic papers, news, industry reports
→ Returns: comprehensive report with citations and trends
```

---

## Demo & Usage Guide

### Accessing the Platform

1. **Navigate** to the platform (default: `http://localhost:5173` in development)
2. **Create Account** or log in with your credentials
3. **Start Chatting** — type your question or click "New Session" for a fresh conversation

### Common Use Cases

#### Use Case 1: Build a New Feature

**Goal:** You want to add user authentication to your app

**Workflow:**
```
1. Type: "How do I add JWT auth to a FastAPI app?"
2. ALEX automatically selected (code + architecture keywords)
3. Alex provides: pattern, code example, best practices
4. Follow-up: upload your current main.py
5. Alex reviews your code and suggests authentication flow
6. You get: production-ready implementation
```

**Expected Outcome:** Complete authentication implementation with tests

---

#### Use Case 2: Analyze Business Data

**Goal:** Understand monthly sales trends

**Workflow:**
```
1. Upload your sales.csv to the chat
2. Type: "Show me sales trends by product category"
3. VORTEX automatically selected (data file + analyze keywords)
4. Vortex parses the data and generates insights
5. Returns: SQL queries, summary statistics, trends
6. Ask follow-ups: "Which category has the best margin?"
7. Vortex provides detailed analysis
```

**Expected Outcome:** Data-driven insights and actionable trends

---

#### Use Case 3: Deep Research

**Goal:** Research the state of containerization technology

**Workflow:**
```
1. Type: "Research containerization beyond Docker. Include Podman, LXC, and Kubernetes alternatives"
2. RESEARCHER automatically selected (research + investigate keywords)
3. Researcher conducts comprehensive web search
4. Synthesizes findings from multiple sources
5. Returns: detailed report with citations, pros/cons, use cases
```

**Expected Outcome:** Comprehensive, fact-checked research report

---

#### Use Case 4: Code Review

**Goal:** Get feedback on your architecture

**Workflow:**
```
1. Upload multiple files (main.py, config.py, models.py)
2. Type: "Review my code architecture and suggest improvements"
3. ALEX selected and analyzes all files
4. Reviews for: correctness, performance, security, maintainability
5. Provides: specific suggestions, refactoring examples, best practices
```

**Expected Outcome:** Professional code review with actionable suggestions

---

### Customization Options

**Before sending a message:**

1. **Format** — Choose how detailed the response should be
   - Detailed (default) — comprehensive explanations
   - Brief — concise answers
   - Code Only — just the code without explanation

2. **Tone** — Set the communication style
   - Professional — formal, business-appropriate
   - Casual — friendly, conversational
   - ELI5 — explain simply, no jargon

3. **Language** — Respond in your preferred language
   - English (default)
   - Spanish, French, German, Chinese, Japanese, and more

These preferences are saved and applied to future queries.

---

### Keyboard Shortcuts

Use these shortcuts to work faster:

- **`Enter`** → Send message
- **`Shift + Enter`** → New line in input
- **`Escape`** → Clear input field
- **`/clear`** → Clear entire message history
- **`/help`** → Show all available commands
- **`/agents`** → Show all agents with their current stats

---

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | 18+ |
| **TypeScript** | Static typing and IDE support | Latest |
| **Vite** | Ultra-fast build tool and dev server | Latest |
| **Tailwind CSS** | Utility-first styling | Latest |
| **Zustand** | Lightweight state management | Latest |
| **Axios** | HTTP client for API communication | Latest |
| **Tanstack React Virtual** | Message virtualization for performance | Latest |
| **Prism.js** | Syntax highlighting for code blocks | Latest |
| **React Router** | Client-side routing | Latest |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | Modern async web framework | 0.109+ |
| **Python** | Programming language | 3.12+ |
| **SQLAlchemy** | Async ORM for database operations | 2.0+ |
| **Alembic** | Database migration management | Latest |
| **Pydantic** | Data validation and serialization | 2.0+ |
| **python-jose** | JWT token handling | Latest |
| **bcrypt** | Password hashing | Latest |
| **Uvicorn** | ASGI application server | Latest |

### AI & Intelligence

| Technology | Purpose |
|------------|---------|
| **Claude Sonnet 4** | Primary LLM backbone |
| **LangGraph** | Agent orchestration and routing |
| **LangChain** | Tool integration and agent framework |
| **ChromaDB** | Vector database for RAG memory |
| **sentence-transformers** | Text embedding generation |

### Infrastructure & Deployment

| Technology | Purpose | Version |
|------------|---------|---------|
| **PostgreSQL** | Primary relational database | 14+ |
| **Redis** | Message broker and caching layer | 7+ |
| **Celery** | Async task queue | 5+ |
| **Docker & Docker Compose** | Containerization and orchestration | Latest |
| **Nginx** | Reverse proxy and load balancer | Latest |
| **GitHub Actions** | CI/CD pipeline automation | Native |

---

## Installation & Setup

### Prerequisites

Choose one approach based on your preference:

#### Option A: Docker (Recommended for Quick Start)
- Docker Desktop 4.10+
- Docker Compose 2.0+
- ~4GB free disk space

#### Option B: Local Development (Full Control)
- Python 3.12+
- Node.js 20+
- PostgreSQL 14+
- Redis 7+

---

### Manual Setup — Backend (Local Development)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python3.12 -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp ../.env.example .env
# Edit .env with:
#   - DATABASE_URL (PostgreSQL connection string)
#   - ANTHROPIC_API_KEY
#   - REDIS_URL
#   - SECRET_KEY

# 5. Run database migrations
alembic upgrade head

# 6. Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

**Backend is ready when you see:**
```
INFO:     Application startup complete
```

---

### Manual Setup — Frontend (Local Development)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment (if needed)
# Create .env.local with:
#   VITE_API_URL=http://localhost:8000
#   VITE_WS_URL=ws://localhost:8000

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:5173
```

**Frontend is ready when you see:**
```
➜  Local:   http://localhost:5173/
```

---

### Environment Variables Reference

**Required Variables (Frontend & Backend):**

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Claude API key from Anthropic | `sk-ant-...` |
| `SECRET_KEY` | JWT signing key (32+ random characters) | `your-super-secret-key` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/craftgent` |

**Backend Only:**

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `CHROMA_HOST` | ChromaDB host | `localhost` |
| `CHROMA_PORT` | ChromaDB port | `8001` |
| `TAVILY_API_KEY` | Tavily API key (optional, enables web search) | None |
| `LOG_LEVEL` | Logging level | `INFO` |
| `WORKER_COUNT` | Uvicorn worker processes | `2` |

**Frontend Only:**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8000` |

See `.env.example` in the repository for complete documentation.

---

### Verification Steps

After setup, verify everything works:

```bash
# 1. Check backend health
curl http://localhost:8000/api/health

# 2. Create a test user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# 3. Login and get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# 4. Open http://localhost:5173 in your browser
```

If you see the login screen and can create an account, you're all set!

---

## Project Structure

```
craftgent/
├── README.md                           # Main project documentation
├── CONTRIBUTING.md                     # Contribution guidelines
├── LICENSE                             # MIT License
├── .env.example                        # Environment variables template
├── docker-compose.yml                  # Development container config
├── docker-compose.prod.yml             # Production overrides
│
├── nginx/                              # Reverse proxy & load balancer
│   ├── craftgent.conf                  # HTTP configuration
│   └── craftgent-https.conf            # HTTPS configuration (prod)
│
├── backend/                            # FastAPI + LangGraph application
│   ├── app/
│   │   ├── main.py                     # FastAPI app entrypoint
│   │   ├── core/                       # Configuration & settings
│   │   │   ├── config.py               # Environment & settings
│   │   │   ├── logging.py              # Structured logging setup
│   │   │   └── metrics.py              # Prometheus metrics
│   │   ├── db/                         # Database layer
│   │   │   ├── base.py                 # SQLAlchemy engine & session
│   │   │   └── models.py               # ORM models (User, Session, Message)
│   │   ├── models/                     # SQLAlchemy models directory
│   │   ├── schemas/                    # Pydantic validation schemas
│   │   ├── auth/                       # Authentication (JWT, bcrypt)
│   │   ├── agents/                     # LangGraph agent orchestration
│   │   │   ├── graph.py                # Main agent graph definition
│   │   │   ├── router.py               # Query routing logic
│   │   │   ├── nexus.py                # NEXUS agent implementation
│   │   │   ├── alex.py                 # ALEX agent implementation
│   │   │   ├── vortex.py               # VORTEX agent implementation
│   │   │   └── researcher.py           # RESEARCHER agent implementation
│   │   ├── memory/                     # ChromaDB RAG memory
│   │   │   ├── chroma_client.py        # ChromaDB integration
│   │   │   └── embeddings.py           # Embedding generation
│   │   ├── tools/                      # Agent tools
│   │   │   ├── web_search.py           # Web search (Tavily)
│   │   │   ├── code_execution.py       # Code execution
│   │   │   └── sql_query.py            # SQL execution
│   │   ├── tasks/                      # Celery async tasks
│   │   ├── ws/                         # WebSocket management
│   │   │   └── manager.py              # Connection management
│   │   └── api/                        # API route handlers
│   │       ├── auth.py                 # Authentication endpoints
│   │       ├── chat.py                 # Chat endpoints
│   │       ├── sessions.py             # Session management
│   │       ├── agents.py               # Agent stats
│   │       ├── files.py                # File upload/download
│   │       ├── stats.py                # Global statistics
│   │       └── health.py               # Health checks
│   ├── alembic/                        # Database migrations
│   │   └── versions/                   # Migration files
│   ├── tests/                          # Test suite
│   │   ├── test_phase1.py              # Auth & health tests
│   │   ├── test_phase2.py              # JWT & WebSocket tests
│   │   ├── test_phase3.py              # Agent & memory tests
│   │   └── test_phase4.py              # File & session tests
│   ├── requirements.txt                # Python dependencies
│   └── pyproject.toml                  # Project metadata
│
├── frontend/                           # React + TypeScript application
│   ├── src/
│   │   ├── App.tsx                     # Root component & routing
│   │   ├── main.tsx                    # React entry point
│   │   ├── pages/                      # Page components
│   │   │   ├── LandingPage.tsx         # Public landing page
│   │   │   └── ReportPage.tsx          # Report generation page
│   │   ├── components/
│   │   │   ├── agents/                 # Agent UI components
│   │   │   │   ├── AgentSidebar.tsx    # Agent list & stats
│   │   │   │   ├── AgentCard.tsx       # Individual agent card
│   │   │   │   └── AgentHistory.tsx    # Agent conversation history
│   │   │   ├── auth/                   # Authentication UI
│   │   │   │   ├── LoginScreen.tsx     # Login form
│   │   │   │   └── RegisterForm.tsx    # Registration form
│   │   │   ├── chat/                   # Chat interface
│   │   │   │   ├── ChatPanel.tsx       # Main chat container
│   │   │   │   ├── MessageList.tsx     # Virtualized message list
│   │   │   │   ├── ChatInput.tsx       # User input area
│   │   │   │   └── MessageRenderer.tsx # Message display & formatting
│   │   │   ├── tasks/                  # Task panel
│   │   │   │   ├── TaskPanel.tsx       # Task list & management
│   │   │   │   └── TemplatesLibrary.tsx# Prompt templates
│   │   │   ├── layout/                 # Layout components
│   │   │   │   ├── TopBar.tsx          # Header with navigation
│   │   │   │   ├── Hotbar.tsx          # Bottom action bar
│   │   │   │   └── SkyBackground.tsx   # Background effects
│   │   │   └── ui/                     # Reusable UI elements
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── NotificationStack.tsx
│   │   │       └── SkeletonMessage.tsx
│   │   ├── store/                      # Zustand state stores
│   │   │   ├── useAuthStore.ts         # Authentication state
│   │   │   ├── useAppStore.ts          # Global app state
│   │   │   ├── usePreferencesStore.ts  # User preferences
│   │   │   ├── useTemplatesStore.ts    # Templates state
│   │   │   └── useNotificationStore.ts # Notifications
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useKeyboardShortcut.ts  # Keyboard handling
│   │   │   ├── useAgentStats.ts        # Agent stats fetching
│   │   │   ├── useFileUpload.ts        # File upload logic
│   │   │   └── useWebSocket.ts         # WebSocket connection
│   │   ├── api/                        # Axios API clients
│   │   │   ├── auth.ts                 # Auth API calls
│   │   │   ├── chat.ts                 # Chat API calls
│   │   │   └── agents.ts               # Agent API calls
│   │   ├── types/                      # TypeScript interfaces
│   │   │   └── index.ts                # Shared type definitions
│   │   ├── utils/                      # Utility functions
│   │   │   ├── dateFormat.ts           # Date formatting
│   │   │   ├── cache.ts                # Caching utilities
│   │   │   └── performance.ts          # Performance monitoring
│   │   └── styles/                     # CSS/Tailwind styles
│   │       └── index.css               # Global styles
│   ├── public/                         # Static assets
│   ├── package.json                    # npm dependencies
│   ├── vite.config.ts                  # Vite configuration
│   └── tsconfig.json                   # TypeScript configuration
│
└── docs/                               # Documentation
    ├── GETTING_STARTED.md              # 5-minute quickstart
    ├── USER_GUIDE.md                   # Feature walkthrough
    ├── FEATURES_OVERVIEW.md            # Detailed feature breakdown
    ├── DEMO_AND_USAGE_GUIDE.md        # Use case examples
    └── images/                         # Screenshots & diagrams
```

### Key Directories Explained

- **backend/app/agents/** — LangGraph agent implementations and routing logic
- **backend/app/memory/** — ChromaDB integration for persistent RAG memory
- **backend/app/tools/** — External tools (web search, code execution, SQL)
- **frontend/src/store/** — Zustand state management for frontend
- **frontend/src/components/chat/** — Core chat UI components

---

## Roadmap

### ✅ Current Capabilities (v0.2.0)

- ✅ Multi-agent intelligent routing (1-token decision)
- ✅ Real-time WebSocket streaming
- ✅ RAG-enabled memory with ChromaDB
- ✅ Four specialized agents (NEXUS, ALEX, VORTEX, RESEARCHER)
- ✅ File upload and processing (CSV, JSON, PDF, code)
- ✅ Session management with persistence
- ✅ Agent stats tracking (XP, Level, HP, MP)
- ✅ Keyboard shortcuts and power user features
- ✅ User authentication (JWT, bcrypt)
- ✅ Prompt template library
- ✅ Response customization (format, tone, language)

### 🚀 Planned Enhancements (v0.3.0)

- **Team Collaboration** — Shared sessions and team workspaces
- **Advanced Memory** — Semantic search across all past conversations
- **Custom Agents** — User-defined agents with custom tools
- **API Rate Limiting** — Configurable usage limits per user
- **Export Capabilities** — Export conversations as PDF, Markdown, or JSON
- **Mobile App** — Native iOS/Android applications
- **Voice Integration** — Voice input and text-to-speech output
- **Integration Marketplace** — Connect with Slack, Discord, GitHub, and more

### 🔮 Future Roadmap (v0.4.0+)

- **Multi-turn Planning** — Agents coordinate complex multi-step workflows
- **Agentic Loops** — Self-correction and iterative refinement
- **Custom Knowledge Bases** — Upload proprietary documents for RAG
- **Real-time Collaboration** — Co-pilot features for pair programming
- **Benchmark Suite** — Performance and quality metrics dashboard
- **Enterprise Features** — SAML, SSO, audit logs, usage analytics
- **Edge Deployment** — Self-hosted on-premise options

---

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help makes Craftgent better.

### Getting Started with Contributions

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with clear, well-structured commits
4. **Test** thoroughly (see testing section below)
5. **Push** to your branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request with detailed description

### Development Standards

- **Code Style** — Follow PEP 8 (Python) and ESLint (JavaScript)
- **Type Safety** — Use TypeScript for frontend, type hints for backend
- **Testing** — All new features must include tests
- **Documentation** — Update relevant docs with your changes
- **Commits** — Use clear, descriptive commit messages (`feat:`, `fix:`, `docs:`, etc.)

### Running Tests Locally

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm run test
```

### Submitting Issues

Found a bug? Please [open an issue](https://github.com/vijaykumaro7/craftgent/issues) with:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python version, Node version)

### Code Review Process

All contributions go through code review:
1. Automated checks (linting, type checking, tests)
2. Manual review by maintainers
3. Feedback and iteration (if needed)
4. Merge when approved

---

## License

Craftgent is licensed under the **MIT License** — see [LICENSE](./LICENSE) file for details.

You're free to use Craftgent in personal and commercial projects, modify it, and distribute it with these permissions:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ Must include license and copyright notice

---

## Support

### Getting Help

- **📖 Documentation** — See `/docs` folder for detailed guides
- **🐛 Found a Bug?** — [Report on GitHub Issues](https://github.com/vijaykumaro7/craftgent/issues)
- **💬 Questions?** — [Start a Discussion](https://github.com/vijaykumaro7/craftgent/discussions)
- **📧 Email** — vijaybgaddi07@gmail.com

### Additional Resources

- **API Documentation** — http://localhost:8000/docs (when running)
- **Contributing Guide** — [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Deployment Guide** — [DEPLOYMENT.md](./DEPLOYMENT.md)

---

<div align="center">

**Built with ⛏️ by the Craftgent Team**

If you find Craftgent useful, please give us a ⭐ on GitHub!

[Star the Repository](https://github.com/vijaykumaro7/craftgent) | [Report an Issue](https://github.com/vijaykumaro7/craftgent/issues) | [Start a Discussion](https://github.com/vijaykumaro7/craftgent/discussions)

</div>
