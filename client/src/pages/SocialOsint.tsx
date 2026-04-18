import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Loader2, CheckCircle2, AlertCircle, ExternalLink, Globe, AlertTriangle, Search } from "lucide-react";
import ScanProgressBar from "@/components/ScanProgressBar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SocialOsint() {
  const [target, setTarget] = useState("");
  const [platform, setPlatform] = useState("all");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profiles");
  
  // Breach search state
  const [email, setEmail] = useState("");
  const [breachResults, setBreachResults] = useState<any>(null);
  const [isBreachLoading, setIsBreachLoading] = useState(false);

  const createScanMutation = trpc.scans.create.useMutation();
  const executeSocialScanMutation = trpc.scans.executeSocialScan.useMutation();

  const socialScanSteps = [
    { label: "Initializing scan engine", duration: 500 },
    { label: "Searching Twitter / X", duration: 900 },
    { label: "Searching Instagram", duration: 900 },
    { label: "Searching Reddit & TikTok", duration: 900 },
    { label: "Searching LinkedIn & GitHub", duration: 900 },
    { label: "Compiling profile intelligence", duration: 600 },
  ];
  const searchBreaches = trpc.scans.searchBreaches.useQuery(
    { email: email.trim() },
    { enabled: false }
  );

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
      toast.error("Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const handleBreachSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsBreachLoading(true);
    try {
      const result = await searchBreaches.refetch();
      setBreachResults(result.data);
      if (result.data?.success) {
        toast.success("Breach search completed!");
      } else {
        toast.error(result.data?.error || "Search failed");
      }
    } catch (error: any) {
      setBreachResults({ error: error.message });
      toast.error("Search failed");
    } finally {
      setIsBreachLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-pink-glow">SOCIAL & BREACH INTELLIGENCE</h1>
        <p className="text-gray-400">Combined social media profiling and breach detection</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-cyan-500/30">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === "profiles"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
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
          <Globe className="w-4 h-4 inline mr-2" />
          Multi-Platform Scraper
        </button>
        <button
          onClick={() => setActiveTab("breaches")}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === "breaches"
              ? "text-neon-pink border-b-2 border-neon-pink"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Breach Search
        </button>
      </div>

      {/* Progress Bar - shown for profile & scraper tabs */}
      {(activeTab === "profiles" || activeTab === "scraper") && (
        <ScanProgressBar isScanning={isScanning} steps={socialScanSteps} />
      )}

      {/* Profile Search Tab */}
      {activeTab === "profiles" && (
        <Card className="hud-frame p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium neon-cyan">Username</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter username to search..."
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-[#0a0e27] border-cyan-500/30 text-white"
                  disabled={isScanning}
                />
                <Button
                  onClick={handleScan}
                  disabled={isScanning || !target.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {scanResults && (
              <div className="space-y-4">
                <h3 className="font-bold neon-cyan">SCAN RESULTS</h3>
                <div className="bg-[#0a0e27] p-4 rounded border border-cyan-500/30 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                    {JSON.stringify(scanResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Multi-Platform Scraper Tab */}
      {activeTab === "scraper" && (
        <Card className="hud-frame p-6 space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium neon-cyan">Username</label>
                <Input
                  placeholder="Enter username..."
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-[#0a0e27] border-cyan-500/30 text-white"
                  disabled={isScanning}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium neon-green">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-[#0a0e27] border border-green-500/30 text-white p-2 rounded"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p.toLowerCase()}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={handleScan}
              disabled={isScanning || !target.trim()}
              className="w-full bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-700 hover:to-green-700 text-white"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scraping
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Start Scrape
                </>
              )}
            </Button>

            {scanResults && (
              <div className="space-y-4">
                <h3 className="font-bold neon-green">SCRAPE RESULTS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(scanResults) ? (
                    scanResults.map((result: any, idx: number) => (
                      <div key={idx} className="bg-[#0a0e27] p-4 rounded border border-green-500/30">
                        <p className="text-sm text-green-400 font-bold">{result.platform}</p>
                        <p className="text-xs text-gray-400 mt-1">Followers: {result.followers}</p>
                        <p className="text-xs text-gray-400">Posts: {result.posts}</p>
                        {result.verified && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-green-400">Verified</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 bg-[#0a0e27] p-4 rounded border border-green-500/30">
                      <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                        {JSON.stringify(scanResults, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Breach Search Tab */}
      {activeTab === "breaches" && (
        <Card className="hud-frame p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium neon-pink">Email Address</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0a0e27] border-pink-500/30 text-white"
                  disabled={isBreachLoading}
                />
                <Button
                  onClick={handleBreachSearch}
                  disabled={isBreachLoading || !email.trim()}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  {isBreachLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {breachResults && (
              <div className="space-y-4">
                <h3 className="font-bold neon-pink">BREACH RESULTS</h3>
                {breachResults.error ? (
                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span>{breachResults.error}</span>
                    </div>
                  </div>
                ) : breachResults.breaches && breachResults.breaches.length > 0 ? (
                  <div className="space-y-2">
                    {breachResults.breaches.map((breach: any, idx: number) => (
                      <div key={idx} className="bg-red-500/10 border border-red-500/30 p-4 rounded">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-red-400">{breach.name}</p>
                            <p className="text-xs text-gray-400 mt-1">Date: {breach.date}</p>
                            <p className="text-xs text-gray-400">Records: {breach.recordCount}</p>
                          </div>
                          {breach.isVerified && (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>No breaches found for this email</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
