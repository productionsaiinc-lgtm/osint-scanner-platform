# OSINT Scanner Platform - Fly.io Deployment Guide

## Quick Start (10 minutes)

### Prerequisites
- GitHub account with your OSINT platform repository
- Fly.io account (free at https://fly.io)
- Fly CLI installed (`brew install flyctl` on macOS)

### Step 1: Install Fly CLI
```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
iwr https://fly.io/install.ps1 -useb | iex
```

### Step 2: Authenticate with Fly.io
```bash
fly auth login
```

### Step 3: Initialize Your App
```bash
cd /path/to/osint-scanner-platform
fly launch
```

Follow the prompts:
- **App Name:** `osint-scanner`
- **Region:** Choose closest to your users (e.g., `pdx` for Portland)
- **PostgreSQL:** Yes (create database)
- **Upstash Redis:** No (optional, for caching)

### Step 4: Set Environment Variables
```bash
fly secrets set NODE_ENV=production
fly secrets set PORT=3000
fly secrets set JWT_SECRET=$(openssl rand -hex 32)
fly secrets set VITE_APP_ID=your_app_id
fly secrets set OAUTH_SERVER_URL=https://api.manus.im
fly secrets set VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
fly secrets set OWNER_OPEN_ID=your_owner_id
fly secrets set OWNER_NAME="Your Name"
fly secrets set BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
fly secrets set BUILT_IN_FORGE_API_KEY=your_forge_key
fly secrets set VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
fly secrets set VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key
fly secrets set STRIPE_SECRET_KEY=your_stripe_key
fly secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
fly secrets set VITE_STRIPE_PUBLISHABLE_KEY=your_publishable_key
fly secrets set PAYPAL_CLIENT_ID=your_paypal_id
fly secrets set PAYPAL_CLIENT_SECRET=your_paypal_secret
fly secrets set PAYPAL_MODE=sandbox
fly secrets set PAYPAL_PAYOUT_EMAIL=your_email@example.com
fly secrets set SHODAN_API_KEY=your_shodan_key
fly secrets set ETHERSCAN_API_KEY=your_etherscan_key
fly secrets set VIRUSTOTAL_API_KEY=your_virustotal_key
fly secrets set OPENSKY_API_KEY=your_opensky_key
fly secrets set IMEI_API_KEY=your_imei_key
```

### Step 5: Deploy
```bash
fly deploy
```

Your app is now live at: `https://osint-scanner.fly.dev`

---

## Using fly.toml (Automatic Configuration)

We've included a `fly.toml` file that automatically configures your deployment:

```bash
# Deploy using fly.toml
git add fly.toml
git commit -m "Add Fly.io configuration"
git push origin main

# Then deploy
fly deploy
```

---

## Database Setup

### Create PostgreSQL Database
```bash
fly postgres create
```

Follow the prompts to create a database instance.

### Attach Database to Your App
```bash
fly postgres attach --app osint-scanner
```

This automatically sets `DATABASE_URL` environment variable.

### Run Migrations
```bash
fly ssh console
pnpm drizzle-kit migrate
exit
```

Or use the release command in `fly.toml` (runs automatically on deployment).

---

## Monitoring & Logs

### View Logs
```bash
fly logs
```

### SSH into App
```bash
fly ssh console
```

### Monitor Metrics
```bash
fly status
fly logs --follow
```

---

## Scaling & Performance

### Scale Machines
```bash
# View current machines
fly machines list

# Scale up memory/CPU
fly scale memory 512
fly scale count 2
```

### Auto-Scaling (Paid Plan)
Uncomment in `fly.toml`:
```toml
[[processes.app.auto_scaling]]
  min_machines = 1
  max_machines = 3
  metrics = {cpu_percent = 80, memory_percent = 80}
  period = "30s"
```

---

## Custom Domain

### Add Custom Domain
```bash
fly certs add yourdomain.com
```

### Update DNS Records
Fly.io will provide DNS records to add to your domain registrar.

---

## Troubleshooting

### Build Failures
```bash
# Check build logs
fly logs

# Rebuild
fly deploy --build-only
```

### Database Connection Issues
```bash
# Check database status
fly postgres status

# Verify DATABASE_URL
fly secrets list | grep DATABASE_URL
```

### App Not Starting
```bash
# SSH into app and check
fly ssh console
npm start
```

### Out of Memory
```bash
# Increase memory
fly scale memory 512

# Monitor usage
fly logs
```

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| App (Shared CPU) | Free | $0 |
| PostgreSQL | Free | $0 |
| **Total** | | **$0** |

Upgrade to paid when ready:
- App (Dedicated CPU): $5-15/month
- PostgreSQL: $5-50/month depending on size

---

## GitHub Actions Integration

### Auto-Deploy on Push
Create `.github/workflows/fly-deploy.yml`:

```yaml
name: Fly Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy app
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### Generate API Token
```bash
fly tokens create deploy
```

Add the token to GitHub Secrets as `FLY_API_TOKEN`.

---

## Useful Commands

```bash
# View app status
fly status

# View all apps
fly apps list

# View logs
fly logs

# SSH into app
fly ssh console

# Deploy
fly deploy

# Rollback to previous release
fly releases

# View machines
fly machines list

# Restart app
fly apps restart osint-scanner

# View secrets
fly secrets list

# Set secret
fly secrets set KEY=value

# Remove secret
fly secrets unset KEY

# View environment
fly config show

# Update configuration
fly config save
```

---

## Regional Availability

Available regions:
- **North America:** `pdx` (Portland), `sea` (Seattle), `lax` (Los Angeles), `dfw` (Dallas), `iad` (Washington DC), `ewr` (Newark), `yyz` (Toronto)
- **Europe:** `ams` (Amsterdam), `cdg` (Paris), `fra` (Frankfurt), `lhr` (London), `mad` (Madrid)
- **Asia-Pacific:** `hkg` (Hong Kong), `nrt` (Tokyo), `sin` (Singapore), `syd` (Sydney)

Change region in `fly.toml`:
```toml
primary_region = "lhr"  # London
```

---

## Next Steps

1. Monitor app in Fly.io Dashboard
2. Test all features in production
3. Set up error tracking (Sentry, etc.)
4. Configure backups and disaster recovery
5. Scale resources as traffic increases
6. Set up custom domain
7. Enable auto-scaling for high traffic

---

## Support

- **Fly.io Docs:** https://fly.io/docs/
- **Fly.io Community:** https://community.fly.io/
- **GitHub Actions:** https://github.com/superfly/flyctl-actions
