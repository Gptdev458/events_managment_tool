/**
 * Performance monitoring and optimization utilities
 */

import { logger } from './logger'
import { useMemo, useCallback } from 'react'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface PageLoadMetrics {
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private readonly maxMetrics = 1000

  /**
   * Records a custom performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.push(metric)

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow operations
    if (value > 1000) { // > 1 second
      logger.warn(`Slow operation detected: ${name} took ${value}ms`)
    }
  }

  /**
   * Measures execution time of a function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, metadata)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, { ...metadata, error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  /**
   * Measures execution time of a synchronous function
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    const start = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, metadata)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, { ...metadata, error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  /**
   * Gets performance statistics for a metric
   */
  getMetricStats(name: string): {
    count: number
    average: number
    min: number
    max: number
    p95: number
    p99: number
  } | null {
    const metricData = this.metrics.filter(m => m.name === name)
    
    if (metricData.length === 0) return null

    const values = metricData.map(m => m.value).sort((a, b) => a - b)
    const count = values.length
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      count,
      average: sum / count,
      min: values[0],
      max: values[count - 1],
      p95: values[Math.floor(count * 0.95)],
      p99: values[Math.floor(count * 0.99)]
    }
  }

  /**
   * Gets all recorded metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Clears all metrics
   */
  clearMetrics() {
    this.metrics = []
  }

  /**
   * Collects Web Vitals metrics
   */
  collectWebVitals(): Promise<Partial<PageLoadMetrics>> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({})
        return
      }

      const metrics: Partial<PageLoadMetrics> = {}

      // Navigation timing
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing
        metrics.navigationStart = timing.navigationStart
        metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart
        metrics.loadComplete = timing.loadEventEnd - timing.navigationStart
      }

      // Paint timing
      if (window.performance && window.performance.getEntriesByType) {
        const paintEntries = window.performance.getEntriesByType('paint')
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          metrics.firstContentfulPaint = fcpEntry.startTime
        }
      }

      // Observer for LCP and CLS
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          metrics.largestContentfulPaint = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Cumulative Layout Shift
        let clsValue = 0
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          metrics.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries() as any[]) {
            metrics.firstInputDelay = entry.processingStart - entry.startTime
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Return metrics after a delay to allow collection
        setTimeout(() => {
          resolve(metrics)
        }, 3000)
      } else {
        resolve(metrics)
      }
    })
  }

  /**
   * Monitors resource loading performance
   */
  monitorResourceLoading() {
    if (typeof window === 'undefined' || !window.performance) return

    // Monitor resource timing
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          
          // Record slow resources
          if (resourceEntry.duration > 1000) {
            this.recordMetric('slow_resource', resourceEntry.duration, {
              url: resourceEntry.name,
              type: resourceEntry.initiatorType,
              size: resourceEntry.transferSize
            })
          }
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
  }

  /**
   * Monitors long tasks that block the main thread
   */
  monitorLongTasks() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('long_task', entry.duration, {
          startTime: entry.startTime
        })
      }
    })

    observer.observe({ entryTypes: ['longtask'] })
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * React hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  const measureRender = () => {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      performanceMonitor.recordMetric(`component_render_${componentName}`, duration)
    }
  }

  return { measureRender }
}

/**
 * Higher-order component for automatic performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component'
  
  const MonitoredComponent = (props: P) => {
    const renderStart = performance.now()
    
    React.useEffect(() => {
      const renderDuration = performance.now() - renderStart
      performanceMonitor.recordMetric(`${displayName}_render`, renderDuration)
    })

    return React.createElement(WrappedComponent, props)
  }

  MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`
  
  return MonitoredComponent
}

/**
 * Database query performance utilities
 */
export const DatabasePerformance = {
  /**
   * Measures database query performance
   */
  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    return performanceMonitor.measureAsync(`db_query_${queryName}`, queryFn, metadata)
  },

  /**
   * Tracks cache hit/miss rates
   */
  recordCacheHit(cacheKey: string) {
    performanceMonitor.recordMetric('cache_hit', 1, { key: cacheKey })
  },

  recordCacheMiss(cacheKey: string) {
    performanceMonitor.recordMetric('cache_miss', 1, { key: cacheKey })
  }
}

/**
 * API call performance monitoring
 */
export const ApiPerformance = {
  /**
   * Measures API call performance
   */
  async measureApiCall<T>(
    endpoint: string,
    apiFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    return performanceMonitor.measureAsync(`api_call_${endpoint}`, apiFn, metadata)
  },

  /**
   * Records API response sizes
   */
  recordResponseSize(endpoint: string, sizeBytes: number) {
    performanceMonitor.recordMetric(`api_response_size_${endpoint}`, sizeBytes)
  }
}

/**
 * Bundle size analysis utilities
 */
export const BundleAnalysis = {
  /**
   * Estimates JavaScript bundle impact
   */
  estimateBundleImpact(bundleName: string, sizeBytes: number) {
    // Rough estimate: 1KB of JS ≈ 1ms of parse time on average mobile device
    const estimatedParseTime = sizeBytes / 1024
    
    performanceMonitor.recordMetric(`bundle_parse_estimate_${bundleName}`, estimatedParseTime, {
      bundleSize: sizeBytes
    })
  }
}

/**
 * Memory usage monitoring
 */
export const MemoryMonitoring = {
  /**
   * Records memory usage if available
   */
  recordMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in window.performance) {
      const memory = (window.performance as any).memory
      
      performanceMonitor.recordMetric('memory_used', memory.usedJSHeapSize)
      performanceMonitor.recordMetric('memory_total', memory.totalJSHeapSize)
      performanceMonitor.recordMetric('memory_limit', memory.jsHeapSizeLimit)
    }
  },

  /**
   * Monitors for memory leaks
   */
  startMemoryLeakDetection() {
    if (typeof window === 'undefined') return

    let lastMemoryUsage = 0
    
    const checkMemory = () => {
      if ('memory' in window.performance) {
        const memory = (window.performance as any).memory
        const currentUsage = memory.usedJSHeapSize
        
        if (currentUsage > lastMemoryUsage * 1.5 && lastMemoryUsage > 0) {
          logger.warn(`Potential memory leak detected: Memory usage increased from ${lastMemoryUsage} to ${currentUsage} bytes`)
        }
        
        lastMemoryUsage = currentUsage
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkMemory, 30000)
    
    return () => clearInterval(interval)
  }
}

// Initialize monitoring on client side
if (typeof window !== 'undefined') {
  // Start automatic monitoring
  performanceMonitor.monitorResourceLoading()
  performanceMonitor.monitorLongTasks()
  
  // Collect Web Vitals after page load
  window.addEventListener('load', () => {
    performanceMonitor.collectWebVitals().then((metrics) => {
      Object.entries(metrics).forEach(([key, value]) => {
        if (value !== undefined) {
          performanceMonitor.recordMetric(`web_vital_${key}`, value)
        }
      })
    })
  })

  // Start memory leak detection
  MemoryMonitoring.startMemoryLeakDetection()
}

import React from 'react'

// Stable empty arrays to prevent unnecessary re-renders
export const EMPTY_ARRAY: any[] = []
export const EMPTY_OBJECT = {}

// Memoization helper for filtering arrays
export function useFilteredArray<T>(
  array: T[],
  filterFn: (item: T) => boolean,
  deps: any[] = []
) {
  return useMemo(() => array.filter(filterFn), [array, ...deps])
}

// Stable callback helper
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  return useCallback(callback, deps)
}

// Batched updates helper
export function batchUpdates<T>(updates: (() => T)[]): T[] {
  return updates.map(update => update())
}

// Performance monitoring helpers
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}

// Debounce helper for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }) as T
}

// React component memoization helpers
export const memo = {
  // Shallow comparison memo
  shallow: <P extends object>(Component: React.ComponentType<P>) => 
    React.memo(Component),
  
  // Deep comparison memo (use sparingly)
  deep: <P extends object>(Component: React.ComponentType<P>) =>
    React.memo(Component, (prevProps, nextProps) => {
      return JSON.stringify(prevProps) === JSON.stringify(nextProps)
    })
} 