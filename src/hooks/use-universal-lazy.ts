/**
 * Universal lazy loading hook that consolidates all lazy loading patterns
 */
import { useState, useEffect, ComponentType } from 'react'
import { useIntersectionObserver } from './use-intersection-observer'

export interface UniversalLazyOptions {
  // Intersection Observer options
  enableIntersectionObserver?: boolean
  threshold?: number
  rootMargin?: string
  
  // Loading behavior
  preload?: boolean
  delay?: number
  retries?: number
  retryDelay?: number
  
  // Error handling
  onError?: (error: Error) => void
  fallbackComponent?: ComponentType<any>
}

export interface UniversalLazyResult<T = any> {
  Component: ComponentType<T> | null
  isLoading: boolean
  error: Error | null
  retry: () => void
  shouldRender: boolean
}

export function useUniversalLazy<T = any>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: UniversalLazyOptions = {}
): UniversalLazyResult<T> {
  const {
    enableIntersectionObserver = false,
    threshold = 0.1,
    rootMargin = '50px',
    preload = false,
    delay = 0,
    retries = 3,
    retryDelay = 1000,
    onError,
    fallbackComponent
  } = options

  const [Component, setComponent] = useState<ComponentType<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [shouldLoad, setShouldLoad] = useState(!enableIntersectionObserver)
  const [retryCount, setRetryCount] = useState(0)

  // Intersection Observer
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  })

  const loadComponent = async () => {
    if (Component) return

    setIsLoading(true)
    setError(null)

    try {
      const module = await importFunc()
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      setComponent(() => module.default)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load component')
      setError(error)
      
      if (onError) {
        onError(error)
      }

      // Retry logic
      if (retryCount < retries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          loadComponent()
        }, retryDelay)
      } else if (fallbackComponent) {
        setComponent(() => fallbackComponent)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const retry = () => {
    setRetryCount(0)
    setError(null)
    setComponent(null)
    loadComponent()
  }

  // Handle intersection
  useEffect(() => {
    if (enableIntersectionObserver && isIntersecting && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [isIntersecting, enableIntersectionObserver, shouldLoad])

  // Load component when needed
  useEffect(() => {
    if (shouldLoad) {
      loadComponent()
    }
  }, [shouldLoad])

  // Preload if requested
  useEffect(() => {
    if (preload) {
      loadComponent()
    }
  }, [preload])

  const shouldRender = enableIntersectionObserver ? isIntersecting || Component !== null : true

  return {
    Component,
    isLoading,
    error,
    retry,
    shouldRender,
    // Return ref for intersection observer if needed
    ...(enableIntersectionObserver && { ref })
  } as UniversalLazyResult<T> & (typeof enableIntersectionObserver extends true ? { ref: any } : {})
}

// Predefined configurations for common use cases
export const lazyConfigs = {
  // Above fold components - preload immediately
  aboveFold: {
    preload: true,
    retries: 2
  },
  
  // Below fold components - use intersection observer
  belowFold: {
    enableIntersectionObserver: true,
    threshold: 0.1,
    rootMargin: '100px',
    retries: 2
  },
  
  // Heavy components - load with delay and retry
  heavy: {
    enableIntersectionObserver: true,
    threshold: 0.2,
    rootMargin: '200px',
    delay: 300,
    retries: 3,
    retryDelay: 1500
  },
  
  // Critical components - immediate load with retry
  critical: {
    preload: true,
    retries: 5,
    retryDelay: 500
  }
}
