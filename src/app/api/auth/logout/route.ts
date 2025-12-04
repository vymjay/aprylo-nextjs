import { NextRequest, NextResponse } from 'next/server'
import { createOptionalAuthClient } from '@/lib/supabase/api-client'

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await createOptionalAuthClient()

    // Sign out the user with global scope
    const { error } = await supabase.auth.signOut({ 
      scope: 'global' // This clears all sessions
    })

    if (error) {
      console.error('Logout API - Supabase signOut error:', error)
      // Continue with cleanup even if signOut fails
    }

    // Create response with success message
    const response = NextResponse.json({ 
      success: true, 
      message: 'Successfully signed out' 
    })

    // Clear all possible Supabase auth cookies more aggressively
    const cookiesToClear = [
      'supabase-auth-token',
      'sb-access-token', 
      'sb-refresh-token',
      'supabase.auth.token',
      'sb-localhost-auth-token',
      'sb-auth-token',
      'supabase.auth.expires_at',
      'supabase.auth.refresh_token',
      'supabase.auth.access_token',
      'supabase.auth.user',
      'supabase.auth.session'
    ]

    cookiesToClear.forEach(cookieName => {
      // Clear with different configurations to ensure complete removal
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'lax'
      })
      
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      
      // Also try with domain
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: 'localhost',
        httpOnly: false,
        secure: false,
        sameSite: 'lax'
      })
    })

    // Clear any cookies that start with 'sb-' or contain 'supabase'
    const cookies = request.cookies
    cookies.getAll().forEach(cookie => {
      if (cookie.name.startsWith('sb-') || 
          cookie.name.includes('supabase') || 
          cookie.name.includes('auth')) {
        
        response.cookies.set(cookie.name, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'lax'
        })
        
        response.cookies.set(cookie.name, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }
    })

    return response
    
  } catch (error) {
    console.error('Logout API - Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
