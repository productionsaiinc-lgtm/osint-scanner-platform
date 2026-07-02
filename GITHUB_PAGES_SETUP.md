# GitHub Pages Deployment Guide

Deploy your OSINT platform frontend to GitHub Pages (free) with backend API on Manus.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Pages (Frontend - Static HTML/CSS/JS)           │
│  https://yourusername.github.io/osint-scanner-platform  │
└────────────────┬────────────────────────────────────────┘
                 │ API Calls
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Manus Backend (Node.js + Express + tRPC)               │
│  https://osintscan-fftqerzj.manus.space/api/trpc        │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Create Frontend Repository

```bash
# Clone your current repo
git clone https://github.com/productionsaiinc-lgtm/osint-scanner-platform.git
cd osint-scanner-platform

# Create new branch for frontend-only
git checkout -b frontend-github-pages

# Remove backend files (keep only client/)
rm -rf server/ drizzle/ .env* *.env

# Keep only frontend files
mv client/* .
rmdir client
```

## Step 2: Update Vite Configuration

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/osint-scanner-platform/', // GitHub Pages path
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://osintscan-fftqerzj.manus.space',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
```

## Step 3: Update API Endpoints

Create `src/lib/api-config.ts`:

```typescript
// Use Manus backend API
export const API_BASE_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://osintscan-fftqerzj.manus.space/api'
    : 'http://localhost:3000/api'

export const TRPC_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://osintscan-fftqerzj.manus.space/api/trpc'
    : 'http://localhost:3000/api/trpc'
```

Update `src/lib/trpc.ts`:

```typescript
import { createTRPCReact } from '@trpc/react-query'
import { TRPC_URL } from './api-config'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      credentials: 'include', // Include cookies for auth
    }),
  ],
})
```

## Step 4: Update package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && git add dist && git commit -m 'Deploy to GitHub Pages' && git push"
  },
  "dependencies": {
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Step 5: Set Up GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: osint-scanner.yourdomain.com  # Optional: custom domain
```

## Step 6: Enable GitHub Pages

1. Go to GitHub repository settings
2. Navigate to "Pages" section
3. Select "Deploy from a branch"
4. Choose branch: `gh-pages`
5. Click "Save"

Your site will be available at: `https://yourusername.github.io/osint-scanner-platform`

## Step 7: Test Deployment

```bash
# Build locally
pnpm run build

# Preview build
pnpm run preview

# Push to GitHub (triggers automatic deployment)
git add .
git commit -m "feat: configure for GitHub Pages deployment"
git push origin frontend-github-pages
```

## Step 8: Create Pull Request & Merge

1. Create PR from `frontend-github-pages` to `main`
2. Review changes
3. Merge to `main`
4. GitHub Actions automatically deploys to GitHub Pages

## Verification

✅ Frontend deployed to GitHub Pages
✅ Backend API running on Manus
✅ API calls working with CORS enabled
✅ Authentication working with Manus OAuth

## Troubleshooting

### CORS Errors
Add CORS headers to Manus backend in `server/_core/index.ts`:

```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  next()
})
```

### 404 on Refresh
Add `_redirects` file to `public/`:

```
/*    /index.html   200
```

Or use `dist/_redirects` for GitHub Pages.

### API Not Found
Verify Manus backend is running:
```bash
curl https://osintscan-fftqerzj.manus.space/api/trpc
```

## Benefits

✅ **Free hosting** - GitHub Pages is free
✅ **Fast CDN** - GitHub Pages uses global CDN
✅ **Automatic deployment** - Push to GitHub = auto-deploy
✅ **No cold starts** - Static files load instantly
✅ **Scalable backend** - Manus backend handles API calls
✅ **Easy rollback** - Revert to previous deployment anytime

## Next Steps

1. Push frontend to GitHub Pages
2. Verify API calls working
3. Test authentication flow
4. Monitor performance with GitHub Pages analytics
5. Set up custom domain (optional)
