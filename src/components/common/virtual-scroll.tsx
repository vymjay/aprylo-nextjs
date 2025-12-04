'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

interface VirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  onEndReached?: () => void
  endReachedThreshold?: number
  className?: string
  loading?: boolean
  loadingComponent?: React.ReactNode
}

export default function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 0.8,
  className = '',
  loading = false,
  loadingComponent = null
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const scrollingTimeoutId = useRef<NodeJS.Timeout>()

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const containerItemCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      startIndex + containerItemCount + 2 * overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  }, [items, visibleRange])

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)
    setIsScrolling(true)

    // Check if near end
    if (onEndReached) {
      const { scrollHeight, clientHeight } = e.currentTarget
      const scrollProgress = (scrollTop + clientHeight) / scrollHeight
      
      if (scrollProgress >= endReachedThreshold && !loading) {
        onEndReached()
      }
    }

    // Clear existing timeout
    if (scrollingTimeoutId.current) {
      clearTimeout(scrollingTimeoutId.current)
    }

    // Set scrolling to false after delay
    scrollingTimeoutId.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, [onEndReached, endReachedThreshold, loading])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollingTimeoutId.current) {
        clearTimeout(scrollingTimeoutId.current)
      }
    }
  }, [])

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight

  // Calculate transform for visible items
  const offsetY = visibleRange.startIndex * itemHeight

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={scrollElementRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
        role="listbox"
        aria-label="Virtual scrolling list"
        tabIndex={0}
      >
        {/* Spacer for total height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items container */}
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleItems.map(({ item, index }) => (
              <div
                key={index}
                style={{ height: itemHeight }}
                className="virtual-scroll-item"
                role="option"
                aria-setsize={items.length}
                aria-posinset={index + 1}
              >
                {renderItem(item, index)}
              </div>
            ))}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              {loadingComponent || (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                  <span className="text-sm text-gray-600">Loading more...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrolling indicator */}
      {isScrolling && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {Math.round((scrollTop / (totalHeight - containerHeight)) * 100)}%
        </div>
      )}
    </div>
  )
}

// Hook for virtual scrolling with dynamic item heights
export function useVirtualScroll<T>({
  items,
  estimateItemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[]
  estimateItemHeight: (index: number) => number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const itemOffsets = useRef<number[]>([])
  const itemHeights = useRef<number[]>([])

  // Calculate cumulative offsets
  useEffect(() => {
    let offset = 0
    const offsets: number[] = []
    const heights: number[] = []

    for (let i = 0; i < items.length; i++) {
      offsets[i] = offset
      const height = estimateItemHeight(i)
      heights[i] = height
      offset += height
    }

    itemOffsets.current = offsets
    itemHeights.current = heights
  }, [items, estimateItemHeight])

  // Find visible range
  const visibleRange = useMemo(() => {
    const offsets = itemOffsets.current
    
    let startIndex = 0
    let endIndex = items.length - 1

    // Binary search for start index
    let low = 0
    let high = offsets.length - 1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (offsets[mid] <= scrollTop) {
        startIndex = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    // Find end index
    const visibleBottom = scrollTop + containerHeight
    for (let i = startIndex; i < offsets.length; i++) {
      if (offsets[i] + itemHeights.current[i] >= visibleBottom) {
        endIndex = i
        break
      }
    }

    // Apply overscan
    startIndex = Math.max(0, startIndex - overscan)
    endIndex = Math.min(items.length - 1, endIndex + overscan)

    return { startIndex, endIndex }
  }, [scrollTop, containerHeight, items.length, overscan])

  const totalHeight = itemOffsets.current[items.length - 1] || 0

  return {
    visibleRange,
    totalHeight,
    scrollTop,
    setScrollTop,
    itemOffsets: itemOffsets.current,
    itemHeights: itemHeights.current
  }
}
