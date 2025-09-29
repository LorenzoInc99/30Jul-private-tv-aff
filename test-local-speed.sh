#!/bin/bash

echo "🚀 Testing Local Development Speed"
echo "=================================="

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Server not running. Start with: npm run dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test response times
echo "📊 Response Time Tests:"
echo "----------------------"

# Homepage
echo -n "Homepage: "
curl -s -w "%{time_total}s\n" http://localhost:3000 -o /dev/null

# Admin page
echo -n "Admin: "
curl -s -w "%{time_total}s\n" http://localhost:3000/admin -o /dev/null

# API endpoint
echo -n "API: "
curl -s -w "%{time_total}s\n" http://localhost:3000/api/test-data-collection -o /dev/null

echo ""
echo "💡 For detailed analysis:"
echo "   - Open Chrome DevTools (F12)"
echo "   - Go to 'Lighthouse' tab"
echo "   - Click 'Generate report'"
echo "   - Or use 'Performance' tab for detailed timing"
echo ""
echo "🔧 Performance Commands:"
echo "   - npm run analyze (bundle analysis)"
echo "   - npm run dev-fast (without turbopack)"
echo "   - npm run clear-cache (clear all caches)"
