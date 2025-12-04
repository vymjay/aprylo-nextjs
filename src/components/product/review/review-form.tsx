"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { useReview, useCreateReviewMutation, useUpdateReviewMutation } from "@/hooks/api/use-reviews";
import { useAuthUser } from "@/hooks/api/use-users";

interface ReviewFormProps {
  productId: number;
  existingReviewId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  existingReviewId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const { data: authUser } = useAuthUser()

  // Use hooks for review operations
  const { data: existingReview } = useReview(existingReviewId || 0)
  const createReviewMutation = useCreateReviewMutation()
  const updateReviewMutation = useUpdateReviewMutation()

  const isLoading = createReviewMutation.isPending || updateReviewMutation.isPending

  // Populate form if editing existing review
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title || "");
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !comment.trim() || !title.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!authUser?.id) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit a review.",
          variant: "destructive",
        });
        return;
      }

      const reviewData = {
        productId,
        rating,
        title,
        comment,
        // Remove userId - it will be set by the API from authentication
      };

      if (existingReviewId) {
        await updateReviewMutation.mutateAsync({ id: existingReviewId, ...reviewData })
      } else {
        await createReviewMutation.mutateAsync(reviewData)
      }

      toast({
        title: "Success",
        description: `Review ${existingReviewId ? "updated" : "submitted"} successfully`,
      });

      // Reset form if creating new review
      if (!existingReviewId) {
        setRating(0);
        setTitle("");
        setComment("");
      }

      // Notify parent
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to submit review";
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div className="space-y-3">
          <label htmlFor="rating" className="block text-sm font-semibold text-gray-900">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  value <= rating
                    ? "text-yellow-400 hover:text-yellow-500 bg-yellow-50"
                    : "text-gray-300 hover:text-gray-400 hover:bg-gray-50"
                }`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-3 text-sm text-gray-600 font-medium">
                {rating} of 5 stars
              </span>
            )}
          </div>
        </div>

        {/* Title Section */}
        <div className="space-y-3">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm placeholder-gray-500"
            placeholder="Summarize your experience..."
            required
          />
        </div>

        {/* Comment Section */}
        <div className="space-y-3">
          <label htmlFor="comment" className="block text-sm font-semibold text-gray-900">
            Review Details <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm placeholder-gray-500 resize-none"
            placeholder="Share your thoughts about this product..."
            required
          />
          <div className="text-right">
            <span className="text-xs text-gray-500">
              {comment.length}/500 characters
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || rating === 0}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              existingReviewId ? "Update Review" : "Submit Review"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}