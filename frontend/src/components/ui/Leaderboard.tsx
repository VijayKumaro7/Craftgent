/**
 * Leaderboard — Shows top agents globally
 * Displays agent rankings by level and total XP
 */
import { useEffect, useState } from 'react'
import { apiClient } from '@/api/client'

interface LeaderboardEntry {
  rank: number
  agent: string
  level: number
  total_xp: number
  users_count: number
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        // Note: This endpoint would need to be created in backend
        // For now, we can calculate from available data
        const response = await apiClient.get('/api/stats/leaderboard')
        setEntries(response.data.leaderboard || [])
        setError(null)
      } catch (err) {
        // Gracefully handle if endpoint doesn't exist yet
        console.info('Leaderboard not available:', err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    fetchLeaderboard()
    // Refresh leaderboard every 60 seconds
    const interval = setInterval(fetchLeaderboard, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading && entries.length === 0) {
    return (
      <div className="p-2 font-pixel text-[5px] text-white/50">
        🏆 Leaderboard loading...
      </div>
    )
  }

  if (error) {
    return null // Silently fail if leaderboard not available
  }

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      <div className="font-pixel text-[6px] text-chat-sys px-2 py-1 border-b border-chat-sys/20">
        🏆 LEADERBOARD
      </div>
      {entries.slice(0, 5).map((entry) => (
        <div
          key={`${entry.agent}-${entry.rank}`}
          className="px-2 py-1 flex items-center gap-2 hover:bg-white/5 transition-colors"
        >
          {/* Rank badge */}
          <div className="font-pixel text-[4px] text-yellow-300 w-4 text-center">
            {entry.rank === 1
              ? '🥇'
              : entry.rank === 2
                ? '🥈'
                : entry.rank === 3
                  ? '🥉'
                  : `#${entry.rank}`}
          </div>

          {/* Agent info */}
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-[4px] text-white">
              {entry.agent}
            </div>
            <div className="font-terminal text-[3px] text-white/50">
              LV {entry.level}
            </div>
          </div>

          {/* XP display */}
          <div className="text-right">
            <div className="font-terminal text-[3px] text-white/70">
              {entry.total_xp.toLocaleString()}
            </div>
            <div className="font-pixel text-[2px] text-white/40">
              {entry.users_count} users
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
