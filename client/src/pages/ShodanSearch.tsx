import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cpu, Search, Loader2, AlertCircle, Wifi, Server, MapPin } from 'lucide-react';

export function ShodanSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Cpu className="w-8 h-8" />
          Device Search (Shodan)
        </h1>
        <p className="text-gray-400 mt-2">Search for internet-connected devices and services</p>
      </div>

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
            <div className="text-xs text-gray-400">
              <strong>Examples:</strong> port:80, product:nginx, country:US, os:Linux, http.title:admin
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="grid grid-cols-1 gap-4">
        {/* Result 1 */}
        <Card className="border-purple-500/30 bg-black/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-400" />
                <div>
                  <CardTitle className="text-purple-400">192.168.1.100</CardTitle>
                  <CardDescription>Apache HTTP Server</CardDescription>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Active</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 border border-purple-500/30 rounded bg-purple-500/5">
                <div className="text-xs text-gray-400">Port</div>
                <div className="text-sm font-mono text-purple-400 mt-1">80</div>
              </div>
              <div className="p-2 border border-purple-500/30 rounded bg-purple-500/5">
                <div className="text-xs text-gray-400">Service</div>
                <div className="text-sm font-mono text-purple-400 mt-1">HTTP</div>
              </div>
              <div className="p-2 border border-purple-500/30 rounded bg-purple-500/5">
                <div className="text-xs text-gray-400">OS</div>
                <div className="text-sm font-mono text-purple-400 mt-1">Linux</div>
              </div>
              <div className="p-2 border border-purple-500/30 rounded bg-purple-500/5">
                <div className="text-xs text-gray-400">Version</div>
                <div className="text-sm font-mono text-purple-400 mt-1">2.4.41</div>
              </div>
            </div>
            <div className="mt-3 p-2 border border-purple-500/30 rounded bg-purple-500/5">
              <div className="text-xs text-gray-400">Banner</div>
              <div className="text-xs font-mono text-purple-400 mt-1 break-all">
                HTTP/1.1 200 OK | Server: Apache/2.4.41 (Ubuntu)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result 2 */}
        <Card className="border-green-500/30 bg-black/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-green-400" />
                <div>
                  <CardTitle className="text-green-400">203.0.113.45</CardTitle>
                  <CardDescription>Nginx Web Server</CardDescription>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Active</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 border border-green-500/30 rounded bg-green-500/5">
                <div className="text-xs text-gray-400">Port</div>
                <div className="text-sm font-mono text-green-400 mt-1">443</div>
              </div>
              <div className="p-2 border border-green-500/30 rounded bg-green-500/5">
                <div className="text-xs text-gray-400">Service</div>
                <div className="text-sm font-mono text-green-400 mt-1">HTTPS</div>
              </div>
              <div className="p-2 border border-green-500/30 rounded bg-green-500/5">
                <div className="text-xs text-gray-400">OS</div>
                <div className="text-sm font-mono text-green-400 mt-1">Linux</div>
              </div>
              <div className="p-2 border border-green-500/30 rounded bg-green-500/5">
                <div className="text-xs text-gray-400">Version</div>
                <div className="text-sm font-mono text-green-400 mt-1">1.21.0</div>
              </div>
            </div>
            <div className="mt-3 p-2 border border-green-500/30 rounded bg-green-500/5">
              <div className="text-xs text-gray-400">SSL Certificate</div>
              <div className="text-xs font-mono text-green-400 mt-1 break-all">
                CN=example.com, Issuer=Let's Encrypt
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result 3 */}
        <Card className="border-pink-500/30 bg-black/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-400" />
                <div>
                  <CardTitle className="text-pink-400">198.51.100.78</CardTitle>
                  <CardDescription>SSH Server</CardDescription>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">Caution</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 border border-pink-500/30 rounded bg-pink-500/5">
                <div className="text-xs text-gray-400">Port</div>
                <div className="text-sm font-mono text-pink-400 mt-1">22</div>
              </div>
              <div className="p-2 border border-pink-500/30 rounded bg-pink-500/5">
                <div className="text-xs text-gray-400">Service</div>
                <div className="text-sm font-mono text-pink-400 mt-1">SSH</div>
              </div>
              <div className="p-2 border border-pink-500/30 rounded bg-pink-500/5">
                <div className="text-xs text-gray-400">OS</div>
                <div className="text-sm font-mono text-pink-400 mt-1">Linux</div>
              </div>
              <div className="p-2 border border-pink-500/30 rounded bg-pink-500/5">
                <div className="text-xs text-gray-400">Version</div>
                <div className="text-sm font-mono text-pink-400 mt-1">7.4</div>
              </div>
            </div>
            <div className="mt-3 p-2 border border-pink-500/30 rounded bg-pink-500/5">
              <div className="text-xs text-gray-400">Banner</div>
              <div className="text-xs font-mono text-pink-400 mt-1 break-all">
                SSH-2.0-OpenSSH_7.4 (Outdated version detected)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-cyan-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Total Results</div>
            <div className="text-2xl font-bold text-cyan-400 mt-2">3</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Active Devices</div>
            <div className="text-2xl font-bold text-green-400 mt-2">3</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Vulnerabilities</div>
            <div className="text-2xl font-bold text-yellow-400 mt-2">1</div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-500/30 bg-blue-500/10">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-400">
          Shodan searches the internet for internet-connected devices. Use responsibly and only for authorized reconnaissance.
        </AlertDescription>
      </Alert>
    </div>
  );
}
