/**
 * useAgentHistory — fetches paginated output history for a specific agent.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/store/useAuthStore'
import type { AgentName, AgentHistoryResponse } from '@/types'

export function useAgentHistory(agent: AgentName, page = 1, perPage = 10) {
  const { isAuthenticated } = useAuthStore()

  return useQuery<AgentHistoryResponse>({
    queryKey:  ['agent-history', agent, page, perPage],
    queryFn:   async () => {
      const { data } = await apiClient.get<AgentHistoryResponse>(
        `/api/agents/${agent}/history?page=${page}&per_page=${perPage}`
      )
      return data
    },
    enabled:   isAuthenticated,
    staleTime: 15_000,
    retry:     1,
  })
}
