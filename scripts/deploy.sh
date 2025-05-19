#!/bin/bash

# WhatsApp API VPS Deployment Script

set -e

echo "Starting WhatsApp API deployment..."

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Build and start services
echo "Building Docker image..."
docker-compose build

echo "Starting services..."
docker-compose up -d

# Wait for service to be ready
echo "Waiting for service to start..."
sleep 10

# Check health
echo "Checking service health..."
curl -f http://localhost:3000/health || {
    echo "Service health check failed!"
    docker-compose logs
    exit 1
}

echo "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure Nginx reverse proxy"
echo "2. Set up SSL with Let's Encrypt"
echo "3. Configure firewall"
echo "4. Run security hardening script"
echo ""
echo "Service is running at: http://localhost:3000"