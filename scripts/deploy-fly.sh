#!/bin/bash
# Fly.io Deployment Script for OSINT Scanner Platform
# Usage: ./scripts/deploy-fly.sh

set -e

echo "🚀 OSINT Scanner Platform - Fly.io Deployment"
echo "=============================================="

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Error: flyctl CLI not found"
    echo "Install from: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

# Check if git is clean
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: Uncommitted changes detected"
    echo "Please commit or stash your changes first"
    exit 1
fi

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📌 Current branch: $BRANCH"

# Check if fly.toml exists
if [ ! -f "fly.toml" ]; then
    echo "❌ Error: fly.toml not found"
    echo "Run 'fly launch' first to initialize your app"
    exit 1
fi

# Confirm deployment
read -p "Deploy to Fly.io? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin $BRANCH

# Deploy to Fly.io
echo "🚀 Deploying to Fly.io..."
fly deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check deployment status: fly status"
echo "2. View logs: fly logs"
echo "3. Your app is live at: https://osint-scanner.fly.dev"
echo ""
echo "📚 For more info, see FLY_DEPLOYMENT_GUIDE.md"
