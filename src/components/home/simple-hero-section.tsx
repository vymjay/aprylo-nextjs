'use client';

import { Suspense } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import HeroSection from './hero-section';

const HeroSkeleton = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <Skeleton className="h-16 w-96 mx-auto mb-6 bg-white/20" />
      <Skeleton className="h-8 w-80 mx-auto mb-8 bg-white/20" />
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Skeleton className="h-12 w-40 bg-white/20" />
        <Skeleton className="h-12 w-40 bg-white/20" />
      </div>
    </div>
  </section>
);

export default function LazyHeroSection() {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px',
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      {isIntersecting ? (
        <div className="animate-fade-in">
          <HeroSection />
        </div>
      ) : (
        <HeroSkeleton />
      )}
    </div>
  );
}
