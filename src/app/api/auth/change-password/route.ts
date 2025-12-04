import { NextResponse } from 'next/server'
import { createAuthenticatedClient, handleAuthError } from '@/lib/supabase/api-client'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      )
    }

    const { supabase } = await createAuthenticatedClient()
    
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return handleAuthError(error);
  }
}
