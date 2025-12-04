import { NextResponse } from "next/server";
import { createPublicClient } from '@/lib/supabase/api-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const { supabase } = await createPublicClient();

    const { data: cartItems, error } = await supabase
      .from("CartItem")
      .select(`
        *,
        product:Product(*),
        variant:ProductVariant(*)
      `)
      .eq("userId", userId)
      .order('productId', { ascending: true })
      .order('variantId', { ascending: true });

  if (error) {
    console.error('Error fetching cart items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(cartItems);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { item } = body;

  if (!item || !item.userId) {
    return NextResponse.json({ error: "Item data with userId is required" }, { status: 400 });
  }

  const { supabase } = await createPublicClient()

  // Check if item already exists in cart for this user and variant
  const { data: existingItem } = await supabase
    .from("CartItem")
    .select("*")
    .eq("userId", item.userId)
    .eq("productId", item.productId)
    .eq("variantId", item.variantId)
    .single();

  if (existingItem) {
    // Update quantity if item exists
    const { error } = await supabase
      .from("CartItem")
      .update({ quantity: existingItem.quantity + item.quantity })
      .eq("id", existingItem.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Insert new item if it doesn't exist
    const { error } = await supabase.from("CartItem").insert([{
      userId: item.userId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price
    }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const userId = searchParams.get("userId");
  const clearAll = searchParams.get("clearAll");

  const { supabase } = await createPublicClient()

  if (clearAll === "true" && userId) {
    // Clear all items for the user
    const { error } = await supabase
      .from("CartItem")
      .delete()
      .eq("userId", userId);

    if (error) {
      console.error('Error clearing cart:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (id) {
    // Delete specific item
    const { error } = await supabase.from("CartItem").delete().eq("id", id);

    if (error) {
      console.error('Error deleting item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    console.error('Missing required parameters');
    return NextResponse.json({ error: "Item ID or userId with clearAll flag is required" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, quantity } = body;

  if (!id || quantity === undefined) {
    return NextResponse.json(
      { error: "Item ID and quantity are required" },
      { status: 400 }
    );
  }

  const { supabase } = await createPublicClient()

  const { error } = await supabase
    .from("CartItem")
    .update({ quantity })
    .eq("id", id);

  if (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
