import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '@/lib/utils/api-fetch'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/db'

type CartItem = Tables<'CartItem'> & {
  product?: Tables<'Product'>
  variant?: Tables<'ProductVariant'>
}

// Query Keys
export const CART_KEYS = {
  all: ['cart'] as const,
  lists: () => [...CART_KEYS.all, 'list'] as const,
  list: (userId: string | number) => [...CART_KEYS.lists(), userId] as const,
}

// Hooks
export function useCart(userId: string | number) {
  return useQuery({
    queryKey: CART_KEYS.list(userId),
    queryFn: () => fetcher<CartItem[]>(`/api/cart?userId=${userId}`),
    enabled: !!userId,
    staleTime: 30 * 1000, // Cart data should be fresh (30 seconds)
  })
}

// Mutations
export function useAddToCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: { item: Omit<CartItem, 'id'> & { userId: number } }) => {
      return fetcher<CartItem>('/api/cart', {
        method: 'POST',
        body: JSON.stringify(item),
      })
    },
    onSuccess: (data, variables) => {
      // Invalidate cart for the specific user
      queryClient.invalidateQueries({ 
        queryKey: CART_KEYS.list(variables.item.userId) 
      })
    },
  })
}

export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, userId }: { id: number; userId: number }) => {
      return fetcher(`/api/cart?id=${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: CART_KEYS.list(variables.userId) 
      })
    },
  })
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, quantity, userId }: { id: number; quantity: number; userId: number }) => {
      return fetcher<CartItem>('/api/cart', {
        method: 'PATCH',
        body: JSON.stringify({ id, quantity }),
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: CART_KEYS.list(variables.userId) 
      })
    },
  })
}

export function useClearCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: number) => {
      return fetcher('/api/cart/clear', {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      })
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ 
        queryKey: CART_KEYS.list(userId) 
      })
    },
  })
}
