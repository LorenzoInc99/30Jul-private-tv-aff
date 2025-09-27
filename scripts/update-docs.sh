#!/bin/bash

# Documentation Update Script
# This script updates the "Last Updated" dates in all documentation files

# Get current date in the format: Month DD, YYYY
CURRENT_DATE=$(date "+%B %d, %Y")

echo "🔄 Updating documentation dates to: $CURRENT_DATE"

# Update PROJECT_OVERVIEW.md
if [ -f "PROJECT_OVERVIEW.md" ]; then
    sed -i.bak "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $CURRENT_DATE/" PROJECT_OVERVIEW.md
    echo "✅ Updated PROJECT_OVERVIEW.md"
fi

# Update DEVELOPMENT_LOG.md
if [ -f "DEVELOPMENT_LOG.md" ]; then
    sed -i.bak "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $CURRENT_DATE/" DEVELOPMENT_LOG.md
    echo "✅ Updated DEVELOPMENT_LOG.md"
fi

# Update HANDOVER_GUIDE.md
if [ -f "HANDOVER_GUIDE.md" ]; then
    sed -i.bak "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $CURRENT_DATE/" HANDOVER_GUIDE.md
    echo "✅ Updated HANDOVER_GUIDE.md"
fi

# Update README.md
if [ -f "README.md" ]; then
    sed -i.bak "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $CURRENT_DATE/" README.md
    echo "✅ Updated README.md"
fi

# Update docs/API_INTEGRATION.md
if [ -f "docs/API_INTEGRATION.md" ]; then
    sed -i.bak "s/\*\*Created:\*\* .*/\*\*Created:\*\* $CURRENT_DATE/" docs/API_INTEGRATION.md
    echo "✅ Updated docs/API_INTEGRATION.md"
fi

# Update docs/REVENUE_OPTIMIZATION.md
if [ -f "docs/REVENUE_OPTIMIZATION.md" ]; then
    sed -i.bak "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $CURRENT_DATE/" docs/REVENUE_OPTIMIZATION.md
    echo "✅ Updated docs/REVENUE_OPTIMIZATION.md"
fi

# Clean up backup files
rm -f *.bak docs/*.bak

echo "🎯 Documentation dates updated successfully!"
echo "📅 All files now show: $CURRENT_DATE"
