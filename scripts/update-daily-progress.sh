#!/bin/bash

# Update Daily Progress Script
# This script updates the current day's progress entry

CURRENT_DATE=$(date "+%B %d, %Y")
DATE_SLUG=$(date "+%Y-%m-%d")

echo "📝 Updating Daily Progress for $CURRENT_DATE"

# Check if DAILY_PROGRESS.md exists
if [ ! -f "DAILY_PROGRESS.md" ]; then
    echo "⚠️  DAILY_PROGRESS.md not found. Creating new file..."
    touch DAILY_PROGRESS.md
fi

# Check if today's entry already exists
if grep -q "- \*\*$CURRENT_DATE:\*\*" DAILY_PROGRESS.md; then
    echo "✅ Entry for $CURRENT_DATE already exists"
    echo "📝 Edit DAILY_PROGRESS.md to update your progress"
else
    echo "🔄 Adding new entry for $CURRENT_DATE"
    
    # Add new entry to the current month section
    MONTH=$(date "+%B %Y")
    
    # Check if current month section exists
    if grep -q "### \*\*$MONTH:\*\*" DAILY_PROGRESS.md; then
        # Add to existing month section
        sed -i.bak "/### \*\*$MONTH:\*\*/a\\
- **$CURRENT_DATE:** [Add your work summary here]" DAILY_PROGRESS.md
    else
        # Create new month section
        cat >> DAILY_PROGRESS.md << EOF

### **$MONTH:**
- **$CURRENT_DATE:** [Add your work summary here]

EOF
    fi

    echo "✅ New entry added for $CURRENT_DATE"
fi

# Update the "Last Updated" timestamp
CURRENT_TIMESTAMP=$(date "+%d/%m/%Y at %H:%M")
if grep -q "\*\*Last Updated:\*\*" DAILY_PROGRESS.md; then
    # Use awk for more robust timestamp update
    awk -v timestamp="$CURRENT_TIMESTAMP" '
    /\*\*Last Updated:\*\*/ {
        gsub(/\*\*Last Updated:\*\* .*/, "**Last Updated:** " timestamp)
    }
    { print }
    ' DAILY_PROGRESS.md > DAILY_PROGRESS.md.tmp && mv DAILY_PROGRESS.md.tmp DAILY_PROGRESS.md
    echo "✅ Updated timestamp to $CURRENT_TIMESTAMP"
fi

# Clean up backup files
rm -f *.bak 2>/dev/null

echo ""
echo "📝 Next Steps:"
echo "  1. Edit DAILY_PROGRESS.md to fill in your work summary"
echo "  2. Replace '[Add your work summary here]' with your actual accomplishments"
echo "  3. Run this script again tomorrow for a new entry"
