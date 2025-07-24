#!/bin/bash
# Usage: ./discard-feature.sh

current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ]; then
  echo "You are on main. Nothing to discard."
  exit 1
fi

git checkout main
git branch -D "$current_branch"
echo "Deleted branch $current_branch and returned to main." 