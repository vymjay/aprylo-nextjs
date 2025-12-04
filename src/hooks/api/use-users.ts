import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '@/lib/utils/api-fetch'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/db'

type UserRow = Tables<'User'>
type AddressRow = Tables<'Address'>
type AddressInsert = TablesInsert<'Address'>
type AddressUpdate = TablesUpdate<'Address'>

// Query Keys
export const USER_KEYS = {
  all: ['users'] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string | number) => [...USER_KEYS.details(), id] as const,
  current: () => [...USER_KEYS.all, 'current'] as const,
  addresses: (userId?: string | number) => [...USER_KEYS.all, 'addresses', userId] as const,
  currentAddresses: () => [...USER_KEYS.all, 'addresses', 'current'] as const,
}

// Auth query keys
export const AUTH_KEYS = {
  user: () => ['auth', 'user'] as const,
}

// Hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: USER_KEYS.current(),
    queryFn: () => fetcher<any>('/api/users/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if user is not authenticated
  })
}

export function useAuthUser() {
  return useQuery({
    queryKey: AUTH_KEYS.user(),
    queryFn: async () => {
      const response = await fetch('/api/auth/user')
      if (!response.ok) {
        return null
      }
      const data = await response.json()
      return data.user
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  })
}

export function useUser(id: string | number) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => fetcher<UserRow>(`/api/users?userId=${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

export function useUserByEmail(email: string) {
  return useQuery({
    queryKey: [...USER_KEYS.all, 'email', email],
    queryFn: () => fetcher<UserRow>(`/api/users?email=${email}`),
    enabled: !!email,
    staleTime: 10 * 60 * 1000,
  })
}

export function useInternalUserId() {
  return useQuery({
    queryKey: [...USER_KEYS.all, 'internal-id'],
    queryFn: () => fetcher<{ id: number }>('/api/users/internal-id'),
    staleTime: 60 * 60 * 1000, // 1 hour - internal ID rarely changes
  })
}

export function useUserAddresses(userId?: string | number) {
  return useQuery({
    queryKey: USER_KEYS.addresses(userId),
    queryFn: () => fetcher<AddressRow[]>(`/api/users/addresses?userId=${userId}`),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCurrentUserAddresses() {
  return useQuery({
    queryKey: USER_KEYS.currentAddresses(),
    queryFn: () => fetcher<AddressRow[]>('/api/users/addresses/current'),
    staleTime: 5 * 60 * 1000,
  })
}

// Mutations
export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Partial<UserRow>) => {
      return fetcher<UserRow>('/api/users', {
        method: 'PUT',
        body: JSON.stringify({ id, ...payload }),
      })
    },
    onSuccess: (data, variables) => {
      // Update the specific user cache
      queryClient.setQueryData(USER_KEYS.detail(variables.id), data)
      // Invalidate current user if updating current user
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() })
    },
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      return fetcher<UserRow>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() })
    },
  })
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Omit<AddressRow, 'id'>) => {
      return fetcher<AddressRow>('/api/users/addresses', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.currentAddresses() })
      queryClient.invalidateQueries({ queryKey: [...USER_KEYS.all, 'addresses'] })
    },
  })
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Partial<AddressRow>) => {
      return fetcher<AddressRow>('/api/users/addresses', {
        method: 'PUT',
        body: JSON.stringify({ id, ...payload }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.currentAddresses() })
      queryClient.invalidateQueries({ queryKey: [...USER_KEYS.all, 'addresses'] })
    },
  })
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return fetcher(`/api/users/addresses?id=${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.currentAddresses() })
      queryClient.invalidateQueries({ queryKey: [...USER_KEYS.all, 'addresses'] })
    },
  })
}

// User role hook that depends on the internal user data
export function useUserRole() {
  return useQuery({
    queryKey: [...USER_KEYS.all, 'role'],
    queryFn: async () => {
      const response = await fetcher<{ user: UserRow | null }>('/api/auth/user')
      return response.user?.role || null
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

// Admin check hook - uses dedicated admin check API
export function useIsAdmin() {
  return useQuery({
    queryKey: ['auth', 'admin-check'],
    queryFn: async () => {
      const response = await fetch('/api/auth/admin-check')
      if (!response.ok) {
        return { isAdmin: false }
      }
      const data = await response.json()
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  })
}

// Hook to get internal user data (including role, name, etc.)
export function useInternalUserData() {
  return useQuery({
    queryKey: [...USER_KEYS.all, 'internal-data'],
    queryFn: () => fetcher<{ user: UserRow | null }>('/api/auth/user'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

// Legacy admin check hook - fallback to useAuthUser
export function useIsAdminLegacy() {
  const { data: user } = useAuthUser()
  return user?.role === 'ADMIN'
}

// Hook to manually clear auth cache (useful for testing or forced logout scenarios)
export function useAuthUserActions() {
  const queryClient = useQueryClient()
  
  return {
    clearAuthCache: () => {
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user() })
      queryClient.removeQueries({ queryKey: USER_KEYS.current() })
      queryClient.removeQueries({ queryKey: USER_KEYS.currentAddresses() })
    },
    invalidateAuthCache: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user() })
      queryClient.invalidateQueries({ queryKey: USER_KEYS.current() })
    }
  }
}

export function useBatchUpdateAddressesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { addresses: any[]; deletedIds: number[] }) => {
      return fetcher<AddressRow[]>('/api/users/addresses/batch', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.currentAddresses() })
      queryClient.invalidateQueries({ queryKey: [...USER_KEYS.all, 'addresses'] })
    },
  })
}
