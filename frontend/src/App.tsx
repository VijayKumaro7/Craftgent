/**
 * App — root component with auth gate (Phase 2).
 *
 * On mount: tries to restore session via refresh token cookie.
 * If not authenticated: shows LoginScreen.
 * If authenticated: shows the full Minecraft UI shell.
 */
import { useEffect, useState } from 'react'
import { useAuthStore }       from '@/store/useAuthStore'
import { useAppStore }        from '@/store/useAppStore'
import { LoginScreen }        from '@/components/auth/LoginScreen'
import { SkyBackground }      from '@/components/layout/SkyBackground'
import { TopBar }             from '@/components/layout/TopBar'
import { Hotbar }             from '@/components/layout/Hotbar'
import { AgentSidebar }       from '@/components/agents/AgentSidebar'
import { ChatPanel }          from '@/components/chat/ChatPanel'
import { TaskPanel }          from '@/components/tasks/TaskPanel'

function Shell() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const addSystemMessage = useAppStore(s => s.addSystemMessage)
  const { username }     = useAuthStore()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const seq = [
      { msg: '[SERVER] CraftAgent v0.2.0 — Phase 2 online.', delay: 400  },
      { msg: `[SERVER] Welcome back, ${username ?? 'Operator'}!`,  delay: 900  },
      { msg: '[SERVER] 3 agents joined the game. LangGraph routing active.', delay: 1500 },
      { msg: 'NEXUS: Greetings! I can delegate to ALEX (code) or VORTEX (data). What shall we craft?', delay: 2400 },
    ]
    seq.forEach(({ msg, delay }) => setTimeout(() => addSystemMessage(msg), delay))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SkyBackground />
      <div className="scanlines fixed inset-0 pointer-events-none" style={{ zIndex: 9995 }} />
      <div className="relative h-screen" style={{
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '200px 1fr 224px',
        gridTemplateRows: isMobile ? '44px 1fr 68px 68px' : '44px 1fr 68px',
        border: '3px solid rgba(255,255,255,0.15)',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.8)',
      }}>
        <TopBar />
        {/* Left sidebar - hidden on mobile */}
        {!isMobile && <AgentSidebar />}
        <main className="relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.0)' }}>
          <ChatPanel />
        </main>
        {/* Right sidebar - hidden on mobile */}
        {!isMobile && <TaskPanel />}
        {/* Bottom bar spans full width on mobile */}
        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto', gridRow: isMobile ? 'auto' : 'auto' }}>
          <Hotbar />
        </div>
        {/* Mobile bottom navigation for sidebars */}
        {isMobile && (
          <div style={{ gridColumn: '1 / -1', gridRow: 'auto', background: 'rgba(0,0,0,0.72)', borderTop: '3px solid rgba(255,255,255,0.15)', overflow: 'y-auto' }}>
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <AgentSidebar />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', borderLeft: '3px solid rgba(255,255,255,0.15)' }}>
                <TaskPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function App() {
  const { isAuthenticated, tryRefresh } = useAuthStore()
  const [booting, setBooting] = useState(true)

  // On hard refresh: try to restore session from httpOnly refresh cookie
  useEffect(() => {
    tryRefresh().finally(() => setBooting(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (booting) {
    return (
      <>
        <SkyBackground />
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
          <div className="font-pixel text-[10px] text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] animate-pulse">
            ⛏ LOADING...
          </div>
        </div>
      </>
    )
  }

  return isAuthenticated ? <Shell /> : <LoginScreen />
}
