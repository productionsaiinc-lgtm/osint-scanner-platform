import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Network, Loader2, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function NetworkScanner() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("network");

  const createScanMutation = trpc.scans.create.useMutation();
  const executeNetworkScanMutation = trpc.scans.executeNetworkScan.useMutation();

  const handleScan = async () => {
    if (!target.trim()) {
      toast.error("Please enter a target IP or hostname");
      return;
    }

    try {
      setIsScanning(true);
      setScanResults(null);

      // Create scan record
      const scan = await createScanMutation.mutateAsync({
        scanType: "network",
        target: target.trim(),
      });

      // Execute the scan
      const result = await executeNetworkScanMutation.mutateAsync({
        target: target.trim(),
        scanId: scan.id,
      });

      if (result.success) {
        setScanResults(result.results);
        toast.success(`${activeTab === "network" ? "Network" : "IP Reputation"} check completed successfully!`);
      } else {
        toast.error(result.error || "Scan failed");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error(`Failed to execute ${activeTab === "network" ? "network" : "IP reputation"} scan`);
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 75) return "text-red-400 border-red-500/30";
    if (riskScore >= 50) return "text-orange-400 border-orange-500/30";
    if (riskScore >= 25) return "text-yellow-400 border-yellow-500/30";
    return "text-green-400 border-green-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-cyan-glow">NETWORK & IP INTELLIGENCE</h1>
        <p className="text-gray-400">Combined network scanning and IP reputation analysis</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-cyan-500/30">
        <button
          onClick={() => setActiveTab("network")}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === "network"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <Network className="w-4 h-4 inline mr-2" />
          Network Scanner
        </button>
        <button
          onClick={() => setActiveTab("reputation")}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === "reputation"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />
          IP Reputation
        </button>
      </div>

      {/* Input Section */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium neon-pink">
            {activeTab === "network" ? "Target IP or Hostname" : "IP Address"}
          </label>
          <Input
            placeholder={activeTab === "network" ? "e.g., 8.8.8.8 or example.com" : "e.g., 8.8.8.8"}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
            className="bg-[#0a0e27] border-[#ff006e]/30 text-white placeholder-gray-600"
            disabled={isScanning}
          />
        </div>
        <Button
          onClick={handleScan}
          disabled={isScanning || !target.trim()}
          className="w-full bg-gradient-to-r from-[#ff006e] to-[#b537f2] hover:from-[#ff1493] hover:to-[#d946ef] text-white font-bold"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {activeTab === "network" ? "SCANNING..." : "CHECKING..."}
            </>
          ) : (
            <>
              {activeTab === "network" ? "SCAN NETWORK" : "CHECK REPUTATION"}
            </>
          )}
        </Button>
      </Card>

      {/* Results */}
      {scanResults && (
        <Card className="hud-frame p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-bold neon-green">
              {activeTab === "network" ? "NETWORK SCAN RESULTS" : "IP REPUTATION ANALYSIS"}
            </h2>
          </div>

          {activeTab === "network" ? (
            <>
              {/* Network Scanner Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30">
                  <p className="text-xs text-gray-400 uppercase">Target</p>
                  <p className="text-lg font-bold neon-cyan">{scanResults.target}</p>
                </div>
                <div className="bg-[#0a0e27] p-4 rounded border border-pink-500/30">
                  <p className="text-xs text-gray-400 uppercase">Ports Open</p>
                  <p className="text-lg font-bold neon-pink">{scanResults.openPorts || 0}</p>
                </div>
                <div className="bg-[#0a0e27] p-4 rounded border border-yellow-500/30">
                  <p className="text-xs text-gray-400 uppercase">Services</p>
                  <p className="text-lg font-bold text-yellow-400">{scanResults.services || 0}</p>
                </div>
                <div className="bg-[#0a0e27] p-4 rounded border border-purple-500/30">
                  <p className="text-xs text-gray-400 uppercase">Latency</p>
                  <p className="text-lg font-bold text-purple-400">{scanResults.latency || "N/A"}</p>
                </div>
              </div>

              {scanResults.ports && scanResults.ports.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold neon-cyan">OPEN PORTS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {scanResults.ports.map((port: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#0a0e27] p-3 rounded border border-cyan-500/30 text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-cyan-400">Port {port.port}</span>
                          <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded">
                            {port.state}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{port.service || "Unknown"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* IP Reputation Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30">
                  <p className="text-xs text-gray-400 uppercase">IP Address</p>
                  <p className="text-lg font-bold neon-cyan">{scanResults.ip}</p>
                </div>
                <div className={`bg-[#0a0e27] p-4 rounded border ${getRiskColor(scanResults.riskScore || 0)}`}>
                  <p className="text-xs text-gray-400 uppercase">Risk Score</p>
                  <p className="text-lg font-bold">{scanResults.riskScore || 0}/100</p>
                </div>
                <div className="bg-[#0a0e27] p-4 rounded border border-purple-500/30">
                  <p className="text-xs text-gray-400 uppercase">Country</p>
                  <p className="text-lg font-bold text-purple-400">{scanResults.country || "Unknown"}</p>
                </div>
                <div className="bg-[#0a0e27] p-4 rounded border border-green-500/30">
                  <p className="text-xs text-gray-400 uppercase">ISP</p>
                  <p className="text-lg font-bold text-green-400">{scanResults.isp || "Unknown"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold neon-cyan">REPUTATION DETAILS</h3>
                <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30 space-y-2 text-sm">
                  {scanResults.blacklisted && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">Blacklisted: Yes</span>
                    </div>
                  )}
                  {scanResults.threats && (
                    <div>
                      <p className="text-gray-400">Threats Detected:</p>
                      <p className="text-yellow-400 ml-4">{scanResults.threats.join(", ")}</p>
                    </div>
                  )}
                  {scanResults.abuseReports && (
                    <div>
                      <p className="text-gray-400">Abuse Reports: <span className="text-orange-400">{scanResults.abuseReports}</span></p>
                    </div>
                  )}
                  {scanResults.lastSeen && (
                    <div>
                      <p className="text-gray-400">Last Seen: <span className="text-green-400">{scanResults.lastSeen}</span></p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="text-xs text-gray-500 text-right">
            Scanned at: {new Date().toLocaleString()}
          </div>
        </Card>
      )}
    </div>
  );
}
