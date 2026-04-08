import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Search, Loader2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function CVESearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchCVE = trpc.scans.searchCVEDatabase.useQuery(
    { query: query.trim() },
    { enabled: false }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    searchCVE.refetch().then((result) => {
      setResults(result.data);
      setIsLoading(false);
    }).catch((error: any) => {
      setResults({ error: error.message });
      setIsLoading(false);
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'HIGH':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'LOW':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-yellow-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            CVE Database Search
          </CardTitle>
          <CardDescription>
            Search for known vulnerabilities and security advisories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-yellow-400">CVE ID or Product Name</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., CVE-2024-1234 or Apache Log4j"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-yellow-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-yellow-400">CVE Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <Alert className="border-red-500/30 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  {results.error}
                </AlertDescription>
              </Alert>
            ) : results.success && results.cves?.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-yellow-400">
                  Found {results.cves.length} vulnerabilities
                </div>
                <div className="space-y-3">
                  {results.cves.map((cve: any, idx: number) => (
                    <div key={idx} className={`p-3 border rounded ${getSeverityColor(cve.severity)}`}>
                      <div className="font-mono text-sm">
                        <div className="flex items-center justify-between">
                          <div className="font-bold">{cve.id}</div>
                          <span className="text-xs px-2 py-1 rounded bg-black/50">
                            {cve.severity || 'UNKNOWN'}
                          </span>
                        </div>
                        {cve.description && (
                          <div className="text-gray-300 text-xs mt-2">
                            {cve.description.substring(0, 200)}...
                          </div>
                        )}
                        <div className="text-gray-500 text-xs mt-2 flex gap-3">
                          {cve.publishedDate && (
                            <span>📅 {new Date(cve.publishedDate).toLocaleDateString()}</span>
                          )}
                          {cve.cvssScore && (
                            <span>📊 CVSS: {cve.cvssScore}</span>
                          )}
                        </div>
                        {cve.affectedProducts && cve.affectedProducts.length > 0 && (
                          <div className="text-gray-500 text-xs mt-2">
                            Affected: {cve.affectedProducts.slice(0, 3).join(', ')}
                            {cve.affectedProducts.length > 3 && ` +${cve.affectedProducts.length - 3}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : results.success ? (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertDescription className="text-yellow-400">
                  No CVEs found for this search query.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
