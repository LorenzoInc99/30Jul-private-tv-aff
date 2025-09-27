#!/bin/bash

# Progress Summary Script
# This script provides an overview of all daily progress entries

echo "📊 Daily Progress Summary"
echo "========================="

# Check if DAILY_PROGRESS.md exists
if [ ! -f "DAILY_PROGRESS.md" ]; then
    echo "⚠️  DAILY_PROGRESS.md not found. No progress data available."
    exit 1
fi

echo "📅 Progress Entries Found:"
echo "-------------------------"

# Extract all dates from the file
grep -n "## 📅" DAILY_PROGRESS.md | while read line; do
    echo "  $line"
done

echo ""
echo "📈 Quick Stats:"
echo "---------------"

# Count total entries
TOTAL_ENTRIES=$(grep -c "## 📅" DAILY_PROGRESS.md)
echo "  Total Development Days: $TOTAL_ENTRIES"

# Count completed sessions
COMPLETED_SESSIONS=$(grep -c "Session Status.*Completed" DAILY_PROGRESS.md)
echo "  Completed Sessions: $COMPLETED_SESSIONS"

# Count in-progress sessions
IN_PROGRESS_SESSIONS=$(grep -c "Session Status.*In Progress" DAILY_PROGRESS.md)
echo "  In Progress Sessions: $IN_PROGRESS_SESSIONS"

echo ""
echo "🎯 Recent Accomplishments:"
echo "-------------------------"

# Show last 3 entries with their accomplishments
grep -A 20 "## 📅" DAILY_PROGRESS.md | tail -30

echo ""
echo "📝 To view full progress details:"
echo "  cat DAILY_PROGRESS.md"
echo ""
echo "📝 To add new daily entry:"
echo "  ./scripts/daily-progress.sh"
