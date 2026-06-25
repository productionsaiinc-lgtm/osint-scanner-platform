import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AtSign, Search, Globe, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";

export default function EmailLookup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const lookup = trpc.emailLookup.lookup.useMutation({
    onError: (err) => {
      toast({ title: "Lookup failed", description: err.message, variant: "destructive" });
    },
  });

  const handleLookup = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast({ title: "Enter an email address", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast({ title: "Invalid email format", variant: "destructive" });
      return;
    }
    lookup.mutate({ email: trimmed });
  };

  const result = lookup.data;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <AtSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Email Lookup</h1>
            <p className="text-sm text-muted-foreground">
              Validate, investigate, and gather intelligence on any email address
            </p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                placeholder="Enter email address (e.g. user@example.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                className="flex-1"
              />
              <Button onClick={handleLookup} disabled={lookup.isPending}>
                {lookup.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Lookup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-4">
            {/* Gravatar */}
            {result.gravatarFound && result.gravatarUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <img
                    src={result.gravatarUrl}
                    alt="Gravatar"
                    className="h-16 w-16 rounded-full border"
                  />
                  <div>
                    <p className="text-sm font-medium">{result.email}</p>
                    <p className="text-xs text-muted-foreground">Gravatar profile found</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatusTile label="Format Valid" ok={result.valid} />
                  <StatusTile label="MX Records" ok={result.mxFound} />
                  <StatusTile label="SMTP Check" ok={result.smtpValid} />
                  <StatusTile label="Disposable" ok={!result.disposable} invertColor />
                </div>
                {result.mxRecords?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">MX Records</p>
                    <div className="flex flex-wrap gap-2">
                      {result.mxRecords.map((mx: any, i: number) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs">
                          {mx.exchange} (priority {mx.priority})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Domain Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Domain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Domain" value={result.domain} />
                {result.domainInfo?.registrar && <><Separator /><InfoRow label="Registrar" value={result.domainInfo.registrar} /></>}
                {result.domainInfo?.country && <><Separator /><InfoRow label="Country" value={result.domainInfo.country} /></>}
                {result.domainInfo?.created && <><Separator /><InfoRow label="Registered" value={result.domainInfo.created} /></>}
                {result.domainInfo?.expires && <><Separator /><InfoRow label="Expires" value={result.domainInfo.expires} /></>}
                {!result.domainInfo && (
                  <p className="text-sm text-muted-foreground">Domain WHOIS data unavailable</p>
                )}
              </CardContent>
            </Card>

            {/* Breach Intelligence */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Breach Intelligence
                </CardTitle>
                <CardDescription>Known data breach appearances for this address</CardDescription>
              </CardHeader>
              <CardContent>
                {result.breachNote ? (
                  <p className="text-sm text-muted-foreground">{result.breachNote}</p>
                ) : result.breachCount === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    No known breaches found
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Badge variant="destructive" className="w-fit">
                      {result.breachCount} breach{result.breachCount !== 1 ? "es" : ""} found
                    </Badge>
                    <div className="flex flex-col gap-2">
                      {result.breaches?.map((b: any) => (
                        <div key={b.name} className="rounded-md border bg-card p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{b.name}</span>
                            <span className="text-xs text-muted-foreground">{b.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {b.records?.toLocaleString()} records exposed
                          </p>
                          {b.dataClasses?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {b.dataClasses.slice(0, 5).map((dc: string) => (
                                <Badge key={dc} variant="outline" className="text-xs">{dc}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {result.breachRecommendations?.length > 0 && (
                      <div className="mt-2 p-3 rounded-md bg-muted">
                        <p className="text-xs font-medium mb-1">Recommendations</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {result.breachRecommendations.map((r: string, i: number) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusTile({ label, ok, invertColor = false }: { label: string; ok: boolean; invertColor?: boolean }) {
  const positive = invertColor ? !ok : ok;
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-lg border bg-card">
      {positive ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircle className="h-5 w-5 text-destructive" />
      )}
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
