#!/bin/bash

echo "🔧 Fixing React dependencies and module resolution issues..."

# Remove node_modules and package-lock.json
echo "📦 Cleaning up existing dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install dependencies with exact versions
echo "⬇️ Installing compatible dependencies..."
npm install

# Clear Vite cache
echo "🗑️ Clearing Vite cache..."
rm -rf .vite

echo "✅ Dependencies fixed! You can now run 'npm run dev' to start the development server."
