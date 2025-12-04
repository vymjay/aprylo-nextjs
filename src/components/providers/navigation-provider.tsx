'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import NavigationLoading from '@/components/common/navigation-loading'

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const previousPathnameRef = useRef(pathname)

  // Reset navigation state when pathname changes (navigation complete)
  useEffect(() => {
    if (pathname !== previousPathnameRef.current) {
      // Pathname changed, navigation is complete
      console.log('Navigation complete: pathname changed from', previousPathnameRef.current, 'to', pathname)
      setIsNavigating(false)
      previousPathnameRef.current = pathname
    }
  }, [pathname])

  // Listen for navigation start events
  useEffect(() => {
    const handleNavigationStart = () => {
      console.log('Navigation start event received')
      setIsNavigating(true)
    }
    
    const handleNavigationEnd = () => {
      console.log('Navigation end event received')
      setIsNavigating(false)
    }
    
    window.addEventListener('navigation-start', handleNavigationStart)
    window.addEventListener('navigation-end', handleNavigationEnd)
    
    return () => {
      window.removeEventListener('navigation-start', handleNavigationStart)
      window.removeEventListener('navigation-end', handleNavigationEnd)
    }
  }, [])

  return (
    <>
      {children}
      {isNavigating && <NavigationLoading />}
    </>
  )
}
