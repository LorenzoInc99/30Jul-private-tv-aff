#!/bin/bash
# Usage: ./push.sh

git add .
git commit -m "Update project files" || echo "Nothing to commit."
git push origin main 