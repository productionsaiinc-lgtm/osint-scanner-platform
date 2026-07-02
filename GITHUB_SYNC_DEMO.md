# Autonomous GitHub Sync Demo

This document demonstrates how to use the `autonomous-github-sync` skill to commit and push changes to GitHub without manual intervention.

## Demo Scenario: Adding New Features to OSINT Platform

### Example 1: Update README with Quick Start Guide

**Changes Made:**
- Added "🚀 Quick Start" section with local development commands
- Added "Deploy to Production" section with git push workflow
- Improved documentation for new users

**File Changed:** `README.md`

**Commit Message:**
```
docs: add quick start and deployment guide to README

- Add local development setup instructions
- Add production deployment workflow
- Improve documentation for new contributors
```

---

### Example 2: Add Feature Flag Configuration

**Changes Made:**
- Create new feature flags system for gradual rollout
- Document feature flag usage patterns
- Add examples for A/B testing

**File Changed:** `server/_core/feature-flags.ts` (new)

**Commit Message:**
```
feat: add feature flag system for gradual feature rollout

- Implement feature flag middleware
- Add support for A/B testing and gradual rollout
- Include examples for common patterns
```

---

### Example 3: Enhance Security Documentation

**Changes Made:**
- Document API key security best practices
- Add webhook signature verification guide
- Include security audit checklist

**File Changed:** `SECURITY.md` (new)

**Commit Message:**
```
docs: add comprehensive security documentation

- Document API key management best practices
- Add webhook signature verification guide
- Include security audit checklist for deployments
```

---

## How to Use autonomous-github-sync

### Step 1: Make Changes in Manus Sandbox

```bash
# Edit files in the sandbox
nano /home/ubuntu/osint-scanner-platform/README.md
nano /home/ubuntu/osint-scanner-platform/server/_core/feature-flags.ts
```

### Step 2: Create Deployment Package

```bash
# Create a folder with all changed files
mkdir -p /tmp/osint-sync-$(date +%s)
cp /home/ubuntu/osint-scanner-platform/README.md /tmp/osint-sync-*/
cp /home/ubuntu/osint-scanner-platform/server/_core/feature-flags.ts /tmp/osint-sync-*/
```

### Step 3: Upload to Google Drive

```bash
# Upload changed files to Google Drive
rclone copy /tmp/osint-sync-* manus_google_drive:osint-sync-$(date +%s) \
  --config /home/ubuntu/.gdrive-rclone.ini

# Get the folder ID
rclone lsd manus_google_drive: --config /home/ubuntu/.gdrive-rclone.ini | grep osint-sync
```

### Step 4: Run Sync Script on Local Machine

```bash
# On your local machine, run the sync script
python3 ~/gdrive_to_repo_sync.py osint-sync-1707543210 \
  /path/to/local/osint-scanner-platform \
  "docs: add quick start and deployment guide"
```

### Step 5: Verify Push

```bash
# Check GitHub to confirm changes were pushed
git log --oneline -5

# Or check on GitHub.com
# https://github.com/productionsaiinc-lgtm/osint-scanner-platform/commits/main
```

---

## Benefits of autonomous-github-sync

✅ **No Manual Download/Upload** - Automated file transfer via Google Drive
✅ **Atomic Commits** - All changes committed together with descriptive message
✅ **Automatic Deployment** - Changes auto-deploy to Manus after push
✅ **Audit Trail** - Full Git history with timestamps and commit messages
✅ **Rollback Support** - Easy to revert changes if needed
✅ **Team Friendly** - Works with multiple developers

---

## Fallback: Patch Method

If Google Drive sync isn't available, use the patch method:

```bash
# Create patch file
cd /home/ubuntu/osint-scanner-platform
git format-patch origin/main --stdout > /tmp/changes.patch

# Share patch with user (via Google Drive, email, etc.)
# User applies patch locally:
cd /path/to/local/repo
git am < ~/Downloads/changes.patch
git push origin main
```

---

## Next Steps

1. **Set up Google Drive integration** on your local machine
2. **Copy sync script** to your home directory
3. **Test with small changes** before large updates
4. **Monitor GitHub** for successful pushes

For more details, see `/home/ubuntu/skills/autonomous-github-sync/SKILL.md`
