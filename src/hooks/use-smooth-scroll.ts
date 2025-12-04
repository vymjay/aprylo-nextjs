'use client'

import { useCallback } from 'react'

interface ScrollToOptions {
  top?: number
  left?: number
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
  inline?: ScrollLogicalPosition
}

export function useSmoothScroll() {
  const scrollTo = useCallback((options: ScrollToOptions = {}) => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
      ...options
    })
  }, [])

  const scrollToElement = useCallback((elementId: string, offset: number = 80) => {
    const element = document.getElementById(elementId)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }, [])

  const scrollToBottom = useCallback(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      left: 0,
      behavior: 'smooth'
    })
  }, [])

  return {
    scrollTo,
    scrollToElement,
    scrollToTop,
    scrollToBottom
  }
}

export default useSmoothScroll
