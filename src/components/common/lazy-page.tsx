'use client'

import { Suspense } from 'react'
import { ComponentType } from 'react'
import SkeletonLoader from './skeleton-loader'

interface LazyPageProps {
  serverComponent: ComponentType<any>
  fallback?: React.ReactNode
  loadingType?: 'page' | 'component' | 'form' | 'grid'
  loadingMessage?: string
  enableProgress?: boolean
  wrapperClassName?: string
  [key: string]: any
}

const LazyPage: React.FC<LazyPageProps> = ({
  serverComponent: ServerComponent,
  fallback,
  loadingType = 'page',
  loadingMessage = 'Loading page...',
  enableProgress = true,
  wrapperClassName = '',
  ...props
}) => {
  const defaultFallback = (
    <SkeletonLoader
      type={loadingType}
      message={loadingMessage}
      showProgress={enableProgress}
    />
  )

  return (
    <div className={wrapperClassName}>
      <Suspense fallback={fallback || defaultFallback}>
        <ServerComponent {...props} />
      </Suspense>
    </div>
  )
}

export default LazyPage
