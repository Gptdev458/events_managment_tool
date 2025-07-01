/**
 * Client-side caching utilities for improved performance
 */

import { useState, useCallback, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly maxSize: number

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  /**
   * Sets a value in the cache with TTL (time to live)
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void { // 5 minutes default
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  /**
   * Gets a value from the cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Invalidates a specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidates all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Clears all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Gets cache statistics
   */
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    
    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++
      }
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      activeEntries: this.cache.size - expiredCount
    }
  }
}

// Global cache instance
export const appCache = new SimpleCache(200)

/**
 * Hook for cached API calls
 */
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 300000
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (force: boolean = false) => {
    // Check cache first unless forced
    if (!force) {
      const cached = appCache.get<T>(key)
      if (cached) {
        setData(cached)
        return cached
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      appCache.set(key, result, ttlMs)
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, ttlMs])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => fetchData(true), [fetchData])
  const invalidateCache = useCallback(() => appCache.invalidate(key), [key])

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidateCache
  }
}

/**
 * Preload data into cache
 */
export async function preloadCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 300000
): Promise<void> {
  try {
    const data = await fetcher()
    appCache.set(key, data, ttlMs)
  } catch (error) {
    // Silently fail for preload operations
    console.warn(`Failed to preload cache for key: ${key}`, error)
  }
} 