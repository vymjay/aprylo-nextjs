import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '@/lib/utils/api-fetch'
import { createQueryKeyFactory } from '@/lib/common-patterns'
import type { Tables, TablesInsert } from '@/types/db'

type Review = Tables<'Review'>
type ReviewUpvote = Tables<'ReviewUpvote'>

// Query Keys - Following common patterns
export const REVIEW_KEYS = createQueryKeyFactory('reviews')

// Extended keys for review-specific operations
export const EXTENDED_REVIEW_KEYS = {
  ...REVIEW_KEYS,
  upvotes: (reviewId: string | number) => [...REVIEW_KEYS.detail(reviewId), 'upvotes'] as const,
  byProduct: (productId: string | number) => [...REVIEW_KEYS.lists(), 'product', productId] as const,
  byProductInfinite: (productId: string | number) => [...REVIEW_KEYS.lists(), 'product', productId, 'infinite'] as const,
}

// Hooks
export function useReviews(productId: string | number) {
  return useQuery({
    queryKey: EXTENDED_REVIEW_KEYS.byProduct(productId),
    queryFn: () => fetcher<Review[]>(`/api/reviews?productId=${productId}`),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useReview(reviewId: string | number) {
  return useQuery({
    queryKey: REVIEW_KEYS.detail(reviewId),
    queryFn: () => fetcher<Review>(`/api/reviews/${reviewId}`),
    enabled: !!reviewId && reviewId !== 0, // Don't fetch if reviewId is 0
    staleTime: 5 * 60 * 1000,
  })
}

export function useReviewUpvotes(reviewId: string | number) {
  return useQuery({
    queryKey: EXTENDED_REVIEW_KEYS.upvotes(reviewId),
    queryFn: () => fetcher<ReviewUpvote[]>(`/api/reviews/upvotes?reviewId=${reviewId}`),
    enabled: !!reviewId,
    staleTime: 30 * 1000, // 30 seconds for upvotes
  })
}

// Mutations
export function useCreateReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (review: Omit<TablesInsert<'Review'>, 'userId'> & { userId?: number }) => {
      return fetcher<Review>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ review }), // Wrap review data under 'review' key
      })
    },
    onSuccess: (data) => {
      // Invalidate all review-related queries for the product
      if (data.productId) {
        queryClient.invalidateQueries({ 
          queryKey: EXTENDED_REVIEW_KEYS.byProduct(data.productId) 
        })
        // Also invalidate infinite queries specifically
        queryClient.invalidateQueries({ 
          queryKey: EXTENDED_REVIEW_KEYS.byProductInfinite(data.productId)
        })
      }
    },
  })
}

export function useUpdateReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...review }: { id: number } & Partial<Review>) => {
      return fetcher<Review>('/api/reviews', {
        method: 'PUT',
        body: JSON.stringify({ review: { id, ...review } }), // Wrap review data under 'review' key and include id
      })
    },
    onSuccess: (data) => {
      // Update specific review cache
      queryClient.setQueryData(REVIEW_KEYS.detail(data.id), data)
      // Invalidate product reviews list
      if (data.productId) {
        queryClient.invalidateQueries({ 
          queryKey: EXTENDED_REVIEW_KEYS.byProduct(data.productId) 
        })
        // Also invalidate infinite queries specifically
        queryClient.invalidateQueries({ 
          queryKey: EXTENDED_REVIEW_KEYS.byProductInfinite(data.productId)
        })
      }
    },
  })
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reviewId, productId }: { reviewId: number; productId: number }) => {
      try {
        return await fetcher(`/api/reviews?id=${reviewId}`, {
          method: 'DELETE',
        })
      } catch (error: any) {
        // If it's a 404, the review is already deleted - consider it a success
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          return { success: true, alreadyDeleted: true };
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate product reviews list
      queryClient.invalidateQueries({ 
        queryKey: EXTENDED_REVIEW_KEYS.byProduct(variables.productId) 
      })
      // Also invalidate infinite queries specifically
      queryClient.invalidateQueries({ 
        queryKey: EXTENDED_REVIEW_KEYS.byProductInfinite(variables.productId)
      })
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: REVIEW_KEYS.detail(variables.reviewId) 
      })
    },
  })
}

export function useToggleReviewUpvoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reviewId, isUpvoted }: { reviewId: number; isUpvoted: boolean }) => {
      if (isUpvoted) {
        // Remove upvote
        return fetcher(`/api/reviews/upvotes?reviewId=${reviewId}`, {
          method: 'DELETE',
        })
      } else {
        // Add upvote
        return fetcher('/api/reviews/upvotes', {
          method: 'POST',
          body: JSON.stringify({ reviewId }),
        })
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate upvotes for this review
      queryClient.invalidateQueries({ 
        queryKey: EXTENDED_REVIEW_KEYS.upvotes(variables.reviewId) 
      })
    },
  })
}
