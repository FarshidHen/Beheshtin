#!/bin/bash

# DigitalOcean Deployment Script for Voice Content Platform

echo "🚀 Starting deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/voice-content-platform
sudo chown $USER:$USER /opt/voice-content-platform

# Copy application files
echo "📋 Copying application files..."
cp -r . /opt/voice-content-platform/

# Navigate to app directory
cd /opt/voice-content-platform

# Create production environment file
echo "🔧 Creating production environment file..."
cp .env.example .env
echo "Please edit .env file with your production settings"

# Build and start the application
echo "🏗️ Building and starting the application..."
docker-compose up -d --build

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec app npx prisma migrate deploy

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at: http://$(curl -s ifconfig.me):3000"
echo "📝 Don't forget to:"
echo "   1. Edit .env file with your production settings"
echo "   2. Set up a domain name and SSL certificate"
echo "   3. Configure firewall rules"
echo "   4. Set up regular backups"
