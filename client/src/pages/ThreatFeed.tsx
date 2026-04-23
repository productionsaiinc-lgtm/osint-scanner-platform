import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ThreatFeed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [autoLoad, setAutoLoad] = useState(true);

  // Auto-load threat intelligence on mount
  useEffect(() => {
    if (autoLoad) {
      setSelectedQuery("vulnerability");
      setAutoLoad(false);
    }
  }, [autoLoad]);

  const threatQuery = trpc.osintTools.threatIntelligence.useQuery(
    undefined,
    { enabled: !selectedQuery }
  );

  const nvdQuery = trpc.osintTools.nvdVulnerabilitySearch.useQuery(
    { keyword: selectedQuery || "", limit: 10 },
    { enabled: !!selectedQuery }
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSelectedQuery(searchQuery);
  };

  const threats = selectedQuery ? nvdQuery.data?.vulnerabilities : threatQuery.data?.threats;
  const isLoading = selectedQuery ? nvdQuery.isLoading : threatQuery.isLoading;
  const error = selectedQuery ? nvdQuery.error : threatQuery.error;

  const getSeverityColor = (severity?: string) => {
    if (!severity) return "outline";
    const lower = severity.toLowerCase();
    if (lower.includes("critical")) return "destructive";
    if (lower.includes("high")) return "secondary";
    if (lower.includes("medium")) return "default";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Threat Feed</h1>
        <p className="text-muted-foreground">Monitor real-time security threats and vulnerabilities from NVD and other sources</p>
      </div>

      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          This feed pulls real-time vulnerability data from the National Vulnerability Database (NVD).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Search Vulnerabilities</CardTitle>
          <CardDescription>Search for specific vulnerabilities or threats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for vulnerabilities (e.g., 'RCE', 'SQL injection')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
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

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error.message || "Failed to load threat data"}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Loading threat data...</p>
          </CardContent>
        </Card>
      )}

      {threats && threats.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {selectedQuery ? "Search Results" : "Latest Threats"} ({threats.length})
            </h2>
          </div>

          {threats.map((threat: any, index: number) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {threat.cveId && (
                        <Badge variant="outline" className="font-mono">
                          {threat.cveId}
                        </Badge>
                      )}
                      {threat.id && (
                        <Badge variant="outline" className="font-mono">
                          {threat.id}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg break-words">
                      {threat.description || threat.title || "Vulnerability Alert"}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={getSeverityColor(threat.severity)}
                    className="capitalize whitespace-nowrap"
                  >
                    {threat.severity || "Unknown"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Published</p>
                    <p className="font-semibold">
                      {threat.published
                        ? new Date(threat.published).toLocaleDateString()
                        : threat.date || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Modified</p>
                    <p className="font-semibold">
                      {threat.lastModified
                        ? new Date(threat.lastModified).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {threat.cvssScores && threat.cvssScores.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">CVSS Scores</p>
                    <div className="space-y-2">
                      {threat.cvssScores.map((score: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm">{score.cvssData?.version || "CVSS"}</span>
                          <span className="font-semibold">
                            {score.cvssData?.baseScore || "N/A"} / 10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {threat.cweIds && threat.cweIds.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Weakness Types</p>
                    <div className="flex flex-wrap gap-2">
                      {threat.cweIds.slice(0, 5).map((cwe: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {cwe}
                        </Badge>
                      ))}
                      {threat.cweIds.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{threat.cweIds.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {threat.references && threat.references.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">References</p>
                    <div className="space-y-1">
                      {threat.references.slice(0, 3).map((ref: string, i: number) => (
                        <a
                          key={i}
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline break-all block"
                        >
                          {ref}
                        </a>
                      ))}
                      {threat.references.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{threat.references.length - 3} more references
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No threats found. Try searching for specific vulnerabilities.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
