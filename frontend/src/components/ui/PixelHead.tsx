/**
 * PixelHead — draws a Minecraft-style 8×8 pixel character head on a canvas.
 * Each agent gets a unique colour palette.
 */
import { useEffect, useRef } from 'react'
import type { AgentName } from '@/types'
import { AGENTS } from '@/types'

interface PixelHeadProps {
  agent: AgentName
  size?: number
  className?: string
}

// 8×8 pixel patterns: 0=transparent, 1=skin, 2=hair, 3=eye
const PATTERNS: Record<AgentName, number[]> = {
  NEXUS: [
    0,0,1,1,1,1,0,0,
    0,1,2,2,2,2,1,0,
    1,2,1,1,1,1,2,1,
    1,1,1,1,1,1,1,1,
    1,1,3,1,1,3,1,1,
    1,1,1,3,3,1,1,1,
    0,0,1,1,1,1,0,0,
    0,0,1,0,0,1,0,0,
  ],
  ALEX: [
    0,0,1,1,1,1,0,0,
    0,1,2,1,1,2,1,0,
    1,1,1,1,1,1,1,1,
    1,2,1,1,1,1,2,1,
    0,1,3,3,3,3,1,0,
    0,1,1,0,0,1,1,0,
    0,1,0,0,0,0,1,0,
    0,0,0,0,0,0,0,0,
  ],
  VORTEX: [
    0,0,0,1,1,0,0,0,
    0,0,1,1,1,1,0,0,
    0,1,2,1,1,2,1,0,
    1,1,1,1,1,1,1,1,
    1,3,1,1,1,1,3,1,
    0,1,3,1,1,3,1,0,
    0,0,1,0,0,1,0,0,
    0,0,0,1,1,0,0,0,
  ],
}

export function PixelHead({ agent, size = 32, className = '' }: PixelHeadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const profile = AGENTS[agent]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pattern = PATTERNS[agent]
    const [skin, hair, eye] = profile.palette
    const px = size / 8   // pixels per cell

    ctx.clearRect(0, 0, size, size)
    ctx.imageSmoothingEnabled = false

    pattern.forEach((cell, i) => {
      if (cell === 0) return
      const x = (i % 8) * px
      const y = Math.floor(i / 8) * px
      ctx.fillStyle = cell === 1 ? skin : cell === 2 ? hair : eye
      ctx.fillRect(x, y, px, px)
    })

    // Subtle border shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, size, size)
  }, [agent, size, profile.palette])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`border-2 border-black/50 shadow-[2px_2px_0_rgba(0,0,0,0.6)] ${className}`}
      style={{ imageRendering: 'pixelated', width: size, height: size }}
      aria-label={`${agent} pixel avatar`}
    />
  )
}
