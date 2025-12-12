import { NextResponse } from "next/server";
import { createOptionalAuthClient } from "@/lib/supabase/api-client";

export async function GET() {
  try {
    const { supabase, user } = await createOptionalAuthClient();
    
    // If no user session, return null instead of error
    // This allows the client to handle the unauthenticated state gracefully
    if (!user) {
      return NextResponse.json({ id: null }, { status: 200 });
    }

    // Get internal user ID from the User table
    const { data, error } = await supabase
      .from("User")
      .select("id")
      .eq("supabaseUserId", user.id)
      .maybeSingle();

    if (error) {
      console.error('Database error in internal-id:', error);
      return NextResponse.json({ error: `Failed to get internal user ID: ${error.message}` }, { status: 500 });
    }

    if (!data?.id) {
      console.error('User not found in database for Supabase ID:', user.id);
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    console.error('Unexpected error in internal-id:', error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
