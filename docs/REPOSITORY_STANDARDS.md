# Repository Standards & Common Patterns

## Overview
This document establishes consistent patterns and standards for the Aprylo codebase to ensure maintainability, performance, and developer experience.

## 🏗️ Project Structure Standards

### 1. File Organization
```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   ├── layout/           # Layout components (header, footer, etc.)
│   ├── product/          # Product-specific components
│   └── common/           # Shared business components
├── hooks/                # Custom React hooks
│   ├── api/              # API-related hooks
│   ├── ui/               # UI state hooks
│   └── utils/            # Utility hooks
├── lib/                  # Utility libraries
│   ├── utils/            # General utilities
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database utilities
│   └── common-patterns/  # Reusable patterns and factories
├── stores/               # State management (Zustand)
├── types/                # TypeScript type definitions
└── styles/               # Global styles and Tailwind configs
```

### 2. Naming Conventions

#### Files & Directories
- **Components**: `kebab-case.tsx` (e.g., `product-card.tsx`)
- **Hooks**: `use-{feature}.ts` (e.g., `use-product-search.ts`)
- **Types**: `{domain}.types.ts` (e.g., `product.types.ts`)
- **Utilities**: `{purpose}.util.ts` (e.g., `format.util.ts`)
- **Constants**: `{domain}.constants.ts` (e.g., `api.constants.ts`)

#### Components
- **React Components**: `PascalCase` (e.g., `ProductCard`)
- **Props Interfaces**: `{ComponentName}Props` (e.g., `ProductCardProps`)
- **Hooks**: `use{FeatureName}` (e.g., `useProductSearch`)

## 🔧 Common Patterns

### 1. Query Key Factory Pattern
Use centralized query key factories for consistent caching:

```typescript
// ✅ Good - Using factory pattern
export const PRODUCT_KEYS = createQueryKeyFactory('products')
export const EXTENDED_PRODUCT_KEYS = {
  ...PRODUCT_KEYS,
  byCategory: (categoryId: string) => [...PRODUCT_KEYS.lists(), 'category', categoryId],
  withReviews: (productId: string) => [...PRODUCT_KEYS.detail(productId), 'reviews'],
}

// ❌ Bad - Hardcoded strings
const productQueryKey = ['products', productId]
```

### 2. Component Performance Optimization
Always optimize components with proper memoization:

```typescript
// ✅ Good - Optimized component
import { memo, useMemo, useCallback } from 'react'

interface ProductListProps {
  products: Product[]
  onProductSelect: (product: Product) => void
}

export const ProductList = memo<ProductListProps>(({ 
  products, 
  onProductSelect 
}) => {
  const sortedProducts = useMemo(() => 
    products.sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  )

  const handleProductClick = useCallback((product: Product) => {
    onProductSelect(product)
  }, [onProductSelect])

  return (
    <div>
      {sortedProducts.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onClick={handleProductClick}
        />
      ))}
    </div>
  )
})

ProductList.displayName = 'ProductList'
```

### 3. Error Boundary Pattern
Use consistent error boundaries for all major components:

```typescript
// ✅ Good - Error boundary wrapper
import { UniversalErrorBoundary } from '@/components/ui/error-boundary'

export function ProductPage() {
  return (
    <UniversalErrorBoundary context="ProductPage">
      <ProductDetails />
      <ProductReviews />
    </UniversalErrorBoundary>
  )
}
```

### 4. API Hook Pattern
Standardize API hooks with consistent error handling:

```typescript
// ✅ Good - Standardized API hook
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: EXTENDED_PRODUCT_KEYS.filtered(filters),
    queryFn: () => fetcher<Product[]>('/api/products', { params: filters }),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    errorBoundary: true, // Let error boundary handle errors
  })
}
```

### 5. Loading State Pattern
Use consistent loading states across components:

```typescript
// ✅ Good - Consistent loading pattern
export function ProductList() {
  const { data: products, isLoading, error } = useProducts()

  if (isLoading) return <ProductListSkeleton />
  if (error) throw error // Let error boundary handle
  if (!products?.length) return <EmptyProductState />

  return <ProductGrid products={products} />
}
```

## 🎨 UI Component Standards

### 1. Base Components
Always extend from base UI components:

```typescript
// ✅ Good - Extending base component
import { Button } from '@/components/ui/button'

export function AddToCartButton({ product }: { product: Product }) {
  return (
    <Button 
      variant="primary" 
      size="md"
      onClick={() => addToCart(product)}
    >
      Add to Cart
    </Button>
  )
}

// ❌ Bad - Custom button without base
export function AddToCartButton() {
  return (
    <button className="bg-blue-500 text-white px-4 py-2">
      Add to Cart
    </button>
  )
}
```

### 2. Accessibility Standards
All interactive components must have proper accessibility:

```typescript
// ✅ Good - Accessible component
export const ProductCard = memo<ProductCardProps>(({ product, onClick }) => (
  <article
    role="button"
    tabIndex={0}
    aria-label={`Product: ${product.name}`}
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    className="focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <img 
      src={product.image} 
      alt={product.name}
      loading="lazy"
    />
    <h3>{product.name}</h3>
    <p aria-label={`Price: $${product.price}`}>${product.price}</p>
  </article>
))
```

## 🚀 Performance Standards

### 1. Image Optimization
Always use optimized images:

```typescript
// ✅ Good - Optimized image component
import { OptimizedImage } from '@/components/ui/optimized-image'

<OptimizedImage
  src={product.imageUrl}
  alt={product.name}
  width={300}
  height={200}
  priority={isAboveFold}
  placeholder="blur"
/>
```

### 2. Virtual Scrolling for Large Lists
Use virtual scrolling for lists with 50+ items:

```typescript
// ✅ Good - Virtual scrolling for large lists
import { VirtualScrollList } from '@/components/ui/virtual-scroll'

export function ProductCatalog({ products }: { products: Product[] }) {
  if (products.length > 50) {
    return (
      <VirtualScrollList
        items={products}
        itemHeight={200}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    )
  }

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### 3. Bundle Optimization
Follow code splitting best practices:

```typescript
// ✅ Good - Lazy loading heavy components
import { lazy, Suspense } from 'react'
import { ComponentSkeleton } from '@/components/ui/skeleton'

const ProductReviews = lazy(() => import('./product-reviews'))

export function ProductPage() {
  return (
    <div>
      <ProductDetails />
      <Suspense fallback={<ComponentSkeleton />}>
        <ProductReviews />
      </Suspense>
    </div>
  )
}
```

## 🔒 Security Standards

### 1. Data Validation
Always validate data at boundaries:

```typescript
// ✅ Good - Input validation
import { z } from 'zod'

const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
})

export function validateProduct(data: unknown): Product {
  return ProductSchema.parse(data)
}
```

### 2. Safe Logging
Use production-safe logging:

```typescript
// ✅ Good - Safe logging
import { logger } from '@/lib/utils/logger'

export function handleError(error: Error, context: string) {
  logger.error('Product operation failed', {
    context,
    error: error.message,
    // Never log sensitive data
  })
}
```

## 📊 Monitoring Standards

### 1. Performance Monitoring
Monitor critical user journeys:

```typescript
// ✅ Good - Performance monitoring
import { usePerformanceMonitor } from '@/hooks/utils/use-performance-monitor'

export function ProductSearch() {
  const { measureOperation } = usePerformanceMonitor('ProductSearch')

  const handleSearch = useCallback(async (query: string) => {
    await measureOperation('search', async () => {
      return searchProducts(query)
    })
  }, [measureOperation])

  // Component implementation...
}
```

### 2. Error Tracking
Track errors with context:

```typescript
// ✅ Good - Error tracking
import { trackError } from '@/lib/utils/error-tracking'

export function ProductOperation() {
  try {
    // Operation logic
  } catch (error) {
    trackError(error, {
      context: 'ProductOperation',
      userId: user?.id,
      productId,
    })
    throw error // Re-throw for error boundary
  }
}
```

## 🧪 Testing Standards

### 1. Component Testing
Test components with realistic scenarios:

```typescript
// ✅ Good - Comprehensive component test
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from './product-card'

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    image: '/test-image.jpg'
  }

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByAltText('Test Product')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<ProductCard product={mockProduct} onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith(mockProduct)
  })
})
```

## 📝 Documentation Standards

### 1. Component Documentation
Document component props and usage:

```typescript
/**
 * ProductCard displays product information in a card format
 * 
 * @example
 * ```tsx
 * <ProductCard 
 *   product={product} 
 *   onClick={handleProductSelect}
 *   showAddToCart={true}
 * />
 * ```
 */
interface ProductCardProps {
  /** Product data to display */
  product: Product
  /** Callback when card is clicked */
  onClick?: (product: Product) => void
  /** Whether to show add to cart button */
  showAddToCart?: boolean
}
```

### 2. Hook Documentation
Document hooks with usage examples:

```typescript
/**
 * Hook for managing product search functionality
 * 
 * @example
 * ```tsx
 * function ProductSearch() {
 *   const { search, results, isLoading } = useProductSearch()
 *   
 *   return (
 *     <div>
 *       <input onChange={(e) => search(e.target.value)} />
 *       {isLoading ? <Spinner /> : <ProductList products={results} />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useProductSearch() {
  // Hook implementation...
}
```

## 🔄 Migration Guidelines

### 1. Gradual Adoption
Adopt these standards gradually:

1. **New Components**: Always follow these standards
2. **Bug Fixes**: Upgrade components when fixing bugs
3. **Feature Updates**: Upgrade components when adding features
4. **Dedicated Refactoring**: Schedule periodic refactoring sprints

### 2. Backward Compatibility
Maintain backward compatibility during transitions:

```typescript
// ✅ Good - Gradual migration with fallback
export function ProductList(props: ProductListProps) {
  // Support both old and new prop formats during migration
  const products = 'items' in props ? props.items : props.products
  
  return <OptimizedProductList products={products} />
}
```

## 🎯 Enforcement

### 1. Automated Checks
- ESLint rules for naming conventions
- TypeScript strict mode for type safety
- Prettier for consistent formatting
- Bundle analyzer for performance monitoring

### 2. Code Review Checklist
- [ ] Follows naming conventions
- [ ] Uses common patterns (query keys, error boundaries)
- [ ] Includes proper performance optimizations
- [ ] Has accessibility attributes
- [ ] Includes error handling
- [ ] Has appropriate tests
- [ ] Is documented properly

### 3. Performance Budget
- Bundle size: < 500KB per route
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

---

## 📚 Quick Reference

### Common Imports
```typescript
// Performance
import { memo, useMemo, useCallback } from 'react'

// Error Handling
import { UniversalErrorBoundary } from '@/components/ui/error-boundary'

// Data Fetching
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetcher } from '@/lib/utils/api-fetch'

// UI Components
import { Button, Input, Card } from '@/components/ui'

// Utilities
import { logger } from '@/lib/utils/logger'
import { createQueryKeyFactory } from '@/lib/common-patterns'
```

### Folder Templates
When creating new features, use this structure:
```
feature-name/
├── components/
│   ├── feature-list.tsx
│   ├── feature-card.tsx
│   └── feature-form.tsx
├── hooks/
│   ├── use-feature.ts
│   └── use-feature-mutations.ts
├── types/
│   └── feature.types.ts
└── utils/
    └── feature.util.ts
```

This standardization ensures the entire repository follows consistent patterns, making it easier to maintain, debug, and enhance the codebase.
