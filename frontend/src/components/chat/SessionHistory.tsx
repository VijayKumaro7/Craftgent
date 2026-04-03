/**
 * SessionHistory — collapsible panel in AgentSidebar showing past sessions.
 * Clicking a session loads it into the chat via the /api/sessions/{id} endpoint.
 */
import { useState } from 'react'
import { useSessionList } from '@/hooks/useSessionList'
import { useAppStore }    from '@/store/useAppStore'
import { useAuthStore }   from '@/store/useAuthStore'
import { apiClient }      from '@/api/client'
import { SkeletonSessions } from '@/components/ui/SkeletonSession'

const AGENT_COLORS: Record<string, string> = {
  NEXUS:  '#55ffff',
  ALEX:   '#aaffaa',
  VORTEX: '#cc88ff',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function SessionHistory() {
  const [open, setOpen]   = useState(false)
  const [page, setPage]   = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, isError } = useSessionList(page)
  const { addSystemMessage, addSession } = useAppStore()
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) return null

  const loadSession = async (sessionId: string, agent: string) => {
    try {
      const { data: session } = await apiClient.get(`/api/sessions/${sessionId}`)
      // Restore session context into the store as a new tab
      const messages = session.messages ?? []
      addSession(sessionId, agent as ReturnType<typeof useAppStore.getState>['activeAgent'], messages)
      addSystemMessage(`[SERVER] Resumed session from ${timeAgo(session.created_at)}. ${messages.length} messages loaded.`)
      setOpen(false)
    } catch {
      addSystemMessage('[ERROR] Could not load session.')
    }
  }

  // Filter sessions by search query
  const filteredSessions = data?.sessions.filter(session =>
    session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.last_message?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    session.active_agent.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  return (
    <div className="border-t border-white/10">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-2 py-1.5 font-pixel text-[6px] text-chat-sys hover:bg-white/5 focus:outline-none"
      >
        <span>▶ PAST SESSIONS</span>
        <span className="text-white/40">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="flex flex-col max-h-[240px]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e3a transparent' }}>
          {/* Search input */}
          <div className="px-2 py-1.5 border-b border-white/10">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-black/40 border border-white/20 rounded px-1.5 py-0.5 font-terminal text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
              aria-label="Search sessions"
            />
          </div>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <SkeletonSessions count={3} />
            )}

            {isError && (
              <div className="px-2 py-3 font-pixel text-[5px] text-mc-redstone text-center">
                FAILED TO LOAD
              </div>
            )}

            {data?.sessions.length === 0 && (
              <div className="px-2 py-3 font-pixel text-[5px] text-white/30 text-center">
                NO PAST SESSIONS
              </div>
            )}

            {filteredSessions.length === 0 && searchQuery && (
              <div className="px-2 py-3 font-pixel text-[5px] text-white/30 text-center">
                NO MATCHES
              </div>
            )}

            {filteredSessions.map(session => (
            <button
              key={session.id}
              onClick={() => loadSession(session.id, session.active_agent)}
              className="w-full text-left px-2 py-2 border-b border-white/5 hover:bg-white/8 focus:outline-none group"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className="font-pixel text-[5px]"
                  style={{ color: AGENT_COLORS[session.active_agent] ?? '#fff' }}
                >
                  {session.active_agent}
                </span>
                <span className="font-pixel text-[4px] text-white/30">
                  {timeAgo(session.updated_at)}
                </span>
              </div>

              <div className="font-terminal text-[14px] text-white/70 leading-tight line-clamp-2 group-hover:text-white/90">
                {session.last_message ?? 'Empty session'}
              </div>

              <div className="font-pixel text-[4px] text-white/25 mt-0.5">
                {session.message_count} msg{session.message_count !== 1 ? 's' : ''}
              </div>
            </button>
            ))}
          </div>

          {/* Pagination */}
          {data && data.total > data.per_page && (
            <div className="flex justify-between px-2 py-1.5 border-t border-white/10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-pixel text-[5px] text-white/40 hover:text-white disabled:opacity-20 focus:outline-none"
              >
                ◀ PREV
              </button>
              <span className="font-pixel text-[4px] text-white/30">
                {page}/{Math.ceil(data.total / data.per_page)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(data.total / data.per_page)}
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
