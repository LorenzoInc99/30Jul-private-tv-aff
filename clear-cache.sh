#!/bin/bash

echo "🧹 Clearing Next.js cache..."

# Stop dev server if running
pkill -f "next dev" 2>/dev/null || true

# Clear Next.js cache
rm -rf .next

# Clear TypeScript cache
rm -f tsconfig.tsbuildinfo

echo "✅ Cache cleared! Starting dev server..."
npm run dev












