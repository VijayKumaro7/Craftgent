/**
 * Performance monitoring and optimization utilities
 */
import { useEffect } from 'react'

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private marks = new Map<string, number>()

  /**
   * Start measuring a metric
   */
  start(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * End measurement and record metric
   */
  end(name: string): number {
    const start = this.marks.get(name)
    if (!start) {
      console.warn(`No start mark for metric: ${name}`)
      return 0
    }

    const duration = performance.now() - start
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    })

    this.marks.delete(name)

    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number {
    const matching = this.metrics.filter((m) => m.name === name)
    if (matching.length === 0) return 0

    const total = matching.reduce((sum, m) => sum + m.duration, 0)
    return total / matching.length
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = []
    this.marks.clear()
  }

  /**
   * Export metrics for analysis
   */
  export(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        summary: this.getSummary(),
      },
      null,
      2
    )
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { min: number; max: number; avg: number; count: number }> {
    const summary: Record<string, { min: number; max: number; avg: number; count: number }> = {}

    const grouped = new Map<string, PerformanceMetric[]>()
    this.metrics.forEach((m) => {
      if (!grouped.has(m.name)) {
        grouped.set(m.name, [])
      }
      grouped.get(m.name)!.push(m)
    })

    grouped.forEach((metrics, name) => {
      const durations = metrics.map((m) => m.duration)
      summary[name] = {
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        count: durations.length,
      }
    })

    return summary
  }
}

export const monitor = new PerformanceMonitor()

/**
 * Measure React component render time
 */
export function measureRender(componentName: string) {
  const startTime = performance.now()

  return {
    end: () => {
      const duration = performance.now() - startTime
      if (duration > 16.67) {
        // Longer than ~60fps frame
        console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`)
      }
      return duration
    },
  }
}

/**
 * Track component lifecycle performance
 */
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    monitor.start(`render-${componentName}`)
    return () => {
      const duration = monitor.end(`render-${componentName}`)
      if (import.meta.env.MODE === 'development') {
        console.log(`✅ ${componentName} mounted in ${duration.toFixed(2)}ms`)
      }
    }
  }, [componentName])

  useEffect(() => {
    return () => {
      if (import.meta.env.MODE === 'development') {
        console.log(`🗑️ ${componentName} unmounted`)
      }
    }
  }, [componentName])
}

/**
 * Measure async operations
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  monitor.start(name)
  try {
    const result = await fn()
    monitor.end(name)
    return result
  } catch (error) {
    monitor.end(name)
    throw error
  }
}

/**
 * Report Web Vitals
 */
export function reportWebVitals(metric: any) {
  const { name, value } = metric

  // Log to console in development
  if (import.meta.env.MODE === 'development') {
    console.log(`📊 Web Vital: ${name} = ${value.toFixed(2)}`)
  }

  // Could send to analytics service
  // sendToAnalytics({ name, value })
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  return {
    // Page load metrics
    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
    pageLoadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
    dnsTime: navigation?.domainLookupEnd - navigation?.domainLookupStart,
    tcpTime: navigation?.connectEnd - navigation?.connectStart,
    ttfb: navigation?.responseStart - navigation?.requestStart, // Time to First Byte
    // Custom metrics
    customMetrics: monitor.getSummary(),
  }
}
