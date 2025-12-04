# Common Feature Structure Guide

This guide explains the standardized approach for organizing features in the Aprylo application. All features should follow these patterns for consistency and maintainability.

## 📁 Directory Structure

```
src/
├── components/
│   └── [feature]/
│       ├── [feature]-list.tsx          # Main list component
│       ├── [feature]-item.tsx          # Individual item component
│       ├── [feature]-form.tsx          # Create/Edit form
│       ├── [feature]-detail.tsx        # Detail view
│       ├── [feature]-skeleton.tsx      # Loading skeleton
│       └── index.ts                    # Export barrel
├── hooks/
│   └── api/
│       └── use-[feature].ts           # API hooks
├── types/
│   └── [feature].ts                   # TypeScript types
└── lib/
    ├── common-patterns.ts             # Common patterns library
    └── feature-generator.ts           # Feature generator utility
```

## 🎯 Common Patterns

### 1. Query Key Factory

All API hooks use a standardized query key factory:

```typescript
import { createQueryKeyFactory } from '@/lib/common-patterns'

export const FEATURE_KEYS = createQueryKeyFactory('feature')

// Usage:
FEATURE_KEYS.all           // ['feature']
FEATURE_KEYS.lists()       // ['feature', 'list']
FEATURE_KEYS.list(filters) // ['feature', 'list', filters]
FEATURE_KEYS.detail(id)    // ['feature', 'detail', id]
```

### 2. API Hook Structure

```typescript
// hooks/api/use-features.ts
export function useFeatures(filters = {}) {
  return useQuery({
    queryKey: FEATURE_KEYS.list(filters),
    queryFn: () => fetcher<Feature[]>(`/api/features?${params}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateFeatureMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: FeatureInput) => 
      fetcher<Feature>('/api/features', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEATURE_KEYS.lists() })
    },
  })
}
```

### 3. Component Structure

#### List Component

```typescript
// components/feature/feature-list.tsx
interface FeatureListProps {
  filters?: Record<string, any>
  onItemSelect?: (item: Feature) => void
  showCreateButton?: boolean
}

export default function FeatureList({ filters, onItemSelect, showCreateButton }: FeatureListProps) {
  // Standardized hooks usage
  const { data, isLoading, error, refetch } = useFeatures(filters)
  const deleteMutation = useDeleteFeatureMutation()
  
  // Memoized handlers
  const handleDelete = useCallback(async (id: number) => {
    // Standard error handling with toast
  }, [deleteMutation])
  
  // Standard loading and error states
  if (isLoading) return <FeatureSkeleton />
  if (error) return <ErrorState onRetry={refetch} />
  
  return (
    <div className="space-y-6">
      {/* Standard header with actions */}
      {/* Memoized item components */}
      {/* Standard empty state */}
    </div>
  )
}
```

#### Form Component

```typescript
// components/feature/feature-form.tsx
interface FeatureFormProps {
  feature?: Feature
  onSuccess?: (feature: Feature) => void
  onCancel?: () => void
}

export default function FeatureForm({ feature, onSuccess, onCancel }: FeatureFormProps) {
  const isEdit = !!feature
  const [formData, setFormData] = useState<FeatureInput>(getInitialData(feature))
  
  const createMutation = useCreateFeatureMutation()
  const updateMutation = useUpdateFeatureMutation()
  
  // Standard form handling
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    // Standard validation and submission
  }, [formData, isEdit])
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Standard form fields */}
      {/* Standard action buttons */}
    </form>
  )
}
```

### 4. Performance Patterns

#### Memoization

```typescript
// Always memoize expensive calculations
const transformedData = useMemo(() => {
  return rawData.map(transform)
}, [rawData])

// Memoize event handlers
const handleClick = useCallback((id: number) => {
  onClick(id)
}, [onClick])

// Memoize sub-components
const MemoizedItem = memo(ItemComponent, customComparison)
```

#### Skeleton Loading

```typescript
// Use consistent skeleton patterns
import { SKELETON_PRESETS } from '@/lib/common-patterns'

function FeatureSkeleton() {
  return <UniversalSkeleton preset="list" />
}
```

## 🛠 Feature Generator

Use the feature generator to create new features:

```typescript
import { generateFeature } from '@/lib/feature-generator'

const featureConfig = {
  name: 'notifications',
  entityName: 'notification',
  hasInfiniteScroll: true,
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'message', type: 'text', required: true },
    { name: 'read', type: 'boolean', required: false },
  ]
}

const files = generateFeature(featureConfig)
// Generates all necessary files with proper structure
```

## 📊 Performance Standards

### Component Performance

- **Render time**: < 16ms (60fps)
- **Mount time**: < 100ms
- **Memory usage**: Monitor with `usePerformanceMonitor`

```typescript
import { usePerformanceMonitor } from '@/hooks/use-performance'

export default function MyComponent() {
  const { metrics } = usePerformanceMonitor('MyComponent', {
    logThreshold: 16,
    warnThreshold: 50,
  })
  
  // Component logic
}
```

### API Performance

- **Response time**: < 200ms for lists, < 100ms for cached data
- **Stale time**: 5 minutes for lists, 2 minutes for detail views
- **Background refetch**: Enabled for critical data

## 🎨 UI Consistency

### Loading States

```typescript
// Standard loading component usage
if (isLoading) return <FeatureSkeleton />
if (isFetchingNextPage) return <InlineLoader />

// Use loading states consistently
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
  Submit
</Button>
```

### Error States

```typescript
// Standard error handling
if (error) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600">Failed to load {featureName}s</p>
      <Button onClick={() => refetch()} variant="outline" className="mt-4">
        Retry
      </Button>
    </div>
  )
}
```

### Empty States

```typescript
// Consistent empty states
{items?.length === 0 && (
  <div className="text-center py-12 text-gray-500">
    <EmptyIcon className="w-12 h-12 mx-auto mb-4" />
    <p>No {featureName}s found</p>
    {canCreate && (
      <Button onClick={handleCreate} className="mt-4">
        Create your first {featureName}
      </Button>
    )}
  </div>
)}
```

## 🔧 Utilities

### Common Hooks

```typescript
// Use standardized hooks
import { 
  useDebounce,
  useLocalStorage,
  useIntersectionObserver,
  usePerformanceMonitor
} from '@/hooks'

// Performance monitoring
const { metrics } = usePerformanceMonitor('ComponentName')

// Debounced search
const debouncedSearch = useDebounce(searchTerm, 300)

// Intersection observer for lazy loading
const { ref, isIntersecting } = useIntersectionObserver()
```

### Error Handling

```typescript
import { ErrorType, AppError } from '@/lib/common-patterns'

// Standardized error creation
const createAppError = (type: ErrorType, message: string, details?: any): AppError => ({
  type,
  message,
  details,
  timestamp: new Date()
})

// Use in mutation error handling
onError: (error) => {
  const appError = createAppError(ErrorType.NETWORK, 'Failed to save', { error })
  logError(appError)
  toast({ title: 'Error', description: appError.message, variant: 'destructive' })
}
```

## 📝 Naming Conventions

### Files
- `feature-list.tsx` - List/grid components
- `feature-form.tsx` - Forms (create/edit)
- `feature-item.tsx` - Individual items
- `feature-detail.tsx` - Detail views
- `feature-skeleton.tsx` - Loading skeletons

### Components
- `FeatureList` - Main list component
- `FeatureForm` - Form component
- `FeatureItem` - Item component (memoized)
- `FeatureSkeleton` - Loading skeleton

### Hooks
- `useFeatures()` - List data
- `useFeature(id)` - Single item
- `useCreateFeatureMutation()` - Create mutation
- `useUpdateFeatureMutation()` - Update mutation
- `useDeleteFeatureMutation()` - Delete mutation

### Query Keys
- `FEATURE_KEYS` - Main key factory
- `EXTENDED_FEATURE_KEYS` - Extended keys for specific operations

## ✅ Checklist for New Features

When creating a new feature, ensure:

- [ ] Uses `createQueryKeyFactory` for query keys
- [ ] Follows standard component structure
- [ ] Implements proper error handling
- [ ] Uses consistent loading states
- [ ] Includes performance monitoring
- [ ] Has memoized components and handlers
- [ ] Follows naming conventions
- [ ] Includes TypeScript types
- [ ] Has skeleton loading states
- [ ] Uses standard UI patterns

## 🎯 Benefits

This standardized approach provides:

1. **Consistency** - All features follow the same patterns
2. **Maintainability** - Easy to understand and modify
3. **Performance** - Built-in optimization patterns
4. **Developer Experience** - Predictable structure and tools
5. **Scalability** - Easy to add new features
6. **Type Safety** - Comprehensive TypeScript support
7. **Testing** - Standardized patterns are easier to test
8. **Documentation** - Self-documenting code structure

## 📚 Examples

See the following components for reference implementations:

- `src/components/product/review/infinite-review-list.tsx` - Infinite scroll list
- `src/hooks/api/use-reviews.ts` - API hooks with common patterns
- `src/lib/common-patterns.ts` - Common pattern definitions
- `src/lib/feature-generator.ts` - Feature generator utility

This structure ensures that all features in the Aprylo application follow consistent patterns, making the codebase easier to maintain and extend.
