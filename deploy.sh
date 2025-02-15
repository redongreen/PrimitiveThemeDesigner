#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20.x if not already installed
echo "🟢 Setting up Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
echo "📊 Installing PM2 process manager..."
sudo npm install -pm2 -g

# Create app directory if it doesn't exist
echo "📁 Setting up application directory..."
sudo mkdir -p /var/www/color-design-system
sudo chown -R $USER:$USER /var/www/color-design-system

# Copy application files
echo "📋 Copying application files..."
cp -r ./* /var/www/color-design-system/

# Navigate to app directory
cd /var/www/color-design-system

# Install dependencies
echo "📦 Installing application dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Start the application with PM2
echo "🚀 Starting the application..."
pm2 start npm --name "color-design-system" -- start

# Save PM2 process list and configure to start on boot
echo "💾 Configuring PM2 startup..."
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

echo "✅ Deployment complete! Your application should now be running."
echo "📝 Note: Make sure to configure your Lightsail instance to allow inbound traffic on port 5000"
