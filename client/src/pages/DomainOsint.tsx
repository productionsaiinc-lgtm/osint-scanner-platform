import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DomainOsint() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);

  const createScanMutation = trpc.scans.create.useMutation();
  const executeDomainScanMutation = trpc.scans.executeDomainScan.useMutation();

  const handleScan = async () => {
    if (!target.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    try {
      setIsScanning(true);
      setScanResults(null);

      // Create scan record
      const scan = await createScanMutation.mutateAsync({
        scanType: "domain",
        target: target.trim(),
      });

      // Execute the scan
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
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to execute domain scan");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-cyan-glow">DOMAIN OSINT</h1>
        <p className="text-gray-400">WHOIS, DNS records, subdomains, and SSL certificates</p>
      </div>

      {/* Input Section */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium neon-pink">Target Domain</label>
          <Input
            placeholder="e.g., example.com"
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
              SCANNING...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              START SCAN
            </>
          )}
        </Button>
      </Card>

      {/* Results Section */}
      {scanResults && (
        <div className="space-y-4">
          {/* WHOIS Results */}
          {scanResults.whois?.success && (
            <Card className="hud-frame p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#39ff14]" />
                <h2 className="text-lg font-bold neon-green">WHOIS</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#ff006e]/20 rounded p-4 font-mono text-sm text-[#ff006e]">
                <div className="space-y-2">
                  <div>
                    <span className="text-[#00f5ff]">Domain:</span> {scanResults.whois.domain}
                  </div>
                  <div>
                    <span className="text-[#00f5ff]">Registrar:</span> {scanResults.whois.registrar}
                  </div>
                  <div>
                    <span className="text-[#00f5ff]">Registration Date:</span> {scanResults.whois.registrationDate}
                  </div>
                  <div>
                    <span className="text-[#00f5ff]">Expiration Date:</span> {scanResults.whois.expirationDate}
                  </div>
                  <div>
                    <span className="text-[#00f5ff]">Registrant:</span> {scanResults.whois.registrant?.name}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* DNS Records */}
          {scanResults.dns?.success && (
            <Card className="hud-frame p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#39ff14]" />
                <h2 className="text-lg font-bold neon-green">DNS RECORDS</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#00f5ff]/20 rounded p-4 font-mono text-sm text-[#00f5ff]">
                <div className="space-y-3">
                  {scanResults.dns.records?.A && (
                    <div>
                      <span className="text-[#ff006e]">A Records:</span>
                      <div className="ml-4 text-[#39ff14]">{scanResults.dns.records.A.join(", ")}</div>
                    </div>
                  )}
                  {scanResults.dns.records?.MX && (
                    <div>
                      <span className="text-[#ff006e]">MX Records:</span>
                      <div className="ml-4 text-[#39ff14]">
                        {scanResults.dns.records.MX.map((mx: any) => `${mx.priority} ${mx.exchange}`).join(", ")}
                      </div>
                    </div>
                  )}
                  {scanResults.dns.records?.NS && (
                    <div>
                      <span className="text-[#ff006e]">NS Records:</span>
                      <div className="ml-4 text-[#39ff14]">{scanResults.dns.records.NS.join(", ")}</div>
                    </div>
                  )}
                  {scanResults.dns.records?.TXT && (
                    <div>
                      <span className="text-[#ff006e]">TXT Records:</span>
                      <div className="ml-4 text-[#39ff14]">{scanResults.dns.records.TXT.join(", ")}</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Subdomains */}
          {scanResults.subdomains?.success && (
            <Card className="hud-frame p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#39ff14]" />
                <h2 className="text-lg font-bold neon-green">SUBDOMAINS ({scanResults.subdomains.count})</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#b537f2]/20 rounded p-4 font-mono text-sm text-[#b537f2]">
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {scanResults.subdomains.subdomains.map((sub: any) => (
                    <div key={sub.subdomain}>
                      <span className="text-[#ff006e]">{sub.subdomain}</span> → {sub.ip}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* SSL Certificate */}
          {scanResults.ssl?.success && (
            <Card className="hud-frame p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#39ff14]" />
                <h2 className="text-lg font-bold neon-green">SSL CERTIFICATE</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#00f5ff]/20 rounded p-4 font-mono text-sm text-[#00f5ff]">
                <div className="space-y-2">
                  <div>
                    <span className="text-[#ff006e]">Subject:</span> {scanResults.ssl.certificate?.subject}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Issuer:</span> {scanResults.ssl.certificate?.issuer}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Issue Date:</span> {new Date(scanResults.ssl.certificate?.issueDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Expiry Date:</span> {new Date(scanResults.ssl.certificate?.expiryDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Key Size:</span> {scanResults.ssl.certificate?.keySize} bits
                  </div>
                  <div>
                    <span className="text-[#ff006e]">Algorithm:</span> {scanResults.ssl.certificate?.signatureAlgorithm}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Error Messages */}
          {(scanResults.whois?.error || scanResults.dns?.error || scanResults.subdomains?.error) && (
            <Card className="hud-frame p-6 space-y-3 border-[#ff006e]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#ff006e]" />
                <h2 className="text-lg font-bold neon-pink">ERRORS</h2>
              </div>
              <div className="bg-[#0a0e27]/50 border border-[#ff006e]/20 rounded p-4 font-mono text-sm text-[#ff006e]">
                {scanResults.whois?.error && <div>WHOIS: {scanResults.whois.error}</div>}
                {scanResults.dns?.error && <div>DNS: {scanResults.dns.error}</div>}
                {scanResults.subdomains?.error && <div>Subdomains: {scanResults.subdomains.error}</div>}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!scanResults && !isScanning && (
        <Card className="hud-frame p-12 text-center">
          <Globe className="h-16 w-16 mx-auto mb-4 text-[#00f5ff]/50" />
          <p className="text-gray-400">Enter a domain name to begin reconnaissance</p>
        </Card>
      )}
    </div>
  );
}
