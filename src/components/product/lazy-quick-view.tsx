'use client';

import { lazy, Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';
import { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the product detail component
const LazyProductDetails = lazy(() => import('@/components/product/product-detail'));

interface LazyQuickViewProps {
  product: Product;
}

const QuickViewSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
    {/* Image skeleton */}
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-16 h-16 rounded" />
        ))}
      </div>
    </div>
    
    {/* Details skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

export default function LazyQuickView({ product }: LazyQuickViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openModal}
        className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all duration-300 hover:scale-110"
      >
        <Eye size={16} />
      </Button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full"
            >
              <X size={16} />
            </Button>
            
            <Suspense fallback={<QuickViewSkeleton />}>
              <LazyProductDetails product={product} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
