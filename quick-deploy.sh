#!/bin/bash

# CarX Quick Deployment Script
# This script helps deploy CarX to Vercel (backend) and Netlify (frontend)

echo "🚀 CarX Deployment Script"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check complete${NC}"

# Step 1: Deploy Backend to Vercel
echo -e "\n${BLUE}Step 1: Deploying Backend to Vercel...${NC}"
echo "📦 Building backend..."

# Deploy to Vercel
vercel --prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend deployed successfully to Vercel${NC}"
    echo -e "${YELLOW}📝 Please note your Vercel URL and update the frontend configuration${NC}"
else
    echo -e "${RED}❌ Backend deployment failed${NC}"
    exit 1
fi

# Step 2: Build Frontend
echo -e "\n${BLUE}Step 2: Building Frontend...${NC}"
cd client

echo "📦 Installing frontend dependencies..."
npm install

echo "🏗️ Building frontend for production..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
    echo -e "${YELLOW}📁 Built files are in the 'dist' directory${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Instructions for Netlify deployment
echo -e "\n${BLUE}Step 3: Deploy Frontend to Netlify${NC}"
echo -e "${YELLOW}Manual steps required:${NC}"
echo "1. Go to https://app.netlify.com/"
echo "2. Drag and drop the 'client/dist' folder to deploy"
echo "3. Or connect your GitHub repository for automatic deployments"
echo ""
echo -e "${YELLOW}Netlify Configuration:${NC}"
echo "- Build command: npm run build"
echo "- Publish directory: dist"
echo "- Node version: 18"

# Step 4: Configuration Updates
echo -e "\n${BLUE}Step 4: Post-Deployment Configuration${NC}"
echo -e "${YELLOW}Important: Update these configurations after deployment:${NC}"
echo ""
echo "1. Update frontend environment variables:"
echo "   - VITE_PRODUCTION_BACKEND_URL=https://your-vercel-url.vercel.app"
echo "   - VITE_API_BASE_URL=https://your-vercel-url.vercel.app/api"
echo ""
echo "2. Update backend CORS configuration:"
echo "   - Add your Netlify URL to allowedOrigins in server.js"
echo "   - Redeploy backend with: vercel --prod"
echo ""
echo "3. Set Vercel environment variables:"
echo "   - Go to Vercel dashboard → Project → Settings → Environment Variables"
echo "   - Add all variables from .env.production file"

# Step 5: Testing
echo -e "\n${BLUE}Step 5: Testing Deployment${NC}"
echo -e "${YELLOW}Test these endpoints after deployment:${NC}"
echo ""
echo "Backend Health Check:"
echo "https://your-vercel-url.vercel.app/api/health"
echo ""
echo "Test Email Service:"
echo "curl -X POST https://your-vercel-url.vercel.app/api/test/test-email \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"your-email@gmail.com\"}'"
echo ""
echo "Test PDF Generation:"
echo "curl -X POST https://your-vercel-url.vercel.app/api/test/test-pdf --output test.pdf"

echo -e "\n${GREEN}🎉 Deployment script completed!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Complete the Netlify deployment manually"
echo "2. Update environment variables as shown above"
echo "3. Test all features using the provided endpoints"
echo "4. Check the DEPLOYMENT_CHECKLIST.md for detailed testing"

echo -e "\n${BLUE}📚 Documentation:${NC}"
echo "- Full deployment guide: deploy.md"
echo "- Deployment checklist: DEPLOYMENT_CHECKLIST.md"
echo "- Troubleshooting: See deploy.md"