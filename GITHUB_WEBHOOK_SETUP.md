# GitHub Webhook Setup Guide

## Overview

Your OSINT platform has a GitHub webhook endpoint that automatically builds, tests, and deploys your application whenever you push changes to the `main` branch.

## Webhook Endpoint

**URL:** `https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy`

**Method:** POST

**Events:** Push events to `main` branch

## Setup Instructions

### Step 1: Generate a Webhook Secret

Generate a secure random string to use as your webhook secret:

```bash
# Using OpenSSL (recommended)
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Step 2: Add Secret to Environment Variables

Add the generated secret to your Manus project settings:

1. Go to **Settings → Secrets** in the Manus Management UI
2. Add a new secret: `GITHUB_WEBHOOK_SECRET`
3. Paste your generated secret value
4. Save

### Step 3: Configure GitHub Webhook

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/osint-scanner-platform`
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Fill in the following details:

| Field | Value |
|-------|-------|
| **Payload URL** | `https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy` |
| **Content type** | `application/json` |
| **Secret** | Paste your generated secret here |
| **Which events would you like to trigger this webhook?** | Select "Push events" |
| **Active** | ✓ Checked |

4. Click **Add webhook**

### Step 4: Test the Webhook

GitHub will automatically send a test "ping" event. You should see:

- **Status:** ✓ (green checkmark)
- **Response:** `{"success": true, "message": "GitHub deploy webhook is ready"}`

## How It Works

When you push to the `main` branch:

1. **GitHub sends a webhook** with your commit details
2. **Signature verification** - The webhook verifies the request is from GitHub using your secret
3. **Build pipeline starts:**
   - Pulls latest changes from GitHub
   - Installs dependencies
   - Runs all tests
   - Builds the project
4. **Deployment** - Manus platform automatically deploys the built code
5. **Live update** - Your site updates at `https://osintscan-fftqerzj.manus.space`

## Manual Trigger (Testing)

You can manually trigger a build without pushing to GitHub:

```bash
curl -X POST https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy/status \
  -H "Content-Type: application/json"
```

## Webhook Status Endpoint

Check the current webhook status:

```bash
curl https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy/status
```

Response example:
```json
{
  "success": true,
  "status": "ready",
  "lastSync": "2026-05-22T01:45:00Z",
  "lastResult": {
    "success": true,
    "timestamp": "2026-05-22T01:45:00Z",
    "branch": "main",
    "commits": 3,
    "message": "Deployment successful"
  }
}
```

## Troubleshooting

### Webhook Not Triggering

1. **Check GitHub webhook logs:**
   - Go to Settings → Webhooks → Your webhook
   - Click "Recent Deliveries"
   - Check for failed requests and error messages

2. **Verify secret is correct:**
   - Ensure `GITHUB_WEBHOOK_SECRET` is set in Manus Settings
   - Secret must match exactly what you configured in GitHub

3. **Check branch name:**
   - Webhook only triggers on `main` branch
   - If pushing to other branches, manually trigger or merge to main

### Build Failures

Check the webhook response details:
- Go to GitHub webhook settings
- Click "Recent Deliveries"
- Click the failed delivery to see error details

Common issues:
- **Dependency conflicts** - Run `pnpm install` locally to verify
- **Test failures** - Run `pnpm test` locally to debug
- **TypeScript errors** - Run `pnpm build` locally to check

## Using with curl (Alternative)

If you want to manually trigger deployment via curl:

```bash
# Manual trigger (no signature verification needed for testing)
curl -X POST https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{
    "ref": "refs/heads/main",
    "repository": {
      "name": "osint-scanner-platform",
      "full_name": "YOUR_USERNAME/osint-scanner-platform"
    },
    "commits": [
      {
        "id": "abc123",
        "message": "Manual trigger test",
        "author": {"name": "Test", "email": "test@example.com"}
      }
    ]
  }'
```

## Environment Variables Required

Make sure these are set in your Manus project:

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_WEBHOOK_SECRET` | Secret for webhook signature verification | ✓ Yes |
| `GITHUB_DEPLOY_BRANCH` | Branch to deploy (default: `main`) | No |

## Advanced Configuration

### Custom Build Commands

To use custom build commands, set environment variables:

```bash
# In Manus Settings → Secrets
GITHUB_BUILD_COMMAND=pnpm run build:prod
GITHUB_INSTALL_COMMAND=pnpm install --frozen-lockfile
```

### Disable Webhook

To temporarily disable the webhook without removing it from GitHub:

1. Go to GitHub webhook settings
2. Uncheck the **Active** checkbox
3. Click **Update webhook**

## Support

If you encounter issues:

1. Check webhook delivery logs in GitHub
2. Verify environment variables are set correctly
3. Ensure the `main` branch is being pushed to
4. Check that tests pass locally before pushing

For more help, visit: https://help.manus.im
