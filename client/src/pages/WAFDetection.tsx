import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function WAFDetection() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const detectMutation = trpc.securityTools.wafDetection.detect.useMutation();

  const handleDetect = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    setLoading(true);
    try {
      const result = await detectMutation.mutateAsync({ domain });
      setResults(result.data);
      toast.success(result.data.wafDetected ? "WAF detected!" : "No WAF detected");
    } catch (error) {
      toast.error("Detection failed");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-900/20 border-red-500/30";
      case "high":
        return "bg-orange-900/20 border-orange-500/30";
      case "medium":
        return "bg-yellow-900/20 border-yellow-500/30";
      case "low":
        return "bg-green-900/20 border-green-500/30";
      default:
        return "bg-gray-900/20 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-cyan-400">WAF Detection</h1>
        <p className="text-gray-400">Identify Web Application Firewall protection</p>
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
          onClick={handleDetect}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 w-full"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
          Detect WAF
        </Button>
      </Card>

      {results && (
        <div className="space-y-4">
          <Card className={`${getRiskBgColor(results.protectionLevel)} border p-4`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-cyan-400">Protection Status</h3>
              <span className={`font-bold text-lg ${getRiskColor(results.protectionLevel)}`}>
                {results.protectionLevel.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-300">
              {results.wafDetected ? `WAF Type: ${results.wafType || 'Unknown'}` : 'No WAF detected'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Confidence: {results.confidence}%</p>
          </Card>

          {results.indicators && results.indicators.length > 0 && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Detection Indicators</h3>
              <div className="space-y-2">
                {results.indicators.map((ind: any, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 p-3 rounded border border-gray-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-gray-300 font-medium">{ind.name}</span>
                      <span className={ind.detected ? 'text-green-400' : 'text-gray-400'}>
                        {ind.detected ? '✓ Detected' : '✗ Not detected'}
                      </span>
                    </div>
                    {ind.value && <p className="text-gray-400 text-sm">{ind.value}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.bypassMethods && results.bypassMethods.length > 0 && (
            <Card className="bg-gray-900 border-yellow-500/30 p-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Potential Bypass Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {results.bypassMethods.map((method: string, idx: number) => (
                  <div key={idx} className="bg-yellow-900/20 p-2 rounded text-yellow-300 text-sm">
                    {method}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {results.recommendations && results.recommendations.length > 0 && (
            <Card className="bg-gray-900 border-green-500/30 p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {results.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-gray-300 text-sm flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
