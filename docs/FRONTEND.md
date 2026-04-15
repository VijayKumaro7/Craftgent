# CraftAgent Frontend Documentation

## Overview

The CraftAgent frontend is a **Minecraft-themed AI Agent Command Center** built with modern web technologies. It provides a visually immersive interface for interacting with multiple specialized AI agents.

**Stack:** React 18 + TypeScript + Tailwind CSS + Zustand + Vite

**Current Status:** Phase 3 - Frontend UI implementation complete with landing page, authentication, and multi-agent chat interface.

---

## New Features (Phase 3)

### 1. Landing Page
The Craftgent platform now features an engaging landing page with:
- **Hero Section** — Eye-catching introduction with key features
- **Features Section** — Showcase of platform capabilities
- **Agent Showcase** — Visual introduction to all agents (NEXUS, ALEX, VORTEX, RESEARCHER)
- **CTA Section** — Call-to-action for registration/login
- **LandingHeader** — Navigation with branding

**Components:**
- `LandingPage.tsx` — Main landing page container
- `HeroSection.tsx` — Hero banner with tagline
- `FeaturesSection.tsx` — Feature cards and descriptions
- `AgentShowcase.tsx` — Agent profiles with abilities
- `CTASection.tsx` — Sign up and login CTAs
- `LandingHeader.tsx` — Header navigation

### 2. Login & Registration Screen
Secure authentication flow for users:
- **LoginScreen** — Form-based login with email/password
- JWT token handling and session management
- Error handling and validation
- Integration with backend auth API

**Components:**
- `LoginScreen.tsx` — Main authentication form
- `Button.tsx` — Reusable button component

### 3. Main Chat Interface
Multi-agent chat system with session management:
- **Agent Sidebar** — All 4 agents with real-time stats
- **Session Tabs** — Multiple concurrent chat sessions
- **Message List** — Virtualized chat history with agent responses
- **Input Bar** — Message composition with file upload
- **Customization** — Response format/tone preferences

---

## Visual Architecture

### Main Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TOP BAR                                   │
│  ⛏ CRAFTGENT v0.2.0  🟢 ONLINE  👤 User  ⚙️ Settings  🌙 DARK  ✕   │
└─────────────────────────────────────────────────────────────────────┘
┌──────────────┬────────────────────────────────────────────────────┐
│              │              SESSION TABS                           │
│  AGENT       │  [Session 1 ✕] [Session 2 ✕] [Session 3 ✕] [+]   │
│  SIDEBAR     │────────────────────────────────────────────────────│
│              │                                                    │
│  ◀ NEXUS     │         MESSAGE LIST (Virtualized)                │
│    ████      │                                                    │
│    ███       │  Agent: NEXUS                                     │
│    Lv 12     │  Here's your research on machine learning...      │
│              │                                                    │
│  ○ ALEX      │  Agent: ALEX                                      │
│    ██        │  Here's the Python code you requested:           │
│    █████     │  ```python                                        │
│    Lv 8      │  def hello():                                     │
│              │      return "world"                               │
│  ○ VORTEX    │  ```                                             │
│    ███       │                                                    │
│    ████      │  [TypingIndicator]                               │
│    Lv 15     │  Agent is thinking...                            │
│              │────────────────────────────────────────────────────│
│  ○ RESEARCHER│  FILE UPLOAD PANEL (Collapsed)                   │
│    ████      │  📎 [Drag files or click]                        │
│    █████     │────────────────────────────────────────────────────│
│    Lv 18     │  INPUT BAR                                        │
│              │  [📎] [T›] [Type your message...  ] [SEND ▶]     │
│──────────────│────────────────────────────────────────────────────│
│ ▶ TEMPLATES  │ Search...                                        │
│   Code (11)  │ [All] [Code] [Data] [Research] [General]         │
│   Data (8)   │ • Write Unit Test                                 │
│   Research.. │ • Code Review                                     │
│   General    │ • Analyze Dataset                                 │
│              │ • Research Topic                                  │
│──────────────│────────────────────────────────────────────────────│
│ ▶ SESSIONS   │                                                    │
│   Today (3)  │                                                    │
│   Yesterday  │                                                    │
│   This Week  │                                                    │
│              │                                                    │
└──────────────┴────────────────────────────────────────────────────┘

Legend:
  ◀ = Active/Selected
  ○ = Inactive/Available
  ▶ = Collapsed section
  ▼ = Expanded section
  ✕ = Close button
  + = Add new
```

---

## Component Breakdown

### 1. **TopBar** — Header & Status

**Location:** Full width, top of page  
**Height:** 40px (fixed)  
**Background:** Green (#5d9e32) with Minecraft block styling

**Content:**
- **Logo:** ⛏ CRAFTGENT (left)
- **Version:** v0.2.0 badge
- **Status Pill:** Real-time connection indicator
  - 🟢 ONLINE (solid green) — Connected
  - 🟡 CONNECTING... (yellow) — Establishing WebSocket
  - ⚫ OFFLINE (gray) — Disconnected
  - ❌ ERROR (red) — Connection failure
- **User Info:** Current username with 👤 icon
- **Customization Panel:** ⚙️ dropdown with response settings
- **Theme Toggle:** ☀️/🌙 light/dark mode
- **Logout:** ✕ button with confirmation

**Styling:** Pixel font, drop shadow, 3D border effect

---

### 2. **AgentSidebar** — Party Members & Controls

**Location:** Left panel, below top bar  
**Width:** 240px (fixed)  
**Scrollable:** Yes (vertical)

**Sections:**

#### A. Party Members
Shows all 4 agents with stats:
```
◀ NEXUS
   Role: Research Mage
   ██████████ HP: 90
   ███████████ MP: 74
   Lv 12 | XP 67%
   🏥 55% | 🧠 74% | 📊 12

○ ALEX
   Role: Code Warrior
   ██████ HP: 55
   ███████████████ MP: 99
   Lv 8 | XP 42%
   ...

○ VORTEX
   Role: Data Creeper
   ...

○ RESEARCHER
   Role: Chief Investigator
   ...
```

**Interactive:**
- Click agent to select (active = bright color, highlighted border)
- Disabled during streaming (cursor-not-allowed)
- Hover shows tooltip with agent description

#### B. Abilities
Lists available agent tools:
```
⚡ WEB SEARCH (enabled)
⚡ CODE EXEC (enabled)
⚡ RAG QUERY (enabled)
⚡ SQL AGENT (enabled)
○ VISION (disabled)
○ VOICE (disabled)
```

#### C. Biome Info
Shows current "environment":
```
🌲 FOREST DIMENSION
Difficulty: HARD
Moon Phase: 🌕
```

#### D. Templates Panel
Collapsible prompt library:
```
▼ TEMPLATES
  Search: [____________]
  [All] [Code] [Data] [Research] [General]
  • Write Unit Test (ALEX)
  • Code Review (ALEX)
  • Analyze Dataset (VORTEX)
  • Research Topic (NEXUS)
  • Market Analysis (NEXUS)
```

**Actions:**
- Click template → Insert prompt into chat input
- Hover → Preview prompt text

#### E. Session History
Collapsible past sessions:
```
▶ SESSION HISTORY
  🔍 [Search sessions...]
  📅 Today (3 sessions)
    └ Machine Learning Research
    └ Python Async Code
    └ Data Analysis Meeting
  📅 Yesterday (2 sessions)
  📅 This Week (7 sessions)
```

**Actions:**
- Click session → Load into new tab (uses SessionTabs)
- Shows session agent, message count, date

---

### 3. **SessionTabs** — Tab Switcher

**Location:** Below top bar, above message list  
**Height:** 36px  
**Scrollable:** Yes (horizontal)

**Display:**
```
[Archaeology 101 ✕] [Python Code Review ✕] [Data Analysis ✕] [+ NEW]
  ◆ RESEARCHER 8 msgs   ◆ ALEX 12 msgs       ◆ VORTEX 5 msgs
```

**Features:**
- **Active Tab:** Bright background, full text opacity
- **Inactive Tabs:** Dimmed background, lower opacity
- **Close Button:** ✕ on hover or always visible
- **Agent Badge:** Agent name with color indicator
- **Message Count:** Displays message count for context
- **New Tab Button:** + button to create new session

**Interactions:**
- Click tab → Switch to that session (loads messages)
- Click ✕ → Close session (with confirmation if has messages)
- Click + → Create new session (gets unique ID, defaults to NEXUS)

---

### 4. **ChatPanel** — Main Message Area

**Location:** Center panel  
**Scrollable:** Yes (vertical, with virtualization)  
**Min Height:** 400px

#### Message Display
Each message shows:
```
┌─────────────────────────────────┐
│ Agent: NEXUS (timestamp)         │
├─────────────────────────────────┤
│ This is the message content...   │
│ It can be multiple lines and     │
│ include code blocks or markdown. │
└─────────────────────────────────┘
```

**Message Types:**
- **User Messages:** Right-aligned, light background
- **Assistant Messages:** Left-aligned, agent color background
- **System Messages:** Center-aligned, gray background
- **Error Messages:** Red border, error icon

**Features:**
- **Markdown Rendering:** Code blocks, bold, italic, links
- **Code Syntax Highlighting:** With language indicator
- **Agent Badge:** Shows which agent responded
- **Timestamps:** Created at time for each message
- **Streaming Animation:** Blinking cursor during typing
- **Virtualization:** Renders only visible messages (handles 1000+ smoothly)

#### Typing Indicator
```
Agent is thinking...  ⚡ ⚡ ⚡
(animated dots)
```

---

### 5. **InputBar** — Message Input & Send

**Location:** Bottom of chat area  
**Height:** 40px (fixed)

**Components:**
```
[Status] [📎] [T›] [Input Field...] [SEND ▶]
```

- **Status Pill:** Connection status with color
- **File Upload Button:** 📎 toggles FileUpload panel, shows count if files queued
- **Input Prefix:** "T›" label (Minecraft-styled)
- **Input Field:** Main text input, monospace font, auto-expand
- **Send Button:** Green when enabled, gray when disabled
  - Disabled: Streaming, No text, Not connected

**Keyboard Shortcuts:**
- **Enter:** Send message (no Shift)
- **Shift+Enter:** New line
- **Esc:** Clear input

**Placeholder Text:**
- Normal: "Press T to chat... /help for commands"
- Streaming: "Agent is thinking..."
- Disconnected: "Connecting..."

**Commands:**
- `/clear` — Clear message history
- `/help` — Show available commands
- `/agents` — List all agents

---

### 6. **FileUpload** — File Management

**Location:** Above input bar (collapsible)  
**Visibility:** Toggle with 📎 button

**Display:**
```
DROP FILES OR CLICK
┌─────────────────────────────────┐
│ 📦 Drag files here to upload    │
└─────────────────────────────────┘

📊 data.csv          [✕]
  12.5 KB
  
🐍 script.py         [✕]
  3.2 KB
```

**Features:**
- **Drag-Drop Area:** Full width, visual feedback on drag
- **File List:** Shows uploaded files with icons
- **Remove Buttons:** ✕ to remove file before sending
- **File Size:** Display file size in KB/MB
- **File Icons:** Emoji icons by type (📊 CSV, 🐍 Python, 📄 PDF, etc.)

**Supported Types:**
- Code: `.py`, `.js`, `.ts`, `.tsx`, `.jsx`, `.go`, `.rs`
- Data: `.csv`, `.json`
- Documents: `.pdf`, `.txt`, `.md`

**Constraints:**
- Max 10MB per file
- Max 5 files per message
- Upload on send (appended to message)

---

### 7. **CustomizationPanel** — Response Settings

**Location:** TopBar dropdown (⚙️ button)  
**Display:** Floating dropdown panel

**Options:**

**1. Response Format**
- Detailed (default) — Complete, thorough responses
- Brief — Concise, to the point
- Code Only — Just the code without explanation

**2. Tone**
- Professional (default) — Formal, business-appropriate
- Casual — Friendly, conversational
- ELI5 — Simple, explain like I'm 5

**3. Code Language**
- JavaScript (default)
- Python
- Go
- Rust

**4. Output Language**
- English (default)
- Spanish
- French
- German

**Display:**
```
┌─────────────────────────────────┐
│ ⚙️ CUSTOMIZATION                │
├─────────────────────────────────┤
│ 📝 Response Format              │
│ [Detailed ▼]                    │
│                                 │
│ 💬 Tone                         │
│ [Professional ▼]                │
│                                 │
│ { } Code Language               │
│ [JavaScript ▼]                  │
│                                 │
│ 🌐 Output Language              │
│ [English ▼]                     │
├─────────────────────────────────┤
│ Current Settings:               │
│ 📝 detailed                     │
│ 💬 professional                 │
│ {} javascript                   │
│ 🌐 english                      │
└─────────────────────────────────┘
```

**Persistence:** Saved to localStorage, applied to all subsequent messages

---

## Design System

### Color Palette

**Agent Colors:**
- NEXUS: Cyan (#55ffff) — knowledge, clarity
- ALEX: Lime (#aaffaa) — growth, code
- VORTEX: Purple (#cc88ff) — mystery, data
- RESEARCHER: Amber (#d4a574) — archaeology, discovery

**UI Colors:**
- Primary (Success): Green (#5d9e32)
- Danger (Error): Red (#e02020)
- Warning: Yellow (#f5c842)
- Background (Dark): #0a0e27
- Surface (Medium): #1a1f3a
- Border: White 10-20% opacity

**Status Colors:**
- Online: Green (#5aff5a)
- Connecting: Yellow (#f5c842)
- Offline: Gray (#888)
- Error: Red (#e02020)

### Typography

**Fonts:**
- **Pixel Font** ("Press Start 2P"): Labels, UI elements, headings
- **Terminal Font** (Courier/Monospace): Code, input, technical text
- **System Font** (fallback): Body text, descriptions

**Sizes:**
- 4px: Tiny labels
- 5px: Small captions
- 6px: UI labels (buttons, tabs)
- 8px: UI elements (icons, small text)
- 11px: Body content
- 13px: Normal text
- 20px: Input field text

**Weights:**
- Regular: 400 (body, normal)
- Bold: 700 (headings, emphasis)

### Spacing

**Grid:** 8px base unit (Tailwind)
- `px-2` (8px) — Standard horizontal padding
- `py-1.5` (6px) — Standard vertical padding
- `gap-1` (4px) — Small gaps between elements
- `gap-2` (8px) — Standard gaps

### Shadows & Borders

**3D Effect:**
- Border: 2-3px solid black/dark
- Inset: `inset 0 1px 0 lighter-color`
- Drop Shadow: `0 2-4px 0 black`

**Result:** Pressed/recessed Minecraft block appearance

---

## Responsive Design

### Breakpoints

**Mobile First Approach:**
- **Mobile:** < 640px (single column layout)
- **Tablet:** 640px - 1024px (sidebar collapses)
- **Desktop:** > 1024px (full layout)

**Adjustments:**
- AgentSidebar: Hides on mobile, slides in drawer
- SessionTabs: Horizontal scroll on mobile
- FileUpload: Full width on mobile, inline on desktop
- InputBar: Larger touch targets on mobile

### Mobile Optimizations

```
Mobile View (<640px):
┌─────────────┐
│  Top Bar    │ ← Hamburger menu for sidebar
├─────────────┤
│             │
│   Messages  │ ← Full width
│             │
├─────────────┤
│  Input      │ ← Larger for touch
└─────────────┘

Desktop View (>640px):
┌──────┬──────────┐
│ Side │ Messages │
│ bar  │          │
├──────┼──────────┤
│      │ Input    │
└──────┴──────────┘
```

---

## Performance Features

### 1. Virtualization (VirtualizedMessageList)
- **Technology:** @tanstack/react-virtual
- **Benefit:** Renders only visible messages
- **Scale:** Handles 1000+ messages at 60 FPS
- **Auto-scroll:** Jumps to latest message on new arrival

### 2. Code Splitting
- **ChatPanel:** Lazy-loaded chunk (280KB+)
- **TaskPanel:** Lazy-loaded chunk (4.5KB)
- **Fallback:** Skeleton loaders while loading
- **Result:** Main bundle reduced 540KB → 258KB

### 3. Skeleton Loaders
- **SkeletonMessage:** Animated placeholder during message fetch
- **SkeletonSession:** Placeholder for session list items
- **Effect:** Perceived performance improvement

### 4. localStorage Persistence
- **Templates:** Prompt templates persist across sessions
- **Preferences:** Response customization settings saved
- **Sessions:** Open session tabs reset on reload (by design)

### 5. WebSocket Optimization
- **Auto-reconnect:** Retries with exponential backoff
- **Message Batching:** Groups tokens for fewer updates
- **Debouncing:** Prevents excessive renders

---

## Accessibility

### Keyboard Navigation
- **Tab:** Navigate between components
- **Shift+Tab:** Reverse navigation
- **Enter:** Select/activate
- **Esc:** Close modals, cancel actions
- **Space:** Toggle checkboxes, activate buttons

### ARIA Labels
- All buttons: `aria-label` with descriptions
- Input fields: Associated `<label>` elements
- Status indicators: `aria-live="polite"` for updates
- Dialogs: `role="dialog"` with `aria-labelledby`

### Visual Accessibility
- **Color Contrast:** WCAG AA compliant (4.5:1 minimum)
- **Focus Indicators:** Visible focus rings on all interactive elements
- **Text Sizing:** Scales with browser zoom (no fixed px)
- **Icons + Text:** All icons paired with text labels

---

## Future Enhancements

### Phase 4 (Planned):
- **Agent Analytics Dashboard:** Visualize agent usage and performance
- **Collaboration Features:** Share sessions, @mention agents, team workspaces
- **Advanced Themes:** Custom color schemes, dark/light toggles
- **Mobile App:** Native mobile application
- **Voice Input:** Speak to agents, voice responses
- **Vision Mode:** Upload images for analysis
- **Agent Customization:** Train custom agents on user data

---

## Development Guide

### Running the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Development server (hot reload)
npm run dev
# Open http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Building Components

**Component Structure:**
```typescript
// File: src/components/chat/YourComponent.tsx
import { useState, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function YourComponent() {
  const { data, setData } = useAppStore()
  const [local, setLocal] = useState('')

  return (
    <div className="flex flex-col gap-2">
      {/* Component UI */}
    </div>
  )
}
```

**Styling Conventions:**
- Use Tailwind CSS classes (utility-first)
- Minecraft 3D effect: `border-2 border-black/80 inset shadow`
- Fonts: `font-pixel` (labels), `font-terminal` (code)
- Colors: Reference from `tailwind.config.js`

### State Management (Zustand)

**Stores:**
- `useAppStore.ts` — Agent selection, messages, session state
- `useAuthStore.ts` — User authentication
- `usePreferencesStore.ts` — User preferences (localStorage)
- `useTemplatesStore.ts` — Prompt templates (localStorage)

**Usage:**
```typescript
const { messages, addUserMessage } = useAppStore()
const { username } = useAuthStore()
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Messages not appearing | WebSocket disconnected | Check `/api/health`, refresh page |
| Slow scrolling | Too many messages | Uses virtualization automatically |
| Template not inserting | Wrong text encoding | Ensure prompt is valid UTF-8 |
| FileUpload not working | File size/type | Check constraints (10MB, allowed types) |
| Agent not responding | Router confusion | Try explicit agent selection in sidebar |

### Performance Issues

1. **Slow message rendering:**
   - Check if virtualization is enabled
   - Verify WebSocket connection
   - Reduce message count (VirtualizedMessageList handles 1000+)

2. **High CPU usage:**
   - Disable animations in preferences
   - Close unused session tabs
   - Clear browser cache

3. **Memory leaks:**
   - Close sessions properly (✕ button)
   - Refresh page if using for long session (>2 hours)

---

## Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org/docs
- **Zustand Docs:** https://github.com/pmndrs/zustand
- **Vite Docs:** https://vitejs.dev/guide

