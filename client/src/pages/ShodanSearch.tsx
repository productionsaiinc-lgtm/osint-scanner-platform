import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cpu, Search, Loader2, AlertCircle, Wifi, Server, MapPin, Shield, Globe, Lock, TrendingUp } from 'lucide-react';

export function ShodanSearch() {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('shodan');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  };

  const handleDomainSearch = async () => {
    if (!domain.trim()) return;
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold neon-cyan-glow flex items-center gap-2">
          <Cpu className="w-8 h-8" />
          Device & Domain Intelligence
        </h1>
        <p className="text-gray-400 mt-2">Combined Shodan device search and SecurityTrails domain reconnaissance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-cyan-500/30">
        <button
          onClick={() => setActiveTab('shodan')}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === 'shodan'
              ? 'text-neon-cyan border-b-2 border-neon-cyan'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Cpu className="w-4 h-4 inline mr-2" />
          Shodan Devices
        </button>
        <button
          onClick={() => setActiveTab('securitytrails')}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === 'securitytrails'
              ? 'text-neon-cyan border-b-2 border-neon-cyan'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          SecurityTrails
        </button>
      </div>

      {/* Shodan Tab */}
      {activeTab === 'shodan' && (
        <>
          {/* Search Section */}
          <Card className="border-cyan-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-cyan-400">Shodan Query</CardTitle>
              <CardDescription>Search for devices by IP, port, service, or vulnerability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., port:22, product:Apache, country:US"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="border-cyan-500/30 bg-black/40 text-cyan-400 placeholder:text-gray-600"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !query.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device Results */}
            <Card className="border-cyan-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Device Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-cyan-500/30 rounded bg-cyan-500/5">
                    <div className="text-xs text-gray-400">IP Address</div>
                    <div className="text-sm font-mono text-cyan-400 mt-1">192.168.1.100</div>
                  </div>
                  <div className="p-3 border border-cyan-500/30 rounded bg-cyan-500/5">
                    <div className="text-xs text-gray-400">Port</div>
                    <div className="text-sm font-mono text-cyan-400 mt-1">22 (SSH)</div>
                  </div>
                  <div className="p-3 border border-cyan-500/30 rounded bg-cyan-500/5">
                    <div className="text-xs text-gray-400">Service</div>
                    <div className="text-sm font-mono text-cyan-400 mt-1">OpenSSH 7.4</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vulnerability Info */}
            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Vulnerabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert className="border-red-500/30 bg-red-500/5">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400 ml-2">
                      CVE-2018-15473: OpenSSH Username Enumeration
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-yellow-500/30 bg-yellow-500/5">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-400 ml-2">
                      Weak SSH Key Exchange Algorithm Detected
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-green-500/30 rounded bg-green-500/5">
                    <div className="text-xs text-gray-400">Country</div>
                    <div className="text-sm font-mono text-green-400 mt-1">United States</div>
                  </div>
                  <div className="p-3 border border-green-500/30 rounded bg-green-500/5">
                    <div className="text-xs text-gray-400">City</div>
                    <div className="text-sm font-mono text-green-400 mt-1">San Francisco</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ISP Info */}
            <Card className="border-purple-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  ISP Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                    <div className="text-xs text-gray-400">Organization</div>
                    <div className="text-sm font-mono text-purple-400 mt-1">Example ISP Inc.</div>
                  </div>
                  <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                    <div className="text-xs text-gray-400">ASN</div>
                    <div className="text-sm font-mono text-purple-400 mt-1">AS12345</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* SecurityTrails Tab */}
      {activeTab === 'securitytrails' && (
        <>
          {/* Search Section */}
          <Card className="border-cyan-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-cyan-400">Domain Search</CardTitle>
              <CardDescription>Enter a domain to analyze its infrastructure and history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDomainSearch()}
                  className="border-cyan-500/30 bg-black/40 text-cyan-400 placeholder:text-gray-600"
                />
                <Button
                  onClick={handleDomainSearch}
                  disabled={isSearching || !domain.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain Information */}
            <Card className="border-purple-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Domain Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                    <div className="text-xs text-gray-400">Domain</div>
                    <div className="text-sm font-mono text-purple-400 mt-1">example.com</div>
                  </div>
                  <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                    <div className="text-xs text-gray-400">Registrar</div>
                    <div className="text-sm font-mono text-purple-400 mt-1">GoDaddy</div>
                  </div>
                  <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                    <div className="text-xs text-gray-400">Created</div>
                    <div className="text-sm font-mono text-purple-400 mt-1">2010-01-15</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DNS Records */}
            <Card className="border-blue-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  DNS Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-blue-500/30 rounded bg-blue-500/5">
                    <div className="text-xs text-gray-400">A Record</div>
                    <div className="text-sm font-mono text-blue-400 mt-1">93.184.216.34</div>
                  </div>
                  <div className="p-3 border border-blue-500/30 rounded bg-blue-500/5">
                    <div className="text-xs text-gray-400">MX Record</div>
                    <div className="text-sm font-mono text-blue-400 mt-1">mail.example.com</div>
                  </div>
                  <div className="p-3 border border-blue-500/30 rounded bg-blue-500/5">
                    <div className="text-xs text-gray-400">NS Record</div>
                    <div className="text-sm font-mono text-blue-400 mt-1">ns1.example.com</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subdomains */}
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Subdomains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2 border border-green-500/30 rounded bg-green-500/5 text-xs font-mono text-green-400">
                    www.example.com
                  </div>
                  <div className="p-2 border border-green-500/30 rounded bg-green-500/5 text-xs font-mono text-green-400">
                    mail.example.com
                  </div>
                  <div className="p-2 border border-green-500/30 rounded bg-green-500/5 text-xs font-mono text-green-400">
                    api.example.com
                  </div>
                  <div className="p-2 border border-green-500/30 rounded bg-green-500/5 text-xs font-mono text-green-400">
                    admin.example.com
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SSL Certificates */}
            <Card className="border-yellow-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  SSL Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-yellow-500/30 rounded bg-yellow-500/5">
                    <div className="text-xs text-gray-400">Issuer</div>
                    <div className="text-sm font-mono text-yellow-400 mt-1">Let's Encrypt</div>
                  </div>
                  <div className="p-3 border border-yellow-500/30 rounded bg-yellow-500/5">
                    <div className="text-xs text-gray-400">Expires</div>
                    <div className="text-sm font-mono text-yellow-400 mt-1">2025-06-15</div>
                  </div>
                  <div className="p-3 border border-yellow-500/30 rounded bg-yellow-500/5">
                    <div className="text-xs text-gray-400">Algorithm</div>
                    <div className="text-sm font-mono text-yellow-400 mt-1">SHA-256 RSA</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default ShodanSearch;
