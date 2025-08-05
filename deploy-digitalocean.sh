#!/bin/bash

# DigitalOcean Deployment Script for Beheshtin Voice Content Platform
# Run this script on your DigitalOcean droplet

set -e  # Exit on any error

echo "🚀 Starting Beheshtin deployment on DigitalOcean..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
    print_success "Docker installed successfully"
else
    print_warning "Docker is already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
else
    print_warning "Docker Compose is already installed"
fi

# Create application directory
print_status "Creating application directory..."
mkdir -p /opt/beheshtin
cd /opt/beheshtin

# Clone the repository
print_status "Cloning Beheshtin repository..."
if [ -d ".git" ]; then
    print_warning "Repository already exists, pulling latest changes..."
    git pull origin main
else
    git clone https://github.com/FarshidHen/Beheshtin.git .
fi

# Create production environment file
print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_warning "Please edit .env file with your production settings"
    print_warning "Run: nano .env"
    print_warning "Update the following variables:"
    print_warning "  - DATABASE_URL (use PostgreSQL)"
    print_warning "  - NEXTAUTH_SECRET (generate a strong secret)"
    print_warning "  - NEXTAUTH_URL (your domain or IP)"
else
    print_warning ".env file already exists"
fi

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p public/uploads
chmod 755 public/uploads

# Build and start the application
print_status "Building and starting the application..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for containers to be ready
print_status "Waiting for containers to be ready..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy || {
    print_warning "Migration failed, trying to push schema..."
    docker-compose exec -T app npx prisma db push
}

# Check if application is running
print_status "Checking application status..."
if docker-compose ps | grep -q "Up"; then
    print_success "Application is running successfully!"
else
    print_error "Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

print_success "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "🌐 Application URL: http://$SERVER_IP:3000"
echo "📁 Application Directory: /opt/beheshtin"
echo "�� Docker Status: $(docker-compose ps --format 'table {{.Name}}\t{{.Status}}')"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Edit environment variables: nano /opt/beheshtin/.env"
echo "2. Set up domain name and SSL (optional)"
echo "3. Configure firewall: ufw allow 3000"
echo "4. Set up monitoring and backups"
echo ""
echo "📚 Useful Commands:"
echo "==================="
echo "View logs: docker-compose logs -f"
echo "Restart app: docker-compose restart"
echo "Update app: git pull && docker-compose up -d --build"
echo "Stop app: docker-compose down"
echo ""
print_success "Your Beheshtin platform is now live! 🚀"
