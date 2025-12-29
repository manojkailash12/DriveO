# 🚀 CarX Deployment Guide

## Prerequisites
- Vercel account (for backend)
- Netlify account (for frontend)
- Gmail App Password configured
- MongoDB Atlas database
- Cloudinary account

## 📋 Step-by-Step Deployment

### Phase 1: Backend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Backend**
   ```bash
   cd CarX
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**
   Go to your Vercel project → Settings → Environment Variables
   
   Add these variables:
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

5. **Note Your Backend URL**
   After deployment, copy your Vercel backend URL (e.g., `https://carx-backend.vercel.app`)

### Phase 2: Frontend Deployment (Netlify)

1. **Update Frontend Environment**
   Edit `CarX/client/.env.production`:
   ```
   VITE_PRODUCTION_BACKEND_URL=https://your-actual-vercel-url.vercel.app
   VITE_API_BASE_URL=https://your-actual-vercel-url.vercel.app/api
   ```

2. **Build Frontend**
   ```bash
   cd CarX/client
   npm run build
   ```

3. **Deploy to Netlify**
   - Option A: Drag & drop `dist` folder to Netlify
   - Option B: Connect GitHub repository to Netlify

4. **Configure Netlify Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

5. **Set Environment Variables in Netlify**
   Go to Site Settings → Environment Variables
   ```
   VITE_PRODUCTION_BACKEND_URL=https://your-vercel-backend.vercel.app
   VITE_API_BASE_URL=https://your-vercel-backend.vercel.app/api
   ```

### Phase 3: Update CORS Configuration

1. **Update Backend CORS**
   In your Vercel backend, update `server.js`:
   ```javascript
   const allowedOrigins = [
     'https://your-netlify-app.netlify.app', // Your actual Netlify URL
     'http://localhost:5173', // Keep for development
   ];
   ```

2. **Redeploy Backend**
   ```bash
   vercel --prod
   ```

## ✅ Testing Deployment

### 1. Test Backend Health
Visit: `https://your-vercel-backend.vercel.app/api/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": { "status": "connected" },
  "connection": { "readyState": 1 }
}
```

### 2. Test Frontend Connection
Visit: `https://your-netlify-app.netlify.app`

### 3. Test Email Features

#### A. Test OTP Email (Sign Up)
1. Go to Sign Up page
2. Fill form and submit
3. Check email for OTP
4. Verify OTP works

#### B. Test Booking Receipt Email
1. Create a booking
2. Check email for booking confirmation
3. Verify PDF attachment is included

#### C. Test PDF Download (Admin)
1. Login as admin
2. Go to Orders/Bookings page
3. Click "Export PDF" button
4. Verify PDF downloads correctly

#### D. Test Email Receipt Sending (User Orders)
1. Login as user
2. Go to Orders page
3. Click "Send Receipt PDF" button
4. Check email for PDF receipt

## 🔧 Troubleshooting

### Email Issues
- Verify Gmail App Password is correct
- Check spam folder
- Ensure `ENABLE_PDF_GENERATION=true`

### PDF Issues
- Check Vercel function timeout (max 30s)
- Verify Puppeteer works on Vercel
- Check PDF generation logs

### CORS Issues
- Verify frontend URL in backend CORS
- Check browser console for CORS errors
- Ensure credentials: true is set

### Database Issues
- Verify MongoDB Atlas connection
- Check IP whitelist (0.0.0.0/0 for Vercel)
- Test connection string

## 📱 Mobile Testing
Test on various devices:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Desktop (Chrome, Firefox, Safari)

## 🔒 Security Checklist
- [ ] Strong JWT secrets in production
- [ ] Environment variables not in code
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Database access restricted

## 📊 Monitoring
- Set up Vercel Analytics
- Monitor Netlify build logs
- Check email delivery rates
- Monitor PDF generation success

## 🚨 Emergency Rollback
If issues occur:
1. Revert to previous Vercel deployment
2. Revert Netlify deployment
3. Check environment variables
4. Review recent changes

## 📞 Support
- Vercel: https://vercel.com/support
- Netlify: https://www.netlify.com/support/
- MongoDB Atlas: https://support.mongodb.com/
- Gmail: https://support.google.com/mail/

---

**Important**: Replace all placeholder URLs with your actual deployment URLs!