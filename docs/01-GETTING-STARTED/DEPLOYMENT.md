# Deployment Guide

## Overview

This guide covers deploying Aprylo to production environments, with detailed instructions for Vercel (recommended), Netlify, and custom server deployments.

## Pre-deployment Checklist

### 1. Code Quality Verification

```bash
# Run all quality checks
npm run type-check     # TypeScript compilation
npm run lint          # ESLint checks
npm run test          # Unit tests
npm run build         # Production build test
```

### 2. Environment Variables Audit

Ensure all required environment variables are set:

```env
# Essential production variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### 3. Database Preparation

```bash
# Ensure database schema is up to date
npm run supabase:gen-types
supabase db push

# Verify production data
npm run db:seed # (if needed for initial data)
```

## Vercel Deployment (Recommended)

### 1. Initial Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel
```

### 2. Environment Configuration

In Vercel Dashboard → Project Settings → Environment Variables:

```env
# Production Environment Variables
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-production-razorpay-key
RAZORPAY_KEY_SECRET=your-production-razorpay-secret
NODE_ENV=production
```

### 3. Vercel Configuration

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["cle1"], 
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=1, stale-while-revalidate"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/shop",
      "destination": "/products",
      "permanent": true
    }
  ]
}
```

### 4. Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
   NEXTAUTH_URL=https://your-custom-domain.com
   ```

### 5. Performance Optimization

```javascript
// next.config.js for production
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['your-supabase-project.supabase.co'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
```

## Netlify Deployment

### 1. Setup

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

### 2. Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_ENV = "production"
  NEXT_TELEMETRY_DISABLED = "1"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "public, max-age=0, s-maxage=86400"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Custom Server Deployment

### 1. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 2. Deploy with Docker

```bash
# Build and run
docker build -t vb-cart .
docker run -p 3000:3000 --env-file .env.production vb-cart

# Or with docker-compose
docker-compose up -d
```

### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/vb-cart
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "no-cache";
    }
}
```

## Database Production Setup

### 1. Supabase Production Configuration

```sql
-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;

-- Create production-specific policies
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Public can view products" ON "Product"
  FOR SELECT USING (true);

-- Setup automated backups
SELECT cron.schedule('daily-backup', '0 2 * * *', 'SELECT pg_dump...');
```

### 2. Database Migration Strategy

```bash
# Production migration workflow
supabase db diff --schema public > migration.sql
supabase db push --db-url $PRODUCTION_DATABASE_URL
npm run supabase:gen-types
```

## Monitoring and Analytics

### 1. Performance Monitoring

```typescript
// lib/monitoring.ts
export const trackPerformance = (name: string, duration: number) => {
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics, Mixpanel, etc.
    gtag('event', 'timing_complete', {
      name: name,
      value: Math.round(duration),
    });
  }
};

// Usage in components
useEffect(() => {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    trackPerformance('ProductList', duration);
  };
}, []);
```

### 2. Error Tracking

```typescript
// lib/error-tracking.ts
export const trackError = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket, etc.
    Sentry.captureException(error, {
      tags: context,
    });
  } else {
    console.error('Error:', error, context);
  }
};
```

### 3. Health Checks

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    
    // Test database connection
    const { error } = await supabase
      .from('Product')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

## Security Configuration

### 1. Security Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}
```

### 2. Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const rateLimit = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});

export const checkRateLimit = (ip: string, limit: number = 100) => {
  const requests = rateLimit.get(ip) || 0;
  
  if (requests >= limit) {
    return false;
  }
  
  rateLimit.set(ip, requests + 1);
  return true;
};
```

## Post-Deployment Tasks

### 1. DNS Configuration

```bash
# Add required DNS records
A     @              Your-Server-IP
CNAME www            your-domain.com
TXT   @              "v=spf1 include:_spf.your-email-provider.com ~all"
```

### 2. SSL Certificate

```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Performance Testing

```bash
# Load testing with Artillery
npm install -g artillery
artillery quick --count 100 --num 10 https://your-domain.com

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

### 4. Monitoring Setup

```bash
# Setup uptime monitoring
curl -X POST "https://api.uptimerobot.com/v2/newMonitor" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=YOUR_API_KEY&format=json&type=1&url=https://your-domain.com&friendly_name=Aprylo"
```

## Rollback Strategy

### 1. Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### 2. Database Rollback

```bash
# Create database snapshot before deployment
supabase db dump > pre-deployment-backup.sql

# Restore if needed
psql $DATABASE_URL < pre-deployment-backup.sql
```

### 3. Cache Invalidation

```typescript
// Clear CDN cache after rollback
const invalidateCache = async () => {
  // Cloudflare example
  await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
    method: 'POST',
    headers: {
      'X-Auth-Email': CLOUDFLARE_EMAIL,
      'X-Auth-Key': CLOUDFLARE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ purge_everything: true }),
  });
};
```

## Maintenance

### 1. Regular Updates

```bash
# Update dependencies monthly
npm audit
npm update
npm run test
npm run build
```

### 2. Database Maintenance

```sql
-- Monthly database optimization
VACUUM ANALYZE;
REINDEX DATABASE your_database;

-- Update statistics
ANALYZE;
```

### 3. Log Rotation

```bash
# Setup log rotation for custom servers
sudo logrotate -d /etc/logrotate.d/vb-cart
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify all required variables are set
   env | grep NEXT_PUBLIC_
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connection
   npm run supabase:gen-types
   ```

4. **Performance Issues**
   ```bash
   # Analyze bundle size
   npm run analyze
   ```

---

*Deployment complete! Your Aprylo application is now live in production. 🚀*
