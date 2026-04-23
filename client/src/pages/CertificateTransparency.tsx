import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, Calendar, Lock } from "lucide-react";

export function CertificateTransparency() {
  const [domain, setDomain] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const query = trpc.osintTools.certificateTransparency.useQuery(
    { domain: selectedDomain || "" },
    { enabled: !!selectedDomain }
  );

  const handleSearch = () => {
    if (!domain.trim()) return;
    setSelectedDomain(domain);
  };

  const data = query.data?.success ? query.data : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Certificate Transparency</h1>
        <p className="text-muted-foreground">Search Certificate Transparency logs for SSL/TLS certificates issued for a domain</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Domain</CardTitle>
          <CardDescription>Enter a domain name to find all certificates in CT logs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter domain (e.g., example.com)..."
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={query.isLoading}>
              {query.isLoading ? (
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

      {query.error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{query.error.message || "Failed to search certificates"}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Domain</p>
                <p className="font-semibold">{data.domain}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Certificates</p>
                <p className="font-semibold text-lg">{data.certificateCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-semibold text-sm">{data.timestamp ? new Date(data.timestamp).toLocaleDateString() : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {data.certificates && data.certificates.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Certificates Found</h3>
              {data.certificates.map((cert: any, index: number) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Common Name</p>
                        <p className="font-semibold break-all">{cert.commonName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Issuer</p>
                        <p className="font-semibold">{cert.issuerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Valid From
                        </p>
                        <p className="font-semibold">{cert.notBefore ? new Date(cert.notBefore).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Expires
                        </p>
                        <p className="font-semibold">{cert.notAfter ? new Date(cert.notAfter).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Certificate ID</p>
                        <p className="font-mono text-sm break-all">{cert.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Entry Timestamp</p>
                        <p className="font-semibold text-sm">{cert.entryTimestamp ? new Date(cert.entryTimestamp).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    {cert.nameValue && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">SANs (Subject Alternative Names)</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cert.nameValue.split(", ").map((san: string, i: number) => (
                            <Badge key={i} variant="secondary">{san}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No certificates found for this domain</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
