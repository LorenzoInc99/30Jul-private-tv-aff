#!/bin/bash
# Usage: ./start-feature.sh "short-description-of-change"

if [ -z "$1" ]; then
  echo "Please provide a short description for the branch."
  exit 1
fi

git add .
git commit -m "Save before starting: $1"
branch="feature-$(date +%Y%m%d-%H%M%S)-${1// /-}"
git checkout -b "$branch"
echo "Switched to new branch: $branch" 