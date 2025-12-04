import { createAuthenticatedClient, handleAuthError } from '@/lib/supabase/api-client';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { supabase, user } = await createAuthenticatedClient();

    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("supabaseUserId", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error: any) {
    return handleAuthError(error);
  }
}
