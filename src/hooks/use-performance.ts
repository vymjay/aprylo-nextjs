'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { logInfo, logWarning } from '@/lib/logger'

interface PerformanceMetrics {
  component: string
  renderTime: number
  mountTime: number
  updateCount: number
  lastUpdateTime: number
  memoryUsage?: number
}

interface PerformanceHookOptions {
  logThreshold?: number // Log if render time exceeds this (ms)
  warnThreshold?: number // Warn if render time exceeds this (ms)
  trackMemory?: boolean
  trackUpdates?: boolean
  enabled?: boolean
}

export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceHookOptions = {}
) {
  const {
    logThreshold = 16, // 60fps threshold
    warnThreshold = 50,
    trackMemory = false,
    trackUpdates = true,
    enabled = process.env.NODE_ENV === 'development'
  } = options

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    component: componentName,
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    lastUpdateTime: 0
  })

  const startTimeRef = useRef<number>(0)
  const mountTimeRef = useRef<number>(0)
  const updateCountRef = useRef<number>(0)
  const isFirstRender = useRef<boolean>(true)

  // Start timing
  const startTiming = useCallback(() => {
    if (!enabled) return
    startTimeRef.current = performance.now()
  }, [enabled])

  // End timing and log
  const endTiming = useCallback(() => {
    if (!enabled || startTimeRef.current === 0) return

    const endTime = performance.now()
    const renderTime = endTime - startTimeRef.current
    const now = Date.now()

    if (isFirstRender.current) {
      mountTimeRef.current = renderTime
      isFirstRender.current = false
    }

    if (trackUpdates) {
      updateCountRef.current += 1
    }

    const newMetrics: PerformanceMetrics = {
      component: componentName,
      renderTime,
      mountTime: mountTimeRef.current,
      updateCount: updateCountRef.current,
      lastUpdateTime: now
    }

    // Add memory usage if tracking
    if (trackMemory && 'memory' in performance) {
      const memInfo = (performance as any).memory
      newMetrics.memoryUsage = memInfo.usedJSHeapSize
    }

    setMetrics(newMetrics)

    // Log performance issues
    if (renderTime > warnThreshold) {
      logWarning(`Slow render detected in ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        updateCount: updateCountRef.current,
        threshold: `${warnThreshold}ms`
      })
    } else if (renderTime > logThreshold) {
      logInfo(`Render time for ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        updateCount: updateCountRef.current
      })
    }

    startTimeRef.current = 0
  }, [enabled, componentName, logThreshold, warnThreshold, trackMemory, trackUpdates])

  // Monitor renders
  useEffect(() => {
    startTiming()
    return () => {
      endTiming()
    }
  })

  return {
    metrics,
    startTiming,
    endTiming
  }
}

// Hook for monitoring Core Web Vitals
export function useWebVitals() {
  const [vitals, setVitals] = useState<{
    FCP?: number
    LCP?: number
    FID?: number
    CLS?: number
    TTFB?: number
  }>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Simple performance monitoring without web-vitals for now
    // Track basic performance metrics
    const trackPerformance = () => {
      if (performance && performance.getEntriesByType) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          const metrics = {
            FCP: navigation.responseStart - navigation.fetchStart,
            LCP: navigation.loadEventEnd - navigation.fetchStart,
            TTFB: navigation.responseStart - navigation.requestStart
          }
          
          setVitals(metrics)
          logInfo('Performance Metrics', metrics)
        }
      }
    }

    // Track after page load
    if (document.readyState === 'complete') {
      trackPerformance()
    } else {
      window.addEventListener('load', trackPerformance)
      return () => window.removeEventListener('load', trackPerformance)
    }
  }, [])

  return vitals
}

// Hook for monitoring bundle sizes
export function useBundleAnalyzer() {
  const [bundleInfo, setBundleInfo] = useState<{
    pageSize?: number
    chunkSizes?: Record<string, number>
    totalSize?: number
  }>({})

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

    // Estimate bundle size from network timing
    const analyzeBundle = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

      // Calculate main page size
      const pageSize = navigation.transferSize || 0

      // Calculate chunk sizes
      const chunkSizes: Record<string, number> = {}
      let totalSize = pageSize

      resources.forEach((resource) => {
        if (resource.name.includes('/_next/static/chunks/')) {
          const chunkName = resource.name.split('/').pop() || 'unknown'
          const size = resource.transferSize || 0
          chunkSizes[chunkName] = size
          totalSize += size
        }
      })

      setBundleInfo({
        pageSize,
        chunkSizes,
        totalSize
      })

      logInfo('Bundle Analysis', {
        pageSize: `${(pageSize / 1024).toFixed(2)} KB`,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        chunkCount: Object.keys(chunkSizes).length
      })
    }

    // Analyze after page load
    const timer = setTimeout(analyzeBundle, 2000)
    return () => clearTimeout(timer)
  }, [])

  return bundleInfo
}

// Type definitions for performance monitoring
export type { PerformanceMetrics, PerformanceHookOptions }
