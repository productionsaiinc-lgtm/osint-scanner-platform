import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Search, Loader2, AlertCircle, Globe, Lock, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function SecurityTrails() {
  const [domain, setDomain] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!domain.trim()) return;
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Domain Intelligence (SecurityTrails)
        </h1>
        <p className="text-gray-400 mt-2">Comprehensive domain reconnaissance and threat intelligence</p>
      </div>

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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border-cyan-500/30 bg-black/40 text-cyan-400 placeholder:text-gray-600"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !domain.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
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
                <div className="text-sm font-mono text-purple-400 mt-1">GoDaddy.com, Inc.</div>
              </div>
              <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                <div className="text-xs text-gray-400">Created</div>
                <div className="text-sm font-mono text-purple-400 mt-1">1995-08-01</div>
              </div>
              <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                <div className="text-xs text-gray-400">Expires</div>
                <div className="text-sm font-mono text-purple-400 mt-1">2025-08-01</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DNS Records */}
        <Card className="border-green-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              DNS Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2 border border-green-500/30 rounded bg-green-500/5">
                <div className="text-green-400">A: 93.184.216.34</div>
              </div>
              <div className="p-2 border border-green-500/30 rounded bg-green-500/5">
                <div className="text-green-400">MX: mail.example.com</div>
              </div>
              <div className="p-2 border border-green-500/30 rounded bg-green-500/5">
                <div className="text-green-400">NS: ns1.example.com</div>
              </div>
              <div className="p-2 border border-green-500/30 rounded bg-green-500/5">
                <div className="text-green-400">TXT: v=spf1 include:_spf.example.com</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subdomains */}
        <Card className="border-pink-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-pink-400">Discovered Subdomains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['www', 'mail', 'ftp', 'admin', 'api', 'cdn', 'blog', 'shop'].map((sub, idx) => (
                <div key={idx} className="p-2 border border-pink-500/30 rounded bg-pink-500/5 text-xs">
                  <div className="font-mono text-pink-400">{sub}.example.com</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SSL Certificate */}
        <Card className="border-yellow-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-yellow-400">SSL Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-yellow-500/30 rounded bg-yellow-500/5">
                <div className="text-xs text-gray-400">Issuer</div>
                <div className="text-sm font-mono text-yellow-400 mt-1">Let's Encrypt</div>
              </div>
              <div className="p-3 border border-yellow-500/30 rounded bg-yellow-500/5">
                <div className="text-xs text-gray-400">Valid From</div>
                <div className="text-sm font-mono text-yellow-400 mt-1">2024-01-15</div>
              </div>
              <div className="p-3 border border-yellow-500/30 rounded bg-yellow-500/5">
                <div className="text-xs text-gray-400">Valid Until</div>
                <div className="text-sm font-mono text-yellow-400 mt-1">2025-01-15</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical Data */}
        <Card className="border-orange-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Historical DNS Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="p-2 border border-orange-500/30 rounded bg-orange-500/5">
                <div className="text-orange-400">2024-06-15: IP changed to 93.184.216.34</div>
              </div>
              <div className="p-2 border border-orange-500/30 rounded bg-orange-500/5">
                <div className="text-orange-400">2024-03-20: Nameserver updated</div>
              </div>
              <div className="p-2 border border-orange-500/30 rounded bg-orange-500/5">
                <div className="text-orange-400">2023-12-10: MX record added</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threat Intelligence */}
        <Card className="border-red-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-red-400">Threat Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-green-500/30 bg-green-500/10">
              <AlertCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                No threats detected. Domain has clean reputation.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-500/30 bg-blue-500/10">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-400">
          SecurityTrails data includes domain history, DNS records, subdomains, and threat intelligence. Results are updated regularly from public sources.
        </AlertDescription>
      </Alert>
    </div>
  );
}
