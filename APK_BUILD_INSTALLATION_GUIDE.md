# OSINT Scanner Mobile - APK Build & Installation Guide

## Overview

The OSINT Scanner mobile app is built with Flutter and can be installed on Android devices (API level 24 and above). This guide provides step-by-step instructions for building and installing the APK.

## Prerequisites

Before starting, ensure you have:

- An Android device or emulator running Android 7.0 (API 24) or higher
- USB debugging enabled on your Android device (if using a physical device)
- A GitHub account (for cloud-based APK building)
- A USB cable (for physical device installation)

## Method 1: Cloud Build via GitHub Actions (Recommended)

This method requires no local setup and is the fastest way to get a working APK.

### Step 1: Push to GitHub

1. Create a new GitHub repository for the OSINT Scanner mobile app
2. Clone the repository to your local machine
3. Copy the Flutter project files to the repository:
   ```bash
   cp -r /home/ubuntu/osint_scanner_mobile/* /path/to/your/repo/
   ```
4. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Initial OSINT Scanner mobile app"
   git push origin main
   ```

### Step 2: Enable GitHub Actions

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Click **Enable GitHub Actions** if prompted
4. The workflow file (`.github/workflows/build-apk.yml`) should already exist

### Step 3: Trigger the Build

1. Go to the **Actions** tab
2. Select the **Build APK** workflow
3. Click **Run workflow**
4. Select the branch (main) and click **Run workflow**
5. Wait for the build to complete (5-15 minutes)

### Step 4: Download the APK

1. Once the workflow completes, click on the successful build
2. Scroll to the **Artifacts** section
3. Download the `osint-scanner-release.apk` file
4. Save it to your computer

## Method 2: Local Build (Advanced)

If you have Flutter SDK installed locally, you can build the APK on your machine.

### Prerequisites

- Flutter SDK installed (https://flutter.dev/docs/get-started/install)
- Android SDK installed with API level 33
- Java Development Kit (JDK) 17 or higher

### Build Steps

1. Navigate to the Flutter project directory:
   ```bash
   cd /home/ubuntu/osint_scanner_mobile
   ```

2. Get Flutter dependencies:
   ```bash
   flutter pub get
   ```

3. Build the APK in release mode:
   ```bash
   flutter build apk --release
   ```

4. The APK will be generated at:
   ```
   build/app/outputs/flutter-apk/app-release.apk
   ```

## Installing the APK on Android

### Option A: Install on Physical Device via USB

1. **Enable USB Debugging:**
   - Go to Settings → About Phone
   - Tap Build Number 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable USB Debugging

2. **Connect Device:**
   - Connect your Android device to your computer via USB cable
   - Allow USB debugging when prompted on your device

3. **Install APK:**
   ```bash
   adb install /path/to/osint-scanner-release.apk
   ```

4. **Launch App:**
   - The app will appear in your app drawer as "osint_scanner_mobile"
   - Tap to launch

### Option B: Install via File Manager

1. Transfer the APK file to your Android device via USB or cloud storage
2. Open the file manager on your device
3. Navigate to the APK file
4. Tap the APK file
5. Tap **Install** when prompted
6. Allow permissions if requested
7. Wait for installation to complete

### Option C: Install via ADB (Android Debug Bridge)

1. Download and install ADB on your computer
2. Connect your Android device via USB
3. Run:
   ```bash
   adb install -r /path/to/osint-scanner-release.apk
   ```
4. Wait for the installation to complete

## Troubleshooting

### "Error Parsing Application"

**Cause:** The APK file is corrupted or incomplete.

**Solution:**
- Delete the existing APK
- Rebuild or re-download the APK
- Ensure the file size is at least 50MB
- Try installing on a different device

### "Installation Failed - Insufficient Storage"

**Cause:** Not enough space on the device.

**Solution:**
- Delete unused apps or files
- Free up at least 200MB of storage
- Try again

### "Installation Failed - Unknown Error"

**Cause:** Device compatibility or permissions issue.

**Solution:**
- Ensure Android version is 7.0 or higher
- Disable any antivirus apps temporarily
- Enable installation from unknown sources in Settings
- Try a different USB cable or connection method

### "App Crashes on Launch"

**Cause:** Missing permissions or backend API connection issue.

**Solution:**
- Grant all requested permissions
- Check internet connection
- Ensure backend API URL is correctly configured
- Check app logs: `adb logcat | grep flutter`

## Configuration

### Backend API Connection

The mobile app connects to the backend API. To configure the connection:

1. Open `lib/config.dart` in the Flutter project
2. Update the API URL:
   ```dart
   const String API_URL = 'https://osintscan-fftqerzj.manus.space';
   ```
3. Rebuild the APK

### App Permissions

The app requests the following permissions:
- **Internet** - For API calls and network scanning
- **Camera** - For QR code scanning (optional)
- **Location** - For geolocation features (optional)
- **Storage** - For saving scan results

Grant these permissions when prompted during first launch.

## Uninstalling the App

### Via ADB

```bash
adb uninstall com.osint.scanner.osint_scanner_mobile
```

### Via Device Settings

1. Go to Settings → Apps
2. Find "osint_scanner_mobile"
3. Tap **Uninstall**
4. Confirm uninstallation

## Performance Tips

- Close background apps before using the scanner
- Ensure stable internet connection for API calls
- Use WiFi for faster data transfer
- Keep the app updated with latest APK builds
- Clear app cache if experiencing slowness: Settings → Apps → osint_scanner_mobile → Storage → Clear Cache

## Security Notes

- The app uses HTTPS for all API communications
- Credentials are stored securely using Flutter's secure storage
- No sensitive data is stored locally without encryption
- Always download APKs from official sources only

## Support & Troubleshooting

For additional help:
- Check the app logs: `adb logcat | grep flutter`
- Review the GitHub Actions build logs for build errors
- Ensure your Android device meets minimum requirements
- Try rebuilding the APK if issues persist

## Version Information

- **Minimum Android Version:** 7.0 (API 24)
- **Target Android Version:** 13 (API 33)
- **Compile SDK:** 33
- **Java Version:** 17
- **Flutter Version:** Latest stable

## Next Steps

After successful installation:

1. Launch the app
2. Create an account or log in
3. Grant necessary permissions
4. Start scanning with the available OSINT tools
5. Check the Getting Started guide for usage instructions

---

**Last Updated:** April 2026
**Status:** Production Ready
