#!/bin/bash

echo "🚀 Deploying Billet Platform to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Installing..."
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Install backend dependencies
print_status "Installing backend dependencies..."
cd billet-backend
npm install --production

# Build frontend
print_status "Building frontend..."
cd ../billet-frontend
npm install
npm run build

# Copy built frontend to backend public directory
print_status "Copying frontend build to backend..."
mkdir -p ../billet-backend/public
cp -r dist/* ../billet-backend/public/

# Go back to root
cd ..

# Start with PM2
print_status "Starting production server with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup (optional)
print_status "Setting up PM2 startup..."
pm2 startup

print_success "🎉 Deployment complete!"
echo ""
print_status "📊 Application is running at: http://localhost:8000"
print_status "🔧 PM2 status: pm2 status"
print_status "📝 PM2 logs: pm2 logs billet-backend"
print_status "🔄 Restart: pm2 restart billet-backend"
echo ""
print_status "To stop: pm2 stop billet-backend"
