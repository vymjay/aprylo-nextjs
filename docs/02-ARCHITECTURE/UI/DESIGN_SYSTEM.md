# Design System

## Overview

Aprylo's design system provides a comprehensive set of design principles, components, and guidelines to ensure consistency and cohesiveness across the entire application.

## Design Principles

### 1. Simplicity
- Clean, uncluttered interfaces
- Intuitive navigation and user flows
- Minimal cognitive load for users
- Focus on essential functionality

### 2. Consistency
- Uniform design patterns throughout the app
- Consistent spacing, typography, and color usage
- Predictable user interactions
- Standardized component behaviors

### 3. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios

### 4. Performance
- Fast loading times
- Smooth animations and transitions
- Responsive design for all devices
- Optimized images and assets

## Color System

### Primary Colors

```css
:root {
  /* Primary Blue - Main brand color */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6; /* Main */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
}
```

**Usage:**
- Primary actions (CTAs, buttons)
- Links and interactive elements
- Active states
- Brand elements

### Secondary Colors

```css
:root {
  /* Gray - Supporting colors */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b; /* Main */
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
}
```

**Usage:**
- Text colors
- Borders and dividers
- Background colors
- Disabled states

### Semantic Colors

```css
:root {
  /* Success */
  --success-50: #ecfdf5;
  --success-500: #10b981;
  --success-600: #059669;

  /* Warning */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;

  /* Error */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;

  /* Info */
  --info-50: #eff6ff;
  --info-500: #3b82f6;
  --info-600: #2563eb;
}
```

### Color Usage Guidelines

| Color | Use Case | Don't Use For |
|-------|----------|---------------|
| Primary Blue | CTAs, active states, links | Error messages, warnings |
| Gray | Text, borders, backgrounds | Primary actions |
| Success Green | Success messages, completed states | Primary buttons |
| Warning Orange | Warnings, caution states | Success messages |
| Error Red | Error messages, destructive actions | Success states |

## Typography

### Font Family

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Type Scale

```css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; } /* 36px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; } /* 30px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; font-weight: 600; } /* 24px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; } /* 20px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; font-weight: 500; } /* 18px */

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; font-weight: 400; } /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; font-weight: 400; } /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1rem; font-weight: 400; } /* 12px */
```

### Typography Usage

```typescript
// Heading hierarchy
<h1 className="text-4xl font-bold text-gray-900">Page Title</h1>
<h2 className="text-3xl font-bold text-gray-800">Section Title</h2>
<h3 className="text-2xl font-semibold text-gray-700">Subsection</h3>
<h4 className="text-xl font-semibold text-gray-600">Component Title</h4>

// Body text
<p className="text-base text-gray-600">Regular paragraph text</p>
<span className="text-sm text-gray-500">Supporting text</span>
<small className="text-xs text-gray-400">Caption text</small>
```

### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Body text, descriptions |
| 500 | `font-medium` | Emphasized text, labels |
| 600 | `font-semibold` | Subheadings, buttons |
| 700 | `font-bold` | Headings, important text |

## Spacing System

### Scale

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### Usage Guidelines

```typescript
// Component spacing
<div className="p-4">         {/* 16px padding */}
<div className="px-6 py-4">   {/* 24px horizontal, 16px vertical */}
<div className="space-y-4">   {/* 16px vertical spacing between children */}

// Layout spacing
<section className="py-12">   {/* 48px section padding */}
<div className="mb-8">        {/* 32px bottom margin */}
```

## Layout System

### Grid System

```css
/* 12-column grid */
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* Common layouts */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
/* Default: 0px and up */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Container Sizes

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

## Component Styles

### Buttons

```typescript
// Button variants
const buttonVariants = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
  outline: "border border-gray-300 hover:border-gray-400 text-gray-700",
  ghost: "hover:bg-gray-100 text-gray-700",
  destructive: "bg-error-600 hover:bg-error-700 text-white"
};

// Button sizes
const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg"
};

// Usage
<Button variant="primary" size="md">
  Add to Cart
</Button>
```

### Cards

```css
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  overflow: hidden;
}

.card-hover {
  transition: box-shadow 0.2s ease-in-out;
}

.card-hover:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
```

### Forms

```css
.form-input {
  appearance: none;
  border: 1px solid theme('colors.gray.300');
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: theme('colors.primary.500');
  box-shadow: 0 0 0 3px theme('colors.primary.100');
}

.form-input:invalid {
  border-color: theme('colors.error.500');
}
```

## Icons

### Icon System

```typescript
// Using Lucide React icons
import { 
  ShoppingCart, 
  User, 
  Search, 
  Heart, 
  Star,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

// Icon sizes
const iconSizes = {
  xs: 'w-3 h-3',    // 12px
  sm: 'w-4 h-4',    // 16px
  md: 'w-5 h-5',    // 20px
  lg: 'w-6 h-6',    // 24px
  xl: 'w-8 h-8',    // 32px
};

// Usage
<ShoppingCart className="w-5 h-5 text-gray-600" />
```

### Icon Guidelines

- Use 24px (lg) for primary actions
- Use 20px (md) for secondary actions
- Use 16px (sm) for inline icons
- Maintain consistent stroke width (1.5)
- Use semantic colors for different states

## Shadows

### Shadow Scale

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

### Usage

| Shadow | Use Case |
|--------|----------|
| `shadow-sm` | Subtle depth, form inputs |
| `shadow-md` | Cards, dropdowns |
| `shadow-lg` | Modals, elevated content |
| `shadow-xl` | Overlays, tooltips |

## Animations

### Transition Classes

```css
.transition-base {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-fast {
  transition-duration: 100ms;
}

.transition-slow {
  transition-duration: 300ms;
}
```

### Animation Guidelines

- Use `transition-base` for most interactive elements
- Use `transition-fast` for immediate feedback (button hovers)
- Use `transition-slow` for complex state changes
- Prefer CSS transitions over JavaScript animations
- Respect user's motion preferences

## Accessibility

### Color Contrast

- Normal text: 4.5:1 contrast ratio minimum
- Large text (18px+): 3:1 contrast ratio minimum
- Interactive elements: 3:1 contrast ratio minimum

### Focus States

```css
.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-ring:focus {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

.focus-ring:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Support

```typescript
// Hidden content for screen readers
<span className="sr-only">Add product to cart</span>

// ARIA labels
<button aria-label="Close modal" aria-describedby="modal-description">
  <X className="w-4 h-4" />
</button>
```

## Component Composition

### Example: Product Card

```typescript
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-200">
        <Image
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
        />
        {product.isNew && (
          <Badge variant="success" className="absolute top-3 left-3">
            New
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <span className="text-xl font-bold text-gray-900">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <StarRating rating={product.rating} size="sm" />
        </div>

        <Button variant="outline" size="sm" className="w-full">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};
```

## Theme Configuration

### Tailwind CSS Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### CSS Custom Properties

```css
:root {
  /* Color tokens */
  --color-primary: theme('colors.primary.600');
  --color-secondary: theme('colors.gray.600');
  --color-success: theme('colors.green.600');
  --color-warning: theme('colors.yellow.600');
  --color-error: theme('colors.red.600');

  /* Typography */
  --font-size-base: 1rem;
  --line-height-base: 1.5;

  /* Spacing */
  --space-component: theme('spacing.4');
  --space-section: theme('spacing.8');

  /* Shadows */
  --shadow-card: theme('boxShadow.md');
  --shadow-overlay: theme('boxShadow.xl');
}
```

## Design Tokens

### Token Structure

```typescript
// design-tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
    },
    // ... other colors
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
} as const;
```

---

*This design system ensures consistent, accessible, and beautiful user interfaces across all Aprylo components.*
