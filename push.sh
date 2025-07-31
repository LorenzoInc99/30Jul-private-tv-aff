#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting push process...${NC}"

# Check if there are any changes to commit
if [[ -z $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  No changes to commit. Working directory is clean.${NC}"
    exit 0
fi

# Show current status
echo -e "${BLUE}📊 Current git status:${NC}"
git status --short

# Stage all changes
echo -e "${BLUE}📦 Staging all changes...${NC}"
git add .

# Create commit message with timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MESSAGE="Update: $TIMESTAMP"

echo -e "${BLUE}💾 Committing changes with message: ${YELLOW}$COMMIT_MESSAGE${NC}"
git commit -m "$COMMIT_MESSAGE"

# Push to remote repository
echo -e "${BLUE}🚀 Pushing to remote repository...${NC}"
git push

echo -e "${GREEN}✅ Successfully pushed changes to repository!${NC}"
echo -e "${BLUE}📅 Commit timestamp: ${YELLOW}$TIMESTAMP${NC}" 