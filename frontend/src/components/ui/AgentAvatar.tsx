/**
 * AgentAvatar — Displays agent avatar from PNG image assets.
 * Falls back to PixelHead canvas if image fails to load.
 */
import { useState } from 'react'
import type { AgentName } from '@/types'
import { getAgentAvatar } from '@/constants/assets'
import { PixelHead } from './PixelHead'

interface AgentAvatarProps {
  agent: AgentName
  size?: number
  className?: string
  fallbackToCanvas?: boolean
}

export function AgentAvatar({
  agent,
  size = 32,
  className = '',
  fallbackToCanvas = true,
}: AgentAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const avatarUrl = getAgentAvatar(agent)

  // If image fails to load or we want canvas fallback, use PixelHead
  if (imageError && fallbackToCanvas) {
    return <PixelHead agent={agent} size={size} className={className} />
  }

  return (
    <img
      src={avatarUrl}
      alt={`${agent} avatar`}
      width={size}
      height={size}
      onError={() => setImageError(true)}
      className={`border-2 border-black/50 shadow-[2px_2px_0_rgba(0,0,0,0.6)] ${className}`}
      style={{ imageRendering: 'pixelated', width: size, height: size }}
      loading="lazy"
    />
  )
}
