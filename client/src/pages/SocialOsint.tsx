import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Loader2, CheckCircle2, AlertCircle, ExternalLink, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SocialOsint() {
  const [target, setTarget] = useState("");
  const [platform, setPlatform] = useState("all");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("search");

  const createScanMutation = trpc.scans.create.useMutation();
  const executeSocialScanMutation = trpc.scans.executeSocialScan.useMutation();

  const platforms = ["All Platforms", "Twitter", "Instagram", "TikTok", "LinkedIn", "Reddit", "YouTube"];

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
        <h1 className="text-3xl font-bold neon-cyan-glow">SOCIAL MEDIA INTELLIGENCE</h1>
        <p className="text-gray-400">Combined username search and profile scraping across all platforms</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-cyan-500/30">
        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === "search"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Profile Search
        </button>
        <button
          onClick={() => setActiveTab("scraper")}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === "scraper"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Multi-Platform Scraper
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === "search" && (
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                SCANNING...
              </>
            ) : (
              "SCAN PROFILES"
            )}
          </Button>
        </Card>
      )}

      {/* Scraper Tab */}
      {activeTab === "scraper" && (
        <Card className="hud-frame p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium neon-cyan">Username</label>
            <Input
              placeholder="Enter username to search"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="bg-[#0a0e27] border-[#00d9ff]/30 text-white placeholder-gray-600"
              disabled={isScanning}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium neon-green">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-[#0a0e27] border border-[#00ff00]/30 text-white p-2 rounded"
              disabled={isScanning}
            >
              {platforms.map((p) => (
                <option key={p} value={p.toLowerCase()}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleScan}
            disabled={isScanning || !target.trim()}
            className="w-full bg-gradient-to-r from-[#00ff00] to-[#00d9ff] hover:from-[#00cc00] hover:to-[#00b8cc] text-black font-bold"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                SCRAPING...
              </>
            ) : (
              "SCRAPE PROFILES"
            )}
          </Button>
        </Card>
      )}

      {/* Results */}
      {scanResults && (
        <Card className="hud-frame p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-bold neon-green">SCAN RESULTS</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30">
              <p className="text-xs text-gray-400 uppercase">Target</p>
              <p className="text-lg font-bold neon-cyan">{scanResults.target}</p>
            </div>
            <div className="bg-[#0a0e27] p-4 rounded border border-pink-500/30">
              <p className="text-xs text-gray-400 uppercase">Profiles Found</p>
              <p className="text-lg font-bold neon-pink">{scanResults.profilesFound || 0}</p>
            </div>
            <div className="bg-[#0a0e27] p-4 rounded border border-purple-500/30">
              <p className="text-xs text-gray-400 uppercase">Total Followers</p>
              <p className="text-lg font-bold text-purple-400">{scanResults.totalFollowers || 0}</p>
            </div>
            <div className="bg-[#0a0e27] p-4 rounded border border-yellow-500/30">
              <p className="text-xs text-gray-400 uppercase">Verified</p>
              <p className="text-lg font-bold text-yellow-400">{scanResults.verified ? "Yes" : "No"}</p>
            </div>
          </div>

          {scanResults.profiles && scanResults.profiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold neon-cyan">PROFILES DISCOVERED</h3>
              {scanResults.profiles.map((profile: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400">{profile.platform}</span>
                    {profile.verified && (
                      <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded">
                        ✓ VERIFIED
                      </span>
                    )}
                  </div>
                  {profile.found ? (
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-gray-400">Followers:</span>{" "}
                        <span className="text-green-400 font-mono">{profile.followers || profile.videos || 0}</span>
                      </p>
                      {profile.posts && (
                        <p>
                          <span className="text-gray-400">Posts:</span>{" "}
                          <span className="text-green-400 font-mono">{profile.posts}</span>
                        </p>
                      )}
                      {profile.bio && (
                        <p className="text-gray-400 italic">"{profile.bio}"</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Profile not found</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-500 text-right">
            Scanned at: {new Date().toLocaleString()}
          </div>
        </Card>
      )}
    </div>
  );
}
