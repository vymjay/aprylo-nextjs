import { NextResponse } from "next/server";
import { createPublicClient, createAuthenticatedClient, handleAuthError, getInternalUserId } from "@/lib/supabase/api-client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { supabase } = await createPublicClient();

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    try {
      // Get total count for pagination info
      const { count, error: countError } = await supabase
        .from("Review")
        .select("*", { count: "exact", head: true })
        .eq("productId", productId);

      if (countError) {
        console.error('Error fetching count:', countError);
      }

      // Get reviews with user info and upvote counts
      const { data: reviews, error } = await supabase
        .from("Review")
        .select(`
          *,
          User (
            id,
            name,
            email
          ),
          ReviewUpvote (
            id,
            userid,
            reviewid
          )
        `)
        .eq("productId", productId)
        .order("createdAt", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Transform the data to include upvote information
      const transformedReviews = reviews?.map(review => ({
        ...review,
        user: review.User ? {
          id: review.User.id,
          name: review.User.name || review.User.email?.split('@')[0] || `User ${review.userId}`,
          email: review.User.email
        } : { 
          name: `User ${review.userId}`,
          email: null
        },
        upvotes: review.ReviewUpvote?.length || 0,
        ReviewUpvote: review.ReviewUpvote || []
      })) || [];

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      return NextResponse.json({
        reviews: transformedReviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasMore,
          limit
        }
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GET reviews:', error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { review } = body;

    if (!review) {
      return NextResponse.json({ error: "Review data is required" }, { status: 400 });
    }

    const { supabase, user } = await createAuthenticatedClient();

    // Get internal user ID from Supabase user ID
    const internalUserId = await getInternalUserId(supabase, user.id);

    // Add internal userId to the review
    const reviewData = {
      ...review,
      userId: internalUserId
    };

    const { data, error } = await supabase
      .from("Review")
      .insert([reviewData])
      .select(`
        *,
        User (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in POST review:', error);
    return handleAuthError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { review } = body;

    if (!review || !review.id) {
      return NextResponse.json({ error: "Review data with ID is required" }, { status: 400 });
    }

    const { supabase, user } = await createAuthenticatedClient();

    // Get internal user ID from Supabase user ID
    const internalUserId = await getInternalUserId(supabase, user.id);

    // First check if the review belongs to the user
    const { data: existingReview, error: fetchError } = await supabase
      .from("Review")
      .select("userId")
      .eq("id", review.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existingReview.userId !== internalUserId) {
      return NextResponse.json({ 
        error: "Unauthorized - You can only edit your own reviews" 
      }, { status: 403 });
    }

    // Update the review
    const { data, error } = await supabase
      .from("Review")
      .update({
        rating: review.rating,
        title: review.title,
        comment: review.comment
      })
      .eq("id", review.id)
      .select(`
        *,
        User (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PUT review:', error);
    return handleAuthError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const { supabase, user } = await createAuthenticatedClient();

    // Get internal user ID from Supabase user ID
    const internalUserId = await getInternalUserId(supabase, user.id);

    // First check if the review belongs to the user
    const { data: review, error: fetchError } = await supabase
      .from("Review")
      .select("userId")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.userId !== internalUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabase.from("Review").delete().eq("id", id);

    if (error) {
      console.error('DELETE review database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE review error:', error);
    return handleAuthError(error);
  }
}
