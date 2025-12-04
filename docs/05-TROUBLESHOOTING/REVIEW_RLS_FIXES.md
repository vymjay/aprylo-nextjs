# Review System RLS Fixes - Implementation Summary

## Issues Resolved

### 1. **Row Level Security (RLS) Policy Violations**

**Problem**: 
- `new row violates row-level security policy for table "ReviewUpvote"`
- `Failed to submit review` due to RLS policy violations

**Root Cause**: 
VB Cart uses a separate User table with foreign key to Supabase Auth users, but the API endpoints were using Supabase user IDs directly instead of mapping to internal User table IDs.

**Solution**:
Updated all review-related API endpoints to properly map Supabase Auth user IDs to internal User table IDs.

## Files Modified

### 1. `/src/app/api/reviews/route.ts`
- **POST**: Now maps Supabase user ID to internal user ID before creating reviews
- **PUT**: Added proper user ID mapping for review updates
- **DELETE**: Added authorization check using internal user ID

### 2. `/src/app/api/reviews/upvotes/route.ts`
- **POST**: Updated to use internal user ID for upvote creation/removal
- **DELETE**: Updated to use internal user ID for upvote deletion

### 3. `/src/app/api/auth/user/route.ts`
- Updated to return internal User table data instead of just Supabase Auth data
- Added fallback handling for missing internal user records

### 4. `/src/lib/supabase/api-client.ts`
- Already contained the `getInternalUserId` helper function
- This function maps Supabase Auth user IDs to internal User table IDs

## Technical Implementation

### User ID Mapping Flow
```typescript
// Before (causing RLS violations)
const reviewData = { ...review, userId: user.id }; // Supabase Auth ID

// After (working with RLS)
const internalUserId = await getInternalUserId(supabase, user.id);
const reviewData = { ...review, userId: internalUserId }; // Internal User table ID
```

### API Authentication Pattern
```typescript
const { supabase, user } = await createAuthenticatedClient();
const internalUserId = await getInternalUserId(supabase, user.id);
// Use internalUserId for all database operations
```

## Required Database Setup

### RLS Policies Needed
See `/docs/DB/RLS_CONFIGURATION.md` for complete RLS policy setup.

Key policies required:
1. **Review table**: Allow users to CRUD their own reviews using internal user ID
2. **ReviewUpvote table**: Allow users to manage their own upvotes using internal user ID
3. **User table**: Allow users to read/update their own profile data

### Example RLS Policy
```sql
-- Allow users to create reviews
CREATE POLICY "Authenticated users can create reviews" ON "Review"
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    userId IN (SELECT id FROM "User" WHERE supabaseUserId = auth.uid())
  );
```

## Testing the Fix

### 1. Review Creation Test
```bash
# Should work now (requires authentication)
curl -X POST "http://localhost:3000/api/reviews" \
  -H "Content-Type: application/json" \
  -d '{"review": {"productId": 1, "rating": 5, "title": "Test", "comment": "Great!"}}'
```

### 2. Upvote Test
```bash
# Should work now (requires authentication)
curl -X POST "http://localhost:3000/api/reviews/upvotes" \
  -H "Content-Type: application/json" \
  -d '{"reviewId": 1}'
```

## Next Steps

1. **Apply RLS Policies**: Use the SQL scripts in `RLS_CONFIGURATION.md`
2. **Test Authentication**: Ensure users can login and their sessions work
3. **Verify User Mapping**: Check that all authenticated users have records in the User table
4. **Monitor Logs**: Watch for any remaining RLS violations

## Security Benefits

- ✅ **Data Isolation**: Users can only access their own reviews/upvotes
- ✅ **Authentication Required**: All write operations require valid auth
- ✅ **Proper Authorization**: Users can only edit/delete their own content
- ✅ **Foreign Key Integrity**: Maintains proper relationships between tables

## Error Handling

The API now properly handles:
- Missing internal user records
- RLS policy violations
- Authentication failures
- Database constraint violations

## Deployment Notes

1. **Database First**: Apply RLS policies before deploying API changes
2. **Test Staging**: Verify the fix works in staging environment
3. **Monitor Production**: Watch for any RLS-related errors after deployment
4. **User Migration**: Ensure all existing Supabase users have corresponding User table records

---

The review system should now work properly with Row Level Security enabled! 🎉
