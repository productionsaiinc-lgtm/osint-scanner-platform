import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, Users, Map, History, Code2, AlertCircle, Bell, Smartphone, HardDrive, Network, Power, Cpu, Search, Globe, CreditCard, Car, Lock, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { getLoginUrl } from '@/const';
import { updateMetaTags, pageMetadata } from '@/lib/seo';

export function PublicLanding() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    updateMetaTags(pageMetadata.home);
  }, []);


  const features = [
    {
      icon: Radar,
      title: 'Network Scanner',
      description: 'Advanced port scanning, service detection, and OS fingerprinting',
    },
    {
      icon: Users,
      title: 'Social Media OSINT',
      description: 'Username enumeration and profile intelligence gathering',
    },
    {
      icon: Map,
      title: 'IP Geolocation',
      description: 'Map visualization of network topology and host locations',
    },
    {
      icon: Code2,
      title: 'GitHub Search',
      description: 'Repository search and code intelligence gathering',
    },
    {
      icon: AlertCircle,
      title: 'CVE Database',
      description: 'Vulnerability search and threat intelligence',
    },
    {
      icon: Smartphone,
      title: 'Phone Lookup',
      description: 'Phone number validation and carrier information',
    },
    {
      icon: HardDrive,
      title: 'IMEI Checker',
      description: 'Device identification and IMEI validation',
    },
    {
      icon: Network,
      title: 'Nmap Scanner',
      description: 'Professional network scanning and service detection',
    },
    {
      icon: Power,
      title: 'VPN Service',
      description: 'VPN provider comparison and IP masking tools',
    },
    {
      icon: Cpu,
      title: 'Shodan Search',
      description: 'IoT device search and vulnerability discovery',
    },
    {
      icon: Globe,
      title: 'Web Scraper',
      description: 'Website content extraction and analysis',
    },
    {
      icon: Lock,
      title: 'SIM Swap Detection',
      description: 'Check if phone numbers have been SIM swapped',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'Basic network scanning',
        'Social media OSINT',
        'GitHub search',
        'CVE database access',
        'Limited API calls',
        'Community support',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$20',
      period: '/month',
      description: 'For serious researchers',
      features: [
        'All Free features',
        'Advanced OSINT tools',
        'Unlimited API calls',
        'Priority support',
        'Custom reports',
        'Batch scanning',
        'API access',
        'Dark web monitoring',
      ],
      cta: 'Upgrade Now',
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-cyan-500/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-8 h-8 text-neon-green" />
            <span className="text-xl font-bold text-cyan-400">OSINT Scanner</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              Sign In
            </Button>
            <Button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              className="bg-neon-green hover:bg-neon-green/80 text-black font-bold"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-neon-green/10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-neon-green to-cyan-400 bg-clip-text text-transparent">
                  Professional OSINT & Network Scanning
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Comprehensive open-source intelligence gathering and network reconnaissance platform. Scan networks, enumerate domains, and gather intelligence with professional-grade tools.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
                size="lg"
                className="bg-neon-green hover:bg-neon-green/80 text-black font-bold text-lg px-8 py-6 h-auto"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLocation('/pricing')}
                className="border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400 font-bold text-lg px-8 py-6 h-auto"
              >
                View Pricing
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-20">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="border-cyan-500/20 bg-black/40 hover:bg-black/60 hover:border-cyan-500/40 transition-all cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-6 h-6 text-neon-green group-hover:text-cyan-400 transition-colors" />
                      <CardTitle className="text-cyan-400 group-hover:text-neon-green transition-colors">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/50 border-t border-cyan-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-cyan-400 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose the plan that works best for your OSINT research needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card
                key={idx}
                className={`${
                  plan.highlighted
                    ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20'
                    : 'border-cyan-500/20 bg-black/40'
                } transition-all hover:border-cyan-500/40`}
              >
                <CardHeader>
                  <CardTitle className={plan.highlighted ? 'text-neon-green' : 'text-cyan-400'}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-cyan-400">
                      {plan.price}
                    </span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => {
                      window.location.href = getLoginUrl();
                    }}
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-neon-green hover:bg-neon-green/80 text-black font-bold'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-black/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-cyan-400 font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                <li><a href="/about" className="hover:text-cyan-400 transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-400 font-bold mb-4">Tools</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Network Scanner</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">OSINT Tools</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-400 font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-400 font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/20 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 OSINT Scanner Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
