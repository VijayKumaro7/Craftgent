import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore }  from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { CustomizationPanel } from './CustomizationPanel'
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup'
import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun, ShieldCheck, Home } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  connected:    '#059669',
  connecting:   '#f97316',
  disconnected: '#64748b',
  error:        '#dc2626',
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
  const { theme, toggleTheme } = useTheme()
  const [show2fa, setShow2fa] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <header
      className="col-span-3 flex items-center justify-between px-4 bg-bg-secondary border-b border-border-default"
      style={{ height: 52, zIndex: 20 }}
    >
      {/* Left — brand + status */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md btn-gradient flex items-center justify-center text-xs font-bold text-white">
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
      <div className="flex items-center gap-2">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: STATUS_COLOR.connected }}
          />
          <span className="text-success text-xs font-medium">Online</span>
        </div>

        {username && (
          <span className="text-text-secondary text-xs hidden sm:block">
            {username}
          </span>
        )}

        {/* Home — back to landing page */}
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
          title="Home page"
        >
          <Home className="w-4 h-4" />
        </button>

        <CustomizationPanel />

        {/* 2FA settings */}
        <button
          onClick={() => setShow2fa(true)}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
          title="Two-factor authentication"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 rounded-lg text-text-muted text-xs hover:text-error hover:bg-error/10 transition-all duration-200"
        >
          Sign out
        </button>
      </div>

      {show2fa && <TwoFactorSetup onClose={() => setShow2fa(false)} />}
    </header>
  )
}
