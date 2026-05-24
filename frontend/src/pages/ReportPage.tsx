import React from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { ReportPanel } from '@/components/report/ReportPanel'
import { SkyBackground } from '@/components/layout/SkyBackground'
import { TopBar } from '@/components/layout/TopBar'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { isAuthenticated } = useAuthStore()
  const [messages, setMessages] = React.useState<Array<{ role: string; content: string }>>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!sessionId || !isAuthenticated) return

    const fetchSessionMessages = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('Session not found')
          } else {
            throw new Error(`Failed to fetch session: ${response.statusText}`)
          }
          return
        }

        const data = await response.json()
        setMessages(data.messages || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load session'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionMessages()
  }, [sessionId, isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!sessionId) {
    return <Navigate to="/chat" replace />
  }

  return (
    <>
      <SkyBackground />
      <div className="relative h-screen animate-fade-in" style={{ zIndex: 10 }}>
        <TopBar />
        <main className="overflow-auto h-[calc(100vh-52px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="p-6">
            {/* Back button */}
            <div className="mb-6">
              <a
                href="/chat"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Chat
              </a>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border border-blue-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-red-900 font-semibold">Error Loading Report</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>No messages found for this session</p>
              </div>
            ) : (
              <ReportPanel sessionId={sessionId} messages={messages} />
            )}
          </div>
        </main>
      </div>
    </>
  )
}
