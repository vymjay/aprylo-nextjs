-- Admin User Setup Script for VB Cart
-- Run this script after creating a regular user account to give them admin privileges

-- First, find your user ID by checking the User table with your email
-- SELECT * FROM "User" WHERE email = 'your-email@example.com';

-- Option 1: Update an existing user to have admin role
-- Replace 'your-email@example.com' with the actual admin user's email
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';

-- Option 2: Check if the update was successful
SELECT id, email, name, role, "supabaseUserId", "createdAt"
FROM "User" 
WHERE role = 'ADMIN';

-- Option 3: Create sample categories if they don't exist
INSERT INTO "Category" (name, slug, description) 
VALUES 
  ('Men''s Clothing', 'men', 'Fashion and clothing for men'),
  ('Women''s Clothing', 'women', 'Fashion and clothing for women'),
  ('Children''s Clothing', 'children', 'Fashion and clothing for children')
ON CONFLICT (slug) DO NOTHING;

-- Option 4: Verify categories exist
SELECT id, name, slug FROM "Category" ORDER BY id;

-- Option 5: Create a sample product for testing (optional)
INSERT INTO "Product" (
  name, 
  slug, 
  description, 
  price, 
  original_price,
  category_id,
  image_url,
  images,
  sizes,
  colors,
  tags,
  stock_quantity,
  is_featured,
  is_new
) VALUES (
  'Sample T-Shirt',
  'sample-t-shirt',
  'A comfortable cotton t-shirt perfect for everyday wear',
  29.99,
  39.99,
  (SELECT id FROM "Category" WHERE slug = 'men' LIMIT 1),
  'https://example.com/sample-tshirt.jpg',
  ARRAY['https://example.com/sample-tshirt-1.jpg', 'https://example.com/sample-tshirt-2.jpg'],
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Blue', 'Red', 'Green'],
  ARRAY['casual', 'cotton', 'comfortable'],
  50,
  true,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Instructions:
-- 1. First create a user account through the normal signup process
-- 2. Replace 'your-email@example.com' with your actual email in the UPDATE statement above
-- 3. Run the UPDATE statement to grant admin privileges
-- 4. Optionally run the category and product inserts for testing
-- 5. Log out and log back in to see the admin options in the user dropdown
