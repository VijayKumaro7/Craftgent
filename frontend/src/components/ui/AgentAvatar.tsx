/**
 * AgentAvatar — Displays agent avatar using modern AvatarCircle component.
 */
import type { AgentName } from '@/types'
import { AvatarCircle } from './AvatarCircle'

interface AgentAvatarProps {
  agent: AgentName
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AgentAvatar({
  agent,
  size = 'md',
  className = '',
}: AgentAvatarProps) {
  return (
    <AvatarCircle agent={agent.toLowerCase() as any} size={size} className={className} />
  )
}
