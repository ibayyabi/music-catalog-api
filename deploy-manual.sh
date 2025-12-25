#!/bin/bash

# Music Catalog API - Manual Deployment to STB (No Docker Required)
# Usage: ./deploy-manual.sh <stb-ip> <stb-user>

set -e  # Exit on error

STB_IP=$1
STB_USER=$2
STB_PATH="/opt/music-api"

if [ -z "$STB_IP" ] || [ -z "$STB_USER" ]; then
    echo "Usage: ./deploy-manual.sh <stb-ip> <stb-user>"
    echo "Example: ./deploy-manual.sh 192.168.100.37 root"
    exit 1
fi

echo "========================================="
echo "Music Catalog API - Manual Deployment"
echo "========================================="
echo "Target: $STB_USER@$STB_IP"
echo "Path: $STB_PATH"
echo ""

# Step 1: Create deployment package
echo "Step 1: Creating deployment package..."
tar -czf deploy-package.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=result.md \
    --exclude=.env \
    .

echo "Package size: $(du -h deploy-package.tar.gz | cut -f1)"

# Step 2: Transfer to STB
echo ""
echo "Step 2: Transferring to STB..."
scp deploy-package.tar.gz $STB_USER@$STB_IP:/tmp/

# Step 3: Deploy on STB
echo ""
echo "Step 3: Deploying on STB..."
ssh $STB_USER@$STB_IP << 'ENDSSH'
    set -e
    
    echo "Creating directory..."
    sudo mkdir -p /opt/music-api
    cd /opt/music-api
    
    echo "Extracting files..."
    sudo tar -xzf /tmp/deploy-package.tar.gz
    
    echo "Setting permissions..."
    sudo chown -R $USER:$USER /opt/music-api
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found! Installing..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    echo "Node.js version: $(node -v)"
    echo "npm version: $(npm -v)"
    
    # Install production dependencies
    echo ""
    echo "Installing dependencies (this may take a few minutes)..."
    npm ci --only=production --no-audit --no-fund
    
    # Create .env from example if not exists
    if [ ! -f .env ]; then
        echo ""
        echo "Creating .env file from template..."
        cp .env.example .env
        
        # Optimize for STB
        sed -i 's/DB_CONNECTION_LIMIT=5/DB_CONNECTION_LIMIT=2/' .env
        sed -i 's/DB_QUEUE_LIMIT=10/DB_QUEUE_LIMIT=5/' .env
        sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env
        
        echo "⚠️  IMPORTANT: Edit .env file with your database credentials!"
        echo "   Run: nano /opt/music-api/.env"
    fi
    
    # Create systemd service
    echo ""
    echo "Creating systemd service..."
    sudo tee /etc/systemd/system/music-api.service > /dev/null << 'EOF'
[Unit]
Description=Music Catalog API for STB
After=network.target mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/music-api
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10

# Resource limits for STB
MemoryLimit=256M
CPUQuota=50%

StandardOutput=journal
StandardError=journal
SyslogIdentifier=music-api

[Install]
WantedBy=multi-user.target
EOF
    
    # Replace $USER with actual username
    sudo sed -i "s/\$USER/$USER/g" /etc/systemd/system/music-api.service
    
    # Reload systemd
    echo "Reloading systemd..."
    sudo systemctl daemon-reload
    
    # Enable service
    echo "Enabling service..."
    sudo systemctl enable music-api
    
    # Cleanup
    rm /tmp/deploy-package.tar.gz
    
    echo ""
    echo "========================================="
    echo "✅ Deployment Complete!"
    echo "========================================="
    echo ""
    echo "📝 Next Steps:"
    echo "1. Edit configuration:"
    echo "   nano /opt/music-api/.env"
    echo ""
    echo "2. Update database settings:"
    echo "   - DB_HOST (localhost or remote IP)"
    echo "   - DB_PASSWORD"
    echo "   - DB_NAME (music_db)"
    echo "   - DB_TABLE (tabel_musik)"
    echo "   - API_KEY (change to secure key)"
    echo ""
    echo "3. Start service:"
    echo "   sudo systemctl start music-api"
    echo ""
    echo "4. Check status:"
    echo "   sudo systemctl status music-api"
    echo ""
    echo "5. View logs:"
    echo "   sudo journalctl -u music-api -f"
    echo ""
    echo "6. Test API:"
    echo "   curl http://localhost:3000/health"
    echo ""
ENDSSH

# Cleanup local files
echo ""
echo "Cleaning up local files..."
rm deploy-package.tar.gz

echo ""
echo "========================================="
echo "✅ Deployment Script Complete!"
echo "========================================="
echo ""
echo "📍 API Location: $STB_USER@$STB_IP:$STB_PATH"
echo "🌐 Access at: http://$STB_IP:3000 (after starting service)"
echo ""
echo "🔧 To configure and start:"
echo "   ssh $STB_USER@$STB_IP"
echo "   nano /opt/music-api/.env"
echo "   sudo systemctl start music-api"
echo "   sudo systemctl status music-api"
echo ""
