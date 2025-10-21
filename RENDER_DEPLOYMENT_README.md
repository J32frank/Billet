# 🚀 Render Deployment Guide for Billet Platform

## Overview

The Billet Platform is now configured for seamless deployment on Render. This setup includes both the React frontend and Node.js/Express backend deployed as separate services with proper CORS configuration.

## Files Created/Modified

### Configuration Files

- **`render.yaml`** - Render deployment configuration (Blueprint)
- **`billet-backend/app.js`** - Updated CORS configuration for Render
- **`billet-backend/server.js`** - Simplified server startup for Render
- **`billet-frontend/src/services/eventService.js`** - Uses VITE_BILLET_BACKEND_URL
- **`billet-frontend/src/services/ticketService.js`** - Uses VITE_BILLET_BACKEND_URL

## Deployment Steps

### 1. Prerequisites

- Render account (https://render.com)
- GitHub repository connected to Render
- Supabase project set up

### 2. Deploy Using Render Blueprint

#### Option A: Render Blueprint (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Configure environment variables (see below)
6. Click "Create Blueprint" - this will deploy both services

#### Option B: Manual Service Creation

1. Create a **Web Service** for the backend:
   - Runtime: Node
   - Build Command: `cd billet-backend && npm install`
   - Start Command: `cd billet-backend && npm start`
2. Create a **Static Site** for the frontend:
   - Build Command: `cd billet-frontend && npm install && npm run build`
   - Publish Directory: `billet-frontend/dist`

### 3. Environment Variables Setup

#### Backend Environment Variables (billet-backend)

```
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRE=7d

# Server
NODE_ENV=production
PORT=10000

# Email (SendGrid recommended)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key

# Frontend URL (set after frontend deployment)
FRONTEND_URL=https://your-frontend.onrender.com
```

#### Frontend Environment Variables (billet-frontend)

```
# Backend URL (automatically set by Render Blueprint)
VITE_BILLET_BACKEND_URL=https://your-backend.onrender.com
```

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

### Render Configuration

- **Backend**: Node.js web service running Express server
- **Frontend**: Static site served from `billet-frontend/dist`
- **CORS**: Configured to allow requests from frontend domain
- **Environment Variables**: Automatic service linking via Blueprint

### Service Communication

- Frontend automatically gets backend URL via `VITE_BILLET_BACKEND_URL`
- Backend allows CORS from frontend URL via `FRONTEND_URL`
- All API calls use the environment variable for dynamic URL resolution

## API Routes

All backend routes are accessible at your backend service URL:

- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `GET /api/admin/dashboard` - Admin dashboard
- `POST /api/tickets/generate` - Generate tickets
- `GET /api/events` - List events
- And all other backend routes...

## Environment Variables

### Render Environment Variable Types

- **Shared**: Available to all services in the Blueprint
- **Service-specific**: Only available to that service

### Sensitive Variables

- Store API keys and secrets as "Secret" type in Render
- Never commit `.env` files to git

## Build Configuration

### Backend Build

- Uses Node.js runtime
- Dependencies installed via `npm install`
- Starts with `npm start`

### Frontend Build

- Uses static site runtime
- Builds with `npm run build`
- Serves from `dist` directory

## Monitoring & Logs

### Render Dashboard

- View real-time logs for each service
- Monitor response times and error rates
- Check build and deployment status
- Set up alerts for downtime

### Health Checks

```bash
# Check if backend is healthy
curl https://your-backend.onrender.com/health

# Check if frontend is accessible
curl https://your-frontend.onrender.com
```

## Custom Domain (Optional)

### Backend Custom Domain

1. Go to backend service settings
2. Add custom domain
3. Configure DNS records as instructed
4. Update `FRONTEND_URL` in backend environment variables

### Frontend Custom Domain

1. Go to frontend service settings
2. Add custom domain
3. Configure DNS records as instructed

## Troubleshooting

### Common Issues

#### Build Failures

- Check that all dependencies are listed in `package.json`
- Verify build commands are correct
- Check build logs in Render dashboard

#### CORS Issues

- Ensure `FRONTEND_URL` matches your frontend domain exactly
- Check that CORS configuration includes credentials: true
- Verify environment variables are set correctly

#### API Connection Issues

- Check that `VITE_BILLET_BACKEND_URL` is set correctly
- Verify backend service is running and accessible
- Check network connectivity between services

#### Database Connection

- Verify Supabase credentials
- Check database URL format
- Ensure Supabase allows connections from Render IPs

### Local Testing

```bash
# Test backend locally
cd billet-backend
npm install
npm run dev

# Test frontend locally
cd billet-frontend
npm install
npm run dev
```

## Performance Optimization

### Render Features

- **Global CDN**: Automatic CDN for static assets
- **Auto-scaling**: Services scale based on traffic
- **Caching**: Built-in caching for static content

### Best Practices

- Use environment variables for configuration
- Optimize images and assets
- Implement proper caching strategies
- Monitor service performance

## Security Considerations

### Render Security

- Automatic HTTPS for all services
- DDoS protection
- Web Application Firewall

### Application Security

- Strong JWT secrets
- Input validation
- Rate limiting (consider implementing)
- Secure headers (Helmet.js configured)

## Cost Optimization

### Render Pricing

- **Free Tier**: 750 hours/month, suitable for development
- **Paid Plans**: From $7/month for web services
- **Static Sites**: Always free

### Optimization Tips

- Use free tier for development/testing
- Monitor usage to avoid unexpected charges
- Optimize build times
- Use appropriate instance types

## Support

For Render-specific issues:

- Render Documentation: https://docs.render.com
- Render Community: https://community.render.com

For Billet Platform issues:

- Check service logs in Render dashboard
- Review API testing guide in `billet-backend/API-TESTING-GUIDE.md`
- Contact development team

---

## Quick Deployment Checklist

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Blueprint deployed successfully
- [ ] Environment variables configured
- [ ] Supabase database set up
- [ ] Email service configured
- [ ] CORS configured correctly
- [ ] Health checks passing
- [ ] Admin account created
- [ ] Testing completed

## Commands Reference

```bash
# Deploy via CLI (if needed)
render deploy

# Check deployment status
render services

# View logs
render logs <service-id>

# Update environment variables
render env set <key>=<value>
```

## Post-Deployment Steps

1. **Update CORS**: After both services are deployed, update the `FRONTEND_URL` in the backend service to match your frontend URL
2. **Test API**: Verify that the frontend can communicate with the backend
3. **Database Migration**: Run any pending database migrations
4. **Admin Setup**: Create admin accounts and set up initial data
5. **Monitoring**: Set up monitoring and alerts as needed

---

**Note**: The `render.yaml` Blueprint automatically handles service linking and environment variable configuration. Make sure to review and adjust the configuration as needed for your specific requirements.
