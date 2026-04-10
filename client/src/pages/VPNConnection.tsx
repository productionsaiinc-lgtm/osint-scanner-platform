import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Globe, Power, RefreshCw, AlertTriangle, CheckCircle2, Clock, Download, Upload, Activity, Lock, Zap, Trash2, Loader2, Star, ExternalLink, MapPin, Gauge, Server, FileText, Eye, EyeOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';

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

export function VPNConnection() {
  const [selectedProvider, setSelectedProvider] = useState<string>('protonvpn');
  const [selectedLocation, setSelectedLocation] = useState<string>('New York');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('connection');
  const [showIPDetails, setShowIPDetails] = useState(false);

  const [currentIP, setCurrentIP] = useState<CurrentIP>({
    ip: '203.0.113.42',
    country: 'United States',
    city: 'San Francisco',
    isp: 'Comcast Cable',
    isVPN: false,
    latitude: 37.7749,
    longitude: -122.4194,
  });

  // VPN Connection queries
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = trpc.vpnConnection.status.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 2000 : false }
  );

  const { data: stats } = trpc.vpnConnection.stats.useQuery(undefined, {
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const { data: logs } = trpc.vpnConnection.logs.useQuery({ limit: 20 });
  const { data: leakStatus } = trpc.vpnConnection.checkLeaks.useQuery();

  // Mutations
  const connectMutation = trpc.vpnConnection.connect.useMutation();
  const disconnectMutation = trpc.vpnConnection.disconnect.useMutation();
  const reconnectMutation = trpc.vpnConnection.reconnect.useMutation();
  const killSwitchMutation = trpc.vpnConnection.setKillSwitch.useMutation();
  const clearLogsMutation = trpc.vpnConnection.clearLogs.useMutation();

  const handleConnect = async () => {
    try {
      await connectMutation.mutateAsync({
        providerId: selectedProvider,
        serverLocation: selectedLocation,
        protocol: 'WireGuard',
      });
      refetchStatus();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      refetchStatus();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  const handleReconnect = async () => {
    try {
      await reconnectMutation.mutateAsync();
      refetchStatus();
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  };

  const handleKillSwitch = async (enabled: boolean) => {
    try {
      await killSwitchMutation.mutateAsync({ enabled });
    } catch (error) {
      console.error('Kill switch toggle failed:', error);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearLogsMutation.mutateAsync();
    } catch (error) {
      console.error('Clear logs failed:', error);
    }
  };

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
      reviews: 2891,
      price: '$3.99/mo',
      servers: 5000,
      countries: 111,
      protocols: ['NordLynx', 'OpenVPN', 'IKEv2'],
      encryption: 'AES-256',
      logging: 'None',
      speed: 'Very Good',
      jurisdiction: 'Panama',
      features: ['No logs', 'Kill switch', 'Double VPN', 'Streaming', 'Onion over VPN'],
      affiliateLink: 'https://nordvpn.com',
      recommended: true,
    },
    {
      id: 'surfshark',
      name: 'Surfshark',
      rating: 4.5,
      reviews: 1987,
      price: '$2.49/mo',
      servers: 3200,
      countries: 100,
      protocols: ['WireGuard', 'OpenVPN', 'IKEv2'],
      encryption: 'AES-256',
      logging: 'None',
      speed: 'Good',
      jurisdiction: 'British Virgin Islands',
      features: ['No logs', 'Kill switch', 'Unlimited simultaneous connections', 'Streaming'],
      affiliateLink: 'https://surfshark.com',
      recommended: false,
    },
    {
      id: 'mullvad',
      name: 'Mullvad',
      rating: 4.4,
      reviews: 1543,
      price: '$5.52/mo',
      servers: 800,
      countries: 42,
      protocols: ['WireGuard', 'OpenVPN'],
      encryption: 'AES-256',
      logging: 'None',
      speed: 'Good',
      jurisdiction: 'Sweden',
      features: ['No logs', 'No account needed', 'Kill switch', 'Open source', 'Privacy focused'],
      affiliateLink: 'https://mullvad.net',
      recommended: false,
    },
  ];

  const vpnLocations = ['protonvpn', 'expressvpn', 'nordvpn', 'surfshark', 'mullvad'];
  const locations = ['New York', 'Los Angeles', 'London', 'Amsterdam', 'Tokyo', 'Sydney', 'Toronto', 'Berlin'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-cyan-glow">VPN MANAGEMENT SUITE</h1>
        <p className="text-gray-400">Combined VPN connection management and provider directory</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-cyan-500/30">
        <button
          onClick={() => setActiveTab('connection')}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === 'connection'
              ? 'text-neon-cyan border-b-2 border-neon-cyan'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Power className="w-4 h-4 inline mr-2" />
          Connection
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === 'providers'
              ? 'text-neon-cyan border-b-2 border-neon-cyan'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />
          Providers
        </button>
        <button
          onClick={() => setActiveTab('ip')}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === 'ip'
              ? 'text-neon-cyan border-b-2 border-neon-cyan'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          IP Check
        </button>
      </div>

      {/* Connection Tab */}
      {activeTab === 'connection' && (
        <div className="space-y-6">
          {/* Connection Status */}
          <Card className="hud-frame p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold neon-cyan">CONNECTION STATUS</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2 rounded transition-colors ${
                      autoRefresh ? 'bg-green-500/30 text-green-400' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30">
                  <p className="text-xs text-gray-400 uppercase">Status</p>
                  <p className="text-lg font-bold neon-cyan">{status?.isConnected ? 'CONNECTED' : 'DISCONNECTED'}</p>
                </div>
                <div className="bg-[#0a0e27] p-4 rounded border border-pink-500/30">
                  <p className="text-xs text-gray-400 uppercase">Provider</p>
                  <p className="text-lg font-bold neon-pink">{status?.status?.providerId || 'None'}</p>
                </div>
                <div className="bg-[#0a0e27] p-4 rounded border border-green-500/30">
                  <p className="text-xs text-gray-400 uppercase">Data Used</p>
                  <p className="text-lg font-bold text-green-400">{status?.status?.dataUsedFormatted || 'N/A'}</p>
                </div>
                <div className="bg-[#0a0e27] p-4 rounded border border-yellow-500/30">
                  <p className="text-xs text-gray-400 uppercase">Connection Time</p>
                  <p className="text-lg font-bold text-yellow-400">{status?.status?.connectionTimeFormatted || '0h'}</p>
                </div>
              </div>

              {/* Connection Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={handleConnect}
                  disabled={status?.isConnected || connectMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {connectMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Power className="w-4 h-4 mr-2" />}
                  CONNECT
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={!status?.isConnected || disconnectMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {disconnectMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Power className="w-4 h-4 mr-2" />}
                  DISCONNECT
                </Button>
                <Button
                  onClick={handleReconnect}
                  disabled={reconnectMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {reconnectMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  RECONNECT
                </Button>
              </div>

              {/* Provider & Location Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium neon-cyan">Provider</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full bg-[#0a0e27] border border-cyan-500/30 text-white p-2 rounded"
                  >
                    {vpnProviders.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium neon-green">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-[#0a0e27] border border-green-500/30 text-white p-2 rounded"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Connection Info */}
              <div className="flex items-center justify-between bg-[#0a0e27] p-4 rounded border border-purple-500/30">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <span className="font-mono text-sm">CONNECTION INFO</span>
                  </div>
                  <span className="text-xs text-gray-400">Status: {status?.isConnected ? 'Active' : 'Inactive'}</span>
                </div>
              {/* Speed Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-gray-400">Data Used</span>
                    </div>
                    <p className="text-lg font-bold neon-cyan">{stats.totalDataUsedFormatted}</p>
                  </div>
                  <div className="bg-[#0a0e27] p-4 rounded border border-pink-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-pink-400" />
                      <span className="text-xs text-gray-400">Connection Time</span>
                    </div>
                    <p className="text-lg font-bold neon-pink">{stats.connectionTimeFormatted || 'N/A'}</p>
                  </div>
                  <div className="bg-[#0a0e27] p-4 rounded border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-400">Avg Ping</span>
                    </div>
                    <p className="text-lg font-bold text-green-400">{stats.averagePing} ms</p>
                  </div>
                </div>
              )}

              {/* Leak Status */}
              {leakStatus && (
                <div className={`p-4 rounded border ${leakStatus.hasLeak ? 'border-red-500/30 bg-red-500/10' : 'border-green-500/30 bg-green-500/10'}`}>
                  <div className="flex items-center gap-2">
                    {leakStatus.hasLeak ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    <span className={leakStatus.hasLeak ? 'text-red-400' : 'text-green-400'}>
                      {leakStatus.hasLeak ? 'LEAKS DETECTED' : 'NO LEAKS DETECTED'}
                    </span>
                  </div>
                </div>
              )}

              {/* Connection Logs */}
              {logs && logs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold neon-cyan">CONNECTION LOGS</h3>
                    <Button
                      onClick={handleClearLogs}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30 max-h-48 overflow-y-auto">
                    {logs.map((log: any, idx: number) => (
                      <div key={idx} className="text-xs text-gray-400 font-mono mb-1">
                        [{log.timestamp}] {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vpnProviders.map((provider) => (
              <Card key={provider.id} className={`hud-frame p-6 ${provider.recommended ? 'border-green-500/50' : ''}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold neon-cyan">{provider.name}</h3>
                      {provider.recommended && (
                        <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded inline-block mt-1">
                          ★ RECOMMENDED
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-yellow-400">{provider.rating}</span>
                      </div>
                      <p className="text-xs text-gray-400">{provider.reviews} reviews</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Price</p>
                      <p className="font-bold neon-pink">{provider.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Servers</p>
                      <p className="font-bold text-green-400">{provider.servers}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Countries</p>
                      <p className="font-bold text-purple-400">{provider.countries}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Speed</p>
                      <p className="font-bold text-cyan-400">{provider.speed}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 uppercase">Protocols</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.protocols.map((proto) => (
                        <span key={proto} className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                          {proto}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 uppercase">Features</p>
                    <ul className="text-xs space-y-1">
                      {provider.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="text-gray-300">✓ {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => window.open(provider.affiliateLink, '_blank')}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    VISIT PROVIDER
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* IP Check Tab */}
      {activeTab === 'ip' && (
        <Card className="hud-frame p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold neon-cyan">CURRENT IP INFORMATION</h2>
            <button
              onClick={() => setShowIPDetails(!showIPDetails)}
              className="p-2 hover:bg-cyan-500/20 rounded transition-colors"
            >
              {showIPDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30">
              <p className="text-xs text-gray-400 uppercase">IP Address</p>
              <p className="text-lg font-bold neon-cyan font-mono">{showIPDetails ? currentIP.ip : '***.***.***.**'}</p>
            </div>
            <div className="bg-[#0a0e27] p-4 rounded border border-pink-500/30">
              <p className="text-xs text-gray-400 uppercase">Country</p>
              <p className="text-lg font-bold neon-pink">{currentIP.country}</p>
            </div>
            <div className="bg-[#0a0e27] p-4 rounded border border-green-500/30">
              <p className="text-xs text-gray-400 uppercase">City</p>
              <p className="text-lg font-bold text-green-400">{currentIP.city}</p>
            </div>
            <div className={`bg-[#0a0e27] p-4 rounded border ${currentIP.isVPN ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <p className="text-xs text-gray-400 uppercase">VPN Status</p>
              <p className={`text-lg font-bold ${currentIP.isVPN ? 'text-green-400' : 'text-red-400'}`}>
                {currentIP.isVPN ? 'PROTECTED' : 'EXPOSED'}
              </p>
            </div>
          </div>

          {showIPDetails && (
            <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30 space-y-2">
              <p className="text-sm"><span className="text-gray-400">ISP:</span> <span className="text-cyan-400">{currentIP.isp}</span></p>
              <p className="text-sm"><span className="text-gray-400">Latitude:</span> <span className="text-cyan-400">{currentIP.latitude}</span></p>
              <p className="text-sm"><span className="text-gray-400">Longitude:</span> <span className="text-cyan-400">{currentIP.longitude}</span></p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
