'use client';

import { lazy, Suspense } from 'react';
import { Category } from '@/types';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the categories section component
const CategoriesSection = lazy(() => import('./categories-section'));

interface LazyCategoriesSectionProps {
  categories: Category[];
}

const CategoriesSkeleton = () => (
  <section className="py-20 bg-white dark:bg-slate-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <Skeleton className="h-12 w-64 mx-auto mb-6" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl">
            <Skeleton className="h-80 w-full" />
            <div className="absolute inset-0 bg-black/20">
              <div className="absolute bottom-8 left-8">
                <Skeleton className="h-8 w-32 mb-2 bg-white/30" />
                <Skeleton className="h-4 w-24 bg-white/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default function LazyCategoriesSection({ categories }: LazyCategoriesSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      {isIntersecting ? (
        <Suspense fallback={<CategoriesSkeleton />}>
          <div className="animate-fade-in-up">
            <CategoriesSection categories={categories} />
          </div>
        </Suspense>
      ) : (
        <CategoriesSkeleton />
      )}
    </div>
  );
}
