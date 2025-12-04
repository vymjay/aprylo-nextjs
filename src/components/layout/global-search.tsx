'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import { useSearchWorker } from '@/hooks/use-search-worker'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SearchProduct {
  id: number
  title: string
  slug: string
  price: number
  originalPrice: number
  images: string[]
  category?: {
    id: number
    name: string
  }
}

interface GlobalSearchProps {
  className?: string
  autoFocus?: boolean
  onFocusChange?: (focused: boolean) => void
  compact?: boolean  // New prop for mobile compact mode
}

export default function GlobalSearch({ className, autoFocus = false, onFocusChange, compact = false }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const debouncedQuery = useDebounce(query, 300) // 300ms debounce for fast response
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Stable callback references to prevent infinite re-renders
  const handleSearchSuccess = useCallback((data: SearchProduct[], fromCache: boolean) => {
    setProducts(data || [])
    setSearchError(null)
  }, [])

  const handleSearchError = useCallback((error: string) => {
    setProducts([])
    setSearchError(error)
    console.error('Search error:', error)
  }, [])

  const handleSearchLoading = useCallback(() => {
    setSearchError(null)
  }, [])

  // Web Worker for non-blocking search
  const { search, isLoading, isWorkerReady } = useSearchWorker({
    onSuccess: handleSearchSuccess,
    onError: handleSearchError,
    onLoading: handleSearchLoading
  })

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2 && isWorkerReady) {
      search(debouncedQuery, compact ? 8 : 12)
    } else {
      setProducts([])
      setSearchError(null)
    }
  }, [debouncedQuery, search, isWorkerReady, compact])

  // Auto-focus when requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [autoFocus])

  // Global keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Global search shortcut (⌘/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus({ preventScroll: true })
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Enhanced focus handling with scroll prevention
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocusChange?.(true)
    
    // Prevent scrolling when focusing on search input
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [onFocusChange])

  const handleBlur = useCallback(() => {
    // Delay blur to allow for dropdown clicks
    setTimeout(() => {
      setIsFocused(false)
      onFocusChange?.(false)
    }, 150)
  }, [onFocusChange])

  // Handle input changes with scroll prevention
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    
    // Prevent any unwanted scrolling during typing
    e.preventDefault = () => {}
  }, [])

  // Helper variables
  const shouldSearch = debouncedQuery.length >= 2

  // Prevent body scroll when search is focused on mobile
  useEffect(() => {
    if (isOpen && compact) {
      // Prevent body scroll on mobile when search dropdown is open
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen, compact])

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show dropdown when focused and has query or results
  useEffect(() => {
    const shouldShowDropdown = isFocused && (shouldSearch || query.length > 0)
    
    // Only update if state actually changes to prevent unnecessary re-renders
    if (isOpen !== shouldShowDropdown) {
      setIsOpen(shouldShowDropdown)
    }
  }, [isFocused, shouldSearch, query.length, isOpen])

  // Clear products when search changes
  useEffect(() => {
    // Reset products when new search
  }, [products])

  // Simple result item click without analytics
  const handleProductClick = (product: SearchProduct) => {
    setIsOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    setProducts([])
    setSearchError(null)
    inputRef.current?.focus()
  }

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    
    if (query.trim()) {
      // Go to search results page
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery('')
      inputRef.current?.blur()
    }
  }, [query, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle Escape key for closing
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  // Remove scroll behavior for keyboard selection since navigation is disabled

  return (
    <div ref={searchRef} className={`relative search-dropdown-container ${className}`} role="search">
      {/* Enhanced Search Form */}
      <form 
        onSubmit={handleSearch} 
        className="relative"
        action="javascript:void(0)" // Prevent any default form action
        method="get" // Use GET to prevent any POST side effects
      >
        <div className="relative group">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <input
            ref={inputRef}
            type="text"
            placeholder={compact ? "Search..." : "Search products..."}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 ${
              compact 
                ? 'pl-8 pr-8 h-9 text-sm' 
                : 'pl-10 pr-10 h-10'
            }`}
            aria-label="Search products"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            role="combobox"
            autoComplete="off"
            aria-describedby={isOpen ? "search-results" : undefined}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                compact ? 'h-6 w-6' : 'h-8 w-8'
              }`}
              aria-label="Clear search"
            >
              <X className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            </Button>
          )}
        </div>
      </form>

      {/* Enhanced Search Results Dropdown */}
      {isOpen && (
        <div 
          ref={resultsRef} 
          id="search-results"
          className={cn(
            "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50",
            // Mobile-optimized: Use viewport height and better scroll behavior
            compact 
              ? "max-h-[60vh] md:max-h-96" 
              : "max-h-96",
            "overflow-hidden", // Remove direct overflow-y-auto to handle it in inner containers
            // Prevent layout shift and scroll issues
            "transform-gpu will-change-transform"
          )}
          role="listbox"
          aria-label="Search results"
        >
          {/* Loading State */}
          {isLoading && shouldSearch && (
            <div className="p-4 text-center text-gray-500" role="status" aria-live="polite">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Searching...</span>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && shouldSearch && products && products.length === 0 && (
            <div className="p-4 text-center text-gray-500" role="status" aria-live="polite">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Try different keywords or check spelling</p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <span className="text-xs text-gray-400">Suggestions:</span>
                {['men', 'women', 'shoes', 'shirts'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion)
                      handleSearch(new Event('submit') as any)
                    }}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && shouldSearch && products && products.length > 0 && (
            <>
              <div className="p-2 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600 px-2">
                    <span className="font-medium">{products.length}</span> product{products.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              <div 
                className={cn(
                  "overflow-y-auto overscroll-contain scroll-smooth mobile-search-scroll",
                  // Mobile-optimized scrolling
                  compact 
                    ? "max-h-[50vh] md:max-h-80 mobile-search-results" 
                    : "max-h-80"
                )}
                style={{
                  // Better mobile scroll behavior
                  WebkitOverflowScrolling: 'touch',
                  // Prevent overscroll on mobile
                  overscrollBehaviorY: 'contain'
                }}
              >
                {products.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={() => handleProductClick(product)}
                    className={cn(
                      "flex items-center p-3 hover:bg-gray-50 transition-all duration-200 border-b border-gray-50 last:border-b-0 group search-result",
                      // Mobile-optimized touch targets
                      compact ? "min-h-[44px] search-result-mobile" : ""
                    )}
                    role="option"
                    aria-label={`${product.title} - ${formatPrice(product.price)}`}
                  >
                    <div className="relative w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate text-gray-900">
                        {product.title}
                      </h4>
                      <p className="text-sm truncate text-gray-500">
                        {product.category?.name}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm font-semibold text-blue-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {products.length >= 10 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <Button
                    onClick={handleSearch}
                    variant="ghost"
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    View all results for "{debouncedQuery}" →
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Input hint */}
          {query.length > 0 && query.length < 2 && (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Type at least 2 characters to search</p>
              <p className="text-xs mt-1 text-gray-400">
                Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">⌘K</kbd> for quick access
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
