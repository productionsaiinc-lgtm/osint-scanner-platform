# OSINT Scanner Platform - Render Deployment Guide

## Quick Start (5 minutes)

### Prerequisites
- GitHub account with your OSINT platform repository
- Render account (free at https://render.com)

### Step 1: Connect GitHub to Render
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Select "Deploy an existing repository"
4. Search for `osint-scanner-platform` and connect

### Step 2: Configure Web Service
- **Name:** `osint-scanner`
- **Environment:** `Node`
- **Plan:** `Free` (or `Standard` $7/month for better performance)
- **Build Command:** `pnpm install && pnpm run build`
- **Start Command:** `node dist/index.js`
- **Region:** Choose closest to your users

### Step 3: Create PostgreSQL Database
1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name:** `osint-db`
   - **Database:** `osint_scanner`
   - **User:** `osint_user`
   - **Plan:** `Free` (or `Standard` $15/month)
   - **Region:** Same as web service
3. Copy the connection string

### Step 4: Set Environment Variables
In your Render Web Service settings, add these variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=[PostgreSQL connection string]
JWT_SECRET=[Generate: openssl rand -hex 32]
VITE_APP_ID=[Your Manus OAuth App ID]
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=[Your Manus Owner ID]
OWNER_NAME=[Your Name]
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=[Your Manus Forge API Key]
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=[Your Manus Frontend Forge API Key]
STRIPE_SECRET_KEY=[Your Stripe Secret Key]
STRIPE_WEBHOOK_SECRET=[Your Stripe Webhook Secret]
VITE_STRIPE_PUBLISHABLE_KEY=[Your Stripe Publishable Key]
PAYPAL_CLIENT_ID=[Your PayPal Client ID]
PAYPAL_CLIENT_SECRET=[Your PayPal Client Secret]
PAYPAL_MODE=sandbox
PAYPAL_PAYOUT_EMAIL=[Your PayPal Payout Email]
SHODAN_API_KEY=[Your Shodan API Key]
ETHERSCAN_API_KEY=[Your Etherscan API Key]
VIRUSTOTAL_API_KEY=[Your VirusTotal API Key]
OPENSKY_API_KEY=[Your OpenSky API Key]
IMEI_API_KEY=[Your IMEI API Key]
```

### Step 5: Deploy
1. Push to GitHub: `git push origin main`
2. Render automatically deploys
3. Your site is live at: `https://osint-scanner.onrender.com`

---

## Using render.yaml (Automatic Configuration)

We've included a `render.yaml` file that automatically configures your deployment:

```bash
# Deploy using render.yaml
git add render.yaml
git commit -m "Add Render configuration"
git push origin main
```

Render will automatically:
- Create web service and database
- Set up environment variables
- Configure health checks
- Enable auto-deployment

---

## Troubleshooting

### Build Failures
- Check Render logs for errors
- Ensure `pnpm-lock.yaml` is committed
- Verify Node.js version compatibility

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check PostgreSQL service is running
- Ensure IP allowlist is configured

### Environment Variable Issues
- Double-check variable names
- Ensure no typos in API keys
- Verify special characters are escaped

---

## Monitoring & Maintenance

### View Logs
- Render Dashboard → Logs tab
- Real-time log streaming available

### Database Backups
- Automatic daily backups (14-day retention)
- Manual backup available in Dashboard

### Performance Optimization
- Monitor CPU and memory usage
- Upgrade to Standard plan if needed
- Enable caching for static assets

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Web Service | Free | $0 |
| PostgreSQL | Free | $0 |
| **Total** | | **$0** |

Upgrade to Standard when ready:
- Web Service: $7/month
- PostgreSQL: $15/month
- **Total: $22/month**

---

## Custom Domain Setup

1. In Render Web Service settings, go to "Custom Domains"
2. Add your domain (e.g., `osint.yourdomain.com`)
3. Update DNS records as instructed
4. SSL certificate automatically provisioned

---

## Next Steps

1. Monitor deployment in Render Dashboard
2. Test all features in production
3. Set up error tracking and monitoring
4. Configure backups and disaster recovery
5. Scale resources as traffic increases

---

## Support

- **Render Docs:** https://render.com/docs
- **Render Support:** https://render.com/support
- **GitHub Deployments:** https://render.com/docs/deploy-from-github
