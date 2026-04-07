/**
 * ResponsiveGrid — Mobile-friendly grid layout
 * Adapts columns based on screen size
 */
import React from 'react'

interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    mobile: number
    tablet: number
    desktop: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-4',
  }

  const colClasses = {
    mobile: `grid-cols-${cols.mobile}`,
    tablet: `sm:grid-cols-${cols.tablet}`,
    desktop: `lg:grid-cols-${cols.desktop}`,
  }

  return (
    <div
      className={`grid ${colClasses.mobile} ${colClasses.tablet} ${colClasses.desktop} ${gapClasses[gap]} ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * ResponsiveContainer — Constrained width container
 * Optimized for mobile and desktop
 */
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className={`w-full max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto px-2 sm:px-4 ${className}`}>
      {children}
    </div>
  )
}

/**
 * MobileOnly — Only show on mobile devices
 */
export function MobileOnly({ children }: { children: React.ReactNode }) {
  return <div className="block sm:hidden">{children}</div>
}

/**
 * DesktopOnly — Only show on desktop
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return <div className="hidden sm:block">{children}</div>
}

/**
 * useIsMobile — Hook to detect mobile screen size
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Check initial size
    setIsMobile(window.innerWidth < 640)

    // Listen for resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}
