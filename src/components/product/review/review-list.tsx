"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import ReviewUpvote from "./review-upvote"
import StarRating from "@/components/ui/star-rating"
import ReviewForm from "./review-form"
import { User } from "lucide-react"
import DeleteReviewButton from "./delete-review-button"
import EditReviewButton from "./edit-review-button"
import { useToast } from "@/hooks/use-toast"
import { useAuthUser } from "@/hooks/api/use-users"
import { useReviews, useDeleteReviewMutation } from "@/hooks/api/use-reviews"

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

interface ReviewListProps {
  productId: number
  onRefresh?: () => void
}

export default function ReviewList({ productId, onRefresh }: ReviewListProps) {
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const { toast } = useToast()
  const { data: authUser } = useAuthUser()
  const currentUserId = authUser?.id || null

  // Use the review hooks instead of manual fetching
  const { data: reviews = [], isLoading: loading, refetch: refetchReviews } = useReviews(productId)
  const deleteReviewMutation = useDeleteReviewMutation()

  // Transform the reviews data to match the expected format
  const transformedReviews = reviews.map((r: any) => ({
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

  const handleReviewDelete = async (reviewId: number) => {
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
  }

  const handleUpvoteChange = (reviewId: number, isUpvoted: boolean) => {
    // Since we're using React Query, the mutation will handle cache updates
    refetchReviews()
  }

  const handleEditReview = (reviewId: number) => {
    setEditingReviewId(reviewId)
  }

  const handleEditCancel = () => {
    setEditingReviewId(null)
  }

  const handleEditSuccess = () => {
    setEditingReviewId(null)
    refetchReviews() // Refresh the reviews to show updated data
    toast({
      title: "Success",
      description: "Review updated successfully",
    })
  }

  if (loading) {
    return <div>Loading reviews...</div>
  }

  return (
    <div className="space-y-8">
      {transformedReviews.map((review) => (
        <div key={review.id} className="border-b pb-8">
          {editingReviewId === review.id ? (
            // Show edit form
            <div className="space-y-4">
              <h4 className="font-medium">Edit Review</h4>
              <ReviewForm
                productId={productId}
                existingReviewId={review.id}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            </div>
          ) : (
            // Show review display
            <>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <User size={24} className="text-gray-400" />
                  <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                </div>
                {review.isVerifiedPurchase && (
                  <Badge variant="outline">Verified Purchase</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} />
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt || "").toLocaleDateString()}
                </span>
              </div>

              <h4 className="font-medium mb-2">{review.title}</h4>
              <p className="text-gray-600 mb-4">{review.comment}</p>

              <div className="flex items-center gap-4">
                <ReviewUpvote
                  reviewId={review.id}
                  upvoted={review.hasUpvoted || false}
                  upvotes={review.upvotes || 0}
                  onUpvoteChange={(isUpvoted) =>
                    handleUpvoteChange(review.id, isUpvoted)
                  }
                />
                {currentUserId === review.userId && (
                  <div className="flex items-center gap-2">
                    <EditReviewButton
                      reviewId={review.id}
                      onEdit={() => handleEditReview(review.id)}
                    />
                    <DeleteReviewButton
                      reviewId={review.id}
                      productId={productId}
                      onDelete={() => handleReviewDelete(review.id)}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      {transformedReviews.length === 0 && !loading && (
        <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review this product!</p>
      )}
    </div>
  )
}
