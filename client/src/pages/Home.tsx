import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Radar, Globe, Map, Zap, Shield, Fingerprint, Smartphone, Cpu, CreditCard, Car, Cloud, Link2, Mail, FileSearch, Bell, Lock } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  const featureSections = [
    {
      icon: Bell,
      title: "Core Operations",
      tools: ["Dashboard", "Scan History", "Monitoring", "Alert History", "Notifications", "Dark Web Monitor", "Crypto Tracker", "Employee Enum", "Geo Reverse", "Flight Tracker"],
    },
    {
      icon: Radar,
      title: "Network & Infrastructure",
      tools: ["Network Scanner", "Nmap Scanner", "Shodan", "DNS Enumeration", "WHOIS Lookup", "VPN Connection", "IoT Scanner"],
    },
    {
      icon: Globe,
      title: "Web & Domain Security",
      tools: ["Web Scraper", "SSL Analyzer", "WAF Detection", "Subdomain Takeover"],
    },
    {
      icon: Fingerprint,
      title: "Forensics",
      tools: ["Metadata Extractor", "Reverse Image Search", "Malware Analyzer", "Password Cracker", "Deepfake Detector"],
    },
    {
      icon: Shield,
      title: "Intelligence & Threat",
      tools: ["Social Media OSINT", "GitHub Search", "CVE Database", "Vulnerability Scanner", "Supply Chain Analyzer", "Insider Threat"],
    },
    {
      icon: Smartphone,
      title: "Personal & Device",
      tools: ["Phone Lookup", "IMEI Checker", "SIM Swap Lookup", "Credit Card Checker"],
    },
    {
      icon: Map,
      title: "Visualization & Tools",
      tools: ["Map View", "Pentest Lab", "Canary Tokens", "URL Shortener", "Temp Email", "File Analyzer", "Sock Puppets"],
    },
    {
      icon: Cpu,
      title: "Infrastructure & Computing",
      tools: ["Virtual Computers", "Virtual Phones", "Cloud Storage"],
    },
    {
      icon: Car,
      title: "Vehicle",
      tools: ["Ontario License Plate", "VIN Decoder"],
    },
    {
      icon: Lock,
      title: "Mobile Device Management",
      tools: ["MDM Dashboard", "Real Device Enrollment", "Policies", "Threat Defense", "Compliance Reports"],
    },
    {
      icon: CreditCard,
      title: "Account & Billing",
      tools: ["Pricing", "Subscription", "Payouts", "Payouts Enhanced", "Live Payouts", "About"],
    },
  ];

  const quickActions = [
    { label: "Network Scanner", path: "/network-scanner", icon: Radar },
    { label: "MDM Dashboard", path: "/mdm", icon: Smartphone },
    { label: "Virtual Computers", path: "/virtual-computers", icon: Cpu },
    { label: "Virtual Phones", path: "/virtual-phones", icon: Smartphone },
    { label: "Cloud Storage", path: "/cloud-storage", icon: Cloud },
    { label: "URL Shortener", path: "/url-shortener", icon: Link2 },
    { label: "Temp Email", path: "/temp-email", icon: Mail },
    { label: "File Analyzer", path: "/file-analyzer", icon: FileSearch },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-pink/10 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 py-20 relative">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 neon-glow" style={{ color: '#ff00ff' }}>
              OSINT & PENTESTING SERVICES
            </h1>
            <p className="text-xl text-neon-cyan mb-8 max-w-2xl mx-auto">
              reconnaissance and threat intelligence tools for security professionals
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => setLocation("/network-scanner")}
                className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold px-8 py-3"
              >
                Get Started
              </Button>
              <Button
                onClick={() => setLocation("/pricing")}
                variant="outline"
                className="border-neon-cyan hover:bg-neon-cyan/10 font-bold px-8 py-3"
                style={{ color: '#ffff00' }}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.path}
                onClick={() => setLocation(action.path)}
                variant="outline"
                className="h-14 justify-start border-neon-cyan/30 bg-black/40 text-neon-cyan hover:bg-neon-cyan/10"
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-neon-cyan mb-12 text-center">ALL DASHBOARD FEATURES</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.title}
                className="border-neon-cyan/30 bg-black/50 p-6 hover:border-neon-cyan/60 transition-all hover:shadow-lg hover:shadow-neon-cyan/20"
              >
                <Icon className="w-8 h-8 text-neon-pink mb-4" />
                <h3 className="text-lg font-bold text-neon-pink mb-3">{section.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {section.tools.map((tool) => (
                    <span key={tool} className="rounded border border-neon-cyan/20 bg-neon-cyan/5 px-2 py-1 text-xs text-gray-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-b from-transparent to-neon-pink/5 py-16 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-neon-green mb-2">10K+</div>
              <p className="text-gray-400">Active Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-neon-cyan mb-2">1M+</div>
              <p className="text-gray-400">Scans Performed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-neon-pink mb-2">99.9%</div>
              <p className="text-gray-400">Uptime</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-neon-purple mb-2">24/7</div>
              <p className="text-gray-400">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-neon-pink mb-4 neon-glow">
          Ready to start your reconnaissance?
        </h2>
        <p className="text-neon-cyan mb-8 max-w-2xl mx-auto">
          Join thousands of security professionals using OSINT Scanner Platform
        </p>
        <Button
          onClick={() => setLocation("/network-scanner")}
          className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold px-8 py-3 text-lg"
        >
          <Zap className="h-5 w-5 mr-2" />
          Start Scanning Now
        </Button>
      </div>
    </div>
  );
}
