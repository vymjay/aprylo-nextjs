'use client';

import { lazy, Suspense } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the product card component
import ProductCard from '@/components/product/product-card';

interface LazyFeaturedProductsProps {
  products: Product[];
}

const FeaturedProductsSkeleton = () => (
  <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <Skeleton className="h-12 w-80 mx-auto mb-6" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Array.from({ length: 8 }).map((_, i) => (
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
      <div className="text-center">
        <Skeleton className="h-12 w-48 mx-auto" />
      </div>
    </div>
  </section>
);

export default function LazyFeaturedProducts({ products }: LazyFeaturedProductsProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      {isIntersecting ? (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Featured Products
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover our handpicked selection of premium fashion items, 
                curated with style and quality in mind.
              </p>
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {products.map((product, index) => (
                    <ProductCard 
                      key={product.id}
                      product={product} 
                      index={index}
                    />
                  ))}
                </div>

                <div className="text-center animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                  <Button asChild size="lg" className="px-8 py-3">
                    <Link href="/products">
                      View All Products
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 animate-fade-in-up">
                <h3 className="text-xl font-semibold mb-2">No products available</h3>
                <p className="text-muted-foreground mb-6">
                  We're working on adding amazing products. Check back soon!
                </p>
                <Button asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      ) : (
        <FeaturedProductsSkeleton />
      )}
    </div>
  );
}
