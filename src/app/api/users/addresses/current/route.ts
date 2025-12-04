import { NextResponse } from "next/server";
import { createAuthenticatedClient, getInternalUserId, handleAuthError } from "@/lib/supabase/api-client";

export async function GET() {
  try {
    const { supabase, user } = await createAuthenticatedClient();

    // Get internal user ID using centralized helper
    const internalUserId = await getInternalUserId(supabase, user.id);

    // Get addresses for this user
    const { data: addresses, error: addressError } = await supabase
      .from("Address")
      .select("*")
      .eq("userId", internalUserId);

    if (addressError) {
      return NextResponse.json({ error: addressError.message }, { status: 500 });
    }

    return NextResponse.json(addresses || []);
  } catch (error: any) {
    return handleAuthError(error);
  }
}
