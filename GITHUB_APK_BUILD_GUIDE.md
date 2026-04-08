# OSINT Scanner Mobile - GitHub Actions APK Build Guide

## Overview

This guide provides step-by-step instructions for building the OSINT Scanner Mobile Flutter APK using GitHub Actions. This is the **recommended approach** as it requires no local Flutter SDK installation and automatically produces a properly signed, release-ready APK.

## Why GitHub Actions?

- **No local setup required** - No need to install Flutter SDK, Java, or Android SDK
- **Automated builds** - Builds trigger automatically on every push
- **Consistent environment** - Same build environment every time
- **Cloud storage** - APK stored in GitHub for 30 days
- **Fast** - Builds complete in 10-15 minutes
- **Free** - GitHub Actions includes free build minutes

## Prerequisites

1. **GitHub Account** - Create one at https://github.com/signup if you don't have one
2. **Git installed locally** - Download from https://git-scm.com/
3. **Flutter project** - Already included in this repository

## Step-by-Step Setup

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `osint-scanner-mobile`
3. Choose **Public** (so you can access artifacts)
4. Click **Create repository**
5. Copy the repository URL (you'll need it in Step 3)

### Step 2: Configure Backend URL

Before pushing to GitHub, update your backend server URL:

1. Open `lib/services/api_client.dart`
2. Find this line:
   ```dart
   static const String baseUrl = 'https://your-deployed-url.com';
   ```
3. Replace with your actual backend URL:
   ```dart
   static const String baseUrl = 'https://osintscan-fftqerzj.manus.space';
   ```
4. Save the file

### Step 3: Push to GitHub

Open your terminal and run:

```bash
cd /home/ubuntu/osint_scanner_mobile

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: OSINT Scanner Mobile Flutter App"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/osint-scanner-mobile.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 4: Monitor the Build

1. Go to https://github.com/YOUR_USERNAME/osint-scanner-mobile
2. Click the **Actions** tab
3. You should see "Build Flutter APK" workflow running
4. Wait for it to complete (10-15 minutes)

### Step 5: Download the APK

Once the build completes:

1. Click on the completed workflow run
2. Scroll down to **Artifacts** section
3. Download `osint-scanner-apk` (ZIP file)
4. Extract the ZIP file
5. You'll find `app-release.apk` inside

### Step 6: Install on Android Device

**Option A: USB Transfer**
```bash
# Connect Android device via USB
adb install app-release.apk
```

**Option B: Manual Installation**
1. Transfer APK to your Android device (via email, cloud storage, etc.)
2. On the device, open the file manager
3. Navigate to the APK file
4. Tap to install
5. Grant permissions when prompted

## Troubleshooting

### Build Failed

**Check the error logs:**
1. Go to Actions tab
2. Click on the failed workflow
3. Click "Build APK" step
4. Scroll down to see error details

**Common issues:**
- **Missing backend URL** - Update `lib/services/api_client.dart` and push again
- **Dependency issues** - Delete `pubspec.lock` and `flutter pub get` locally, then push
- **Gradle issues** - These usually resolve on retry

**Solution:**
```bash
# Make fixes locally
git add .
git commit -m "Fix build issue"
git push
# GitHub Actions will automatically rebuild
```

### APK Won't Install

**Check Android version:**
- Minimum required: Android 7.0 (API 24)
- Go to Settings → About Phone → Android version

**Enable Unknown Sources:**
- Go to Settings → Security
- Enable "Unknown sources" or "Install from unknown sources"

**Try uninstalling first:**
```bash
adb uninstall com.osint.scanner.osint_scanner_mobile
adb install app-release.apk
```

### Can't Find APK

1. Go to GitHub repository
2. Click **Actions** tab
3. Find the latest completed workflow
4. Scroll to **Artifacts** section
5. Download the ZIP file

### Build Takes Too Long

- GitHub Actions builds typically take 10-15 minutes
- First build may take longer
- Check the workflow progress in the Actions tab

## Automatic Rebuilds

The workflow automatically rebuilds when you:
- Push to `main` or `master` branch
- Create a pull request
- Manually trigger via "Run workflow" button

## Updating the App

To deploy a new version:

1. Make changes locally
2. Update version in `pubspec.yaml`:
   ```yaml
   version: 1.0.1+2
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update to version 1.0.1"
   git push
   ```
4. GitHub Actions automatically builds the new APK

## Workflow Configuration

The build is configured in `.github/workflows/build-apk.yml`:

- **Java 17** - Latest stable Java version
- **Flutter latest stable** - Always uses the latest stable Flutter
- **Release build** - Optimized for production
- **30-day artifact retention** - APK stored for 30 days

## Security Notes

- The APK is built in release mode with debug signing
- For production distribution, you should:
  - Create a production keystore
  - Update signing configuration in `build.gradle.kts`
  - Sign with your production key
- GitHub stores artifacts securely for 30 days

## Next Steps

1. **Test the app** - Install on your Android device and verify all features work
2. **Report issues** - If something doesn't work, check the build logs
3. **Share with team** - Distribute the APK to other testers
4. **Deploy web version** - Your web server is already live at https://osintscan-fftqerzj.manus.space

## Support

For more information:
- Flutter documentation: https://flutter.dev/docs
- GitHub Actions: https://docs.github.com/en/actions
- Android documentation: https://developer.android.com/docs

## Quick Reference

| Task | Command |
|------|---------|
| Push to GitHub | `git push origin main` |
| View builds | Go to Actions tab on GitHub |
| Download APK | Click workflow → Artifacts → Download ZIP |
| Install APK | `adb install app-release.apk` |
| Update backend URL | Edit `lib/services/api_client.dart` |
| Check logs | Click workflow → Build APK step |

---

**Last Updated:** April 8, 2026  
**Flutter Version:** Latest Stable  
**Minimum Android:** API 24 (Android 7.0)  
**Target Android:** API 33 (Android 13)
