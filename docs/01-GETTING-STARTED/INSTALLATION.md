# Installation Guide

## Prerequisites

Before setting up VB Cart, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Supabase Account**: For database and authentication

## System Requirements

### Minimum Requirements
- **RAM**: 4GB
- **Storage**: 2GB free space
- **OS**: macOS, Windows 10+, or Linux

### Recommended Requirements
- **RAM**: 8GB or higher
- **Storage**: 5GB free space
- **OS**: Latest version of macOS, Windows 11, or Ubuntu 20.04+

## Step-by-Step Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/vb-cart.git

# Navigate to the project directory
cd vb-cart
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm --version
node --version
```

### 3. Environment Setup

Create environment files for different environments:

#### Development Environment

```bash
# Create .env.local file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="VB Cart"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Database Configuration
DATABASE_URL="your-supabase-database-url"

# Authentication
JWT_SECRET="your-jwt-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Payment Gateway (Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET="your-storage-bucket"

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="your-google-analytics-id"
```

#### Production Environment

```bash
# Create .env.production
cp .env.example .env.production
```

Update with production values (secure secrets, production URLs, etc.)

### 4. Database Setup

#### Supabase Setup

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Initialize Supabase in your project
   supabase init
   ```

2. **Configure Database**
   ```bash
   # Link to your Supabase project
   supabase link --project-ref your-project-ref

   # Push database schema
   supabase db push

   # Generate TypeScript types
   npm run supabase:gen-types
   ```

3. **Setup Authentication**
   - Go to your Supabase dashboard
   - Navigate to Authentication > Settings
   - Configure authentication providers
   - Set up email templates

4. **Setup Storage**
   - Go to Storage in Supabase dashboard
   - Create buckets for product images
   - Configure storage policies

### 5. Database Migration and Seeding

```bash
# Run database migrations
npm run db:push

# Seed the database with initial data
npm run db:seed

# Open Prisma Studio to view data (optional)
npm run db:studio
```

### 6. Start Development Server

```bash
# Start the development server
npm run dev

# Or with different port
npm run dev -- --port 3001
```

The application will be available at `http://localhost:3000`

## Verification

### 1. Check Application Loading

1. Open `http://localhost:3000` in your browser
2. Verify the homepage loads correctly
3. Check that categories and products are displayed

### 2. Test Authentication

1. Navigate to `/login`
2. Create a test account
3. Verify email confirmation works
4. Test login/logout functionality

### 3. Test Core Features

1. **Product Browsing**
   - Browse different categories
   - Search for products
   - Apply filters

2. **Cart Functionality**
   - Add products to cart
   - Update quantities
   - Remove items

3. **User Profile**
   - Update profile information
   - Add/edit addresses

### 4. Database Connection

```bash
# Test database connection
npm run db:studio

# Run type generation
npm run supabase:gen-types

# Check if types are generated
ls -la src/types/db.ts
```

## Common Issues and Solutions

### 1. Node.js Version Issues

**Problem**: `Error: Node.js version not supported`

**Solution**:
```bash
# Check Node.js version
node --version

# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 18
nvm install 18
nvm use 18
```

### 2. Dependency Installation Fails

**Problem**: `npm install` fails with permission errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### 3. Environment Variables Not Loading

**Problem**: Environment variables are undefined

**Solution**:
1. Ensure `.env.local` exists in the root directory
2. Restart the development server
3. Check variable names start with `NEXT_PUBLIC_` for client-side variables

### 4. Supabase Connection Issues

**Problem**: Cannot connect to Supabase

**Solution**:
```bash
# Check Supabase configuration
supabase status

# Test connection
supabase projects list

# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

### 5. Database Schema Issues

**Problem**: Database tables not found

**Solution**:
```bash
# Reset database (development only)
supabase db reset

# Push schema again
supabase db push

# Regenerate types
npm run supabase:gen-types
```

### 6. Port Already in Use

**Problem**: `Error: Port 3000 is already in use`

**Solution**:
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

## IDE Setup

### Visual Studio Code

Recommended extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Settings Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Docker Setup (Optional)

### Development with Docker

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    env_file:
      - .env.local
```

Run with Docker:

```bash
# Build and start
docker-compose -f docker-compose.dev.yml up --build

# Stop
docker-compose -f docker-compose.dev.yml down
```

## Next Steps

After successful installation:

1. **Read the [Development Guide](./DEVELOPMENT.md)** for development workflow
2. **Check [API Documentation](./API/README.md)** for API usage
3. **Review [Component Library](./UI/COMPONENTS.md)** for UI components
4. **See [Deployment Guide](./DEPLOYMENT.md)** for production deployment

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search existing [GitHub Issues](https://github.com/your-username/vb-cart/issues)
3. Create a new issue with:
   - Node.js version
   - npm version
   - Operating system
   - Error messages
   - Steps to reproduce

## Version Compatibility

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | 18.x - 20.x | LTS versions recommended |
| npm | 8.x+ | Comes with Node.js |
| Next.js | 15.x | Latest stable |
| React | 18.x | With Concurrent Features |
| TypeScript | 5.x | Latest stable |
| Tailwind CSS | 3.x | Latest stable |

---

*Installation complete! Ready to start developing with VB Cart.*
