import { createPublicClient } from '@/lib/supabase/api-client';
import { NextResponse } from "next/server";

// Cache the response for 1 hour
export const revalidate = 3600;

export async function GET() {
  try {
    const { supabase } = await createPublicClient();

    const { data: categories, error } = await supabase
      .from("Category")
      .select("id, name, slug, description, image")
      .order("id", { ascending: true });

    if (error) {
      console.error('Supabase error fetching categories:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error 
      }, { 
        status: 500 
      });
    }

    if (!categories || categories.length === 0) {
      console.error('No categories found in database');
      return NextResponse.json({ 
        error: 'No categories found',
        details: 'The categories table might be empty' 
      }, { 
        status: 404 
      });
    }

    // Add cache headers
    const response = NextResponse.json(categories);
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return response;
  } catch (error: any) {
    console.error('Server error in categories route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
