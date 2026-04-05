# CraftAgent Frontend Screenshots & Visual Guide

This document provides comprehensive visual documentation of the CraftAgent frontend UI with detailed descriptions of each component and view.

> **Note:** For actual live screenshots of the running application, see the SVG mockup diagrams in this folder, which accurately represent the real UI layout and styling.

---

## 📸 Quick Visual Reference Guide

**New Users?** Start with these visual guides for quick reference:

### Getting Started
1. **[Website Overview](./images/user-guide-sections.png)** - See all main sections at a glance
2. **[Login & Registration](./images/login-flow.png)** - Step-by-step authentication flow
3. **[Your First Chat](./images/chat-interface-annotated.png)** - Navigate the main chat area

### Core Features
- **[Agent Selection](./images/agent-selection-guide.png)** - Meet your AI team and how to choose them
- **[Message Types](./images/message-types-examples.png)** - Text, code, data, errors, and typing indicators
- **[Template Library](./images/templates-library.png)** - Use pre-made prompts to get better answers

### Advanced Features
- **[File Upload](./images/file-upload-workflow.png)** - Upload and analyze documents/data
- **[Session Management](./images/session-management.png)** - Organize your conversations
- **[Customization](./images/customization-panel.png)** - Personalize response format and tone
- **[Hotbar Controls](./images/hotbar-controls.png)** - Quick actions and keyboard shortcuts
- **[Status Indicators](./images/status-indicators.png)** - Understand UI feedback and colors

### Full Documentation
- **[Getting Started Guide](./GETTING_STARTED.md)** - Quick 3-step setup (5 minutes)
- **[User Guide](./USER_GUIDE.md)** - Comprehensive feature documentation
- **[Features Overview](./FEATURES_OVERVIEW.md)** - Detailed description of all capabilities

---

## Desktop View (1440×900) — Full Application

![UI Layout](./ui-layout.svg)

**What You See:**

### Left Sidebar (250px width)
- **Agent Selection Panel** with 4 clickable agents:
  - 🔮 **NEXUS** (Research Mage) — HP 90, MP 74, Level 12, XP 67% — Highlighted when selected
  - ⚡ **ALEX** (Code Warrior) — HP 55, MP 99, Level 8, XP 42%
  - 👾 **VORTEX** (Data Creeper) — HP 72, MP 88, Level 15, XP 81%
  - 🔍 **RESEARCHER** (Chief Investigator) — HP 85, MP 95, Level 18, XP 33%

- **Agent Stats Display:**
  - Large pixel-art head (8×8 grid)
  - Role designation (e.g., "Research Mage")
  - HP bar (0-100, green when healthy)
  - MP bar (0-100, blue mana pool)
  - Level number and XP percentage

- **Abilities Section:**
  - ⚡ WEB SEARCH (enabled)
  - ⚡ CODE EXEC (enabled)
  - ⚡ RAG QUERY (enabled)
  - ⚡ SQL AGENT (enabled)
  - ○ VISION (disabled, grayed out)
  - ○ VOICE (disabled, grayed out)

- **Biome Info:**
  - 🌲 FOREST DIMENSION
  - Difficulty: HARD
  - Moon Phase: 🌕

- **Templates Panel** (collapsible):
  - Search bar to find templates
  - Category tabs: ALL, CODE, DATA, RESEARCH, GENERAL
  - Template list showing: "Write Unit Test", "Code Review", "Analyze Dataset", etc.
  - Click any template to insert into chat input

- **Session History** (collapsible):
  - Organized by date: Today, Yesterday, This Week
  - Shows past conversations with message counts
  - Click to load session into new tab

### Center Area (Main Content)
- **Top Bar (Status & Control):**
  - ⛏ CRAFTGENT v0.2.0 (left)
  - 🟢 ONLINE status indicator
  - 👤 Username display
  - ⚙️ Settings dropdown for customization
  - ☀️/🌙 Theme toggle
  - ✕ Logout button

- **Session Tabs:**
  - Multiple tabs like: `[Session 1 ✕] [Session 2 ✕] [+ NEW]`
  - Click tab to switch sessions
  - Click ✕ to close session

- **Chat Message Area:**
  - Scrollable message list with virtualization
  - Messages from different agents color-coded:
    - 🔮 NEXUS messages in cyan (#55ffff)
    - ⚡ ALEX messages in green (#aaffaa)
    - 👾 VORTEX messages in purple (#cc88ff)
    - 🔍 RESEARCHER messages in amber (#d4a574)
  - System messages in gray
  - Timestamps for each message
  - Code blocks with syntax highlighting
  - Markdown rendering (bold, italic, links)

- **Typing Indicator:**
  - "▶ VORTEX is thinking..." with animated dots
  - Shows which agent is currently processing

- **Message Input Bar:**
  - Status pill showing connection (🟢 ONLINE, 🟡 CONNECTING, ⚫ OFFLINE)
  - 📎 File upload button (shows count if files pending)
  - T› label (Minecraft-styled)
  - Large input field with monospace font
  - Send button (green when enabled, gray when disabled)

### File Upload Panel (Expandable)
- Drag-drop area to upload files
- Supported types: CSV, JSON, PDF, Python, JavaScript, Go, Rust, TypeScript, Markdown
- File list showing:
  - 📊 data.csv (12.5 KB)
  - 🐍 script.py (3.2 KB)
  - Remove with ✕ button for each file

### Customization Panel (Settings Dropdown)
When opened (click ⚙️):
- **Response Format:**
  - Detailed (default)
  - Brief
  - Code Only

- **Tone:**
  - Professional (default)
  - Casual
  - ELI5

- **Code Language:**
  - JavaScript (default)
  - Python
  - Go
  - Rust

- **Output Language:**
  - English (default)
  - Spanish
  - French
  - German

- Current settings preview at bottom

---

## Agent Team Showcase

![Agents Showcase](./agents-showcase.svg)

**4 Specialized Agents with Complete Profiles:**

Each agent card shows:
- Unique pixel-art head (8×8 grid with color palette)
- Name and role
- Class designation
- Complete stats (HP, MP, Level, XP)
- Specialty areas
- Color-coded UI indicator

---

## Mobile View (375×812)

When viewport is < 640px wide:
- Left sidebar collapses into hamburger menu
- Chat area takes full width
- Input bar at bottom with larger touch targets
- Session history accessible via menu

**What Changes:**
- Grid layout becomes single column
- Hamburger menu (☰) shows/hides sidebar
- Larger buttons (min 44px height) for touch
- Vertical scrolling only
- Top bar condensed

---

## Tablet View (768×1024)

Intermediate responsive layout:
- Sidebar hidden by default, drawer on demand
- Chat area expanded
- Larger font sizes for readability
- Optimized for 10" tablet screen
- Landscape: sidebar visible, portrait: hidden

---

## Feature Highlights

![UI Features](./ui-features.svg)

### 1. Multi-Session Tabs
```
[Session 1 ✕] [Session 2 ✕] [Session 3 ✕] [+]
```
- Switch between open sessions instantly
- Each session has independent messages and agent selection
- Close individual sessions with ✕ button
- Create new session with + button

### 2. Prompt Templates Library
```
▼ TEMPLATES [Search...]
[All] [Code] [Data] [Research] [General]
• Write Unit Test (ALEX)
• Code Review (ALEX)
• Analyze Dataset (VORTEX)
• Research Topic (NEXUS)
```
- Browse templates by category
- Search across all templates
- Click to insert into input
- Pre-loaded with 11+ templates

### 3. File Upload
```
[📎] Drag files or click to upload
  📊 data.csv (12.5 KB) [✕]
  🐍 script.py (3.2 KB) [✕]
```
- Drag-drop or click to upload
- Visual file list with icons
- Types: CSV, JSON, PDF, Code files
- Max 10MB/file, 5 files/message

### 4. Response Customization
```
📝 Response Format: [Detailed ▼]
💬 Tone: [Professional ▼]
{} Code Language: [JavaScript ▼]
🌐 Output Language: [English ▼]
```
- Format: Detailed, Brief, Code Only
- Tone: Professional, Casual, ELI5
- Code: JavaScript, Python, Go, Rust
- Language: English, Spanish, French, German

### 5. Real-time Connection
```
🟢 ONLINE    (Connected via WebSocket)
🟡 CONNECTING... (Retrying with backoff)
⚫ OFFLINE    (No connection)
```
- Auto-reconnect on disconnect
- Exponential backoff retry
- Visual status indicator
- Queue messages while offline

### 6. Message Virtualization
- Renders only visible messages (60 FPS)
- Handles 1000+ messages smoothly
- Auto-scroll to latest
- Efficient memory usage

### 7. Agent Streaming
```
Agent: ALEX
```python
def hello():
    return "world"
```
⚡ Calling tools...
🔧 execute_python
```
- Real-time token streaming
- Code syntax highlighting
- Tool calling visualizations
- Agent handoff animations

### 8. Keyboard Navigation
- **Tab:** Navigate between components
- **Shift+Tab:** Reverse navigation
- **Enter:** Send message
- **Shift+Enter:** New line
- **Esc:** Clear input, close modals

---

## Color Palette & Theming

### Agent Colors
- 🔮 NEXUS: Cyan (#55ffff) — Knowledge, research
- ⚡ ALEX: Lime green (#aaffaa) — Code, growth
- 👾 VORTEX: Purple (#cc88ff) — Data, mystery
- 🔍 RESEARCHER: Amber (#d4a574) — Discovery, archaeology

### UI Colors
- **Success/Health:** Green (#5d9e32)
- **Error:** Red (#e02020)
- **Warning:** Yellow (#f5c842)
- **Background:** Dark (#0a0e27)
- **Surface:** Medium (#1a1f3a)
- **Online:** Bright green (#5aff5a)
- **Offline:** Gray (#888)

### Fonts
- **Pixel Font:** Labels, headings (Press Start 2P)
- **Terminal Font:** Code, input (Monospace)
- **System Font:** Body text

---

## Interactive States

### Agent Selection
- **Active:** Bright color, full opacity, left border highlight
- **Hover:** Slightly brighter
- **Disabled (streaming):** Grayed out, cursor-not-allowed

### Buttons
- **Enabled:** Bright color, hover effect, clickable
- **Disabled:** Grayed, 40% opacity, cursor-not-allowed
- **Focus:** Visible focus ring

### Input Field
- **Focused:** Border visible, caret blinking
- **Disabled:** Grayed out
- **Error:** Red border

### Messages
- **User message:** Right-aligned, light background
- **Assistant message:** Left-aligned, agent color background
- **System message:** Center-aligned, gray background
- **Error message:** Red border, error icon

---

## How to Take Your Own Screenshots

If you want to capture the live application:

1. **Start the frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   # Runs on http://localhost:5173
   ```

2. **Open in browser:**
   - Navigate to http://localhost:5173
   - Login or demo mode
   - Interact with the interface

3. **Using Browser Tools:**
   - **Chrome DevTools:**
     - Right-click → Inspect
     - Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows)
     - Type "Capture full page"

   - **Browser Extensions:**
     - Full Page Screen Capture (Chrome)
     - Flameshot (Linux)
     - macOS built-in: Cmd+Shift+4

4. **Responsive Design Testing:**
   - DevTools → Device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
   - Select device (iPhone 12, iPad, etc.)
   - Capture at different sizes

---

## Key UI Landmarks

### Identify These in Live Screenshots:

1. **Agent Status:** Look for colored HP/MP bars on left
2. **Active Agent:** Bright border and highlight color
3. **Chat Messages:** Different colors per agent
4. **Input Bar:** Green SEND button at bottom
5. **Session Tabs:** Multiple tabs above chat area
6. **Status Pill:** Top left corner shows 🟢 ONLINE/🟡 CONNECTING/⚫ OFFLINE
7. **Customization Dropdown:** Click ⚙️ in top bar
8. **File Upload:** Click 📎 button in input bar
9. **Typing Indicator:** Animated dots when agent is responding
10. **Message Virtualization:** Smooth scrolling through hundreds of messages

---

## Performance Characteristics

### What Makes It Fast:

- **Message Virtualization:** Only renders visible messages
- **Code Splitting:** ChatPanel lazy-loads (280KB chunk)
- **Skeleton Loaders:** Animated placeholders during load
- **WebSocket Streaming:** Real-time token delivery
- **Browser Caching:** localStorage for templates and preferences

### Expected Performance:

- Page load: < 2 seconds
- Message rendering: 60 FPS with 1000+ messages
- Agent switching: Instant
- Session switching: < 100ms
- Search: < 200ms

---

## Accessibility Features

- **Keyboard Navigation:** Tab through all elements
- **ARIA Labels:** All buttons have descriptions
- **Color Contrast:** WCAG AA compliant (4.5:1+)
- **Focus Indicators:** Visible on all interactive elements
- **Text Scaling:** Responsive to browser zoom

---

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## Troubleshooting Visual Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Pixelated text | Scale mismatch | Check browser zoom (100%) |
| Colors inverted | Dark mode issue | Toggle theme in ⚙️ settings |
| Messages not appearing | Virtualization | Scroll to see all messages |
| File upload not working | Drag-drop support | Click button instead of dragging |
| Sidebar disappears | Mobile responsive | Hamburger menu on small screens |
| Slow scrolling | Many large messages | Try reducing message count |

---

## Next Steps

- Run the application: `cd frontend && npm run dev`
- Explore each agent by clicking in the sidebar
- Try uploading a file via the 📎 button
- Test responsive design with browser DevTools
- Check customization settings via ⚙️ button
- Switch between multiple sessions using tabs

---

*Last updated: April 5, 2026*  
*CraftAgent v0.2.0 — Frontend Documentation*
