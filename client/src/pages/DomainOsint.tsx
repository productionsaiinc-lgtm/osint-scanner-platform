import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Play, Loader2 } from "lucide-react";

export default function DomainOsint() {
  const [domain, setDomain] = useState("");
  const [scanType, setScanType] = useState("whois");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<string>("");

  const handleScan = async () => {
    if (!domain) return;
    setIsScanning(true);
    setResults("");
    
    // Simulate scan
    setTimeout(() => {
      setResults(
        `[*] Querying domain: ${domain}\n` +
        `[*] Scan type: ${scanType}\n` +
        `[+] Domain: ${domain}\n` +
        `[+] Registrar: GoDaddy.com, Inc.\n` +
        `[+] Created: 2020-03-15\n` +
        `[+] Expires: 2025-03-15\n` +
        `[+] Nameservers:\n` +
        `    - ns1.example.com (192.0.2.1)\n` +
        `    - ns2.example.com (192.0.2.2)\n` +
        `[+] A Record: 93.184.216.34\n` +
        `[+] MX Record: mail.example.com (10)\n` +
        `[+] SSL Certificate: Valid (DigiCert)\n` +
        `[*] Query completed in 1.23s\n`
      );
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Globe className="h-8 w-8 text-neon-cyan-glow" />
        <h1 className="text-3xl font-bold neon-cyan-glow tracking-wider">DOMAIN OSINT</h1>
      </div>

      {/* Scan Input */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neon-pink-glow uppercase tracking-wider">
            Domain Name
          </label>
          <Input
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-[#0a0e27] border-neon-pink/30 text-neon-cyan placeholder:text-neon-cyan/40 focus:border-neon-pink focus:ring-neon-pink/50"
            onKeyPress={(e) => e.key === "Enter" && handleScan()}
          />
        </div>

        {/* Scan Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neon-pink-glow uppercase tracking-wider">
            Intelligence Type
          </label>
          <Tabs value={scanType} onValueChange={setScanType}>
            <TabsList className="grid w-full grid-cols-4 bg-[#0a0e27]/50 border border-neon-cyan/30">
              <TabsTrigger 
                value="whois"
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan-glow data-[state=active]:border-neon-cyan/50"
              >
                WHOIS
              </TabsTrigger>
              <TabsTrigger 
                value="dns"
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan-glow data-[state=active]:border-neon-cyan/50"
              >
                DNS
              </TabsTrigger>
              <TabsTrigger 
                value="subdomain"
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan-glow data-[state=active]:border-neon-cyan/50"
              >
                Subdomains
              </TabsTrigger>
              <TabsTrigger 
                value="ssl"
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan-glow data-[state=active]:border-neon-cyan/50"
              >
                SSL Cert
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scan Button */}
        <Button
          onClick={handleScan}
          disabled={!domain || isScanning}
          className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold uppercase tracking-wider h-10"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Querying...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Reconnaissance
            </>
          )}
        </Button>
      </Card>

      {/* Results */}
      {results && (
        <Card className="hud-frame p-6">
          <div className="space-y-2 mb-4">
            <h2 className="text-lg font-bold text-neon-pink-glow uppercase tracking-wider">Reconnaissance Results</h2>
          </div>
          <pre className="terminal-output whitespace-pre-wrap break-words text-xs">
            {results}
          </pre>
        </Card>
      )}

      {/* Info Panel */}
      <Card className="hud-frame p-6">
        <h3 className="text-sm font-bold text-neon-green-glow uppercase tracking-wider mb-3">About Domain OSINT</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Domain reconnaissance gathers publicly available information about target domains including 
          registration details, DNS configuration, subdomains, and SSL certificates. This intelligence 
          is crucial for understanding domain infrastructure and identifying potential attack surfaces.
        </p>
      </Card>
    </div>
  );
}
