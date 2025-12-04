import { NextResponse } from "next/server";
import { createOptionalAuthClient } from "@/lib/supabase/api-client";

export async function GET() {
  try {
    const { supabase, user } = await createOptionalAuthClient();
    
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    // Check if user exists in internal User table and has ADMIN role
    const { data: userData, error } = await supabase
      .from("User")
      .select("role")
      .eq("supabaseUserId", user.id)
      .single();

    if (error || !userData) {
      console.error('User not found in internal User table for admin check:', error);
      
      // Try to create the internal user record if it doesn't exist
      try {
        const { data: newUserData, error: insertError } = await supabase
          .from('User')
          .insert({
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            supabaseUserId: user.id,
            role: 'USER' // Default to USER role
          })
          .select('role')
          .single();

        if (insertError) {
          console.error('Failed to create internal user record during admin check:', insertError);
          return NextResponse.json({ isAdmin: false }, { status: 200 });
        }

        console.log('Created internal user record during admin check');
        return NextResponse.json({ isAdmin: false }, { status: 200 }); // New users are not admin
      } catch (createError) {
        console.error('Error creating internal user record during admin check:', createError);
        return NextResponse.json({ isAdmin: false }, { status: 200 });
      }
    }

    const isAdmin = userData.role === 'ADMIN';
    return NextResponse.json({ isAdmin }, { status: 200 });
  } catch (error) {
    console.error('Error in admin check:', error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
