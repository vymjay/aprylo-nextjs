'use client';

import { Suspense } from 'react';
import ProductReview from '../product-review';

interface LazyReviewSectionProps {
  productId: number;
  isLoggedIn: boolean;
}

function ReviewSkeleton() {
  return (
    <div className="space-y-6 mt-12 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48"></div>
      
      {/* Review items skeleton */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-b pb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
      
      <div className="text-center py-4">
        <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
      </div>
    </div>
  );
}

export default function LazyReviewSection({ productId, isLoggedIn }: LazyReviewSectionProps) {
  return (
    <Suspense fallback={<ReviewSkeleton />}>
      <ProductReview productId={productId} isLoggedIn={isLoggedIn} />
    </Suspense>
  );
}
