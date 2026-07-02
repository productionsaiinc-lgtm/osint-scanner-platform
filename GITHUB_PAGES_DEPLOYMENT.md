# OSINT Scanner Platform - GitHub Pages Deployment Guide

This guide walks you through deploying the **frontend only** to GitHub Pages as a static site, while the backend API runs on Render or another service.

## Architecture Overview

- **Frontend**: Static HTML/CSS/JS hosted on GitHub Pages
- **Backend API**: Deployed separately on Render, Railway, or your preferred service
- **Communication**: Frontend calls backend API via CORS-enabled endpoints

## Prerequisites

- GitHub account with the repository
- Backend API deployed and accessible (e.g., on Render)
- GitHub Pages enabled on your repository

## Step 1: Update Repository Settings

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - **Branch**: Select `main` (or your default branch)
4. Click **Save**

## Step 2: Create GitHub Actions Workflow

Create a new file `.github/workflows/deploy-github-pages.yml`:

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
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build:frontend
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_APP_TITLE: OSINT Scanner Platform
          VITE_APP_LOGO: https://your-logo-url.png

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/public
          cname: osint-scanner.your-domain.com  # Optional: for custom domain
```

## Step 3: Update package.json Scripts

Add a build script for the frontend only:

```json
{
  "scripts": {
    "build": "vite build",
    "build:frontend": "vite build",
    "dev": "vite",
    "preview": "vite preview"
  }
}
```

## Step 4: Configure API Endpoint

Update your frontend to use the backend API URL. Create a `.env.production` file:

```
VITE_API_URL=https://your-backend-api.onrender.com
VITE_APP_TITLE=OSINT Scanner Platform
VITE_APP_LOGO=https://your-logo-url.png
```

Or set it in the GitHub Actions workflow as shown above.

## Step 5: Update Frontend API Calls

Ensure your frontend uses the API URL from environment variables:

```typescript
// client/src/lib/trpc.ts
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${apiUrl}/api/trpc`,
      credentials: 'include', // Include cookies for auth
    }),
  ],
});
```

## Step 6: Configure Backend CORS

Your backend must allow requests from GitHub Pages. Update your Express server:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://your-username.github.io',
    'https://osint-scanner.your-domain.com', // Custom domain
    'http://localhost:3000', // Development
  ],
  credentials: true,
}));
```

## Step 7: Push and Deploy

1. Commit and push your changes:
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

2. GitHub Actions will automatically build and deploy your frontend
3. Your site will be available at: `https://your-username.github.io/osint-scanner-platform/`

## Step 8: Custom Domain (Optional)

To use a custom domain:

1. Create a `CNAME` file in `client/public/`:
```
osint-scanner.your-domain.com
```

2. Update your DNS provider to point to GitHub Pages:
```
CNAME osint-scanner.your-domain.com -> your-username.github.io
```

3. Update the workflow file to include the CNAME in deployment

## Step 9: Backend Deployment

Deploy your backend separately (e.g., on Render):

1. Follow the [Render Deployment Guide](./RENDER_DEPLOYMENT.md)
2. Set `VITE_API_URL` to your backend URL
3. Ensure CORS is configured correctly

## Troubleshooting

### 404 Errors on Page Refresh
GitHub Pages doesn't support client-side routing by default. Add a `404.html` file:

```html
<!DOCTYPE html>
<html>
  <head>
    <script>
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/osint-scanner-platform/'"></meta>
  </head>
  <body>
  </body>
</html>
```

Then update `client/src/main.tsx` to handle redirects:

```typescript
if (sessionStorage.redirect) {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  window.location.href = redirect;
}
```

### CORS Errors
- Verify backend CORS configuration
- Check `VITE_API_URL` is correct
- Ensure backend is running and accessible

### Build Fails
- Check Node.js version (22.x recommended)
- Verify all dependencies are installed
- Check environment variables are set in GitHub Actions

## Performance Tips

1. **Enable Gzip Compression**: GitHub Pages automatically compresses files
2. **Cache Busting**: Vite automatically handles this with hash-based filenames
3. **Lazy Loading**: Code-split pages with React.lazy()
4. **Image Optimization**: Use WebP format with fallbacks

## Monitoring

1. Check deployment status: **Settings** → **Pages** → **Deployments**
2. View build logs: **Actions** tab
3. Monitor API calls: Browser DevTools → Network tab

## Cost

- **GitHub Pages**: Free (unlimited)
- **Custom Domain**: $10-15/year (optional)
- **Backend API**: Varies by provider ($7-50+/month)

## Next Steps

1. Deploy frontend to GitHub Pages
2. Deploy backend to Render
3. Test API connectivity
4. Set up custom domain (optional)
5. Configure monitoring and alerts

## Support

- GitHub Pages Docs: https://pages.github.com
- GitHub Actions Docs: https://docs.github.com/en/actions
- Vite Docs: https://vitejs.dev
