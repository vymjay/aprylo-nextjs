import { NextResponse } from 'next/server'
import { createAuthenticatedClient, getInternalUserId } from '@/lib/supabase/api-client'

export interface AdminUser {
  id: number
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  supabaseUserId: string
}

/**
 * Validates if the current user has admin privileges
 * @returns Admin user data if valid, throws error if not admin
 */
export async function validateAdminAccess(): Promise<AdminUser> {
  try {
    const { supabase, user } = await createAuthenticatedClient()
    
    // Get the internal user data to check role
    const { data: userData, error } = await supabase
      .from('User')
      .select('id, email, name, role, supabaseUserId')
      .eq('supabaseUserId', user.id)
      .single()

    if (error || !userData) {
      throw new Error('User not found in database')
    }

    if (userData.role !== 'ADMIN') {
      throw new Error('Access denied: Admin privileges required')
    }

    return userData as AdminUser
  } catch (error: any) {
    throw new Error(error.message || 'Authentication failed')
  }
}

/**
 * Wrapper for admin-only API routes
 */
export function withAdminAuth<T>(
  handler: (adminUser: AdminUser, ...args: any[]) => Promise<T>
) {
  return async (...args: any[]): Promise<NextResponse> => {
    try {
      const adminUser = await validateAdminAccess()
      const result = await handler(adminUser, ...args)
      return NextResponse.json(result)
    } catch (error: any) {
      console.error('Admin auth error:', error)
      
      if (error.message.includes('Access denied') || error.message.includes('Admin privileges')) {
        return NextResponse.json(
          { error: 'Access denied: Admin privileges required' },
          { status: 403 }
        )
      }
      
      if (error.message === 'Unauthorized' || error.message?.includes('JWT')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Client-side helper to check if user is admin
 * @deprecated Use useIsAdmin() hook instead for React components
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/admin-check')
    if (!response.ok) {
      return false
    }
    const data = await response.json()
    return data.isAdmin
  } catch {
    return false
  }
}
