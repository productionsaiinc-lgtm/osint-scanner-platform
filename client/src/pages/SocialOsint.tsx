import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SocialOsint() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);

  const createScanMutation = trpc.scans.create.useMutation();
  const executeSocialScanMutation = trpc.scans.executeSocialScan.useMutation();

  const handleScan = async () => {
    if (!target.trim()) {
      toast.error("Please enter a username");
      return;
    }

    try {
      setIsScanning(true);
      setScanResults(null);

      // Create scan record
      const scan = await createScanMutation.mutateAsync({
        scanType: "social",
        target: target.trim(),
      });

      // Execute the scan
      const result = await executeSocialScanMutation.mutateAsync({
        target: target.trim(),
        scanId: scan.id,
      });

      if (result.success) {
        setScanResults(result.results);
        toast.success("Social media scan completed successfully!");
      } else {
        toast.error(result.error || "Scan failed");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to execute social media scan");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-cyan-glow">SOCIAL MEDIA OSINT</h1>
        <p className="text-gray-400">Username search and profile intelligence gathering</p>
      </div>

      {/* Input Section */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium neon-pink">Username</label>
          <Input
            placeholder="e.g., john_doe"
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
          className="w-full bg-gradient-to-r from-[#b537f2] to-[#ff006e] hover:from-[#d946ef] hover:to-[#ff1493] text-white font-bold"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              SCANNING...
            </>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              START SCAN
            </>
          )}
        </Button>
      </Card>

      {/* Results Section */}
      {scanResults && (
        <div className="space-y-4">
          {/* Found Profiles */}
          {scanResults.results && scanResults.results.length > 0 && (
            <div className="space-y-3">
              <Card className="hud-frame p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-[#39ff14]" />
                  <h2 className="text-lg font-bold neon-green">FOUND PROFILES ({scanResults.results.length})</h2>
                </div>
              </Card>

              {scanResults.results.map((profile: any) => (
                <Card key={profile.platform} className="hud-frame p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0a0e27] border border-[#ff006e]/30 rounded flex items-center justify-center">
                        <Users className="h-6 w-6 text-[#ff006e]" />
                      </div>
                      <div>
                        <h3 className="font-bold neon-pink uppercase">{profile.platform}</h3>
                        <p className="text-sm text-gray-400">{profile.displayName}</p>
                      </div>
                    </div>
                    <a
                      href={profile.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-[#ff006e]/20 rounded transition"
                    >
                      <ExternalLink className="h-5 w-5 text-[#00f5ff]" />
                    </a>
                  </div>

                  <div className="bg-[#0a0e27]/50 border border-[#00f5ff]/20 rounded p-4 font-mono text-sm space-y-2">
                    <div>
                      <span className="text-[#ff006e]">Username:</span> <span className="text-[#00f5ff]">{profile.username}</span>
                    </div>
                    <div>
                      <span className="text-[#ff006e]">Followers:</span> <span className="text-[#39ff14]">{profile.followers.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[#ff006e]">Following:</span> <span className="text-[#39ff14]">{profile.following.toLocaleString()}</span>
                    </div>
                    {profile.bio && (
                      <div>
                        <span className="text-[#ff006e]">Bio:</span> <span className="text-gray-300">{profile.bio}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {(!scanResults.results || scanResults.results.length === 0) && (
            <Card className="hud-frame p-6 space-y-3 border-[#ff006e]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#ff006e]" />
                <h2 className="text-lg font-bold neon-pink">NO PROFILES FOUND</h2>
              </div>
              <p className="text-gray-400">The username was not found on any monitored platforms.</p>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!scanResults && !isScanning && (
        <Card className="hud-frame p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-[#00f5ff]/50" />
          <p className="text-gray-400">Enter a username to search across social media platforms</p>
        </Card>
      )}

      {/* Info Panel */}
      <Card className="hud-frame p-6">
        <h3 className="text-sm font-bold neon-green uppercase mb-3">Supported Platforms</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          This tool searches for the provided username across major social media platforms including Twitter, GitHub, 
          LinkedIn, Instagram, Facebook, Reddit, and TikTok. Results include profile URLs, follower counts, and basic 
          profile information available through public APIs.
        </p>
      </Card>
    </div>
  );
}
