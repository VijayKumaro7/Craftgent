/**
 * useSessionList — fetches the user's past chat sessions.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient }   from '@/api/client'
import { useAuthStore } from '@/store/useAuthStore'
import type { AgentName } from '@/types'

export interface SessionSummary {
  id:            string
  active_agent:  AgentName
  message_count: number
  last_message:  string | null
  updated_at:    string
  created_at:    string
}

interface SessionListResponse {
  sessions: SessionSummary[]
  total:    number
  page:     number
  per_page: number
}

export function useSessionList(page = 1) {
  const { isAuthenticated } = useAuthStore()

  return useQuery<SessionListResponse>({
    queryKey:        ['sessions', page],
    queryFn:         async () => {
      const { data } = await apiClient.get<SessionListResponse>(
        `/api/sessions?page=${page}&per_page=20`
      )
      return data
    },
    enabled:         isAuthenticated,
    staleTime:       10_000,
    retry:           1,
  })
}
