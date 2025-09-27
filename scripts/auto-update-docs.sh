#!/bin/bash

# Auto Documentation Update Script
# This script runs automatically when you push to terminal
# It updates all documentation files with current date and time

# Get current date in the format: Month DD, YYYY
CURRENT_DATE=$(date "+%B %d, %Y")
# Get current date and time in the format: dd/mm/yyyy at hh:mm
CURRENT_TIMESTAMP=$(date "+%d/%m/%Y at %H:%M")

echo "🚀 Auto-updating documentation on push..."
echo "📅 Setting date to: $CURRENT_DATE"
echo "🕐 Setting timestamp to: $CURRENT_TIMESTAMP"

# Function to update a file if it exists
update_file() {
    local file=$1
    local pattern=$2
    
    if [ -f "$file" ]; then
        sed -i.bak "s/$pattern.*/$pattern $CURRENT_DATE/" "$file"
        echo "✅ Updated $file"
    fi
}

# Function to update timestamp in DAILY_PROGRESS.md
update_timestamp() {
    local file=$1
    local pattern=$2
    
    if [ -f "$file" ]; then
        sed -i.bak "s/$pattern.*/$pattern $CURRENT_TIMESTAMP/" "$file"
        echo "✅ Updated $file timestamp"
    fi
}

# Update all documentation files
update_file "PROJECT_OVERVIEW.md" "\*\*Last Updated:\*\*"
update_file "DEVELOPMENT_LOG.md" "\*\*Last Updated:\*\*"
update_file "HANDOVER_GUIDE.md" "\*\*Last Updated:\*\*"
update_file "README.md" "\*\*Last Updated:\*\*"
update_file "docs/API_INTEGRATION.md" "\*\*Created:\*\*"
update_file "docs/REVENUE_OPTIMIZATION.md" "\*\*Last Updated:\*\*"

# Update timestamp in DAILY_PROGRESS.md
update_timestamp "DAILY_PROGRESS.md" "\*\*Last Updated:\*\*"

# Clean up backup files
rm -f *.bak docs/*.bak 2>/dev/null

echo "🎯 Documentation auto-updated successfully!"
echo "📅 All files now show: $CURRENT_DATE"
echo "🕐 DAILY_PROGRESS.md timestamp: $CURRENT_TIMESTAMP"

# Optional: Add to git if you want to commit the date changes
# git add *.md docs/*.md
# git commit -m "📅 Auto-update documentation dates to $CURRENT_DATE"
