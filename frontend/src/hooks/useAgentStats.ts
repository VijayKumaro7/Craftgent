/**
 * useAgentStats — fetches live agent XP/level from the backend.
 * Polls every 15 seconds and after each completed message.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/store/useAuthStore'
import type { AgentName } from '@/types'

export interface LiveAgentStat {
  agent:         AgentName
  level:         number
  xp:            number
  xp_percent:    number
  message_count: number
  hp:            number
  mp:            number
}

interface StatsResponse {
  stats: Record<string, LiveAgentStat>
}

export function useAgentStats() {
  const { isAuthenticated } = useAuthStore()

  return useQuery<StatsResponse>({
    queryKey: ['agent-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<StatsResponse>('/api/stats')
      return data
    },
    enabled:           isAuthenticated,
    refetchInterval:   15_000,   // poll every 15 seconds
    staleTime:         10_000,
    retry:             1,
  })
}
