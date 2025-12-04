'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { Button } from '@/components/ui/button'

interface CategoriesSectionProps {
  categories: Category[]
}

export default function CategoriesSectionMobile({ categories }: CategoriesSectionProps) {
  const [imageStates, setImageStates] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({})
  const [isMobile, setIsMobile] = useState(false)

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

    return () => window.removeEventListener('resize', checkMobile)
  }, [categories])

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

  const renderImage = (category: Category, index: number) => {
    const state = imageStates[category.id] || 'loading'
    
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
        {/* Loading state */}
        {state === 'loading' && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        
        {/* Mobile-optimized image */}
        {isMobile ? (
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onLoad={() => handleImageLoad(category.id)}
            onError={() => handleImageError(category.id)}
            loading={index < 3 ? 'eager' : 'lazy'}
          />
        ) : (
          <Image
            src={category.image}
            alt={category.name}
            fill
            priority={index < 3}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized={process.env.NODE_ENV === 'development'}
            onLoad={() => handleImageLoad(category.id)}
            onError={() => handleImageError(category.id)}
          />
        )}
      </>
    )
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
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
          {categories.map((category, index) => (
            <div key={category.id} className="group relative overflow-hidden rounded-2xl shadow-lg">
              <div className="aspect-square relative category-image-container">
                {renderImage(category, index)}
                
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="mb-4 opacity-90">{category.description}</p>
                    <Button asChild variant="secondary">
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
