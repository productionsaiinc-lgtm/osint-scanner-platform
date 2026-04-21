import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function CertificateTransparency() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!domain.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResults([
        {
          id: "1",
          domain: domain,
          issuer: "Let's Encrypt",
          issued_date: "2026-03-21",
          expiry_date: "2027-03-21",
          subject_cn: domain,
          serial: "04c8f8b3a2e1f5d9",
          status: "Valid",
          log_id: "ct.googleapis.com/logs/argon2023",
          entry_id: "123456789"
        },
        {
          id: "2",
          domain: `*.${domain}`,
          issuer: "DigiCert",
          issued_date: "2026-01-15",
          expiry_date: "2027-01-15",
          subject_cn: `*.${domain}`,
          serial: "02a1b3c4d5e6f7g8",
          status: "Valid",
          log_id: "ct.googleapis.com/logs/argon2024",
          entry_id: "987654321"
        },
        {
          id: "3",
          domain: `www.${domain}`,
          issuer: "Sectigo",
          issued_date: "2025-12-01",
          expiry_date: "2026-12-01",
          subject_cn: `www.${domain}`,
          serial: "05h2i3j4k5l6m7n8",
          status: "Expired",
          log_id: "ct.googleapis.com/logs/argon2022",
          entry_id: "555666777"
        }
      ]);
      setLoading(false);
    }, 800);
  };

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
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Found Certificates ({results.length})</CardTitle>
            <CardDescription>Certificates found in Certificate Transparency logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((cert) => (
              <div key={cert.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{cert.subject_cn}</p>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  </div>
                  <Badge variant={cert.status === "Valid" ? "default" : "destructive"}>
                    {cert.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Issued</p>
                    <p className="font-mono">{cert.issued_date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-mono">{cert.expiry_date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Serial</p>
                    <p className="font-mono text-xs">{cert.serial}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Entry ID</p>
                    <p className="font-mono text-xs">{cert.entry_id}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
