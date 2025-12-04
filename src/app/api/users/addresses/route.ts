import { createPublicClient } from "@/lib/supabase/api-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const { supabase } = await createPublicClient();
  const { data: addresses, error } = await supabase
    .from("Address")
    .select("*")
    .eq("userId", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const payload = await request.json();

  const { supabase } = await createPublicClient();
  const { data, error } = await supabase
    .from("Address")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const { id, ...updateData } = payload;

  if (!id) {
    return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
  }

  const { supabase } = await createPublicClient();
  const { data, error } = await supabase
    .from("Address")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
  }

  const { supabase } = await createPublicClient();
  const { error } = await supabase.from("Address").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
