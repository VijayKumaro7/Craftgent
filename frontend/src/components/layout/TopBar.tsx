/**
 * TopBar — Phase 2. Adds username display and logout.
 */
import { useAppStore }  from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTheme } from './ThemeProvider'
import { CustomizationPanel } from './CustomizationPanel'

export function TopBar() {
  const { activeAgent, isStreaming } = useAppStore()
  const { username, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="col-span-3 flex items-center justify-between px-3 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg,#5d9e32 0%,#4a7e28 60%,#3e6b1f 100%)',
        borderBottom: '4px solid #2a4a12',
        boxShadow: '0 4px 0 #2a4a12, inset 0 1px 0 #7acc40',
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent 0,transparent 7px,rgba(0,0,0,0.06) 7px,rgba(0,0,0,0.06) 8px)' }} />

      <div className="flex items-center gap-2 z-10">
        <span className="font-pixel text-[9px] text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]">⛏ CRAFTGENT</span>
        <span className="font-pixel text-[6px] px-1.5 py-0.5" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}>v0.2.0</span>
        {isStreaming && (
          <span className="font-pixel text-[5px] text-yellow-300 animate-pulse drop-shadow-[1px_1px_0_#000]">▶ {activeAgent} THINKING...</span>
        )}
      </div>

      <div className="flex gap-0.5 z-10">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="text-[13px] leading-none">{i < 8 ? '❤️' : '🖤'}</span>
        ))}
      </div>

      <div className="flex items-center gap-0.5 z-10 h-full">
        {username && <span className="font-pixel text-[5px] text-white/80 px-2">👤 {username}</span>}
        <span className="inline-block w-2 h-2 rounded-full bg-[#5aff5a] animate-[blink_1s_steps(1)_infinite]" />
        <span className="font-pixel text-[5px] text-white px-2">ONLINE</span>
        <CustomizationPanel />
        <button onClick={toggleTheme}
          className="font-pixel text-[5px] text-white/60 px-2 border-r-2 border-white/10 h-full hover:text-white hover:bg-black/30 focus:outline-none"
          title={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? '☀️' : '🌙'} {theme.toUpperCase()}
        </button>
        <button onClick={logout}
          className="font-pixel text-[5px] text-white/60 px-2 h-full hover:text-white hover:bg-black/30 focus:outline-none">
          LOGOUT ✕
        </button>
      </div>
    </header>
  )
}
