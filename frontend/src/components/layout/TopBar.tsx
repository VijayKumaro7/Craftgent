import { useAppStore }  from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { CustomizationPanel } from './CustomizationPanel'

const STATUS_COLOR: Record<string, string> = {
  connected:    '#10b981',
  connecting:   '#f59e0b',
  disconnected: '#6b7280',
  error:        '#ef4444',
}

export function TopBar() {
  const { activeAgent, isStreaming } = useAppStore(s => ({
    activeAgent: s.activeAgent,
    isStreaming: s.isStreaming,
  }))
  const { username, logout } = useAuthStore(s => ({
    username: s.username,
    logout: s.logout,
  }))

  return (
    <header
      className="col-span-3 flex items-center justify-between px-4 glass-strong border-b border-border-subtle"
      style={{ height: 52, zIndex: 20 }}
    >
      {/* Left — brand + status */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md btn-gradient flex items-center justify-center text-xs font-bold text-white shadow-glow-sm">
          CG
        </div>
        <span className="text-text-primary font-semibold text-sm">Craftgent</span>
        <span className="text-border-default text-xs">|</span>
        <span className="text-text-muted text-xs">v0.2.0</span>

        {isStreaming && (
          <span className="flex items-center gap-1.5 text-accent-hover text-xs animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-primary inline-block" />
            {activeAgent} is thinking…
          </span>
        )}
      </div>

      {/* Right — user + controls */}
      <div className="flex items-center gap-1">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20 mr-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: STATUS_COLOR.connected }}
          />
          <span className="text-success text-xs font-medium">Online</span>
        </div>

        {username && (
          <span className="text-text-secondary text-xs mr-1 hidden sm:block">
            {username}
          </span>
        )}

        <CustomizationPanel />

        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-lg text-text-muted text-xs hover:text-error hover:bg-error/10 transition-all duration-200"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
