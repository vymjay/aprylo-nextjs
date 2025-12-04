import { NextResponse } from "next/server";
import { createAuthenticatedClient, getInternalUserId, handleAuthError } from "@/lib/supabase/api-client";

export async function PUT(request: Request) {
  try {
    const { supabase, user } = await createAuthenticatedClient();

    // Get the payload
    const { name } = await request.json();

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Get internal user ID using centralized helper
    const internalUserId = await getInternalUserId(supabase, user.id);

    // Update user profile
    const { data, error } = await supabase
      .from("User")
      .update({ name })
      .eq("id", internalUserId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PUT /api/users/profile error:", error);
    return handleAuthError(error);
  }
}
