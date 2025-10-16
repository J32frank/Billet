# 🚀 Vercel Deployment Guide for Billet Platform

## Overview

The Billet Platform is now configured for seamless deployment on Vercel. This setup includes both the React frontend and Node.js/Express backend deployed as a single Vercel project.

## Files Created/Modified

### Configuration Files
- **`vercel.json`** - Vercel deployment configuration
- **`api/server.js`** - Vercel API route wrapper
- **`.vercelignore`** - Files to exclude from deployment
- **`billet-backend/package.json`** - Added Vercel build script
- **`billet-frontend/package.json`** - Added Vercel build script

## Deployment Steps

### 1. Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Supabase project set up

### 2. Environment Variables Setup

In your Vercel dashboard, add these environment variables:

#### Required Variables
```
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
FRONTEND_URL=https://your-vercel-app.vercel.app
```

#### Frontend Variables (if needed)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://your-vercel-app.vercel.app/api
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### 4. Database Setup

Run these SQL commands in your Supabase dashboard:

```sql
-- Ensure all required columns exist
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE download_tokens ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_seller_status ON tickets(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_event_status ON tickets(event_id, status);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires ON download_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_scan_logs_ticket ON scan_logs(ticket_id);

-- Create admin user (replace with your details)
INSERT INTO sellers (name, email, username, password_hash, role, quota, is_active)
VALUES (
  'Admin User',
  'admin@yourdomain.com',
  'admin',
  '$2b$10$your-hashed-password',
  'admin',
  999999,
  true
) ON CONFLICT (email) DO NOTHING;
```

## Architecture Overview

### Vercel Configuration
- **Frontend**: Static site served from `billet-frontend/dist`
- **Backend**: Serverless functions under `/api/*` routes
- **Routing**: All `/api/*` requests go to backend, everything else to frontend

### File Structure for Vercel
```
/
├── api/
│   └── server.js          # Vercel API route wrapper
├── billet-frontend/       # React app
├── billet-backend/        # Express server
├── vercel.json           # Deployment config
└── .vercelignore         # Files to exclude
```

## API Routes

All backend routes are accessible under `/api/`:

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `GET /api/admin/dashboard` - Admin dashboard
- `POST /api/tickets/generate` - Generate tickets
- `GET /api/events` - List events
- And all other backend routes...

## Environment Variables

### Vercel Environment Variable Types
- **Production**: Apply to production deployments
- **Preview**: Apply to preview deployments
- **Development**: Apply to local development

### Sensitive Variables
- Store API keys and secrets as "Secret" type in Vercel
- Never commit `.env` files to git

## Build Configuration

### Frontend Build
- Uses Vite for building
- Output directory: `billet-frontend/dist`
- Includes PWA capabilities

### Backend Build
- No build step required (pure Node.js)
- Dependencies installed automatically by Vercel

## Monitoring & Logs

### Vercel Dashboard
- View deployment logs
- Monitor function performance
- Check error rates
- Real-time metrics

### Health Checks
```bash
# Check if deployment is healthy
curl https://your-app.vercel.app/api/health
```

## Custom Domain (Optional)

1. Go to Vercel dashboard → Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `FRONTEND_URL` environment variable

## Troubleshooting

### Common Issues

#### Build Failures
- Check that all dependencies are listed in `package.json`
- Verify environment variables are set
- Check build logs in Vercel dashboard

#### API Timeouts
- Vercel serverless functions have a 30-second timeout
- Optimize long-running operations
- Consider using Vercel Pro for longer timeouts

#### CORS Issues
- Ensure `FRONTEND_URL` matches your Vercel domain
- Check CORS configuration in backend

#### Database Connection
- Verify Supabase credentials
- Check database URL format
- Ensure Supabase project allows connections from Vercel

### Local Testing
```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Test locally
vercel dev
```

## Performance Optimization

### Vercel Features
- **Edge Network**: Global CDN for static assets
- **Serverless Functions**: Auto-scaling backend
- **Caching**: Automatic caching headers

### Best Practices
- Use environment variables for configuration
- Optimize images and assets
- Implement proper caching strategies
- Monitor function cold starts

## Security Considerations

### Vercel Security
- Automatic HTTPS
- DDoS protection
- Web Application Firewall

### Application Security
- Strong JWT secrets
- Input validation
- Rate limiting
- Secure headers (Helmet.js)

## Cost Optimization

### Vercel Pricing
- **Hobby Plan**: Free for personal projects
- **Pro Plan**: $20/month for commercial use
- **Enterprise**: Custom pricing

### Optimization Tips
- Minimize serverless function bundle size
- Use appropriate function regions
- Optimize database queries
- Implement caching

## Support

For Vercel-specific issues:
- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://vercel.com/discord

For Billet Platform issues:
- Check application logs in Vercel dashboard
- Review API testing guide in `billet-backend/API-TESTING-GUIDE.md`
- Contact development team

---

## Quick Deployment Checklist

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Environment variables configured
- [ ] Supabase database set up
- [ ] Email service configured
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Health checks passing
- [ ] Admin account created
- [ ] Testing completed

## Commands Reference

```bash
# Deploy
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Local development
vercel dev

# Remove deployment
vercel rm
