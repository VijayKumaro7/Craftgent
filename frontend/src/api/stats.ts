import { apiClient } from './client';
import { AgentStats, AgentName, AllAgentStats } from '@types/agent';

export const statsAPI = {
  /**
   * Get all agent stats (XP, levels, HP, MP)
   */
  getStats: async (): Promise<Record<AgentName, AgentStats>> => {
    const response = await apiClient.get<AllAgentStats>('/api/stats');
    return response.data.stats;
  },

  /**
   * Get health check and service status
   */
  getHealth: async (): Promise<any> => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },
};
