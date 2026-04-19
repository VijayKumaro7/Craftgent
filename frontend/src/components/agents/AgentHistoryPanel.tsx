/**
 * AgentHistoryPanel — collapsible panel showing the active agent's past outputs.
 * Listed newest-first with truncated previews; click to expand full content.
 */
import { useState } from 'react'
import { useAgentHistory } from '@/hooks/useAgentHistory'
import { useAppStore }     from '@/store/useAppStore'
import { useAuthStore }    from '@/store/useAuthStore'
import type { AgentName }  from '@/types'

const AGENT_COLORS: Record<AgentName, string> = {
  NEXUS:      '#55ffff',
  ALEX:       '#aaffaa',
  VORTEX:     '#cc88ff',
  RESEARCHER: '#d4a574',
}

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function HistoryEntry({ content, tokenCount, createdAt }: {
  content:    string
  tokenCount: number
  createdAt:  string
}) {
  const [expanded, setExpanded] = useState(false)
  const preview = content.length > 120 ? content.slice(0, 120) + '…' : content

  return (
    <div className="border-b border-white/5 px-2 py-2">
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-pixel text-[4px] text-white/25">{timeAgo(createdAt)}</span>
        <span className="font-pixel text-[4px] text-white/20">{tokenCount} tok</span>
      </div>

      <p className="font-terminal text-[11px] text-white/70 leading-snug whitespace-pre-wrap break-words">
        {expanded ? content : preview}
      </p>

      {content.length > 120 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-1 font-pixel text-[4px] text-white/30 hover:text-white/60 focus:outline-none"
        >
          {expanded ? '▲ COLLAPSE' : '▼ EXPAND'}
        </button>
      )}
    </div>
  )
}

export function AgentHistoryPanel() {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const { activeAgent } = useAppStore()
  const { isAuthenticated } = useAuthStore()

  const { data, isLoading, isError } = useAgentHistory(activeAgent, page, 10)

  if (!isAuthenticated) return null

  const agentColor = AGENT_COLORS[activeAgent]
  const totalPages = data ? Math.ceil(data.total / data.per_page) : 1

  return (
    <div className="border-t border-white/10">
      {/* Toggle */}
      <button
        onClick={() => { setOpen(o => !o); setPage(1) }}
        className="w-full flex items-center justify-between px-2 py-1.5 font-pixel text-[6px] text-chat-sys hover:bg-white/5 focus:outline-none"
      >
        <span style={{ color: agentColor }}>▶ {activeAgent} HISTORY</span>
        <span className="text-white/40">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="flex flex-col max-h-[280px]">
          {/* Stats bar */}
          {data && (
            <div className="px-2 py-1 border-b border-white/10 font-pixel text-[4px] text-white/30 flex gap-3">
              <span>{data.total} output{data.total !== 1 ? 's' : ''} total</span>
              <span style={{ color: agentColor }}>■</span>
              <span>page {page}/{totalPages}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e3a transparent' }}>
            {isLoading && (
              <div className="px-2 py-4 text-center font-pixel text-[5px] text-white/30 animate-pulse">
                LOADING MEMORY…
              </div>
            )}

            {isError && (
              <div className="px-2 py-3 font-pixel text-[5px] text-mc-redstone text-center">
                FAILED TO LOAD
              </div>
            )}

            {data?.outputs.length === 0 && !isLoading && (
              <div className="px-2 py-4 font-pixel text-[5px] text-white/25 text-center leading-loose">
                <div>NO HISTORY YET</div>
                <div className="text-[4px] mt-1">Send a message to {activeAgent} first</div>
              </div>
            )}

            {data?.outputs.map(output => (
              <HistoryEntry
                key={output.id}
                content={output.content}
                tokenCount={output.token_count}
                createdAt={output.created_at}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && totalPages > 1 && (
            <div className="flex justify-between px-2 py-1.5 border-t border-white/10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-pixel text-[5px] text-white/40 hover:text-white disabled:opacity-20 focus:outline-none"
              >
                ◀ PREV
              </button>
              <span className="font-pixel text-[4px] text-white/30">
                {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="font-pixel text-[5px] text-white/40 hover:text-white disabled:opacity-20 focus:outline-none"
              >
                NEXT ▶
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
