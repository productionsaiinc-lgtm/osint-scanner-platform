import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Radar,
  Search,
  AlertCircle,
  Zap,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Network,
  Download,
} from 'lucide-react';

interface NmapPort {
  port: number;
  protocol: string;
  state: 'open' | 'closed' | 'filtered' | 'unknown';
  service: string;
  version?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

interface NmapResult {
  target: string;
  scanTime: string;
  status: 'up' | 'down';
  osDetection: string;
  osAccuracy: number;
  openPorts: number;
  closedPorts: number;
  filteredPorts: number;
  totalPorts: number;
  ports: NmapPort[];
  macAddress?: string;
  hostnames: string[];
  scanProfile: string;
}

export function NmapScanner() {
  const [target, setTarget] = useState('');
  const [scanProfile, setScanProfile] = useState('normal');
  const [results, setResults] = useState<NmapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState({
    udpScan: false,
    pingSweep: false,
    osDetection: true,
    serviceDetection: true,
    scriptScanning: false,
  });

  const scanProfiles = [
    { value: 'paranoid', label: 'Paranoid (T0)', description: 'Very slow, stealthy' },
    { value: 'sneaky', label: 'Sneaky (T1)', description: 'Slow, evasive' },
    { value: 'polite', label: 'Polite (T2)', description: 'Moderate speed' },
    { value: 'normal', label: 'Normal (T3)', description: 'Default speed' },
    { value: 'aggressive', label: 'Aggressive (T4)', description: 'Fast, may miss hosts' },
  ];

  const handleScan = async () => {
    if (!target.trim()) {
      setError('Please enter a target IP or hostname');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Simulate API call - replace with actual tRPC call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock result
      const mockResult: NmapResult = {
        target: target,
        scanTime: '42.5s',
        status: 'up',
        osDetection: 'Linux 5.10.0-x86_64',
        osAccuracy: 95,
        openPorts: 5,
        closedPorts: 993,
        filteredPorts: 2,
        totalPorts: 1000,
        ports: [
          {
            port: 22,
            protocol: 'tcp',
            state: 'open',
            service: 'ssh',
            version: 'OpenSSH 8.2p1',
            severity: 'high',
          },
          {
            port: 80,
            protocol: 'tcp',
            state: 'open',
            service: 'http',
            version: 'Apache httpd 2.4.41',
            severity: 'medium',
          },
          {
            port: 443,
            protocol: 'tcp',
            state: 'open',
            service: 'https',
            version: 'Apache httpd 2.4.41',
            severity: 'low',
          },
          {
            port: 3306,
            protocol: 'tcp',
            state: 'open',
            service: 'mysql',
            version: 'MySQL 8.0.23',
            severity: 'critical',
          },
          {
            port: 5432,
            protocol: 'tcp',
            state: 'open',
            service: 'postgresql',
            version: 'PostgreSQL 12.6',
            severity: 'high',
          },
        ],
        macAddress: '00:1A:2B:3C:4D:5E',
        hostnames: ['example.com', 'www.example.com'],
        scanProfile: scanProfile,
      };

      setResults(mockResult);
    } catch (err) {
      setError('Failed to perform Nmap scan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-neon-cyan flex items-center gap-2">
          <Radar className="w-8 h-8" />
          Nmap Scanner
        </h1>
        <p className="text-gray-400 mt-2">Advanced network reconnaissance and port scanning</p>
      </div>

      {/* Scan Configuration */}
      <Card className="border-neon-cyan/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-neon-cyan">Scan Configuration</CardTitle>
          <CardDescription>Configure your Nmap scan parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter target IP or hostname (e.g., 192.168.1.1 or example.com)"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-neon-cyan/30 bg-black/40 text-neon-cyan placeholder-gray-500"
              />
            </div>
            <Button
              onClick={handleScan}
              disabled={loading}
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold"
            >
              <Radar className="w-4 h-4 mr-2" />
              {loading ? 'Scanning...' : 'Start Scan'}
            </Button>
          </div>

          {/* Scan Profile Selection */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">Scan Timing Profile</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {scanProfiles.map((profile) => (
                <button
                  key={profile.value}
                  onClick={() => setScanProfile(profile.value)}
                  className={`p-2 rounded border text-xs text-center transition-all ${
                    scanProfile === profile.value
                      ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                      : 'border-gray-600 bg-black/40 text-gray-400 hover:border-neon-cyan/50'
                  }`}
                  title={profile.description}
                >
                  {profile.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">Advanced Options</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(advancedOptions).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setAdvancedOptions({ ...advancedOptions, [key]: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-600 bg-black/40 cursor-pointer"
                  />
                  <span className="text-xs text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="border-l-4 border-l-neon-green border-gray-500/30 bg-black/40">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-400">Target</div>
                  <div className="text-sm font-mono text-neon-cyan mt-1">{results.target}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    <span className="text-sm font-semibold text-neon-green capitalize">{results.status}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Scan Time</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-neon-yellow" />
                    <span className="text-sm font-semibold text-neon-yellow">{results.scanTime}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Profile</div>
                  <div className="text-sm font-semibold text-neon-purple capitalize mt-1">{results.scanProfile}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Port Statistics */}
          <Card className="border-neon-yellow/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-neon-yellow flex items-center gap-2">
                <Network className="w-5 h-5" />
                Port Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 border border-neon-green/30 rounded bg-neon-green/5">
                  <div className="text-xs text-gray-400">Open Ports</div>
                  <div className="text-2xl font-bold text-neon-green mt-1">{results.openPorts}</div>
                </div>
                <div className="p-3 border border-neon-red/30 rounded bg-neon-red/5">
                  <div className="text-xs text-gray-400">Closed Ports</div>
                  <div className="text-2xl font-bold text-neon-red mt-1">{results.closedPorts}</div>
                </div>
                <div className="p-3 border border-neon-yellow/30 rounded bg-neon-yellow/5">
                  <div className="text-xs text-gray-400">Filtered Ports</div>
                  <div className="text-2xl font-bold text-neon-yellow mt-1">{results.filteredPorts}</div>
                </div>
                <div className="p-3 border border-neon-cyan/30 rounded bg-neon-cyan/5">
                  <div className="text-xs text-gray-400">Total Scanned</div>
                  <div className="text-2xl font-bold text-neon-cyan mt-1">{results.totalPorts}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OS Detection */}
          <Card className="border-neon-purple/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center gap-2">
                <Shield className="w-5 h-5" />
                OS Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="text-xs text-gray-400">Detected OS</div>
                <div className="text-sm font-mono text-white mt-1">{results.osDetection}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Accuracy</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-black/60 rounded h-2">
                    <div
                      className="bg-neon-purple h-2 rounded"
                      style={{ width: `${results.osAccuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-neon-purple">{results.osAccuracy}%</span>
                </div>
              </div>
              {results.macAddress && (
                <div>
                  <div className="text-xs text-gray-400">MAC Address</div>
                  <div className="text-sm font-mono text-white mt-1">{results.macAddress}</div>
                </div>
              )}
              {results.hostnames.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400">Hostnames</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {results.hostnames.map((hostname, idx) => (
                      <span key={idx} className="px-2 py-1 bg-neon-purple/20 border border-neon-purple/50 rounded text-xs text-neon-purple">
                        {hostname}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Open Ports Details */}
          <Card className="border-neon-green/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Open Ports ({results.ports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.ports.map((port, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded ${getSeverityColor(port.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono font-bold">
                          {port.port}/{port.protocol.toUpperCase()}
                        </div>
                        <div className="text-sm mt-1">{port.service}</div>
                        {port.version && (
                          <div className="text-xs opacity-75 mt-1">{port.version}</div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getSeverityColor(port.severity)}`}>
                        {port.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Button className="w-full bg-neon-green hover:bg-neon-green/80 text-black font-semibold">
            <Download className="w-4 h-4 mr-2" />
            Export Scan Results
          </Button>

          {/* Information Alert */}
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-400">
              Nmap scan results are for authorized security testing only. Ensure you have permission before scanning any network or system.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Info Alert */}
      {!results && (
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-400">
            Enter a target IP address or hostname to begin network reconnaissance. Nmap will scan for open ports, detect services, and identify the operating system.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
