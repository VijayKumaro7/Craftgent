import React from 'react';
import { AGENT_COLORS } from '../../constants/colors';

type AgentType = 'nexus' | 'alex' | 'vortex' | 'researcher';

interface AvatarCircleProps {
  agent: AgentType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AGENT_INITIALS: Record<AgentType, string> = {
  nexus: 'N',
  alex: 'A',
  vortex: 'V',
  researcher: 'R',
};

const SIZE_MAP = {
  sm: { container: 'w-8 h-8', text: 'text-xs font-semibold' },
  md: { container: 'w-10 h-10', text: 'text-sm font-semibold' },
  lg: { container: 'w-12 h-12', text: 'text-base font-bold' },
};

export const AvatarCircle: React.FC<AvatarCircleProps> = ({ agent, size = 'md', className = '' }) => {
  const color = AGENT_COLORS[agent];
  const initial = AGENT_INITIALS[agent];
  const sizeClasses = SIZE_MAP[size];

  return (
    <div
      className={`${sizeClasses.container} rounded-full flex items-center justify-center ${sizeClasses.text} text-white transition-shadow duration-200 ${className}`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
};
