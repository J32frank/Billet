# Production Email Setup Guide

## SendGrid Setup (Recommended)

### 1. Create SendGrid Account
- Go to https://sendgrid.com
- Sign up for free account (100 emails/day free)

### 2. Create API Key
- Dashboard → Settings → API Keys
- Create API Key with "Full Access"
- Copy the key (starts with `SG.`)

### 3. Update .env for SendGrid
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your-actual-sendgrid-api-key
```

### 4. Verify Sender Identity
- Settings → Sender Authentication
- Verify your email domain or single sender

## Gmail Production Setup

### 1. Enable 2-Factor Authentication
- Google Account → Security → 2-Step Verification

### 2. Generate App Password
- Security → 2-Step Verification → App passwords
- Select "Mail" → "Other (Custom name)" → "Billet Platform"
- Copy 16-digit password (remove spaces)

### 3. Update .env for Gmail
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=eventsellertest@gmail.com
EMAIL_PASS=your16digitapppassword
```

## Environment Variables for Production

### Required for Production
```
NODE_ENV=production
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key
FRONTEND_URL=https://yourdomain.com
```

### Security Notes
- Never commit real credentials to git
- Use environment variables in deployment
- Consider using AWS SES for high volume
- Monitor email delivery rates