import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Wifi, Loader2, AlertCircle, Shield, MapPin, Server, Cpu, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function IoTScanner() {
  const [, setLocation] = useLocation();
  const [ipRange, setIpRange] = useState('');

  const mutation = trpc.osintTools.iotScanner.useMutation({
    onError: (e) => toast.error(e.message || 'IoT scan failed'),
  });

  const results = mutation.data?.success ? mutation.data.data : null;

  const handleScan = () => {
    if (!ipRange.trim()) return;
    mutation.mutate({ ipRange: ipRange.trim() });
  };

  const vulnColor = (v: string[]) => {
    if (!v || v.length === 0) return 'text-green-400';
    if (v.length >= 3) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wifi className="w-8 h-8 text-cyan-400" />
              IoT Scanner
            </h1>
            <p className="text-muted-foreground mt-2">
              Scan for Internet of Things devices using Shodan intelligence
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">IP Range, Network, or Keyword</label>
                <p className="text-xs text-muted-foreground mt-1">
                  Examples: <code className="text-cyan-400">192.168.1.0/24</code>, <code className="text-cyan-400">camera</code>, <code className="text-cyan-400">port:8080 country:US</code>
                </p>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="192.168.1.0/24 or search keyword…"
                    value={ipRange}
                    onChange={(e) => setIpRange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    disabled={mutation.isPending}
                  />
                  <Button onClick={handleScan} disabled={mutation.isPending || !ipRange.trim()}>
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {mutation.isPending && (
            <Card className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
              <p className="text-muted-foreground">Scanning for IoT devices…</p>
            </Card>
          )}

          {mutation.data && !mutation.data.success && (
            <Card className="p-4 border-red-500/30 bg-red-900/10">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{(mutation.data as any).error}</span>
              </div>
            </Card>
          )}

          {results && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-card">
                  <p className="text-xs text-muted-foreground">Devices Found</p>
                  <p className="text-3xl font-bold text-cyan-400">{results.count}</p>
                </Card>
                <Card className="p-4 bg-card">
                  <p className="text-xs text-muted-foreground">Network</p>
                  <p className="text-sm font-mono text-white mt-1">{results.ipRange}</p>
                </Card>
                <Card className={`p-4 ${results.shodanPowered ? 'border-green-500/40 bg-green-900/10' : 'border-yellow-500/40 bg-yellow-900/10'}`}>
                  <p className="text-xs text-muted-foreground">Data Source</p>
                  <p className={`text-sm font-medium mt-1 ${results.shodanPowered ? 'text-green-400' : 'text-yellow-400'}`}>
                    {results.shodanPowered ? '✓ Shodan API' : '⚠ Simulated'}
                  </p>
                </Card>
              </div>

              {results.note && !results.shodanPowered && (
                <div className="text-xs text-yellow-300 bg-yellow-900/20 border border-yellow-700/40 p-3 rounded">
                  ℹ️ {results.note}
                </div>
              )}

              {/* Device List */}
              <div className="space-y-3">
                {results.devices.map((device: any, idx: number) => (
                  <Card key={idx} className="p-4 bg-card border-border">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <span className="font-semibold">{device.device}</span>
                          <Badge className="text-xs bg-green-900/50 text-green-300 border border-green-700">{device.status}</Badge>
                        </div>
                        <p className="text-sm font-mono text-blue-400">{device.ip}</p>
                        {device.org && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Server className="w-3 h-3" /> {device.org}
                          </p>
                        )}
                        {device.country && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {device.country}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {device.ports.map((p: number) => (
                            <Badge key={p} variant="outline" className="text-xs font-mono">{p}</Badge>
                          ))}
                        </div>
                        {device.vulnerabilities && device.vulnerabilities.length > 0 && (
                          <div className="flex items-center gap-1 justify-end">
                            <AlertTriangle className={`w-4 h-4 ${vulnColor(device.vulnerabilities)}`} />
                            <span className={`text-xs ${vulnColor(device.vulnerabilities)}`}>
                              {device.vulnerabilities.length} CVE{device.vulnerabilities.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        {device.os && (
                          <p className="text-xs text-muted-foreground">{device.os}</p>
                        )}
                      </div>
                    </div>
                    {device.vulnerabilities && device.vulnerabilities.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border flex flex-wrap gap-1">
                        {device.vulnerabilities.map((cve: string) => (
                          <a
                            key={cve}
                            href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded hover:underline"
                          >
                            {cve}
                          </a>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Security Tips */}
              <Card className="p-4 border-yellow-500/30 bg-yellow-900/10">
                <h3 className="font-medium text-yellow-400 flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" /> Security Recommendations
                </h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Change default credentials on all IoT devices immediately</li>
                  <li>• Isolate IoT devices on a separate VLAN</li>
                  <li>• Apply firmware updates regularly</li>
                  <li>• Disable unnecessary open ports and services</li>
                  <li>• Enable TLS/HTTPS where supported</li>
                </ul>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
