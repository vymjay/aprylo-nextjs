# VB Cart Admin Panel Setup Guide

## Overview

This guide will help you set up and use the VB Cart Admin Panel for managing your e-commerce store.

## Quick Setup

### 1. Create Admin User

First, create a regular user account through the normal signup process, then promote it to admin:

1. **Sign up** through the website with your admin email
2. **Run the SQL script** to grant admin privileges:

```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your-admin-email@example.com';
```

3. **Log out and log back in** to see admin options

### 2. Access Admin Panel

- Click on your profile dropdown in the top-right corner
- You'll see new "Admin Dashboard" and "Manage Products" options
- Or navigate directly to `/admin`

## Features

### Admin Dashboard (`/admin`)
- **Overview**: Key metrics and statistics
- **Quick Actions**: Add products, view store, settings
- **Recent Activity**: Latest updates and changes

### Product Management (`/admin/products`)
- **List Products**: View all products with search, filtering, and pagination
- **Add Products**: Create new product listings with comprehensive details
- **Edit Products**: Update existing product information
- **Delete Products**: Remove products with confirmation dialog

### Product Form Features
- **Basic Info**: Name, slug, descriptions
- **Pricing**: Regular price and sale pricing
- **Media**: Main image URL and additional images
- **Variants**: Sizes, colors, and tags
- **Inventory**: Stock quantity management
- **Categories**: Product categorization
- **Settings**: Featured and new product flags

## Security

### Role-Based Access
- Only users with `ADMIN` role can access admin features
- Middleware automatically protects all `/admin/*` routes
- Non-admin users are redirected to the home page

### API Protection
- All admin API endpoints require authentication
- Server-side role validation for every request
- Comprehensive error handling and validation

## Sample Data Setup

Run the provided SQL script to create sample categories and products:

```bash
# In your Supabase SQL Editor or psql
\i scripts/setup-admin.sql
```

This creates:
- Sample categories (Men's, Women's, Children's)
- A sample product for testing
- Admin user setup

## Usage Examples

### Adding a New Product

1. Navigate to `/admin/products`
2. Click "Add Product"
3. Fill in the required fields:
   - **Name**: Product title
   - **Slug**: URL-friendly identifier (auto-generated)
   - **Price**: Product price
   - **Image URL**: Main product image
4. Optionally add:
   - Description and short description
   - Additional images (comma-separated URLs)
   - Sizes and colors (comma-separated)
   - Category selection
   - Stock quantity
   - Featured/New flags
5. Click "Create Product"

### Managing Existing Products

1. Go to `/admin/products`
2. Use the search bar to find specific products
3. Click the actions dropdown (⋮) for any product
4. Choose "Edit" to modify or "Delete" to remove

### Setting Product Categories

Categories help organize your products:

1. Ensure categories exist in your database
2. When creating/editing products, select from the category dropdown
3. Categories are displayed in the products table

## Troubleshooting

### Common Issues

**"Access Denied" Error**
- Ensure your user has `ADMIN` role in the database
- Log out and log back in after role change
- Check the User table in your database

**Products Not Loading**
- Check your database connection
- Verify the Product table has data
- Check browser console for API errors

**Form Validation Errors**
- Ensure all required fields are filled (marked with *)
- Verify image URLs are valid and accessible
- Check that price values are positive numbers

**Categories Not Showing**
- Ensure the Category table has data
- Run the sample data script if needed
- Check the categories API endpoint

### Debug Information

- Check browser developer tools console for errors
- Verify API responses in the Network tab
- Check server logs for backend issues
- Ensure all environment variables are set correctly

## Database Schema

### User Table
```sql
role: 'ADMIN' | 'USER'  -- Required for admin access
```

### Product Table
Key fields:
- `name`: Product title
- `slug`: URL identifier (unique)
- `price`: Product price
- `image_url`: Main image
- `category_id`: Links to Category table
- `stock_quantity`: Inventory count
- `is_featured`: Homepage display flag
- `is_new`: New product flag

### Category Table
- `id`: Primary key
- `name`: Category name
- `slug`: URL identifier

## API Endpoints

### Admin APIs
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `GET /api/admin/products/[id]` - Get product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

### Public APIs
- `GET /api/categories` - List categories
- `GET /api/products` - List products (public)

## Next Steps

1. **Set up your admin account** using the SQL script
2. **Create product categories** for your store
3. **Add your first products** through the admin panel
4. **Test the functionality** by viewing products on the main site
5. **Customize** as needed for your specific requirements

## Support

For additional help:
- Check the main documentation in `/docs`
- Review the codebase for implementation details
- Ensure your database schema matches the requirements
