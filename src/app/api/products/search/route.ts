import { createPublicClient } from '@/lib/supabase/api-client';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchParam = searchParams.get("q");
    const limitParam = searchParams.get("limit");

    if (!searchParam || searchParam.trim().length < 2) {
      return NextResponse.json([]);
    }

    const { supabase } = await createPublicClient();
    const searchTerm = searchParam.trim().toLowerCase();
    const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 20; // Max 50 for performance

    // Sanitize search term for SQL injection protection
    const sanitizedTerm = searchTerm.replace(/[%_]/g, '\\$&');

    // Simple search without complex relevance scoring
    const { data, error } = await supabase
      .from("Product")
      .select(`
        id,
        title,
        slug,
        price,
        originalPrice,
        images,
        category:categoryId (id, name, slug)
      `)
      .eq('isActive', true)
      .or(`title.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%`)
      .limit(limit);

    if (error) {
      throw error;
    }

    // Simple alphabetical sorting
    const sortedResults = (data || []).sort((a, b) => a.title.localeCompare(b.title));

    // Add cache headers for better performance
    const response = NextResponse.json(sortedResults);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // Cache for 5 minutes
    
    return response;
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
