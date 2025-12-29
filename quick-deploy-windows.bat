@echo off
echo CarX Deployment Script for Windows
echo ==================================

echo Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
)

echo Prerequisites check complete

echo.
echo Step 1: Deploying Backend to Vercel...
vercel --prod

echo.
echo Step 2: Building Frontend...
cd client
npm install
npm run build
cd ..

echo.
echo Deployment completed!
echo Please follow the manual steps in deploy.md for Netlify deployment.

pause