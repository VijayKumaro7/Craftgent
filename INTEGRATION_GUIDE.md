# CraftAgent Integration Guide

Quick reference for using newly created assets and components.

---

## 🖼️ Using Agent Avatars

### Method 1: PNG Images (Recommended for new components)
```tsx
import { AgentAvatar } from '@/components/ui/AgentAvatar'

export function MyComponent() {
  return (
    <div className="flex gap-2">
      <AgentAvatar agent="NEXUS" size={64} />
      <AgentAvatar agent="ALEX" size={32} />
      <AgentAvatar agent="VORTEX" size={48} />
      <AgentAvatar agent="RESEARCHER" size={32} />
    </div>
  )
}
```

### Method 2: Direct Asset Path
```tsx
import { AGENT_AVATARS } from '@/constants/assets'

export function AgentCard() {
  return (
    <img 
      src={AGENT_AVATARS.NEXUS} 
      alt="NEXUS" 
      width={64}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
```

### Method 3: Canvas Pixel Head (Existing, still works)
```tsx
import { PixelHead } from '@/components/ui/PixelHead'

export function OldMethod() {
  return <PixelHead agent="NEXUS" size={32} />
}
```

---

## 🎨 Using Assets

### Status Indicators
```tsx
import { getStatusIndicator } from '@/constants/assets'

// Usage
const statusIcon = getStatusIndicator('online')  // "/assets/status/online.png"
const busyIcon = getStatusIndicator('busy')      // "/assets/status/busy.png"

<img src={getStatusIndicator('online')} width={32} />
```

### Category Badges
```tsx
import { getCategoryBadge } from '@/constants/assets'

// Usage
const knowledgeBadge = getCategoryBadge('knowledge')
const utilityBadge = getCategoryBadge('utility')

<img src={getCategoryBadge('analysis')} width={48} />
```

### UI Icons
```tsx
import { UI_ICONS } from '@/constants/assets'

// Usage
<img src={UI_ICONS.UPLOAD} width={64} />
<img src={UI_ICONS.SETTINGS} width={32} />
<img src={UI_ICONS.DELETE} width={32} />
```

---

## 🎨 Using Colors

### Get Agent Color
```tsx
import { getAgentColor, AGENT_COLORS } from '@/constants/colors'

// Dynamic usage
const nexusColor = getAgentColor('NEXUS')
const alexColor = getAgentColor('ALEX')

// Or direct access
const primaryColor = AGENT_COLORS.NEXUS.primary      // "#1E90FF"
const secondaryColor = AGENT_COLORS.ALEX.secondary   // "#90EE90"

// Apply in component
<div style={{ borderColor: getAgentColor('NEXUS').primary }}>
  Styled content
</div>
```

### Category Colors
```tsx
import { getCategoryColor, CATEGORY_COLORS } from '@/constants/colors'

// Dynamic usage
const categoryColor = getCategoryColor('knowledge')
<span style={{ color: getCategoryColor('utility') }}>Utility</span>

// Direct access
const infoColor = CATEGORY_COLORS.analysis  // "#8A2BE2"
```

### Status Colors
```tsx
import { STATUS_COLORS } from '@/constants/colors'

// All status colors available
const onlineColor = STATUS_COLORS.online    // "#32CD32"
const busyColor = STATUS_COLORS.busy        // "#DC143C"
```

---

## 📋 Integration Checklist

### ChatMessage Component
```tsx
// Before: Just text sender
<div>NEXUS: Hello</div>

// After: Add avatar
import { AgentAvatar } from '@/components/ui/AgentAvatar'

<div className="flex gap-2">
  <AgentAvatar agent={msg.agent} size={32} />
  <div>
    <div>{msg.agent}: {timestamp}</div>
    <div>{msg.content}</div>
  </div>
</div>
```

### FileUpload Component
```tsx
// Replace emoji icons with PNG images
const getFileIcon = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const iconMap = {
    pdf: UI_ICONS.FILE,
    json: UI_ICONS.FILE,
    csv: UI_ICONS.FILE,
    // ... etc
  }
  return iconMap[ext] || UI_ICONS.FILE
}

// Usage
<img 
  src={getFileIcon(file.name)} 
  width={24}
  alt="file type"
/>
```

### AgentSidebar
```tsx
// Add status indicator
import { getStatusIndicator } from '@/constants/assets'

<div className="relative">
  <PixelHead agent={name} size={32} />
  <img 
    src={getStatusIndicator('online')} 
    width={16}
    className="absolute bottom-0 right-0"
    alt="online"
  />
</div>
```

### TemplatesPanel
```tsx
// Add category badges
import { getCategoryBadge } from '@/constants/assets'

templates.map(template => (
  <div key={template.id} className="flex gap-2">
    <img 
      src={getCategoryBadge(template.category)} 
      width={24} 
      alt={template.category}
    />
    <span>{template.name}</span>
  </div>
))
```

---

## 🔗 File Upload Integration

### Current Status
✅ Backend endpoint: `POST /api/upload` ready
✅ Frontend hook: `useFileUpload()` configured
✅ UI component: `FileUpload.tsx` functional

### How It Works
```tsx
import { FileUpload } from '@/components/chat/FileUpload'

export function ChatArea() {
  const handleFilesSelected = (files) => {
    // Files contain: id, name, size, type, token
    files.forEach(file => {
      console.log(`Uploaded: ${file.name} (${file.size} bytes)`)
      // Use file.id or file.token to reference in messages
    })
  }

  return (
    <FileUpload 
      onFilesSelected={handleFilesSelected}
      maxFiles={5}
    />
  )
}
```

### Expected Response
```json
{
  "file_id": "uuid-string",
  "filename": "original-name.pdf",
  "file_type": "pdf",
  "file_size": 102400,
  "session_id": "uuid-string",
  "upload_time": "2026-04-06T12:34:56Z"
}
```

---

## 🧪 Testing the Integration

### Test File Upload
```bash
# Upload a test file
curl -X POST http://localhost:8000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "session_id=your-session-uuid"

# Response should include file_id
```

### Test Image Loading
Visit `http://localhost:5173/assets/agents/nexus.png` in browser to verify images are accessible.

### Test Component Rendering
```tsx
// In browser console
import { AgentAvatar } from '@/components/ui/AgentAvatar'
// If no errors, the import works correctly
```

---

## 🎯 Priority Implementation Order

### High (Required for functionality)
1. ✅ File upload backend endpoint working
2. ✅ File upload frontend hook configured
3. ⏳ Test file upload end-to-end
4. ⏳ Integrate AgentAvatar into ChatMessage

### Medium (Improves UX)
5. ⏳ Add status indicators to AgentSidebar
6. ⏳ Use category badges in TemplatesPanel
7. ⏳ Replace emoji with PNG icons in FileUpload

### Nice-to-Have (Polish)
8. ⏳ Add agent color borders in message bubbles
9. ⏳ Animate status indicators
10. ⏳ Create stats display component

---

## 📚 Asset Specifications

### Pixel Art Standards
- **Agent Avatars**: 256×256px, 4-color palette, transparent background
- **UI Icons**: 64×64px, single color, transparent background
- **Status Indicators**: 32×32px, circular design, transparent background
- **Category Badges**: 48×48px, square design, transparent background

### Rendering Quality
- Use `style={{ imageRendering: 'pixelated' }}` for crisp rendering
- All images are PNG with transparency support
- No smoothing/anti-aliasing (pure pixel art aesthetic)

### File Sizes
```
agents/nexus.png       ~3.2 KB
agents/alex.png        ~3.0 KB
agents/vortex.png      ~3.5 KB
agents/researcher.png  ~3.3 KB
icons/upload.png       ~0.8 KB
icons/settings.png     ~0.7 KB
icons/chat.png         ~0.6 KB
icons/file.png         ~0.8 KB
icons/delete.png       ~0.7 KB
status/online.png      ~0.5 KB
status/offline.png     ~0.4 KB
status/busy.png        ~0.6 KB
categories/*.png       ~0.4 KB each
```

---

## 🔍 Troubleshooting

### Images Not Loading
```tsx
// Check image path
console.log(AGENT_AVATARS.NEXUS) // Should be "/assets/agents/nexus.png"

// Ensure public folder is served
// Check vite.config.ts for publicDir configuration
```

### Style Not Applied
```tsx
// Make sure to import Tailwind classes or use inline styles
className="border-2 border-black/50 shadow-[2px_2px_0_rgba(0,0,0,0.6)]"
// OR
style={{ imageRendering: 'pixelated', width: size, height: size }}
```

### Component Not Found
```tsx
// Verify path is correct
import { AgentAvatar } from '@/components/ui/AgentAvatar'
// NOT from '@/components/AgentAvatar'
```

---

## 🚀 Performance Tips

- Use `loading="lazy"` attribute on images
- Memoize color calculations if used frequently
- Consider generating sprites for multiple small icons
- Use CSS for simple icon animations instead of JavaScript

---

## 📞 Questions?

Refer to PHASE_PROGRESS.md for detailed documentation of what's been completed and what's planned.
