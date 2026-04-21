import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function IPLookup() {
  const [ipAddress, setIpAddress] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!ipAddress.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResults({
        ip: ipAddress,
        country: "United States",
        region: "California",
        city: "San Francisco",
        latitude: 37.7749,
        longitude: -122.4194,
        isp: "Comcast Cable Communications",
        asn: "AS7922",
        organization: "Comcast",
        timezone: "America/Los_Angeles",
        currency: "USD",
        threat_level: "LOW",
        is_vpn: false,
        is_proxy: false,
        is_datacenter: false,
        reputation_score: 85,
        abuse_reports: 2,
        last_seen: "2026-04-21T03:00:00Z"
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IP Lookup</h1>
        <p className="text-muted-foreground">Analyze IP addresses and retrieve geolocation, ISP, and threat intelligence data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IP Address Lookup</CardTitle>
          <CardDescription>Enter an IP address to retrieve detailed information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter IP address (e.g., 8.8.8.8)..."
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-semibold">{results.country}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="font-semibold">{results.region}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-semibold">{results.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timezone</p>
                <p className="font-semibold">{results.timezone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latitude</p>
                <p className="font-semibold">{results.latitude}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longitude</p>
                <p className="font-semibold">{results.longitude}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Network Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ISP</p>
                <p className="font-semibold">{results.isp}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ASN</p>
                <p className="font-semibold">{results.asn}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="font-semibold">{results.organization}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="font-semibold">{results.currency}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Threat Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Threat Level</p>
                  <Badge variant={results.threat_level === "LOW" ? "default" : "destructive"}>
                    {results.threat_level}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reputation Score</p>
                  <p className="font-semibold">{results.reputation_score}/100</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">VPN</p>
                  <Badge variant={results.is_vpn ? "destructive" : "secondary"}>
                    {results.is_vpn ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proxy</p>
                  <Badge variant={results.is_proxy ? "destructive" : "secondary"}>
                    {results.is_proxy ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Datacenter</p>
                  <Badge variant={results.is_datacenter ? "destructive" : "secondary"}>
                    {results.is_datacenter ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abuse Reports</p>
                <p className="font-semibold">{results.abuse_reports}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
