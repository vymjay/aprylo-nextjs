'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useCommonSkeleton, type SkeletonConfig, type SkeletonField } from '@/hooks/use-common-skeleton'

interface UniversalSkeletonProps {
  config?: SkeletonConfig
  preset?: 'authForm' | 'productGrid' | 'ordersList' | 'custom'
  fields?: SkeletonField[]
  title?: { text: string; width?: string; height?: string }
  subtitle?: { text: string; width?: string; height?: string }
  className?: string
  children?: React.ReactNode
}

export default function UniversalSkeleton({
  config,
  preset = 'custom',
  fields,
  title,
  subtitle,
  className = '',
  children
}: UniversalSkeletonProps) {
  const { getFieldClassName, getSpacing, configs } = useCommonSkeleton()

  // Use preset config or custom config
  const finalConfig = config || (preset !== 'custom' ? configs[preset] : undefined)

  if (children) {
    return <div className={className}>{children}</div>
  }

  if (!finalConfig && !fields) {
    // Fallback skeleton
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  const spacing = getSpacing(finalConfig?.container?.spacing)

  return (
    <div className={`${finalConfig?.container?.className || ''} ${className}`}>
      {/* Title */}
      {(title || finalConfig?.title) && (
        <Skeleton 
          className={`${title?.height || finalConfig?.title?.height || 'h-8'} ${title?.width || finalConfig?.title?.width || 'w-48'} mb-4`} 
        />
      )}
      
      {/* Subtitle */}
      {(subtitle || finalConfig?.subtitle) && (
        <Skeleton 
          className={`${subtitle?.height || finalConfig?.subtitle?.height || 'h-5'} ${subtitle?.width || finalConfig?.subtitle?.width || 'w-56'} mb-6`} 
        />
      )}
      
      {/* Fields */}
      {(fields || finalConfig?.fields) && (
        <div className={spacing}>
          {(fields || finalConfig?.fields || []).map((field, index) => (
            <div key={index} className={field.type === 'input' ? 'space-y-2' : ''}>
              {field.label && field.type === 'input' && (
                <Skeleton className="h-4 w-16" />
              )}
              <Skeleton className={getFieldClassName(field)} />
            </div>
          ))}
        </div>
      )}
      
      {/* Actions */}
      {finalConfig?.actions && (
        <div className="flex gap-4 mt-6">
          {finalConfig.actions.map((action, index) => (
            <Skeleton key={index} className={getFieldClassName(action)} />
          ))}
        </div>
      )}
    </div>
  )
}

// Specific skeleton components for common patterns
export function AuthFormSkeleton({ className }: { className?: string }) {
  return <UniversalSkeleton preset="authForm" className={className} />
}

export function ProductGridSkeleton({ className }: { className?: string }) {
  return <UniversalSkeleton preset="productGrid" className={className} />
}

export function OrdersListSkeleton({ className }: { className?: string }) {
  return <UniversalSkeleton preset="ordersList" className={className} />
}

// Hero section skeleton - commonly used
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Skeleton className="h-16 w-96 mx-auto mb-6 bg-white/20" />
        <Skeleton className="h-8 w-80 mx-auto mb-8 bg-white/20" />
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Skeleton className="h-12 w-40 bg-white/20" />
          <Skeleton className="h-12 w-40 bg-white/20" />
        </div>
      </div>
    </section>
  )
}
