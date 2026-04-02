# CraftAgent Development Roadmap

## Overview

CraftAgent is being built in 4 phases, from backend infrastructure to a fully deployed production system with a Minecraft-themed UI and multi-agent AI orchestration.

## Current Status: Phase 1-2 (Backend Development)

The backend foundation is being scaffolded and tested. Phase 2 agent capabilities are being designed and integrated.

---

## Phase 1: Backend Scaffold ✅ (Current)

**Goal:** Establish FastAPI backend infrastructure, authentication, and testing framework

**Status:** Core complete, in testing/validation

### Completed ✅
- FastAPI application structure with middleware, startup/shutdown hooks
- PostgreSQL database with SQLAlchemy async ORM
- Alembic database migration system
- User authentication (JWT tokens + bcrypt password hashing)
- Basic API endpoints:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/refresh` - Token refresh
  - `GET /api/auth/me` - Current user info
  - `GET /api/health` - Service health check
- Test framework (pytest) with Phase 1 tests
- Configuration management (environment variables)
- Error handling and validation (Pydantic schemas)

### In Progress 🔄
- Complete Phase 1 test coverage
- Input validation and security hardening
- Database connection pooling optimization
- Rate limiting implementation

### Models & Schemas
```
User (id, email, password_hash, created_at, updated_at)
ChatSession (id, user_id, title, created_at, updated_at)
Message (id, session_id, role, content, created_at)
```

---

## Phase 2: Agent System 🚀 (Planned - Next)

**Goal:** Integrate LangGraph agents, WebSocket real-time communication, and memory/RAG system

**Timeline:** Next development cycle

### Planned Components

#### Agent Orchestration
- [ ] LangGraph workflow for agent routing
- [ ] NEXUS agent (orchestrator, research)
- [ ] ALEX agent (code execution, debugging)
- [ ] VORTEX agent (analytics, SQL queries)
- [ ] Agent state machine and conversation memory
- [ ] Agent handoff protocol

#### WebSocket Communication
- [ ] WebSocket connection manager
- [ ] Real-time message streaming
- [ ] Session management over WebSocket
- [ ] Connection pooling and heartbeat
- [ ] Error recovery and reconnection

#### Memory & RAG
- [ ] ChromaDB integration for semantic search
- [ ] Embedding generation (sentence-transformers)
- [ ] Message indexing and retrieval
- [ ] Context window management
- [ ] Tool use history and learning

#### Agent Tools
- [ ] Web search tool (using Tavily API)
- [ ] Python code execution (with sandboxing)
- [ ] SQL query tool (with analytics)
- [ ] Chain tool composition

#### Task Processing
- [ ] Celery worker setup
- [ ] Redis broker and result backend
- [ ] Async task queuing
- [ ] Agent task execution
- [ ] XP and leveling system (GameDB integration)

### API Additions
```
WS  /api/ws/{session_id}     - WebSocket chat endpoint
GET /api/sessions/{id}       - Get session with history
GET /api/stats               - Agent XP and level stats
POST /api/chat/stream        - REST streaming endpoint
```

### Models & Schemas
```
AgentStats (id, agent_name, xp, level, skills)
ToolCall (id, session_id, tool_name, input, output)
Memory (id, session_id, embedding, text, metadata)
```

### Tests
- Phase 2 integration tests (agent workflows, WebSocket)
- Tool execution tests
- Memory retrieval tests
- Streaming response tests

---

## Phase 3: Frontend Development 📱 (Future)

**Goal:** Build Minecraft-themed React UI with real-time agent interaction

**Timeline:** After Phase 2 completion

### Frontend Stack
- React 18 + TypeScript
- Vite for fast HMR development
- Tailwind CSS for styling
- Zustand for state management
- WebSocket client for real-time updates

### Components & Pages

#### Authentication
- [ ] Login/Register screens
- [ ] Password reset flow
- [ ] Session persistence

#### Main Interface
- [ ] Chat panel with streaming messages
- [ ] Agent sidebar with pixel art heads
- [ ] XP bars and level indicators
- [ ] Inventory system (tasks/quests)
- [ ] Settings panel

#### Agent Visualization
- [ ] Agent status indicators
- [ ] Tool execution feedback
- [ ] Message routing visualization
- [ ] Crafting/quest interface

#### Real-time Features
- [ ] WebSocket connection handling
- [ ] Live agent status updates
- [ ] Typing indicators
- [ ] Message delivery status

### Styling
- Minecraft-inspired pixel art and fonts
- Custom color scheme with cobalt/emerald accents
- Responsive design for desktop and tablet
- Dark theme by default

---

## Phase 4: Production Deployment 🚀 (Future)

**Goal:** Containerized, scalable production deployment

**Timeline:** After Phase 3 completion

### Infrastructure

#### Containerization
- [ ] Multi-stage Dockerfile for backend
- [ ] Docker Compose for local dev (all services)
- [ ] Docker Compose for production (hardened setup)
- [ ] Container networking and health checks

#### Reverse Proxy
- [ ] Nginx configuration for API + static files
- [ ] SSL/TLS with Let's Encrypt
- [ ] CORS and security headers
- [ ] Load balancing for multiple API instances

#### CI/CD Pipeline
- [ ] GitHub Actions workflow
- [ ] Automated testing on PR
- [ ] Build and push Docker images
- [ ] Automated deployment to production
- [ ] Rollback procedures

#### Deployment Targets
- [ ] Railway (recommended - simple git-based deploy)
- [ ] Self-hosted VPS support
- [ ] Database backup strategy
- [ ] Log aggregation and monitoring
- [ ] Performance metrics and alerts

### Production Checklist
- [ ] Environment variable management
- [ ] Database migrations in production
- [ ] Redis persistence
- [ ] Celery task retry logic
- [ ] Rate limiting and DDoS protection
- [ ] HTTPS enforcement
- [ ] Security headers (CSP, X-Frame-Options, etc.)
- [ ] API versioning strategy
- [ ] Graceful shutdown handling

### Monitoring
- [ ] Application metrics (Prometheus)
- [ ] Error tracking (e.g., Sentry)
- [ ] Log aggregation
- [ ] Uptime monitoring
- [ ] Performance profiling

---

## Architecture Evolution

### Phase 1 (Current)
```
Client (REST)
    ↓
FastAPI ← → PostgreSQL
    ↓
Tests
```

### Phase 2
```
Client (REST + WebSocket)
    ↓
FastAPI ← → PostgreSQL
    ↓         ↓
Celery ← → Redis
    ↓
LangGraph Agents
    ↓
ChromaDB + Tools
```

### Phase 3
```
React UI (WebSocket)
    ↓
Nginx (reverse proxy)
    ↓
FastAPI ← → PostgreSQL
    ↓         ↓
Celery ← → Redis
    ↓
LangGraph Agents
    ↓
ChromaDB + Tools
```

### Phase 4
```
[Kubernetes/Docker Compose]
├── Frontend (React)
├── API (FastAPI - multiple replicas)
├── Worker (Celery - task processing)
├── Cache (Redis)
├── Database (PostgreSQL)
├── Vector DB (ChromaDB)
└── Nginx (load balancer/proxy)
```

---

## Key Dependencies

### Phase 1 (Installed)
- FastAPI, Uvicorn
- SQLAlchemy, Alembic
- Pydantic
- python-jose, bcrypt
- pytest

### Phase 2 (To Install)
- LangGraph, LangChain
- anthropic SDK
- websockets
- chromadb, sentence-transformers
- celery, redis
- tavily-python

### Phase 3 (Frontend)
- React, Vite
- TypeScript
- Tailwind CSS
- Zustand
- axios

### Phase 4 (Deployment)
- Docker, Docker Compose
- Nginx
- GitHub Actions (built-in)

---

## Known Limitations & Considerations

### Current (Phase 1)
- Single-threaded API server (no production readiness)
- No agent orchestration yet (just auth and chat structure)
- No real-time communication (WebSocket not implemented)
- No memory system (messages stored but not indexed)
- Limited error handling for edge cases

### Phase 2 Goals
- Implement robust agent routing and memory
- Add comprehensive error recovery
- Optimize database queries
- Add monitoring and observability

### Phase 3 Goals
- Full-featured frontend with real-time updates
- Pixel art assets and Minecraft-themed UI
- Responsive design

### Phase 4 Goals
- Production-grade deployment with HA
- Comprehensive monitoring and alerting
- Scalability for multiple concurrent users

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Running tests
- Code style guidelines
- Git workflow
- Current phase details

---

## Feedback & Issues

- Found a bug? Open an issue with reproduction steps
- Have a feature idea? Discuss in an issue first
- Want to contribute? See CONTRIBUTING.md and current phase description
