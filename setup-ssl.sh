#!/bin/bash

# SSL Setup Script for Beheshtin.com
set -e

echo "🔧 Setting up SSL certificates for beheshtin.com..."

# Step 1: Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.ssl.yml down 2>/dev/null || true

# Step 2: Start temporary HTTP-only setup
echo "🌐 Starting temporary HTTP setup for certificate generation..."
docker-compose -f docker-compose-temp.yml up -d nginx

# Wait for nginx to start
sleep 10

# Step 3: Generate SSL certificates
echo "🔒 Generating SSL certificates..."
docker-compose -f docker-compose-temp.yml run --rm certbot

# Step 4: Stop temporary setup
echo "📦 Stopping temporary setup..."
docker-compose -f docker-compose-temp.yml down

# Step 5: Start full SSL setup
echo "🚀 Starting full SSL setup..."
docker-compose -f docker-compose.ssl.yml up -d

echo "✅ SSL setup complete!"
echo "🌐 Your site should now be available at:"
echo "   - https://beheshtin.com"
echo "   - https://www.beheshtin.com"