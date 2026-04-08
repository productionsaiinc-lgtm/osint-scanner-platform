import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Play, Loader2 } from "lucide-react";

export default function SocialOsint() {
  const [username, setUsername] = useState("");
  const [platform, setPlatform] = useState("all");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<string>("");

  const handleSearch = async () => {
    if (!username) return;
    setIsScanning(true);
    setResults("");
    
    // Simulate search
    setTimeout(() => {
      setResults(
        `[*] Searching for username: ${username}\n` +
        `[*] Platform: ${platform}\n` +
        `[+] Twitter: @${username} - Found\n` +
        `    - Followers: 1,234\n` +
        `    - Following: 567\n` +
        `    - Joined: 2018-05-12\n` +
        `    - Bio: Security researcher | Cybersecurity enthusiast\n` +
        `[+] GitHub: ${username} - Found\n` +
        `    - Public Repos: 42\n` +
        `    - Followers: 234\n` +
        `    - Bio: Open source contributor\n` +
        `[+] LinkedIn: ${username} - Found\n` +
        `    - Title: Security Engineer\n` +
        `    - Company: TechCorp Inc.\n` +
        `[+] Instagram: ${username} - Not Found\n` +
        `[*] Search completed in 3.45s\n`
      );
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Users className="h-8 w-8 text-neon-purple-glow" />
        <h1 className="text-3xl font-bold neon-purple-glow tracking-wider">SOCIAL MEDIA OSINT</h1>
      </div>

      {/* Search Input */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neon-cyan-glow uppercase tracking-wider">
            Username / Handle
          </label>
          <Input
            placeholder="john_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#0a0e27] border-neon-purple/30 text-neon-cyan placeholder:text-neon-cyan/40 focus:border-neon-purple focus:ring-neon-purple/50"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neon-cyan-glow uppercase tracking-wider">
            Platforms
          </label>
          <Tabs value={platform} onValueChange={setPlatform}>
            <TabsList className="grid w-full grid-cols-5 bg-[#0a0e27]/50 border border-neon-purple/30">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple-glow data-[state=active]:border-neon-purple/50"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="twitter"
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple-glow data-[state=active]:border-neon-purple/50"
              >
                Twitter
              </TabsTrigger>
              <TabsTrigger 
                value="github"
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple-glow data-[state=active]:border-neon-purple/50"
              >
                GitHub
              </TabsTrigger>
              <TabsTrigger 
                value="linkedin"
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple-glow data-[state=active]:border-neon-purple/50"
              >
                LinkedIn
              </TabsTrigger>
              <TabsTrigger 
                value="instagram"
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple-glow data-[state=active]:border-neon-purple/50"
              >
                Instagram
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={!username || isScanning}
          className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white font-bold uppercase tracking-wider h-10"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Search Profiles
            </>
          )}
        </Button>
      </Card>

      {/* Results */}
      {results && (
        <Card className="hud-frame p-6">
          <div className="space-y-2 mb-4">
            <h2 className="text-lg font-bold text-neon-purple-glow uppercase tracking-wider">Search Results</h2>
          </div>
          <pre className="terminal-output whitespace-pre-wrap break-words text-xs">
            {results}
          </pre>
        </Card>
      )}

      {/* Info Panel */}
      <Card className="hud-frame p-6">
        <h3 className="text-sm font-bold text-neon-green-glow uppercase tracking-wider mb-3">About Social Media OSINT</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Social media reconnaissance identifies and profiles individuals across popular platforms. 
          This intelligence gathering technique helps establish digital footprints, identify connections, 
          and discover publicly shared information that may reveal vulnerabilities or social engineering opportunities.
        </p>
      </Card>
    </div>
  );
}
