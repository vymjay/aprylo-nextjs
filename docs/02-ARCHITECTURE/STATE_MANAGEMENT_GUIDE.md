# State Management Migration Guide

## Overview

This document explains the new centralized state management system implemented to eliminate multiple API calls and improve user experience.

## Key Changes

### 1. React Query Integration

We've integrated TanStack Query (React Query) for:
- **Automatic caching**: Data is cached for configurable durations
- **Background refetching**: Data stays fresh automatically
- **Deduplication**: Multiple components requesting the same data result in a single API call
- **Error handling**: Consistent error states across the app
- **Loading states**: Built-in loading state management

### 2. Custom API Hooks

All API operations now use custom hooks that provide:
- Automatic caching and synchronization
- Built-in loading and error states
- Optimistic updates for better UX
- Type safety

### 3. Cache Management

Intelligent cache invalidation ensures data consistency:
- Related data is invalidated together
- Manual invalidation utilities for complex scenarios
- Optimistic updates for immediate feedback

## Migration Examples

### Before: Manual API Calls with useEffect

```tsx
// OLD WAY - Multiple components making the same API calls
function Header() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Component logic...
}

function CategoryDropdown() {
  const [categories, setCategories] = useState([])
  // Same API call repeated...
}
```

### After: Using API Hooks

```tsx
// NEW WAY - Single cached API call shared across components
import { useCategories } from '@/hooks/api'

function Header() {
  const { data: categories = [], isLoading, error } = useCategories()
  
  // No manual state management needed!
  // Data is automatically cached and shared
}

function CategoryDropdown() {
  const { data: categories = [], isLoading } = useCategories()
  
  // Same data, no additional API call!
}
```

## Available API Hooks

### Categories
```tsx
import { useCategories, useCategoryMutation } from '@/hooks/api'

// Fetch categories (cached for 15 minutes)
const { data: categories, isLoading, error } = useCategories()

// Create new category with automatic cache invalidation
const createCategory = useCategoryMutation()
```

### Products
```tsx
import { 
  useProducts, 
  useProduct, 
  useProductVariants,
  useInfiniteProducts 
} from '@/hooks/api'

// Fetch products with filters
const { data: products } = useProducts({ 
  category: 'men', 
  search: 'shirt',
  limit: 20 
})

// Fetch single product
const { data: product } = useProduct(productId)

// Fetch product variants
const { data: variants } = useProductVariants(productId)

// Infinite scroll products
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteProducts({ limit: 20 })
```

### Users & Authentication
```tsx
import { 
  useCurrentUser,
  useCurrentUserAddresses,
  useUpdateProfileMutation,
  useBatchUpdateAddressesMutation 
} from '@/hooks/api'

// Current user data
const { data: user, isLoading } = useCurrentUser()

// User addresses
const { data: addresses } = useCurrentUserAddresses()

// Update profile with optimistic updates
const updateProfile = useUpdateProfileMutation()
const handleUpdate = () => {
  updateProfile.mutate({ name: 'New Name' })
}
```

### Cart Management
```tsx
import { 
  useCart,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation 
} from '@/hooks/api'

// Cart data (fresh every 30 seconds)
const { data: cartItems = [] } = useCart(userId)

// Cart mutations with automatic cache updates
const addToCart = useAddToCartMutation()
const removeFromCart = useRemoveFromCartMutation()
const updateCartItem = useUpdateCartItemMutation()

const handleAddToCart = () => {
  addToCart.mutate({
    item: { userId, productId, quantity: 1, price: 29.99 }
  })
  // Cart data automatically refreshes!
}
```

### Reviews
```tsx
import { 
  useReviews,
  useCreateReviewMutation,
  useToggleReviewUpvoteMutation 
} from '@/hooks/api'

// Product reviews
const { data: reviews = [] } = useReviews(productId)

// Create review with automatic cache invalidation
const createReview = useCreateReviewMutation()

// Toggle upvote with optimistic updates
const toggleUpvote = useToggleReviewUpvoteMutation()
```

## Cache Management

### Automatic Invalidation
Most mutations automatically invalidate related cache entries:

```tsx
// Adding a review automatically invalidates product reviews
const createReview = useCreateReviewMutation()
createReview.mutate(reviewData) // Reviews list automatically refreshes
```

### Manual Cache Control
For complex scenarios, use cache utilities:

```tsx
import { useCacheInvalidation, useOptimisticUpdates } from '@/hooks/api'

const { invalidateProducts, invalidateUserSession } = useCacheInvalidation()
const { optimisticAddToCart } = useOptimisticUpdates()

// Manual invalidation
const handleLogout = () => {
  invalidateUserSession()
  // All user-related data cleared from cache
}

// Optimistic updates for instant feedback
const handleQuickAdd = (item) => {
  optimisticAddToCart(userId, item) // UI updates immediately
  addToCartMutation.mutate(item)    // Server sync happens in background
}
```

## Error Handling

Consistent error handling across the application:

```tsx
import { useApiErrorHandler } from '@/hooks/api'

const { handleError } = useApiErrorHandler()

// Automatic error handling with toast notifications
const { data, error } = useProducts()

if (error) {
  handleError(error, 'Failed to load products')
  // Shows appropriate toast, handles auth redirects, etc.
}
```

## Performance Benefits

### Before Implementation
- 🔴 Categories API called 3 times on homepage
- 🔴 User data fetched on every navigation
- 🔴 Cart synced manually with useState
- 🔴 No loading state coordination
- 🔴 Inconsistent error handling

### After Implementation
- ✅ Categories API called once, cached for 15 minutes
- ✅ User data cached across navigation
- ✅ Cart state synchronized automatically
- ✅ Coordinated loading states
- ✅ Global error handling with user-friendly messages

## Cache Configuration

Data freshness is configured per data type:

```tsx
// Categories: 15 minutes (rarely change)
staleTime: 15 * 60 * 1000

// Products: 5 minutes (moderate changes)
staleTime: 5 * 60 * 1000

// Cart: 30 seconds (frequent changes)
staleTime: 30 * 1000

// User data: 5 minutes
staleTime: 5 * 60 * 1000
```

## Migration Checklist

- [x] Install and configure TanStack Query
- [x] Create API hooks for all entities
- [x] Implement cache invalidation strategies
- [x] Add error handling utilities
- [x] Update components to use new hooks
- [x] Remove manual useEffect API calls
- [x] Add optimistic updates for better UX
- [x] Configure appropriate cache durations

## Best Practices

1. **Always use API hooks** instead of direct fetch calls
2. **Leverage cache invalidation** for data consistency
3. **Use optimistic updates** for immediate feedback
4. **Handle loading and error states** consistently
5. **Configure appropriate cache durations** based on data volatility
6. **Use prefetching** for anticipated user actions

## Next Steps

1. Monitor API call reduction in network tab
2. Measure improved user experience metrics
3. Add more sophisticated caching strategies as needed
4. Implement background sync for offline support
5. Add more optimistic updates for critical user flows
