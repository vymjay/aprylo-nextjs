import { Product, Category } from '@/types'
import { fetcher } from '@/lib/utils/api-fetch'
import { cache } from 'react'

interface ProductFilters {
  category?: string
  search?: string
  limit?: number
}

export const getProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    // During build time, return empty array to prevent build errors
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_APP_URL) {
      console.warn('No APP_URL configured for build, returning empty products');
      return [];
    }

    // Check if we're running on the server
    if (typeof window === 'undefined') {
      // Server-side: use direct database access
      const { createPublicClient } = await import('@/lib/supabase/api-client');
      const { supabase } = await createPublicClient();

      let query = supabase
        .from("Product")
        .select(`
          *,
          category:categoryId (
            id,
            name,
            slug
          )
        `)
        .eq("isActive", true);

      // Apply category filter using the same logic as API route
      if (filters?.category) {
        // Get category ID from slug first
        const { data: categoryData } = await supabase
          .from("Category")
          .select("id")
          .eq("slug", filters.category.toLowerCase())
          .single();
        
        if (categoryData) {
          query = query.eq("categoryId", categoryData.id);
        } else {
          // Category not found, return empty array
          return [];
        }
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data: products, error } = await query;

      if (error) {
        console.error('Database error in getProducts:', error);
        return [];
      }

      return (products || []) as Product[];
    } else {
      // Client-side: use API
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const url = `/api/products?${params.toString()}`;
      return await fetcher<Product[]>(url);
    }
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
}

export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    // During build time, return empty array to prevent build errors
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_APP_URL) {
      console.warn('No APP_URL configured for build, returning empty categories');
      return [];
    }

    const response = await fetcher<Category[]>('/api/categories');
    if (!response || !Array.isArray(response)) {
      console.warn('Invalid categories response, returning empty array');
      return [];
    }
    return response;
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
});

export const getProductById = cache(async (id: string): Promise<Product | null> => {
  try {
    if (!id) {
      console.error('getProductById called without an ID');
      return null;
    }

    // Check if we're running on the server
    if (typeof window === 'undefined') {
      // Server-side: use direct database access
      const { createPublicClient } = await import('@/lib/supabase/api-client');
      const { supabase } = await createPublicClient();

      const { data: product, error } = await supabase
        .from("Product")
        .select(`
          *,
          category:categoryId (
            id,
            name,
            slug
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error('Database error in getProductById:', error);
        return null;
      }

      if (!product) {
        console.error('No product found for id:', id);
        return null;
      }

      // Validate the response has the required product fields
      if (!product.id || !product.title) {
        console.error('Invalid product data received:', product);
        return null;
      }

      return product as Product;
    } else {
      // Client-side: use API
      const response = await fetcher<Product>(`/api/products/${id}`);
      if (!response) {
        console.error('No product data received for id:', id);
        return null;
      }

      // Validate the response has the required product fields
      if (!response.id || !response.title) {
        console.error('Invalid product data received:', response);
        return null;
      }

      return response;
    }
  } catch (error) {
    console.error('Error in getProductById:', {
      id,
      error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
});