import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Network, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function NetworkScanner() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);

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
        toast.success("Network scan completed successfully!");
      } else {
        toast.error(result.error || "Scan failed");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to execute network scan");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-cyan-glow">NETWORK SCANNER</h1>
        <p className="text-gray-400">Port scanning, ping, traceroute, and IP geolocation</p>
      </div>

      {/* Input Section */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium neon-pink">Target IP or Hostname</label>
          <Input
            placeholder="e.g., 8.8.8.8 or example.com"
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              SCANNING...
            </>
          ) : (
            <>
              <Network className="mr-2 h-4 w-4" />
              START SCAN
            </>
          )}
        </Button>
      </Card>

      {/* Results Section */}
      {scanResults && (
        <div className="space-y-4">
          {/* Geolocation Results */}
          {scanResults.geolocation?.success && (
            <Card className="hud-frame p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#39ff14]" />
                <h2 className="text-lg font-bold neon-green">GEOLOCATION</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#00f5ff]/20 rounded p-4 font-mono text-sm text-[#00f5ff]">
                <div className="space-y-2">
                  <div>
                    <span className="text-[#ff006e]">IP:</span> {scanResults.geolocation.ip}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Country:</span> {scanResults.geolocation.country}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">City:</span> {scanResults.geolocation.city}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Region:</span> {scanResults.geolocation.region}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Latitude:</span> {scanResults.geolocation.latitude}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Longitude:</span> {scanResults.geolocation.longitude}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">ISP:</span> {scanResults.geolocation.isp}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Organization:</span> {scanResults.geolocation.organization}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Port Scan Results */}
          {scanResults.ports?.success && (
            <Card className="hud-frame p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#39ff14]" />
                <h2 className="text-lg font-bold neon-green">PORT SCAN</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#ff006e]/20 rounded p-4 font-mono text-sm">
                <div className="mb-3">
                  <span className="text-[#00f5ff]">Open Ports:</span>{" "}
                  <span className="text-[#39ff14]">{scanResults.ports.openPorts.join(", ") || "None"}</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {scanResults.ports.ports.map((port: any) => (
                    <div key={port.port} className={port.status === "open" ? "text-[#39ff14]" : "text-gray-500"}>
                      <span className="text-[#ff006e]">Port {port.port}:</span> {port.status.toUpperCase()} ({port.service})
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Ping Results */}
          {scanResults.ping?.success && (
            <Card className="hud-frame p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#39ff14]" />
                <h2 className="text-lg font-bold neon-green">PING</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#b537f2]/20 rounded p-4 font-mono text-sm text-[#b537f2]">
                <div className="space-y-2">
                  <div>
                    <span className="text-[#ff006e]">Host:</span> {scanResults.ping.host}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Packets Sent:</span> {scanResults.ping.packets.sent}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Packets Received:</span> {scanResults.ping.packets.received}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Min/Avg/Max:</span> {scanResults.ping.min}/{scanResults.ping.avg}/{scanResults.ping.max} ms
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Traceroute Results */}
          {scanResults.traceroute?.success && (
            <Card className="hud-frame p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#39ff14]" />
                <h2 className="text-lg font-bold neon-green">TRACEROUTE</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#00f5ff]/20 rounded p-4 font-mono text-sm text-[#00f5ff]">
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {scanResults.traceroute.hops.map((hop: any) => (
                    <div key={hop.hop}>
                      <span className="text-[#ff006e]">Hop {hop.hop}:</span> {hop.ip} ({hop.hostname}) - {hop.time}ms
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Error Messages */}
          {(scanResults.geolocation?.error || scanResults.ports?.error || scanResults.ping?.error) && (
            <Card className="hud-frame p-6 space-y-3 border-[#ff006e]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#ff006e]" />
                <h2 className="text-lg font-bold neon-pink">ERRORS</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#ff006e]/20 rounded p-4 font-mono text-sm text-[#ff006e]">
                {scanResults.geolocation?.error && <div>Geolocation: {scanResults.geolocation.error}</div>}
                {scanResults.ports?.error && <div>Port Scan: {scanResults.ports.error}</div>}
                {scanResults.ping?.error && <div>Ping: {scanResults.ping.error}</div>}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!scanResults && !isScanning && (
        <Card className="hud-frame p-12 text-center">
          <Network className="h-16 w-16 mx-auto mb-4 text-[#00f5ff]/50" />
          <p className="text-gray-400">Enter a target IP address or hostname to begin scanning</p>
        </Card>
      )}
    </div>
  );
}
