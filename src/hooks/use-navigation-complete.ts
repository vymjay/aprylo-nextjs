'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook to dispatch navigation end event when component mounts after navigation
 */
export function useNavigationComplete() {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only dispatch on client side after initial mount
    if (typeof window !== 'undefined') {
      // Check if pathname has changed (indicating navigation occurred)
      if (hasInitialized.current && pathname !== previousPathname.current) {
        // Dispatch navigation end event after a short delay to ensure components have rendered
        const timer = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigation-end'))
        }, 150)
        
        previousPathname.current = pathname
        
        return () => clearTimeout(timer)
      } else if (!hasInitialized.current) {
        hasInitialized.current = true
        previousPathname.current = pathname
      }
    }
  }, [pathname])
}
