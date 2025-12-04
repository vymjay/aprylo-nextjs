'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallback?: string;
  skeletonClassName?: string;
  threshold?: number;
  rootMargin?: string;
}

export default function LazyImage({
  src,
  alt,
  fallback = '/placeholder-product.jpg',
  skeletonClassName,
  threshold = 0.1,
  rootMargin = '50px',
  className,
  fill,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const imageSrc = hasError ? fallback : src;

  // If using fill prop, we need a relative container
  if (fill) {
    return (
      <div ref={ref} className="relative w-full h-full">
        {isIntersecting ? (
          <>
            {!isLoaded && (
              <Skeleton className={skeletonClassName || "absolute inset-0 w-full h-full"} />
            )}
            <Image
              src={imageSrc}
              alt={alt}
              fill
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              } ${className || ''}`}
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                setHasError(true);
                setIsLoaded(true);
              }}
              {...props}
            />
          </>
        ) : (
          <Skeleton className={skeletonClassName || "w-full h-full"} />
        )}
      </div>
    );
  }

  // For non-fill images
  return (
    <div ref={ref}>
      {isIntersecting ? (
        <div className="relative">
          {!isLoaded && (
            <Skeleton className={skeletonClassName || "w-full h-full absolute inset-0"} />
          )}
          <Image
            src={imageSrc}
            alt={alt}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className || ''}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            {...props}
          />
        </div>
      ) : (
        <Skeleton className={skeletonClassName || "w-full h-full"} />
      )}
    </div>
  );
}
