@echo off
echo 🚀 CarX Deployment Script for Windows
echo =====================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo ✅ Prerequisites check complete

:: Step 1: Deploy Backend to Vercel
echo.
echo 📡 Step 1: Deploying Backend to Vercel...
echo 📦 Building backend...

vercel --prod

if %errorlevel% equ 0 (
    echo ✅ Backend deployed successfully to Vercel
    echo 📝 Please note your Vercel URL and update the frontend configuration
) else (
    echo ❌ Backend deployment failed
    pause
    exit /b 1
)

:: Step 2: Build Frontend
echo.
echo 🏗️ Step 2: Building Frontend...
cd client

echo 📦 Installing frontend dependencies...
npm install

echo 🏗️ Building frontend for production...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Frontend built successfully
    echo 📁 Built files are in the 'dist' directory
) else (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

:: Instructions for Netlify deployment
echo.
echo 🌐 Step 3: Deploy Frontend to Netlify
echo Manual steps required:
echo 1. Go to https://app.netlify.com/
echo 2. Drag and drop the 'client/dist' folder to deploy
echo 3. Or connect your GitHub repository for automatic deployments
echo.
echo Netlify Configuration:
echo - Build command: npm run build
echo - Publish directory: dist
echo - Node version: 18

:: Step 4: Configuration Updates
echo.
echo ⚙️ Step 4: Post-Deployment Configuration
echo Important: Update these configurations after deployment:
echo.
echo 1. Update frontend environment variables:
echo    - VITE_PRODUCTION_BACKEND_URL=https://your-vercel-url.vercel.app
echo    - VITE_API_BASE_URL=https://your-vercel-url.vercel.app/api
echo.
echo 2. Update backend CORS configuration:
echo    - Add your Netlify URL to allowedOrigins in server.js
echo    - Redeploy backend with: vercel --prod
echo.
echo 3. Set Vercel environment variables:
echo    - Go to Vercel dashboard → Project → Settings → Environment Variables
echo    - Add all variables from .env.production file

:: Step 5: Testing
echo.
echo 🧪 Step 5: Testing Deployment
echo Test these endpoints after deployment:
echo.
echo Backend Health Check:
echo https://your-vercel-url.vercel.app/api/health
echo.
echo Test Email Service:
echo curl -X POST https://your-vercel-url.vercel.app/api/test/test-email ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"email\":\"your-email@gmail.com\"}"
echo.
echo Test PDF Generation:
echo curl -X POST https://your-vercel-url.vercel.app/api/test/test-pdf --output test.pdf

echo.
echo 🎉 Deployment script completed!
echo 📋 Next steps:
echo 1. Complete the Netlify deployment manually
echo 2. Update environment variables as shown above
echo 3. Test all features using the provided endpoints
echo 4. Check the DEPLOYMENT_CHECKLIST.md for detailed testing

echo.
echo 📚 Documentation:
echo - Full deployment guide: deploy.md
echo - Deployment checklist: DEPLOYMENT_CHECKLIST.md
echo - Troubleshooting: See deploy.md

pause