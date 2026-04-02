# Contributing to CraftAgent

Thanks for your interest in contributing! This guide covers backend development setup, testing, and our workflow.

## Development Setup

### Backend Prerequisites
- Python 3.12+
- PostgreSQL 14+
- Redis 7+
- ANTHROPIC_API_KEY from [console.anthropic.com](https://console.anthropic.com)

### Quick Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp ../.env.example .env
# Edit .env and add your ANTHROPIC_API_KEY and SECRET_KEY
```

### Database Setup

```bash
# Ensure PostgreSQL is running, then run migrations
alembic upgrade head
```

### Running the Backend

```bash
# From backend/ directory with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API docs available at http://localhost:8000/docs
```

## Testing

### Run All Tests

```bash
cd backend
pytest tests/ -v
```

### Run Tests by Phase

```bash
pytest tests/test_phase1.py  # Phase 1: Health check, auth endpoints
pytest tests/test_phase2.py  # Phase 2: JWT, WebSocket, agents
pytest tests/test_phase3.py  # Phase 3: Memory, tools, routing
```

### Test Coverage

```bash
pytest tests/ --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

## Code Quality

### Linting & Type Checking

```bash
cd backend

# Format code
ruff format app/

# Check style
ruff check app/

# Type checking
mypy app/
```

## Database Migrations

### Create a New Migration

```bash
cd backend

# After modifying models, create a migration
alembic revision --autogenerate -m "Describe your change"

# Review the migration file in alembic/versions/
# Then run it:
alembic upgrade head
```

### Rollback

```bash
# Rollback last migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision>
```

## Project Structure

Key directories for development:

```
backend/
├── app/
│   ├── main.py              ← FastAPI app initialization
│   ├── core/                ← config.py, logging
│   ├── db/                  ← database engine, session management
│   ├── models/              ← SQLAlchemy models
│   ├── schemas/             ← Pydantic request/response models
│   ├── auth/                ← JWT, password hashing
│   ├── api/                 ← API routes (routers)
│   ├── agents/              ← LangGraph agent definitions [Phase 2+]
│   ├── tools/               ← Tool implementations [Phase 2+]
│   ├── memory/              ← RAG/ChromaDB [Phase 2+]
│   ├── tasks/               ← Celery tasks [Phase 2+]
│   └── ws/                  ← WebSocket handlers [Phase 2+]
├── alembic/                 ← Database migrations
├── tests/                   ← Test files
├── requirements.txt         ← Python dependencies
└── Dockerfile              ← Docker configuration
```

## Git Workflow

### Before Starting Work

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test thoroughly

### Committing Code

```bash
# Stage your changes
git add app/

# Write clear commit messages
git commit -m "Add feature X: brief description

- Detail about the change
- Why it matters
"
```

### Pull Requests

1. Push your branch:
   ```bash
   git push -u origin feature/your-feature-name
   ```

2. Create a PR with:
   - Clear title and description
   - Reference to any related issues
   - Test results showing all tests pass

3. Address review comments and update

## Phase Breakdown

### Phase 1: Backend Scaffold (Current)
- ✅ FastAPI app structure
- ✅ Database setup (PostgreSQL, SQLAlchemy async)
- ✅ Auth system (JWT, bcrypt)
- ✅ Basic API endpoints
- ✅ Test framework and initial tests

### Phase 2: Agent System
- LangGraph agent orchestration
- WebSocket connection management
- ChromaDB memory/RAG
- Celery task processing
- Agent routing and handoff
- Additional agent tools

### Phase 3: Frontend
- React + Vite application
- Real-time chat UI
- Agent visualization (Minecraft-style)
- Session management

### Phase 4: Production
- Docker Compose (dev + prod)
- Nginx reverse proxy
- GitHub Actions CI/CD
- Deployment automation
- Monitoring and metrics

## Questions?

- Check [README.md](./README.md) for project overview
- See [ROADMAP.md](./ROADMAP.md) for timeline
- Review tests in `backend/tests/` for examples
- Check FastAPI docs at `http://localhost:8000/docs`

## Code Style

- Follow PEP 8
- Use type hints for all functions
- Write docstrings for classes and complex functions
- Keep functions focused and under 50 lines when possible
- Use async/await for I/O operations

## Questions or Issues?

Open an issue on GitHub with:
- Clear description of the problem
- Steps to reproduce (if applicable)
- Your environment (Python version, OS, etc.)
