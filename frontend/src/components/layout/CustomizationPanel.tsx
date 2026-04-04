/**
 * CustomizationPanel — collapsible settings for response customization
 * Shows dropdowns for response format, tone, code language, output language
 */
import { useState } from 'react'
import { usePreferencesStore } from '@/store/usePreferencesStore'

export function CustomizationPanel() {
  const [open, setOpen] = useState(false)
  const {
    responseFormat, setResponseFormat,
    tone, setTone,
    codeLanguage, setCodeLanguage,
    outputLanguage, setOutputLanguage,
  } = usePreferencesStore()

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 border-r-2 border-white/10 h-full font-pixel text-[5px] text-chat-sys hover:bg-white/5 focus:outline-none transition-colors"
        aria-label="Customization settings"
      >
        <span>⚙</span>
        <span className="text-white/60">{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full right-0 mt-0.5 bg-black/90 border-2 border-white/20 rounded shadow-lg z-50 min-w-[280px]" style={{ background: 'rgba(0,0,0,0.92)' }}>
          <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
            {/* Response Format */}
            <div className="border-b border-white/10 pb-2">
              <label className="block font-pixel text-[5px] text-white/70 mb-1">
                RESPONSE FORMAT
              </label>
              <select
                value={responseFormat}
                onChange={(e) => setResponseFormat(e.target.value as any)}
                className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 font-terminal text-[11px] text-white focus:outline-none focus:border-white/40 focus:bg-black/80"
              >
                <option value="detailed">Detailed</option>
                <option value="brief">Brief</option>
                <option value="code-only">Code Only</option>
              </select>
            </div>

            {/* Tone */}
            <div className="border-b border-white/10 pb-2">
              <label className="block font-pixel text-[5px] text-white/70 mb-1">
                TONE
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 font-terminal text-[11px] text-white focus:outline-none focus:border-white/40 focus:bg-black/80"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="eli5">ELI5</option>
              </select>
            </div>

            {/* Code Language */}
            <div className="border-b border-white/10 pb-2">
              <label className="block font-pixel text-[5px] text-white/70 mb-1">
                CODE LANGUAGE
              </label>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value as any)}
                className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 font-terminal text-[11px] text-white focus:outline-none focus:border-white/40 focus:bg-black/80"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>

            {/* Output Language */}
            <div>
              <label className="block font-pixel text-[5px] text-white/70 mb-1">
                OUTPUT LANGUAGE
              </label>
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value as any)}
                className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 font-terminal text-[11px] text-white focus:outline-none focus:border-white/40 focus:bg-black/80"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>

            {/* Current settings preview */}
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="font-pixel text-[4px] text-white/50 space-y-0.5">
                <div>📝 {responseFormat}</div>
                <div>💬 {tone}</div>
                <div>{'{'}{codeLanguage}{'}'}</div>
                <div>🌐 {outputLanguage}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
