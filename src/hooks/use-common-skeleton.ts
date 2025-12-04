/**
 * Reusable skeleton configuration generator for consistent skeleton loading patterns
 */

export interface SkeletonField {
  type: 'text' | 'input' | 'button' | 'image' | 'card'
  width?: string
  height?: string
  className?: string
  label?: string
}

export interface SkeletonConfig {
  title?: { width: string; height?: string }
  subtitle?: { width: string; height?: string }
  fields?: SkeletonField[]
  actions?: SkeletonField[]
  container?: {
    className?: string
    spacing?: 'tight' | 'normal' | 'loose'
  }
}

function getBaseClassName(type: SkeletonField['type']): string {
  switch (type) {
    case 'text':
      return ''
    case 'input':
      return ''
    case 'button':
      return 'rounded'
    case 'image':
      return 'rounded-lg'
    case 'card':
      return 'rounded-lg'
    default:
      return ''
  }
}

function getSizeClassName(field: SkeletonField): string {
  if (field.width && field.height) {
    return `${field.height} ${field.width}`
  }
  
  switch (field.type) {
    case 'text':
      return field.height || 'h-4'
    case 'input':
      return 'h-10 w-full'
    case 'button':
      return field.height || field.width || 'h-10 w-32'
    case 'image':
      return field.height || field.width || 'w-20 h-20'
    case 'card':
      return field.height || field.width || 'h-32 w-full'
    default:
      return 'h-4 w-24'
  }
}

function getSpacingClassName(spacing?: 'tight' | 'normal' | 'loose'): string {
  switch (spacing) {
    case 'tight':
      return 'space-y-2'
    case 'loose':
      return 'space-y-8'
    default:
      return 'space-y-6'
  }
}

export function useCommonSkeleton() {
  const getFieldClassName = (field: SkeletonField): string => {
    const baseClass = getBaseClassName(field.type)
    const sizeClass = getSizeClassName(field)
    return `${baseClass} ${sizeClass} ${field.className || ''}`.trim()
  }

  const getSpacing = (spacing?: 'tight' | 'normal' | 'loose'): string => {
    return getSpacingClassName(spacing)
  }

  return {
    getFieldClassName,
    getSpacing,
    configs: {
      // Auth form skeleton config
      authForm: {
        title: { width: 'w-48', height: 'h-8' },
        subtitle: { width: 'w-56', height: 'h-5' },
        fields: [
          { type: 'input' as const, label: 'Email' },
          { type: 'input' as const, label: 'Password' },
        ],
        actions: [
          { type: 'button' as const, width: 'w-full', height: 'h-12' }
        ],
        container: { className: 'max-w-md mx-auto', spacing: 'normal' as const }
      } as SkeletonConfig,
      // Product grid skeleton config
      productGrid: {
        fields: Array.from({ length: 8 }, () => ({
          type: 'card' as const,
          className: 'aspect-[4/5]'
        })),
        container: { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6', spacing: 'normal' as const }
      } as SkeletonConfig,
      // Orders skeleton config
      ordersList: {
        fields: Array.from({ length: 3 }, () => ({
          type: 'card' as const,
          height: 'h-48'
        })),
        container: { spacing: 'normal' as const }
      } as SkeletonConfig
    }
  }
}
