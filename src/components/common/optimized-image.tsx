'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  aspectRatio?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  lazy?: boolean
  threshold?: number
  rootMargin?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  onLoad,
  onError,
  fallbackSrc = '/placeholder-product.jpg',
  lazy = true,
  threshold = 0.1,
  rootMargin = '50px'
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(!lazy || priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection observer for lazy loading
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  })

  // Load image when in viewport
  useEffect(() => {
    if (lazy && !priority && isIntersecting && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [isIntersecting, lazy, priority, shouldLoad])

  // Generate optimized sizes
  const generateSizes = () => {
    if (sizes) return sizes
    
    if (fill) {
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    }
    
    return `${width}px`
  }

  // Generate blur data URL
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL
    
    // Simple base64 encoded 1x1 pixel
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  }

  // Calculate dimensions with aspect ratio
  const calculateDimensions = () => {
    if (fill) return {}
    
    if (aspectRatio && width) {
      return {
        width,
        height: Math.round(width / aspectRatio)
      }
    }
    
    if (aspectRatio && height) {
      return {
        width: Math.round(height * aspectRatio),
        height
      }
    }
    
    return { width, height }
  }

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    console.warn(`Failed to load image: ${imageSrc}`)
    setHasError(true)
    setIsLoaded(false)
    
    // Try fallback image
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
    
    onError?.()
  }

  const dimensions = calculateDimensions()

  return (
    <div 
      ref={lazy ? ref : imgRef}
      className={`relative overflow-hidden ${className}`}
      style={fill ? {} : dimensions}
    >
      {shouldLoad ? (
        <>
          <Image
            src={imageSrc}
            alt={alt}
            fill={fill}
            {...(!fill && dimensions)}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={generateBlurDataURL()}
            sizes={generateSizes()}
            onLoad={handleLoad}
            onError={handleError}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${fill ? 'object-cover' : ''}`}
          />
          
          {/* Loading state */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
          
          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center flex-col space-y-2">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-500">Failed to load</span>
            </div>
          )}
        </>
      ) : (
        // Placeholder while waiting to load
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}

// Hook for progressive image loading
export function useProgressiveImg(lowQualitySrc: string, highQualitySrc: string) {
  const [src, setSrc] = useState(lowQualitySrc)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSrc(lowQualitySrc)
    setIsLoading(true)

    const img = new window.Image()
    img.src = highQualitySrc
    img.onload = () => {
      setSrc(highQualitySrc)
      setIsLoading(false)
    }
    img.onerror = () => {
      setIsLoading(false)
    }
  }, [lowQualitySrc, highQualitySrc])

  return [src, { isLoading }] as const
}

// Utility to generate responsive image sizes
export function generateResponsiveSizes(
  breakpoints: { size: string; width: number }[]
): string {
  return breakpoints
    .map(({ size, width }) => `${size} ${width}px`)
    .join(', ')
}

// Image optimization utilities
export const imageOptimization = {
  // Get optimized image URL for different use cases
  getOptimizedUrl: (
    src: string, 
    width: number, 
    quality: number = 85,
    format: 'webp' | 'jpeg' | 'png' = 'webp'
  ) => {
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      return src
    }
    
    const url = new URL(src, window.location.origin)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('q', quality.toString())
    url.searchParams.set('f', format)
    
    return url.toString()
  },

  // Preload critical images
  preloadImage: (src: string, priority: boolean = false) => {
    if (typeof window === 'undefined') return

    const link = document.createElement('link')
    link.rel = priority ? 'preload' : 'prefetch'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  },

  // Generate srcSet for responsive images
  generateSrcSet: (src: string, widths: number[]) => {
    return widths
      .map(width => `${imageOptimization.getOptimizedUrl(src, width)} ${width}w`)
      .join(', ')
  }
}
