/**
 * App — root component with auth gate and routing (Phase 2+).
 *
 * On mount: tries to restore session via refresh token cookie.
 * Routes:
 *   / → LandingPage (public)
 *   /login → LoginScreen (public)
 *   /chat → Shell (protected, redirects to / if not authenticated)
 */
import { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore }       from '@/store/useAuthStore'
import { useAppStore }        from '@/store/useAppStore'
import { LoginScreen }        from '@/components/auth/LoginScreen'
import { LandingPage }        from '@/pages/LandingPage'
import { SkyBackground }      from '@/components/layout/SkyBackground'
import { TopBar }             from '@/components/layout/TopBar'
import { Hotbar }             from '@/components/layout/Hotbar'
import { AgentSidebar }       from '@/components/agents/AgentSidebar'
import { NotificationStack }  from '@/components/ui/NotificationStack'
import { SkeletonMessages }   from '@/components/ui/SkeletonMessage'

const ChatPanel = lazy(() => import('@/components/chat/ChatPanel').then(m => ({ default: m.ChatPanel })))
const TaskPanel = lazy(() => import('@/components/tasks/TaskPanel').then(m => ({ default: m.TaskPanel })))

/**
 * ProtectedRoute — guards /chat from unauthenticated access
 */
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? element : <Navigate to="/" replace />
}

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
      <NotificationStack />
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
          <Suspense fallback={<SkeletonMessages count={5} />}>
            <ChatPanel />
          </Suspense>
        </main>
        {/* Right sidebar - hidden on mobile */}
        {!isMobile && (
          <Suspense fallback={<div style={{ background: 'rgba(0,0,0,0.72)' }} />}>
            <TaskPanel />
          </Suspense>
        )}
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
                <Suspense fallback={<div />}>
                  <TaskPanel />
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function BootScreen() {
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

function AppRoutes() {
  const { tryRefresh } = useAuthStore()
  const [booting, setBooting] = useState(true)

  // On hard refresh: try to restore session from httpOnly refresh cookie
  useEffect(() => {
    tryRefresh().finally(() => setBooting(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (booting) return <BootScreen />

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/chat" element={<ProtectedRoute element={<Shell />} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
