#!/bin/bash
# Usage: ./finish-feature.sh

current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ]; then
  echo "You are already on main. Nothing to merge."
  exit 1
fi

git add .
git commit -m "Finish feature: $current_branch"
git checkout main
git merge "$current_branch"
echo "Merged $current_branch into main." 