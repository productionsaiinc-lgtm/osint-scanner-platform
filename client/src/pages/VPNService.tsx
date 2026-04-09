import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Globe,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Gauge,
  Server,
  FileText,
  Star,
  ExternalLink,
} from 'lucide-react';

interface VPNProvider {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  price: string;
  servers: number;
  countries: number;
  protocols: string[];
  encryption: string;
  logging: 'None' | 'Minimal' | 'Full';
  speed: 'Excellent' | 'Very Good' | 'Good' | 'Fair';
  jurisdiction: string;
  features: string[];
  affiliateLink: string;
  recommended: boolean;
}

interface CurrentIP {
  ip: string;
  country: string;
  city: string;
  isp: string;
  isVPN: boolean;
  latitude: number;
  longitude: number;
}

export function VPNService() {
  const [currentIP, setCurrentIP] = useState<CurrentIP>({
    ip: '203.0.113.42',
    country: 'United States',
    city: 'San Francisco',
    isp: 'Comcast Cable',
    isVPN: false,
    latitude: 37.7749,
    longitude: -122.4194,
  });

  const [selectedProvider, setSelectedProvider] = useState<VPNProvider | null>(null);
  const [showIPDetails, setShowIPDetails] = useState(false);

  const vpnProviders: VPNProvider[] = [
    {
      id: 'protonvpn',
      name: 'ProtonVPN',
      rating: 4.8,
      reviews: 2543,
      price: '$4.99/mo',
      servers: 3000,
      countries: 91,
      protocols: ['IKEv2', 'OpenVPN', 'WireGuard'],
      encryption: 'AES-256',
      logging: 'None',
      speed: 'Excellent',
      jurisdiction: 'Switzerland',
      features: ['No logs', 'Kill switch', 'Split tunneling', 'Streaming', 'P2P allowed'],
      affiliateLink: 'https://protonvpn.com',
      recommended: true,
    },
    {
      id: 'expressvpn',
      name: 'ExpressVPN',
      rating: 4.7,
      reviews: 3102,
      price: '$6.67/mo',
      servers: 3000,
      countries: 94,
      protocols: ['Lightway', 'OpenVPN', 'IKEv2'],
      encryption: 'AES-256',
      logging: 'None',
      speed: 'Excellent',
      jurisdiction: 'British Virgin Islands',
      features: ['No logs', 'Kill switch', 'Split tunneling', 'Streaming', 'Fastest speeds'],
      affiliateLink: 'https://expressvpn.com',
      recommended: true,
    },
    {
      id: 'nordvpn',
      name: 'NordVPN',
      rating: 4.6,
      reviews: 2876,
      price: '$3.99/mo',
      servers: 5000,
      countries: 111,
      protocols: ['NordLynx', 'OpenVPN', 'IKEv2'],
      encryption: 'AES-256',
      logging: 'None',
      speed: 'Very Good',
      jurisdiction: 'Panama',
      features: ['No logs', 'Kill switch', 'Obfuscation', 'Streaming', 'Double VPN'],
      affiliateLink: 'https://nordvpn.com',
      recommended: false,
    },
    {
      id: 'surfshark',
      name: 'Surfshark',
      rating: 4.5,
      reviews: 1954,
      price: '$2.49/mo',
      servers: 3200,
      countries: 100,
      protocols: ['WireGuard', 'OpenVPN', 'IKEv2'],
      encryption: 'AES-256',
      logging: 'None',
      speed: 'Very Good',
      jurisdiction: 'British Virgin Islands',
      features: ['No logs', 'Kill switch', 'Unlimited connections', 'Streaming', 'Budget friendly'],
      affiliateLink: 'https://surfshark.com',
      recommended: false,
    },
    {
      id: 'mullvadvpn',
      name: 'Mullvad VPN',
      rating: 4.7,
      reviews: 1203,
      price: 'Free/€5/mo',
      servers: 700,
      countries: 41,
      protocols: ['WireGuard', 'OpenVPN'],
      encryption: 'AES-256',
      logging: 'None',
      speed: 'Good',
      jurisdiction: 'Sweden',
      features: ['No logs', 'No account needed', 'Open source', 'Kill switch', 'Privacy focused'],
      affiliateLink: 'https://mullvad.net',
      recommended: false,
    },
  ];

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'Excellent':
        return 'text-neon-green';
      case 'Very Good':
        return 'text-neon-cyan';
      case 'Good':
        return 'text-neon-yellow';
      default:
        return 'text-neon-pink';
    }
  };

  const getLoggingColor = (logging: string) => {
    switch (logging) {
      case 'None':
        return 'bg-neon-green/20 text-neon-green border-neon-green/50';
      case 'Minimal':
        return 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50';
      default:
        return 'bg-neon-red/20 text-neon-red border-neon-red/50';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-neon-purple flex items-center gap-2">
          <Shield className="w-8 h-8" />
          VPN Service Directory
        </h1>
        <p className="text-gray-400 mt-2">Compare VPN providers and protect your online privacy</p>
      </div>

      {/* Current IP Information */}
      <Card className="border-neon-cyan/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-neon-cyan flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Your Current IP
            </span>
            <button
              onClick={() => setShowIPDetails(!showIPDetails)}
              className="text-gray-400 hover:text-neon-cyan transition-colors"
            >
              {showIPDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-neon-cyan/30 rounded bg-black/60">
              <div className="text-xs text-gray-400">IP Address</div>
              <div className="text-lg font-mono text-neon-cyan font-bold mt-1">{currentIP.ip}</div>
            </div>
            <div className="p-3 border border-neon-cyan/30 rounded bg-black/60">
              <div className="text-xs text-gray-400">VPN Status</div>
              <div className="flex items-center gap-2 mt-1">
                {currentIP.isVPN ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    <span className="text-sm font-semibold text-neon-green">Protected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-neon-red" />
                    <span className="text-sm font-semibold text-neon-red">Not Protected</span>
                  </>
                )}
              </div>
            </div>

            {showIPDetails && (
              <>
                <div className="p-3 border border-neon-cyan/30 rounded bg-black/60">
                  <div className="text-xs text-gray-400">Country</div>
                  <div className="text-sm font-semibold text-white mt-1">{currentIP.country}</div>
                </div>
                <div className="p-3 border border-neon-cyan/30 rounded bg-black/60">
                  <div className="text-xs text-gray-400">City</div>
                  <div className="text-sm font-semibold text-white mt-1">{currentIP.city}</div>
                </div>
                <div className="p-3 border border-neon-cyan/30 rounded bg-black/60">
                  <div className="text-xs text-gray-400">ISP</div>
                  <div className="text-sm font-semibold text-white mt-1">{currentIP.isp}</div>
                </div>
                <div className="p-3 border border-neon-cyan/30 rounded bg-black/60">
                  <div className="text-xs text-gray-400">Coordinates</div>
                  <div className="text-sm font-mono text-white mt-1">
                    {currentIP.latitude.toFixed(4)}, {currentIP.longitude.toFixed(4)}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* VPN Recommendations */}
      <div>
        <h2 className="text-xl font-bold text-neon-green mb-4 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Recommended VPN Providers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vpnProviders
            .filter((p) => p.recommended)
            .map((provider) => (
              <Card
                key={provider.id}
                className="border-neon-green/30 bg-black/40 cursor-pointer hover:border-neon-green/60 transition-all"
                onClick={() => setSelectedProvider(provider)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-neon-green">{provider.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(provider.rating)
                                  ? 'fill-neon-yellow text-neon-yellow'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">({provider.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-neon-green">{provider.price}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Server className="w-4 h-4 text-neon-cyan" />
                    {provider.servers.toLocaleString()} servers in {provider.countries} countries
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Lock className="w-4 h-4 text-neon-yellow" />
                    {provider.encryption} encryption
                  </div>
                  <div className={`inline-block px-2 py-1 rounded text-xs border ${getLoggingColor(provider.logging)}`}>
                    {provider.logging} Logging
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* All VPN Providers */}
      <div>
        <h2 className="text-xl font-bold text-neon-cyan mb-4">All VPN Providers</h2>
        <div className="space-y-3">
          {vpnProviders.map((provider) => (
            <Card
              key={provider.id}
              className="border-gray-600/30 bg-black/40 cursor-pointer hover:border-neon-cyan/50 transition-all"
              onClick={() => setSelectedProvider(provider)}
            >
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div>
                    <div className="font-bold text-white">{provider.name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(provider.rating)
                                ? 'fill-neon-yellow text-neon-yellow'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{provider.rating}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="text-xs text-gray-400">Price</div>
                    <div className="font-semibold text-neon-green">{provider.price}</div>
                  </div>

                  <div className="text-sm">
                    <div className="text-xs text-gray-400">Servers</div>
                    <div className="font-semibold text-neon-cyan">{provider.servers.toLocaleString()}</div>
                  </div>

                  <div className="text-sm">
                    <div className="text-xs text-gray-400">Speed</div>
                    <div className={`font-semibold ${getSpeedColor(provider.speed)}`}>{provider.speed}</div>
                  </div>

                  <div className="text-sm">
                    <div className="text-xs text-gray-400">Logging</div>
                    <div className={`inline-block px-2 py-1 rounded text-xs border ${getLoggingColor(provider.logging)}`}>
                      {provider.logging}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-neon-purple hover:bg-neon-purple/80 text-black font-semibold flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(provider.affiliateLink, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Provider Details */}
      {selectedProvider && (
        <Card className="border-neon-purple/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-neon-purple flex items-center justify-between">
              {selectedProvider.name} - Detailed Information
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-gray-400 hover:text-neon-purple text-lg"
              >
                ✕
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border border-neon-purple/30 rounded">
                <div className="text-xs text-gray-400">Jurisdiction</div>
                <div className="text-sm font-semibold text-white mt-1">{selectedProvider.jurisdiction}</div>
              </div>
              <div className="p-3 border border-neon-purple/30 rounded">
                <div className="text-xs text-gray-400">Encryption</div>
                <div className="text-sm font-semibold text-white mt-1">{selectedProvider.encryption}</div>
              </div>
              <div className="p-3 border border-neon-purple/30 rounded">
                <div className="text-xs text-gray-400">Protocols</div>
                <div className="text-xs text-gray-300 mt-1">{selectedProvider.protocols.join(', ')}</div>
              </div>
              <div className="p-3 border border-neon-purple/30 rounded">
                <div className="text-xs text-gray-400">Countries</div>
                <div className="text-sm font-semibold text-white mt-1">{selectedProvider.countries}</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-white mb-2">Features</div>
              <div className="flex flex-wrap gap-2">
                {selectedProvider.features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-neon-purple/20 border border-neon-purple/50 rounded text-xs text-neon-purple">
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </div>

            <Button className="w-full bg-neon-purple hover:bg-neon-purple/80 text-black font-semibold">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit {selectedProvider.name}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Information Alert */}
      <Alert className="border-blue-500/30 bg-blue-500/10">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-400">
          VPN services are for legitimate privacy protection and security purposes. Always review the provider's privacy policy and terms of service. This directory contains affiliate links that help support this platform.
        </AlertDescription>
      </Alert>
    </div>
  );
}
