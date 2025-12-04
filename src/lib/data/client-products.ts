import { Product, Category } from '@/types'
import { fetcher } from '@/lib/utils/api-fetch'

interface ProductFilters {
  category?: string
  search?: string
  limit?: number
}

/**
 * Client-side only functions for fetching products and categories
 * These should only be used in client components
 */

export const getProductsClient = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetcher<Product[]>(url);
    
    if (!response || !Array.isArray(response)) {
      console.warn('Invalid products response, returning empty array');
      return [];
    }
    
    return response;
  } catch (error) {
    console.error('Error in getProductsClient:', error);
    return [];
  }
};

// Cache for categories to prevent multiple simultaneous requests
let categoriesCache: Category[] | null = null;
let categoriesPromise: Promise<Category[]> | null = null;

// Function to clear categories cache (useful for testing)
export const clearCategoriesCache = () => {
  categoriesCache = null;
  categoriesPromise = null;
};

export const getCategoriesClient = async (): Promise<Category[]> => {
  // Return cached data if available
  if (categoriesCache) {
    console.log('Returning cached categories:', categoriesCache.length);
    return categoriesCache;
  }

  // Return ongoing promise if one exists
  if (categoriesPromise) {
    console.log('Returning ongoing categories promise');
    return categoriesPromise;
  }

  // Create new promise
  categoriesPromise = (async () => {
    try {
      console.log('Fetching categories from /api/categories');
      const response = await fetcher<Category[]>('/api/categories');
      
      if (!response) {
        console.warn('No response received from categories API');
        return [];
      }
      
      if (!Array.isArray(response)) {
        console.warn('Invalid categories response format:', typeof response, response);
        return [];
      }
      
      console.log('Successfully fetched categories:', response.length);
      
      // Cache the result
      categoriesCache = response;
      
      return response;
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        errorObject: error,
        stringified: JSON.stringify(error, Object.getOwnPropertyNames(error))
      };
      
      console.error('Error in getCategoriesClient:', errorDetails);
      return [];
    } finally {
      // Clear the promise so future calls can try again
      categoriesPromise = null;
    }
  })();

  return categoriesPromise;
};

export const getProductByIdClient = async (id: string): Promise<Product | null> => {
  try {
    if (!id) {
      console.warn('No product ID provided');
      return null;
    }

    const response = await fetcher<Product>(`/api/products/${id}`);
    if (!response) {
      console.warn('No product found with ID:', id);
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('Error in getProductByIdClient:', error);
    return null;
  }
};
