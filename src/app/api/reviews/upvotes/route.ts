import { NextResponse } from "next/server";
import { createPublicClient, createAuthenticatedClient, handleAuthError, getInternalUserId } from '@/lib/supabase/api-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const { supabase } = await createPublicClient()

    const { data: upvotes, error } = await (supabase
      .from('ReviewUpvote')
      .select('*')
      .eq('reviewid', parseInt(reviewId)) as unknown as Promise<{ data: { id: number; reviewid: number; userid: number }[]; error: any }>);

    if (error) {
      console.error('Error fetching upvotes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(upvotes);
  } catch (error) {
    console.error('Error in GET upvotes:', error);
    return NextResponse.json(
      { error: "Failed to fetch upvotes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const { supabase, user } = await createAuthenticatedClient();

    // Get internal user ID from Supabase user ID
    const internalUserId = await getInternalUserId(supabase, user.id);

    // Check if upvote already exists
    const { data: existing } = await (supabase
      .from('ReviewUpvote')
      .select('*')
      .eq('reviewid', parseInt(reviewId))
      .eq('userid', internalUserId)
      .single() as unknown as Promise<{ data: { id: number; reviewid: number; userid: number } | null; error: any }>);

    if (existing) {
      // If upvote exists, remove it
      const { error: deleteError } = await (supabase
        .from('ReviewUpvote')
        .delete()
        .eq('reviewid', parseInt(reviewId))
        .eq('userid', internalUserId) as unknown as Promise<{ error: any }>);

      if (deleteError) {
        console.error('Error removing upvote:', deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({ message: "Upvote removed" });
    }

    // Add upvote
    const { data, error } = await (supabase
      .from('ReviewUpvote')
      .insert([{
        reviewid: parseInt(reviewId),
        userid: internalUserId,
        createdat: new Date().toISOString()
      }])
      .select()
      .single() as unknown as Promise<{ data: { id: number; reviewid: number; userid: number } | null; error: any }>);

    if (error) {
      console.error('Error adding upvote:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const { supabase, user } = await createAuthenticatedClient();

    // Get internal user ID from Supabase user ID
    const internalUserId = await getInternalUserId(supabase, user.id);

    const { error } = await (supabase
      .from('ReviewUpvote')
      .delete()
      .eq('reviewid', parseInt(reviewId))
      .eq('userid', internalUserId) as unknown as Promise<{ error: any }>);

    if (error) {
      console.error('Error removing upvote:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Upvote removed" });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
