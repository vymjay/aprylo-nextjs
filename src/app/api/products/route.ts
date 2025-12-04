import { createPublicClient } from '@/lib/supabase/api-client';
import { NextResponse } from "next/server";

// Disable static revalidation for filtering to work properly
// Cache will be handled by response headers instead
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");

    const { supabase } = await createPublicClient();

    let query = supabase
      .from("Product")
      .select(`*, category:categoryId (id, name, slug)`)
      .eq("isActive", true)
      .order("title", { ascending: true });

    // Apply category filter first - we need to get the category ID
    let categoryId = null;
    if (categoryParam) {
      // Get category ID from slug
      const { data: categoryData } = await supabase
        .from("Category")
        .select("id")
        .eq("slug", categoryParam.toLowerCase())
        .single();
      
      if (categoryData) {
        categoryId = categoryData.id;
        query = query.eq("categoryId", categoryId);
      } else {
        // Category not found, return empty array
        const response = NextResponse.json([]);
        response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        return response;
      }
    }

    if (searchParam) {
      const searchTerm = searchParam.toLowerCase();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Apply pagination at database level
    if (limitParam) {
      const limit = parseInt(limitParam);
      if (!isNaN(limit)) {
        query = query.limit(limit);
        
        if (pageParam) {
          const page = parseInt(pageParam);
          if (!isNaN(page) && page > 1) {
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);
          }
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Add cache headers with shorter cache time for better filtering responsiveness
    const response = NextResponse.json(data || []);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5 minutes cache
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
