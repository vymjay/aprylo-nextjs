import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/api-client";

export async function GET() {
  try {
    const { supabase } = await createPublicClient();
    
    // Get the current user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error in internal-id:', authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
