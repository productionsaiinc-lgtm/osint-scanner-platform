import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Smartphone, Loader2, AlertTriangle, CheckCircle2, Shield, AlertCircle, TrendingUp, Database, Zap } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function SimSwapLookup() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);

  const detectMutation = trpc.simSwap.detectSimSwap.useMutation();

  const handleScan = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      setIsScanning(true);
      setScanResults(null);

      const result = await detectMutation.mutateAsync({
        phoneNumber: phoneNumber.trim(),
      });

      if (result.success) {
        setScanResults(result.data);
        if (result.data.isSwapped) {
          toast.error("⚠️ CRITICAL: SIM swap detected!");
        } else {
          toast.success("Number appears to be safe");
        }
      }
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
        <h1 className="text-3xl font-bold neon-pink-glow">SIM SWAP DETECTION</h1>
        <p className="text-gray-400">Advanced detection to identify if a phone number has been SIM swapped</p>
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
              Analyzing...
            </>
          ) : (
            <>
              <Smartphone className="mr-2 h-4 w-4" />
              Detect SIM Swap
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
                {scanResults.isSwapped ? (
                  <AlertTriangle className="w-5 h-5 text-neon-pink animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-neon-green" />
                )}
                <h2 className={`text-xl font-bold ${scanResults.isSwapped ? "neon-pink-glow" : "neon-green-glow"}`}>
                  {scanResults.isSwapped ? "🚨 SIM SWAP DETECTED" : "✓ SAFE - NO SIM SWAP DETECTED"}
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
            <div className="text-xs text-gray-400">
              Confidence: {scanResults.confidence}% | Detection Method: {scanResults.detectionMethod}
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
                <div className="text-neon-cyan font-mono mt-1">{scanResults.carrierIndicators?.name || "Unknown"}</div>
              </div>
            </div>
          </Card>

          {/* Detection Methods */}
          <Card className="hud-frame p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-semibold text-neon-cyan">Detection Analysis</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Breach Database */}
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-neon-cyan" />
                  <div className="text-gray-400 text-xs font-semibold">Breach Database</div>
                </div>
                <div className="text-neon-cyan font-bold text-lg">
                  {scanResults.breachIndicators?.length || 0} hits
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {scanResults.breachIndicators?.length === 0
                    ? "No breaches found"
                    : "Potential exposure detected"}
                </div>
              </div>

              {/* Carrier Status */}
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-neon-cyan" />
                  <div className="text-gray-400 text-xs font-semibold">Protection</div>
                </div>
                <div className={`font-bold text-lg ${scanResults.simSwapProtectionEnabled ? "text-neon-green" : "text-neon-pink"}`}>
                  {scanResults.simSwapProtectionEnabled ? "Enabled" : "Disabled"}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {scanResults.protectionType || "Unknown"}
                </div>
              </div>

              {/* Pattern Analysis */}
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-neon-cyan" />
                  <div className="text-gray-400 text-xs font-semibold">Patterns</div>
                </div>
                <div className={`font-bold text-lg ${
                  (scanResults.patternIndicators?.suspiciousPatterns?.length || 0) > 0
                    ? "text-neon-pink"
                    : "text-neon-green"
                }`}>
                  {scanResults.patternIndicators?.suspiciousPatterns?.length || 0} detected
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Suspicious activity patterns
                </div>
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
                <div className="text-gray-400 text-xs">Protection Status</div>
                <div className={`font-bold mt-1 ${scanResults.simSwapProtectionEnabled ? "text-neon-green" : "text-neon-pink"}`}>
                  {scanResults.simSwapProtectionEnabled ? "✓ Enabled" : "✗ Disabled"}
                </div>
              </div>
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Protection Type</div>
                <div className="text-neon-cyan font-mono mt-1 text-sm">{scanResults.protectionType}</div>
              </div>
              <div className="bg-[#0a0e27] border border-neon-cyan/30 rounded p-3">
                <div className="text-gray-400 text-xs">Risk Level</div>
                <div className={`font-bold mt-1 uppercase text-sm ${
                  scanResults.riskLevel === "critical"
                    ? "text-neon-pink"
                    : scanResults.riskLevel === "high"
                      ? "text-neon-yellow"
                      : scanResults.riskLevel === "medium"
                        ? "text-neon-yellow"
                        : "text-neon-green"
                }`}>
                  {scanResults.riskLevel}
                </div>
              </div>
            </div>
          </Card>

          {/* Suspicious Activities */}
          {scanResults.suspiciousActivities?.length > 0 && (
            <Card className="hud-frame p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-neon-pink" />
                <h3 className="font-semibold text-neon-pink">Suspicious Activities Detected</h3>
              </div>
              <div className="space-y-2">
                {scanResults.suspiciousActivities.map((activity: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#0a0e27] border border-neon-pink/30 rounded p-3">
                    <AlertTriangle className="w-4 h-4 text-neon-pink mt-0.5 flex-shrink-0" />
                    <div className="text-gray-300 text-sm">{activity}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Breach Details */}
          {scanResults.breachIndicators?.length > 0 && (
            <Card className="hud-frame p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-neon-yellow" />
                <h3 className="font-semibold text-neon-yellow">Breach Database Findings</h3>
              </div>
              <div className="space-y-2">
                {scanResults.breachIndicators.map((breach: any, idx: number) => (
                  <div key={idx} className="bg-[#0a0e27] border border-neon-yellow/30 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-neon-yellow font-semibold text-sm">{breach.source}</div>
                        <div className="text-gray-400 text-xs mt-1">Type: {breach.type}</div>
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded ${
                        breach.severity === "critical"
                          ? "bg-neon-pink/20 text-neon-pink"
                          : breach.severity === "high"
                            ? "bg-neon-yellow/20 text-neon-yellow"
                            : "bg-neon-cyan/20 text-neon-cyan"
                      }`}>
                        {breach.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pattern Details */}
          {scanResults.patternIndicators?.suspiciousPatterns?.length > 0 && (
            <Card className="hud-frame p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-yellow" />
                <h3 className="font-semibold text-neon-yellow">Pattern Analysis Details</h3>
              </div>
              <div className="space-y-2">
                {scanResults.patternIndicators.suspiciousPatterns.map((pattern: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#0a0e27] border border-neon-yellow/30 rounded p-3">
                    <div className="text-neon-yellow mt-0.5">•</div>
                    <div className="text-gray-300 text-sm">{pattern}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="hud-frame p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-green" />
              <h3 className="font-semibold text-neon-green">Security Recommendations</h3>
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
        </div>
      )}

      {/* No Results State */}
      {!scanResults && !isScanning && (
        <Card className="hud-frame p-12 text-center space-y-4">
          <Smartphone className="w-12 h-12 mx-auto text-neon-pink/50" />
          <p className="text-gray-400">
            Enter a phone number to check if it has been SIM swapped using advanced detection methods
          </p>
          <p className="text-gray-500 text-sm">
            Our system analyzes breach databases, carrier status, and suspicious patterns to detect SIM swap attacks
          </p>
        </Card>
      )}
    </div>
  );
}
