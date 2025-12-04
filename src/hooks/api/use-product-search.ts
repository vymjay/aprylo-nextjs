import { useQuery } from '@tanstack/react-query'
import { fetcher } from '@/lib/utils/api-fetch'
import type { Product } from '@/types'

interface SearchProduct {
  id: number
  title: string
  slug: string
  price: number
  originalPrice: number
  images: string[]
  category?: {
    id: number
    name: string
  }
}

interface SearchFilters {
  q?: string
  limit?: number
}

export const SEARCH_KEYS = {
  all: ['search'] as const,
  searches: () => [...SEARCH_KEYS.all, 'products'] as const,
  search: (filters: SearchFilters) => [...SEARCH_KEYS.searches(), filters] as const,
}

export function useProductSearch(filters: SearchFilters = {}) {
  const { q, limit = 12 } = filters // Increased default limit for better results
  
  const params = new URLSearchParams()
  if (q) params.append('q', q)
  if (limit) params.append('limit', limit.toString())

  return useQuery({
    queryKey: SEARCH_KEYS.search(filters),
    queryFn: () => fetcher<SearchProduct[]>(`/api/products/search?${params.toString()}`),
    enabled: !!(q && q.length >= 2), // Only search when query has at least 2 characters
    staleTime: 5 * 60 * 1000, // 5 minutes - search results can be cached longer for performance
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus for better UX
  })
}
