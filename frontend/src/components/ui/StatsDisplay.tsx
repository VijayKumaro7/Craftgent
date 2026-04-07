/**
 * StatsDisplay — Shows agent XP, level, and progress bars
 * Fetches from /api/stats and displays with visual polish
 */
import { useEffect, useState } from 'react'
import { apiClient } from '@/api/client'
import { AGENTS } from '@/types'
import type { AgentName } from '@/types'
import { AgentAvatar } from './AgentAvatar'
import { McBar } from './McBar'
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

        const agent = AGENTS[agentName]
        const color = getAgentColor(agentName)

        return (
          <div
            key={agentName}
            className="p-2 bg-black/40 border border-white/10 rounded"
            style={{ borderLeftColor: color.primary, borderLeftWidth: '3px' }}
          >
            {/* Agent header */}
            <div className="flex items-center gap-2 mb-1">
              <AgentAvatar agent={agentName} size={24} className="flex-shrink-0" />
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
            <div className="flex items-center gap-1 mb-1">
              <span className="font-pixel text-[3px] text-white/50 w-6">XP</span>
              <div className="flex-1">
                <McBar value={stat.xp_percent} variant="xp" />
              </div>
              <span className="font-pixel text-[3px] text-white/50">
                {stat.xp_percent}%
              </span>
            </div>

            {/* HP/MP bars */}
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                <span className="font-pixel text-[3px] text-white/50">HP</span>
                <McBar value={stat.hp} variant="hp" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-pixel text-[3px] text-white/50">MP</span>
                <McBar value={stat.mp} variant="mp" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
