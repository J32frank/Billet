#!/bin/bash

echo "🚀 Starting Billet Platform Admin Stats Setup..."

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

# Check if we're in the right directory
if [ ! -d "billet-backend" ] || [ ! -d "billet-frontend" ]; then
    print_error "Please run this script from the billet-platform root directory"
    exit 1
fi

print_status "Checking backend dependencies..."
cd billet-backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Installing backend dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error "Backend .env file not found! Please create it with required environment variables."
    exit 1
fi

print_success "Backend dependencies ready"

# Start backend server
print_status "Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    print_success "Backend server is running on port 8000"
else
    print_error "Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Switch to frontend
cd ../billet-frontend

print_status "Checking frontend dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Installing frontend dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error "Frontend .env file not found! Please create it with required environment variables."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

print_success "Frontend dependencies ready"

# Start frontend server
print_status "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

print_success "🎉 Billet Platform is now running!"
echo ""
print_status "📊 Admin Stats Page: http://localhost:5173/admin/stats"
print_status "🔧 Backend API: http://localhost:8000"
print_status "🌐 Frontend: http://localhost:5173"
echo ""
print_status "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait