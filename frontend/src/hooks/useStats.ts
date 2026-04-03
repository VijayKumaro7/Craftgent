import { useEffect, useCallback } from 'react';
import { useAgentStore } from '@store/agentStore';
import { statsAPI } from '@api/stats';
import { AgentName, AgentStats } from '@types/agent';

export const useStats = (autoRefresh: boolean = true, refreshInterval: number = 10000) => {
  const { stats, isLoading, error, setStats, setIsLoading, setError, updateLastUpdated } =
    useAgentStore();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await statsAPI.getStats();
      setStats(data);
      updateLastUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, [setStats, setIsLoading, setError, updateLastUpdated]);

  useEffect(() => {
    // Fetch stats immediately on mount
    fetchStats();

    if (!autoRefresh) return;

    // Set up auto-refresh interval
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStats, autoRefresh, refreshInterval]);

  const getStat = (agent: AgentName): AgentStats | null => {
    return stats?.[agent] || null;
  };

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    getStat,
  };
};
