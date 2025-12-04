#!/bin/bash

# SEO Health Check Script for VB Cart
echo "🔍 VB Cart SEO Health Check"
echo "=========================="

# Check if required files exist
echo "📁 Checking required files..."

files=(
    "public/robots.txt"
    "public/manifest.json" 
    "public/icons/icon-144x144.png"
    "public/icons/icon-192x192.png"
    "public/icons/icon-512x512.png"
    "public/logos/vb_logo.png"
    "src/app/sitemap.ts"
    "src/components/seo/structured-data.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "🌐 Testing local endpoints..."

# Test if development server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Development server is running"
    
    # Test sitemap
    if curl -s http://localhost:3000/sitemap.xml > /dev/null; then
        echo "✅ Sitemap accessible at /sitemap.xml"
    else
        echo "❌ Sitemap not accessible"
    fi
    
    # Test robots.txt
    if curl -s http://localhost:3000/robots.txt > /dev/null; then
        echo "✅ Robots.txt accessible"
    else
        echo "❌ Robots.txt not accessible"
    fi
    
    # Test manifest
    if curl -s http://localhost:3000/manifest.json > /dev/null; then
        echo "✅ PWA manifest accessible"
    else
        echo "❌ PWA manifest not accessible"
    fi
    
    # Test icons
    if curl -s http://localhost:3000/icons/icon-144x144.png > /dev/null; then
        echo "✅ Icon 144x144 accessible (no more 404s)"
    else
        echo "❌ Icon 144x144 still returns 404"
    fi
    
else
    echo "❌ Development server not running (start with: npm run dev)"
fi

echo ""
echo "📋 SEO Checklist"
echo "================"
echo "□ Update domain URLs in files (replace vbcart.com with your domain)"
echo "□ Update social media links in structured-data.tsx"
echo "□ Update contact information in structured-data.tsx"
echo "□ Create Google Business Profile with your logo"
echo "□ Submit sitemap to Google Search Console"
echo "□ Install Google Analytics"
echo "□ Verify website in Google Search Console"
echo "□ Test structured data with Google Rich Results Test"

echo ""
echo "🔗 Useful Links:"
echo "- Google Business Profile: https://business.google.com"
echo "- Google Search Console: https://search.google.com/search-console"
echo "- Rich Results Test: https://search.google.com/test/rich-results"
echo "- PageSpeed Insights: https://pagespeed.web.dev"
