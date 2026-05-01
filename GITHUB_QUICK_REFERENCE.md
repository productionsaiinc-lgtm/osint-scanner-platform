# GitHub Deployment - Quick Reference Card

## 🚀 Deploy in 3 Commands

```bash
# 1. Commit your changes
git add .
git commit -m "Your descriptive message"

# 2. Push to GitHub
git push user_github main

# 3. Wait 2-5 minutes ⏳
# Your site updates automatically at: https://osintscan-fftqerzj.manus.space
```

---

## 📋 Before You Push

Always test locally first:

```bash
# Install dependencies (first time only)
pnpm install

# Start dev server
pnpm dev

# Build to check for errors
pnpm build

# Run tests
pnpm test
```

---

## 💾 Common Workflows

### Adding a New Feature
```bash
git add .
git commit -m "feat: add new OSINT tool"
git push user_github main
```

### Fixing a Bug
```bash
git add .
git commit -m "fix: resolve email validation issue"
git push user_github main
```

### Updating Styling
```bash
git add .
git commit -m "style: update button colors"
git push user_github main
```

### Updating Dependencies
```bash
pnpm update
git add .
git commit -m "chore: update dependencies"
git push user_github main
```

---

## 🔍 Check Deployment Status

```bash
# View your commits
git log --oneline -5

# Check git status
git status

# View what changed
git diff
```

---

## 🆘 Troubleshooting

### Site didn't update?
1. Wait 2-5 minutes
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check Manus Dashboard for build errors

### Permission denied?
```bash
# Set up SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add public key to GitHub Settings → SSH Keys
```

### Merge conflict?
```bash
git pull user_github main
# Fix conflicts in your editor
git add .
git commit -m "resolve merge conflict"
git push user_github main
```

---

## 📊 Your Setup

- **Live Site**: https://osintscan-fftqerzj.manus.space
- **GitHub Repo**: https://github.com/productionsaiinc-lgtm/osint-scanner-platform
- **Deployment**: Automatic (2-5 minutes after push)
- **Cost**: FREE (no Manus credits needed!)

---

## ✅ Best Practices

✅ **DO:**
- Write clear commit messages
- Test locally before pushing
- Push to `main` branch
- Use `git push user_github main`

❌ **DON'T:**
- Push without testing
- Commit large files (use S3 instead)
- Force push to main (`--force`)
- Commit secrets/API keys

---

## 🔑 Environment Variables

Your secrets are already configured in Manus. When pushing code:
- **Never commit** `.env.local` or `.env` files
- These are automatically injected during deployment
- Check `.gitignore` has `.env*` listed

---

## 📚 Full Guide

See `GITHUB_DEPLOYMENT_GUIDE.md` in your project for detailed instructions.

---

**That's it! Push your code and relax. Manus handles the rest. 🎉**
