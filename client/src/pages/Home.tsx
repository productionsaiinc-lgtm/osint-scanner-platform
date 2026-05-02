import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Radar, Globe, Users, Map, History, Zap } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    {
     title:"New Features"
     description: "MDM Mobile Device Management, License plate lookup/vin, Cloud storage and sync, virtual phones,Computers, Canary tokens, Temporary Emails, Pentest Labs, Url Shortener,Sim/phone Querys,Imei and CreditCard checks,password cracker, deepfake search, VPN services and much more."
    },
    {
      icon: Radar,
      title: "Network Scanner",
      description: "Advanced port scanning and network reconnaissance",
    },
    {
      icon: Users,
      title: "Social Media OSINT",
      description: "Username enumeration and profile discovery",
    },
    {
      icon: Map,
      title: "IP Geolocation",
      description: "Map visualization and location tracking",
    },
    {
      icon: Globe,
      title: "Domain OSINT",
      description: "WHOIS, DNS records, and SSL certificates",
    },
    {
      icon: History,
      title: "Scan History",
      description: "Track and review all your scans",
    },
    {
      icon: Zap,
      title: "Premium Features",
      description: "Unlock advanced tools and capabilities",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-pink/10 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 py-20 relative">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-neon-pink mb-4 neon-glow">
              OSINT SCANNER PLATFORM
            </h1>
            <p className="text-xl text-neon-cyan mb-8 max-w-2xl mx-auto">
              reconnaissance and threat intelligence tools for security professionals
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => setLocation("/dashboard")}
                className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold px-8 py-3"
              >
                Get Started
              </Button>
              <Button
                onClick={() => setLocation("/pricing")}
                variant="outline"
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 font-bold px-8 py-3"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-neon-cyan mb-12 text-center">AVAILABLE MODULES</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="border-neon-cyan/30 bg-black/50 p-6 hover:border-neon-cyan/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-neon-cyan/20"
              >
                <Icon className="w-8 h-8 text-neon-pink mb-4" />
                <h3 className="text-lg font-bold text-neon-pink mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
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
          onClick={() => setLocation("/dashboard")}
          className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold px-8 py-3 text-lg"
        >
          <Zap className="h-5 w-5 mr-2" />
          Start Scanning Now
        </Button>
      </div>
    </div>
  );
}
