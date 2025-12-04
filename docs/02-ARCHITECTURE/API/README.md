# API Documentation

## Overview

VB Cart provides a comprehensive REST API built with Next.js API routes and Supabase. All endpoints follow RESTful conventions and return JSON responses.

## Base URL

```
http://localhost:3000/api (development)
https://your-domain.com/api (production)
```

## Authentication

Most endpoints require authentication. Include the authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Error Handling

Error responses include:

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  timestamp: string;
}
```

## Rate Limiting

- General endpoints: 100 requests per minute
- Search endpoints: 50 requests per minute
- Authentication endpoints: 10 requests per minute

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/[id]` - Get category by ID

### Products
- `GET /api/products` - Get products with filtering
- `GET /api/products/[id]` - Get product by ID
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[id]` - Update cart item
- `DELETE /api/cart/[id]` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/[id]` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/[id]` - Update order status (admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add address
- `PUT /api/users/addresses/[id]` - Update address
- `DELETE /api/users/addresses/[id]` - Delete address

### Reviews
- `GET /api/reviews` - Get reviews for product
- `POST /api/reviews` - Add review
- `PUT /api/reviews/[id]` - Update review
- `DELETE /api/reviews/[id]` - Delete review

## Query Parameters

### Products Endpoint

```http
GET /api/products?category=men&limit=20&page=1&sort=price_asc&search=shirt
```

Parameters:
- `category` - Filter by category (men, women, children)
- `limit` - Number of items per page (default: 20, max: 100)
- `page` - Page number (default: 1)
- `sort` - Sort order (price_asc, price_desc, name_asc, name_desc, created_desc)
- `search` - Search term
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `inStock` - Filter by stock availability (true/false)

### Search Endpoint

```http
GET /api/products/search?q=shirt&category=men&limit=10
```

Parameters:
- `q` - Search query (required)
- `category` - Filter by category
- `limit` - Number of results (default: 10, max: 50)

## Data Models

### Product

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### Cart Item

```typescript
interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
}
```

### Order

```typescript
interface Order {
  id: number;
  userId: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: Address;
  items: OrderItem[];
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Examples

### Get Products

```bash
curl -X GET "http://localhost:3000/api/products?category=men&limit=5" \
  -H "Content-Type: application/json"
```

### Add to Cart

```bash
curl -X POST "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "productId": 1,
    "quantity": 2,
    "size": "M",
    "color": "Blue"
  }'
```

### Search Products

```bash
curl -X GET "http://localhost:3000/api/products/search?q=shirt&category=men" \
  -H "Content-Type: application/json"
```

---

*For detailed endpoint documentation, see the individual API files.*
