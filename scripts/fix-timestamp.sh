#!/bin/bash

# Fix timestamp update script
# This script properly updates the timestamp in DAILY_PROGRESS.md

CURRENT_TIMESTAMP=$(date "+%d/%m/%Y at %H:%M")
echo "🕐 Updating timestamp to: $CURRENT_TIMESTAMP"

# Use a more robust approach with awk
if [ -f "DAILY_PROGRESS.md" ]; then
    awk -v timestamp="$CURRENT_TIMESTAMP" '
    /\*\*Last Updated:\*\*/ {
        gsub(/\*\*Last Updated:\*\* .*/, "**Last Updated:** " timestamp)
    }
    { print }
    ' DAILY_PROGRESS.md > DAILY_PROGRESS.md.tmp && mv DAILY_PROGRESS.md.tmp DAILY_PROGRESS.md
    
    echo "✅ Timestamp updated successfully to $CURRENT_TIMESTAMP"
else
    echo "⚠️  DAILY_PROGRESS.md not found"
fi

