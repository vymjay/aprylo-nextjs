import { createPublicClient } from '@/lib/supabase/api-client';
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

  const { supabase } = await createPublicClient();
    const { data: variants, error } = await supabase
      .from("ProductVariant")
      .select("*")
      .eq("productId", parseInt(id))
      .order("id", { ascending: true });

    if (error) {
      console.error('Error fetching variants:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!variants || variants.length === 0) {
      return NextResponse.json([]);  // Return empty array instead of 404
    }

    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error in GET variants:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
