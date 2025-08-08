# 🔒 SSL Setup Guide for Beheshtin.com

## Step 1: Connect to Your DigitalOcean Server

Go to your DigitalOcean console and open the terminal for your droplet.

## Step 2: Stop Current Containers

```bash
cd /root/voice-content-platform
docker-compose -f docker-compose.ssl.yml down
```

## Step 3: Install Certbot

```bash
apt update
apt install -y certbot
```

## Step 4: Generate SSL Certificates

```bash
# Create directories for certificates
mkdir -p /etc/letsencrypt
mkdir -p /var/www/certbot

# Generate certificates
certbot certonly \
  --standalone \
  --email farshid.hendi@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d beheshtin.com \
  -d www.beheshtin.com
```

## Step 5: Upload Fixed Configuration Files

Copy these files to your server (you can copy and paste the content):

### Create nginx.conf:
```bash
cat > /root/voice-content-platform/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;

    server {
        listen 80;
        server_name beheshtin.com www.beheshtin.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name beheshtin.com www.beheshtin.com;

        # SSL Configuration
        ssl_certificate /etc/letsencrypt/live/beheshtin.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/beheshtin.com/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Rate limiting
        limit_req zone=one burst=5 nodelay;

        location / {
            proxy_pass http://app:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Let's Encrypt challenges
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
    }
}
EOF
```

### Create docker-compose-ssl-fixed.yml:
```bash
cat > /root/voice-content-platform/docker-compose-ssl-fixed.yml << 'EOF'
version: '3.8'

services:
  app:
    image: beheshtin-app
    build: .
    container_name: beheshtin-app
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://beheshtin:securepassword123@db:5432/beheshtin_db
      - NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
      - NEXTAUTH_URL=https://beheshtin.com
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    container_name: beheshtin-db
    environment:
      - POSTGRES_DB=beheshtin_db
      - POSTGRES_USER=beheshtin
      - POSTGRES_PASSWORD=securepassword123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: beheshtin-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
EOF
```

## Step 6: Start the SSL-Enabled Application

```bash
docker-compose -f docker-compose-ssl-fixed.yml up -d
```

## Step 7: Check Status

```bash
docker-compose -f docker-compose-ssl-fixed.yml ps
docker-compose -f docker-compose-ssl-fixed.yml logs nginx
```

## Step 8: Test Your Site

Visit:
- https://beheshtin.com
- https://www.beheshtin.com

## Step 9: Set Up Auto-Renewal (Optional)

```bash
# Add to crontab for automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /root/voice-content-platform/docker-compose-ssl-fixed.yml restart nginx" | crontab -
```

## 🎉 Done!

Your site should now be running with SSL certificates!
