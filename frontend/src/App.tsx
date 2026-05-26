/**
 * App — root component with auth gate and routing (Phase 2+).
 *
 * On mount: tries to restore session via refresh token cookie.
 * Routes:
 *   / → LandingPage (public)
 *   /login → LoginScreen (public)
 *   /chat → Shell (protected, redirects to / if not authenticated)
 */
import React, { useEffect, useState, lazy, Suspense } from 'react'
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
import { ReportPage }         from '@/pages/ReportPage'

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
      { msg: '[SERVER] Craftgent v0.2.0 — online.',                                          delay: 400  },
      { msg: `[SERVER] Welcome back, ${username ?? 'Operator'}!`,                            delay: 900  },
      { msg: '[SERVER] 3 agents ready. LangGraph routing active.',                           delay: 1500 },
      { msg: 'NEXUS: Hello! I can delegate to ALEX (code) or VORTEX (data). How can I help?', delay: 2400 },
    ]
    seq.forEach(({ msg, delay }) => setTimeout(() => addSystemMessage(msg), delay))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SkyBackground />
      <NotificationStack />
      <div
        className="relative h-screen animate-fade-in"
        style={{
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '220px 1fr 232px',
          gridTemplateRows: isMobile ? '52px 1fr 60px 120px' : '52px 1fr 60px',
        }}
      >
        <TopBar />
        {!isMobile && <AgentSidebar />}
        <main className="relative overflow-hidden">
          <Suspense fallback={<SkeletonMessages count={5} />}>
            <ChatPanel />
          </Suspense>
        </main>
        {!isMobile && (
          <Suspense fallback={<div className="bg-bg-secondary" />}>
            <TaskPanel />
          </Suspense>
        )}
        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <Hotbar />
        </div>
        {isMobile && (
          <div
            style={{ gridColumn: '1 / -1' }}
            className="bg-bg-secondary border-t border-border-subtle overflow-hidden"
          >
            <div className="flex h-full">
              <div className="flex-1 overflow-y-auto"><AgentSidebar /></div>
              <div className="flex-1 overflow-y-auto border-l border-border-subtle">
                <Suspense fallback={<div />}><TaskPanel /></Suspense>
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
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{ zIndex: 20 }}>
        <div className="gradient-text font-semibold text-2xl animate-pulse">Craftgent</div>
        <div
          className="w-8 h-8 rounded-full border-2"
          style={{
            borderColor: 'rgba(99,102,241,0.3)',
            borderTopColor: '#6366f1',
            animation: 'spinSlow 1s linear infinite',
          }}
        />
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
      <Route path="/reports/:sessionId" element={<ProtectedRoute element={<ReportPage />} />} />
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
