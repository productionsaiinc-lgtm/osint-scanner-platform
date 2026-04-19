import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Globe, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function DNSEnumeration() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const enumerateMutation = trpc.securityTools.dnsEnumeration.enumerate.useMutation();
  const checkZoneMutation = trpc.securityTools.dnsEnumeration.checkZoneTransfer.useMutation();
  const validateDNSSECMutation = trpc.securityTools.dnsEnumeration.validateDNSSEC.useQuery(
    { domain: domain || "" },
    { enabled: false }
  );

  const handleEnumerate = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    setLoading(true);
    try {
      const result = await enumerateMutation.mutateAsync({ domain });
      setResults(result.data);
      toast.success("DNS enumeration completed");
    } catch (error) {
      toast.error("Enumeration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckZoneTransfer = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    setLoading(true);
    try {
      const result = await checkZoneMutation.mutateAsync({ domain });
      toast.success(result.vulnerable ? "Zone transfer vulnerability detected!" : "No zone transfer vulnerability");
      setResults(prev => ({ ...prev, zoneTransferVulnerable: result.vulnerable }));
    } catch (error) {
      toast.error("Zone transfer check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-cyan-400">DNS Enumeration</h1>
        <p className="text-gray-400">Discover DNS records and subdomains</p>
      </div>

      <Card className="bg-gray-900 border-cyan-500/30 p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Domain</label>
          <Input
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleEnumerate}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
            Enumerate DNS
          </Button>
          <Button
            onClick={handleCheckZoneTransfer}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
            Check Zone Transfer
          </Button>
        </div>
      </Card>

      {results && (
        <div className="space-y-4">
          {results.nameservers && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Nameservers</h3>
              <div className="space-y-2">
                {results.nameservers.map((ns: string, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 p-2 rounded text-gray-300 font-mono text-sm">
                    {ns}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.records && results.records.length > 0 && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">DNS Records</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.records.map((record: any, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 p-3 rounded border border-gray-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-purple-400 font-semibold">{record.type}</span>
                      <span className="text-gray-400 text-sm">TTL: {record.ttl}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{record.name}</p>
                    <p className="text-cyan-300 text-sm font-mono">{record.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.subdomains && results.subdomains.length > 0 && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Discovered Subdomains</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {results.subdomains.map((sub: string, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 p-2 rounded text-gray-300 text-sm font-mono">
                    {sub}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.mailServers && results.mailServers.length > 0 && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Mail Servers</h3>
              <div className="space-y-2">
                {results.mailServers.map((mx: any, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 p-2 rounded">
                    <p className="text-gray-300 text-sm">{mx.hostname}</p>
                    <p className="text-gray-400 text-xs">Priority: {mx.priority}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.dnssecEnabled !== undefined && (
            <Card className={`${results.dnssecEnabled ? 'border-green-500/30' : 'border-red-500/30'} bg-gray-900 p-4`}>
              <h3 className="text-lg font-semibold mb-2">DNSSEC Status</h3>
              <p className={results.dnssecEnabled ? 'text-green-400' : 'text-red-400'}>
                {results.dnssecEnabled ? '✓ DNSSEC Enabled' : '✗ DNSSEC Disabled'}
              </p>
            </Card>
          )}

          {results.zoneTransferVulnerable !== undefined && (
            <Card className={`${results.zoneTransferVulnerable ? 'border-red-500/30' : 'border-green-500/30'} bg-gray-900 p-4`}>
              <h3 className="text-lg font-semibold mb-2">Zone Transfer</h3>
              <p className={results.zoneTransferVulnerable ? 'text-red-400' : 'text-green-400'}>
                {results.zoneTransferVulnerable ? '⚠ Vulnerable to zone transfer' : '✓ Protected from zone transfer'}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
