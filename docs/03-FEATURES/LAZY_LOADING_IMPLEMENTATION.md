# Lazy Loading Implementation Guide

## Overview

This document outlines the comprehensive lazy loading implementation for the Aprylo application. The lazy loading strategy improves performance by loading content only when needed, reducing initial bundle size and improving user experience.

## Features Implemented

### 1. **Component-Level Lazy Loading**
- React.lazy() for dynamic component imports
- Suspense boundaries with loading states
- Code splitting at component level

### 2. **Image Lazy Loading**
- Intersection Observer API for viewport detection
- Progressive image loading with blur effects
- Fallback handling for failed image loads
- Next.js Image component optimization

### 3. **Infinite Scrolling**
- Product grid with infinite scroll
- Automatic loading when reaching viewport
- Loading states and error handling
- Page-based pagination support

### 4. **Route-Based Code Splitting**
- Dynamic imports for page components
- Lazy-loaded sections (Hero, Categories, Featured Products)
- Optimized chunk splitting

## Components

### Core Lazy Loading Components

#### 1. `LazyWrapper` (`src/components/common/lazy-wrapper.tsx`)
Generic wrapper for lazy-loading any component with Suspense.

```tsx
<LazyWrapper
  importFunc={() => import('./heavy-component')}
  fallback={<LoadingSkeleton />}
  {...props}
/>
```

#### 2. `useIntersectionObserver` (`src/hooks/use-intersection-observer.ts`)
Custom hook for detecting when elements enter the viewport.

```tsx
const { ref, isIntersecting } = useIntersectionObserver({
  threshold: 0.1,
  rootMargin: '50px',
  triggerOnce: true,
});
```

#### 3. `LazyImage` (`src/components/ui/lazy-image.tsx`)
Optimized image component with intersection observer and fallback handling.

```tsx
<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  fallback="/placeholder.jpg"
  threshold={0.1}
  rootMargin="50px"
/>
```

### Product Components

#### 1. `LazyProductCard` (`src/components/product/lazy-product-card.tsx`)
Product card that loads only when visible in viewport.

#### 2. `InfiniteProductGrid` (`src/components/product/infinite-product-grid.tsx`)
Grid with infinite scrolling capabilities.

#### 3. `ClientProductsPage` (`src/components/product/client-products-page.tsx`)
Client-side product page with pagination and infinite scroll.

#### 4. `ProductDetailServer` (`src/components/product/product-detail-server.tsx`)
Server component for product details with lazy loading support.

#### 5. `ProductsServer` (`src/components/product/products-server.tsx`)
Server component for products listing with lazy loading support.

#### 6. `ProductDetailSkeleton` (`src/components/product/product-detail-skeleton.tsx`)
Custom skeleton for product detail page loading state.

#### 7. `ProductsListSkeleton` (`src/components/product/products-list-skeleton.tsx`)
Custom skeleton for products listing page loading state.

### Home Page Components

#### 1. `LazyHeroSection` (`src/components/home/lazy-hero-section.tsx`)
Hero section with lazy loading and skeleton.

#### 2. `LazyCategoriesSection` (`src/components/home/lazy-categories-section.tsx`)
Categories section with intersection observer.

#### 3. `LazyFeaturedProducts` (`src/components/home/lazy-featured-products.tsx`)
Featured products with staggered loading animations.

## Performance Benefits

### 1. **Reduced Initial Bundle Size**
- Components loaded only when needed
- Smaller JavaScript bundles for faster initial load
- Dynamic imports for heavy components

### 2. **Improved Time to Interactive (TTI)**
- Critical path resources load first
- Non-critical content loads as needed
- Better Core Web Vitals scores

### 3. **Bandwidth Optimization**
- Images load only when in viewport
- Reduced data usage on mobile devices
- Progressive loading of content

### 4. **Better User Experience**
- Smooth loading animations
- Skeleton states during loading
- No layout shifts (CLS optimization)

## Configuration

### Next.js Config Optimizations

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  swcMinify: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};
```

### CSS Animations

Custom animations for lazy-loaded content:

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}
```

## Usage Examples

### Basic Lazy Component

```tsx
import LazyWrapper from '@/components/common/lazy-wrapper';

function MyPage() {
  return (
    <LazyWrapper
      importFunc={() => import('./heavy-component')}
      fallback={<div>Loading...</div>}
    />
  );
}
```

### Lazy Product Grid

```tsx
import InfiniteProductGrid from '@/components/product/infinite-product-grid';

function ProductsPage({ products }) {
  const loadMore = async () => {
    const response = await fetch('/api/products?page=2');
    return response.json();
  };

  return (
    <InfiniteProductGrid
      initialProducts={products}
      onLoadMore={loadMore}
      hasMore={true}
    />
  );
}
```

### Lazy Product Detail Page

```tsx
import { Suspense } from 'react';
import ProductDetailServer from '@/components/product/product-detail-server';
import ProductDetailSkeleton from '@/components/product/product-detail-skeleton';

function ProductPage({ params }) {
  return (
    <div className="bg-gray-50 px-4 py-6 min-h-full">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailServer productId={params.id} />
      </Suspense>
    </div>
  );
}
```

### Lazy Products List Page

```tsx
import { Suspense } from 'react';
import ProductsServer from '@/components/product/products-server';
import ProductsListSkeleton from '@/components/product/products-list-skeleton';

function ProductsPage({ searchParams }) {
  return (
    <div className="bg-gray-50 px-4 py-6 min-h-full">
      <Suspense fallback={<ProductsListSkeleton />}>
        <ProductsServer 
          category={searchParams.category}
          search={searchParams.search}
        />
      </Suspense>
    </div>
  );
}
```

### Image with Lazy Loading

```tsx
import LazyImage from '@/components/ui/lazy-image';

function ProductCard({ product }) {
  return (
    <LazyImage
      src={product.image}
      alt={product.title}
      fill
      className="object-cover"
      threshold={0.1}
      rootMargin="100px"
    />
  );
}
```

## Best Practices

### 1. **Intersection Observer Settings**
- Use `threshold: 0.1` for early loading
- Set `rootMargin: "50px"` for preloading before visible
- Use `triggerOnce: true` for one-time loading

### 2. **Loading States**
- Always provide meaningful skeletons
- Match skeleton dimensions to actual content
- Use shimmer effects for better perceived performance

### 3. **Error Handling**
- Implement fallback components for failed loads
- Provide retry mechanisms for network failures
- Use placeholder images for broken image URLs

### 4. **Animation Timing**
- Stagger animations for better visual flow
- Use `will-change` for performance
- Respect `prefers-reduced-motion` preference

## Performance Monitoring

### Key Metrics to Track

1. **First Contentful Paint (FCP)**
2. **Largest Contentful Paint (LCP)**
3. **Cumulative Layout Shift (CLS)**
4. **Time to Interactive (TTI)**
5. **Bundle Size Analysis**

### Tools for Monitoring

- Lighthouse for Core Web Vitals
- webpack-bundle-analyzer for chunk analysis
- Chrome DevTools Performance tab
- Real User Monitoring (RUM) tools

## Browser Support

- Modern browsers with Intersection Observer API
- Fallback to immediate loading for unsupported browsers
- Progressive enhancement approach

## Accessibility

- Proper loading states with ARIA labels
- Respect `prefers-reduced-motion`
- Keyboard navigation support
- Screen reader friendly loading indicators

## Future Enhancements

1. **Virtual Scrolling** for very large lists
2. **Predictive Loading** based on user behavior
3. **Service Worker** integration for offline support
4. **Image placeholder generation** for better UX
5. **Progressive Web App** features
