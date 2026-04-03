import { create } from 'zustand';
import { AgentStats, AgentName } from '@types/agent';

interface AgentStoreState {
  // State
  stats: Record<AgentName, AgentStats> | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  // Actions
  setStats: (stats: Record<AgentName, AgentStats>) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateLastUpdated: () => void;
  getStat: (agent: AgentName) => AgentStats | null;
}

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  // Initial state
  stats: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Actions
  setStats: (stats) =>
    set({
      stats,
      error: null,
    }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  updateLastUpdated: () => set({ lastUpdated: Date.now() }),
  getStat: (agent) => {
    const state = get();
    return state.stats?.[agent] || null;
  },
}));
