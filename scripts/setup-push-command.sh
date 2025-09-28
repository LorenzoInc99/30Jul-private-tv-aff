#!/bin/bash

# Setup script to make the custom push command available globally
# This script creates a symlink so you can use 'push' from anywhere

echo "🔧 Setting up custom push command..."

# Check if the push file exists
if [ ! -f "push" ]; then
    echo "⚠️  push file not found. Please run this from the project root."
    exit 1
fi

# Make sure it's executable
chmod +x push

# Create a symlink in /usr/local/bin (requires sudo)
echo "🔗 Creating global symlink for 'push' command..."
echo "   This will allow you to use 'push' from anywhere in your system"

# Check if user wants to create global symlink
read -p "Do you want to create a global 'push' command? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if sudo ln -sf "$(pwd)/push" /usr/local/bin/push; then
        echo "✅ Global 'push' command created successfully!"
        echo "   You can now use 'push' from anywhere in your system"
    else
        echo "❌ Failed to create global symlink. You can still use './push' from this directory"
    fi
else
    echo "ℹ️  Skipping global symlink. You can use './push' from this directory"
fi

echo ""
echo "📝 Usage:"
echo "   ./push          # Use from project directory"
echo "   push            # Use from anywhere (if global symlink created)"
echo ""
echo "✅ Setup complete!"


