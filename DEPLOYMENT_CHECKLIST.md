# 🚀 CarX Deployment Checklist

## Pre-Deployment Checklist

### ✅ Backend (Vercel) Preparation
- [ ] `vercel.json` file created
- [ ] Environment variables documented in `.env.production`
- [ ] CORS origins updated for production
- [ ] Test routes added for email/PDF testing
- [ ] Package.json scripts updated for Vercel

### ✅ Frontend (Netlify) Preparation  
- [ ] `netlify.toml` file created
- [ ] Production environment variables set
- [ ] Build command configured (`npm run build`)
- [ ] Publish directory set to `dist`

### ✅ Email Configuration Verified
- [ ] Gmail App Password is working
- [ ] Email service environment variables set
- [ ] PDF generation enabled (`ENABLE_PDF_GENERATION=true`)
- [ ] Email templates tested locally

### ✅ Database Configuration
- [ ] MongoDB Atlas connection string updated
- [ ] Database IP whitelist includes `0.0.0.0/0` (for Vercel)
- [ ] Database indexes created
- [ ] Test data populated if needed

## Deployment Steps

### Step 1: Deploy Backend to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from CarX root directory
cd CarX
vercel --prod
```

**Environment Variables to Set in Vercel Dashboard:**
```
MONGO_URI=mongodb+srv://Manoj:Manoj@cluster0.xgyk3wz.mongodb.net/DriveO?retryWrites=true&w=majority
EMAIL_USER=libroflow8@gmail.com
EMAIL_PASS=rcayojhhrhceqrzy
CLOUD_NAME=dmmzaonfy
API_KEY=944475372526799
API_SECRET=kR3bvtWuwHUyu8hmCDGS5ZLvxkk
JWT_SECRET=rent_a_ride_jwt_secret_2024_secure_key_12345
ACCESS_TOKEN=rent_a_ride_access_token_secret_2024_secure_key_67890
REFRESH_TOKEN=rent_a_ride_refresh_token_secret_2024_secure_key_abcdef
ENABLE_PDF_GENERATION=true
PORT=5000
NODE_ENV=production
```

### Step 2: Update Frontend Configuration
```bash
# Update client/.env.production with your Vercel URL
VITE_PRODUCTION_BACKEND_URL=https://your-vercel-app.vercel.app
VITE_API_BASE_URL=https://your-vercel-app.vercel.app/api
```

### Step 3: Deploy Frontend to Netlify
```bash
# Build the frontend
cd CarX/client
npm run build

# Deploy dist folder to Netlify (drag & drop or Git)
```

**Netlify Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `18`

### Step 4: Update CORS in Backend
Update `backend/server.js` with your actual Netlify URL:
```javascript
const allowedOrigins = [
  'https://your-netlify-app.netlify.app', // Your actual Netlify URL
  'http://localhost:5173', // Keep for development
];
```

Redeploy backend: `vercel --prod`

## Post-Deployment Testing

### ✅ Backend Health Check
- [ ] Visit: `https://your-vercel-app.vercel.app/api/health`
- [ ] Should return status: "OK" with database connection info

### ✅ Frontend Connectivity  
- [ ] Visit: `https://your-netlify-app.netlify.app`
- [ ] Check browser console for any errors
- [ ] Verify API calls work (sign in/up)

### ✅ Email Features Testing

#### OTP Email Testing
- [ ] Go to Sign Up page
- [ ] Fill form and submit
- [ ] Check email inbox for OTP
- [ ] Verify OTP validation works
- [ ] Test OTP resend functionality

#### Booking Receipt Email Testing  
- [ ] Create a test booking
- [ ] Check email for booking confirmation
- [ ] Verify PDF attachment is included and opens correctly
- [ ] Check email formatting and content

#### Admin PDF Export Testing
- [ ] Login as admin
- [ ] Go to Bookings/Orders page  
- [ ] Click "Export PDF" button
- [ ] Verify PDF downloads correctly
- [ ] Test different report types (financial, customers, etc.)

#### User Receipt Email Testing
- [ ] Login as user
- [ ] Go to Orders page
- [ ] Click "Send Receipt PDF" button  
- [ ] Check email for PDF receipt
- [ ] Verify PDF content is correct

### ✅ Advanced Email Testing
Use the test endpoints:

#### Test Email Service
```bash
curl -X POST https://your-vercel-app.vercel.app/api/test/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

#### Test PDF Generation
```bash
curl -X POST https://your-vercel-app.vercel.app/api/test/test-pdf \
  --output test-receipt.pdf
```

### ✅ Mobile Responsiveness Testing
- [ ] iPhone Safari (375px, 390px, 430px)
- [ ] Android Chrome (360px, 412px)  
- [ ] iPad Safari (768px, 1024px)
- [ ] Desktop (1920px+)

### ✅ Cross-Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Safari (iOS & macOS)
- [ ] Firefox (desktop & mobile)
- [ ] Edge (desktop)

### ✅ Performance Testing
- [ ] Lighthouse audit (Performance, Accessibility, SEO)
- [ ] Page load times < 3 seconds
- [ ] PDF generation < 10 seconds
- [ ] Email delivery < 30 seconds

## Troubleshooting Guide

### Email Issues
**Problem**: Emails not sending
**Solutions**:
- Check Gmail App Password
- Verify `EMAIL_USER` and `EMAIL_PASS` in Vercel env vars
- Check spam folder
- Test with `/api/test/test-email` endpoint

**Problem**: PDF attachments missing
**Solutions**:
- Verify `ENABLE_PDF_GENERATION=true`
- Check Vercel function timeout (max 30s)
- Test PDF generation with `/api/test/test-pdf`

### CORS Issues
**Problem**: Frontend can't connect to backend
**Solutions**:
- Verify Netlify URL in backend CORS config
- Check browser console for CORS errors
- Ensure `credentials: true` is set
- Redeploy backend after CORS changes

### Database Issues  
**Problem**: Database connection fails
**Solutions**:
- Verify MongoDB Atlas connection string
- Check IP whitelist includes `0.0.0.0/0`
- Test connection with `/api/health` endpoint
- Check Vercel environment variables

### PDF Generation Issues
**Problem**: PDFs fail to generate
**Solutions**:
- Check Vercel function timeout
- Verify Puppeteer compatibility
- Test with simplified PDF content
- Check memory usage limits

## Success Criteria

### ✅ All Features Working
- [ ] User registration with OTP email ✉️
- [ ] User login and authentication 🔐
- [ ] Vehicle booking flow 🚗
- [ ] Booking confirmation emails with PDF 📧
- [ ] Admin dashboard access 👨‍💼
- [ ] Admin PDF exports (bookings, financial, customers) 📊
- [ ] User order management 📋
- [ ] Email receipt sending from orders 📨
- [ ] Responsive design on all devices 📱
- [ ] Cross-browser compatibility 🌐

### ✅ Performance Benchmarks
- [ ] Page load time < 3 seconds ⚡
- [ ] PDF generation < 10 seconds 📄
- [ ] Email delivery < 30 seconds 📬
- [ ] Mobile responsiveness score > 90% 📱
- [ ] Lighthouse performance score > 80 🚀

## Maintenance

### Regular Checks
- [ ] Monitor email delivery rates
- [ ] Check PDF generation success rates  
- [ ] Monitor database performance
- [ ] Review error logs weekly
- [ ] Test critical user flows monthly

### Updates
- [ ] Keep dependencies updated
- [ ] Monitor security advisories
- [ ] Backup database regularly
- [ ] Update SSL certificates (auto-renewed)

---

## 🎉 Deployment Complete!

Once all checkboxes are ✅, your CarX application is fully deployed with:
- ✅ Frontend on Netlify
- ✅ Backend on Vercel  
- ✅ All email features working
- ✅ PDF generation and downloads
- ✅ Mobile-responsive design
- ✅ Production-ready configuration

**Live URLs:**
- Frontend: `https://your-netlify-app.netlify.app`
- Backend: `https://your-vercel-app.vercel.app`
- API Health: `https://your-vercel-app.vercel.app/api/health`

**Support**: If any issues arise, refer to the troubleshooting guide or check the deployment logs in Vercel/Netlify dashboards.