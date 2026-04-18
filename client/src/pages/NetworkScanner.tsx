import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Network, Loader2, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import ScanProgressBar from "@/components/ScanProgressBar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function NetworkScanner() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("network");

  const createScanMutation = trpc.scans.create.useMutation();
  const executeNetworkScanMutation = trpc.scans.executeNetworkScan.useMutation();
  const executeDomainScanMutation = trpc.scans.executeDomainScan.useMutation();

  const networkScanSteps = [
    { label: "Initializing scan engine", duration: 600 },
    { label: "Resolving hostname / IP", duration: 800 },
    { label: "Probing open ports", duration: 2500 },
    { label: "Running ping & traceroute", duration: 1200 },
    { label: "Fetching IP geolocation", duration: 900 },
    { label: "Calculating risk score", duration: 600 },
  ];

  const domainScanSteps = [
    { label: "Initializing scan engine", duration: 500 },
    { label: "Querying WHOIS database", duration: 1200 },
    { label: "Fetching DNS records", duration: 1000 },
    { label: "Enumerating subdomains", duration: 2000 },
    { label: "Analyzing SSL certificate", duration: 800 },
    { label: "Compiling results", duration: 500 },
  ];

  const handleScan = async () => {
    if (!target.trim()) {
      toast.error(`Please enter a ${activeTab === "network" ? "target IP or hostname" : "domain name"}`);
      return;
    }

    try {
      setIsScanning(true);
      setScanResults(null);

      if (activeTab === "network") {
        // Network scan
        const scan = await createScanMutation.mutateAsync({
          scanType: "network",
          target: target.trim(),
        });

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
      } else {
        // Domain scan
        const scan = await createScanMutation.mutateAsync({
          scanType: "domain",
          target: target.trim(),
        });

        const result = await executeDomainScanMutation.mutateAsync({
          target: target.trim(),
          scanId: scan.id,
        });

        if (result.success) {
          setScanResults(result.results);
          toast.success("Domain scan completed successfully!");
        } else {
          toast.error(result.error || "Scan failed");
        }
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error(`Failed to execute ${activeTab === "network" ? "network" : "domain"} scan`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-cyan-glow">NETWORK & DOMAIN SCANNER</h1>
        <p className="text-gray-400">Port scanning, IP reputation, WHOIS, DNS records, and SSL certificates</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-neon-cyan/30">
        <button
          onClick={() => {
            setActiveTab("network");
            setScanResults(null);
          }}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === "network"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-neon-cyan"
          }`}
        >
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Network Scanner
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab("domain");
            setScanResults(null);
          }}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === "domain"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-neon-cyan"
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Domain OSINT
          </div>
        </button>
      </div>

      {/* Input Section */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium neon-pink">
            {activeTab === "network" ? "Target IP or Hostname" : "Target Domain"}
          </label>
          <Input
            placeholder={activeTab === "network" ? "e.g., 192.168.1.1 or example.com" : "e.g., example.com"}
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
          className="w-full bg-gradient-to-r from-[#00f5ff] to-[#39ff14] hover:from-[#00d9ff] hover:to-[#4dff1a] text-black font-bold"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Network className="mr-2 h-4 w-4" />
              {activeTab === "network" ? "Scan Network" : "Scan Domain"}
            </>
          )}
        </Button>
      </Card>

      {/* Progress Bar */}
      <ScanProgressBar
        isScanning={isScanning}
        steps={activeTab === "network" ? networkScanSteps : domainScanSteps}
      />

      {/* Results Section */}
      {scanResults && (
        <Card className="hud-frame p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-neon-green" />
            <h2 className="text-xl font-bold neon-green-glow">
              {activeTab === "network" ? "Network Scan Results" : "Domain Information"}
            </h2>
          </div>

          {activeTab === "network" ? (
            // Network scan results
            <div className="space-y-4">
              {scanResults.ports && scanResults.ports.ports && Array.isArray(scanResults.ports.ports) && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-neon-cyan">Open Ports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {scanResults.ports.ports.map((port: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3 text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-neon-cyan">Port {port.port}</span>
                          <span className="text-neon-green text-xs">OPEN</span>
                        </div>
                        <div className="text-gray-400 text-xs mt-1">{port.service || "Unknown"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scanResults.ping && scanResults.ping.success && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-neon-cyan">Ping Information</h3>
                  <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3 text-sm space-y-1">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="ml-2 text-neon-green">REACHABLE</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Response Time:</span>
                      <span className="ml-2 text-neon-cyan">{scanResults.ping.responseTime}ms</span>
                    </div>
                  </div>
                </div>
              )}

              {scanResults.riskScore !== undefined && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-neon-cyan">Risk Assessment</h3>
                  <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Risk Score</span>
                      <span
                        className={`font-bold text-lg ${
                          scanResults.riskScore > 70
                            ? "text-neon-pink"
                            : scanResults.riskScore > 40
                              ? "text-neon-yellow"
                              : "text-neon-green"
                        }`}
                      >
                        {scanResults.riskScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Domain scan results
            <div className="space-y-4">
              {scanResults.whois && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-neon-cyan">WHOIS Information</h3>
                  <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3 text-sm space-y-1">
                    <div>
                      <span className="text-gray-400">Registrar:</span>
                      <span className="ml-2 text-neon-cyan">{scanResults.whois.registrar}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <span className="ml-2 text-neon-cyan">{scanResults.whois.created}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Expires:</span>
                      <span className="ml-2 text-neon-cyan">{scanResults.whois.expires}</span>
                    </div>
                  </div>
                </div>
              )}

              {scanResults.dns && Array.isArray(scanResults.dns.records) && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-neon-cyan">DNS Records</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {scanResults.dns.records.map((record: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3 text-sm"
                      >
                        <div className="font-mono text-neon-cyan">{record.type}</div>
                        <div className="text-gray-400 text-xs mt-1 break-all">{record.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scanResults.subdomains && Array.isArray(scanResults.subdomains.subdomains) && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-neon-cyan">Subdomains Found</h3>
                  <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                    <div className="flex flex-wrap gap-2">
                      {scanResults.subdomains.subdomains.map((sub: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded text-xs text-neon-cyan font-mono"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {scanResults.ssl && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-neon-cyan">SSL Certificate</h3>
                  <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3 text-sm space-y-1">
                    <div>
                      <span className="text-gray-400">Issuer:</span>
                      <span className="ml-2 text-neon-cyan">{scanResults.ssl.issuer}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Valid Until:</span>
                      <span className="ml-2 text-neon-cyan">{scanResults.ssl.validUntil}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* No Results State */}
      {!scanResults && !isScanning && (
        <Card className="hud-frame p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-neon-cyan/50" />
          <p className="text-gray-400">
            {activeTab === "network"
              ? "Enter an IP address or hostname to begin network scanning"
              : "Enter a domain name to retrieve WHOIS, DNS, and SSL information"}
          </p>
        </Card>
      )}
    </div>
  );
}
