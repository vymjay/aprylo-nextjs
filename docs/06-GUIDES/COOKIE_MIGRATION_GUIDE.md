# API Cookie Management Migration Guide

This document outlines the migration from inconsistent cookie handling to a centralized cookie management system for all API routes.

## What Changed

### Before (Multiple Patterns)
```typescript
// Pattern 1: No authentication
import { createSupabaseClient } from '@/lib/supabase/route';
const supabase = createSupabaseClient();

// Pattern 2: Server route handler
import { createServerRouteHandler } from '@/lib/supabase/route';
const { supabase, user } = await createServerRouteHandler();

// Pattern 3: Server component client
import { createServerSupabaseClient } from '@/lib/supabase/server';
const { supabase, user } = await createServerSupabaseClient();

// Pattern 4: Auth client
import { createAuthClient } from '@/lib/supabase/auth';
const { supabase, user } = await createAuthClient();

// Pattern 5: Direct client import (error prone)
import { supabase } from '@/lib/supabase/client';

// Pattern 6: Direct supabase creation (no cookies)
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
```

### After (Centralized Patterns)
```typescript
import { 
  createPublicClient,           // For public endpoints
  createAuthenticatedClient,    // For authenticated endpoints
  createOptionalAuthClient,     // For endpoints that can work with/without auth
  handleAuthError,              // Centralized error handling
  getInternalUserId            // Common user ID fetching
} from '@/lib/supabase/api-client';
```

## Migration Examples

### Public Endpoints (No Authentication Required)
```typescript
// Before
import { createSupabaseClient } from '@/lib/supabase/route';
export async function GET() {
  const supabase = createSupabaseClient();
  const { data } = await supabase.from('Product').select('*');
  return NextResponse.json(data);
}

// After
import { createPublicClient } from '@/lib/supabase/api-client';
export async function GET() {
  const { supabase } = createPublicClient();
  const { data } = await supabase.from('Product').select('*');
  return NextResponse.json(data);
}
```

### Authenticated Endpoints
```typescript
// Before
import { createServerRouteHandler } from '@/lib/supabase/route';
export async function GET() {
  try {
    const { supabase, user } = await createServerRouteHandler();
    // ... database operations
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// After
import { createAuthenticatedClient, handleAuthError } from '@/lib/supabase/api-client';
export async function GET() {
  try {
    const { supabase, user } = await createAuthenticatedClient();
    // ... database operations
  } catch (error: any) {
    return handleAuthError(error);
  }
}
```

### Getting Internal User ID (Common Pattern)
```typescript
// Before
const { data: userData, error: userError } = await supabase.rpc('get_user_by_supabase_id', {
  supabase_id: user.id,
});
if (userError || !userData?.[0]?.id) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}
const internalUserId = userData[0].id;

// After
import { getInternalUserId } from '@/lib/supabase/api-client';
const internalUserId = await getInternalUserId(supabase, user.id);
```

### Optional Authentication
```typescript
// Before
import { createAuthClient } from '@/lib/supabase/auth';
export async function GET() {
  const { supabase, user } = await createAuthClient();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}

// After
import { createOptionalAuthClient } from '@/lib/supabase/api-client';
export async function GET() {
  const { user } = await createOptionalAuthClient();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
```

## Key Benefits

1. **Consistent Cookie Handling**: All routes now use the same cookie management mechanism
2. **Centralized Error Handling**: Standardized authentication error responses
3. **Type Safety**: Better TypeScript support with proper typing
4. **Reduced Boilerplate**: Common patterns extracted into reusable functions
5. **Easier Maintenance**: Single place to update authentication logic
6. **Better Performance**: Optimized Supabase client creation

## Legacy Compatibility

The old functions are still exported for backward compatibility during migration:
```typescript
// These exports maintain backward compatibility
export const createSupabaseClient = createPublicClient;
export const createServerRouteHandler = createAuthenticatedClient;
export const createServerSupabaseClient = createAuthenticatedClient;
export const createAuthClient = createOptionalAuthClient;
```

## Files Updated

### Core Infrastructure
- ✅ `/src/lib/supabase/api-client.ts` - New centralized cookie management
- ✅ `/src/lib/supabase/client.ts` - Updated for compatibility

### Authentication Routes
- ✅ `/src/app/api/auth/user/route.ts`
- ✅ `/src/app/api/auth/login/route.ts`
- ✅ `/src/app/api/auth/signup/route.ts`
- ✅ `/src/app/api/auth/forgot-password/route.ts`
- ✅ `/src/app/api/auth/change-password/route.ts`
- ✅ `/src/app/api/auth/reset-password/route.ts`

### User Management Routes
- ✅ `/src/app/api/users/route.ts`
- ✅ `/src/app/api/users/me/route.ts`
- ✅ `/src/app/api/users/internal-id/route.ts`
- ✅ `/src/app/api/users/profile/route.ts`
- ✅ `/src/app/api/users/addresses/route.ts`
- ✅ `/src/app/api/users/addresses/current/route.ts`
- ✅ `/src/app/api/users/addresses/batch/route.ts`

### Product Routes
- ✅ `/src/app/api/products/route.ts`
- ✅ `/src/app/api/products/[id]/route.ts`
- ✅ `/src/app/api/products/[id]/variants/route.ts`
- ✅ `/src/app/api/categories/route.ts`

### Other Routes
- ✅ `/src/app/api/cart/route.ts`
- ✅ `/src/app/api/reviews/route.ts`
- ✅ `/src/app/api/reviews/upvotes/route.ts`

## Testing

After migration, verify:
1. Authentication still works correctly
2. Cookie-based sessions are maintained
3. Error responses are consistent
4. All existing functionality is preserved
5. No performance regressions

## Next Steps

1. Monitor logs for any authentication issues
2. Consider removing legacy exports after complete migration
3. Add more comprehensive error handling if needed
4. Consider adding request/response logging for debugging
