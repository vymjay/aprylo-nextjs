import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '@/lib/utils/api-fetch'
import type { Category } from '@/types'

// Query Keys
export const CATEGORY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_KEYS.all, 'list'] as const,
  list: (filters: object = {}) => [...CATEGORY_KEYS.lists(), filters] as const,
}

// Hooks
export function useCategories() {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(),
    queryFn: () => fetcher<Category[]>('/api/categories'),
    staleTime: 60 * 60 * 1000, // 1 hour - categories don't change often
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export function useCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (category: Omit<Category, 'id'>) => {
      return fetcher<Category>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      })
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all })
    },
  })
}
