# Render.com Deployment Guide for OSINT Scanner Platform

Complete step-by-step guide to deploy your OSINT platform to Render.com with production configuration.

## Prerequisites

- [ ] Render.com account (free tier available)
- [ ] GitHub repository with OSINT platform code
- [ ] All API keys ready (Etherscan, Shodan, VirusTotal, etc.)
- [ ] PayPal credentials for production
- [ ] Custom domain (optional)

## Step 1: Create Render Account & Connect GitHub

### 1.1 Sign Up for Render
1. Go to https://render.com
2. Click "Sign up"
3. Choose "Sign up with GitHub" for easy integration
4. Authorize Render to access your GitHub account

### 1.2 Connect Your Repository
1. In Render Dashboard, click "New +"
2. Select "Web Service"
3. Choose "Deploy existing repository"
4. Search for and select `osint-scanner-platform`
5. Click "Connect"

## Step 2: Configure Web Service

### 2.1 Basic Settings
- **Name**: `osint-scanner` (or your preferred name)
- **Environment**: `Node`
- **Plan**: `Standard` ($7/month) or `Free` (with limitations)
- **Branch**: `main`
- **Build Command**: `pnpm install && pnpm run build`
- **Start Command**: `node dist/index.js`

### 2.2 Environment Variables
Click "Add Environment Variable" and add each key:

**Required Variables:**
```
NODE_ENV=production
JWT_SECRET=<generate-a-strong-secret>
VITE_APP_ID=<your-app-id>
OWNER_OPEN_ID=<your-open-id>
OWNER_NAME=nate
```

**API Keys (from render.env):**
```
ETHERSCAN_API_KEY=<your-key>
SHODAN_API_KEY=<your-key>
VIRUSTOTAL_API_KEY=<your-key>
OPENSKY_API_KEY=<your-key>
NUMVERIFY_API_KEY=<your-key>
HUNTER_API_KEY=<your-key>
IMEI_API_KEY=<your-key>
```

**Payment Keys:**
```
STRIPE_SECRET_KEY=<your-key>
STRIPE_WEBHOOK_SECRET=<your-key>
VITE_STRIPE_PUBLISHABLE_KEY=<your-key>
PAYPAL_CLIENT_ID=<your-id>
PAYPAL_CLIENT_SECRET=<your-secret>
PAYPAL_MODE=live
PAYPAL_PAYOUT_EMAIL=<your-email>
```

**Manus Integration:**
```
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=<your-key>
VITE_FRONTEND_FORGE_API_KEY=<your-key>
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
```

### 2.3 Advanced Settings
- **Health Check Path**: `/api/health`
- **Health Check Protocol**: `HTTP`
- **Auto-Deploy**: `Yes` (deploy on every push to main)
- **Pre-Deploy Command**: `pnpm drizzle-kit migrate`

## Step 3: Create PostgreSQL Database

### 3.1 Add Database Service
1. In Render Dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: `osint-scanner-db`
   - **Database**: `osint_scanner`
   - **User**: `osint_user`
   - **Plan**: `Standard` ($15/month) or `Free` (limited)
   - **Region**: Same as web service (e.g., Oregon)
   - **PostgreSQL Version**: `15`

### 3.2 Connect Database to Web Service
1. Copy the **Internal Database URL** from PostgreSQL service
2. In Web Service settings, add environment variable:
   ```
   DATABASE_URL=<paste-internal-url>
   ```
3. Save and redeploy

## Step 4: Configure Webhooks

### 4.1 Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint:
   - **URL**: `https://osint-scanner.onrender.com/api/stripe/webhook`
   - **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Copy **Signing Secret** and add to Render:
   ```
   STRIPE_WEBHOOK_SECRET=<signing-secret>
   ```

### 4.2 PayPal Webhooks
1. Go to PayPal Developer Dashboard → Webhooks
2. Create webhook:
   - **URL**: `https://osint-scanner.onrender.com/api/paypal/webhook`
   - **Events**: Select all payout and payment events
3. Copy **Webhook ID** and add to Render:
   ```
   PAYPAL_WEBHOOK_ID=<webhook-id>
   ```

## Step 5: Deploy

### 5.1 Manual Deploy
1. In Render Dashboard, click "Deploy"
2. Select "Deploy latest commit"
3. Wait for build to complete (5-10 minutes)
4. Check logs for any errors

### 5.2 Auto-Deploy
- Every push to `main` branch automatically triggers deployment
- Monitor deployment status in Render Dashboard
- Check logs if deployment fails

### 5.3 Verify Deployment
1. Visit `https://osint-scanner.onrender.com`
2. Check if app loads
3. Test login with Manus OAuth
4. Verify database connection (check dashboard)

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Custom Domain
1. In Web Service settings, go to "Custom Domains"
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `osint-scanner.com`)
4. Render generates DNS records

### 6.2 Update DNS Records
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add the DNS records provided by Render
3. Wait for DNS propagation (5-30 minutes)
4. Verify domain works

## Step 7: Monitor & Maintain

### 7.1 View Logs
```bash
# In Render Dashboard
Logs → View all logs

# Or via CLI
render logs -s osint-scanner
```

### 7.2 Monitor Performance
- **CPU Usage**: Should be <50% normally
- **Memory Usage**: Should be <60% normally
- **Disk Space**: Monitor database growth

### 7.3 Scaling
If you hit performance limits:
1. Upgrade Web Service plan (Standard → Pro)
2. Upgrade Database plan
3. Add caching layer (Redis)
4. Optimize database queries

## Troubleshooting

### Build Fails
**Error**: "pnpm: command not found"
- **Solution**: Ensure `pnpm` is in build command, or use `npm`

**Error**: "Database connection failed"
- **Solution**: Verify `DATABASE_URL` is correct and database is running

### App Crashes After Deploy
**Check logs**: `render logs -s osint-scanner`
- Look for error messages
- Verify all environment variables are set
- Check database migrations ran successfully

### Webhooks Not Received
- Verify webhook URL is publicly accessible
- Check webhook signing secret in Render
- Monitor webhook logs in Stripe/PayPal dashboard
- Verify firewall/security groups allow inbound traffic

### Cold Starts
On free tier, app may take 30-60 seconds to start after inactivity.
- **Solution**: Upgrade to Standard plan for always-on instances

## Cost Breakdown

| Service | Free Tier | Standard | Pro |
|---------|-----------|----------|-----|
| Web Service | $0 | $7/month | $25/month |
| PostgreSQL | $0 | $15/month | $50/month |
| **Total** | **$0** | **$22/month** | **$75/month** |

**Recommendation**: Start with Free tier to test, upgrade to Standard for production.

## Performance Optimization

### Database
- Add indexes on frequently queried columns
- Use connection pooling
- Archive old data regularly

### Application
- Enable caching (Redis)
- Optimize API calls
- Use CDN for static assets
- Compress responses

### Monitoring
- Set up error tracking (Sentry)
- Monitor performance (New Relic)
- Set up alerts for high CPU/memory

## Security Checklist

- [ ] All API keys are environment variables (not in code)
- [ ] HTTPS is enabled (automatic on Render)
- [ ] Database backups are enabled
- [ ] Firewall rules restrict access appropriately
- [ ] Webhook signatures are verified
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] SQL injection prevention is in place

## Next Steps

1. **Set up monitoring** - Add error tracking and performance monitoring
2. **Configure backups** - Set up automated database backups
3. **Add analytics** - Track user behavior and revenue
4. **Set up CI/CD** - Automate testing before deployment
5. **Plan scaling** - Prepare for growth with caching and optimization

## Support

- **Render Docs**: https://render.com/docs
- **Render Support**: https://render.com/support
- **GitHub Issues**: Report bugs and feature requests
- **Community**: Join Render community for help

---

**Deployment Status**: Ready to deploy to Render.com
**Estimated Setup Time**: 30-45 minutes
**Estimated Monthly Cost**: $22 (Standard plan)
