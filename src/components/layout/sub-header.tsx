'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, MapPin, Truck, Gift, Percent, Star, Clock, Loader2, AlertCircle } from "lucide-react"
import { getCategoriesClient } from "@/lib/data/client-products"
import { Category } from "@/types"
import { useSearchParams, usePathname } from "next/navigation"
import CategoryDropdown from '@/components/navigation/category-dropdown'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function SubHeader() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [navigating, setNavigating] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const currentCategory = searchParams.get("category") || ""

  // Reset navigating state when pathname or search params change
  useEffect(() => {
    setNavigating(null)
  }, [pathname, searchParams])

  // Enhanced category fetching with error handling and retry
  useEffect(() => {
    async function fetchCategories() {
      try {
        setError(null)
        const data = await getCategoriesClient()
        setCategories(data)
        setRetryCount(0)
      } catch (error) {
        console.error("Failed to fetch categories", error)
        setError("Failed to load categories")
        
        // Auto-retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, Math.pow(2, retryCount) * 1000)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [retryCount])

  const currentCategoryName = categories.find(cat => cat.slug === currentCategory)?.name
  const isProductsPage = pathname === '/products'
  const isAllProductsSelected = isProductsPage && !currentCategory

  // Enhanced navigation with better UX feedback
  const handleNavigation = async (href: string, identifier: string) => {
    setNavigating(identifier)
    
    try {
      // Optimistic navigation for better perceived performance
      await router.push(href)
    } catch (error) {
      console.error("Navigation failed:", error)
      setNavigating(null)
    }
  }

  // Retry handler for failed category loading
  const handleRetry = () => {
    setLoading(true)
    setRetryCount(0)
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200 shadow-sm sticky top-16 z-30" role="navigation" aria-label="Product categories">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center h-12 space-x-4">
          {/* Category Dropdown with enhanced state handling */}
          <div className="flex-shrink-0 relative z-50">
            <CategoryDropdown />
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="h-6 px-2 text-xs hover:bg-red-50"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Horizontal Category Links - Desktop Only */}
          {!error && (
            <nav className="hidden lg:flex items-center space-x-5 flex-1 overflow-x-auto" role="navigation" aria-label="Category navigation">
              <button 
                onClick={() => handleNavigation('/products', 'all-products')}
                disabled={navigating === 'all-products' || loading}
                className={`text-sm font-medium transition-all duration-200 whitespace-nowrap px-3 py-2 rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isAllProductsSelected
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                } ${navigating === 'all-products' || loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                aria-current={isAllProductsSelected ? "page" : undefined}
                aria-label="View all products"
              >
                {navigating === 'all-products' && <Loader2 className="w-3 h-3 animate-spin" />}
                All Products
              </button>
              
              {loading ? (
                // Loading skeleton for category buttons
                <div className="flex items-center space-x-5">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : (
                categories.slice(0, 4).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleNavigation(`/products?category=${category.slug}`, category.slug)}
                    disabled={navigating === category.slug}
                    className={`text-sm font-medium transition-all duration-200 whitespace-nowrap px-3 py-2 rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      currentCategory === category.slug 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                    } ${navigating === category.slug ? 'opacity-75 cursor-not-allowed' : ''}`}
                    aria-current={currentCategory === category.slug ? "page" : undefined}
                    aria-label={`View ${category.name} products`}
                  >
                    {navigating === category.slug && <Loader2 className="w-3 h-3 animate-spin" />}
                    {category.name}
                  </button>
                ))
              )}
              
              {categories.length > 4 && !loading && (
                <div className="text-gray-500 text-sm whitespace-nowrap px-2 flex items-center">
                  <span>+{categories.length - 4} more</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation('/products', 'view-all')}
                    className="ml-2 h-6 px-2 text-xs hover:bg-gray-100"
                    aria-label="View all categories"
                  >
                    View All
                  </Button>
                </div>
              )}
            </nav>
          )}

          {/* Enhanced Mobile Section - Additional Info */}
          <div className="flex lg:hidden items-center justify-end flex-1">
            <div className="flex items-center space-x-3 text-xs">
              <Link 
                href="/offers" 
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label="View today's deals and offers"
              >
                <Gift className="h-3 w-3 group-hover:scale-110 transition-transform" />
                <span>Deals</span>
              </Link>
              <div className="text-gray-300" aria-hidden="true">|</div>
              <Link 
                href="/shipping" 
                className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
                aria-label="Learn about free shipping"
              >
                <Truck className="h-3 w-3 group-hover:scale-110 transition-transform" />
                <span>Free Ship</span>
              </Link>
            </div>
          </div>

          {/* Enhanced Additional Info Section - Desktop */}
          <div className="hidden xl:flex items-center space-x-4 text-sm flex-shrink-0">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-primary cursor-pointer transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
              <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Deliver to</span>
              <span className="text-primary font-medium">India</span>
            </button>
            
            <div className="text-gray-300" aria-hidden="true">|</div>
            
            <Link 
              href="/offers" 
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
              aria-label="View today's deals and special offers"
            >
              <Gift className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Today's Deals</span>
              <Badge variant="destructive" className="text-xs px-1 py-0">Hot</Badge>
            </Link>
            
            <div className="text-gray-300" aria-hidden="true">|</div>
            
            <Link 
              href="/shipping" 
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
              aria-label="Learn more about our free shipping policy"
            >
              <Truck className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Free Shipping</span>
            </Link>

            <div className="text-gray-300" aria-hidden="true">|</div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-600 font-medium">Premium</span>
            </div>
          </div>

          {/* Compact Additional Info for Medium Screens */}
          <div className="hidden md:flex xl:hidden items-center space-x-4 text-sm flex-shrink-0">
            <Link 
              href="/offers" 
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
              aria-label="View deals"
            >
              <Gift className="h-4 w-4" />
              <span>Deals</span>
            </Link>
            
            <Link 
              href="/shipping" 
              className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
              aria-label="Free shipping info"
            >
              <Truck className="h-4 w-4" />
              <span>Free Ship</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
