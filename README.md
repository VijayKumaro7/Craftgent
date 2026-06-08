# 🛠️ Craftgent — Multi-Agent AI Assistant

> An intelligent platform where specialized AI agents collaborate to help you with code, data analysis, research, and problem-solving.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-green)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-blue)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-teal)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://react.dev/)

</div>

---

## 💡 What is Craftgent?

Unlike single-AI chatbots that handle everything the same way, **Craftgent uses specialized AI agents** that automatically pick the best expert for your task. Need code help? Get the code expert. Analyzing data? Get the data analyst. Researching something? Get the researcher.

**Key Benefits:**
- 🎯 **Smart Routing** — Automatically picks the right agent for your question
- ⚡ **Real-time Responses** — Stream answers token-by-token as they're generated
- 🧠 **Persistent Memory** — Learns from your past conversations
- 📁 **File Processing** — Upload CSV, JSON, PDF, code files, and more
- 🎨 **Customizable** — Adjust tone, format, and language per query

---

## 🤖 Meet Your Agents

| Agent | Specialty | Use For |
|-------|-----------|---------|
| **NEXUS** | General Q&A & Analysis | "Explain X", "Compare Y and Z", "Summarize..." |
| **ALEX** | Code & Architecture | "Write function", "Debug this", "Design API" |
| **VORTEX** | Data & SQL | "Analyze CSV", "Write SQL query", "Find patterns" |
| **RESEARCHER** | Deep Research | "Research topic", "Fact-check this", "Compare options" |

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.12+** or **Docker**
- **Node.js 20+**
- **PostgreSQL 14+** (optional, included in Docker)

### Option A: Docker (Recommended)

```bash
docker-compose up
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

### Option B: Local Setup

**Backend:**
```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Edit with your API keys
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Setup Environment Variables

Create a `.env` file in the backend directory:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...          # Get from https://console.anthropic.com
SECRET_KEY=your-super-secret-key-min-32-chars
DATABASE_URL=postgresql://user:pass@localhost/craftgent

# Optional
REDIS_URL=redis://localhost:6379/0
TAVILY_API_KEY=your-tavily-key        # For web search feature
```

---

## ✨ Key Features

### 💬 Modern Chat Interface
- Multi-session conversations
- Real-time streaming responses
- Markdown rendering with syntax highlighting
- Typing indicators showing which agent is working

### 📁 Smart File Upload
- Drag-and-drop support
- Formats: CSV, JSON, PDF, Python, JavaScript, TypeScript, Go, Rust, Markdown
- File limit: 10 MB per file, 5 files per message

### 🎨 Customization
- **Format**: Detailed, Brief, Code Only
- **Tone**: Professional, Casual, ELI5
- **Language**: 15+ languages supported

### ⌨️ Power User Shortcuts
- `Enter` → Send message
- `Shift + Enter` → New line
- `Escape` → Clear input
- `/clear` → Clear history
- `/help` → Show commands
- `/agents` → Show agent stats

### 🔐 Security
- JWT authentication with refresh tokens
- bcrypt password hashing
- Session isolation per user
- CORS protection

---

## 📊 Project Structure

```
craftgent/
├── backend/              # FastAPI + LangGraph agents
│   ├── app/
│   │   ├── agents/       # NEXUS, ALEX, VORTEX, RESEARCHER
│   │   ├── auth/         # JWT authentication
│   │   ├── db/           # Database models
│   │   ├── tools/        # Web search, code execution, SQL
│   │   ├── memory/       # ChromaDB for RAG
│   │   └── api/          # API endpoints
│   └── requirements.txt
│
├── frontend/             # React + TypeScript UI
│   ├── src/
│   │   ├── components/   # Chat, agents, auth
│   │   ├── store/        # Zustand state
│   │   ├── api/          # API clients
│   │   └── pages/        # App pages
│   └── package.json
│
├── nginx/                # Reverse proxy config
├── scripts/              # Utility scripts
├── docker-compose.yml    # Development containers
└── README.md
```

---

## 🛠️ Development

### Run Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm run test
```

### Project Roadmap

**Current (v0.2.0)**
- ✅ Multi-agent routing
- ✅ Real-time WebSocket streaming
- ✅ RAG memory with ChromaDB
- ✅ File upload & processing
- ✅ Agent stats (XP, Level, HP, MP)

**Planned (v0.3.0)**
- Team collaboration
- Custom user agents
- Export conversations
- Mobile app
- Voice integration

---

## 📚 Documentation

For detailed guides, see the `/docs` folder:
- **GETTING_STARTED.md** — 5-minute quickstart
- **USER_GUIDE.md** — Feature walkthrough
- **FEATURES_OVERVIEW.md** — Detailed breakdown
- **DEPLOYMENT.md** — Production setup

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes with clear commits
4. **Test** thoroughly
5. **Push** to your branch
6. **Open** a Pull Request

### Code Standards
- **Backend**: PEP 8 (Python)
- **Frontend**: ESLint (JavaScript/TypeScript)
- **Tests**: All features must include tests
- **Commits**: Use clear messages (`feat:`, `fix:`, `docs:`, etc.)

### Report Issues

Found a bug? [Open an issue](https://github.com/vijaykumaro7/craftgent/issues) with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Python version, Node version)

---

## 📄 License

Craftgent is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

You can:
- ✅ Use commercially
- ✅ Modify the code
- ✅ Distribute it
- ✅ Use privately
- ⚠️ Must include license notice

---

## 💬 Support & Questions

- 📖 **Docs** → `/docs` folder
- 🐛 **Bugs** → [GitHub Issues](https://github.com/vijaykumaro7/craftgent/issues)
- 💬 **Questions** → [GitHub Discussions](https://github.com/vijaykumaro7/craftgent/discussions)
- 📧 **Email** → vijaybgaddi07@gmail.com

---

## 🎯 Quick Links

| Link | Purpose |
|------|---------|
| [API Docs](http://localhost:8000/docs) | Interactive API documentation (when running) |
| [Issues](https://github.com/vijaykumaro7/craftgent/issues) | Bug reports & feature requests |
| [Discussions](https://github.com/vijaykumaro7/craftgent/discussions) | Community discussions |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |

---

<div align="center">

**Built with ⛏️ by Craftgent Team**

If you find Craftgent useful, please give us a ⭐ on [GitHub](https://github.com/vijaykumaro7/craftgent)!

</div>
