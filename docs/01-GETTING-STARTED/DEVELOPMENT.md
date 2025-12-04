# Development Guide

## Getting Started

This guide covers the development workflow, coding standards, and best practices for VB Cart.

## Development Workflow

### 1. Setup Development Environment

```bash
# Clone and setup
git clone https://github.com/your-username/vb-cart.git
cd vb-cart
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### 2. Branch Strategy

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/new-feature-name

# Work on your feature
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature-name
```

### 3. Development Commands

```bash
# Development server
npm run dev                 # Start dev server on port 3000
npm run dev -- --port 3001 # Start on different port

# Database operations
npm run supabase:gen-types  # Generate TypeScript types
npm run db:push            # Push schema changes
npm run db:studio          # Open Prisma Studio

# Code quality
npm run lint               # Run ESLint
npm run type-check         # TypeScript type checking
npm run test               # Run tests

# Build and deployment
npm run build              # Production build
npm run start              # Start production server
npm run export             # Export static files
```

## Project Structure

```
vb-cart/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   ├── (shop)/            # Shop route group
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   ├── layout/            # Layout components
│   │   ├── product/           # Product-related components
│   │   └── auth/              # Auth components
│   ├── hooks/                 # Custom React hooks
│   │   └── api/               # API hooks (React Query)
│   ├── lib/                   # Utilities and configurations
│   │   ├── supabase/          # Supabase client
│   │   ├── utils/             # Utility functions
│   │   └── validations/       # Schema validations
│   ├── stores/                # State management
│   ├── types/                 # TypeScript type definitions
│   └── providers/             # React providers
├── public/                    # Static assets
├── docs/                      # Documentation
├── supabase/                  # Supabase configuration
└── ...config files
```

## Coding Standards

### 1. TypeScript Guidelines

```typescript
// Use explicit types for function parameters and return values
interface UserProps {
  user: User;
  onUpdate: (user: User) => void;
}

const UserProfile: React.FC<UserProps> = ({ user, onUpdate }) => {
  // Component implementation
};

// Use type guards for runtime type checking
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Use proper generic constraints
interface Repository<T extends { id: number }> {
  findById(id: number): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
}
```

### 2. React Components

```typescript
// Use functional components with hooks
const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart 
}) => {
  // State and effects
  const [isLoading, setIsLoading] = useState(false);
  
  // Event handlers
  const handleAddToCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [product, onAddToCart]);

  // Render
  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
};

// Export with proper display name
ProductCard.displayName = 'ProductCard';
export { ProductCard };
```

### 3. API Routes

```typescript
// api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') ?? '20');

    const supabase = createSupabaseServerClient();
    
    let query = supabase
      .from('Product')
      .select('*')
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { products: data }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Custom Hooks

```typescript
// hooks/api/use-products.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UseProductsParams {
  category?: string;
  limit?: number;
  search?: string;
}

export const useProducts = (params: UseProductsParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCartApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
    },
  });
};
```

## State Management

### 1. React Query for Server State

```typescript
// Centralized query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Custom hooks for different entities
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
```

### 2. Zustand for Client State

```typescript
// stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      
      addItem: (item) => set((state) => ({
        items: [...state.items, item],
        totalItems: state.totalItems + item.quantity,
        totalAmount: state.totalAmount + (item.price * item.quantity),
      })),
      
      // Other actions...
    }),
    {
      name: 'cart-storage',
      version: 1,
    }
  )
);
```

## Database Operations

### 1. Type-Safe Database Queries

```typescript
// lib/repositories/product-repository.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/db';

type Product = Database['public']['Tables']['Product']['Row'];

export class ProductRepository {
  private supabase = createSupabaseServerClient();

  async findAll(params: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = this.supabase
      .from('Product')
      .select('*')
      .order('created_at', { ascending: false });

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data || [];
  }

  async findById(id: number): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('Product')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  }
}
```

### 2. Database Schema Updates

```bash
# Generate types after schema changes
npm run supabase:gen-types

# Example of generated types usage
import type { Database } from '@/types/db';

type Product = Database['public']['Tables']['Product']['Row'];
type ProductInsert = Database['public']['Tables']['Product']['Insert'];
type ProductUpdate = Database['public']['Tables']['Product']['Update'];
```

## Testing Strategy

### 1. Unit Testing

```typescript
// __tests__/components/product-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/product/product-card';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 29.99,
  imageUrl: '/test-image.jpg',
};

describe('ProductCard', () => {
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', () => {
    const mockAddToCart = jest.fn();
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart} 
      />
    );
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
```

### 2. API Testing

```typescript
// __tests__/api/products.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/products/route';

describe('/api/products', () => {
  it('returns products list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { category: 'men', limit: '10' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.products)).toBe(true);
  });
});
```

### 3. E2E Testing

```typescript
// e2e/product-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete product purchase flow', async ({ page }) => {
  await page.goto('/');
  
  // Browse products
  await page.click('[data-testid="category-men"]');
  await expect(page).toHaveURL('/products?category=men');
  
  // Add to cart
  await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  
  // Go to cart
  await page.click('[data-testid="cart-button"]');
  await expect(page).toHaveURL('/cart');
  
  // Proceed to checkout
  await page.click('[data-testid="checkout-button"]');
  await expect(page).toHaveURL('/checkout');
});
```

## Performance Optimization

### 1. Code Splitting

```typescript
// Lazy load heavy components
const ProductQuickView = lazy(() => import('./product-quick-view'));
const CheckoutModal = lazy(() => import('./checkout-modal'));

// Use dynamic imports for routes
const DynamicComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // Disable SSR for client-only components
});
```

### 2. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={product.imageUrl}
  alt={product.name}
  width={300}
  height={300}
  priority={index < 4} // Prioritize above-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 3. Query Optimization

```typescript
// Implement infinite scrolling for large lists
export const useInfiniteProducts = (params: ProductParams) => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam = 0 }) => 
      fetchProducts({ ...params, offset: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.data.products.length < 20) return undefined;
      return pages.length * 20;
    },
  });
};
```

## Debugging

### 1. Development Tools

```typescript
// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <Component />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );
}
```

### 2. Error Logging

```typescript
// lib/utils/logger.ts
export const logger = {
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to monitoring service in production
  },
  
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  info: (message: string, data?: unknown) => {
    console.info(`[INFO] ${message}`, data);
  },
};

// Usage in components
try {
  await addToCart(product);
} catch (error) {
  logger.error('Failed to add product to cart', {
    productId: product.id,
    error,
  });
}
```

## Git Workflow

### 1. Commit Message Convention

```bash
# Format: type(scope): description

feat(cart): add quantity selector component
fix(auth): resolve login redirect issue
docs(api): update product endpoints documentation
style(ui): improve button hover states
refactor(hooks): simplify product data fetching
test(e2e): add checkout flow tests
chore(deps): update dependencies to latest versions
```

### 2. Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Environment Management

### 1. Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.production (production)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://vbcart.com/api
```

### 2. Configuration Management

```typescript
// lib/config.ts
const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'VB Cart',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 10000,
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
} as const;

export { config };
```

## Deployment Preparation

### 1. Build Optimization

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for build errors
npm run type-check
npm run lint
```

### 2. Environment Verification

```typescript
// lib/utils/env-validation.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

export const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};
```

## Next Steps

1. **Review [API Documentation](./API/README.md)** for backend implementation
2. **Check [Component Library](./UI/COMPONENTS.md)** for UI development
3. **See [Deployment Guide](./DEPLOYMENT.md)** for production setup
4. **Read [Testing Guide](./TESTING.md)** for comprehensive testing

---

*Happy coding! 🚀*
