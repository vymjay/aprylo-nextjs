import { Product, Category } from '@/types'
import { fetcher } from '@/lib/utils/api-fetch'
import { cache } from 'react'

interface ProductFilters {
  category?: string
  search?: string
  limit?: number
}

/**
 * Retry helper for database queries with exponential backoff
 */
async function retryQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a network/timeout error
      const isNetworkError = 
        error?.message?.includes('fetch failed') ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('CONNECT_TIMEOUT') ||
        error?.code === 'UND_ERR_CONNECT_TIMEOUT';
      
      // Only retry on network errors
      if (!isNetworkError || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const waitTime = delay * Math.pow(2, attempt);
      console.warn(`Database query failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${waitTime}ms...`, error?.message);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
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
        // Get category ID from slug first with retry
        const categoryData = await retryQuery(async () => {
          const { data, error } = await supabase
            .from("Category")
            .select("id")
            .eq("slug", filters.category!.toLowerCase())
            .single();
          
          if (error) throw error;
          return data;
        });
        
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

      // Execute query with retry logic
      const { data: products, error } = await retryQuery(async () => {
        const queryResult = await query;
        if (queryResult.error) {
          throw queryResult.error;
        }
        return queryResult;
      }).catch((error) => {
        // If retry fails, return error structure
        return { data: null, error };
      });

      if (error) {
        // Log error but don't throw - return empty array for graceful degradation
        const errorDetails = error as any;
        console.error('Database error in getProducts:', {
          message: errorDetails?.message || 'Unknown error',
          details: errorDetails?.details,
          hint: errorDetails?.hint,
          code: errorDetails?.code
        });
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

      // Execute query with retry logic
      const result = await retryQuery(async () => {
        const queryResult = await supabase
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
        
        if (queryResult.error) throw queryResult.error;
        return queryResult;
      });
      
      const { data: product, error } = result;

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