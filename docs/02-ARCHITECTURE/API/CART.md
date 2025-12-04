# Cart API

## Overview

The Cart API manages shopping cart operations for authenticated users. It provides functionality to add, update, remove items, and manage the cart state.

## Endpoints

### Get Cart

```http
GET /api/cart
```

Retrieve the current user's cart with all items.

#### Headers

```http
Authorization: Bearer <token>
```

#### Response

```typescript
interface CartResponse {
  success: true;
  data: {
    cart: {
      id: number;
      userId: number;
      items: CartItem[];
      totalItems: number;
      totalAmount: number;
      updatedAt: string;
    };
  };
}
```

#### Example

```bash
curl -X GET "http://localhost:3000/api/cart" \
  -H "Authorization: Bearer your-token"
```

### Add Item to Cart

```http
POST /api/cart
```

Add a product to the cart or update quantity if it already exists.

#### Request Body

```typescript
interface AddToCartRequest {
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
}
```

#### Response

```typescript
interface AddToCartResponse {
  success: true;
  data: {
    cartItem: CartItem;
    cart: {
      totalItems: number;
      totalAmount: number;
    };
  };
  message: "Item added to cart";
}
```

#### Example

```bash
curl -X POST "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "productId": 123,
    "quantity": 2,
    "size": "M",
    "color": "Blue"
  }'
```

### Update Cart Item

```http
PUT /api/cart/[itemId]
```

Update the quantity, size, or color of a cart item.

#### Request Body

```typescript
interface UpdateCartItemRequest {
  quantity?: number;
  size?: string;
  color?: string;
}
```

#### Response

```typescript
interface UpdateCartItemResponse {
  success: true;
  data: {
    cartItem: CartItem;
    cart: {
      totalItems: number;
      totalAmount: number;
    };
  };
  message: "Cart item updated";
}
```

#### Example

```bash
curl -X PUT "http://localhost:3000/api/cart/456" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "quantity": 3
  }'
```

### Remove Cart Item

```http
DELETE /api/cart/[itemId]
```

Remove a specific item from the cart.

#### Response

```typescript
interface RemoveCartItemResponse {
  success: true;
  data: {
    cart: {
      totalItems: number;
      totalAmount: number;
    };
  };
  message: "Item removed from cart";
}
```

#### Example

```bash
curl -X DELETE "http://localhost:3000/api/cart/456" \
  -H "Authorization: Bearer your-token"
```

### Clear Cart

```http
DELETE /api/cart
```

Remove all items from the cart.

#### Response

```typescript
interface ClearCartResponse {
  success: true;
  message: "Cart cleared";
}
```

#### Example

```bash
curl -X DELETE "http://localhost:3000/api/cart" \
  -H "Authorization: Bearer your-token"
```

## Data Models

### Cart Item

```typescript
interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
  price: number; // Price at time of adding to cart
  subtotal: number; // price * quantity
  product: {
    id: number;
    name: string;
    imageUrl: string;
    inStock: boolean;
    stockQuantity: number;
    maxQuantity: number; // Maximum allowed quantity
  };
  createdAt: string;
  updatedAt: string;
}
```

### Cart Summary

```typescript
interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  finalAmount: number;
  updatedAt: string;
}
```

## Business Rules

### Quantity Limits

- Minimum quantity: 1
- Maximum quantity per item: 10
- Maximum total items in cart: 50
- Stock validation on add/update

### Price Calculation

- Cart item price is locked when added
- Discounts applied at checkout
- Shipping calculated based on total amount

### Stock Validation

- Items are validated against current stock
- Out-of-stock items are marked but not removed
- Quantity is automatically adjusted if exceeds available stock

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid quantity. Must be between 1 and 10"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Cart item not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "error": "Product is out of stock",
  "data": {
    "availableQuantity": 0,
    "requestedQuantity": 2
  }
}
```

### 422 Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "productId",
      "message": "Product ID is required"
    },
    {
      "field": "quantity",
      "message": "Quantity must be a positive number"
    }
  ]
}
```

## Cart State Management

### Client-Side Caching

The cart state is managed with React Query:

```typescript
// Cache configuration
const cartQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  cacheTime: 1000 * 60 * 30, // 30 minutes
  refetchOnWindowFocus: true,
  refetchOnMount: true,
};
```

### Optimistic Updates

Cart operations use optimistic updates for better UX:

1. Update UI immediately
2. Send API request
3. Rollback on error
4. Sync with server response

### Persistence

- Cart persists across browser sessions
- Items expire after 30 days of inactivity
- Guest cart migrates to user account on login

## Rate Limiting

- Authenticated users: 100 requests per minute
- Add to cart: 10 requests per minute per product
- Bulk operations: 5 requests per minute

## Examples

### Add Multiple Items

```bash
# Add item 1
curl -X POST "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"productId": 123, "quantity": 2, "size": "M"}'

# Add item 2
curl -X POST "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"productId": 124, "quantity": 1, "size": "L", "color": "Red"}'
```

### Update Item Quantity

```bash
curl -X PUT "http://localhost:3000/api/cart/456" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"quantity": 5}'
```

### Get Cart Summary

```bash
curl -X GET "http://localhost:3000/api/cart" \
  -H "Authorization: Bearer your-token"
```

Expected response:

```json
{
  "success": true,
  "data": {
    "cart": {
      "id": 1,
      "userId": 123,
      "items": [
        {
          "id": 456,
          "productId": 123,
          "quantity": 2,
          "size": "M",
          "price": 29.99,
          "subtotal": 59.98,
          "product": {
            "id": 123,
            "name": "Classic Blue Shirt",
            "imageUrl": "https://example.com/shirt.jpg",
            "inStock": true,
            "stockQuantity": 50
          }
        }
      ],
      "totalItems": 2,
      "totalAmount": 59.98,
      "updatedAt": "2025-08-14T10:30:00Z"
    }
  }
}
```

## Integration Examples

### React Hook Usage

```typescript
import { useCart } from '@/hooks/api/use-cart';

function CartComponent() {
  const { 
    data: cart, 
    addItem, 
    updateItem, 
    removeItem, 
    clearCart,
    isLoading,
    error 
  } = useCart();

  const handleAddToCart = async (productId: number) => {
    try {
      await addItem.mutateAsync({
        productId,
        quantity: 1,
        size: 'M'
      });
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  return (
    <div>
      {cart?.items.map(item => (
        <div key={item.id}>
          {item.product.name} - Qty: {item.quantity}
        </div>
      ))}
    </div>
  );
}
```
