# UI Components Documentation

## Overview

Aprylo uses a modern component-based architecture with React, TypeScript, and Tailwind CSS. The component library is built on top of Radix UI primitives for accessibility and consistency.

## Design System

### Theme Configuration

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    }
  }
}
```

### Color Palette

| Color | Usage | Hex |
|-------|--------|-----|
| Primary Blue | CTA buttons, links | #3b82f6 |
| Secondary Gray | Text, borders | #64748b |
| Success Green | Success states | #10b981 |
| Warning Orange | Warnings | #f59e0b |
| Error Red | Error states | #ef4444 |
| Background | Page background | #ffffff |
| Surface | Card backgrounds | #f8fafc |

### Typography Scale

```css
/* Heading Styles */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; } /* H1 */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* H2 */
.text-2xl { font-size: 1.5rem; line-height: 2rem; } /* H3 */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; } /* H4 */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* H5 */

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; } /* Body */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* Small */
.text-xs { font-size: 0.75rem; line-height: 1rem; } /* Caption */
```

## Component Library

### Core Components

#### Button

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Usage
<Button variant="primary" size="lg" loading={isLoading}>
  Add to Cart
</Button>
```

**Variants:**
- `primary` - Main CTA buttons
- `secondary` - Secondary actions
- `outline` - Outlined buttons
- `ghost` - Text buttons
- `destructive` - Delete/remove actions

#### Input

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

// Usage
<Input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  error={emailError}
  required
/>
```

#### Card

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}

// Usage
<Card padding="lg" shadow="md">
  <CardHeader>
    <CardTitle>Product Details</CardTitle>
  </CardHeader>
  <CardContent>
    Content here...
  </CardContent>
</Card>
```

### Layout Components

#### Header

```typescript
// src/components/layout/header.tsx
interface HeaderProps {
  user?: User;
  cartCount?: number;
}

const Header: React.FC<HeaderProps> = ({ user, cartCount }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <Navigation />
          <UserActions user={user} cartCount={cartCount} />
        </div>
      </div>
    </header>
  );
};
```

#### Navigation

```typescript
// src/components/navigation/main-nav.tsx
const MainNavigation = () => {
  const categories = useCategories();
  
  return (
    <nav className="hidden md:flex space-x-8">
      {categories.map(category => (
        <NavigationItem
          key={category.id}
          href={`/products?category=${category.slug}`}
          label={category.name}
        />
      ))}
    </nav>
  );
};
```

#### Footer

```typescript
// src/components/layout/footer.tsx
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FooterSection title="Company">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterSection>
          {/* More sections */}
        </div>
      </div>
    </footer>
  );
};
```

### Product Components

#### Product Card

```typescript
// src/components/product/product-card.tsx
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onQuickView 
}) => {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
        />
        {product.isNew && (
          <Badge variant="success" className="absolute top-2 left-2">
            New
          </Badge>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity">
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => onQuickView?.(product)}
              className="w-full"
            >
              Quick View
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <StarRating rating={product.rating} />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddToCart?.(product)}
          className="w-full mt-3"
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};
```

#### Product Grid

```typescript
// src/components/product/product-grid.tsx
interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  loading, 
  columns = 4 
}) => {
  if (loading) {
    return <ProductGridSkeleton columns={columns} />;
  }

  return (
    <div className={`grid gap-6 ${getGridCols(columns)}`}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

const getGridCols = (columns: number) => {
  const cols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };
  return cols[columns];
};
```

### Cart Components

#### Cart Item

```typescript
// src/components/cart/cart-item.tsx
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}) => {
  return (
    <div className="flex items-center space-x-4 py-4 border-b">
      <Image
        src={item.product.imageUrl}
        alt={item.product.name}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <h4 className="font-medium">{item.product.name}</h4>
        <div className="text-sm text-gray-600">
          {item.size && <span>Size: {item.size}</span>}
          {item.color && <span className="ml-2">Color: {item.color}</span>}
        </div>
        <div className="text-lg font-semibold mt-1">
          ${item.price}
        </div>
      </div>
      <QuantitySelector
        value={item.quantity}
        onChange={(qty) => onUpdateQuantity(item.id, qty)}
        min={1}
        max={10}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
```

#### Quantity Selector

```typescript
// src/components/ui/quantity-selector.tsx
interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 10
}) => {
  return (
    <div className="flex items-center border rounded">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="px-3 py-1 min-w-[3rem] text-center">
        {value}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};
```

### Form Components

#### Search Bar

```typescript
// src/components/search/search-bar.tsx
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search products...",
  suggestions = []
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={setQuery}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-50 mt-1">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setQuery(suggestion);
                onSearch(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### Filter Sidebar

```typescript
// src/components/product/filter-sidebar.tsx
interface FilterSidebarProps {
  categories: Category[];
  priceRange: { min: number; max: number };
  onFilterChange: (filters: ProductFilters) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  priceRange,
  onFilterChange
}) => {
  return (
    <div className="w-64 space-y-6">
      <FilterSection title="Categories">
        <CategoryFilter
          categories={categories}
          onChange={(categoryId) => 
            onFilterChange({ categoryId })
          }
        />
      </FilterSection>
      
      <FilterSection title="Price Range">
        <PriceRangeFilter
          min={priceRange.min}
          max={priceRange.max}
          onChange={(min, max) => 
            onFilterChange({ minPrice: min, maxPrice: max })
          }
        />
      </FilterSection>
      
      <FilterSection title="Size">
        <SizeFilter
          onChange={(sizes) => 
            onFilterChange({ sizes })
          }
        />
      </FilterSection>
    </div>
  );
};
```

## Loading States

### Skeleton Components

```typescript
// src/components/ui/skeleton.tsx
const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gray-300 rounded ${className}`} />
  );
};

// Product Card Skeleton
const ProductCardSkeleton = () => {
  return (
    <Card>
      <Skeleton className="w-full h-64" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
};
```

### Loading Indicators

```typescript
// src/components/ui/loading.tsx
const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  );
};
```

## Error Handling

### Error Boundary

```typescript
// src/components/error/error-boundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}
```

### Error Display

```typescript
// src/components/error/error-display.tsx
interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  showRetry = true 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="text-center py-12">
      <div className="text-red-500 mb-4">
        <AlertCircle className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{errorMessage}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
};
```

## Responsive Design

### Breakpoint System

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (large laptops) */
2xl: 1536px /* 2X large devices (large desktops) */
```

### Mobile-First Approach

```typescript
// Responsive grid example
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">
  Content with responsive padding
</div>

// Responsive text sizes
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Responsive heading
</h1>
```

## Accessibility

### ARIA Labels and Roles

```typescript
// Button with proper ARIA
<Button
  aria-label="Add product to cart"
  aria-describedby="product-name"
  onClick={handleAddToCart}
>
  <ShoppingCart className="w-4 h-4" />
</Button>

// Form with proper labels
<div>
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!emailError}
    aria-describedby={emailError ? "email-error" : undefined}
  />
  {emailError && (
    <div id="email-error" role="alert" className="text-red-500 text-sm">
      {emailError}
    </div>
  )}
</div>
```

### Keyboard Navigation

```typescript
// Focus management
const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && e.metaKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Input
      ref={inputRef}
      placeholder="Search products... (⌘ + /)"
      // ...
    />
  );
};
```

## Performance Optimizations

### Image Optimization

```typescript
// Next.js Image component
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

### Code Splitting

```typescript
// Lazy loading components
const ProductQuickView = lazy(() => import('./product-quick-view'));
const CheckoutModal = lazy(() => import('./checkout-modal'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  {showQuickView && <ProductQuickView product={selectedProduct} />}
</Suspense>
```

### Memoization

```typescript
// Memoized components
const ProductCard = memo(({ product, onAddToCart }) => {
  return (
    // Component JSX
  );
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});

// Memoized calculations
const expensiveValue = useMemo(() => {
  return calculateComplexValue(props.data);
}, [props.data]);
```

## Testing

### Component Testing

```typescript
// Product card test
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 29.99,
    imageUrl: '/test-image.jpg'
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
```
