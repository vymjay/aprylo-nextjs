'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User as SupabaseUser, UserMetadata } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { forceLogoutCleanup } from './logout-utils'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_KEYS, USER_KEYS } from '@/hooks/api/use-users'

interface User extends SupabaseUser {
  user_metadata: UserMetadata
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; message?: string; needsConfirmation?: boolean }>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>
  resetPassword: (password: string, accessToken: string) => Promise<{ success: boolean; message?: string }>
  changePassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const getUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Auth Context - Session check:', { session, error: sessionError }) // Debug log
        
        if (sessionError || !session) {
          console.log('Auth Context - No valid session, setting user to null') // Debug log
          setUser(null)
          // Clear auth cache when no session
          queryClient.removeQueries({ queryKey: AUTH_KEYS.user() })
          queryClient.removeQueries({ queryKey: USER_KEYS.current() })
          return
        }

        console.log('Auth Context - Valid session found, setting user:', session.user) // Debug log
        setUser(session.user as User)
      } catch (error) {
        console.log('Auth Context - Error getting session:', error) // Debug log
        setUser(null)
        // Clear auth cache on error
        queryClient.removeQueries({ queryKey: AUTH_KEYS.user() })
        queryClient.removeQueries({ queryKey: USER_KEYS.current() })
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth Context - Auth state change:', { event, session }) // Debug log
        
        if (event === 'SIGNED_OUT' || !session) {
          // Clear auth cache on logout
          queryClient.removeQueries({ queryKey: AUTH_KEYS.user() })
          queryClient.removeQueries({ queryKey: USER_KEYS.current() })
          queryClient.removeQueries({ queryKey: USER_KEYS.currentAddresses() })
          setUser(null)
        } else {
          setUser(session?.user ? (session.user as User) : null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      
      if (!data.success) {
        return { success: false, message: data.message }
      }
      
      setUser(data.user as User)
      return { success: true }
    } catch {
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await response.json()
      
      return {
        success: data.success,
        message: data.message,
        needsConfirmation: data.needsConfirmation,
      }
    } catch {
      return { success: false, message: 'Signup failed. Please try again.' }
    }
  }

  const logout = async () => {
    console.log('Auth Context - Starting logout process') // Debug log
    
    try {
      // First, immediately set user to null to clear UI
      setUser(null)
      
      // Clear auth cache immediately
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user() })
      queryClient.removeQueries({ queryKey: USER_KEYS.current() })
      queryClient.removeQueries({ queryKey: USER_KEYS.currentAddresses() })
      
      // Get Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Sign out from Supabase first
      console.log('Auth Context - Signing out from Supabase') // Debug log
      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'global' // This ensures all sessions are cleared
      })
      
      if (signOutError) {
        console.error('Supabase signOut error:', signOutError)
      }
      
      // Use the utility function for complete cleanup
      console.log('Auth Context - Running force cleanup') // Debug log
      forceLogoutCleanup()
      
      // Call the logout API endpoint
      console.log('Auth Context - Calling logout API') // Debug log
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        
        const data = await response.json()
        console.log('Auth Context - Logout API response:', data) // Debug log
        
        if (!data.success) {
          console.warn('Logout API failed:', data.message)
        }
      } catch (apiError) {
        console.error('Logout API call failed:', apiError)
        // Continue with cleanup even if API fails
      }
      
      // Force refresh auth state
      console.log('Auth Context - Force refreshing auth state') // Debug log
      await supabase.auth.refreshSession()
      
      // Double-check session is cleared
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Auth Context - Session after logout:', session) // Debug log
      
      if (session) {
        console.warn('Session still exists after logout, forcing another signout')
        await supabase.auth.signOut({ scope: 'global' })
      }
      
      // Ensure user is null
      setUser(null)
      console.log('Auth Context - Logout completed successfully') // Debug log
      
    } catch (error) {
      console.error('Auth Context - Logout error:', error)
      
      // Still try to clean up client-side state even if everything fails
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut({ scope: 'global' })
      
      // Force cleanup even on error
      forceLogoutCleanup()
      
      // Clear auth cache even on error
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user() })
      queryClient.removeQueries({ queryKey: USER_KEYS.current() })
      queryClient.removeQueries({ queryKey: USER_KEYS.currentAddresses() })
      
      setUser(null)
      throw error // Re-throw to let calling code handle the error
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      
      return { success: data.success, message: data.message }
    } catch {
      return { success: false, message: 'Failed to send reset email. Please try again.' }
    }
  }

  const resetPassword = async (password: string, accessToken: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      
      return { success: data.success, message: data.message }
    } catch {
      return { success: false, message: 'Failed to reset password. Please try again.' }
    }
  }

  const changePassword = async (newPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      const data = await response.json()
      
      return { success: data.success, message: data.message }
    } catch {
      return { success: false, message: 'Failed to change password. Please try again.' }
    }
  }

  const contextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      changePassword,
    }),
    [user, isLoading]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}