import { useRef, useCallback } from 'react'

interface ParallaxTransform {
  rotateX: number
  rotateY: number
}

export function useMouseParallax(maxDeg = 15) {
  const rafRef = useRef<number | null>(null)
  const transformRef = useRef<ParallaxTransform>({ rotateX: 0, rotateY: 0 })

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>, onUpdate: (t: ParallaxTransform) => void) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = (e.clientX - cx) / (rect.width / 2)
        const dy = (e.clientY - cy) / (rect.height / 2)
        transformRef.current = {
          rotateX: -(dy * maxDeg),
          rotateY: dx * maxDeg,
        }
        onUpdate(transformRef.current)
      })
    },
    [maxDeg]
  )

  const onMouseLeave = useCallback((onUpdate: (t: ParallaxTransform) => void) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      transformRef.current = { rotateX: 0, rotateY: 0 }
      onUpdate(transformRef.current)
    })
  }, [])

  return { onMouseMove, onMouseLeave }
}
