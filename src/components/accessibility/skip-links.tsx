'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SkipLinkProps {
  links?: Array<{
    href: string
    label: string
  }>
}

const defaultLinks = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' }
]

export default function SkipLinks({ links = defaultLinks }: SkipLinkProps) {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip links on first Tab press
      if (e.key === 'Tab' && !isVisible) {
        setIsVisible(true)
      }
      
      // Hide skip links when clicking elsewhere
      if (e.key === 'Escape') {
        setIsVisible(false)
      }
    }

    const handleClick = () => {
      setIsVisible(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClick)
    }
  }, [isVisible])

  const handleSkipLinkClick = (href: string) => {
    const target = document.querySelector(href) as HTMLElement
    if (target) {
      target.focus()
      // Smooth scroll to target
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div 
      className={`fixed top-0 left-0 z-[9999] transition-transform duration-200 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      role="navigation"
      aria-label="Skip links"
    >
      <div className="bg-white border border-gray-300 rounded-b-lg shadow-lg p-2 space-y-1">
        {links.map((link, index) => (
          <button
            key={index}
            onClick={() => handleSkipLinkClick(link.href)}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onFocus={() => setIsVisible(true)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Hook for managing focus
export function useFocusManagement() {
  const router = useRouter()
  
  useEffect(() => {
    const handleRouteChange = () => {
      // Focus the main content area on route change
      const mainContent = document.querySelector('#main-content, main, [role="main"]')
      if (mainContent) {
        (mainContent as HTMLElement).focus()
      }
    }

    // Listen for route changes
    const handleFocus = () => {
      setTimeout(handleRouteChange, 100)
    }

    window.addEventListener('popstate', handleFocus)
    
    return () => {
      window.removeEventListener('popstate', handleFocus)
    }
  }, [router])
}

// Utility component for accessible loading states
export function AccessibleLoader({ 
  message = 'Loading content, please wait...',
  className = ''
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={`flex items-center justify-center ${className}`}
    >
      <div 
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        aria-hidden="true"
      />
      <span className="sr-only">{message}</span>
    </div>
  )
}

// Enhanced button with accessibility features
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  ariaLabel,
  variant = 'primary',
  size = 'md',
  ...props
}: any) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-base rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg'
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={loading ? 'loading-description' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <div 
            className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
            aria-hidden="true"
          />
          {loadingText}
          <span id="loading-description" className="sr-only">
            Button is loading, please wait
          </span>
        </>
      ) : children}
    </button>
  )
}
