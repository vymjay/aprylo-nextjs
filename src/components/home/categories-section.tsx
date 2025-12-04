'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { Category } from '@/types'
import { Button } from '@/components/ui/button'

interface CategoriesSectionProps {
  categories: Category[]
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  const [imageStates, setImageStates] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [imagesPreloaded, setImagesPreloaded] = useState(false)

  // Helper function to get optimized image paths
  const getOptimizedImageSrc = (originalImage: string, size: 'mobile' | 'tablet' | 'desktop' = 'desktop') => {
    // Map category images to optimized versions
    const imageMap: Record<string, string> = {
      '/models/men.jpg': '/models/optimized/men',
      '/models/women.jpg': '/models/optimized/women', 
      '/models/children.jpg': '/models/optimized/children'
    }
    
    const basePath = imageMap[originalImage]
    if (!basePath) {
      return originalImage // Fallback to original if no optimized version
    }
    
    const sizeMap = {
      mobile: '-400.jpg',
      tablet: '-600.jpg', 
      desktop: '-800.jpg'
    }
    
    return `${basePath}${sizeMap[size]}`
  }

  // Memoize optimized image URLs to prevent recreation on every render
  const optimizedCategories = useMemo(() => {
    return categories.map(category => ({
      ...category,
      // Use pre-optimized static images instead of query parameters
      optimizedImage: {
        mobile: getOptimizedImageSrc(category.image, 'mobile'),
        tablet: getOptimizedImageSrc(category.image, 'tablet'), 
        desktop: getOptimizedImageSrc(category.image, 'desktop'),
        original: category.image
      }
    }))
  }, [categories])

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Initialize loading states
    const initialStates: Record<number, 'loading' | 'loaded' | 'error'> = {}
    categories.forEach(category => {
      initialStates[category.id] = 'loading'
    })
    setImageStates(initialStates)

    // Preload critical images
    preloadCriticalImages()

    return () => window.removeEventListener('resize', checkMobile)
  }, [categories])

  // Preload first 2 images for faster initial render
  const preloadCriticalImages = async () => {
    const criticalCategories = categories.slice(0, 2)
    const preloadPromises = criticalCategories.map(category => {
      return new Promise<void>((resolve) => {
        const img = new window.Image()
        img.onload = () => resolve()
        img.onerror = () => resolve() // Don't block on error
        img.src = isMobile ? getOptimizedImageSrc(category.image, 'mobile') : getOptimizedImageSrc(category.image, 'tablet')
      })
    })
    
    await Promise.allSettled(preloadPromises)
    setImagesPreloaded(true)
  }

  const handleImageLoad = (categoryId: number) => {
    console.log(`✅ Category image loaded: ${categoryId}`, {
      mobile: isMobile,
      timestamp: new Date().toISOString()
    })
    setImageStates(prev => ({ ...prev, [categoryId]: 'loaded' }))
  }

  const handleImageError = (categoryId: number) => {
    console.error(`❌ Category image failed: ${categoryId}`, {
      mobile: isMobile,
      timestamp: new Date().toISOString()
    })
    setImageStates(prev => ({ ...prev, [categoryId]: 'error' }))
  }

  const renderImage = (category: typeof optimizedCategories[0], index: number) => {
    const state = imageStates[category.id] || 'loading'
    const isCritical = index < 2
    
    if (state === 'error') {
      return (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center flex-col space-y-2">
          <div className="text-gray-400 text-lg">📷</div>
          <span className="text-gray-500 text-sm">Image not available</span>
        </div>
      )
    }

    return (
      <>
        {/* Progressive loading placeholder */}
        {state === 'loading' && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="absolute inset-0 animate-shimmer opacity-75" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin" />
            </div>
          </div>
        )}
        
        {/* Optimized image rendering */}
        {isMobile ? (
          <img
            src={getOptimizedImageSrc(category.image, 'mobile')}
            alt={category.name}
            className={`absolute inset-0 w-full h-full object-cover optimized-image progressive-image transition-transform duration-500 group-hover:scale-110 ${
              state === 'loaded' ? 'loaded opacity-100' : 'loading opacity-0'
            }`}
            onLoad={() => handleImageLoad(category.id)}
            onError={() => handleImageError(category.id)}
            loading={isCritical ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <Image
            src={getOptimizedImageSrc(category.image, 'desktop')}
            alt={category.name}
            fill
            priority={isCritical}
            sizes="(max-width: 768px) 400px, (max-width: 1200px) 600px, 800px"
            className={`object-cover optimized-image progressive-image transition-transform duration-500 group-hover:scale-110 ${
              state === 'loaded' ? 'loaded opacity-100' : 'loading opacity-0'
            }`}
            quality={isCritical ? 90 : 80}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyBCA==" 
            unoptimized={false}
            onLoad={() => handleImageLoad(category.id)}
            onError={() => handleImageError(category.id)}
          />
        )}
      </>
    )
  }

  return (
    <section className="py-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collections for men, women, and children.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-500 mt-2">
              Mode: {isMobile ? 'Mobile' : 'Desktop'} | Categories: {categories.length}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 category-grid">
          {optimizedCategories.map((category, index) => (
            <div 
              key={category.id} 
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 animate-fade-in-up category-card"
              style={{ animationDelay: `${0.3 + index * 0.15}s` }}
            >
              <div className="aspect-square relative category-image-container overflow-hidden">
                {renderImage(category, index)}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/50 group-hover:via-black/10 transition-all duration-500" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="text-white transform transition-all duration-500 ease-out group-hover:translate-y-[-8px]">
                    <h3 className="text-2xl font-bold mb-2 transition-all duration-300 group-hover:text-white/95">{category.name}</h3>
                    <p className="mb-4 opacity-90 transition-all duration-300 group-hover:opacity-100 text-sm leading-relaxed">{category.description}</p>
                    <Button asChild variant="secondary" className="transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                      <Link href={`/products?category=${category.slug}`}>
                        Shop {category.name}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}