# Aprylo - Premium Fashion E-commerce Platform

A modern, full-stack fashion e-commerce platform built with Next.js 15, TypeScript, and Supabase, featuring advanced state management, real-time updates, and a comprehensive design system.

## 📚 Documentation

### 🔗 Quick Links
- **[📖 Complete Documentation](./docs/README.md)** - Main documentation hub
- **[🚀 Installation Guide](./docs/01-GETTING-STARTED/INSTALLATION.md)** - Setup and installation
- **[💻 Development Guide](./docs/01-GETTING-STARTED/DEVELOPMENT.md)** - Development workflow
- **[🌐 Deployment Guide](./docs/01-GETTING-STARTED/DEPLOYMENT.md)** - Production deployment
- **[📋 Implementation Summary](./docs/04-IMPLEMENTATION/IMPLEMENTATION_SUMMARY.md)** - Technical overview

### 🏗️ Architecture Documentation
- **[🔌 API Documentation](./docs/02-ARCHITECTURE/API/README.md)** - Complete API reference
- **[🗄️ Database Documentation](./docs/02-ARCHITECTURE/DB/README.md)** - Database schema and migrations
- **[🎨 UI/UX Documentation](./docs/02-ARCHITECTURE/UI/README.md)** - Design system and components

### 📚 Specialized Guides
- **[🔍 Search Feature Guide](./docs/03-FEATURES/)** - Advanced search implementation
- **[🛒 State Management Guide](./docs/02-ARCHITECTURE/STATE_MANAGEMENT_GUIDE.md)** - React Query + Zustand
- **[🍪 Cookie Migration Guide](./docs/06-GUIDES/COOKIE_MIGRATION_GUIDE.md)** - Cookie management

## 🚀 Features

- 🛍️ **Complete E-commerce**: Full shopping cart, checkout, and order management
- 👤 **User Authentication**: Secure authentication with Supabase Auth
- 🏪 **Admin Dashboard**: Product, order, and user management
- 💳 **Payment Integration**: Razorpay payment gateway
- 📱 **Responsive Design**: Mobile-first, works on all devices
- 🔍 **Advanced Search**: Real-time search with filters and suggestions
- ⭐ **Reviews & Ratings**: Customer review system with verification
- 📦 **Order Tracking**: Complete order management and tracking
- 🎨 **Modern UI**: Clean design with Tailwind CSS and Radix UI
- 🔒 **Type Safe**: Full TypeScript implementation with auto-generated types
- ⚡ **Performance**: Optimized with React Query caching and code splitting
- 🔄 **Real-time**: Live cart updates and order status changes

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Query (TanStack Query) + Zustand
- **Icons**: Lucide React
- **PWA**: Next-PWA for offline functionality

### Backend & Database
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth with Row Level Security
- **API**: Next.js API routes with type-safe operations
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime subscriptions

### Payments & Deployment
- **Payments**: Razorpay integration
- **Deployment**: Ready for Vercel/Netlify
- **Monitoring**: Built-in analytics and error tracking

## 📦 Categories

- 👔 **Men's Fashion**: Shirts, pants, jackets, accessories
- 👗 **Women's Fashion**: Dresses, tops, bottoms, accessories  
- 👶 **Children's Fashion**: Clothing for boys and girls

## ⚡ Quick Start

> 📖 **For detailed setup instructions, see the [Installation Guide](./docs/INSTALLATION.md)**

### Prerequisites
- Node.js 18+
- Supabase account
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hp1234v/vbcart.git
   cd vbcart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase and Razorpay credentials
   ```

4. **Database setup**
   ```bash
   # Generate types from Supabase schema
   npm run supabase:gen-types
   
   # If using local development
   supabase start
   supabase db reset
   ```

5. **Start development**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Test Credentials

### Demo Accounts
- **Admin Account**
  - Email: admin@vbcart.com
  - Password: admin123
  - Access: Full admin dashboard and management

- **User Account**  
  - Email: user@vbcart.com
  - Password: user123
  - Access: Shopping features and user profile

### Test Payment Cards (Razorpay)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

> 💡 **Note**: These are test credentials for demo purposes. In production, create your own admin account through the registration process.

## 🏗️ Project Structure

> 📁 **For detailed architecture, see the [Development Guide](./docs/DEVELOPMENT.md)**

```
vb-cart/
├── docs/                     # 📚 Comprehensive documentation
│   ├── API/                  # API documentation
│   ├── DB/                   # Database documentation  
│   ├── UI/                   # UI/UX documentation
│   └── *.md                  # Feature guides
├── src/
│   ├── app/                  # Next.js 15 App Router
│   │   ├── (auth)/          # Authentication routes
│   │   ├── (shop)/          # Shopping routes
│   │   ├── api/             # API endpoints
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ui/              # Base UI components (Radix UI)
│   │   ├── layout/          # Layout components
│   │   ├── product/         # Product components
│   │   ├── cart/            # Shopping cart components
│   │   └── [feature]/       # Feature-specific components
│   ├── hooks/               # Custom React hooks
│   │   └── api/             # React Query hooks
│   ├── lib/                 # Utilities & configurations
│   │   ├── supabase/        # Supabase client
│   │   ├── utils/           # Utility functions
│   │   └── validations/     # Schema validations
│   ├── stores/              # Zustand state management
│   ├── types/               # TypeScript definitions
│   │   └── db.ts            # Auto-generated Supabase types
│   └── providers/           # React providers (Query, Auth)
├── public/                  # Static assets
├── supabase/               # Supabase configuration & migrations
└── ...config files
```

## � Available Scripts

> 🛠️ **For development workflow, see the [Development Guide](./docs/DEVELOPMENT.md)**

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Database & Types
npm run supabase:gen-types  # Generate TypeScript types from Supabase
npm run supabase:login      # Login to Supabase
npm run supabase:project-list # List Supabase projects

# Testing & Quality
npm run test            # Run tests
npm run test:watch     # Run tests in watch mode
npm run analyze        # Analyze bundle size
```

## 🎯 Key Features

### 🛒 E-commerce Core
- **Product Catalog**: Advanced product browsing with categories and filters
- **Shopping Cart**: Real-time cart management with persistence
- **Checkout Process**: Streamlined checkout with multiple payment options
- **Order Management**: Complete order tracking and history
- **User Profiles**: User accounts with address management

### 🔍 Advanced Search
- **Real-time Search**: Instant search results as you type
- **Smart Filters**: Category, price, rating, and availability filters
- **Search Suggestions**: Intelligent search term suggestions
- **Search Analytics**: Track popular searches and optimize results

### 📱 User Experience
- **Responsive Design**: Perfect experience on all device sizes
- **Progressive Web App**: Offline functionality and app-like experience
- **Fast Performance**: Optimized loading with React Query caching
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

### 🔐 Security & Performance
- **Row Level Security**: Database-level security with Supabase RLS
- **Type Safety**: End-to-end TypeScript with auto-generated types
- **Performance Monitoring**: Built-in analytics and error tracking
- **SEO Optimization**: Server-side rendering and meta tag management

## 🚀 Deployment

> 🌐 **For detailed deployment instructions, see the [Deployment Guide](./docs/DEPLOYMENT.md)**

### Vercel (Recommended)
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Payment Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# App Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=your-app-url
```

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Configure reverse proxy (Nginx/Apache) if needed

## 📊 Database Schema

> 🗄️ **For complete schema documentation, see [Database Documentation](./docs/DB/README.md)**

### Core Tables
- **User**: User accounts with authentication and profiles
- **Product**: Product catalog with variants and inventory
- **Category**: Product categorization with hierarchical structure
- **Cart**: Shopping cart management with real-time sync
- **Order**: Order processing with status tracking
- **Review**: Product reviews and ratings with verification
- **Address**: User address management with validation

### Key Features
- **Row Level Security**: Secure data access at database level
- **Real-time Updates**: Live cart and order status updates
- **Type Safety**: Auto-generated TypeScript types
- **Performance**: Optimized indexes and query patterns

## 🎯 Features Overview

> ✨ **For implementation details, see [Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md)**

### Customer Features
- **Authentication**: Secure registration and login with email verification
- **Product Discovery**: Advanced search, filtering, and category browsing
- **Shopping Experience**: Intuitive cart management and streamlined checkout
- **Order Management**: Order tracking, history, and status updates
- **User Profile**: Profile management with multiple shipping addresses
- **Reviews & Ratings**: Product reviews with verification badges
- **Wishlist**: Save products for later purchase
- **Responsive Design**: Seamless experience across all devices

### Admin Features
- **Dashboard**: Comprehensive analytics and sales overview
- **Product Management**: Full CRUD operations for products and categories
- **Order Processing**: Order status management and fulfillment tracking
- **User Management**: User account oversight and support
- **Inventory Control**: Stock management and low-stock alerts
- **Content Management**: Homepage banners and promotional content
- **Analytics**: Detailed reporting and performance metrics

### Technical Features
- **Real-time Updates**: Live cart synchronization and order status
- **Offline Support**: PWA functionality with offline browsing
- **Performance**: Optimized loading with intelligent caching
- **SEO**: Server-side rendering and meta tag optimization
- **Security**: End-to-end type safety and database security
- **Monitoring**: Error tracking and performance analytics

## 🧪 Testing

> 🔬 **For testing guidelines, see [Development Guide](./docs/DEVELOPMENT.md)**

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint and database integration
- **E2E Tests**: Complete user journey testing
- **Visual Tests**: UI component and design system testing

### Running Tests
```bash
npm run test              # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Generate coverage report
```

## 🐛 Troubleshooting

> 🔧 **For detailed troubleshooting, see [Installation Guide](./docs/INSTALLATION.md)**

### Common Issues

1. **Environment Variables**
   ```bash
   # Verify all required variables are set
   cat .env.local | grep NEXT_PUBLIC_
   ```

2. **Type Generation Issues**
   ```bash
   # Regenerate Supabase types
   npm run supabase:gen-types
   ```

3. **Build Errors**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

4. **Database Connection**
   ```bash
   # Test Supabase connection
   supabase status
   supabase projects list
   ```

### Getting Help
- 📖 Check the [comprehensive documentation](./docs/README.md)
- 🐛 Search [existing issues](https://github.com/hp1234v/vbcart/issues)
- 💬 Create a [new issue](https://github.com/hp1234v/vbcart/issues/new) with details
- 📧 Contact: [support@vbcart.com](mailto:support@vbcart.com)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow coding standards**: Use ESLint and Prettier
4. **Add tests**: Ensure all new features have tests
5. **Update documentation**: Update relevant docs
6. **Submit a pull request**: With clear description

### Development Setup
```bash
# Fork and clone the repo
git clone https://github.com/your-username/vbcart.git
cd vbcart

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature-name

# Start development
npm run dev
```

## � Roadmap

### Upcoming Features
- **Multi-language Support**: Internationalization (i18n)
- **Advanced Analytics**: Enhanced reporting dashboard
- **Social Features**: Product sharing and social login
- **Mobile App**: React Native mobile application
- **AI Recommendations**: Personalized product suggestions
- **Subscription Products**: Recurring purchase options

### Performance Enhancements
- **Edge Computing**: Cloudflare Workers integration
- **Advanced Caching**: Redis integration for enhanced performance
- **Image Optimization**: Advanced image processing and CDN
- **Bundle Optimization**: Further code splitting and optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Special thanks to:
- **[Next.js](https://nextjs.org/)** team for the incredible framework
- **[Supabase](https://supabase.com/)** for the backend infrastructure
- **[Vercel](https://vercel.com/)** for the deployment platform
- **[Tailwind CSS](https://tailwindcss.com/)** for the styling system
- **[Radix UI](https://www.radix-ui.com/)** for accessible components
- All contributors and supporters of this project

## 📞 Support & Community

- **Documentation**: [Complete Documentation](./docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/hp1234v/vbcart/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hp1234v/vbcart/discussions)
- **Email**: [support@vbcart.com](mailto:support@vbcart.com)

---

**Happy Shopping! 🛍️**

*Built with ❤️ by the Aprylo Team*

---

### ⭐ Star this repository if you find it helpful!
