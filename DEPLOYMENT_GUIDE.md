# OSINT Scanner Platform - Deployment Guide

This guide covers deploying your OSINT platform to various cloud providers and self-hosted environments.

## Quick Deployment Options

| Platform | Difficulty | Cost | Setup Time | Best For |
|----------|-----------|------|-----------|----------|
| **Manus (Current)** | ⭐ Easy | $0-10/mo | 5 min | Quick prototyping |
| **Docker** | ⭐⭐ Easy | Varies | 15 min | Self-hosted, local dev |
| **Railway** | ⭐⭐ Easy | $5-50/mo | 10 min | Simple deployments |
| **Render** | ⭐⭐ Easy | $7-100/mo | 15 min | Free tier available |
| **Vercel** | ⭐⭐⭐ Medium | $0-50/mo | 20 min | Serverless functions |
| **AWS** | ⭐⭐⭐⭐ Hard | $20-200/mo | 1-2 hours | Enterprise grade |
| **DigitalOcean** | ⭐⭐⭐ Medium | $5-40/mo | 30 min | VPS hosting |
| **Heroku** | ⭐⭐ Easy | $50+/mo | 15 min | Legacy (expensive) |

---

## 1. Docker Deployment

### Local Development with Docker

```bash
# Build Docker image
docker build -t osint-scanner .

# Run with docker-compose
docker-compose up -d

# Access application
open http://localhost:3000
```

### Docker Hub Deployment

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag osint-scanner:latest yourusername/osint-scanner:latest

# Push to Docker Hub
docker push yourusername/osint-scanner:latest

# Pull and run anywhere
docker run -d \
  -e DATABASE_URL="mysql://user:pass@host/db" \
  -e JWT_SECRET="your-secret" \
  -p 3000:3000 \
  yourusername/osint-scanner:latest
```

### Docker Compose Production Stack

```bash
# Start all services (app + MySQL + Redis)
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## 2. Railway Deployment

### Step 1: Connect GitHub
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your OSINT repository
4. Authorize Railway

### Step 2: Configure Environment
1. Add environment variables:
   - `DATABASE_URL`: MySQL connection string
   - `JWT_SECRET`: Your secret key
   - `STRIPE_SECRET_KEY`: Stripe key
   - All API keys (Shodan, Etherscan, etc.)

### Step 3: Deploy
```bash
# Railway CLI deployment
railway login
railway link
railway up
```

**Cost:** $5-50/month (pay-as-you-go)

---

## 3. Render Deployment

### Step 1: Create Web Service
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Select `main` branch

### Step 2: Configure Build
- **Build Command:** `pnpm install && pnpm run build`
- **Start Command:** `node dist/index.js`
- **Environment:** Node

### Step 3: Add Database
1. Create PostgreSQL database
2. Copy connection string
3. Set as `DATABASE_URL` environment variable

### Step 4: Deploy
Render auto-deploys on git push

**Cost:** $7-100/month

---

## 4. Vercel Deployment

⚠️ **Note:** Vercel is optimized for Next.js. Express apps work but with limitations.

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
vercel --prod
```

### Step 3: Configure Environment
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add all required secrets

**Limitations:**
- 60-second request timeout
- Serverless functions (not ideal for long-running tasks)
- Better for static sites

---

## 5. AWS Deployment

### Option A: EC2 + RDS

```bash
# Deploy CloudFormation stack
aws cloudformation create-stack \
  --stack-name osint-scanner \
  --template-body file://aws-deployment.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production

# Monitor deployment
aws cloudformation describe-stacks --stack-name osint-scanner
```

### Option B: ECS (Elastic Container Service)

```bash
# Create ECR repository
aws ecr create-repository --repository-name osint-scanner

# Push Docker image
docker tag osint-scanner:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/osint-scanner:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/osint-scanner:latest

# Deploy to ECS
aws ecs create-service \
  --cluster osint-cluster \
  --service-name osint-app \
  --task-definition osint-task:1 \
  --desired-count 1
```

### Option C: Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p "Node.js 22" osint-scanner

# Create environment
eb create osint-prod

# Deploy
eb deploy

# View logs
eb logs
```

**Cost:** $20-200/month

---

## 6. DigitalOcean Deployment

### Step 1: Create Droplet
```bash
# Create via CLI
doctl compute droplet create osint-app \
  --region nyc3 \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-4gb
```

### Step 2: SSH into Droplet
```bash
ssh root@your-droplet-ip
```

### Step 3: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
apt install -y mysql-server

# Install Nginx (reverse proxy)
apt install -y nginx
```

### Step 4: Deploy Application
```bash
# Clone repository
git clone https://github.com/your-repo/osint-scanner-platform.git
cd osint-scanner-platform

# Install dependencies
pnpm install

# Build
pnpm run build

# Run migrations
DATABASE_URL="mysql://..." pnpm run migrate

# Start application
NODE_ENV=production PORT=3000 node dist/index.js &
```

### Step 5: Configure Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 6: Enable HTTPS
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com
```

**Cost:** $5-40/month

---

## 7. Self-Hosted (VPS/Dedicated Server)

### Requirements
- Ubuntu 22.04 LTS or similar
- 2GB+ RAM
- 20GB+ storage
- Root/sudo access

### Installation Steps

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install pnpm
sudo npm install -g pnpm

# 4. Install MySQL 8
sudo apt install -y mysql-server

# 5. Install Redis
sudo apt install -y redis-server

# 6. Install Nginx
sudo apt install -y nginx

# 7. Install PM2 (process manager)
sudo npm install -g pm2

# 8. Clone and setup application
git clone https://github.com/your-repo/osint-scanner-platform.git
cd osint-scanner-platform

# 9. Install dependencies
pnpm install

# 10. Build
pnpm run build

# 11. Create .env file
cat > .env << EOF
DATABASE_URL=mysql://osint:password@localhost:3306/osint_db
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
STRIPE_SECRET_KEY=your-stripe-key
SHODAN_API_KEY=your-shodan-key
# ... add all other API keys
EOF

# 12. Run migrations
pnpm run migrate

# 13. Start with PM2
pm2 start dist/index.js --name "osint-app"
pm2 save
pm2 startup

# 14. Configure Nginx
sudo tee /etc/nginx/sites-available/osint << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 15. Enable site
sudo ln -s /etc/nginx/sites-available/osint /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 16. Setup SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables Required

All deployments need these environment variables:

```env
# Core
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@host:3306/db

# Authentication
JWT_SECRET=your-secret-key-min-32-chars
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# OSINT APIs
SHODAN_API_KEY=...
ETHERSCAN_API_KEY=...
IMEI_API_KEY=...
OPENSKY_API_KEY=...
VIRUSTOTAL_API_KEY=...

# Optional
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## Monitoring & Maintenance

### Health Checks
```bash
# Check application health
curl https://your-domain.com/health

# Check database
mysql -h host -u user -p -e "SELECT 1"

# Check logs
pm2 logs osint-app
```

### Backups
```bash
# Backup MySQL database
mysqldump -u user -p database_name > backup.sql

# Backup to S3
aws s3 cp backup.sql s3://your-bucket/backups/
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
pnpm install

# Build
pnpm run build

# Run migrations
pnpm run migrate

# Restart application
pm2 restart osint-app
```

---

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs osint-app

# Verify environment variables
env | grep DATABASE_URL

# Test database connection
mysql -h $DB_HOST -u $DB_USER -p
```

### High memory usage
```bash
# Check memory
free -h

# Increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Database connection errors
```bash
# Verify MySQL is running
sudo systemctl status mysql

# Check connection string
echo $DATABASE_URL

# Test connection
mysql -h host -u user -p -e "SELECT 1"
```

---

## Recommendations

**For Development:** Docker + docker-compose

**For Small Projects:** Railway or Render (easiest)

**For Medium Projects:** DigitalOcean VPS or AWS EC2

**For Large Scale:** AWS (ECS/EKS) or Kubernetes

**For Maximum Uptime:** Multi-region deployment with load balancing

---

## Support

- **Manus:** https://help.manus.im
- **Railway:** https://railway.app/support
- **Render:** https://render.com/support
- **AWS:** https://aws.amazon.com/support
- **DigitalOcean:** https://www.digitalocean.com/support

---

**Last Updated:** May 2026
