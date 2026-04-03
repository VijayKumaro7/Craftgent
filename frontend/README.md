# CraftAgent Frontend 🎮

React + Vite + TypeScript frontend for the CraftAgent AI multi-agent chat system.

**Minecraft-themed UI with Tailwind CSS** — dark mode with cobalt/emerald accents, pixel art styling.

---

## Quick Start

### Prerequisites

- **Node.js 18+** (download from [nodejs.org](https://nodejs.org))
- **Backend running** at `http://localhost:8000` (see [../backend](../backend/README.md))

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# .env.local should have:
# VITE_API_URL=http://localhost:8000
# VITE_WS_URL=ws://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Open browser to **http://localhost:5173**

---

## What's Implemented (Phase 3)

### ✅ Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ Complete | Login/Register with JWT tokens |
| Chat Interface | ✅ Complete | Real-time message display with streaming |
| Agent Selection | ✅ Complete | Choose NEXUS, ALEX, or VORTEX |
| Message History | ✅ Complete | Messages stored and displayed |
| Token Refresh | ✅ Complete | Auto-refresh access tokens |
| Responsive Layout | ✅ Complete | Desktop-optimized, tablet support |
| Dark Theme | ✅ Complete | Minecraft-inspired dark UI |

### 🔄 Partially Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| Session History | 🔄 UI Only | Sidebar shows sessions, click to load (backend ready) |
| Agent Stats | 🔄 UI Only | Stats endpoint integrated, display components needed |
| Sidebar Navigation | 🔄 UI Only | Layout ready, full functionality pending |

### ⏳ Not Yet Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| WebSocket Chat | ⏳ Phase 2 | Real-time bidirectional messaging (backend ready) |
| Pixel Art Assets | ⏳ Phase 3f | Agent head images, custom icons |
| Settings Panel | ⏳ Phase 3f | User preferences, theme customization |
| Advanced Stats UI | ⏳ Phase 3f | XP bars, level displays, HP/MP meters |
| Message Formatting | ⏳ Future | Markdown, code block syntax highlighting |

---

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx              ← Login screen
│   │   ├── RegisterPage.tsx           ← Register screen
│   │   └── ChatPage.tsx               ← Main chat interface
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx          ← Main chat container
│   │   │   ├── ChatBubble.tsx         ← Individual message
│   │   │   └── InputBox.tsx           ← Message input + agent selector
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── store/
│   │   ├── authStore.ts              ← Zustand: auth state
│   │   ├── chatStore.ts              ← Zustand: chat state
│   │   └── agentStore.ts             ← Zustand: agent state
│   │
│   ├── api/
│   │   ├── client.ts                 ← Axios instance with JWT
│   │   ├── auth.ts                   ← Auth endpoints
│   │   ├── chat.ts                   ← Chat endpoints (SSE)
│   │   └── stats.ts                  ← Stats endpoints
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                ← Auth logic
│   │   ├── useChat.ts                ← Chat logic with streaming
│   │   └── useStats.ts               ← Stats fetching
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── agent.ts
│   │   └── api.ts
│   │
│   ├── App.tsx                       ← Router setup
│   ├── main.tsx                      ← Entry point
│   └── index.css                     ← Tailwind + global styles
│
├── public/                           ← Static assets (add images here)
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env.example
```

---

## Development

### Run Tests

```bash
npm run type-check  # TypeScript validation
```

### Build for Production

```bash
npm run build       # Creates dist/ folder
npm run preview     # Preview production build locally
```

### Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** Use your editor's formatter (Prettier recommended)
- **Linting:** Can add ESLint with `npm install -D eslint`

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 18.2.0 |
| **Build Tool** | Vite | 5.0.8 |
| **Language** | TypeScript | 5.2.2 |
| **State** | Zustand | 4.5.0 |
| **HTTP** | Axios | 1.7.7 |
| **Router** | React Router | 6.24.0 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **Icons** | Lucide React | 0.408.0 |

---

## API Integration

### Authentication Flow

1. **Register:** `POST /api/auth/register` (username, password)
2. **Login:** `POST /api/auth/login` → get JWT `access_token`
3. **Auto-refresh:** `POST /api/auth/refresh` (uses httpOnly cookie)
4. **Get User:** `GET /api/auth/me` (requires token header)

### Chat Flow

1. **Send Message:** `POST /api/chat` with message + agent
2. **Stream Response:** SSE (Server-Sent Events)
   - Receive tokens as `data: {"token": "..."}`
   - On complete: `data: {"done": true, "full_text": "..."}`
3. **Load Session:** `GET /api/sessions/{sessionId}`
4. **Get Stats:** `GET /api/stats` → agent XP/levels/HP/MP

### Token Management

- **Access Token:** Short-lived (30 min), stored in Zustand + localStorage
- **Refresh Token:** Long-lived (7 days), stored in httpOnly cookie
- **Auto-refresh:** Axios interceptor refreshes on 401 response

---

## Key Features Explained

### Real-time Message Streaming

Messages stream token-by-token via Server-Sent Events (SSE):

```typescript
// From useChat hook
for await (const event of chatAPI.sendMessage(message, agent)) {
  if (event.token) {
    setStreamingText((prev) => prev + event.token);  // Update UI in real-time
  }
  if (event.done) {
    // Save completed message to store
  }
}
```

### Agent Selection

Switch between agents before sending a message:

```
Buttons: NEXUS (blue) | ALEX (green) | VORTEX (purple)
```

Each agent has different capabilities:
- **NEXUS:** Orchestrator for research and Q&A
- **ALEX:** Code warrior for coding tasks
- **VORTEX:** Data creeper for analytics

### Protected Routes

Unauth users redirected to login:

```typescript
<ProtectedRoute>
  <ChatPage />  ← Only logged-in users can access
</ProtectedRoute>
```

### Persistent Sessions

- User sessions loaded from `GET /api/sessions` on startup
- Click session in sidebar to load message history
- New sessions auto-created on first message

---

## Next Steps (Phase 3f - Polish)

### High Priority

1. **Agent Stats Components**
   - XP bar with percentage display
   - Level number and progress
   - HP/MP meters for each agent
   - Add to right sidebar

2. **Session Management**
   - Click session to load history
   - Delete session button
   - Rename session dialog
   - Load more sessions (pagination)

3. **Message Improvements**
   - Markdown code block rendering
   - Better text wrapping for long messages
   - Emoji support
   - Typing indicators

### Medium Priority

4. **UI Polish**
   - Pixel art agent head images (64x64 PNG)
   - Custom Minecraft-style font
   - Hover effects and animations
   - Loading skeletons for async data

5. **Settings**
   - User preferences panel
   - Theme customization
   - Default agent selection
   - Message history export

### Low Priority

6. **Advanced Features**
   - WebSocket upgrade (Phase 2 backend ready)
   - Collaborative sessions
   - Message search/filtering
   - Custom agent creation

---

## Troubleshooting

### `Cannot find module '@/' errors`

TypeScript aliases configured in `tsconfig.json`. Make sure your editor recognizes them:
- VS Code: Install "TypeScript Vue Plugin"
- Other editors: Check TypeScript plugin settings

### API requests fail with 401

Token refresh middleware should handle this automatically. Check:
1. Backend running at `VITE_API_URL` (default: http://localhost:8000)
2. Login successful (token stored in localStorage)
3. Backend `/api/auth/refresh` endpoint working

### Styling doesn't apply

Tailwind CSS requires PostCSS:
- Check `postcss.config.js` exists
- Check `index.css` imports `@tailwind` directives
- Restart dev server: `npm run dev`

### Messages not sending

1. Check backend health: `curl http://localhost:8000/api/health`
2. Verify `/api/chat` endpoint exists
3. Check browser console for error messages
4. Ensure JWT token is valid (refresh if needed)

---

## Testing the Flow

### Manual Testing Checklist

- [ ] npm install succeeds
- [ ] npm run dev starts on :5173
- [ ] Open http://localhost:5173 → redirects to /login
- [ ] Register new account
- [ ] Login redirects to /chat page
- [ ] Chat page loads with empty message list
- [ ] Type message → Send button works
- [ ] Message appears as user message (blue, right-aligned)
- [ ] Response streams token-by-token (blue box, left-aligned)
- [ ] Agent selector buttons change selection
- [ ] Selected agent shown with color badge on response
- [ ] Can select different agents for next message
- [ ] Logout button clears auth → redirect to login
- [ ] Login again with same credentials works
- [ ] Previous messages appear in chat history

---

## Resources

- **Backend API Docs:** `http://localhost:8000/docs` (Swagger UI)
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Tailwind Docs:** https://tailwindcss.com
- **Zustand Docs:** https://zustand-demo.vercel.app
- **TypeScript Docs:** https://www.typescriptlang.org/docs

---

## Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for general project guidelines.

### Frontend-Specific

1. Create feature branch: `git checkout -b feature/your-feature`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Make changes and test
5. Type check: `npm run type-check`
6. Build: `npm run build`
7. Commit and push
8. Open PR

---

## License

Part of the CraftAgent project. See root [LICENSE](../LICENSE) for details.
