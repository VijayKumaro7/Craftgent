# Getting Started with Craftgent 🎮

Welcome to **Craftgent**, the Minecraft-style AI Agent Command Center! This guide will help you get up and running in just 3 simple steps.

## Table of Contents
1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Creating Your Account](#creating-your-account)
4. [Your First Chat](#your-first-chat)
5. [Navigation Tips](#navigation-tips)
6. [Next Steps](#next-steps)

---

## Quick Start

Get started in 3 simple steps:

```
1. Create an account → 2. Login to your dashboard → 3. Start chatting with an AI agent
```

**Time required:** ~5 minutes

---

## System Requirements

Before getting started, make sure you have:

### Browser Compatibility
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Internet & Hardware
- **Connection:** Stable internet connection (broadband recommended)
- **Speed:** Minimum 5 Mbps for optimal experience
- **Device:** Desktop, laptop, or tablet
- **Storage:** 50MB free disk space

### Browser Settings
- Cookies: ✅ Enabled
- JavaScript: ✅ Enabled
- WebSocket: ✅ Enabled

---

## Creating Your Account

### Step 1: Visit the Login Page

Navigate to `http://localhost:8000/` (or your Craftgent instance URL)

You'll see the login screen with two options:
- **Login** - If you already have an account
- **Sign Up** - To create a new account

### Step 2: Sign Up for New Users

1. Click **"Sign Up"** or **"Create Account"**
2. Fill in the registration form:
   - **Full Name:** Your name (e.g., "John Doe")
   - **Email:** Your email address (e.g., "john@example.com")
   - **Password:** Create a strong password (min 8 characters)
   - **Confirm Password:** Re-enter your password

3. Read and accept the Terms of Service
4. Click **"Create Account"**

### Step 3: Verify Your Email

1. Check your email inbox for a verification link
2. Click the **"Verify Email"** link (valid for 24 hours)
3. You'll be redirected to the login page
4. Log in with your email and password

### Step 4: Complete Your Profile (Optional)

You can now complete your profile:
- Add a profile picture
- Set your timezone
- Configure notification preferences

✅ **Account created!** You're now ready to start chatting.

---

## Your First Chat

### Step 1: Login to Your Dashboard

1. Enter your email and password
2. Click **"Login"**
3. You'll see the main chat interface

### Step 2: Meet Your Agents

On the left side, you'll see your **party members** (AI agents):

| Agent | Emoji | Specialty | Best For |
|-------|-------|-----------|----------|
| **NEXUS** | 🧠 | Planning & Strategy | High-level thinking, research, brainstorming |
| **ALEX** | 🔧 | Code & Debugging | Programming tasks, code review, API design |
| **VORTEX** | 📊 | Data & Analysis | Statistical analysis, data visualization, trends |
| **RESEARCHER** | 🔍 | Research & Info | Finding information, deep research, sources |

### Step 3: Start Your First Chat

1. **Select an agent** from the left sidebar (default: ALEX 🔧)
2. **Click the message input field** at the bottom
3. **Type your first message**, for example:
   ```
   "Help me write a Python function that counts unique items in a list"
   ```
4. **Press Enter** or click the **Send button** (↑)

### Step 4: Wait for the Response

- You'll see a **"Thinking..."** indicator with animated dots
- The agent processes your request (typically 5-15 seconds)
- The response appears above your message

### Step 5: Continue the Conversation

- Ask follow-up questions
- Ask the agent to refactor code
- Request explanations or examples
- Upload files for analysis

---

## Navigation Tips

### Main Interface Layout

```
┌─────────────────────────────────────────────────┐
│  Logo  Status  User Info  Settings  [Connected] │  ← Top Bar
├──────────┬──────────────────────────┬───────────┤
│          │                          │  📎 Files │
│ Agents   │   Chat Messages          │  📋 Tmpl  │
│ (Left)   │   (Center)               │  ⚙️ Set   │
│          │                          │  🎨 Theme │
├──────────┼──────────────────────────┼───────────┤
│  ⬜⬜⬜  │   Message Input Field     │  Hotbar   │
└─────────────────────────────────────────────────┘
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Enter** | Send message |
| **Shift + Enter** | New line in message |
| **Ctrl + K** | Open command palette |
| **Q** | Focus chat |
| **W** | Open file upload |
| **E** | Open templates |
| **R** | Open settings |
| **Ctrl + N** | New session |

### Top Bar Features

- **Logo**: Click to return to dashboard
- **Status Indicator**: Shows connection status (green = connected)
- **User Info**: View your profile and account
- **Settings (⚙️)**: Customize response format, tone, language
- **Logout**: Sign out of your account

### Left Sidebar - Agent Selection

- **Agent Cards**: Show agent name, level, and stats
- **Highlighted Agent**: Currently selected agent
- **Agent Stats**: Health (HP) and Magic (MP) points
- **Session History**: Browse past conversations
- **Create Session**: Start a new conversation thread

### Right Sidebar - Quick Actions

- **📎 File Upload**: Add documents, data, or code files
- **📋 Templates**: Browse prompt templates by category
- **⚙️ Settings**: Customize your experience
- **🎨 Theme**: Switch light/dark mode

---

## Next Steps

### 1. Explore the Features
- **Upload a file**: Click 📎 to upload a document (PDF, CSV, etc.)
- **Try templates**: Click 📋 to see ready-made prompts
- **Customize settings**: Click ⚙️ to adjust response format

### 2. Learn More
- Read the [User Guide](./USER_GUIDE.md) for detailed instructions
- Check the [Features Overview](./FEATURES_OVERVIEW.md) for all capabilities
- View [API Documentation](../README.md#api-endpoints) for developer info

### 3. Tips for Better Results

| Do ✅ | Don't ❌ |
|------|---------|
| Be specific in your requests | Ask vague questions |
| Provide context and examples | Assume the agent knows your situation |
| Use follow-up questions for clarification | Start completely new topics in same session |
| Experiment with different agents | Use the same agent for everything |
| Save important sessions for reference | Let sessions expire without archiving |
| Check file formats before uploading | Upload unsupported file types |

### 4. Common First Tasks

- **Need code help?** → Talk to **ALEX** 🔧
- **Want to analyze data?** → Talk to **VORTEX** 📊
- **Need research?** → Talk to **RESEARCHER** 🔍
- **Brainstorming ideas?** → Talk to **NEXUS** 🧠

---

## Troubleshooting

### Can't Login?
- Check your email and password are correct
- Verify your account was created (check email for verification)
- Clear your browser cookies and try again
- Check your internet connection

### Agent Not Responding?
- Wait 15-30 seconds (longer for complex requests)
- Check connection status in top right (should be green)
- Try a simpler question first
- Refresh the page if it doesn't work

### Can't Upload Files?
- Ensure file is under 50MB
- Check if file format is supported (PDF, CSV, TXT, JSON, DOC, XLS)
- Try uploading a smaller file first
- Check your internet connection

### Session Disappeared?
- Check "Session History" on the left sidebar
- Sessions are archived after 30 days of inactivity
- You can export sessions to save them permanently

---

## Help & Support

- **Questions?** Check the [User Guide](./USER_GUIDE.md)
- **Issues?** Review [Troubleshooting](#troubleshooting) above
- **Feature requests?** Submit feedback in settings
- **Technical help?** Check [API docs](../README.md)

---

**You're all set!** 🎉

Start by typing your first message and exploring what Craftgent can do for you. Each agent has unique strengths - don't be afraid to experiment and find what works best for your needs.

Happy chatting! 💬
