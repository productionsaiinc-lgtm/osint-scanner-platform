# GitHub Pages Frontend + Manus Backend - Quick Start Guide

This guide shows how to deploy the **frontend to GitHub Pages** while keeping the **backend on Manus**.

## Architecture

```
User Browser
    ↓
GitHub Pages (Frontend)
https://your-username.github.io/osint-scanner-platform/
    ↓
API calls to:
    ↓
Manus Backend (Already Deployed)
https://3000-iyht9jsgkgfjs0s6mab1e-b4f18474.us1.manus.computer/api/trpc
    ↓
Database
```

## Cost

| Component | Host | Cost |
|-----------|------|------|
| Frontend | GitHub Pages | **Free** |
| Backend | Manus | Already paid |
| **Total** | | **No additional cost** |

---

## Step 1: Configure Git Email

GitHub requires a no-reply email to prevent publishing your private email.

1. Go to https://github.com/settings/emails
2. Find your **GitHub ID** (shown at the top)
3. Run these commands:

```bash
git config --global user.email "YOUR_GITHUB_ID+productionsaiinc-lgtm@users.noreply.github.com"
git config --global user.name "productionsaiinc-lgtm"
```

Replace `YOUR_GITHUB_ID` with the number from step 2.

---

## Step 2: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - **Branch**: Select `main`
4. Click **Save**

---

## Step 3: Configure GitHub Actions Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Create secret: `VITE_API_URL`
   - **Value**: `https://3000-iyht9jsgkgfjs0s6mab1e-b4f18474.us1.manus.computer`
   - (This is your Manus backend URL)

---

## Step 4: Push to GitHub

```bash
git add .
git commit -m "Deploy frontend to GitHub Pages with Manus backend"
git push origin main
```

---

## Step 5: Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the "Deploy Frontend to GitHub Pages" workflow
4. Wait for green checkmark ✓

---

## Step 6: Verify Deployment

1. Visit: `https://your-username.github.io/osint-scanner-platform/`
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try using an OSINT tool (e.g., Port Scanner)
5. Verify API calls show:
   - **URL**: `https://3000-iyht9jsgkgfjs0s6mab1e-b4f18474.us1.manus.computer/api/trpc`
   - **Status**: 200 (success)

---

## Troubleshooting

### Page shows README.md instead of app

**Solution:**
1. Go to **Settings** → **Pages**
2. Verify **Source** is set to "GitHub Actions"
3. If not, change it and save
4. Re-run the workflow: Go to **Actions** → Click latest workflow → Click **Re-run all jobs**

### API calls fail (CORS error)

**Solution:**
1. Verify `VITE_API_URL` secret is correct
2. Check Manus backend is running
3. Verify backend CORS allows GitHub Pages origin
4. Check browser console for exact error

### 404 errors on page refresh

**Solution:**
1. Verify `client/public/404.html` exists
2. Verify `client/src/main.tsx` has redirect handling
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try in incognito/private mode

### Workflow fails to build

**Solution:**
1. Check **Actions** logs for error message
2. Verify `npm run build` works locally:
   ```bash
   npm run build
   ```
3. Ensure all dependencies are in `package.json`
4. Check Node.js version (22.x recommended)

---

## Making Changes

**To update the frontend:**

1. Make code changes locally
2. Test locally:
   ```bash
   npm run dev
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```
4. GitHub Actions automatically builds and deploys
5. Visit GitHub Pages URL to see changes (may take 1-2 minutes)

---

## Backend Updates

**If you need to update the backend on Manus:**

1. Make backend changes in `server/` directory
2. The Manus deployment will auto-update
3. Frontend automatically uses the new API

---

## Custom Domain (Optional)

To use a custom domain like `osint.your-domain.com`:

1. Create `CNAME` file in `client/public/`:
   ```
   osint.your-domain.com
   ```

2. Update DNS at your domain provider:
   ```
   CNAME osint.your-domain.com -> your-username.github.io
   ```

3. Go to **Settings** → **Pages**
4. Under "Custom domain", enter: `osint.your-domain.com`
5. Check "Enforce HTTPS"

---

## URLs

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-username.github.io/osint-scanner-platform/` |
| **Backend API** | `https://3000-iyht9jsgkgfjs0s6mab1e-b4f18474.us1.manus.computer/api/trpc` |
| **GitHub Actions** | `https://github.com/productionsaiinc-lgtm/osint-scanner-platform/actions` |
| **Repository** | `https://github.com/productionsaiinc-lgtm/osint-scanner-platform` |

---

## Workflow File

The deployment workflow is in `.github/workflows/deploy-github-pages.yml`:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/public
      - uses: actions/deploy-pages@v4
```

---

## Support

- GitHub Pages: https://pages.github.com
- GitHub Actions: https://docs.github.com/en/actions
- Manus Docs: Check your Manus project documentation

---

## Quick Checklist

- [ ] Git email configured with no-reply format
- [ ] GitHub Pages enabled (Source: GitHub Actions)
- [ ] `VITE_API_URL` secret set to Manus backend URL
- [ ] Code pushed to main branch
- [ ] GitHub Actions workflow completed successfully
- [ ] Frontend loads at GitHub Pages URL
- [ ] API calls reach Manus backend
- [ ] OSINT tools work end-to-end

**Done! Your frontend is now deployed to GitHub Pages with backend on Manus. 🚀**
