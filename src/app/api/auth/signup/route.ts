import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/api-client'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    
    const { supabase } = await createPublicClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) {
      let msg = error.message
      if (/already registered|user exists/i.test(msg)) {
        msg = 'An account with this email already exists. Please log in instead.'
      }
      return NextResponse.json({ success: false, message: msg }, { status: 400 })
    }

    if (data.user) {
      // Create corresponding record in internal User table
      try {
        const { error: userError } = await supabase
          .from('User')
          .insert({
            email: data.user.email,
            name: name,
            supabaseUserId: data.user.id,
            role: 'USER'
          })

        if (userError) {
          console.error('Failed to create internal user record:', userError)
          // Note: We don't return error here as the auth user was created successfully
          // The internal user record can be created later when needed
        }
      } catch (internalError) {
        console.error('Error creating internal user record:', internalError)
        // Continue with successful signup response
      }

      if (!data.user.email_confirmed_at) {
        return NextResponse.json({ success: true, needsConfirmation: true })
      }
      
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, message: 'Signup failed. No user returned.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, message: 'Signup failed. Please try again.' },
      { status: 500 }
    )
  }
}
