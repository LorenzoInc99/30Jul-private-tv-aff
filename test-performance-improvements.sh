#!/bin/bash

echo "🚀 Testing Performance Improvements"
echo "=================================="

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Server not running. Start with: pm2 start football-guide"
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

# Team page (if available)
echo -n "Team page: "
curl -s -w "%{time_total}s\n" http://localhost:3000/team/arsenal -o /dev/null

# API endpoint
echo -n "API: "
curl -s -w "%{time_total}s\n" http://localhost:3000/api/test-database -o /dev/null

echo ""
echo "🎯 Performance Improvements Applied:"
echo "✅ Font loading optimization (font-display: swap)"
echo "✅ Loading skeletons for all components"
echo "✅ Image dimensions fixed to prevent layout shift"
echo "✅ Webpack bundle optimization"
echo "✅ Database query performance tracking"
echo ""

echo "📈 Expected Improvements:"
echo "- CLS: 0.148 → <0.1 (Layout shift fixed)"
echo "- Total Blocking Time: 1,450ms → <500ms (Loading states)"
echo "- Performance Score: 60 → 80-90+ (Overall optimization)"
echo ""

echo "🔍 Next Steps:"
echo "1. Run Lighthouse in Chrome Incognito"
echo "2. Check bundle analyzer: npm run build-analyze"
echo "3. Monitor performance with new tracking"
echo ""

echo "💡 To test improvements:"
echo "1. Open Chrome Incognito"
echo "2. Go to http://localhost:3000"
echo "3. Run Lighthouse Performance test"
echo "4. Compare scores with previous results"
