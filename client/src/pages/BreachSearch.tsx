import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Search, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function BreachSearch() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchBreaches = trpc.scans.searchBreaches.useQuery(
    { email: email.trim() },
    { enabled: false }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    searchBreaches.refetch().then((result) => {
      setResults(result.data);
      setIsLoading(false);
    }).catch((error: any) => {
      setResults({ error: error.message });
      setIsLoading(false);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-pink-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-pink-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            HaveIBeenPwned Breach Search
          </CardTitle>
          <CardDescription>
            Check if an email address has been compromised in known data breaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-cyan-400">Email Address</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
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
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  {results.error}
                </AlertDescription>
              </Alert>
            ) : results.success && results.breaches?.length > 0 ? (
              <div className="space-y-4">
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-400">
                    ⚠️ This email was found in {results.breaches.length} data breach(es)
                  </AlertDescription>
                </Alert>
                <div className="space-y-3">
                  {results.breaches.map((breach: any, idx: number) => (
                    <div key={idx} className="p-3 border border-red-500/30 rounded bg-red-500/5">
                      <div className="font-mono text-sm">
                        <div className="text-red-400 font-bold">{breach.name}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          Breach Date: {breach.breachDate}
                        </div>
                        {breach.description && (
                          <div className="text-gray-500 text-xs mt-1">
                            {breach.description.substring(0, 150)}...
                          </div>
                        )}
                        {breach.dataClasses && (
                          <div className="text-yellow-600 text-xs mt-2">
                            Exposed Data: {breach.dataClasses.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : results.success ? (
              <Alert className="border-green-500/30 bg-green-500/10">
                <AlertDescription className="text-green-400">
                  ✓ Good news! This email was not found in any known breaches.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
