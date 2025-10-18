# 🚀 Production Setup Guide

## 1. Environment Configuration

### Production .env
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

# Email (Choose one)
# Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OR SendGrid (Recommended)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key

# Frontend
FRONTEND_URL=https://yourdomain.com
```

## 2. Database Final Setup

Run these SQL commands in Supabase:

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

## 3. Security Checklist

### ✅ JWT Security
- [ ] Strong JWT_SECRET (min 32 characters)
- [ ] Reasonable token expiry (7 days max)
- [ ] HTTPS only in production

### ✅ Database Security
- [ ] Service role key secured
- [ ] Row Level Security enabled
- [ ] Backup strategy in place

### ✅ API Security
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Helmet security headers
- [ ] Input validation on all endpoints

## 4. Performance Optimization

### Database Indexes (Already included above)
- Ticket lookups by seller/event/status
- Download token expiry checks
- QR scan history

### Caching Strategy
```javascript
// Add to app.js for static assets
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));
```

## 5. Deployment Options

### Option A: Railway
1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically

### Option B: Heroku
1. `heroku create your-app-name`
2. `heroku config:set NODE_ENV=production`
3. Add all environment variables
4. `git push heroku main`

### Option C: DigitalOcean App Platform
1. Connect GitHub repo
2. Configure environment variables
3. Deploy with auto-scaling

### Option D: VPS (Ubuntu)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone your-repo
cd billet-backend
npm install --production

# Start with PM2
pm2 start server.js --name "billet-api"
pm2 startup
pm2 save
```

## 6. Monitoring & Health Checks

### Health Check Endpoint
```javascript
// Add to app.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### PM2 Monitoring
```bash
pm2 monit
pm2 logs billet-api
pm2 restart billet-api
```

## 7. SSL/HTTPS Setup

### With Nginx (VPS)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 8. Backup Strategy

### Database Backups
- Supabase automatic backups (enabled by default)
- Manual exports for critical data

### Code Backups
- GitHub repository
- Environment variables documented securely

## 9. Testing Checklist

### API Endpoints
- [ ] Authentication works
- [ ] Ticket generation works
- [ ] QR verification works
- [ ] Public ticket access works
- [ ] Admin panel functions work
- [ ] Email sending works

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Test ticket generation
artillery quick --count 10 --num 5 https://yourapi.com/api/tickets/generate
```

## 10. Go-Live Checklist

### Pre-Launch
- [ ] All environment variables set
- [ ] Database migrations complete
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Email service configured
- [ ] Admin account created

### Post-Launch
- [ ] Monitor error logs
- [ ] Test all critical flows
- [ ] Set up alerts for downtime
- [ ] Document API for frontend team

## 11. Maintenance

### Regular Tasks
- Monitor disk space
- Check error logs weekly
- Update dependencies monthly
- Backup database regularly

### Scaling Considerations
- Database connection pooling
- Redis for session storage
- Load balancer for multiple instances
- CDN for static assets

---

## Quick Start Commands

```bash
# Production deployment
npm install --production
NODE_ENV=production npm start

# With PM2
pm2 start server.js --name billet-api --env production

# Health check
curl https://yourapi.com/health
```