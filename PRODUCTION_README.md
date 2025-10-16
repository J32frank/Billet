# 🚀 Billet Platform - Production Deployment Guide

## Overview

This guide covers setting up the Billet Platform for production deployment. The platform consists of a Node.js/Express backend and a React/Vite frontend, designed for secure ticket generation and management.

## Quick Start

### Option 1: Simple PM2 Deployment
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option 2: Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or with Nginx reverse proxy
docker-compose --profile nginx up -d
```

## Environment Setup

### Required Environment Variables

Create `.env` files in both `billet-backend/` and `billet-frontend/` directories:

#### Backend (.env)
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRE=7d

# Server
NODE_ENV=production
PORT=8000

# Email (SendGrid recommended)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key

# Frontend
FRONTEND_URL=https://yourdomain.com
```

#### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://yourdomain.com/api
```

## Deployment Options

### 1. VPS/Cloud Server (Recommended)

#### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Run deployment script
./deploy.sh

# Check status
pm2 status
pm2 logs billet-backend
```

#### Manual Setup
```bash
# Backend
cd billet-backend
npm install --production
NODE_ENV=production npm start

# Frontend (in another terminal)
cd billet-frontend
npm install
npm run build
npm run preview
```

### 2. Docker Deployment

#### Build and Run
```bash
# Build image
docker build -t billet-platform .

# Run container
docker run -d \
  --name billet-app \
  -p 8000:8000 \
  --env-file billet-backend/.env \
  billet-platform
```

#### Using Docker Compose
```bash
# Start services
docker-compose up -d

# With Nginx
docker-compose --profile nginx up -d

# Check logs
docker-compose logs -f
```

### 3. Cloud Platforms

#### Railway
1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_url
# ... set other vars

# Deploy
git push heroku main
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Set run command: `npm start`

## Database Setup

### Supabase Configuration

1. Create project at https://supabase.com
2. Run the SQL scripts in `billet-backend/admin-database-updates.sql`
3. Update environment variables with your Supabase credentials

### Database Indexes (Performance)

The following indexes are created automatically:
- `idx_tickets_seller_status` - Ticket lookups by seller and status
- `idx_tickets_event_status` - Ticket lookups by event and status
- `idx_download_tokens_expires` - Download token expiry checks
- `idx_scan_logs_ticket` - QR scan history

## Email Configuration

### SendGrid (Recommended)
1. Sign up at https://sendgrid.com
2. Create API key with full access
3. Verify sender identity
4. Update `.env` with SendGrid credentials

### Gmail (Development Only)
1. Enable 2-factor authentication
2. Generate app password
3. Update `.env` with Gmail credentials

## Security Checklist

- [ ] JWT secret is strong (min 32 characters)
- [ ] Environment variables are not committed to git
- [ ] HTTPS is enabled in production
- [ ] Database credentials are secured
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Helmet security headers are active

## Monitoring & Maintenance

### Health Checks
- Health endpoint: `GET /health`
- Returns server status, uptime, and environment info

### PM2 Commands
```bash
pm2 status                    # Check process status
pm2 logs billet-backend       # View logs
pm2 restart billet-backend    # Restart application
pm2 stop billet-backend       # Stop application
pm2 delete billet-backend     # Remove from PM2
```

### Log Files
- Error logs: `logs/err.log`
- Output logs: `logs/out.log`
- Combined logs: `logs/combined.log`

## Performance Optimization

### Backend
- Production dependencies only (`npm install --production`)
- PM2 clustering for multi-core utilization
- Database connection pooling
- Redis for session storage (future enhancement)

### Frontend
- Vite production build with code splitting
- PWA capabilities enabled
- Static asset optimization
- Lazy loading for routes

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Multiple PM2 instances
- Database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching layers

## Backup Strategy

### Database
- Supabase automatic daily backups
- Manual exports for critical data
- Point-in-time recovery available

### Application
- Git repository as code backup
- Environment variables documented securely
- Configuration files versioned

## Troubleshooting

### Common Issues

#### Backend won't start
- Check environment variables
- Verify database connection
- Check port availability (default: 8000)

#### Frontend build fails
- Ensure Node.js version >= 18
- Check for missing dependencies
- Verify Vite configuration

#### Email not sending
- Verify SendGrid API key
- Check sender verification
- Review SMTP settings

### Logs and Debugging
```bash
# PM2 logs
pm2 logs billet-backend --lines 100

# Docker logs
docker-compose logs billet-app

# Health check
curl https://yourdomain.com/health
```

## Go-Live Checklist

- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Email service tested
- [ ] Admin account created
- [ ] Health checks passing
- [ ] Monitoring alerts set up
- [ ] Backup strategy implemented

## Support

For issues or questions:
1. Check this documentation
2. Review application logs
3. Test API endpoints with the API testing guide
4. Contact development team

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start both dev servers

# Production
./deploy.sh                    # PM2 deployment
docker-compose up -d          # Docker deployment
NODE_ENV=production npm start # Manual start

# Monitoring
pm2 status                     # Process status
pm2 logs billet-backend        # Application logs
curl http://localhost:8000/health  # Health check
