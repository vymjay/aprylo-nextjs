"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { Badge } from "@/components/ui/badge"
import ReviewUpvote from "./review-upvote"
import StarRating from "@/components/ui/star-rating"
import ReviewForm from "./review-form"
import { User, Loader2 } from "lucide-react"
import DeleteReviewButton from "./delete-review-button"
import EditReviewButton from "./edit-review-button"
import { useToast } from "@/hooks/use-toast"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { useAuthUser } from "@/hooks/api/use-users"
import { useInfiniteQuery } from "@tanstack/react-query"
import { EXTENDED_REVIEW_KEYS, useDeleteReviewMutation } from "@/hooks/api/use-reviews"
import { fetcher } from "@/lib/utils/api-fetch"

interface Review {
  id: number
  title: string
  comment: string
  rating: number
  productId: number
  userId: number
  user?: {
    name: string
  }
  upvotes?: number
  hasUpvoted?: boolean
  createdAt?: string
  isVerifiedPurchase?: boolean
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasMore: boolean
  limit: number
}

interface ReviewListProps {
  productId: number
  onRefresh?: () => void
}

// Memoized individual review component for performance
const ReviewItem = memo(({ 
  review, 
  currentUserId, 
  editingReviewId, 
  setEditingReviewId, 
  handleReviewDelete,
  handleUpvoteChange,
  handleReviewSubmit,
  productId 
}: any) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    {editingReviewId === review.id ? (
      <ReviewForm
        productId={productId}
        existingReviewId={review.id}
        onSuccess={handleReviewSubmit}
        onCancel={() => setEditingReviewId(null)}
      />
    ) : (
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <span className="font-medium">{review.user?.name || "Anonymous"}</span>
              {review.isVerifiedPurchase && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Verified Purchase
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentUserId === review.userId && (
              <>
                <EditReviewButton
                  reviewId={review.id}
                  onEdit={() => setEditingReviewId(review.id)}
                />
                <DeleteReviewButton
                  reviewId={review.id}
                  productId={productId}
                  onDelete={() => handleReviewDelete(review.id)}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <StarRating rating={review.rating} />
          <span className="text-sm text-gray-500">
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
          </span>
        </div>

        <h4 className="font-medium text-lg mb-2">{review.title}</h4>
        <p className="text-gray-600 mb-4">{review.comment}</p>

        <ReviewUpvote
          reviewId={review.id}
          upvoted={review.hasUpvoted || false}
          upvotes={review.upvotes || 0}
          onUpvoteChange={(isUpvoted) => handleUpvoteChange(review.id, isUpvoted)}
        />
      </div>
    )}
  </div>
), (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.review.id === nextProps.review.id &&
    prevProps.review.upvotes === nextProps.review.upvotes &&
    prevProps.review.hasUpvoted === nextProps.review.hasUpvoted &&
    prevProps.editingReviewId === nextProps.editingReviewId &&
    prevProps.currentUserId === nextProps.currentUserId
  )
})

export default function InfiniteReviewList({ productId, onRefresh }: ReviewListProps) {
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const { toast } = useToast()
  const { data: authUser } = useAuthUser()
  const currentUserId = authUser?.id || null
  const deleteReviewMutation = useDeleteReviewMutation()

  // Use React Query infinite query for reviews
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: EXTENDED_REVIEW_KEYS.byProductInfinite(productId),
    queryFn: ({ pageParam = 1 }) => {
      return fetcher<{ reviews: Review[], pagination: PaginationInfo }>(
        `/api/reviews?productId=${productId}&page=${pageParam}&limit=5`
      )
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasMore ? lastPage.pagination.currentPage + 1 : undefined
    },
    initialPageParam: 1,
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Flatten all reviews from pages
  const allReviews = data?.pages.flatMap((page) => page.reviews) || []

  // Transform reviews for display (memoized for performance)
  const transformedReviews = useMemo(() => {
    return allReviews.map((r: any) => ({
      id: r.id,
      title: r.title || "Review",
      comment: r.comment,
      rating: r.rating,
      productId: r.productId,
      userId: r.userId,
      user: r.User || r.user || { name: `User ${r.userId}` },
      createdAt: r.createdAt,
      upvotes: r.upvotes || 0,
      hasUpvoted: r.ReviewUpvote ? r.ReviewUpvote.some((u: any) => u.userid === currentUserId) : false,
      isVerifiedPurchase: !!r.isVerifiedPurchase,
    }))
  }, [allReviews, currentUserId])

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  })

  // Load more when intersection observed
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage()
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage])

  const handleReviewDelete = useCallback(async (reviewId: number) => {
    try {
      await deleteReviewMutation.mutateAsync({ reviewId, productId })
      toast({
        title: "Success",
        description: "Review deleted successfully",
      })
      onRefresh?.()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    }
  }, [deleteReviewMutation, productId, toast, onRefresh])

  const handleUpvoteChange = useCallback((reviewId: number, isUpvoted: boolean) => {
    // The upvote mutation should invalidate reviews automatically
    refetch()
  }, [refetch])

  const handleReviewSubmit = useCallback(() => {
    refetch() // Refresh reviews
    setEditingReviewId(null)
    onRefresh?.()
  }, [refetch, onRefresh])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading reviews...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {transformedReviews.length > 0 ? (
          transformedReviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              editingReviewId={editingReviewId}
              setEditingReviewId={setEditingReviewId}
              handleReviewDelete={handleReviewDelete}
              handleUpvoteChange={handleUpvoteChange}
              handleReviewSubmit={handleReviewSubmit}
              productId={productId}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        )}

        {/* Load more trigger */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin mr-2" />
                <span>Loading more reviews...</span>
              </div>
            ) : (
              <span className="text-gray-500">Scroll to load more</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
