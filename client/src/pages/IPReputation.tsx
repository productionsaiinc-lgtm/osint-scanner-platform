import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Search, Loader2, AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function IPReputation() {
  const [ip, setIp] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkReputation = trpc.scans.reverseDNS.useQuery(
    { target: ip.trim() },
    { enabled: false }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip.trim()) return;

    setIsLoading(true);
    checkReputation.refetch().then((result) => {
      setResults(result.data);
      setIsLoading(false);
    }).catch((error: any) => {
      setResults({ error: error.message });
      setIsLoading(false);
    });
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 75) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (riskScore >= 50) return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    if (riskScore >= 25) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-green-500 bg-green-500/10 border-green-500/30';
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            IP Reputation Check
          </CardTitle>
          <CardDescription>
            Check IP address reputation, geolocation, and associated risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-purple-400">IP Address</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., 8.8.8.8"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !ip.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Check
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-purple-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-purple-400">IP Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <Alert className="border-red-500/30 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  {results.error}
                </AlertDescription>
              </Alert>
            ) : results.success && results.results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                    <div className="text-xs text-gray-400">IP Address</div>
                    <div className="text-sm font-mono text-purple-400 mt-1">
                      {results.results.ip || ip}
                    </div>
                  </div>
                  <div className={`p-3 border rounded ${getRiskColor(results.results.riskScore || 0)}`}>
                    <div className="text-xs">Risk Score</div>
                    <div className="text-sm font-mono font-bold mt-1">
                      {results.results.riskScore || 0}/100
                    </div>
                  </div>
                  {results.results.country && (
                    <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                      <div className="text-xs text-gray-400">Country</div>
                      <div className="text-sm font-mono text-purple-400 mt-1">
                        {results.results.country}
                      </div>
                    </div>
                  )}
                  {results.results.isp && (
                    <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                      <div className="text-xs text-gray-400">ISP</div>
                      <div className="text-sm font-mono text-purple-400 mt-1">
                        {results.results.isp}
                      </div>
                    </div>
                  )}
                </div>

                {results.results.threats && results.results.threats.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-yellow-400 font-bold">Detected Threats</div>
                    <div className="space-y-1">
                      {results.results.threats.map((threat: string, idx: number) => (
                        <div
                          key={idx}
                          className="text-xs p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400"
                        >
                          ⚠️ {threat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.results.hostname && (
                  <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5">
                    <div className="text-xs text-gray-400">Hostname</div>
                    <div className="text-sm font-mono text-purple-400 mt-1">
                      {results.results.hostname}
                    </div>
                  </div>
                )}
              </div>
            ) : results.success ? (
              <Alert className="border-purple-500/30 bg-purple-500/10">
                <AlertDescription className="text-purple-400">
                  No reputation data available for this IP address.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
