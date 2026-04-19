import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Zap, Shield, Users } from "lucide-react";

export function DownloadAPK() {
  const apkUrl = "/OsintPentestPlatform.apk";
  
  const features = [
    {
      icon: Zap,
      title: "Network Scanner",
      description: "Port scanning, ping, traceroute, and IP geolocation"
    },
    {
      icon: Users,
      title: "Social OSINT",
      description: "Find profiles across social media platforms"
    },
    {
      icon: Shield,
      title: "SIM Swap Detection",
      description: "Check if your phone number has been SIM swapped"
    },
    {
      icon: Smartphone,
      title: "Phone & IMEI Lookup",
      description: "Get detailed phone number and device information"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
            Download OSINT Scanner
          </h1>
          <p className="text-slate-400 mt-2">Get the native Android app for powerful reconnaissance</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Download Card */}
        <Card className="bg-slate-800 border-slate-700 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">OSINT Scanner v2.0.0</CardTitle>
            <CardDescription>Native Android Application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">System Requirements</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span>
                    Android 7.0 or higher (API 24+)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span>
                    50MB free storage space
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span>
                    Active internet connection
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span>
                    Jetpack Compose compatible device
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Installation Steps</h3>
                <ol className="space-y-2 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">1.</span>
                    <span>Download the APK file below</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">2.</span>
                    <span>Enable "Unknown Sources" in Settings → Security</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">3.</span>
                    <span>Open the APK file and tap Install</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-bold">4.</span>
                    <span>Launch OSINT Scanner and sign in</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Download Button */}
            <div className="pt-6 border-t border-slate-700">
              <a href={apkUrl} download className="inline-block w-full">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download APK (v2.0.0 - Latest Build)
                </Button>
              </a>
              <p className="text-xs text-slate-400 mt-2 text-center">
                File size: 71MB | Last updated: April 17, 2026
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">App Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Icon className="h-8 w-8 text-cyan-400 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-slate-400">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Premium Features */}
        <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 mb-12">
          <CardHeader>
            <CardTitle className="text-pink-400">Premium Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-pink-400">★</span>
                Unlimited scans and queries
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-400">★</span>
                Advanced OSINT tools
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-400">★</span>
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-400">★</span>
                Export reports as PDF
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-400">★</span>
                Real-time notifications
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-400">★</span>
                Scan history & analytics
              </li>
            </ul>
            <p className="text-slate-400 text-sm mt-4">
              Upgrade to Premium for $20/month to unlock all features
            </p>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Is the app free?</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Yes! The app is free to download and use. Basic features are available for free users, with premium features available via subscription.
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">What data does the app collect?</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                The app only collects data necessary for authentication and scan history. Your privacy is our priority. See our privacy policy for details.
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Can I use the app without an account?</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                No, you need to create an account or sign in to use the app. This allows us to track your scan history and manage your subscription.
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Is the app available for iOS?</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Currently, the app is only available for Android. iOS support is planned for future releases.
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Parse Error - Build Locally</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p className="mb-3">To build a working APK locally:</p>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Use Expo (easiest, no setup)</li>
                  <li>Use Android Studio</li>
                  <li>Use React Native CLI</li>
                </ol>
                <p className="mt-3 text-xs text-slate-400">See APK_BUILD_GUIDE.md for details.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-900/50 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 OSINT Scanner Platform. All rights reserved.</p>
          <p className="mt-2">For support, contact: productions.ai.inc@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
