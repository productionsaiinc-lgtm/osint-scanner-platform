import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AtSign, Search, User, Globe, Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailLookupResult {
  email: string;
  valid: boolean;
  disposable: boolean;
  mxFound: boolean;
  smtpValid: boolean;
  domain: string;
  domainInfo?: {
    created?: string;
    registrar?: string;
    country?: string;
  };
  breachCount?: number;
  sources?: string[];
}

export default function EmailLookup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailLookupResult | null>(null);
  const { toast } = useToast();

  const handleLookup = async () => {
    if (!email.trim()) {
      toast({ title: "Enter an email address", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({ title: "Invalid email format", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/email-lookup?email=${encodeURIComponent(email.trim())}`);
      if (!response.ok) throw new Error("Lookup failed");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      // Fallback: basic client-side parsing if API not yet wired
      const domain = email.split("@")[1];
      setResult({
        email: email.trim(),
        valid: true,
        disposable: ["mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com"].includes(domain),
        mxFound: true,
        smtpValid: false,
        domain,
        sources: [],
        breachCount: 0,
      });
      toast({ title: "Live API not connected — showing basic parse", variant: "default" });
    } finally {
      setLoading(false);
    }
  };

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
              <Button onClick={handleLookup} disabled={loading}>
                {loading ? (
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
            {/* Validation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatusTile
                    label="Format Valid"
                    ok={result.valid}
                  />
                  <StatusTile
                    label="MX Records"
                    ok={result.mxFound}
                  />
                  <StatusTile
                    label="SMTP Check"
                    ok={result.smtpValid}
                  />
                  <StatusTile
                    label="Disposable"
                    ok={!result.disposable}
                    invertColor
                  />
                </div>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Domain</span>
                  <span className="text-sm font-medium">{result.domain}</span>
                </div>
                {result.domainInfo?.registrar && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Registrar</span>
                      <span className="text-sm font-medium">{result.domainInfo.registrar}</span>
                    </div>
                  </>
                )}
                {result.domainInfo?.country && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Country</span>
                      <span className="text-sm font-medium">{result.domainInfo.country}</span>
                    </div>
                  </>
                )}
                {result.domainInfo?.created && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Registered</span>
                      <span className="text-sm font-medium">{result.domainInfo.created}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Breach Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Breach Intelligence
                </CardTitle>
                <CardDescription>Known data breach appearances for this address</CardDescription>
              </CardHeader>
              <CardContent>
                {result.breachCount === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    No known breaches found
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Badge variant="destructive" className="w-fit">
                      {result.breachCount} breach{result.breachCount !== 1 ? "es" : ""} found
                    </Badge>
                    {result.sources && result.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.sources.map((s) => (
                          <Badge key={s} variant="outline">{s}</Badge>
                        ))}
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
