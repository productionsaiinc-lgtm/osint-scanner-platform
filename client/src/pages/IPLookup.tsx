import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";

export function IPLookup() {
  const [ipAddress, setIpAddress] = useState("");
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [showReputation, setShowReputation] = useState(false);

  // Query for IP geolocation
  const geoQuery = trpc.osintTools.ipGeolocation.useQuery(
    { ip: selectedIp || "" },
    { enabled: !!selectedIp }
  );

  // Query for IP reputation
  const reputationQuery = trpc.osintTools.ipReputation.useQuery(
    { ip: selectedIp || "" },
    { enabled: !!selectedIp && showReputation }
  );

  const handleSearch = () => {
    if (!ipAddress.trim()) return;
    // Basic IP validation
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress)) {
      alert("Please enter a valid IP address");
      return;
    }
    setSelectedIp(ipAddress);
    setShowReputation(false);
  };

  const handleLoadReputation = () => {
    setShowReputation(true);
  };

  const geoData = geoQuery.data?.success ? geoQuery.data : null;
  const repData = reputationQuery.data?.success ? reputationQuery.data : null;

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
            <Button onClick={handleSearch} disabled={geoQuery.isLoading}>
              {geoQuery.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {geoQuery.error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{geoQuery.error.message || "Failed to lookup IP"}</p>
          </CardContent>
        </Card>
      )}

      {geoData && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">IP Address</p>
                <p className="font-semibold">{geoData.ip}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-semibold">{geoData.country || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="font-semibold">{geoData.region || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-semibold">{geoData.city || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latitude</p>
                <p className="font-semibold">{geoData.latitude || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longitude</p>
                <p className="font-semibold">{geoData.longitude || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timezone</p>
                <p className="font-semibold">{geoData.timezone || "N/A"}</p>
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
                <p className="font-semibold">{geoData.isp || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="font-semibold">{geoData.organization || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ASN</p>
                <p className="font-semibold">{geoData.asn || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Threat Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <Badge variant={geoData.isMobile ? "destructive" : "secondary"}>
                    {geoData.isMobile ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proxy</p>
                  <Badge variant={geoData.isProxy ? "destructive" : "secondary"}>
                    {geoData.isProxy ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hosting</p>
                  <Badge variant={geoData.isHosting ? "destructive" : "secondary"}>
                    {geoData.isHosting ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              <Button onClick={handleLoadReputation} disabled={reputationQuery.isLoading} className="w-full">
                {reputationQuery.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Reputation...
                  </>
                ) : (
                  "Load IP Reputation Data"
                )}
              </Button>
            </CardContent>
          </Card>

          {repData && (
            <Card>
              <CardHeader>
                <CardTitle>IP Reputation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fraud Score</p>
                    <p className="font-semibold">{repData.fraudScore}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <Badge variant={repData.fraudScore > 75 ? "destructive" : repData.fraudScore > 50 ? "secondary" : "default"}>
                      {repData.fraudScore > 75 ? "High" : repData.fraudScore > 50 ? "Medium" : "Low"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">VPN</p>
                    <Badge variant={repData.isVPN ? "destructive" : "secondary"}>
                      {repData.isVPN ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Proxy</p>
                    <Badge variant={repData.isProxy ? "destructive" : "secondary"}>
                      {repData.isProxy ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tor</p>
                    <Badge variant={repData.isTor ? "destructive" : "secondary"}>
                      {repData.isTor ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bot</p>
                    <Badge variant={repData.isBot ? "destructive" : "secondary"}>
                      {repData.isBot ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
                {repData.threatTypes && repData.threatTypes.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Threat Types</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {repData.threatTypes.map((threat: string, i: number) => (
                        <Badge key={i} variant="destructive">{threat}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {reputationQuery.error && (
            <Card className="border-destructive">
              <CardContent className="flex items-center gap-2 pt-6">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-destructive">{reputationQuery.error.message || "Failed to load reputation data"}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
