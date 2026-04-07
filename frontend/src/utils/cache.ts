/**
 * Cache utilities for optimizing API requests
 * Implements TTL-based caching and request deduplication
 */
import React from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 60s)
  forceRefresh?: boolean
}

/**
 * In-memory cache with TTL support
 */
class CacheStore {
  private cache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, Promise<any>>()

  /**
   * Get cached value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cached value with TTL
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Check if value is cached and not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Clear specific entry
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Deduplicate requests - return same promise for concurrent identical requests
   */
  getOrExecute<T>(
    key: string,
    executor: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = 60000, forceRefresh = false } = options

    // Check cache first
    if (!forceRefresh) {
      const cached = this.get<T>(key)
      if (cached !== null) {
        return Promise.resolve(cached)
      }
    }

    // Check if request already pending
    const pending = this.pendingRequests.get(key)
    if (pending) {
      return pending
    }

    // Execute request and cache result
    const promise = executor()
      .then((data) => {
        this.set(key, data, ttl)
        this.pendingRequests.delete(key)
        return data
      })
      .catch((error) => {
        this.pendingRequests.delete(key)
        throw error
      })

    this.pendingRequests.set(key, promise)
    return promise
  }
}

// Global cache instance
export const globalCache = new CacheStore()

/**
 * Hook to use cached API calls
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    setLoading(true)
    globalCache
      .getOrExecute(key, fetcher, options)
      .then((result) => {
        setData(result)
        setError(null)
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [key, options.forceRefresh])

  const refresh = React.useCallback(() => {
    globalCache.delete(key)
    setLoading(true)
    fetcher()
      .then((result) => {
        globalCache.set(key, result, options.ttl || 60000)
        setData(result)
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [key, fetcher, options.ttl])

  return { data, loading, error, refresh }
}

/**
 * Clear cache on demand
 */
export function clearCache(pattern?: string): void {
  if (!pattern) {
    globalCache.clear()
  } else {
    // In real implementation, would iterate and match pattern
    globalCache.clear()
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: globalCache.size(),
    // Could expand with more detailed stats
  }
}
