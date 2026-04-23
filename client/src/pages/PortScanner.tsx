import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, Info } from "lucide-react";

export function PortScanner() {
  const [host, setHost] = useState("");
  const [selectedHost, setSelectedHost] = useState<string | null>(null);

  const query = trpc.osintTools.shodanPortScan.useQuery(
    { ip: selectedHost || "" },
    { enabled: !!selectedHost }
  );

  const handleScan = () => {
    if (!host.trim()) return;
    // Basic IP validation
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
      alert("Please enter a valid IP address");
      return;
    }
    setSelectedHost(host);
  };

  const data = query.data?.success ? query.data : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Port Scanner</h1>
        <p className="text-muted-foreground">Scan for open ports and identify running services on a host using Shodan</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This tool uses Shodan API for port scanning. Requires Shodan API key configured in environment variables.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Scan Target</CardTitle>
          <CardDescription>Enter IP address to scan for open ports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter IP address (e.g., 8.8.8.8)..."
              value={host}
              onChange={(e) => setHost(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleScan()}
            />
            <Button onClick={handleScan} disabled={query.isLoading}>
              {query.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                "Scan"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {query.error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Scan Failed</p>
              <p className="text-sm text-destructive">{query.error.message || "Failed to scan ports"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Target IP</p>
                <p className="font-semibold">{data.ip}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="font-semibold">{data.organization || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ISP</p>
                <p className="font-semibold">{data.isp || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {data.ports && data.ports.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Open Ports</CardTitle>
                <CardDescription>Found {data.ports.length} open port(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Port</th>
                        <th className="text-left py-2">Protocol</th>
                        <th className="text-left py-2">Service</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ports.map((port: number, index: number) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-2 font-mono font-semibold">{port}</td>
                          <td className="py-2">
                            <Badge variant="secondary">tcp</Badge>
                          </td>
                          <td className="py-2 text-muted-foreground">
                            {getServiceName(port)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No open ports detected</p>
              </CardContent>
            </Card>
          )}

          {data.services && data.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.services.map((service: any, index: number) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Port</p>
                        <p className="font-semibold">{service.port}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Protocol</p>
                        <p className="font-semibold">{service.protocol || "N/A"}</p>
                      </div>
                    </div>
                    {service.banner && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">Banner</p>
                        <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                          {service.banner}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {data.hostnames && data.hostnames.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hostnames</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.hostnames.map((hostname: string, index: number) => (
                    <Badge key={index} variant="outline">{hostname}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function getServiceName(port: number): string {
  const services: { [key: number]: string } = {
    21: "FTP",
    22: "SSH",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    5900: "VNC",
    8080: "HTTP-Proxy",
    8443: "HTTPS-Alt",
    27017: "MongoDB",
    6379: "Redis",
  };
  return services[port] || "Unknown";
}
