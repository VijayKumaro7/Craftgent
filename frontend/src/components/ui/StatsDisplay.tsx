/**
 * StatsDisplay — Shows agent XP, level, and progress bars
 * Fetches from /api/stats and displays with visual polish
 */
import { useEffect, useState } from 'react'
import { apiClient } from '@/api/client'
import { AGENTS } from '@/types'
import type { AgentName } from '@/types'
import { AgentAvatar } from './AgentAvatar'
import { ProgressBar } from './ProgressBar'
import { getAgentColor } from '@/constants/colors'

interface AgentStatData {
  agent: string
  level: number
  xp: number
  xp_percent: number
  message_count: number
  hp: number
  mp: number
}

interface StatsData {
  stats: Record<string, AgentStatData>
}

export function StatsDisplay() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/api/stats')
        setStats(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
        console.error('Stats fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !stats) {
    return (
      <div className="p-2 font-pixel text-[5px] text-white/50">
        ⏳ Loading stats...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-2 font-pixel text-[5px] text-red-400">
        ⚠️ {error}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-2">
      {(Object.keys(AGENTS) as AgentName[]).map((agentName) => {
        const stat = stats.stats[agentName]
        if (!stat) return null

        const color = getAgentColor(agentName)

        return (
          <div
            key={agentName}
            className="p-2 bg-black/40 border border-white/10 rounded"
            style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
          >
            {/* Agent header */}
            <div className="flex items-center gap-2 mb-1">
              <AgentAvatar agent={agentName} size="md" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-[5px] text-white">
                  {agentName}
                </div>
                <div className="font-pixel text-[4px] text-white/50">
                  LV {stat.level}
                </div>
              </div>
              <div className="font-pixel text-[4px] text-white/70">
                {stat.message_count} msgs
              </div>
            </div>

            {/* XP bar */}
            <div className="mb-1">
              <ProgressBar current={stat.xp_percent} max={100} label="XP" showLabel color="primary" />
            </div>

            {/* HP/MP bars */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <ProgressBar current={stat.hp} max={100} label="HP" color="success" />
              </div>
              <div>
                <ProgressBar current={stat.mp} max={100} label="MP" color="primary" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
