import { useQueryClient } from '@tanstack/react-query'
import { 
  CATEGORY_KEYS, 
  PRODUCT_KEYS, 
  USER_KEYS, 
  CART_KEYS, 
  REVIEW_KEYS,
  EXTENDED_REVIEW_KEYS
} from '@/hooks/api'

/**
 * Custom hook that provides cache invalidation utilities
 * for managing API data consistency across the application
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient()

  return {
    // Category invalidations
    invalidateCategories: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all })
    },

    // Product invalidations
    invalidateProducts: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
    },
    invalidateProduct: (productId: string | number) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(productId) })
    },
    invalidateProductVariants: (productId: string | number) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.variants(productId) })
    },

    // User invalidations
    invalidateCurrentUser: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() })
    },
    invalidateUserAddresses: (userId?: string | number) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: USER_KEYS.addresses(userId) })
      }
      queryClient.invalidateQueries({ queryKey: USER_KEYS.currentAddresses() })
    },

    // Cart invalidations
    invalidateCart: (userId: string | number) => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.list(userId) })
    },
    invalidateAllCarts: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all })
    },

    // Review invalidations
    invalidateReviews: (productId: string | number) => {
      queryClient.invalidateQueries({ queryKey: EXTENDED_REVIEW_KEYS.byProduct(productId) })
    },
    invalidateReview: (reviewId: string | number) => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.detail(reviewId) })
    },
    invalidateReviewUpvotes: (reviewId: string | number) => {
      queryClient.invalidateQueries({ queryKey: EXTENDED_REVIEW_KEYS.upvotes(reviewId) })
    },

    // Bulk invalidations
    invalidateAll: () => {
      queryClient.invalidateQueries()
    },
    
    // User session related invalidations (useful for login/logout)
    invalidateUserSession: (userId?: string | number) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() })
      queryClient.invalidateQueries({ queryKey: USER_KEYS.currentAddresses() })
      if (userId) {
        queryClient.invalidateQueries({ queryKey: CART_KEYS.list(userId) })
      }
    },

    // Product-related bulk invalidation (useful when product data changes)
    invalidateProductData: (productId: string | number) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(productId) })
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.variants(productId) })
      queryClient.invalidateQueries({ queryKey: EXTENDED_REVIEW_KEYS.byProduct(productId) })
    },

    // Cache utilities
    setQueryData: <T>(queryKey: any[], data: T) => {
      queryClient.setQueryData(queryKey, data)
    },
    
    getQueryData: <T>(queryKey: any[]): T | undefined => {
      return queryClient.getQueryData<T>(queryKey)
    },

    // Remove specific queries from cache
    removeQueries: (queryKey: any[]) => {
      queryClient.removeQueries({ queryKey })
    },

    // Clear all cache
    clearCache: () => {
      queryClient.clear()
    },

    // Prefetch utilities
    prefetchProducts: (filters: object = {}) => {
      queryClient.prefetchQuery({
        queryKey: PRODUCT_KEYS.list(filters),
        queryFn: () => fetch(`/api/products?${new URLSearchParams(filters as Record<string, string>)}`).then(res => res.json()),
      })
    },

    prefetchCategories: () => {
      queryClient.prefetchQuery({
        queryKey: CATEGORY_KEYS.list(),
        queryFn: () => fetch('/api/categories').then(res => res.json()),
      })
    },
  }
}

/**
 * Optimistic update utilities for immediate UI feedback
 */
export function useOptimisticUpdates() {
  const queryClient = useQueryClient()

  return {
    // Cart optimistic updates
    optimisticAddToCart: (userId: string | number, newItem: any) => {
      queryClient.setQueryData(
        CART_KEYS.list(userId),
        (old: any[] = []) => [...old, newItem]
      )
    },

    optimisticRemoveFromCart: (userId: string | number, itemId: number) => {
      queryClient.setQueryData(
        CART_KEYS.list(userId),
        (old: any[] = []) => old.filter((item: any) => item.id !== itemId)
      )
    },

    optimisticUpdateCartItem: (userId: string | number, itemId: number, updates: any) => {
      queryClient.setQueryData(
        CART_KEYS.list(userId),
        (old: any[] = []) => old.map((item: any) => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      )
    },

    // Review optimistic updates
    optimisticAddReview: (productId: string | number, newReview: any) => {
      queryClient.setQueryData(
        EXTENDED_REVIEW_KEYS.byProduct(productId),
        (old: any[] = []) => [newReview, ...old]
      )
    },

    optimisticRemoveReview: (productId: string | number, reviewId: number) => {
      queryClient.setQueryData(
        EXTENDED_REVIEW_KEYS.byProduct(productId),
        (old: any[] = []) => old.filter((review: any) => review.id !== reviewId)
      )
    },

    // Upvote optimistic updates
    optimisticToggleUpvote: (reviewId: string | number, increment: number) => {
      queryClient.setQueryData(
        EXTENDED_REVIEW_KEYS.upvotes(reviewId),
        (old: any[] = []) => {
          // Logic to optimistically update upvote count
          return old // This would need more specific implementation
        }
      )
    },
  }
}
