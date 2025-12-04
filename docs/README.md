# Aprylo Documentation

Welcome to the Aprylo project documentation. This documentation follows a structured approach to help developers understand, maintain, and extend the application.

## 📁 Documentation Structure

### 01-GETTING-STARTED
Essential information for new developers to get up and running.
- **DEPLOYMENT.md**: Production deployment guide
- **DEVELOPMENT.md**: Local development setup
- **INSTALLATION.md**: Installation instructions
- **ADMIN_SETUP.md**: Admin panel setup and configuration

### 02-ARCHITECTURE  
Technical architecture, system design, and component relationships.
- **API/**: API endpoints and authentication
- **DB/**: Database schema, migrations, and configuration
- **UI/**: User interface components and design system
- **STATE_MANAGEMENT_GUIDE.md**: Comprehensive state management patterns

### 03-FEATURES
Detailed documentation of implemented features and functionality.
- **COMPREHENSIVE_LAZY_LOADING_IMPLEMENTATION.md**: Lazy loading strategies
- **INFINITE_SCROLL_REVIEWS.md**: Infinite scroll implementation
- **LAZY_LOADING_IMPLEMENTATION.md**: Performance optimizations
- **PRODUCT_LAZY_LOADING_IMPLEMENTATION.md**: Product-specific optimizations

### 04-IMPLEMENTATION
Implementation guides, optimization strategies, and technical details.
- **IMPLEMENTATION_SUMMARY.md**: Overall implementation status
- **PERFORMANCE_OPTIMIZATIONS.md**: Performance enhancement strategies
- **CODE_DEDUPLICATION_SUMMARY.md**: Code deduplication and refactoring
- **ENHANCEMENT_SUMMARY.md**: Feature enhancement documentation
- **FINAL_CONSOLIDATION_REPORT.md**: Repository consolidation results
- **REPOSITORY_CONSOLIDATION_SUMMARY.md**: Consolidation process details
- **api-migration-example.ts**: API migration example code

### 05-TROUBLESHOOTING
Common issues, debugging guides, and problem resolution.

#### Next.js & Framework Issues
- **NEXTJS_15_ASYNC_API_FIXES.md**: Invoice route async API fixes
- **NEXTJS_15_COOKIES_API_FIX.md**: Cookies() synchronization error fix

#### Feature-Specific Issues
- **CATEGORY_FILTER_FIX.md**: Category filtering issues
- **CURRENT_ADDED_ISSUE_FIX.md**: Current issues and fixes
- **IMAGE_LOADING_FIX.md**: Image loading problems

#### System & Access Issues
- **ADMIN_ACCESS_FIX.md**: Admin access troubleshooting
- **FUNCTIONALITY_INVESTIGATION_RESULTS.md**: Investigation results
- **ISSUE_RESOLUTION_SUMMARY.md**: General issue resolution
- **UI_CATEGORY_FILTERING_FIXED.md**: UI filtering fixes

#### Review System Issues
- **REVIEW_DEBUG_AND_TESTING.md**: Review system debugging
- **REVIEW_DELETE_STATUS.md**: Review deletion issues
- **REVIEW_FUNCTIONALITY_RESOLVED.md**: Review functionality fixes
- **REVIEW_RLS_FIXES.md**: Row Level Security fixes
- **USER_DATA_CONSISTENCY_REVIEW.md**: Data consistency issues

### 06-GUIDES
Step-by-step guides for specific tasks and procedures.
- **COOKIE_MIGRATION_GUIDE.md**: Cookie migration procedures
- **HEADER_UX_IMPROVEMENTS.md**: Header UX enhancement guide
- **NAVIGATION_UX_IMPROVEMENTS.md**: Navigation improvements
- **REVIEW_UX_IMPROVEMENTS.md**: Review system UX enhancements

## 🏗️ Project Overview

Aprylo is a modern e-commerce application built with:
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **UI Components**: Custom components with Tailwind CSS

## 🚀 Quick Start

1. Refer to `01-GETTING-STARTED/` for setup instructions
2. Check `02-ARCHITECTURE/` to understand the system design
3. Browse `03-FEATURES/` to see what's implemented
4. Use `05-TROUBLESHOOTING/` when you encounter issues

## 📖 Documentation Standards

All documentation in this project follows these standards:
- Clear, concise language
- Code examples where applicable
- Step-by-step instructions
- Proper categorization in the folder structure
- Regular updates when features change

## 🤝 Contributing

When adding new documentation:
1. Follow the established folder structure
2. Use clear, descriptive filenames
3. Include relevant code examples
4. Update this README if adding new sections
5. Follow the documentation template (see DOCUMENTATION_TEMPLATE.md)

---

*Last updated: August 2025*
