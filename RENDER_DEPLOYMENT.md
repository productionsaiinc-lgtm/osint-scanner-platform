# OSINT Platform - Render Deployment Guide

## Overview

This guide provides step-by-step instructions to deploy your OSINT Scanner Platform permanently to Render with full production setup, including database, environment variables, and GitHub auto-deployments.

## Prerequisites

- GitHub account with your OSINT platform repository
- Render account (free tier available at https://render.com)
- All API keys ready (Stripe, Shodan, Etherscan, OpenSky, etc.)

## Deployment Architecture

| Component | Service | Details |
|-----------|---------|---------|
| **Web App** | Render Web Service | Node.js + Express + React |
| **Database** | Render PostgreSQL | 15.x with automatic backups |
| **Environment** | Render Environment | Production-grade deployment |
| **Domain** | Custom Domain | Optional custom domain setup |

## Step 1: Create Render Account

1. Visit https://render.com and sign up for a free account
2. Verify your email address
3. Connect your GitHub account to Render

## Step 2: Connect GitHub Repository

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Select "Deploy an existing repository"
4. Search for your OSINT platform repository
5. Click "Connect"

## Step 3: Configure Web Service

### Basic Settings
- **Name:** `osint-scanner` (or your preferred name)
- **Environment:** `Node`
- **Plan:** `Standard` ($7/month) or `Pro` ($12/month)
- **Build Command:** `pnpm install && pnpm run build`
- **Start Command:** `node dist/index.js`
- **Region:** Choose closest to your users (e.g., Oregon, Frankfurt, Singapore)

### Advanced Settings
- **Auto-Deploy:** Enable (auto-redeploy on GitHub push)
- **Health Check Path:** `/health`
- **Health Check Protocol:** `HTTP`

## Step 4: Create PostgreSQL Database

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name:** `osint-db`
   - **Database:** `osint_scanner`
   - **User:** `osint_user`
   - **Region:** Same as web service
   - **PostgreSQL Version:** 15
   - **Plan:** `Standard` ($15/month) or `Pro` ($45/month)

3. Note the connection string (you'll need this)

## Step 5: Set Environment Variables

In your Render Web Service settings, add the following environment variables:

### Required Variables
```
NODE_ENV=production
PORT=3000
DATABASE_URL=[PostgreSQL connection string from Render]
JWT_SECRET=[Generate with: openssl rand -hex 32]
VITE_APP_ID=[Your Manus OAuth App ID]
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=[Your Manus Owner ID]
OWNER_NAME=[Your Name]
```

### Payment & API Keys
```
STRIPE_SECRET_KEY=[Your Stripe Live Key]
STRIPE_WEBHOOK_SECRET=[Your Stripe Webhook Secret]
VITE_STRIPE_PUBLISHABLE_KEY=[Your Stripe Publishable Key]
PAYPAL_CLIENT_ID=[Your PayPal Client ID]
PAYPAL_CLIENT_SECRET=[Your PayPal Client Secret]
PAYPAL_MODE=live
PAYPAL_PAYOUT_EMAIL=productions.ai.inc@gmail.com
```

### OSINT & Data Integration Keys
```
SHODAN_API_KEY=[Your Shodan API Key]
ETHERSCAN_API_KEY=[Your Etherscan API Key]
VIRUSTOTAL_API_KEY=[Your VirusTotal API Key]
OPENSKY_API_KEY=[Your OpenSky API Key]
IMEI_API_KEY=[Your IMEI API Key]
```

### Built-in Forge API (Manus)
```
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=[Your Manus Forge API Key]
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=[Your Manus Frontend Forge API Key]
```

### Analytics (Optional)
```
VITE_ANALYTICS_ENDPOINT=[Your Analytics Endpoint]
VITE_ANALYTICS_WEBSITE_ID=[Your Analytics Website ID]
```

## Step 6: Configure GitHub Auto-Deployment

### Option A: Automatic (Recommended)
1. Render automatically detects pushes to your GitHub repository
2. Each push to `main` branch triggers automatic deployment
3. No additional configuration needed

### Option B: Manual Webhook Setup
1. Get your Render webhook URL from service settings
2. Add to GitHub repository:
   - Settings → Webhooks → Add webhook
   - Payload URL: [Render webhook URL]
   - Content type: `application/json`
   - Events: Push events
   - Active: ✓

## Step 7: Deploy

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. Render automatically starts deployment
3. Monitor deployment progress in Render Dashboard
4. Your site will be live at: `https://osint-scanner.onrender.com`

## Step 8: Configure Custom Domain (Optional)

1. In Render Web Service settings, go to "Custom Domains"
2. Add your domain (e.g., `osint.yourdomain.com`)
3. Update DNS records as instructed by Render
4. SSL certificate automatically provisioned

## Step 9: Verify Deployment

### Health Check
```bash
curl https://osint-scanner.onrender.com/health
```

### API Test
```bash
curl https://osint-scanner.onrender.com/api/health
```

### Database Connection
Check Render logs for database connection confirmation

## Troubleshooting

### Build Failures
- Check build logs in Render Dashboard
- Ensure all dependencies in `package.json` are correct
- Verify Node.js version compatibility

### Database Connection Issues
- Verify `DATABASE_URL` environment variable
- Check PostgreSQL service is running
- Ensure IP allowlist includes Render IP

### Environment Variable Issues
- Double-check all variable names and values
- Ensure no typos in API keys
- Verify special characters are properly escaped

### Performance Issues
- Upgrade to Pro plan for better resources
- Enable caching for static assets
- Optimize database queries

## Monitoring & Maintenance

### Logs
- View real-time logs in Render Dashboard
- Monitor for errors and warnings
- Set up email alerts for deployment failures

### Backups
- PostgreSQL automatic daily backups (14-day retention)
- Manual backup option available in Render Dashboard

### Updates
- Render automatically applies security patches
- Zero-downtime deployments on code updates
- Automatic rollback on deployment failure

## Cost Estimation

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Web Service | Standard | $7 |
| PostgreSQL | Standard | $15 |
| **Total** | | **$22/month** |

*Prices as of 2026. See https://render.com/pricing for current rates.*

## Next Steps

1. **Monitor Performance** - Check Render Dashboard regularly
2. **Set Up Monitoring** - Enable error tracking and performance monitoring
3. **Configure Backups** - Set up automated backup strategy
4. **Add Custom Domain** - Point your domain to Render
5. **Scale as Needed** - Upgrade to Pro plans as traffic increases

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Render Support:** https://render.com/support
- **GitHub Deployments:** https://render.com/docs/deploy-from-github
- **Environment Variables:** https://render.com/docs/environment-variables

## Deployment Checklist

- [ ] GitHub repository connected to Render
- [ ] Web Service created and configured
- [ ] PostgreSQL database created
- [ ] All environment variables set
- [ ] Database connection verified
- [ ] Initial deployment successful
- [ ] Health checks passing
- [ ] Webhooks configured (if manual)
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts enabled
- [ ] Backup strategy implemented

---

**Deployment Status:** Ready for production  
**Last Updated:** June 2026  
**Maintained By:** Manus AI
