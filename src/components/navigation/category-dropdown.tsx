'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ChevronDown, Menu, Layers, Loader2, AlertCircle } from "lucide-react"
import { getCategories } from "@/lib/data/products"
import { getCategoriesClient } from "@/lib/data/client-products"
import { Category } from "@/types"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function CategoryDropdown() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [navigating, setNavigating] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [retryCount, setRetryCount] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || ""
  const router = useRouter()
  const pathname = usePathname()

  // Reset navigating state when pathname or search params change
  useEffect(() => {
    setNavigating(false)
  }, [pathname, searchParams])

  // Enhanced category fetching with error handling
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
        
        // Auto-retry with exponential backoff
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

  // Enhanced click outside handling
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleToggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      })
    }
    setIsOpen(!isOpen)
  }

  const handleNavigation = async (href: string) => {
    setNavigating(true)
    setIsOpen(false)
    
    try {
      // Navigate immediately for better UX
      await router.push(href)
    } catch (error) {
      console.error("Navigation failed:", error)
      setNavigating(false)
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setRetryCount(0)
  }

  return (
    <>
      <button 
        ref={buttonRef}
        type="button"
        className="h-8 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400 transition-all duration-200 bg-white rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed sm:px-4 sm:h-9 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={handleToggleDropdown}
        disabled={navigating}
        aria-label="Open categories menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        id="categories-button"
      >
        {navigating ? (
          <Loader2 className="mr-2 h-3 w-3 animate-spin sm:h-4 sm:w-4" />
        ) : (
          <Menu className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        )}
        <span className="hidden sm:inline">
          {navigating ? 'Loading...' : 'All Categories'}
        </span>
        <span className="sm:hidden">
          {navigating ? 'Loading...' : 'Categories'}
        </span>
        {!navigating && (
          <ChevronDown className={`ml-2 h-3 w-3 transition-transform duration-200 sm:h-4 sm:w-4 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Enhanced Dropdown */}
          <div 
            ref={dropdownRef}
            className="fixed w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
            role="menu"
            aria-labelledby="categories-button"
          >
            {error ? (
              <div className="p-4 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Try Again
                </Button>
              </div>
            ) : loading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500">Loading categories...</p>
              </div>
            ) : (
              <div className="py-2 max-h-96 overflow-y-auto">
                <button 
                  onClick={() => handleNavigation('/products')}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:bg-blue-50 focus:text-blue-700"
                  role="menuitem"
                  aria-label="View all products"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 mr-3">
                    <Layers className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium">All Products</span>
                    <div className="text-xs text-gray-500">See everything we offer</div>
                  </div>
                </button>
                
                <div className="border-t border-gray-100 my-2"></div>
                
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    onClick={() => handleNavigation(`/products?category=${category.slug}`)}
                    className={`w-full flex items-center px-4 py-3 text-sm transition-all duration-200 focus:outline-none ${
                      currentCategory === category.slug 
                        ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                        : 'text-gray-700 hover:bg-gray-50 focus:bg-gray-50'
                    }`}
                    role="menuitem"
                    aria-label={`View ${category.name} products`}
                    aria-current={currentCategory === category.slug ? "page" : undefined}
                  >
                    <div className={`w-3 h-3 rounded-full mr-4 ${
                      currentCategory === category.slug ? 'bg-primary' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1 text-left">
                      <span className="font-medium">{category.name}</span>
                      {category.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {!error && !loading && categories.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 p-3">
                <div className="text-center">
                  <span className="text-xs text-gray-500">
                    {categories.length} categories available
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
