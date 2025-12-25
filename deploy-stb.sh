#!/bin/bash

# Music Catalog API - STB Deployment Script
# Usage: ./deploy-stb.sh <stb-ip> <stb-user>

set -e  # Exit on error

STB_IP=$1
STB_USER=$2
STB_PATH="/opt/music-api"

if [ -z "$STB_IP" ] || [ -z "$STB_USER" ]; then
    echo "Usage: ./deploy-stb.sh <stb-ip> <stb-user>"
    echo "Example: ./deploy-stb.sh 192.168.1.100 root"
    exit 1
fi

echo "========================================="
echo "Music Catalog API - STB Deployment"
echo "========================================="
echo "Target: $STB_USER@$STB_IP"
echo "Path: $STB_PATH"
echo ""

# Step 1: Build Docker image
echo "Step 1: Building Docker image..."
docker build -t music-catalog-api:latest .

# Step 2: Save image to file
echo "Step 2: Saving Docker image..."
docker save music-catalog-api:latest | gzip > music-api-image.tar.gz

# Step 3: Create deployment package
echo "Step 3: Creating deployment package..."
tar -czf deploy-package.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    .env.example \
    docker-compose.yml \
    scripts/

# Step 4: Transfer to STB
echo "Step 4: Transferring files to STB..."
scp music-api-image.tar.gz $STB_USER@$STB_IP:/tmp/
scp deploy-package.tar.gz $STB_USER@$STB_IP:/tmp/

# Step 5: Deploy on STB
echo "Step 5: Deploying on STB..."
ssh $STB_USER@$STB_IP << 'ENDSSH'
    set -e
    
    # Create directory
    sudo mkdir -p /opt/music-api
    cd /opt/music-api
    
    # Extract deployment package
    sudo tar -xzf /tmp/deploy-package.tar.gz
    
    # Load Docker image
    sudo docker load < /tmp/music-api-image.tar.gz
    
    # Stop existing container
    sudo docker stop music-api 2>/dev/null || true
    sudo docker rm music-api 2>/dev/null || true
    
    # Create .env if not exists
    if [ ! -f .env ]; then
        echo "Creating .env file..."
        cp .env.example .env
        echo "⚠️  Please edit .env with your configuration!"
    fi
    
    # Run container
    echo "Starting container..."
    sudo docker run -d \
        --name music-api \
        --restart unless-stopped \
        -p 3000:3000 \
        --env-file .env \
        --memory="256m" \
        --memory-swap="512m" \
        --cpus="0.5" \
        music-catalog-api:latest
    
    # Wait for startup
    sleep 5
    
    # Check health
    echo "Checking health..."
    curl -s http://localhost:3000/health | jq '.' || echo "Health check failed!"
    
    # Show logs
    echo ""
    echo "Container logs:"
    sudo docker logs --tail 20 music-api
    
    # Cleanup
    rm /tmp/music-api-image.tar.gz
    rm /tmp/deploy-package.tar.gz
    
    echo ""
    echo "✅ Deployment complete!"
    echo "API running at: http://$(hostname -I | awk '{print $1}'):3000"
ENDSSH

# Cleanup local files
echo ""
echo "Step 6: Cleaning up local files..."
rm music-api-image.tar.gz
rm deploy-package.tar.gz

echo ""
echo "========================================="
echo "✅ Deployment Successful!"
echo "========================================="
echo "Access API at: http://$STB_IP:3000"
echo ""
echo "Next steps:"
echo "1. SSH to STB and edit /opt/music-api/.env"
echo "2. Restart container: ssh $STB_USER@$STB_IP 'docker restart music-api'"
echo "3. Monitor: ssh $STB_USER@$STB_IP 'docker logs -f music-api'"
echo ""
