/**
 * SessionTabs — tab bar showing open sessions
 * Allows switching between sessions and closing them
 */
import { useAppStore } from '@/store/useAppStore'

const AGENT_COLORS: Record<string, string> = {
  NEXUS:  '#55ffff',
  ALEX:   '#aaffaa',
  VORTEX: '#cc88ff',
}

export function SessionTabs() {
  const { openSessions, sessionId, switchSession, closeSession } = useAppStore()

  if (openSessions.length === 0) return null

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/10 overflow-x-auto scrollbar-hide" style={{ background: 'rgba(0,0,0,0.5)' }}>
      {openSessions.map((tab) => {
        const isActive = tab.id === sessionId
        const agentColor = AGENT_COLORS[tab.agent] ?? '#fff'
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-terminal flex-shrink-0 transition-all ${
              isActive
                ? 'border-white/40 bg-white/15'
                : 'border-white/10 bg-white/5 hover:bg-white/8 cursor-pointer'
            }`}
          >
            <button
              onClick={() => switchSession(tab.id)}
              className="flex items-center gap-1 focus:outline-none"
            >
              <span style={{ color: agentColor }} className="font-pixel text-[6px]">
                {tab.agent}
              </span>
              <span className="text-white/60">
                {tab.messages.length} msg{tab.messages.length !== 1 ? 's' : ''}
              </span>
            </button>
            <button
              onClick={() => closeSession(tab.id)}
              className="ml-1 text-white/40 hover:text-white/70 focus:outline-none transition-colors px-0.5"
              aria-label={`Close session ${tab.id}`}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
