import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radar, Play, Loader2 } from "lucide-react";

export default function NetworkScanner() {
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState("port");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<string>("");

  const handleScan = async () => {
    if (!target) return;
    setIsScanning(true);
    setResults("");
    
    // Simulate scan
    setTimeout(() => {
      setResults(
        `[*] Scanning target: ${target}\n` +
        `[*] Scan type: ${scanType}\n` +
        `[+] Port 22 (SSH) - Open\n` +
        `[+] Port 80 (HTTP) - Open\n` +
        `[+] Port 443 (HTTPS) - Open\n` +
        `[+] Port 3306 (MySQL) - Closed\n` +
        `[*] Scan completed in 2.34s\n`
      );
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Radar className="h-8 w-8 text-neon-pink-glow" />
        <h1 className="text-3xl font-bold neon-pink-glow tracking-wider">NETWORK SCANNER</h1>
      </div>

      {/* Scan Input */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neon-cyan-glow uppercase tracking-wider">
            Target Host / IP Address
          </label>
          <Input
            placeholder="192.168.1.1 or example.com"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="bg-[#0a0e27] border-neon-cyan/30 text-neon-cyan placeholder:text-neon-cyan/40 focus:border-neon-cyan focus:ring-neon-cyan/50"
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
          />
        </div>

        {/* Scan Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neon-cyan-glow uppercase tracking-wider">
            Scan Type
          </label>
          <Tabs value={scanType} onValueChange={setScanType}>
            <TabsList className="grid w-full grid-cols-4 bg-[#0a0e27]/50 border border-neon-pink/30">
              <TabsTrigger 
                value="port"
                className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink-glow data-[state=active]:border-neon-pink/50"
              >
                Port Scan
              </TabsTrigger>
              <TabsTrigger 
                value="ping"
                className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink-glow data-[state=active]:border-neon-pink/50"
              >
                Ping
              </TabsTrigger>
              <TabsTrigger 
                value="traceroute"
                className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink-glow data-[state=active]:border-neon-pink/50"
              >
                Traceroute
              </TabsTrigger>
              <TabsTrigger 
                value="geoloc"
                className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink-glow data-[state=active]:border-neon-pink/50"
              >
                Geolocation
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scan Button */}
        <Button
          onClick={handleScan}
          disabled={!target || isScanning}
          className="w-full bg-neon-pink hover:bg-neon-pink/80 text-black font-bold uppercase tracking-wider h-10"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Scan
            </>
          )}
        </Button>
      </Card>

      {/* Results */}
      {results && (
        <Card className="hud-frame p-6">
          <div className="space-y-2 mb-4">
            <h2 className="text-lg font-bold text-neon-cyan-glow uppercase tracking-wider">Scan Results</h2>
          </div>
          <pre className="terminal-output whitespace-pre-wrap break-words text-xs">
            {results}
          </pre>
        </Card>
      )}

      {/* Info Panel */}
      <Card className="hud-frame p-6">
        <h3 className="text-sm font-bold text-neon-purple-glow uppercase tracking-wider mb-3">About Network Scanning</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Network scanning identifies active hosts, open ports, and services running on target systems. 
          Use this tool to map network topology, discover vulnerabilities, and gather reconnaissance data 
          for authorized penetration testing activities.
        </p>
      </Card>
    </div>
  );
}
