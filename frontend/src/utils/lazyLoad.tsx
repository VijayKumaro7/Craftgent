/**
 * Lazy loading utilities for code splitting and component imports
 * Reduces initial bundle size by deferring non-critical imports
 */
import React from 'react'

/**
 * Lazy load a component with loading and error states
 */
export function lazyLoadComponent<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallbackComponent?: React.ComponentType
) {
  const Component = React.lazy(importFn)
  const Fallback = fallbackComponent || LoadingFallback

  return (props: P) => (
    <React.Suspense fallback={<Fallback />}>
      <Component {...(props as any)} />
    </React.Suspense>
  )
}

/**
 * Default loading fallback
 */
function LoadingFallback() {
  return (
    <div className="p-4 font-pixel text-[5px] text-white/50 animate-pulse">
      ⏳ Loading...
    </div>
  )
}

/**
 * Intersection Observer for lazy loading content
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(null)

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry)
    }, {
      threshold: 0.1,
      ...options,
    })

    observer.observe(ref.current)

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
      observer.disconnect()
    }
  }, [ref, options])

  return entry
}

/**
 * Lazy load images with intersection observer
 */
export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
}: {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
}) {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const ref = React.useRef<HTMLImageElement>(null)
  const entry = useIntersectionObserver(ref)

  // Load image when visible
  React.useEffect(() => {
    if (entry?.isIntersecting) {
      setImageSrc(src)
    }
  }, [entry?.isIntersecting, src])

  return (
    <img
      ref={ref}
      src={imageSrc || ''}
      alt={alt}
      className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
      width={width}
      height={height}
      loading="lazy"
      onLoad={() => setIsLoading(false)}
      style={{
        backgroundColor: isLoading ? '#1a1a1a' : 'transparent',
      }}
    />
  )
}

/**
 * Defer non-critical code execution
 */
export function useDeferredCallback(callback: () => void, deps: React.DependencyList) {
  React.useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => callback())
    } else {
      setTimeout(callback, 0)
    }
  }, deps)
}

/**
 * Code splitting utilities
 */
export const CodeSplittingConfig = {
  // Components to lazy load
  HEAVY_COMPONENTS: [
    'StatsDisplay',
    'Leaderboard',
    'TemplatesPanel',
  ] as const,
}

/**
 * Prefetch data for upcoming routes
 */
export function usePrefetch(url: string, delay = 2000) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      document.head.appendChild(link)
    }, delay)

    return () => clearTimeout(timer)
  }, [url, delay])
}
