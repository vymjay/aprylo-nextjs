'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import LazyProductCard from './lazy-product-card';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';

interface InfiniteProductGridProps {
  initialProducts: Product[];
  hasMore?: boolean;
  onLoadMore?: () => Promise<Product[]>;
  loading?: boolean;
  category?: string;
  search?: string;
}

const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    ))}
  </div>
);

export default function InfiniteProductGrid({
  initialProducts,
  hasMore = false,
  onLoadMore,
  loading = false,
  category,
  search,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentHasMore, setCurrentHasMore] = useState(hasMore);

  // Reset products when filters change
  useEffect(() => {
    setProducts(initialProducts);
    setCurrentHasMore(hasMore);
  }, [initialProducts, hasMore, category, search]);

  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: false,
  });

  const loadMore = useCallback(async () => {
    if (!onLoadMore || isLoadingMore || !currentHasMore) return;

    setIsLoadingMore(true);
    try {
      const newProducts = await onLoadMore();
      if (newProducts.length === 0) {
        setCurrentHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [onLoadMore, isLoadingMore, currentHasMore]);

  useEffect(() => {
    if (isIntersecting && currentHasMore && !isLoadingMore) {
      loadMore();
    }
  }, [isIntersecting, currentHasMore, isLoadingMore, loadMore]);

  if (loading && products.length === 0) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">
          Try adjusting your search or browse our categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <LazyProductCard
            key={product.id}
            product={product}
            index={index}
            delay={index * 50} // Stagger animations
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {currentHasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Loading more products...</span>
            </div>
          ) : (
            <div className="text-gray-400">Loading more...</div>
          )}
        </div>
      )}

      {/* End Message */}
      {!currentHasMore && products.length > 8 && (
        <div className="text-center py-8">
          <p className="text-gray-500">You've seen all products!</p>
        </div>
      )}
    </div>
  );
}
