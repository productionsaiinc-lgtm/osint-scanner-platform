import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code2, Search, Loader2, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function GitHubSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchGitHub = trpc.scans.searchGitHub.useQuery(
    { query: query.trim() },
    { enabled: false }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    searchGitHub.refetch().then((result) => {
      setResults(result.data);
      setIsLoading(false);
    }).catch((error: any) => {
      setResults({ error: error.message });
      setIsLoading(false);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-cyan-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            GitHub Repository Search
          </CardTitle>
          <CardDescription>
            Search for repositories, code, and security vulnerabilities on GitHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-cyan-400">Search Query</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., api keys, credentials, vulnerable code"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
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
        <Card className="border-cyan-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-cyan-400">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <Alert className="border-red-500/30 bg-red-500/10">
                <AlertDescription className="text-red-400">
                  {results.error}
                </AlertDescription>
              </Alert>
            ) : results.success && results.repositories?.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-cyan-400">
                  Found {results.repositories.length} repositories
                </div>
                <div className="space-y-3">
                  {results.repositories.map((repo: any, idx: number) => (
                    <div key={idx} className="p-3 border border-cyan-500/30 rounded bg-cyan-500/5">
                      <div className="font-mono text-sm">
                        <div className="flex items-center justify-between">
                          <div className="text-cyan-400 font-bold">{repo.name}</div>
                          {repo.url && (
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-500 hover:text-cyan-400"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        {repo.description && (
                          <div className="text-gray-400 text-xs mt-1">
                            {repo.description.substring(0, 150)}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs mt-2 flex gap-3">
                          {repo.stars && <span>⭐ {repo.stars}</span>}
                          {repo.language && <span>💻 {repo.language}</span>}
                          {repo.forks && <span>🔀 {repo.forks}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : results.success ? (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertDescription className="text-yellow-400">
                  No repositories found for this search query.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
