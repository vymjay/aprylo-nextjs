# Auth Cache Management

This document explains how the authentication cache is managed to ensure data consistency during login/logout operations.

## Overview

The authentication system now includes automatic cache clearing to prevent stale user data from being displayed after logout. This ensures that:

1. User data is immediately cleared from React Query cache on logout
2. No residual authentication state remains in the application
3. The next login fetches fresh user data

## Implementation Details

### Cache Keys

The auth system uses these React Query cache keys:

```typescript
export const AUTH_KEYS = {
  user: () => ['auth', 'user'] as const,
}

export const USER_KEYS = {
  current: () => ['users', 'current'] as const,
  currentAddresses: () => ['users', 'addresses', 'current'] as const,
}
```

### Automatic Cache Clearing

Cache is automatically cleared in these scenarios:

1. **During logout process**: Cache is immediately cleared when `logout()` is called
2. **On auth state change**: When Supabase emits a `SIGNED_OUT` event
3. **On session errors**: When authentication fails or sessions become invalid

### Manual Cache Management

The auth cache is automatically managed, but for advanced use cases, you can access cache management through the auth context's internal mechanisms. The cache clearing is handled automatically during logout and auth state changes.

### Enhanced Auth Hook

The standard `useAuthUser()` hook provides cached authentication data:

```typescript
import { useAuthUser, useUserRole, useIsAdmin } from '@/hooks/api/use-users'

function MyComponent() {
  const { data: user, isLoading } = useAuthUser()
  const userRole = useUserRole()
  const isAdmin = useIsAdmin()
  
  // Use cached user data without additional API calls
}
```

## Testing Cache Clearing

The auth cache clearing functionality works automatically:

1. **Login**: User data is cached for performance
2. **Logout**: Cache is immediately cleared
3. **Session errors**: Stale cache is automatically cleared
4. **Auth state changes**: Cache stays synchronized with authentication state

You can verify cache clearing by checking the browser's developer tools Network tab - you should see that `/api/auth/user` is only called once when needed, and no stale data appears after logout.

## Performance Benefits

1. **Faster UI Updates**: Cache is cleared immediately for instant logout feedback
2. **Prevents Stale Data**: No old user data lingers in the application
3. **Consistent State**: Auth context and cache stay synchronized
4. **Reduced API Calls**: Cache prevents redundant `/api/auth/user` requests

## Migration from Direct API Calls

Before (multiple API calls):
```typescript
// ❌ Old way - multiple API calls
const checkUser = async () => {
  const response = await fetch('/api/auth/user')
  const data = await response.json()
  setUser(data.user)
}
```

After (cached with auto-clearing):
```typescript
// ✅ New way - cached with automatic cleanup
const { data: user } = useAuthUser()
// Cache automatically clears on logout
```

## Error Handling

The cache clearing is designed to be resilient:

- Cache is cleared even if logout API fails
- Supabase auth state changes trigger cache clearing
- Manual cache clearing is always available as fallback

This ensures the application never gets stuck with stale authentication data.
