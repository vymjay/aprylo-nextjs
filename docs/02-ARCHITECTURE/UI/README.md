# UI/UX Documentation

This directory contains comprehensive UI/UX documentation for VB Cart, covering design systems, component libraries, and user experience guidelines.

## 📚 Documentation Overview

### Core Documentation
- **[Component Library](./COMPONENTS.md)** - Comprehensive component documentation with examples
- **[Design System](./DESIGN_SYSTEM.md)** - Complete design system with colors, typography, and spacing
- **[Theme Configuration](./THEMING.md)** - Theme setup and customization guide
- **[Responsive Design](./RESPONSIVE.md)** - Mobile-first responsive design principles

## 🎨 Design Philosophy

VB Cart's UI is built on four core principles:

### 1. **Simplicity**
- Clean, uncluttered interfaces
- Intuitive navigation patterns
- Minimal cognitive load
- Focus on essential functionality

### 2. **Consistency**
- Uniform design patterns
- Consistent spacing and typography
- Predictable user interactions
- Standardized component behaviors

### 3. **Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios

### 4. **Performance**
- Fast loading components
- Smooth animations
- Optimized images
- Minimal bundle size

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS + CSS-in-JS
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Typography**: Inter font family
- **Animations**: Tailwind CSS + Framer Motion

### Component Structure
```
src/components/
├── ui/                    # Base UI components
│   ├── button.tsx         # Button variants
│   ├── input.tsx          # Form inputs
│   ├── card.tsx           # Card layouts
│   └── ...                # Other base components
├── layout/                # Layout components
│   ├── header.tsx         # Site header
│   ├── footer.tsx         # Site footer
│   ├── sidebar.tsx        # Navigation sidebar
│   └── navigation/        # Navigation components
├── product/               # Product-specific components
│   ├── product-card.tsx   # Product display cards
│   ├── product-grid.tsx   # Product grid layouts
│   ├── product-filters.tsx # Filtering components
│   └── ...                # Other product components
├── cart/                  # Shopping cart components
├── auth/                  # Authentication components
├── forms/                 # Form components
└── [feature]/            # Other feature-specific components
```

## 🎯 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - CTAs, links, active states
- **Secondary**: Gray (#64748b) - Text, borders, backgrounds
- **Success**: Green (#10b981) - Success states, confirmations
- **Warning**: Orange (#f59e0b) - Warnings, cautions
- **Error**: Red (#ef4444) - Errors, destructive actions

### Typography Scale
- **Headings**: 36px, 30px, 24px, 20px, 18px
- **Body**: 16px (base), 14px (small), 12px (caption)
- **Font Family**: Inter (sans-serif)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing System
- **Base Unit**: 4px (0.25rem)
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px
- **Usage**: Consistent spacing for margins, padding, and gaps

## 🧩 Component Library

### Base Components

#### Button
```typescript
<Button variant="primary" size="lg">
  Add to Cart
</Button>

// Variants: primary, secondary, outline, ghost, destructive
// Sizes: sm, md, lg
```

#### Input
```typescript
<Input
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  required
/>
```

#### Card
```typescript
<Card className="p-6">
  <CardHeader>
    <CardTitle>Product Details</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here...
  </CardContent>
</Card>
```

### Layout Components

#### Header
- Logo and branding
- Main navigation
- Search functionality
- User account dropdown
- Shopping cart indicator

#### Navigation
- Category navigation
- Responsive mobile menu
- Breadcrumb navigation
- Footer links

### Feature Components

#### Product Card
- Product image with hover effects
- Product information display
- Price and discount display
- Add to cart functionality
- Quick view options

#### Shopping Cart
- Cart item management
- Quantity selectors
- Price calculations
- Checkout process

## 📱 Responsive Design

### Breakpoint System
```css
/* Mobile First Approach */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (large laptops) */
2xl: 1536px /* 2X large devices (large desktops) */
```

### Responsive Patterns
- **Mobile First**: Start with mobile design, enhance for larger screens
- **Flexible Grids**: CSS Grid and Flexbox for adaptive layouts
- **Responsive Typography**: Fluid type scaling
- **Touch-Friendly**: Minimum 44px touch targets

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators

### Implementation
```typescript
// ARIA labels and roles
<button
  aria-label="Add product to cart"
  aria-describedby="product-name"
  role="button"
>
  Add to Cart
</button>

// Focus management
<Input
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? "error-message" : undefined}
/>
```

## 🎭 Theming

### Light/Dark Mode Support
- CSS custom properties for theme values
- Automatic system preference detection
- Manual theme switching
- Persistent theme selection

### Custom Themes
```css
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  --color-text: #1f2937;
}

[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-background: #111827;
  --color-text: #f9fafb;
}
```

## 🚀 Performance Optimizations

### Code Splitting
- Lazy loading for non-critical components
- Dynamic imports for route-based splitting
- Tree shaking for unused code elimination

### Image Optimization
- Next.js Image component with optimization
- Responsive images with srcset
- WebP format with fallbacks
- Lazy loading for off-screen images

### Bundle Optimization
- Minimal CSS bundle with PurgeCSS
- Optimized font loading
- Service worker for caching
- Preloading critical resources

## 🧪 Testing Strategy

### Component Testing
```typescript
// Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### Visual Regression Testing
- Storybook for component documentation
- Chromatic for visual testing
- Screenshot comparisons
- Cross-browser testing

### Accessibility Testing
- axe-core for automated a11y testing
- Manual keyboard navigation testing
- Screen reader compatibility testing

## 📖 Storybook Integration

### Component Documentation
```typescript
// Button.stories.tsx
export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Primary button component with multiple variants.'
      }
    }
  }
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};
```

### Usage
```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 🛠️ Development Tools

### Design Tokens
```typescript
// design-tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
  }
};
```

### CSS-in-JS Integration
```typescript
// styled-system integration
import { styled } from '@/lib/styled-system';

const StyledButton = styled('button', {
  base: {
    px: 4,
    py: 2,
    borderRadius: 'md',
  },
  variants: {
    variant: {
      primary: { bg: 'primary.500', color: 'white' },
      secondary: { bg: 'gray.100', color: 'gray.900' },
    }
  }
});
```

## 📏 Guidelines

### Component Development
1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Prefer composable components
3. **Props Interface**: Clear, typed props with sensible defaults
4. **Documentation**: Include JSDoc comments and examples
5. **Testing**: Unit tests for all interactive components

### Design Consistency
1. **Follow Design System**: Use established colors, spacing, and typography
2. **Component Reuse**: Leverage existing components before creating new ones
3. **Accessibility First**: Consider accessibility from the design phase
4. **Performance Aware**: Optimize for performance and bundle size

## 🔍 Quality Assurance

### Code Quality
```bash
# Linting and formatting
npm run lint              # ESLint checks
npm run format           # Prettier formatting
npm run type-check       # TypeScript validation
```

### Visual Quality
- Design review process
- Cross-browser testing
- Mobile device testing
- Print stylesheet testing

## 📚 Resources

### External Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Lucide Icons](https://lucide.dev/)
- [Inter Font](https://rsms.me/inter/)

### Internal Resources
- **[API Documentation](../API/README.md)** - Backend integration
- **[Development Guide](../DEVELOPMENT.md)** - Development workflow
- **[Testing Guide](../TESTING.md)** - Testing strategies

## 🎯 Future Enhancements

### Planned Features
- Advanced animation system
- Enhanced theme customization
- Component composition tools
- Advanced accessibility features
- Performance monitoring dashboard

### Contributing
1. Follow the component development guidelines
2. Add comprehensive tests for new components
3. Update documentation for any changes
4. Submit pull requests with clear descriptions

---

*Beautiful, accessible, and performant UI components for VB Cart e-commerce platform.*
