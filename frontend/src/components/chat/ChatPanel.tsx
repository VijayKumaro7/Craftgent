/**
 * ChatPanel — main chat area (Phase 2 version).
 * Uses useWebSocket() instead of SSE streamChat().
 */
import { useRef, useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useWebSocket, type WsStatus } from '@/hooks/useWebSocket'
import { VirtualizedMessageList } from './VirtualizedMessageList'
import { TypingIndicator } from './TypingIndicator'
import { SessionTabs } from './SessionTabs'
import { FileUpload } from './FileUpload'
import type { UploadedFile } from '@/hooks/useFileUpload'

function StatusPill({ status }: { status: WsStatus }) {
  const cfg: Record<WsStatus, { color: string; label: string }> = {
    connected:    { color: '#5aff5a', label: 'ONLINE'       },
    connecting:   { color: '#f5c842', label: 'CONNECTING...' },
    disconnected: { color: '#888',    label: 'OFFLINE'      },
    error:        { color: '#e02020', label: 'ERROR'        },
  }
  const { color, label } = cfg[status]
  return (
    <div className="flex items-center gap-1 px-2 border-r-2 border-white/10 flex-shrink-0">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="font-pixel text-[5px]" style={{ color }}>{label}</span>
    </div>
  )
}

export function ChatPanel() {
  const { messages, addSystemMessage, addUserMessage, clearMessages, isStreaming, activeAgent, inputValue, setInputValue } = useAppStore()
  const { status, send } = useWebSocket()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showFileUpload, setShowFileUpload] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleCommand = (cmd: string) => {
    const c = cmd.toLowerCase().trim()
    if (c === '/clear')       clearMessages()
    else if (c === '/help')   addSystemMessage('/clear  /help  /agents')
    else if (c === '/agents') addSystemMessage('NEXUS (Research) · ALEX (Code) · VORTEX (Data)')
    else                      addSystemMessage(`Unknown command: ${cmd}`)
  }

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isStreaming) return
    if (trimmed.startsWith('/')) { handleCommand(trimmed); setInputValue(''); return }

    let messageContent = trimmed
    // Append file references if any
    if (uploadedFiles.length > 0) {
      const fileRefs = uploadedFiles
        .map(f => `[${f.name}](file://${f.token || f.url || f.id})`)
        .join(' ')
      messageContent = `${trimmed}\n\n${fileRefs}`
      setUploadedFiles([])
      setShowFileUpload(false)
    }

    addUserMessage(messageContent)
    setInputValue('')
    send(messageContent)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const canSend = inputValue.trim().length > 0 && !isStreaming && status === 'connected'

  return (
    <div className="flex flex-col h-full">
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,.015) 0,rgba(255,255,255,.015) 1px,transparent 1px,transparent 32px),repeating-linear-gradient(0deg,rgba(255,255,255,.015) 0,rgba(255,255,255,.015) 1px,transparent 1px,transparent 32px)',
      }} />

      <div className="relative z-10">
        <SessionTabs />
      </div>

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.55)' }}>
        <VirtualizedMessageList messages={messages} isStreaming={isStreaming} />
        {isStreaming && <TypingIndicator agentName={activeAgent} />}
      </div>

      {/* File upload panel */}
      {showFileUpload && (
        <div className="relative z-10 px-3 py-2 border-t-2 border-white/10" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <FileUpload onFilesSelected={setUploadedFiles} />
        </div>
      )}

      <div className="relative z-10 flex items-stretch h-9 border-t-[3px] border-black/80" style={{ background: 'rgba(0,0,0,0.72)' }}>
        <StatusPill status={status} />
        <button
          onClick={() => setShowFileUpload(!showFileUpload)}
          className="flex items-center px-2 border-r-2 border-white/10 font-pixel text-[5px] text-chat-sys hover:bg-white/5 focus:outline-none transition-colors"
          title="Toggle file upload"
          aria-label="Upload file"
        >
          📎 {uploadedFiles.length > 0 && <span className="ml-1 text-white/70">{uploadedFiles.length}</span>}
        </button>
        <div className="flex items-center px-2 border-r-2 border-white/10">
          <span className="font-pixel text-[8px] text-chat-sys">T›</span>
        </div>
        <input ref={inputRef} type="text" value={inputValue}
          onChange={e => setInputValue(e.target.value)} onKeyDown={handleKey}
          disabled={isStreaming || status !== 'connected'}
          placeholder={isStreaming ? 'Agent is thinking...' : status !== 'connected' ? 'Connecting...' : 'Press T to chat... /help for commands'}
          className="flex-1 bg-transparent border-none outline-none font-terminal text-[20px] text-white placeholder:text-white/30 px-3 caret-chat-agent"
          aria-label="Chat input"
        />
        <button onClick={handleSend} disabled={!canSend}
          className={`px-3 md:px-4 py-2 font-pixel text-[6px] text-white border-l-[3px] border-black/60 focus:outline-none transition-all active:scale-95 ${canSend ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-40'}`}
          style={{ background: canSend ? '#5d9e32' : '#444', minHeight: '2.5rem' }}
          aria-label="Send message"
        >SEND ▶</button>
      </div>
    </div>
  )
}
