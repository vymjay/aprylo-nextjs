'use client'

/**
 * Utility functions for complete logout cleanup
 */

'use client'

/**
 * Utility functions for complete logout cleanup
 */

export function clearAllAuthStorage() {
  if (typeof window === 'undefined') return

  console.log('Logout Utils - Clearing all auth storage') // Debug log

  // Clear localStorage
  const localKeysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (
      key.includes('supabase') || 
      key.includes('sb-') || 
      key.includes('auth') ||
      key.includes('user') ||
      key.includes('session') ||
      key.startsWith('supabase.') ||
      key.includes('tanstack') || // React Query cache
      key.includes('react-query') || // React Query cache
      key.includes('query') // Any query cache
    )) {
      localKeysToRemove.push(key)
    }
  }
  console.log('Logout Utils - Removing localStorage keys:', localKeysToRemove) // Debug log
  localKeysToRemove.forEach(key => localStorage.removeItem(key))

  // Clear sessionStorage
  const sessionKeysToRemove: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && (
      key.includes('supabase') || 
      key.includes('sb-') || 
      key.includes('auth') ||
      key.includes('user') ||
      key.includes('session') ||
      key.startsWith('supabase.') ||
      key.includes('tanstack') || // React Query cache
      key.includes('react-query') || // React Query cache
      key.includes('query') // Any query cache
    )) {
      sessionKeysToRemove.push(key)
    }
  }
  console.log('Logout Utils - Removing sessionStorage keys:', sessionKeysToRemove) // Debug log
  sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

  // Force clear specific known keys
  const specificKeys = [
    'supabase.auth.token',
    'sb-localhost-auth-token',
    'sb-auth-token',
    'supabase-auth-token',
    'supabase.auth.user',
    'supabase.auth.session',
    'supabase.auth.expires_at',
    'supabase.auth.refresh_token',
    'supabase.auth.access_token',
    // React Query cache keys
    'REACT_QUERY_OFFLINE_CACHE',
    'react-query-temp',
    'tanstack-query'
  ]
  
  specificKeys.forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
  
  // Also try to clear any keys that start with common patterns
  const patterns = ['supabase', 'sb-', 'auth', 'user', 'query']
  patterns.forEach(pattern => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(pattern) || key.toLowerCase().includes(pattern)) {
        localStorage.removeItem(key)
      }
    })
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(pattern) || key.toLowerCase().includes(pattern)) {
        sessionStorage.removeItem(key)
      }
    })
  })
}

export function clearAllCookies() {
  if (typeof document === 'undefined') return

  console.log('Logout Utils - Clearing all cookies') // Debug log

  // Get all cookies
  const cookies = document.cookie.split(';')
  
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
    
    // Clear auth-related cookies
    if (name.includes('supabase') || name.includes('sb-') || name.includes('auth') || name === 'supabase.auth.token') {
      console.log('Logout Utils - Clearing cookie:', name) // Debug log
      
      // Clear cookie for current domain and path
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
      
      // Clear cookie for all subdomains
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
      
      // Clear cookie for localhost specifically
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=127.0.0.1;`
      }
      
      // Also try without domain
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
  })
  
  // Force clear specific known Supabase cookies
  const knownSupabaseCookies = [
    'supabase-auth-token',
    'sb-localhost-auth-token',
    'sb-auth-token',
    'supabase.auth.token',
    'sb-access-token',
    'sb-refresh-token'
  ]
  
  knownSupabaseCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
  })
}

function clearReactQueryCache() {
  try {
    // Import React Query keys to clear specific caches
    const userKeys = ['users', 'current', 'internal-id', 'addresses']
    const cartKeys = ['cart']
    const reviewKeys = ['reviews']
    const productKeys = ['products']
    
    console.log('Logout Utils - Attempting to clear React Query cache...')

    // Check if TanStack Query is available
    if (typeof window !== 'undefined' && (window as any).__REACT_QUERY_STATE__) {
      console.log('Logout Utils - Found React Query state, clearing...')
      delete (window as any).__REACT_QUERY_STATE__
      console.log('Logout Utils - React Query state cleared')
    }

    // Try to access QueryClient from global context
    if (typeof window !== 'undefined' && (window as any).__queryClient) {
      console.log('Logout Utils - Found global QueryClient, clearing cache...')
      const queryClient = (window as any).__queryClient
      if (queryClient && typeof queryClient.clear === 'function') {
        queryClient.clear()
        console.log('Logout Utils - QueryClient cache cleared')
      }
      // Also try to invalidate specific query keys
      if (queryClient && typeof queryClient.invalidateQueries === 'function') {
        userKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] })
        })
        console.log('Logout Utils - Specific user queries invalidated')
      }
    }

    // Clear any cached data from local storage that might be React Query related
    if (typeof window !== 'undefined' && window.localStorage) {
      const storage = window.localStorage
      const keysToRemove: string[] = []
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && (key.includes('tanstack') || key.includes('react-query') || key.includes('users'))) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        storage.removeItem(key)
        console.log('Logout Utils - Removed cached data:', key)
      })
    }

    console.log('Logout Utils - React Query cache clearing completed')
  } catch (error) {
    console.warn('Logout Utils - React Query cache clearing failed:', error)
  }
}

export function forceLogoutCleanup() {
  console.log('=== STARTING FORCE LOGOUT CLEANUP ===')
  
  // Clear React Query cache first
  clearReactQueryCache()
  
  // Clear all auth-related storage
  clearAllAuthStorage()
  
  // Force reload the page to ensure complete cleanup
  if (typeof window !== 'undefined') {
    console.log('Logout Utils - Force reloading page for complete cleanup')
    setTimeout(() => {
      window.location.reload()
    }, 1000) // Small delay to allow cleanup to complete
  }
  
  console.log('=== FORCE LOGOUT CLEANUP COMPLETED ===')
}
