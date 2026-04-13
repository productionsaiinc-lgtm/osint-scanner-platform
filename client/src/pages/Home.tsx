import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import {React} from "react";
import { Radar, Globe, Users, Map, History, Zap } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();


const PayPalBuyButton: React.FC = () => {
  return (
    <div>
      <style>{`.pp-4KE9LVL5YMB78{ text-align:center; border:none; border-radius:0.25rem; min-width:11.625rem; padding:0 2rem; height:2.625rem; font-weight:bold; background-color:#FFD140; color:#000000; font-family:"Helvetica Neue",Arial,sans-serif; font-size:1rem; line-height:1.25rem; cursor:pointer; }`}</style>
      <form
        action="https://www.paypal.com/ncp/payment/4KE9LVL5YMB78"
        method="post"
        target="_blank"
        style={{ display: 'inline-grid', justifyItems: 'center', alignContent: 'start', gap: '0.5rem' }}
      >
        <input className="pp-4KE9LVL5YMB78" type="submit" value="Buy Now" />
        <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt="cards" />
        <section style={{ fontSize: '0.75rem' }}>
          Powered by{' '}
          <img
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
            alt="paypal"
            style={{ height: '0.875rem', verticalAlign: 'middle' }}
          />
        </section>
      </form>
    </div>
  );
};

export default PayPalBuyButton;


  const scanModules = [
    {
      icon: Radar,
      title: "Network Scanner",
      description: "Port scanning, ping, traceroute, and IP geolocation",
      path: "/network-scanner",
      color: "neon-pink",
      colorGlow: "neon-pink-glow",
    },
    {
      icon: Globe,
      title: "Domain OSINT",
      description: "WHOIS, DNS records, subdomains, and SSL certificates",
      path: "/domain-osint",
      color: "neon-cyan",
      colorGlow: "neon-cyan-glow",
    },
    {
      icon: Users,
      title: "Social Media OSINT",
      description: "Username search and profile intelligence gathering",
      path: "/social-osint",
      color: "neon-purple",
      colorGlow: "neon-purple-glow",
    },
    {
      icon: Map,
      title: "Network Map",
      description: "Interactive visualization of network topology",
      path: "/map",
      color: "neon-green",
      colorGlow: "neon-green-glow",
    },
  ];

  const recentScans = [
    { type: "Port Scan", target: "192.168.1.1", time: "2 hours ago", status: "completed" },
    { type: "Domain OSINT", target: "example.com", time: "4 hours ago", status: "completed" },
    { type: "Social Media", target: "john_doe", time: "1 day ago", status: "completed" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold neon-pink-glow tracking-wider">
          OSINT SCANNER PLATFORM
        </h1>
        <p className="text-foreground/70 text-sm uppercase tracking-widest">
          developed by nate.c
        </p>
        <p className="text-foreground/70 text-sm uppercase tracking-widest">
          Welcome, {user?.name || "Operative"}. Ready to begin reconnaissance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hud-frame p-6 text-center">
          <div className="text-3xl font-bold neon-pink-glow mb-2">12</div>
          <div className="text-xs text-foreground/70 uppercase tracking-wider">Scans Today</div>
        </Card>
        <Card className="hud-frame p-6 text-center">
          <div className="text-3xl font-bold neon-cyan-glow mb-2">47</div>
          <div className="text-xs text-foreground/70 uppercase tracking-wider">Hosts Found</div>
        </Card>
        <Card className="hud-frame p-6 text-center">
          <div className="text-3xl font-bold neon-green mb-2">23</div>
          <div className="text-xs text-foreground/70 uppercase tracking-wider">Vulnerabilities</div>
        </Card>
        <Card className="hud-frame p-6 text-center">
          <div className="text-3xl font-bold neon-purple-glow mb-2">156</div>
          <div className="text-xs text-foreground/70 uppercase tracking-wider">Total Results</div>
        </Card>
      </div>

      {/* Scan Modules */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold neon-cyan-glow uppercase tracking-wider">Available Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scanModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.path}
                className={`hud-frame p-6 cursor-pointer hover:shadow-lg hover:shadow-${module.color}/30 transition-all group`}
                onClick={() => setLocation(module.path)}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`h-8 w-8 ${module.colorGlow}`} />
                  <Zap className="h-4 w-4 text-neon-green opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className={`text-lg font-bold ${module.colorGlow} mb-2 uppercase tracking-wider`}>
                  {module.title}
                </h3>
                <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
                  {module.description}
                </p>
                <Button
                  onClick={() => setLocation(module.path)}
                  className={`w-full text-black font-bold uppercase tracking-wider h-9 text-xs ${
                    module.color === "neon-pink"
                      ? "bg-neon-pink hover:bg-neon-pink/80"
                      : module.color === "neon-cyan"
                      ? "bg-neon-cyan hover:bg-neon-cyan/80"
                      : module.color === "neon-purple"
                      ? "bg-neon-purple hover:bg-neon-purple/80"
                      : "bg-neon-green hover:bg-neon-green/80"
                  }`}
                >
                  Launch Module
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold neon-green-glow uppercase tracking-wider">Recent Activity</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/history")}
            className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
          >
            <History className="mr-2 h-4 w-4" />
            View All
          </Button>
        </div>
        <Card className="hud-frame p-6">
          <div className="space-y-3">
            {recentScans.map((scan, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-neon-cyan/20 last:border-0">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neon-cyan">{scan.type}</div>
                  <div className="text-xs text-foreground/60 font-mono mt-1">{scan.target}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neon-green font-bold uppercase">{scan.status}</div>
                  <div className="text-xs text-foreground/50 mt-1">{scan.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="hud-frame p-6">
        <h3 className="text-sm font-bold text-neon-purple-glow uppercase tracking-wider mb-4">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-foreground/70">API Status</span>
            </div>
            <div className="text-neon-green font-bold">OPERATIONAL</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-foreground/70">Database</span>
            </div>
            <div className="text-neon-green font-bold">CONNECTED</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
              <span className="text-foreground/70">Uptime</span>
            </div>
            <div className="text-neon-cyan font-bold">99.8%</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-foreground/70">Scans Active</span>
            </div>
            <div className="text-neon-green font-bold">0</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
