# Craftgent User Guide 📚

Complete guide to using all features of the Craftgent AI Agent Command Center.

## Table of Contents

1. [Website Overview](#1-website-overview)
2. [Getting Started](#2-getting-started)
3. [Chat Interface Guide](#3-chat-interface-guide)
4. [Selecting and Using Agents](#4-selecting-and-using-agents)
5. [Using Templates](#5-using-templates)
6. [File Upload & Processing](#6-file-upload--processing)
7. [Session Management](#7-session-management)
8. [Customization & Settings](#8-customization--settings)
9. [Tips & Best Practices](#9-tips--best-practices)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Website Overview

### Main Interface Components

**See:** [`user-guide-sections.svg`](./images/user-guide-sections.svg)

The Craftgent interface is divided into 4 main sections:

#### 🧭 Left Sidebar - Agent Selection
- **Purpose:** Select and manage your AI agents
- **Shows:** Agent names, levels, stats (HP/MP), XP progress
- **Actions:** Click agent to select, view stats, access session history
- **Size:** ~300px wide, scrollable if many sessions

#### 💬 Center - Chat Area
- **Purpose:** Main conversation interface
- **Contains:** Message history, message input field, send button
- **Features:** Real-time responses, typing indicators, code syntax highlighting
- **Size:** Responsive, takes up most screen space

#### ⚙️ Right Sidebar - Quick Actions
- **Purpose:** Access tools and features without leaving chat
- **Tools:** File upload (📎), Templates (📋), Settings (⚙️), Theme (🎨)
- **Size:** ~160px wide, always accessible

#### 🎯 Top Bar - Navigation & Status
- **Left:** Logo (Craftgent)
- **Center:** Current session/chat title
- **Right:** Status indicators, user menu, settings

### Status Indicators

**See:** [`status-indicators.svg`](./images/status-indicators.svg)

| Indicator | Meaning | Action |
|-----------|---------|--------|
| 🟢 Green circle | Connected & ready | You can chat normally |
| 🟡 Orange circle | Connecting... | Wait for connection |
| 🔴 Red circle | Disconnected | Connection will retry automatically |
| ⏳ Animated dots | Agent thinking | Wait for response |
| ✓ Checkmark | Message sent | Response will appear soon |
| ❌ X mark | Error | See error message for details |

---

## 2. Getting Started

### Creating Your Account

**See:** [`login-flow.svg`](./images/login-flow.svg)

1. **Visit the website** → Craftgent login page
2. **Create account:**
   - Click "Sign Up"
   - Enter name, email, password
   - Click "Create Account"
3. **Verify email:**
   - Check inbox for verification link
   - Click link (valid 24 hours)
4. **Login:**
   - Enter email and password
   - You're in the dashboard!

### First Time Setup

After logging in for the first time:

1. **Update your profile** (optional but recommended):
   - Click your avatar in top-right
   - Add profile picture
   - Set timezone
   - Configure notifications

2. **Review your agents:**
   - Look at the 4 agents on the left
   - Read their descriptions
   - Note their specialties

3. **Send your first message:**
   - Select an agent
   - Type something in the chat box
   - Press Enter to send

---

## 3. Chat Interface Guide

### Sending Messages

**See:** [`chat-interface-annotated.svg`](./images/chat-interface-annotated.svg)

#### Method 1: Type & Send
```
1. Click in the message input field
2. Type your message
3. Press Enter (or click ↑ button)
```

#### Method 2: Multi-line Messages
```
1. Type first line
2. Press Shift + Enter for new line
3. Continue typing
4. Press Enter to send
```

#### Keyboard Shortcuts
- **Enter** → Send message
- **Shift + Enter** → New line
- **Ctrl + Z** → Undo (if typed before sending)
- **↑ Arrow** → Edit last message (in some interfaces)

### Understanding Responses

**See:** [`message-types-examples.svg`](./images/message-types-examples.svg)

#### Text Responses
- Agents reply with text explanations
- May include multiple paragraphs
- Can include bullet points and lists
- All text is searchable

#### Code Blocks
- Appear in dark boxes with syntax highlighting
- Color-coded by language (Python, JavaScript, etc.)
- Right-click to copy code
- May have explanatory comments

#### Error Messages
- Red highlighted text
- Explains what went wrong
- Usually includes suggested fixes
- May have a "Retry" button

#### Typing Indicator
- Shows "Agent is thinking..."
- Animated dots indicate processing
- Response will appear when complete

### Message Actions

Right-click on any message to:
- **Copy** → Copy text to clipboard
- **Regenerate** → Ask agent to re-answer
- **Edit** (for your messages) → Modify and resend
- **Share** → Get a link to share the message
- **Delete** → Remove the message

### Markdown Support

Agents support markdown formatting:

```markdown
**Bold text** → renders as bold
*Italic text* → renders as italic
# Heading 1
## Heading 2
- Bullet list
- Items here

1. Numbered list
2. Items here

[Link text](https://url.com)
`code` → inline code
```

---

## 4. Selecting and Using Agents

### Agent Profiles

**See:** [`agent-selection-guide.svg`](./images/agent-selection-guide.svg)

#### NEXUS 🧠 - The Strategist
- **Level:** Usually Level 5 (highest)
- **Specialty:** Planning, strategy, high-level thinking
- **Best for:**
  - Breaking down complex problems
  - Long-term planning
  - Brainstorming ideas
  - Research and analysis
  - Critical thinking exercises
  
**Example:** "Help me plan a software architecture for a web application"

#### ALEX 🔧 - The Code Master
- **Level:** Usually Level 3-4
- **Specialty:** Programming, debugging, API design
- **Best for:**
  - Writing and debugging code
  - Code reviews and refactoring
  - API design and integration
  - Programming best practices
  - Framework recommendations
  
**Example:** "Debug this Python function that's returning None"

#### VORTEX 📊 - The Data Expert
- **Level:** Usually Level 4
- **Specialty:** Data analysis, statistics, visualization
- **Best for:**
  - Analyzing datasets
  - Statistical calculations
  - Data visualization suggestions
  - Pattern detection
  - Report generation
  
**Example:** "Analyze this CSV file and tell me about trends"

#### RESEARCHER 🔍 - The Information Specialist
- **Level:** Usually Level 2 (being trained)
- **Specialty:** Research, information gathering, sources
- **Best for:**
  - Finding information
  - Researching topics
  - Citing sources
  - Deep research
  - Historical information
  
**Example:** "Research the latest trends in machine learning"

### Agent Stats Explained

#### Health Points (HP)
- **Green bar** showing current health
- **Regenerates** after rest period (agent not active)
- **Affects:** Response quality if low
- **Recovery:** Takes 5-10 minutes of inactivity

#### Magic Points (MP)
- **Blue bar** showing magical energy
- **Used for:** Special abilities and complex tasks
- **Regenerates:** More slowly than HP
- **Impact:** Advanced features require more MP

#### Level
- **0-10 scale:** Your agent's experience level
- **Increases:** With each successful interaction
- **Benefits:** Higher levels = faster responses, more abilities
- **Progression:** Tracked over time in your account

#### XP (Experience Points)
- **Progress toward next level**
- **Earned:** For completing tasks and interactions
- **Display:** "Current / Next Level" (e.g., "2100/3000")
- **Level Up:** Automatic when bar fills

### Switching Agents

1. **Look at left sidebar**
2. **Click on different agent card**
3. **Agent becomes highlighted** (orange/gold border)
4. **Start chatting** with new agent
5. **Previous conversation** stays in session history

### Agent Combinations

You can use multiple agents in one session:
- Message from ALEX about code
- Then ask NEXUS for a better strategy
- Then ask VORTEX to analyze results
- **Tip:** Different agents provide different perspectives!

---

## 5. Using Templates

### What Are Templates?

Templates are pre-written prompts that help you get better responses. Instead of typing everything from scratch, you can use a template and customize it.

**See:** [`templates-library.svg`](./images/templates-library.svg)

### Accessing Templates

```
1. Click 📋 Templates button (right sidebar)
2. Browse categories or search
3. Click template to preview
4. Click "Use" to insert into chat
5. Customize the template for your needs
6. Send message
```

### Template Categories

#### 💻 Code Templates
- Debug Python Function
- Generate Unit Tests
- API Documentation
- Code Refactoring
- Design Patterns
- Performance Optimization

#### 📊 Data Analysis Templates
- Statistical Summary
- Data Cleaning Steps
- Visualization Suggestions
- Trend Analysis
- Report Generation
- Data Quality Check

#### 🔍 Research Templates
- Topic Overview
- Source Finding
- Comparison Analysis
- Literature Review
- Timeline Research
- Expert Interview Prep

#### ✨ Writing Templates
- Email Composition
- Blog Post Outline
- Article Summary
- Creative Writing Prompt
- Content Calendar
- Copywriting

#### 💼 Business Templates
- Project Proposal
- Meeting Agenda
- Executive Summary
- Budget Analysis
- Market Research
- SWOT Analysis

### Creating Custom Templates

1. **Write a perfect prompt** that works for you
2. **Right-click on your message** in chat
3. **Click "Save as Template"**
4. **Name it** (e.g., "My Python Debugging Guide")
5. **Choose category**
6. **Save**

Your template will appear in:
- **Favorites section** (for quick access)
- **Your Templates category** (for organization)
- **All templates list** (searchable)

### Template Tips

- **Placeholders:** `[YOUR_CODE_HERE]` or `[PASTE_DATA_HERE]`
- **Variables:** Can use `{variable}` syntax
- **Formatting:** Include examples of what you want
- **Specificity:** The more detailed the template, the better results
- **Reuse:** Save templates you use frequently

---

## 6. File Upload & Processing

### Supported File Types

**See:** [`file-upload-workflow.svg`](./images/file-upload-workflow.svg)

| Category | Types | Max Size |
|----------|-------|----------|
| **Documents** | PDF, DOC, DOCX, TXT | 50MB |
| **Data** | CSV, XLSX, XLS, JSON | 50MB |
| **Code** | PY, JS, TS, JAVA, CPP | 50MB |
| **Archives** | ZIP (if < 50MB) | 50MB |

**Overall limit:** 50MB per file

### How to Upload

#### Method 1: Click Upload Button
```
1. Click 📎 File Upload button (right sidebar)
2. Click "Choose File" or "Browse"
3. Select file from your computer
4. Click "Open"
5. File uploads automatically
```

#### Method 2: Drag & Drop
```
1. Drag file from your computer
2. Drop into chat area
3. File uploading will start automatically
4. Wait for "Processing Complete"
```

### Upload Process

1. **Validation** (2-3 seconds)
   - File type checked
   - File size verified
   - Malware scan performed

2. **Processing** (5-30 seconds)
   - Content extracted
   - Metadata analyzed
   - Text indexed for search

3. **Ready** (immediate)
   - File available in chat
   - Agents can analyze it
   - You can ask questions about it

### What Agents Can Do With Files

#### For Documents:
- Summarize content
- Extract key points
- Answer questions about it
- Highlight important sections
- Create study guides

#### For Data Files:
- Analyze statistics
- Detect trends and patterns
- Generate visualizations
- Identify outliers
- Create reports

#### For Code Files:
- Debug issues
- Suggest improvements
- Generate tests
- Refactor code
- Add documentation

### File Tips

- **Clean data first:** Remove errors before uploading
- **Use PDF for documents:** Better formatting preservation
- **Use CSV for data:** Easier to analyze than Excel
- **Compress if large:** ZIP files before uploading
- **One topic per file:** Easier analysis if focused
- **Ask clearly:** "Analyze this data and tell me about trends"

---

## 7. Session Management

### What Are Sessions?

Sessions are conversations with your agents. Each session:
- Can contain many messages
- Involves one or more agents
- Can be resumed later
- Is saved automatically
- Has a title and creation time

**See:** [`session-management.svg`](./images/session-management.svg)

### Managing Sessions

#### Creating a New Session
```
1. Click "➕ New Session" (left sidebar)
2. Give session a title (optional)
3. Select starting agent (or skip)
4. Start chatting
```

**Keyboard shortcut:** Ctrl + N

#### Switching Between Sessions
```
1. Look at session tabs at top
2. Click different tab to switch
3. Conversation history loads
4. Continue chatting or scroll up to review
```

#### Viewing Session History
```
1. Look at "Session History" (left sidebar)
2. Sessions organized by date (Today, Yesterday, etc.)
3. Click session to open it
4. Shows message count and last active time
```

#### Exporting Sessions
```
1. Right-click on session
2. Click "Export"
3. Choose format: JSON, PDF, or TXT
4. File downloads to computer
```

#### Archiving Sessions
```
1. Right-click on session
2. Click "Archive"
3. Session moves to archive folder
4. Visible in "Archived Sessions" section
5. Can still be restored or exported
```

#### Deleting Sessions
```
⚠️ WARNING: This is permanent!
1. Right-click on session
2. Click "Delete"
3. Confirm deletion
4. Session is removed permanently
```

### Session Organization

**Keep tidy by:**
- Naming sessions descriptively
- Archiving old sessions monthly
- Exporting important ones
- Using one session per project
- Closing completed sessions

---

## 8. Customization & Settings

### Accessing Settings

**See:** [`customization-panel.svg`](./images/customization-panel.svg)

```
1. Click ⚙️ Settings (top-right or right sidebar)
2. Customization panel opens
3. Adjust any options
4. Click "Save Changes"
5. Settings apply immediately
```

### Response Format

#### Normal (Default)
- Balanced length responses
- Includes explanations
- Good for most tasks
- **Best for:** General questions

#### Concise
- Shorter, to-the-point
- Minimal explanations
- No examples unless asked
- **Best for:** Quick answers, when you're in a hurry

#### Detailed
- Comprehensive explanations
- Multiple examples
- Deep dive into topics
- **Best for:** Learning, understanding complex concepts

#### Step-by-Step
- Instructions in numbered steps
- One action per step
- Clear completion criteria
- **Best for:** Tutorials, how-to questions, procedures

### Communication Tone

| Tone | Style | Best For |
|------|-------|----------|
| **Professional** | Formal, business-like | Work documents, client communication |
| **Friendly** | Casual, conversational | Learning, casual questions |
| **Academic** | Formal, research-focused | Research papers, technical writing |
| **Creative** | Imaginative, flowing | Brainstorming, creative writing |
| **Technical** | Precise, jargon-heavy | Technical topics, detailed specs |

### Content Preferences

#### Toggle Options
- **Include Code Examples:** ON/OFF
- **Include Explanations:** ON/OFF  
- **Include Disclaimers:** ON/OFF
- **Highlight Key Points:** ON/OFF
- **Use Markdown Formatting:** ON/OFF

#### Select Options
- **Response Language:** English, Spanish, French, German, etc.
- **Code Syntax Highlighting:** ON/OFF
- **Data Retention:** 30 days, 90 days, 1 year, permanent
- **Analytics Tracking:** ON/OFF

### Theme Settings

#### Light Mode (Default)
- White background
- Dark text
- Easy on eyes during day
- High contrast for accessibility

#### Dark Mode
- Dark background
- Light text
- Reduces eye strain at night
- Better battery life on OLED screens

#### Custom Theme
- Create your own colors
- Save favorite combinations
- Switch between saved themes
- **Keyboard shortcut:** Y (toggle dark mode)

### Privacy & Security

- **Auto-save:** Enabled by default
- **Session Timeout:** 30 minutes of inactivity
- **Data Retention:** Configure in settings
- **Two-Factor Auth:** Optional (for extra security)
- **Password Change:** Available in account settings

### Reset to Defaults

Don't like your changes?
1. Click "⚙️ Settings"
2. Scroll to bottom
3. Click "Reset to Default"
4. Confirm action
5. All settings return to defaults

---

## 9. Tips & Best Practices

### Effective Prompting

#### DO ✅
```
✓ Be specific: "Write a Python function that takes a list 
  of integers and returns duplicates"
  
✓ Provide context: "I'm building a web app with React. 
  How should I handle state management?"
  
✓ Include examples: "I want output like this: {'name': 'John', 
  'age': 30}. Can you modify this code?"
  
✓ Ask follow-ups: "That helps! Can you explain the regex 
  pattern in more detail?"
```

#### DON'T ❌
```
✗ Vague: "Help with my code"
✗ No context: "How do I do this?"
✗ Too broad: "Explain everything about Python"
✗ Unclear: "Make it better"
```

### Using Agents Effectively

#### Choose Right Agent for Task

| Task | Best Agent |
|------|-----------|
| Code debugging | ALEX 🔧 |
| Data analysis | VORTEX 📊 |
| Planning strategy | NEXUS 🧠 |
| Finding information | RESEARCHER 🔍 |
| Hard to decide? | Start with NEXUS for overview |

#### Multi-Agent Approach
1. **Start with NEXUS:** "What's the best way to approach this?"
2. **Then to ALEX:** "Show me code for that approach"
3. **Then to VORTEX:** "Analyze these results for me"

### File Upload Best Practices

- **Clean your data** before uploading (remove empty rows/columns)
- **Use appropriate formats** (PDF for docs, CSV for data)
- **Upload focused files** (one topic per file when possible)
- **Ask specific questions** about what you want analyzed
- **Upload once, ask many questions** (don't re-upload)
- **For code files:** Include comments explaining context

### Session Management Tips

- **One project per session:** Keep related conversations together
- **Name sessions clearly:** "Logo Design Brainstorm" vs "Session 1"
- **Export important ones:** Save critical discussions
- **Archive monthly:** Keep your session list clean
- **Review before closing:** Make sure you got everything you need

### Performance Tips

- **Shorter messages:** Faster responses
- **Be specific:** Better quality answers
- **Shorter sessions:** Load faster if you have many messages
- **Export old sessions:** Speeds up your dashboard
- **Clear browser cache:** If experiencing slowness

---

## 10. Troubleshooting

### Connection Issues

#### Problem: "Not Connected" (red indicator)
**Solutions:**
1. Check your internet connection
2. Refresh the page (Ctrl + R or Cmd + R)
3. Check if Craftgent is up (try different browser)
4. Clear browser cookies and cache
5. Try incognito/private browsing mode
6. Wait 5 minutes and try again

#### Problem: Slow Responses
**Solutions:**
1. Check connection status (should show latency: ~25ms)
2. Close other browser tabs
3. Restart your browser
4. Try at a different time (server might be busy)
5. Check agent health (HP/MP) - if low, takes longer

### Chat Issues

#### Problem: Message Won't Send
**Solutions:**
1. Check internet connection
2. Verify message isn't empty
3. Try refreshing the page
4. Check browser console for errors
5. Try in a different browser
6. Contact support if still broken

#### Problem: Response is Empty or Timeout
**Solutions:**
1. Wait a few more seconds (sometimes takes longer)
2. Try a different question
3. Switch agents
4. Check if agent health (HP/MP) is low
5. Refresh and try again

#### Problem: Formatting Issues (Code Block Broken)
**Solutions:**
1. Ask agent to re-format
2. Copy from code block manually
3. Try different response format in settings
4. Ask for plain text instead
5. Report bug if consistently broken

### File Upload Issues

#### Problem: File Won't Upload
**Solutions:**
1. Check file size < 50MB
2. Verify file format is supported
3. Ensure file isn't corrupted
4. Try a smaller portion of the file
5. Use a different format (CSV instead of XLS)
6. Check browser file upload permissions

#### Problem: "File Format Not Supported"
**Solutions:**
1. Check against supported types list above
2. Convert file to supported format
   - DOC → PDF
   - XLS → CSV
   - TXT → PDF
3. Unzip if it's a ZIP
4. Ask support about specific formats

#### Problem: File Uploaded but Agent Can't Analyze
**Solutions:**
1. Ask agent clearer questions
2. Provide context ("This is sales data from Q4")
3. Try a different agent
4. Upload the file again
5. Try simpler analysis first

### Session Issues

#### Problem: Session Disappeared
**Solutions:**
1. Check session history (left sidebar)
2. Look in "Archived Sessions"
3. Check "Deleted Sessions" (30-day recovery period)
4. Sessions older than 30 days are auto-deleted
5. Always export before deleting

#### Problem: Can't Create New Session
**Solutions:**
1. Refresh the page
2. Try the keyboard shortcut: Ctrl + N
3. Clear browser cache
4. Close some open sessions first
5. Try logging out and back in

### Account Issues

#### Problem: Forgot Password
**Solutions:**
1. Click "Forgot Password" on login page
2. Enter your email
3. Check email for reset link
4. Click link and create new password
5. Login with new password

#### Problem: Can't Verify Email
**Solutions:**
1. Check spam/junk folder
2. Check if link expired (valid 24 hours)
3. Request new verification email
4. Check you're using correct email address
5. Contact support if link keeps expiring

#### Problem: Account Locked
**Solutions:**
1. Wait 15 minutes before trying again
2. Clear browser cookies
3. Try different browser
4. Check your email for security alert
5. Contact support if still locked

---

## Getting Help

### Quick Help
- **Need a shortcut?** → Check [Keyboard Shortcuts](#keyboard-shortcuts)
- **Lost?** → Go to [Navigation Tips](#navigation-tips)
- **Error message?** → Check [Troubleshooting](#10-troubleshooting)

### More Resources
- **Getting started?** → Read [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Feature overview?** → See [FEATURES_OVERVIEW.md](./FEATURES_OVERVIEW.md)
- **API developers?** → Check [README.md](../README.md)

### Still Need Help?
- Check the FAQ
- Review the [Troubleshooting](#10-troubleshooting) section
- Contact support
- Check system status page

---

**Last Updated:** January 2024
**Version:** 1.0

For feedback or suggestions, use the feedback button in settings or contact the development team.
