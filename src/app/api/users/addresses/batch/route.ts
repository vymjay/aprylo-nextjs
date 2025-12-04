import { NextResponse } from "next/server";
import { createAuthenticatedClient, getInternalUserId, handleAuthError } from "@/lib/supabase/api-client";

export async function PUT(request: Request) {
  try {
    const { supabase, user } = await createAuthenticatedClient();

    // Get the payload
    const { addresses, deletedIds } = await request.json();

    // Get internal user ID using centralized helper
    const internalUserId = await getInternalUserId(supabase, user.id);

    // Start a transaction for all address operations
    const { error: transactionError } = await supabase.rpc('batch_update_addresses', {
      p_user_id: internalUserId,
      p_addresses: addresses,
      p_deleted_ids: deletedIds
    });

    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }

    // Get updated addresses
    const { data: updatedAddresses, error: fetchError } = await supabase
      .from("Address")
      .select("*")
      .eq("userId", internalUserId);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json(updatedAddresses || []);
  } catch (error: any) {
    return handleAuthError(error);
  }
}
