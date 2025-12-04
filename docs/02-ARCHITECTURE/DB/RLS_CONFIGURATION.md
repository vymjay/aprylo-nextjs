# Row Level Security (RLS) Configuration for Aprylo

## Overview

Aprylo uses a separate User table with foreign key relationships to Supabase Auth users. This document outlines the required RLS policies to ensure proper security while allowing the review system to function correctly.

## Database Architecture

### User Management
- **Supabase Auth**: Handles authentication and session management
- **User Table**: Stores additional user profile information
- **Relationship**: `User.supabaseUserId` → `auth.users.id`

### Review System Tables
- **Review**: Stores product reviews with `userId` referencing the internal User table
- **ReviewUpvote**: Stores review upvotes with `userid` referencing the internal User table

## Required RLS Policies

### 1. User Table Policies

```sql
-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (supabaseUserId = auth.uid());

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (supabaseUserId = auth.uid());

-- Policy: Allow user creation during signup
CREATE POLICY "Allow user creation" ON "User"
  FOR INSERT WITH CHECK (supabaseUserId = auth.uid());
```

### 2. Review Table Policies

```sql
-- Enable RLS
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published reviews
CREATE POLICY "Anyone can view reviews" ON "Review"
  FOR SELECT USING (true);

-- Policy: Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON "Review"
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    userId IN (SELECT id FROM "User" WHERE supabaseUserId = auth.uid())
  );

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON "Review"
  FOR UPDATE USING (
    userId IN (SELECT id FROM "User" WHERE supabaseUserId = auth.uid())
  );

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON "Review"
  FOR DELETE USING (
    userId IN (SELECT id FROM "User" WHERE supabaseUserId = auth.uid())
  );
```

### 3. ReviewUpvote Table Policies

```sql
-- Enable RLS
ALTER TABLE "ReviewUpvote" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read upvotes
CREATE POLICY "Anyone can view upvotes" ON "ReviewUpvote"
  FOR SELECT USING (true);

-- Policy: Authenticated users can create upvotes
CREATE POLICY "Authenticated users can upvote" ON "ReviewUpvote"
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    userid IN (SELECT id FROM "User" WHERE supabaseUserId = auth.uid())
  );

-- Policy: Users can delete their own upvotes
CREATE POLICY "Users can remove own upvotes" ON "ReviewUpvote"
  FOR DELETE USING (
    userid IN (SELECT id FROM "User" WHERE supabaseUserId = auth.uid())
  );
```

## Helper Function for User ID Mapping

Create this function to help with user ID lookups:

```sql
CREATE OR REPLACE FUNCTION get_internal_user_id(supabase_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  internal_id INTEGER;
BEGIN
  SELECT id INTO internal_id 
  FROM "User" 
  WHERE supabaseUserId = supabase_user_id::TEXT;
  
  RETURN internal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## API Implementation Notes

### Authentication Flow
1. **Client Authentication**: Uses Supabase Auth for login/signup
2. **API Requests**: Include Supabase JWT token in requests
3. **Server-side Mapping**: APIs map Supabase user ID to internal User table ID
4. **Database Operations**: Use internal User ID for foreign key relationships

### Key Implementation Details

#### Review Creation
```typescript
// Get internal user ID from Supabase user ID
const internalUserId = await getInternalUserId(supabase, user.id);

// Create review with internal user ID
const reviewData = {
  ...review,
  userId: internalUserId
};
```

#### Upvote Operations
```typescript
// Map to internal user ID for upvote operations
const internalUserId = await getInternalUserId(supabase, user.id);

// Check existing upvote with internal user ID
const { data: existing } = await supabase
  .from('ReviewUpvote')
  .select('*')
  .eq('reviewid', reviewId)
  .eq('userid', internalUserId);
```

## Testing the Configuration

### 1. Test User Creation
```sql
-- Insert test user (normally done via API)
INSERT INTO "User" (name, email, supabaseUserId, role)
VALUES ('Test User', 'test@example.com', 'supabase-auth-user-id', 'user');
```

### 2. Test Review Creation
```sql
-- This should work for authenticated users
INSERT INTO "Review" (productId, userId, rating, title, comment)
VALUES (1, 1, 5, 'Great product', 'Really happy with this purchase');
```

### 3. Test Upvote Creation
```sql
-- This should work for authenticated users
INSERT INTO "ReviewUpvote" (reviewid, userid)
VALUES (1, 1);
```

## Troubleshooting

### Common Issues

1. **"new row violates row-level security policy"**
   - Check that RLS policies are correctly configured
   - Verify user is authenticated
   - Ensure internal User record exists for the Supabase user

2. **User ID mismatch errors**
   - Verify the `getInternalUserId` function is working correctly
   - Check that `supabaseUserId` field is properly populated in User table

3. **Permission denied errors**
   - Ensure RLS policies allow the operation
   - Check that the user has the correct role/permissions

### Debug Queries

```sql
-- Check if internal user exists for Supabase user
SELECT * FROM "User" WHERE supabaseUserId = 'your-supabase-user-id';

-- Check review ownership
SELECT r.*, u.supabaseUserId 
FROM "Review" r 
JOIN "User" u ON r.userId = u.id 
WHERE r.id = 1;

-- Check upvote ownership
SELECT rv.*, u.supabaseUserId 
FROM "ReviewUpvote" rv 
JOIN "User" u ON rv.userid = u.id 
WHERE rv.reviewid = 1;
```

## Security Considerations

1. **Data Isolation**: RLS ensures users can only access their own data
2. **Authentication Required**: All write operations require valid authentication
3. **User Mapping**: Internal user IDs prevent direct access to Supabase user data
4. **Read Access**: Reviews and upvotes are publicly readable but write-protected

## Migration Notes

When upgrading existing systems:

1. **Enable RLS gradually**: Start with SELECT policies, then add write policies
2. **Test thoroughly**: Verify all review operations work correctly
3. **Backup data**: Always backup before applying RLS policies
4. **Monitor logs**: Watch for RLS policy violations during rollout
