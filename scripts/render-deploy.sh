#!/bin/bash

# Render Deployment Script for OSINT Platform
# This script prepares the project for deployment to Render

set -e

echo "🚀 Preparing OSINT Platform for Render deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in Render environment
if [ -z "$RENDER" ]; then
    echo -e "${YELLOW}⚠️  Not running in Render environment. This script is designed for Render.${NC}"
fi

# Step 1: Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
pnpm install --frozen-lockfile

# Step 2: Build frontend
echo -e "${GREEN}🏗️  Building frontend...${NC}"
pnpm run build:client

# Step 3: Build backend
echo -e "${GREEN}🏗️  Building backend...${NC}"
pnpm run build:server

# Step 4: Run database migrations
echo -e "${GREEN}🗄️  Running database migrations...${NC}"
if [ -n "$DATABASE_URL" ]; then
    # Migrations will run automatically on server startup
    echo "Database migrations will run on server startup"
else
    echo -e "${RED}❌ DATABASE_URL not set. Skipping migrations.${NC}"
fi

# Step 5: Verify build
echo -e "${GREEN}✅ Verifying build...${NC}"
if [ -f "dist/index.js" ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed - dist/index.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Ensure all environment variables are set in Render Dashboard"
echo "2. Render will automatically start the server with: node dist/index.js"
echo "3. Monitor logs in Render Dashboard"
echo ""
echo "Useful commands:"
echo "  - View logs: Render Dashboard → Logs"
echo "  - Restart service: Render Dashboard → Restart"
echo "  - Scale service: Render Dashboard → Plan"
