import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function PortScanner() {
  const [host, setHost] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!host.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResults([
        { port: 22, service: "SSH", state: "open", version: "OpenSSH 8.2p1" },
        { port: 80, service: "HTTP", state: "open", version: "Apache 2.4.41" },
        { port: 443, service: "HTTPS", state: "open", version: "nginx 1.18.0" },
        { port: 3306, service: "MySQL", state: "open", version: "MySQL 8.0.28" },
        { port: 5432, service: "PostgreSQL", state: "open", version: "PostgreSQL 13.6" },
        { port: 8080, service: "HTTP-Proxy", state: "open", version: "Tomcat 9.0.58" },
        { port: 25, service: "SMTP", state: "filtered", version: "Postfix" },
        { port: 53, service: "DNS", state: "open", version: "BIND 9.16.1" }
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Port Scanner</h1>
        <p className="text-muted-foreground">Scan for open ports and identify running services on a host</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan Target</CardTitle>
          <CardDescription>Enter hostname or IP address to scan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter host or IP address..."
              value={host}
              onChange={(e) => setHost(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleScan()}
            />
            <Button onClick={handleScan} disabled={loading}>
              {loading ? "Scanning..." : "Scan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>Found {results.filter(r => r.state === "open").length} open ports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Port</th>
                    <th className="text-left py-2">Service</th>
                    <th className="text-left py-2">State</th>
                    <th className="text-left py-2">Version</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.port} className="border-b hover:bg-muted/50">
                      <td className="py-2 font-mono">{result.port}</td>
                      <td className="py-2">{result.service}</td>
                      <td className="py-2">
                        <Badge variant={result.state === "open" ? "default" : "secondary"}>
                          {result.state}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">{result.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
