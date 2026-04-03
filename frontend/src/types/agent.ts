export type AgentName = 'NEXUS' | 'ALEX' | 'VORTEX';

export interface AgentStats {
  agent: AgentName;
  level: number;
  xp: number;
  xp_percent: number;
  message_count: number;
  hp: number;
  mp: number;
}

export interface AllAgentStats {
  stats: Record<AgentName, AgentStats>;
}

export interface AgentInfo {
  name: AgentName;
  title: string;
  description: string;
  color: string;
  icon: string;
}

export const AGENTS: Record<AgentName, AgentInfo> = {
  NEXUS: {
    name: 'NEXUS',
    title: 'Orchestrator',
    description: 'Research and knowledge synthesis',
    color: '#3b82f6',
    icon: '🧠',
  },
  ALEX: {
    name: 'ALEX',
    title: 'Code Warrior',
    description: 'Code generation and debugging',
    color: '#10b981',
    icon: '⚔️',
  },
  VORTEX: {
    name: 'VORTEX',
    title: 'Data Creeper',
    description: 'Analytics and SQL queries',
    color: '#8b5cf6',
    icon: '📊',
  },
};

export const XP_PER_LEVEL = 200;
export const MAX_LEVEL = 50;
