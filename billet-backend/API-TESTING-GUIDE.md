# 🧪 Complete API Testing Guide

## Prerequisites
- Server running on `http://localhost:8000`
- Postman or similar API testing tool
- Admin and seller accounts in database

---

## 🏁 **STEP 1: Health Check**

### Test Server Status
```bash
GET http://localhost:8000/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-05T...",
  "uptime": 123.45,
  "environment": "development",
  "version": "1.0.0"
}
```

---

## 🔐 **STEP 2: Authentication**

### 2.1 Admin Login
```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "admin@yourdomain.com",
  "password": "your-admin-password"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "admin-uuid",
    "role": "admin",
    "email": "admin@yourdomain.com"
  }
}
```

**Save the admin token as `ADMIN_TOKEN`**

### 2.2 Seller Login (if you have one)
```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "seller@test.com",
  "password": "seller-password"
}
```

**Save the seller token as `SELLER_TOKEN`**

---

## 🎪 **STEP 3: Events Management (Admin)**

### 3.1 Create Event
```bash
POST http://localhost:8000/api/events
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Movie Night 2025",
  "description": "Special New Year screening",
  "event_date": "2025-12-31T20:00:00Z",
  "location": "Cinema Hall 1",
  "max_capacity": 100
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "event-uuid",
    "name": "Movie Night 2025",
    "max_capacity": 100,
    "tickets_sold": 0
  }
}
```

**Save the event ID as `EVENT_ID`**

### 3.2 Get All Events
```bash
GET http://localhost:8000/api/events
Authorization: Bearer ADMIN_TOKEN
```

### 3.3 Get Specific Event
```bash
GET http://localhost:8000/api/events/EVENT_ID
```

### 3.4 Update Event
```bash
PUT http://localhost:8000/api/events/EVENT_ID
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "max_capacity": 150,
  "description": "Updated description"
}
```

---

## 👥 **STEP 4: Seller Management (Admin)**

### 4.1 Create Seller
```bash
POST http://localhost:8000/api/admin/sellers/create
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Test Seller",
  "email": "testseller@example.com",
  "password": "password123",
  "quota": 50,
  "eventId": "EVENT_ID"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "seller-uuid",
    "name": "Test Seller",
    "email": "testseller@example.com",
    "quota": 50
  }
}
```

**Save the seller ID as `SELLER_ID`**

### 4.2 Get All Sellers
```bash
GET http://localhost:8000/api/admin/sellers
Authorization: Bearer ADMIN_TOKEN
```

### 4.3 Update Seller Quota
```bash
PUT http://localhost:8000/api/admin/sellers/SELLER_ID/quota
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "quota": 75
}
```

### 4.4 Revoke Seller
```bash
POST http://localhost:8000/api/admin/sellers/SELLER_ID/revoke
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{}
```

### 4.5 Restore Seller
```bash
POST http://localhost:8000/api/admin/sellers/SELLER_ID/restore
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{}
```

---

## 🎫 **STEP 5: Ticket Generation (Seller)**

### 5.1 Login as Seller (use created seller)
```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "testseller@example.com",
  "password": "password123"
}
```

**Save the seller token as `SELLER_TOKEN`**

### 5.2 Generate Ticket
```bash
POST http://localhost:8000/api/tickets/generate
Authorization: Bearer SELLER_TOKEN
Content-Type: application/json

{
  "buyerName": "John Doe",
  "buyerPhone": "+1234567890",
  "buyerEmail": "john@example.com",
  "ticketPrice": 25.50
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "ticket-uuid",
    "ticket_number": "TKT-123456789",
    "cryptic_code": "ABC123DEF456GHIJ",
    "downloadToken": "download-token",
    "downloadUrl": "http://localhost:3000/ticket/ticket-uuid/download-token"
  }
}
```

**Save:**
- `TICKET_ID` = ticket UUID
- `CRYPTIC_CODE` = cryptic code
- `DOWNLOAD_TOKEN` = download token

### 5.3 Get Seller's Tickets
```bash
GET http://localhost:8000/api/tickets/seller
Authorization: Bearer SELLER_TOKEN
```

### 5.4 Get Ticket Full Data
```bash
GET http://localhost:8000/api/tickets/TICKET_ID/full-data
Authorization: Bearer SELLER_TOKEN
```

---

## 📤 **STEP 6: Share System (Seller)**

### 6.1 Get Share Methods
```bash
GET http://localhost:8000/api/share/methods
Authorization: Bearer SELLER_TOKEN
```

### 6.2 Share via Email
```bash
POST http://localhost:8000/api/share/send-link
Authorization: Bearer SELLER_TOKEN
Content-Type: application/json

{
  "ticketId": "TICKET_ID",
  "contactMethod": "email",
  "contactInfo": "buyer@example.com",
  "customMessage": "Here's your ticket!"
}
```

### 6.3 Share via WhatsApp
```bash
POST http://localhost:8000/api/share/send-link
Authorization: Bearer SELLER_TOKEN
Content-Type: application/json

{
  "ticketId": "TICKET_ID",
  "contactMethod": "whatsapp",
  "contactInfo": "+1234567890"
}
```

---

## 🌍 **STEP 7: Public Access (No Auth)**

### 7.1 View Ticket (Public)
```bash
GET http://localhost:8000/api/public/ticket/TICKET_ID/DOWNLOAD_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "number": "TKT-123456789",
      "buyerName": "John Doe",
      "price": 25.50
    },
    "event": {
      "name": "Movie Night 2025",
      "date": "2025-12-31T20:00:00Z"
    },
    "access": {
      "remainingSeconds": 598,
      "remainingMinutes": 9,
      "isExpired": false
    }
  }
}
```

### 7.2 Check Timer Status
```bash
GET http://localhost:8000/api/public/timer/DOWNLOAD_TOKEN
```

### 7.3 Download PDF
```bash
GET http://localhost:8000/api/public/download/TICKET_ID/DOWNLOAD_TOKEN
```

**Expected:** PDF file download

### 7.4 Validate Access
```bash
GET http://localhost:8000/api/public/validate/TICKET_ID/DOWNLOAD_TOKEN
```

---

## 🔍 **STEP 8: QR Verification (Admin)**

### 8.1 Get Scanner Interface
```bash
GET http://localhost:8000/api/qr/scanner
Authorization: Bearer ADMIN_TOKEN
```

### 8.2 Verify QR Code
```bash
POST http://localhost:8000/api/qr/verify
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "crypticCode": "CRYPTIC_CODE",
  "scanLocation": "Main Entrance"
}
```

**Expected Response (First Scan):**
```json
{
  "success": true,
  "status": "valid_first_scan",
  "message": "Ticket verified successfully - Entry granted",
  "data": {
    "ticketNumber": "TKT-123456789",
    "buyerName": "John Doe",
    "event": {
      "name": "Movie Night 2025"
    }
  }
}
```

### 8.3 Verify Same Code Again (Should show used)
```bash
POST http://localhost:8000/api/qr/verify
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "crypticCode": "CRYPTIC_CODE"
}
```

**Expected Response:**
```json
{
  "success": false,
  "status": "already_used",
  "message": "Ticket already used - Duplicate scan detected"
}
```

### 8.4 Get Scan History
```bash
GET http://localhost:8000/api/qr/scan-history
Authorization: Bearer ADMIN_TOKEN
```

---

## 📊 **STEP 9: Admin Dashboard**

### 9.1 Get Dashboard Data
```bash
GET http://localhost:8000/api/admin/dashboard
Authorization: Bearer ADMIN_TOKEN
```

### 9.2 Get All System Tickets
```bash
GET http://localhost:8000/api/admin/all-tickets
Authorization: Bearer ADMIN_TOKEN
```

### 9.3 Get Event Statistics
```bash
GET http://localhost:8000/api/events/EVENT_ID/stats
Authorization: Bearer ADMIN_TOKEN
```

---

## 🔄 **STEP 10: Advanced Features**

### 10.1 Regenerate Download Link
```bash
POST http://localhost:8000/api/tickets/regenerate-link
Authorization: Bearer SELLER_TOKEN
Content-Type: application/json

{
  "ticketId": "TICKET_ID",
  "contactMethod": "email",
  "contactInfo": "buyer@example.com"
}
```

### 10.2 Get Seller Stats
```bash
GET http://localhost:8000/api/tickets/my-tickets/stats
Authorization: Bearer SELLER_TOKEN
```

### 10.3 Assign Seller to Event
```bash
POST http://localhost:8000/api/events/EVENT_ID/assign-seller
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "sellerId": "SELLER_ID"
}
```

---

## ✅ **Testing Checklist**

### Authentication ✓
- [ ] Admin login works
- [ ] Seller login works
- [ ] Invalid credentials rejected
- [ ] Token refresh works

### Events Management ✓
- [ ] Create event works
- [ ] Get events works (public/admin/seller views)
- [ ] Update event works
- [ ] Event stats work

### Seller Management ✓
- [ ] Create seller works
- [ ] Get sellers works
- [ ] Update quota works
- [ ] Revoke/restore works

### Ticket System ✓
- [ ] Generate ticket works
- [ ] Get seller tickets works
- [ ] Ticket full data works
- [ ] Regenerate link works

### Share System ✓
- [ ] Email share works (or simulated)
- [ ] WhatsApp share works
- [ ] SMS share works

### Public Access ✓
- [ ] View ticket works
- [ ] Timer countdown works
- [ ] PDF download works
- [ ] Access validation works

### QR Verification ✓
- [ ] First scan marks as used
- [ ] Second scan shows already used
- [ ] Invalid codes rejected
- [ ] Scan history logged

### Admin Dashboard ✓
- [ ] Dashboard data loads
- [ ] All tickets view works
- [ ] Event statistics work

---

## 🚨 **Common Issues & Solutions**

### 1. "Token expired" errors
- Re-login to get fresh token
- Check JWT_EXPIRE setting

### 2. "Ticket not found" errors
- Verify ticket ID is correct
- Check seller owns the ticket

### 3. "Download link expired" errors
- Links expire in 10 minutes
- Regenerate new link

### 4. Email not sending
- Check EMAIL_PASS in .env
- Verify email service setup

### 5. QR verification fails
- Ensure cryptic code is exactly 16 characters
- Check admin role permissions

---

## 📝 **Test Results Template**

```
✅ PASSED | ❌ FAILED | ⚠️ PARTIAL

[ ] Health Check
[ ] Admin Login
[ ] Seller Login
[ ] Create Event
[ ] Create Seller
[ ] Generate Ticket
[ ] Share Ticket
[ ] Public View
[ ] QR Verify (First)
[ ] QR Verify (Duplicate)
[ ] Admin Dashboard
[ ] Download PDF
```

**Start testing from Step 1 and work through each step systematically!**