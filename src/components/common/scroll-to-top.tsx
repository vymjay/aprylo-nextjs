'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname()

  useEffect(() => {
    // Use smooth scrolling to top on route change
    window.scrollTo({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    })
  }, [pathname]) // runs whenever the pathname changes

  return null
}