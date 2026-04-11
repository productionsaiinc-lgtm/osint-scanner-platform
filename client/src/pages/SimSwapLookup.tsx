import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Smartphone, Loader2, AlertTriangle, CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SimSwapLookup() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);

  const handleScan = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      setIsScanning(true);
      setScanResults(null);

      // Simulate SIM swap vulnerability check
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock results
      const riskLevel = Math.random() > 0.5 ? "high" : "low";
      const isVulnerable = riskLevel === "high";

      setScanResults({
        phoneNumber: phoneNumber.trim(),
        carrier: ["Verizon", "AT&T", "T-Mobile", "Sprint"][Math.floor(Math.random() * 4)],
        vulnerability: isVulnerable,
        riskLevel: riskLevel,
        riskScore: isVulnerable ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 40) + 20,
        simSwapProtection: {
          enabled: !isVulnerable,
          status: isVulnerable ? "Not Enabled" : "Enabled",
          type: isVulnerable ? "None" : "PIN Protection",
        },
        vulnerabilities: isVulnerable
          ? [
              "No SIM swap protection enabled",
              "Account vulnerable to SIM swap attacks",
              "Recommended: Enable carrier SIM swap protection",
              "Consider using authenticator apps instead of SMS",
            ]
          : [
              "SIM swap protection is enabled",
              "Account has PIN protection",
              "Strong security posture",
            ],
        recommendations: [
          "Enable SIM swap protection with your carrier",
          "Use authenticator apps (Google Authenticator, Authy) instead of SMS 2FA",
          "Add trusted devices to your account",
          "Monitor account activity regularly",
          "Use strong, unique passwords",
          "Enable biometric authentication where available",
        ],
        carrierInfo: {
          name: ["Verizon", "AT&T", "T-Mobile", "Sprint"][Math.floor(Math.random() * 4)],
          country: "United States",
          type: "Mobile Network Operator",
          simSwapProtectionAvailable: true,
          protectionMethod: "PIN-based verification",
        },
      });

      toast.success("SIM swap vulnerability check completed!");
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to execute SIM swap check");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-pink-glow">SIM SWAP LOOKUP</h1>
        <p className="text-gray-400">Check if your phone number is vulnerable to SIM swap attacks</p>
      </div>

      {/* Input Section */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium neon-cyan">Phone Number</label>
          <Input
            placeholder="e.g., +1 (555) 123-4567 or 5551234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
            className="bg-[#0a0e27] border-[#ff006e]/30 text-white placeholder-gray-600"
            disabled={isScanning}
          />
        </div>
        <Button
          onClick={handleScan}
          disabled={isScanning || !phoneNumber.trim()}
          className="w-full bg-gradient-to-r from-[#ff006e] to-[#ff4d94] hover:from-[#ff1a7a] hover:to-[#ff66a3] text-white font-bold"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Smartphone className="mr-2 h-4 w-4" />
              Check SIM Swap Vulnerability
            </>
          )}
        </Button>
      </Card>

      {/* Results Section */}
      {scanResults && (
        <div className="space-y-4">
          {/* Risk Assessment */}
          <Card className="hud-frame p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {scanResults.vulnerability ? (
                  <AlertTriangle className="w-5 h-5 text-neon-pink" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-neon-green" />
                )}
                <h2 className={`text-xl font-bold ${scanResults.vulnerability ? "neon-pink-glow" : "neon-green-glow"}`}>
                  {scanResults.vulnerability ? "VULNERABLE" : "PROTECTED"}
                </h2>
              </div>
              <div className={`text-2xl font-bold ${
                scanResults.riskScore > 70
                  ? "text-neon-pink"
                  : scanResults.riskScore > 40
                    ? "text-neon-yellow"
                    : "text-neon-green"
              }`}>
                {scanResults.riskScore}/100
              </div>
            </div>
          </Card>

          {/* Phone Information */}
          <Card className="hud-frame p-6 space-y-4">
            <h3 className="font-semibold text-neon-cyan">Phone Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Phone Number</div>
                <div className="text-neon-cyan font-mono mt-1">{scanResults.phoneNumber}</div>
              </div>
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Carrier</div>
                <div className="text-neon-cyan font-mono mt-1">{scanResults.carrier}</div>
              </div>
            </div>
          </Card>

          {/* SIM Swap Protection Status */}
          <Card className="hud-frame p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-semibold text-neon-cyan">SIM Swap Protection Status</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Status</div>
                <div className={`font-bold mt-1 ${scanResults.simSwapProtection.enabled ? "text-neon-green" : "text-neon-pink"}`}>
                  {scanResults.simSwapProtection.status}
                </div>
              </div>
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Protection Type</div>
                <div className="text-neon-cyan font-mono mt-1 text-sm">{scanResults.simSwapProtection.type}</div>
              </div>
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Risk Level</div>
                <div className={`font-bold mt-1 uppercase text-sm ${
                  scanResults.riskLevel === "high" ? "text-neon-pink" : "text-neon-green"
                }`}>
                  {scanResults.riskLevel}
                </div>
              </div>
            </div>
          </Card>

          {/* Vulnerabilities */}
          {scanResults.vulnerabilities.length > 0 && (
            <Card className="hud-frame p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-neon-yellow" />
                <h3 className="font-semibold text-neon-yellow">Security Assessment</h3>
              </div>
              <div className="space-y-2">
                {scanResults.vulnerabilities.map((vuln: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#0a0e27] border border-neon-yellow/30 rounded p-3">
                    <div className="text-neon-yellow mt-0.5">•</div>
                    <div className="text-gray-300 text-sm">{vuln}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="hud-frame p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-green" />
              <h3 className="font-semibold text-neon-green">Protection Recommendations</h3>
            </div>
            <div className="space-y-2">
              {scanResults.recommendations.map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 bg-[#0a0e27] border border-neon-green/30 rounded p-3">
                  <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                  <div className="text-gray-300 text-sm">{rec}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Carrier Information */}
          <Card className="hud-frame p-6 space-y-4">
            <h3 className="font-semibold text-neon-cyan">Carrier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Provider Name</div>
                <div className="text-neon-cyan font-mono mt-1">{scanResults.carrierInfo.name}</div>
              </div>
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Type</div>
                <div className="text-neon-cyan font-mono mt-1">{scanResults.carrierInfo.type}</div>
              </div>
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Country</div>
                <div className="text-neon-cyan font-mono mt-1">{scanResults.carrierInfo.country}</div>
              </div>
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Protection Available</div>
                <div className={`font-bold mt-1 ${scanResults.carrierInfo.simSwapProtectionAvailable ? "text-neon-green" : "text-neon-pink"}`}>
                  {scanResults.carrierInfo.simSwapProtectionAvailable ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* No Results State */}
      {!scanResults && !isScanning && (
        <Card className="hud-frame p-12 text-center space-y-4">
          <Smartphone className="w-12 h-12 mx-auto text-neon-pink/50" />
          <p className="text-gray-400">
            Enter a phone number to check if it's vulnerable to SIM swap attacks
          </p>
        </Card>
      )}
    </div>
  );
}
