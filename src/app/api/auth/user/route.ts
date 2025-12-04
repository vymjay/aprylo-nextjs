import { NextResponse } from "next/server";
import { createOptionalAuthClient } from "@/lib/supabase/api-client";

export async function GET() {
  try {
    const { supabase, user } = await createOptionalAuthClient();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Get the internal user data using the supabaseUserId mapping
    const { data: userData, error } = await supabase
      .from("User")
      .select("*")
      .eq("supabaseUserId", user.id)
      .single();

    if (error || !userData) {
      console.error('User not found in internal User table:', error);
      
      // Try to create the internal user record for legacy users
      try {
        const { data: newUserData, error: insertError } = await supabase
          .from('User')
          .insert({
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            supabaseUserId: user.id,
            role: 'USER'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Failed to create internal user record:', insertError);
          return NextResponse.json({ user: null }, { status: 200 });
        }

        console.log('Created internal user record for legacy user:', newUserData);
        return NextResponse.json({ user: newUserData });
      } catch (createError) {
        console.error('Error creating internal user record:', createError);
        return NextResponse.json({ user: null }, { status: 200 });
      }
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
