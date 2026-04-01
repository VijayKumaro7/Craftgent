# CraftAgent Makefile
# All commands run from the repo root.
# Usage: make <target>

.PHONY: help dev-backend dev-frontend install-backend install-frontend \
        migrate migrate-new test lint docker-up docker-down docker-logs clean

# ── Default: show help ────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  ⛏  CraftAgent — Developer Commands"
	@echo ""
	@echo "  Setup"
	@echo "    make install          Install all dependencies (backend + frontend)"
	@echo "    make install-backend  Install Python deps only"
	@echo "    make install-frontend Install Node deps only"
	@echo ""
	@echo "  Development"
	@echo "    make dev-backend      Run FastAPI with hot reload (needs .env)"
	@echo "    make dev-frontend     Run Vite dev server"
	@echo "    make dev              Run both in parallel (requires tmux or separate terminals)"
	@echo ""
	@echo "  Database"
	@echo "    make migrate          Apply all pending Alembic migrations"
	@echo "    make migrate-new m=<msg>  Create a new migration"
	@echo ""
	@echo "  Quality"
	@echo "    make test             Run all tests (backend)"
	@echo "    make lint             Ruff lint + type check"
	@echo ""
	@echo "  Docker"
	@echo "    make docker-up        Start all services (api + db)"
	@echo "    make docker-down      Stop all services"
	@echo "    make docker-logs      Tail all service logs"
	@echo ""

# ── Install ───────────────────────────────────────────────────────────────
install: install-backend install-frontend

install-backend:
	@echo "📦 Installing Python dependencies..."
	cd backend && pip install -r requirements.txt

install-frontend:
	@echo "📦 Installing Node dependencies..."
	cd frontend && npm install

# ── Development ───────────────────────────────────────────────────────────
dev-backend:
	@echo "🚀 Starting FastAPI..."
	cd backend && uvicorn app.main:app --reload --reload-dir app --port 8000

dev-frontend:
	@echo "🚀 Starting Vite..."
	cd frontend && npm run dev

# ── Database ──────────────────────────────────────────────────────────────
migrate:
	@echo "🗄️  Running migrations..."
	cd backend && alembic upgrade head

migrate-new:
	@echo "🗄️  Creating migration: $(m)"
	cd backend && alembic revision --autogenerate -m "$(m)"

# ── Quality ───────────────────────────────────────────────────────────────
test:
	@echo "🧪 Running tests..."
	cd backend && pytest tests/ -v --tb=short

lint:
	@echo "🔍 Linting..."
	cd backend && ruff check app/ && mypy app/

# ── Docker ────────────────────────────────────────────────────────────────
docker-up:
	@echo "🐳 Starting Docker services..."
	docker compose up --build -d

docker-down:
	@echo "🐳 Stopping Docker services..."
	docker compose down

docker-logs:
	docker compose logs -f

# ── Cleanup ───────────────────────────────────────────────────────────────
clean:
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find backend -name "*.pyc" -delete 2>/dev/null || true
	rm -rf frontend/dist frontend/node_modules/.vite 2>/dev/null || true
	@echo "✅ Cleaned"
