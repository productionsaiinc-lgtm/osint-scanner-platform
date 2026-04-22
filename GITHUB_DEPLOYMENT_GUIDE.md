# GitHub Automatic Deployment Guide

## Overview

Your OSINT Scanner Platform is configured to automatically update when you commit code to GitHub. This guide explains how the automatic deployment works and how to use it effectively.

## How It Works

1. **Local Development** → Make changes to your code locally
2. **Commit & Push** → Commit your changes and push to GitHub
3. **Automatic Sync** → Manus detects the push and syncs your repository
4. **Auto-Deploy** → The website automatically rebuilds and deploys with your changes
5. **Live Update** → Your changes go live at `osintscan-fftqerzj.manus.space`

## Workflow Steps

### Step 1: Make Your Changes

Edit your code locally in the project directory:

```bash
cd /home/ubuntu/osint-scanner-platform
# Make your changes to files
```

### Step 2: Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add new feature: [description]"
```

### Step 3: Push to GitHub

```bash
# Push to your GitHub repository
git push user_github main
```

### Step 4: Monitor Deployment

After pushing, Manus will:
1. Detect the new commit on GitHub
2. Pull the latest code
3. Install dependencies (if needed)
4. Build the project
5. Deploy to your live domain

**Deployment typically completes in 2-5 minutes.**

## Best Practices

### ✅ DO:
- Write clear, descriptive commit messages
- Test changes locally before pushing
- Push to `main` branch for automatic deployment
- Use `git push user_github main` to push to GitHub

### ❌ DON'T:
- Push breaking changes without testing
- Commit large binary files (use S3 for media)
- Push to other branches if you want auto-deployment
- Force push to main (`git push --force`)

## Commit Message Examples

```bash
# Good commit messages
git commit -m "Add IP geolocation feature to IP Lookup tool"
git commit -m "Fix: Resolve certificate transparency API timeout issue"
git commit -m "Update: Improve Threat Feed data refresh rate"
git commit -m "Feature: Add export to CSV for scan results"
```

## Troubleshooting

### Changes Not Deploying?

1. **Verify push succeeded:**
   ```bash
   git log --oneline -3
   git status
   ```

2. **Check GitHub repository:**
   - Visit: https://github.com/productionsaiinc-lgtm/osint-scanner-platform
   - Verify your commit appears in the main branch

3. **Check Manus deployment status:**
   - Open the Manus Management UI
   - Go to Dashboard → View deployment logs
   - Look for any build errors

### Build Errors After Push?

1. Test locally first:
   ```bash
   npm run build
   npm run test
   ```

2. Fix any TypeScript errors:
   ```bash
   npm run type-check
   ```

3. Commit fixes and push again

## Rollback to Previous Version

If a deployment causes issues:

1. **Revert the last commit:**
   ```bash
   git revert HEAD
   git push user_github main
   ```

2. **Or rollback via Manus UI:**
   - Open Management UI → Version History
   - Click "Rollback" on the previous stable version

## Advanced: Manual Checkpoint Creation

For major releases, create a checkpoint before pushing:

```bash
# In Manus UI or via API
# This creates a snapshot you can rollback to
```

## Continuous Integration

Your repository is configured with:
- **Automatic syncing** from GitHub
- **Auto-deployment** on main branch pushes
- **Zero-downtime deployments** (no service interruption)

## Monitoring Deployments

To view deployment status:

1. **In Manus UI:**
   - Dashboard → Deployment Status
   - Check recent deployments and logs

2. **Via Git:**
   ```bash
   git log --oneline -10
   git status
   ```

## Common Deployment Scenarios

### Scenario 1: Adding a New OSINT Tool

```bash
# Create new tool page
# Update App.tsx with new route
# Update DashboardLayout.tsx with sidebar menu item
git add .
git commit -m "Add new OSINT tool: [Tool Name]"
git push user_github main
# ✅ Deployed in 2-5 minutes
```

### Scenario 2: Fixing a Bug

```bash
# Fix the bug in your code
# Test locally: npm run dev
git add .
git commit -m "Fix: [Description of bug fix]"
git push user_github main
# ✅ Deployed in 2-5 minutes
```

### Scenario 3: Updating Dependencies

```bash
# Update package.json
npm install
git add package.json package-lock.json
git commit -m "Update: Upgrade dependencies"
git push user_github main
# ✅ Deployed in 2-5 minutes
```

## Performance Tips

1. **Minimize bundle size:**
   - Use code splitting for large components
   - Lazy load routes

2. **Optimize images:**
   - Use S3 for all media files
   - Use `manus-upload-file --webdev` for static assets

3. **Cache strategy:**
   - Static assets are cached at CDN
   - API responses are cached where appropriate

## Support

If you encounter issues with automatic deployment:

1. Check the Manus Management UI Dashboard
2. Review deployment logs for error messages
3. Verify your GitHub repository is properly connected
4. Test locally before pushing: `npm run build && npm run dev`

## Quick Reference

```bash
# View git status
git status

# View recent commits
git log --oneline -10

# Push to GitHub (triggers auto-deployment)
git push user_github main

# Pull latest from GitHub
git pull user_github main

# Create a new branch for testing
git checkout -b feature/my-new-feature

# Switch back to main
git checkout main

# Merge feature branch to main
git merge feature/my-new-feature
git push user_github main
```

---

**Your live domain:** https://osintscan-fftqerzj.manus.space

**GitHub repository:** https://github.com/productionsaiinc-lgtm/osint-scanner-platform

**Happy deploying! 🚀**
