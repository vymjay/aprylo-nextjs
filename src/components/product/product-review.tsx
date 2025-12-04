"use client";

import { Review } from "@/types";
import InfiniteReviewList from "./review/infinite-review-list";
import ReviewForm from "./review/review-form";
import { useState, useEffect } from "react";
import { useAuthUser } from "@/hooks/api/use-users";

interface ProductReviewProps {
  productId: number;
  isLoggedIn: boolean;
}

export default function ProductReview({ productId, isLoggedIn }: ProductReviewProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: authUser } = useAuthUser()
  const currentUserId = authUser?.id || null

  const refreshReviews = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
      </div>
      
      {/* Write a Review Section - Moved to top for better UX */}
      {isLoggedIn && currentUserId && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Share Your Experience</h4>
          </div>
          <p className="text-gray-600 text-sm mb-4">Help other customers by sharing your thoughts about this product.</p>
          <ReviewForm
            productId={productId}
            onSuccess={refreshReviews}
          />
        </div>
      )}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <h4 className="text-lg font-medium mb-2 text-gray-900">Share Your Experience</h4>
            <p className="text-gray-600 mb-4">Help others by writing a review of this product.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Please log in to write a review
            </div>
          </div>
        </div>
      )}
      
      {/* Reviews List Section */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 rounded-full">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Customer Reviews</h4>
        </div>
        <InfiniteReviewList key={refreshKey} productId={productId} onRefresh={refreshReviews} />
      </div>
    </div>
  );
}
