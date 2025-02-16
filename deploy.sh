#!/bin/bash

echo "🚀 Deploying latest changes from GitHub..."

# Navigate to the project directory
cd ~/ThemeBuilder || exit

# Pull latest changes
git reset --hard origin/master
git pull origin master

# Install dependencies
npm install

# Build the application
npm run build

# Restart PM2 process
pm2 restart PrimitiveBuilder

echo "✅ Deployment complete!"

