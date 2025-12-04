/**
 * Common Patterns Library - Standardized feature organization and structure
 * This file defines common patterns used across the application for consistency
 */

// ==================== QUERY PATTERNS ====================

/**
 * Standard query key factory pattern
 * All API hooks should follow this structure for consistent cache management
 */
export interface QueryKeyFactory<T = string> {
  all: readonly [T]
  lists: () => readonly [T, 'list']
  list: (filters: Record<string, any>) => readonly [T, 'list', Record<string, any>]
  details: () => readonly [T, 'detail']
  detail: (id: string | number) => readonly [T, 'detail', string | number]
  infinite: (filters: Record<string, any>) => readonly [T, 'infinite', Record<string, any>]
}

/**
 * Creates a standardized query key factory
 * @param entityName - The name of the entity (e.g., 'products', 'reviews')
 */
export function createQueryKeyFactory<T extends string>(entityName: T): QueryKeyFactory<T> {
  return {
    all: [entityName] as const,
    lists: () => [entityName, 'list'] as const,
    list: (filters: Record<string, any>) => [entityName, 'list', filters] as const,
    details: () => [entityName, 'detail'] as const,
    detail: (id: string | number) => [entityName, 'detail', id] as const,
    infinite: (filters: Record<string, any>) => [entityName, 'infinite', filters] as const,
  }
}

// ==================== API PATTERNS ====================

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  meta?: {
    pagination?: PaginationInfo
    total?: number
    [key: string]: any
  }
}

/**
 * Standard pagination structure
 */
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasMore: boolean
  limit: number
}

/**
 * Standard infinite query options
 */
export interface InfiniteQueryOptions {
  limit?: number
  staleTime?: number
  cacheTime?: number
}

// ==================== COMPONENT PATTERNS ====================

/**
 * Standard component props for features with CRUD operations
 */
export interface CrudComponentProps<T = any> {
  id?: string | number
  data?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onCancel?: () => void
  isEdit?: boolean
  isLoading?: boolean
}

/**
 * Standard list component props
 */
export interface ListComponentProps<T = any> {
  items: T[]
  loading?: boolean
  error?: Error | null
  onRefresh?: () => void
  onLoadMore?: () => void
  hasMore?: boolean
  emptyMessage?: string
}

/**
 * Standard form component props
 */
export interface FormComponentProps<T = any> {
  initialData?: Partial<T>
  onSubmit: (data: T) => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitText?: string
  cancelText?: string
}

// ==================== SKELETON PATTERNS ====================

/**
 * Standard skeleton configurations for different component types
 */
export const SKELETON_PRESETS = {
  card: {
    fields: [
      { type: 'image' as const, className: 'aspect-square' },
      { type: 'text' as const, width: 'w-3/4', height: 'h-4' },
      { type: 'text' as const, width: 'w-1/2', height: 'h-4' },
    ]
  },
  list: {
    fields: Array.from({ length: 5 }, () => ({
      type: 'card' as const,
      height: 'h-24'
    }))
  },
  form: {
    title: { width: 'w-48', height: 'h-8' },
    fields: [
      { type: 'input' as const, label: 'Field 1' },
      { type: 'input' as const, label: 'Field 2' },
      { type: 'input' as const, label: 'Field 3' },
    ],
    actions: [
      { type: 'button' as const, width: 'w-full', height: 'h-12' }
    ]
  }
} as const

// ==================== HOOK PATTERNS ====================

/**
 * Standard options for data fetching hooks
 */
export interface UseDataOptions {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
  refetchOnMount?: boolean
  retry?: number | boolean
}

/**
 * Standard mutation options
 */
export interface UseMutationOptions<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void
}

// ==================== PERFORMANCE PATTERNS ====================

/**
 * Standard performance monitoring configuration
 */
export interface PerformanceConfig {
  logThreshold?: number // Log if operation exceeds this (ms)
  warnThreshold?: number // Warn if operation exceeds this (ms)
  trackMemory?: boolean
  trackUpdates?: boolean
  enabled?: boolean
}

/**
 * Default performance thresholds by component type
 */
export const PERFORMANCE_THRESHOLDS = {
  component: { logThreshold: 16, warnThreshold: 50 }, // 60fps, 20fps
  page: { logThreshold: 100, warnThreshold: 300 },
  api: { logThreshold: 200, warnThreshold: 1000 },
  image: { logThreshold: 50, warnThreshold: 200 }
} as const

// ==================== ERROR PATTERNS ====================

/**
 * Standard error types used across the application
 */
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

/**
 * Standard error structure
 */
export interface AppError {
  type: ErrorType
  message: string
  code?: string | number
  details?: Record<string, any>
  timestamp: Date
}

// ==================== FEATURE ORGANIZATION PATTERNS ====================

/**
 * Standard feature structure template
 * Each feature should follow this organization pattern
 */
export interface FeatureStructure {
  // Components
  components: {
    list: string // Main list/grid component
    item: string // Individual item component
    form: string // Create/Edit form component
    detail: string // Detail view component
    skeleton: string // Loading skeleton
  }
  // Hooks
  hooks: {
    useList: string // List data hook
    useDetail: string // Detail data hook
    useCreate: string // Create mutation hook
    useUpdate: string // Update mutation hook
    useDelete: string // Delete mutation hook
  }
  // Types
  types: {
    entity: string // Main entity type
    listProps: string // List component props
    formProps: string // Form component props
    apiResponse: string // API response type
  }
  // API
  api: {
    endpoints: string[] // API endpoint paths
    queryKeys: string // Query key factory
  }
}

/**
 * Utility function to generate feature structure paths
 */
export function generateFeaturePaths(featureName: string): FeatureStructure {
  const basePath = `src/components/${featureName}`
  const hooksPath = `src/hooks/api/use-${featureName}`
  const typesPath = `src/types/${featureName}`
  
  return {
    components: {
      list: `${basePath}/${featureName}-list.tsx`,
      item: `${basePath}/${featureName}-item.tsx`,
      form: `${basePath}/${featureName}-form.tsx`,
      detail: `${basePath}/${featureName}-detail.tsx`,
      skeleton: `${basePath}/${featureName}-skeleton.tsx`,
    },
    hooks: {
      useList: `${hooksPath}.ts`,
      useDetail: `${hooksPath}.ts`,
      useCreate: `${hooksPath}.ts`,
      useUpdate: `${hooksPath}.ts`,
      useDelete: `${hooksPath}.ts`,
    },
    types: {
      entity: `${typesPath}.ts`,
      listProps: `${typesPath}.ts`,
      formProps: `${typesPath}.ts`,
      apiResponse: `${typesPath}.ts`,
    },
    api: {
      endpoints: [`/api/${featureName}`],
      queryKeys: `${hooksPath}.ts`,
    }
  }
}

// ==================== UTILITY PATTERNS ====================

/**
 * Standard debounce configuration
 */
export interface DebounceConfig {
  delay: number
  leading?: boolean
  trailing?: boolean
}

/**
 * Common debounce delays by use case
 */
export const DEBOUNCE_DELAYS = {
  search: 300,
  api: 500,
  resize: 100,
  scroll: 50,
  input: 200
} as const

/**
 * Standard loading states
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * Standard modal/dialog configuration
 */
export interface ModalConfig {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default {
  createQueryKeyFactory,
  SKELETON_PRESETS,
  PERFORMANCE_THRESHOLDS,
  DEBOUNCE_DELAYS,
  generateFeaturePaths,
  ErrorType,
  LoadingState
}
