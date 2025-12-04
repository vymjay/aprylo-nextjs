'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { forceLogoutCleanup } from '@/lib/auth/logout-utils'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Perform complete cleanup
    forceLogoutCleanup()
    
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      router.replace('/')
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            You've been signed out
          </h1>
          <p className="text-gray-600">
            Successfully logged out. Redirecting you to the home page...
          </p>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  )
}
