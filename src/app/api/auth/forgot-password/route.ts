import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/api-client'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    const { supabase } = await createPublicClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://localhost:3000/reset-password",
    })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to send reset email. Please try again.' },
      { status: 500 }
    )
  }
}