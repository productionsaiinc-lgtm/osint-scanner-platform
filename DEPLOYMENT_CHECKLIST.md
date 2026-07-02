# OSINT Scanner Platform - Deployment Checklist

Complete this checklist to deploy your application with **GitHub Pages (Frontend) + Render (Backend)**.

---

## Phase 1: Prepare Your Repository

- [ ] **Commit all changes**
  ```bash
  git add .
  git commit -m "Prepare for GitHub Pages + Render deployment"
  git push origin main
  ```

- [ ] **Verify GitHub repository is public** (required for GitHub Pages)
  - Go to Settings → General → Change repository visibility if needed

- [ ] **Verify `.github/workflows/deploy-github-pages.yml` exists**
  - File should be in your repository root
  - Contains GitHub Actions workflow for automatic deployment

---

## Phase 2: Deploy Frontend to GitHub Pages

### Step 1: Enable GitHub Pages

- [ ] Go to GitHub repository → **Settings** → **Pages**
- [ ] Under "Build and deployment":
  - [ ] Select **Source**: "GitHub Actions"
  - [ ] Select **Branch**: `main` (or your default branch)
- [ ] Click **Save**

### Step 2: Configure GitHub Actions Secrets

- [ ] Go to **Settings** → **Secrets and variables** → **Actions**
- [ ] Click **New repository secret**
- [ ] Add secret: `VITE_API_URL`
  - [ ] Value: `https://your-backend-api.onrender.com` (you'll set this after deploying backend)
  - [ ] For now, use: `https://localhost:3000` (placeholder)

### Step 3: Trigger First Deployment

- [ ] Make a small change to trigger workflow:
  ```bash
  echo "# Deployment" >> DEPLOYMENT_NOTES.md
  git add DEPLOYMENT_NOTES.md
  git commit -m "Trigger GitHub Pages deployment"
  git push origin main
  ```

- [ ] Go to **Actions** tab and watch the build
  - [ ] Wait for "Deploy Frontend to GitHub Pages" workflow to complete
  - [ ] Check for green checkmark ✓

### Step 4: Verify Frontend Deployment

- [ ] Visit: `https://your-username.github.io/osint-scanner-platform/`
- [ ] Verify page loads (should show OSINT Scanner interface)
- [ ] Check browser console (F12) for errors

---

## Phase 3: Deploy Backend to Render

### Step 1: Create Render Account & Web Service

- [ ] Go to https://dashboard.render.com
- [ ] Sign up or log in with GitHub
- [ ] Click **New +** → **Web Service**
- [ ] Select your GitHub repository
- [ ] Configure:
  - [ ] **Name**: `osint-scanner-platform`
  - [ ] **Environment**: `Node`
  - [ ] **Build Command**: `npm install && npm run build`
  - [ ] **Start Command**: `npm start`
  - [ ] **Plan**: Standard ($7/month)

### Step 2: Add Environment Variables to Render

- [ ] In Render dashboard, go to your Web Service
- [ ] Click **Environment** (or **Settings** → **Environment**)
- [ ] Add all required environment variables:

**Authentication & OAuth**
```
JWT_SECRET=generate-a-random-secure-string-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
```

**Database**
```
DATABASE_URL=mysql://user:password@host:3306/database_name
```

**API Keys (External Services)**
```
HUNTER_API_KEY=your-key
ETHERSCAN_API_KEY=your-key
VIRUSTOTAL_API_KEY=your-key
OPENSKY_API_KEY=your-key
NUMVERIFY_API_KEY=your-key
SHODAN_API_KEY=your-key
```

**Stripe (if using payments)**
```
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

**PayPal (if using payouts)**
```
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_PAYOUT_EMAIL=your-payout-email
```

**Manus Built-in APIs**
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
```

**App Configuration**
```
NODE_ENV=production
VITE_APP_TITLE=OSINT Scanner Platform
VITE_APP_LOGO=https://your-logo-url.png
```

### Step 3: Create Database (if needed)

**Option A: Use Render's Managed MySQL**
- [ ] In Render dashboard, click **New +** → **MySQL**
- [ ] Configure database
- [ ] Copy connection string to `DATABASE_URL` environment variable

**Option B: Use External Database**
- [ ] Get connection string from your provider
- [ ] Add to `DATABASE_URL` environment variable

### Step 4: Deploy Backend

- [ ] Click **Create Web Service** in Render
- [ ] Render will automatically build and deploy
- [ ] Monitor **Logs** tab for build progress
- [ ] Wait for "Server running on http://localhost:3000/" message

### Step 5: Get Backend URL

- [ ] In Render dashboard, find your Web Service
- [ ] Copy the service URL (e.g., `https://osint-scanner-platform-abc123.onrender.com`)
- [ ] Note this for next step

---

## Phase 4: Connect Frontend to Backend

### Step 1: Update GitHub Actions Secret

- [ ] Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
- [ ] Edit `VITE_API_URL` secret
- [ ] Change value from `https://localhost:3000` to your Render backend URL
  - [ ] Example: `https://osint-scanner-platform-abc123.onrender.com`

### Step 2: Trigger Frontend Rebuild

- [ ] Make a small change to trigger new build:
  ```bash
  echo "# Updated API URL" >> DEPLOYMENT_NOTES.md
  git add DEPLOYMENT_NOTES.md
  git commit -m "Update API endpoint"
  git push origin main
  ```

- [ ] Go to **Actions** tab and watch the build
- [ ] Wait for workflow to complete

### Step 3: Verify Connection

- [ ] Visit: `https://your-username.github.io/osint-scanner-platform/`
- [ ] Open browser console (F12)
- [ ] Try using an OSINT tool (e.g., Port Scanner, IP Lookup)
- [ ] Check Network tab to see API calls to your backend
- [ ] Verify no CORS errors

---

## Phase 5: Configure Webhooks (Optional)

### Stripe Webhook

- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Add endpoint: `https://your-render-url.onrender.com/api/stripe/webhook`
- [ ] Select events: `payment_intent.succeeded`, `charge.refunded`
- [ ] Copy webhook secret to `STRIPE_WEBHOOK_SECRET` in Render

### PayPal Webhook

- [ ] Go to PayPal Developer Dashboard
- [ ] Configure webhook URL: `https://your-render-url.onrender.com/api/paypal/webhook`

---

## Phase 6: Testing & Verification

### Frontend Testing

- [ ] [ ] Page loads without errors
- [ ] [ ] Navigation works (all pages accessible)
- [ ] [ ] Responsive design works on mobile
- [ ] [ ] Dark/light theme toggle works

### Backend Testing

- [ ] [ ] API endpoints respond (check Network tab)
- [ ] [ ] Authentication works (login/logout)
- [ ] [ ] Database queries work
- [ ] [ ] External API calls work (Hunter.io, Etherscan, etc.)

### Integration Testing

- [ ] [ ] Frontend can call backend API
- [ ] [ ] No CORS errors in console
- [ ] [ ] API responses display correctly in UI
- [ ] [ ] Error handling works (invalid inputs, API failures)

---

## Phase 7: Post-Deployment

### Monitoring

- [ ] [ ] Set up GitHub Actions notifications
  - Go to Settings → Notifications → Enable workflow notifications
  
- [ ] [ ] Monitor Render logs regularly
  - Check Render dashboard for errors or performance issues

- [ ] [ ] Set up error tracking (optional)
  - Consider Sentry, LogRocket, or similar

### Maintenance

- [ ] [ ] Keep dependencies updated
  ```bash
  npm outdated  # Check for updates
  npm update    # Update packages
  ```

- [ ] [ ] Regular backups
  - Enable automated backups in Render database settings

- [ ] [ ] Monitor costs
  - GitHub Pages: Free
  - Render Web Service: ~$7/month
  - Render Database: ~$15/month
  - **Total: ~$22/month**

---

## Troubleshooting

### Frontend Won't Deploy
- [ ] Check GitHub Actions logs for errors
- [ ] Verify `npm run build` works locally
- [ ] Ensure all dependencies are in package.json

### Backend Won't Start
- [ ] Check Render logs for error messages
- [ ] Verify all environment variables are set
- [ ] Test database connection
- [ ] Ensure Node.js version is compatible

### API Calls Fail (CORS Errors)
- [ ] Verify backend CORS is configured
- [ ] Check `VITE_API_URL` is correct
- [ ] Ensure backend is running and accessible
- [ ] Check browser console for exact error

### 404 Errors on Page Refresh
- [ ] Verify `404.html` exists in `client/public/`
- [ ] Check GitHub Pages settings
- [ ] Ensure client-side routing is configured

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-username.github.io/osint-scanner-platform/` |
| **Backend API** | `https://your-render-url.onrender.com/api/trpc` |
| **GitHub Actions** | `https://github.com/your-username/osint-scanner-platform/actions` |
| **Render Dashboard** | `https://dashboard.render.com` |

---

## Support Resources

- [GitHub Pages Docs](https://pages.github.com)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Render Docs](https://render.com/docs)
- [Vite Docs](https://vitejs.dev)
- [Express Docs](https://expressjs.com)

---

## Completion Checklist

- [ ] Frontend deployed to GitHub Pages
- [ ] Backend deployed to Render
- [ ] Frontend and backend connected
- [ ] All tests passing
- [ ] Webhooks configured (if applicable)
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team notified of deployment

**Deployment Complete! 🚀**
