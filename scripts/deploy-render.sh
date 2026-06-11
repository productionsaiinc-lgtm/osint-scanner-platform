#!/bin/bash
# Render Deployment Script for OSINT Scanner Platform
# Usage: ./scripts/deploy-render.sh

set -e

echo "🚀 OSINT Scanner Platform - Render Deployment"
echo "=============================================="

# Check if git is clean
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: Uncommitted changes detected"
    echo "Please commit or stash your changes first"
    exit 1
fi

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📌 Current branch: $BRANCH"

# Confirm deployment
read -p "Deploy to Render? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin $BRANCH

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://render.com/dashboard"
echo "2. Check deployment progress"
echo "3. Your app will be live at: https://osint-scanner.onrender.com"
echo ""
echo "📚 For more info, see RENDER_DEPLOYMENT_GUIDE.md"
