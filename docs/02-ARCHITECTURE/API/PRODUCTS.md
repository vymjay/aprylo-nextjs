# Products API

## Overview

The Products API handles all product-related operations including listing, filtering, searching, and management.

## Endpoints

### Get Products

```http
GET /api/products
```

Retrieve a paginated list of products with optional filtering.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `category` | string | Filter by category (men, women, children) | - |
| `limit` | number | Number of items per page (max: 100) | 20 |
| `page` | number | Page number | 1 |
| `sort` | string | Sort order | `created_desc` |
| `search` | string | Search term | - |
| `minPrice` | number | Minimum price filter | - |
| `maxPrice` | number | Maximum price filter | - |
| `inStock` | boolean | Filter by stock availability | - |

#### Sort Options

- `price_asc` - Price low to high
- `price_desc` - Price high to low
- `name_asc` - Name A to Z
- `name_desc` - Name Z to A
- `created_desc` - Newest first
- `created_asc` - Oldest first
- `rating_desc` - Highest rated first

#### Response

```typescript
interface ProductsResponse {
  success: true;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      categories: string[];
      priceRange: {
        min: number;
        max: number;
      };
    };
  };
}
```

#### Example

```bash
curl "http://localhost:3000/api/products?category=men&limit=10&sort=price_asc"
```

### Get Product by ID

```http
GET /api/products/[id]
```

Retrieve a specific product by its ID.

#### Response

```typescript
interface ProductResponse {
  success: true;
  data: {
    product: Product;
    relatedProducts: Product[];
    reviews: Review[];
  };
}
```

#### Example

```bash
curl "http://localhost:3000/api/products/123"
```

### Search Products

```http
GET /api/products/search
```

Search products by name, description, or tags.

#### Query Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `q` | string | Search query | Yes |
| `category` | string | Filter by category | No |
| `limit` | number | Number of results (max: 50) | No |

#### Response

```typescript
interface SearchResponse {
  success: true;
  data: {
    products: Product[];
    totalResults: number;
    searchTerm: string;
    suggestions: string[];
  };
}
```

#### Example

```bash
curl "http://localhost:3000/api/products/search?q=blue+shirt&category=men"
```

## Admin Endpoints

### Create Product

```http
POST /api/products
```

Create a new product (requires admin authentication).

#### Request Body

```typescript
interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  images?: string[];
  stockQuantity: number;
  sizes: string[];
  colors?: string[];
  tags?: string[];
}
```

#### Response

```typescript
interface CreateProductResponse {
  success: true;
  data: {
    product: Product;
  };
  message: "Product created successfully";
}
```

### Update Product

```http
PUT /api/products/[id]
```

Update an existing product (requires admin authentication).

#### Request Body

Same as create product, but all fields are optional.

### Delete Product

```http
DELETE /api/products/[id]
```

Delete a product (requires admin authentication).

#### Response

```typescript
interface DeleteProductResponse {
  success: true;
  message: "Product deleted successfully";
}
```

## Product Model

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
  tags: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid query parameters",
  "details": {
    "field": "category",
    "message": "Category must be one of: men, women, children"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Product not found"
}
```

### 422 Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

## Cache Strategy

Products API implements intelligent caching:

- **List endpoints**: 5 minutes cache
- **Individual products**: 15 minutes cache
- **Search results**: 2 minutes cache
- **Admin operations**: Immediate cache invalidation

## Rate Limiting

- Anonymous users: 50 requests per minute
- Authenticated users: 100 requests per minute
- Admin users: 200 requests per minute

## Examples

### Get Men's Products Under $50

```bash
curl "http://localhost:3000/api/products?category=men&maxPrice=50&sort=price_asc"
```

### Search for Blue Shirts

```bash
curl "http://localhost:3000/api/products/search?q=blue+shirt&limit=20"
```

### Create New Product (Admin)

```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "name": "Classic Blue Shirt",
    "description": "A comfortable cotton shirt perfect for casual wear",
    "price": 29.99,
    "originalPrice": 39.99,
    "category": "men",
    "imageUrl": "https://example.com/shirt.jpg",
    "stockQuantity": 100,
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["Blue", "Navy"],
    "tags": ["casual", "cotton", "shirt"]
  }'
```
