'use client'

import { Suspense, ComponentType } from 'react'
import { useUniversalLazy, lazyConfigs, type UniversalLazyOptions } from '@/hooks/use-universal-lazy'
import { HeroSkeleton } from './universal-skeleton'

interface UniversalLazyProps {
  importFunc: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  preset?: 'aboveFold' | 'belowFold' | 'heavy' | 'critical' | 'custom'
  options?: UniversalLazyOptions
  [key: string]: any
}

export default function UniversalLazy({
  importFunc,
  fallback,
  preset = 'belowFold',
  options = {},
  ...props
}: UniversalLazyProps) {
  const finalOptions = preset !== 'custom' ? { ...lazyConfigs[preset], ...options } : options

  const { Component, isLoading, error, retry, shouldRender, ref } = useUniversalLazy(
    importFunc,
    finalOptions
  ) as any

  if (!shouldRender) {
    return finalOptions.enableIntersectionObserver ? <div ref={ref} /> : null
  }

  const defaultFallback = (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg flex items-center justify-center">
      <span className="text-gray-500 dark:text-gray-400">Loading...</span>
    </div>
  )

  if (error && !Component) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 mb-2">Failed to load component</p>
        <button 
          onClick={retry}
          className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-300 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  if (Component) {
    return <Component {...props} />
  }

  return (
    <div ref={finalOptions.enableIntersectionObserver ? ref : undefined}>
      {fallback || defaultFallback}
    </div>
  )
}

// Specific lazy components for common patterns
export function LazyHero({ 
  importFunc, 
  fallback,
  ...props 
}: { 
  importFunc: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  [key: string]: any 
}) {
  return (
    <UniversalLazy
      importFunc={importFunc}
      fallback={fallback || <HeroSkeleton />}
      preset="aboveFold"
      {...props}
    />
  )
}

export function LazySection({ 
  importFunc, 
  fallback,
  ...props 
}: { 
  importFunc: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  [key: string]: any 
}) {
  return (
    <UniversalLazy
      importFunc={importFunc}
      fallback={fallback}
      preset="belowFold"
      {...props}
    />
  )
}

export function LazyModal({ 
  importFunc, 
  fallback,
  ...props 
}: { 
  importFunc: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  [key: string]: any 
}) {
  return (
    <UniversalLazy
      importFunc={importFunc}
      fallback={fallback}
      preset="critical"
      {...props}
    />
  )
}
