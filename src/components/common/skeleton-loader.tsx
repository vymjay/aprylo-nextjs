'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonLoaderProps {
  type?: 'page' | 'component' | 'form' | 'grid'
  message?: string
  showProgress?: boolean
  children?: React.ReactNode
}

export default function SkeletonLoader({ 
  type = 'page', 
  message = 'Loading...', 
  showProgress = false,
  children 
}: SkeletonLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 15
          return next > 90 ? 90 : next
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [showProgress])

  if (children) {
    return <>{children}</>
  }

  const renderSkeleton = () => {
    switch (type) {
      case 'form':
        return (
          <div className="max-w-md mx-auto space-y-6 p-6">
            <Skeleton className="h-8 w-48" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-12 w-full" />
          </div>
        )
      
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )
      
      case 'component':
        return (
          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )
      
      default: // page
        return (
          <div className="space-y-8 p-8">
            <div className="space-y-4">
              <Skeleton className="h-12 w-80" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      {renderSkeleton()}
      
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
        
        <p className="text-sm text-gray-600">{message}</p>
        
        {showProgress && (
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
