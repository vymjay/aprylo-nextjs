import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { fetcher } from '@/lib/utils/api-fetch'
import type { Product } from '@/types'

// Query Keys
export const PRODUCT_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
  list: (filters: object = {}) => [...PRODUCT_KEYS.lists(), filters] as const,
  details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
  detail: (id: string | number) => [...PRODUCT_KEYS.details(), id] as const,
  variants: (id: string | number) => [...PRODUCT_KEYS.detail(id), 'variants'] as const,
}

interface ProductFilters {
  category?: string
  search?: string
  limit?: number
  page?: number
}

// Hooks
export function useProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.search) params.append('search', filters.search)
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.page) params.append('page', filters.page.toString())

  return useQuery({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => fetcher<Product[]>(`/api/products?${params.toString()}`),
    staleTime: 5 * 60 * 1000, // 5 minutes for better filtering responsiveness
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export function useProduct(id: string | number) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => fetcher<Product>(`/api/products/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual products
    gcTime: 30 * 60 * 1000,
  })
}

export function useProductVariants(productId: string | number) {
  return useQuery({
    queryKey: PRODUCT_KEYS.variants(productId),
    queryFn: () => fetcher<any[]>(`/api/products/${productId}/variants`),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function useInfiniteProducts(filters: ProductFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...PRODUCT_KEYS.list(filters), 'infinite'],
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.limit) params.append('limit', filters.limit.toString())
      params.append('page', pageParam.toString())
      
      return fetcher<Product[]>(`/api/products?${params.toString()}`)
    },
    getNextPageParam: (lastPage, allPages) => {
      // Assume we get less than limit when no more pages
      if (lastPage.length < (filters.limit || 20)) {
        return undefined
      }
      return allPages.length + 1
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes for better filtering performance
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

export function useProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      return fetcher<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
    },
  })
}
