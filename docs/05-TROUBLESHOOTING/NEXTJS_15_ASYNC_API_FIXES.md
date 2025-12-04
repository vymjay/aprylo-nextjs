# Next.js 15 Async API Fixes

## Issue Resolved
Fixed the Next.js 15 dynamic API synchronization errors that were occurring in the invoice routes:

```
Error: Route "/api/invoices/[orderId]/view" used `params.orderId`. `params` should be awaited before using its properties.
Error: Route "/api/invoices/[orderId]/view" used `cookies().get('sb-pdjzjcxysnizypghvvxg-auth-token')`. `cookies()` should be awaited before using its value.
```

## Root Cause
Next.js 15 requires that dynamic APIs like `params` and `cookies()` be awaited before accessing their properties.

## Solutions Applied

### 1. Fixed Route Parameters
**Files**: `/src/app/api/invoices/[orderId]/view/route.ts`, `/src/app/api/invoices/[orderId]/download/route.ts`

**Before**:
```typescript
export async function GET(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    const { orderId } = params; // ❌ Error: params should be awaited
}
```

**After**:
```typescript
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await params; // ✅ Fixed: await params
}
```

### 2. Fixed Supabase Client Import
**Files**: `/src/app/api/invoices/[orderId]/view/route.ts`, `/src/app/api/invoices/[orderId]/download/route.ts`

**Before**:
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';
```

**After**:
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/api-client';
```

The api-client implementation already properly handles the async cookies:
```typescript
const { cookies } = await import("next/headers");
const cookieStore = await cookies();
const supabase = createRouteHandlerClient({
    cookies: (): any => cookieStore,
});
```

## Verification
✅ **TypeScript Compilation**: No errors
✅ **Next.js Dev Server**: Starts without warnings
✅ **API Routes**: Compile successfully
✅ **Authentication**: Properly validates user sessions

## Current Status
- **Invoice View Route**: `GET /api/invoices/[orderId]/view` - Working with authentication
- **Invoice Download Route**: `GET /api/invoices/[orderId]/download` - Working with authentication
- **Orders Page**: Integrated invoice buttons work correctly
- **User Experience**: Smooth invoice generation and download

## Notes
- Authentication is required for invoice access (expected behavior)
- Mock order IDs available for testing: "ORD123456", "ORD123457"
- Invoice functionality integrated into orders page as requested
- All Next.js 15 async API requirements satisfied
