# Admin Panel Documentation

## Overview

The Aprylo Admin Panel provides a comprehensive interface for managing the e-commerce platform. It includes product management, user management, and analytics capabilities.

## Access Control

### Admin Role
- Only users with the `ADMIN` role in the User table can access the admin panel
- Admin role is checked via middleware for all `/admin/*` routes
- Non-admin users are automatically redirected to the home page

### Authentication Flow
1. User logs in through the regular authentication system
2. Middleware checks if accessing `/admin/*` routes
3. If admin route, validates user session and checks role in User table
4. Redirects non-admin users or unauthenticated users

## Features

### 1. Admin Dashboard (`/admin`)
- Overview of key metrics
- Quick actions for common tasks
- Recent activity feed
- Direct links to all admin sections

### 2. Product Management (`/admin/products`)
- **List Products**: View all products with pagination, search, and filtering
- **Add Product**: Create new products with full details
- **Edit Product**: Update existing product information
- **Delete Product**: Remove products with confirmation

#### Product Form Features:
- **Basic Information**: Name, slug, descriptions
- **Pricing**: Regular and sale pricing
- **Media**: Main image and additional images
- **Variants**: Sizes, colors, tags
- **Inventory**: Stock management
- **Categories**: Product categorization
- **Settings**: Featured/New product flags

### 3. API Endpoints

#### Admin Product APIs
- `GET /api/admin/products` - List products with admin features
- `POST /api/admin/products` - Create new product
- `GET /api/admin/products/[id]` - Get specific product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

All admin APIs require authentication and admin role validation.

## Security Features

### Role-Based Access Control (RBAC)
- Database-level role checking
- Middleware protection for admin routes
- API endpoint protection with admin validation

### Input Validation
- Server-side validation for all product data
- Slug uniqueness checking
- Required field validation
- Data type validation

### Error Handling
- Comprehensive error messages
- Graceful fallbacks for failed operations
- User-friendly error notifications

## Usage Guide

### Accessing Admin Panel
1. Log in with an admin account
2. Click on "Admin Dashboard" in the user dropdown
3. Or navigate directly to `/admin`

### Managing Products
1. Go to "Products" in the admin dashboard
2. Use "Add Product" to create new products
3. Click "Edit" on any product to modify
4. Use search and filters to find specific products
5. Confirm deletion when removing products

### Setting Up Admin Users
1. Create a regular user account
2. In the database, update the User table:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
   ```

## Database Schema

### User Table Role Field
```sql
role: 'ADMIN' | 'USER'
```

### Product Table Structure
- Basic product information
- Pricing and inventory
- Media and variants
- Categorization and flags

## Technical Implementation

### Components
- `AdminLayout`: Protected layout for admin pages
- `ProductForm`: Reusable form for create/edit
- `AdminDashboard`: Main dashboard interface

### Utilities
- `validateAdminAccess()`: Server-side admin validation
- `withAdminAuth()`: HOC for admin API routes
- `checkIsAdmin()`: Client-side role checking

### Middleware
- Route protection for `/admin/*`
- Automatic redirection for unauthorized access
- Session validation and role checking

## Future Enhancements

### Planned Features
1. Order management interface
2. Customer management
3. Analytics and reporting
4. Inventory management
5. Category management
6. Settings configuration

### Security Improvements
1. Audit logging for admin actions
2. Rate limiting for admin APIs
3. Two-factor authentication for admin users
4. Session timeout management

## Troubleshooting

### Common Issues
1. **Access Denied**: Ensure user has ADMIN role in database
2. **Products Not Loading**: Check API endpoints and database connection
3. **Form Validation Errors**: Verify all required fields are filled
4. **Image Upload Issues**: Ensure valid image URLs are provided

### Debug Tools
- Browser developer tools for client-side issues
- Server logs for API endpoint errors
- Database queries for role verification

## Contributing

When adding new admin features:
1. Follow the established authentication patterns
2. Use the `withAdminAuth` wrapper for API routes
3. Include proper error handling and validation
4. Update this documentation
