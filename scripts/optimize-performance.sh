#!/bin/bash

echo "🚀 Performance Optimization Script"
echo "================================="

# Clear all caches
echo "🧹 Clearing caches..."
rm -rf .next
rm -f tsconfig.tsbuildinfo
rm -rf node_modules/.cache
rm -rf .turbo

# Clear npm cache
echo "📦 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies
echo "📥 Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# Build with analysis
echo "🔍 Building with bundle analysis..."
npm run build-analyze

echo "✅ Performance optimization complete!"
echo ""
echo "📊 Next steps:"
echo "1. Check the bundle analyzer report"
echo "2. Run Lighthouse again to measure improvements"
echo "3. Monitor Core Web Vitals"
