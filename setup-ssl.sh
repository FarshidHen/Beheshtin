#!/bin/bash

# SSL Setup Script for DigitalOcean
# Usage: ./setup-ssl.sh your-domain.com your-email@domain.com

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 myapp.example.com admin@example.com"
    exit 1
fi

echo "🔒 Setting up SSL for domain: $DOMAIN"

# Update nginx.conf with the actual domain
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" nginx.conf

# Update docker-compose.ssl.yml with domain and email
sed -i "s/your-domain.com/$DOMAIN/g" docker-compose.ssl.yml
sed -i "s/your-email@domain.com/$EMAIL/g" docker-compose.ssl.yml

# Create SSL directory
mkdir -p ssl

echo "📋 Steps to complete SSL setup:"
echo ""
echo "1. Point your domain $DOMAIN to this server IP: $(curl -s ifconfig.me)"
echo ""
echo "2. Run the following commands:"
echo "   docker-compose -f docker-compose.ssl.yml up -d nginx"
echo "   docker-compose -f docker-compose.ssl.yml run --rm certbot"
echo "   docker-compose -f docker-compose.ssl.yml restart nginx"
echo ""
echo "3. Test HTTPS: https://$DOMAIN"
echo ""
echo "4. Set up auto-renewal cron job:"
echo "   echo '0 12 * * * /usr/local/bin/docker-compose -f $(pwd)/docker-compose.ssl.yml run --rm certbot renew' | crontab -"

echo ""
echo "✅ SSL configuration files prepared!"
echo "🌐 Make sure $DOMAIN points to $(curl -s ifconfig.me)"
