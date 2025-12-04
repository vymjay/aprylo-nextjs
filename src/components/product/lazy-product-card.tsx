'use client';

import { Product } from '@/types';
import ProductCard from './product-card';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import PerformanceMonitor from '@/components/common/performance-monitor';

interface LazyProductCardProps {
  product: Product;
  index?: number;
  delay?: number;
}

const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md">
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
);

export default function LazyProductCard({ product, index = 0, delay = 0 }: LazyProductCardProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="w-full">
      {isIntersecting ? (
        <div 
          className="animate-fade-in-up" 
          style={{ 
            animationDelay: `${delay}ms`,
            animationFillMode: 'both'
          }}
        >
          <PerformanceMonitor componentName={`ProductCard-${product.id}`} />
          <ProductCard product={product} index={index} />
        </div>
      ) : (
        <ProductCardSkeleton />
      )}
    </div>
  );
}
