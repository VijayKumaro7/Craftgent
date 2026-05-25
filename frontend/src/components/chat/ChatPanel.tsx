import React, { useRef, useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useWebSocket, type WsStatus } from '@/hooks/useWebSocket'
import { VirtualizedMessageList } from './VirtualizedMessageList'
import { TypingIndicator } from './TypingIndicator'
import { SessionTabs } from './SessionTabs'
import { FileUpload } from './FileUpload'
import { ExportButton } from '../report/ExportButton'
import type { UploadedFile } from '@/hooks/useFileUpload'

const STATUS_CONFIG: Record<WsStatus, { color: string; label: string; pulse: boolean }> = {
  connected:    { color: '#059669', label: 'Connected',    pulse: false },
  connecting:   { color: '#f97316', label: 'Connecting…',  pulse: true  },
  disconnected: { color: '#64748b', label: 'Offline',      pulse: false },
  error:        { color: '#dc2626', label: 'Error',        pulse: false },
}

function StatusDot({ status }: { status: WsStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div className="flex items-center gap-1.5 px-3 flex-shrink-0">
      <span
        className={`w-2 h-2 rounded-full inline-block ${cfg.pulse ? 'animate-pulse' : ''}`}
        style={{ background: cfg.color }}
      />
      <span className="text-text-muted text-xs">{cfg.label}</span>
    </div>
  )
}

export function ChatPanel() {
  const {
    messages, addSystemMessage, addUserMessage, clearMessages,
    isStreaming, activeAgent, inputValue, setInputValue, sessionId,
  } = useAppStore(s => ({
    messages:        s.messages,
    addSystemMessage: s.addSystemMessage,
    addUserMessage:  s.addUserMessage,
    clearMessages:   s.clearMessages,
    isStreaming:     s.isStreaming,
    activeAgent:     s.activeAgent,
    inputValue:      s.inputValue,
    setInputValue:   s.setInputValue,
    sessionId:       s.sessionId,
  }))
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
    else if (c === '/help')   addSystemMessage('Commands: /clear  /help  /agents')
    else if (c === '/agents') addSystemMessage('NEXUS · ALEX · VORTEX · RESEARCHER')
    else                      addSystemMessage(`Unknown command: ${cmd}`)
  }

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isStreaming) return
    if (trimmed.startsWith('/')) { handleCommand(trimmed); setInputValue(''); return }

    let content = trimmed
    if (uploadedFiles.length > 0) {
      const refs = uploadedFiles.map(f => `[${f.name}](file://${f.token || f.url || f.id})`).join(' ')
      content = `${trimmed}\n\n${refs}`
      setUploadedFiles([])
      setShowFileUpload(false)
    }

    addUserMessage(content)
    setInputValue('')
    send(content)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const canSend = inputValue.trim().length > 0 && !isStreaming && status === 'connected'

  return (
    <div className="flex flex-col h-full">
      {/* Session tabs */}
      <div className="flex-shrink-0 border-b border-border-subtle">
        <SessionTabs />
      </div>

      {/* Message area */}
      <div ref={scrollRef} className="flex-1 overflow-hidden">
        <VirtualizedMessageList messages={messages} isStreaming={isStreaming} />
        {isStreaming && <TypingIndicator agentName={activeAgent} />}
      </div>

      {/* File upload panel */}
      {showFileUpload && (
        <div className="px-4 py-3 border-t border-border-default bg-bg-secondary">
          <FileUpload onFilesSelected={setUploadedFiles} />
        </div>
      )}

      {/* Export report button */}
      {messages.length > 0 && sessionId && (
        <div className="px-4 py-3 border-t border-border-default bg-bg-secondary flex justify-end">
          <ExportButton sessionId={sessionId} />
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-t border-border-default bg-bg-secondary flex-shrink-0"
        style={{ minHeight: 56 }}
      >
        <StatusDot status={status} />

        {/* File upload toggle */}
        <button
          onClick={() => setShowFileUpload(!showFileUpload)}
          className={`p-2 rounded-lg text-sm transition-all duration-200 flex-shrink-0 ${
            showFileUpload || uploadedFiles.length > 0
              ? 'text-accent-hover bg-accent-primary/20'
              : 'text-text-muted hover:text-text-primary hover:bg-white/5'
          }`}
          title="Attach file"
          aria-label="Toggle file upload"
        >
          📎{uploadedFiles.length > 0 && <span className="ml-1 text-xs">{uploadedFiles.length}</span>}
        </button>

        {/* Agent label */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
          style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary inline-block" />
          {activeAgent}
        </div>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={isStreaming || status !== 'connected'}
          placeholder={
            isStreaming
              ? `${activeAgent} is thinking…`
              : status !== 'connected'
              ? 'Connecting…'
              : 'Ask anything… or /help for commands'
          }
          className="flex-1 bg-transparent border-none outline-none text-text-primary text-sm placeholder:text-text-muted"
          aria-label="Chat input"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            canSend
              ? 'btn-gradient text-white shadow-md hover:shadow-lg active:scale-95'
              : 'bg-bg-elevated text-text-muted cursor-not-allowed opacity-50'
          }`}
          aria-label="Send message"
        >
          Send →
        </button>
      </div>
    </div>
  )
}
