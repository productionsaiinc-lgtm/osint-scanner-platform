# OSINT Scanner Platform - Render Deployment Guide

This guide walks you through deploying the OSINT Scanner Platform to Render with a static frontend and Node.js backend.

## Architecture Overview

- **Frontend**: Static HTML/CSS/JS built with Vite (served from `dist/public`)
- **Backend**: Express.js server with tRPC API (Node.js)
- **Database**: MySQL/TiDB (managed database service)
- **Environment**: Production Node.js on Render

## Prerequisites

- Render account (https://render.com)
- GitHub repository with the project code
- MySQL/TiDB database (Render offers managed databases)
- All API keys for external services (Hunter.io, Etherscan, VirusTotal, etc.)

## Step 1: Prepare Your Repository

Ensure your GitHub repository is up to date with all changes:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Create a Render Web Service

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Select your GitHub repository
4. Configure the service:
   - **Name**: `osint-scanner-platform`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Standard ($7/month) or higher

## Step 3: Configure Environment Variables

In the Render dashboard, add the following environment variables:

### Database
```
DATABASE_URL=mysql://user:password@host:3306/database_name
```

### Authentication & OAuth
```
JWT_SECRET=your-secure-random-string
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
```

### API Keys (External Services)
```
HUNTER_API_KEY=your-hunter-io-key
ETHERSCAN_API_KEY=your-etherscan-key
VIRUSTOTAL_API_KEY=your-virustotal-key
OPENSKY_API_KEY=your-opensky-key
NUMVERIFY_API_KEY=your-numverify-key
SHODAN_API_KEY=your-shodan-key
```

### Stripe Integration
```
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

### PayPal Integration
```
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_PAYOUT_EMAIL=your-payout-email
```

### Manus Built-in APIs
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
```

### Analytics (Optional)
```
VITE_ANALYTICS_ENDPOINT=your-analytics-endpoint
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### App Configuration
```
NODE_ENV=production
VITE_APP_TITLE=OSINT Scanner Platform
VITE_APP_LOGO=https://your-logo-url.png
```

## Step 4: Create or Connect Database

### Option A: Use Render's Managed MySQL
1. In Render dashboard, click **New +** → **MySQL**
2. Configure the database
3. Copy the connection string to `DATABASE_URL`

### Option B: Use External Database
If using TiDB or another provider, ensure the connection string is added to `DATABASE_URL`.

## Step 5: Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy your application
3. Monitor the deployment in the **Logs** tab
4. Once deployed, your app will be available at `https://your-service-name.onrender.com`

## Step 6: Verify Deployment

1. Visit your deployed URL
2. Check that the frontend loads correctly
3. Test API endpoints: `https://your-service-name.onrender.com/api/trpc`
4. Verify database connectivity by checking user authentication

## Step 7: Configure Custom Domain (Optional)

1. In Render dashboard, go to your Web Service
2. Click **Settings** → **Custom Domain**
3. Add your domain and follow DNS configuration instructions

## Step 8: Set Up Webhooks

### Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-service-name.onrender.com/api/stripe/webhook`
3. Select events: `payment_intent.succeeded`, `charge.refunded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### PayPal Webhook
1. Go to PayPal Developer Dashboard
2. Configure webhook URL: `https://your-service-name.onrender.com/api/paypal/webhook`
3. Copy webhook ID to environment variables if needed

## Troubleshooting

### Build Fails
- Check logs for errors
- Ensure `npm run build` works locally: `npm run build`
- Verify all dependencies are in `package.json`

### Runtime Errors
- Check environment variables are set correctly
- Verify database connection string
- Check API keys are valid
- Review logs for specific error messages

### 404 Errors
- Ensure frontend is built: `npm run build` creates `dist/public`
- Check `serveStatic()` middleware is configured
- Verify `dist/public/index.html` exists

### Database Connection Issues
- Verify `DATABASE_URL` format: `mysql://user:pass@host:port/db`
- Check database is running and accessible
- Ensure firewall allows connections from Render

## Performance Optimization

### Enable Caching
Add to Render environment:
```
CACHE_CONTROL=public, max-age=3600
```

### Monitor Performance
- Use Render's built-in metrics
- Check database query performance
- Monitor API response times

## Scaling

### Vertical Scaling
- Upgrade Render plan for more CPU/RAM
- Standard ($7) → Pro ($12) → Premium ($25+)

### Horizontal Scaling
- Use Render's load balancing
- Deploy multiple instances
- Use Redis for session management (if needed)

## Maintenance

### Regular Updates
```bash
git pull origin main
git push origin main  # Triggers auto-deploy
```

### Database Backups
- Enable automated backups in database settings
- Test restore procedures regularly

### Monitoring
- Set up alerts for deployment failures
- Monitor error rates and performance
- Review logs weekly

## Cost Estimation

| Service | Cost |
|---------|------|
| Web Service (Standard) | $7/month |
| MySQL Database (Starter) | $15/month |
| **Total** | **$22/month** |

## Support

- Render Documentation: https://render.com/docs
- Render Support: https://support.render.com
- Project Issues: Check GitHub repository

## Next Steps

1. Deploy to Render using this guide
2. Test all OSINT tools with real API keys
3. Monitor performance and logs
4. Set up custom domain
5. Configure automated backups
6. Document any customizations
