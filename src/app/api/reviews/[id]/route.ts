import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/api-client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const { supabase } = await createPublicClient();

    const { data: review, error } = await supabase
      .from("Review")
      .select(`
        *,
        user:User!Review_userId_fkey (
          id,
          name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error('Error fetching review:', error);
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error in GET review by ID:', error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}
