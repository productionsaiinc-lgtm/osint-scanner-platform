#!/bin/bash

# GitHub Webhook Setup Script
# This script helps you set up the GitHub webhook for automated deployments

set -e

echo "================================"
echo "GitHub Webhook Setup"
echo "================================"
echo ""

# Check if secret is provided
if [ -z "$1" ]; then
    echo "Generating a new webhook secret..."
    SECRET=$(openssl rand -hex 32)
    echo "✓ Generated secret: $SECRET"
    echo ""
    echo "Next steps:"
    echo "1. Copy the secret above"
    echo "2. Go to Manus Settings → Secrets"
    echo "3. Add GITHUB_WEBHOOK_SECRET with the value above"
    echo "4. Then run: $0 $SECRET"
else
    SECRET=$1
    echo "Using provided secret"
fi

echo ""
echo "================================"
echo "GitHub Webhook Configuration"
echo "================================"
echo ""
echo "Webhook URL: https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy"
echo "Content Type: application/json"
echo "Secret: $SECRET"
echo "Events: Push events"
echo ""
echo "Setup Instructions:"
echo "1. Go to: https://github.com/YOUR_USERNAME/osint-scanner-platform/settings/hooks"
echo "2. Click 'Add webhook'"
echo "3. Enter the above details"
echo "4. Click 'Add webhook'"
echo ""
echo "To test the webhook:"
echo "  curl https://osintscan-fftqerzj.manus.space/api/webhooks/github/deploy/status"
echo ""
