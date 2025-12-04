# Next.js 15 Cookies API Fix - Commit Template

## Commit Message Format
```
fix: resolve Next.js 15 cookies() synchronization error

- Updated /src/lib/supabase/server.ts to properly await cookies()
- Fixed createServerSupabaseClient to use correct cookie handling pattern  
- Ensures compliance with Next.js 15 dynamic API requirements
- Resolves console warnings in development and potential runtime issues

Tested:
- Products API: GET /api/products/1 - ✅ 200 OK
- Categories API: GET /api/categories - ✅ 200 OK
- No more synchronization errors in console

Closes: #[issue-number]
```

## Related Changes Checklist

When making similar async API fixes:

- [ ] Identify all files using dynamic APIs (`cookies()`, `headers()`, `searchParams`)
- [ ] Update to use `await` pattern: `const cookieStore = await cookies()`
- [ ] Ensure proper function wrapping: `cookies: () => cookieStore`
- [ ] Add type casting if needed: `as any` for compatibility
- [ ] Test all affected API routes
- [ ] Verify TypeScript compilation
- [ ] Update documentation
- [ ] Add to troubleshooting docs

## Files That May Need Similar Updates

Check these patterns across the codebase:
- Direct `cookies` imports without await
- `headers()` calls without await  
- `searchParams` access without await
- Server component client initialization
- Route handler client initialization

## Quick Fix Template

```typescript
// ❌ OLD PATTERN
import { cookies } from "next/headers";
const supabase = createClient({ cookies });

// ✅ NEW PATTERN  
import { cookies } from "next/headers";
const cookieStore = await cookies();
const supabase = createClient({ 
  cookies: () => cookieStore as any 
});
```
