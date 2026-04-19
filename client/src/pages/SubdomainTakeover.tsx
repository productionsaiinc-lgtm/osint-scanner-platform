import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function SubdomainTakeover() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const scanMutation = trpc.securityTools.subdomainTakeover.scan.useMutation();

   const handleScan = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    setLoading(true);
    try {
      const result = await scanMutation.mutateAsync({ domain });
      setResults(result.data);
      toast.success(`Scan completed. Found ${result.data.vulnerable_subdomains.length} vulnerable subdomains`);
    } catch (error) {
      toast.error("Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-900/30 border-red-500/50 text-red-300";
      case "high":
        return "bg-orange-900/30 border-orange-500/50 text-orange-300";
      case "medium":
        return "bg-yellow-900/30 border-yellow-500/50 text-yellow-300";
      case "low":
        return "bg-blue-900/30 border-blue-500/50 text-blue-300";
      default:
        return "bg-gray-900/30 border-gray-500/50 text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-cyan-400">Subdomain Takeover Detection</h1>
        <p className="text-gray-400">Identify vulnerable subdomains that can be taken over</p>
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

        <Button
          onClick={handleScan}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 w-full"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
          Scan for Takeover Vulnerabilities
        </Button>
      </Card>

      {results && (
        <div className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/30 p-4">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Scan Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Subdomains Scanned</p>
                <p className="text-cyan-300 text-2xl font-bold">{results.subdomains_scanned}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Vulnerable Found</p>
                <p className="text-red-400 text-2xl font-bold">{results.vulnerable_subdomains.length}</p>
              </div>
            </div>
          </Card>

          {results.vulnerable_subdomains && results.vulnerable_subdomains.length > 0 && (
            <Card className="bg-gray-900 border-red-500/30 p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Vulnerable Subdomains</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.vulnerable_subdomains.map((sub: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded border ${getRiskColor(sub.riskLevel)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono font-semibold">{sub.subdomain}</p>
                        <p className="text-sm opacity-75">{sub.service}</p>
                      </div>
                      <span className="font-bold uppercase text-sm">{sub.riskLevel}</span>
                    </div>
                    {sub.takeover_method && (
                      <p className="text-sm opacity-75">Method: {sub.takeover_method}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.vulnerable_subdomains.length === 0 && (
            <Card className="bg-green-900/20 border-green-500/30 p-4">
              <p className="text-green-400">✓ No vulnerable subdomains found</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
