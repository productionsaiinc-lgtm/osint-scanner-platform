import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'wouter';
import { trpc } from '@/lib/trpc';

export function DarkWebMonitor() {
  const [, navigate] = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const darkWebMonitor = trpc.osintTools.darkWebMonitor.useMutation();
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const response = await darkWebMonitor.mutateAsync({ query: searchTerm });
      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dark Web Monitor</h1>
            <p className="text-muted-foreground mt-2">Monitor dark web mentions and threats related to your organization</p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Search Term</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter keyword, domain, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={darkWebMonitor.isPending}>
                    {darkWebMonitor.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {results && (
                <div className="space-y-4 mt-6">
                  <h2 className="text-lg font-semibold">Results</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Mentions Found</p>
                      <p className="text-2xl font-bold">{results.mentions}</p>
                    </Card>
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Severity</p>
                      <p className={`text-lg font-bold ${results.severity === 'high' ? 'text-red-600' : results.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {results.severity.toUpperCase()}
                      </p>
                    </Card>
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Last Seen</p>
                      <p className="text-sm font-mono">{new Date(results.lastSeen).toLocaleDateString()}</p>
                    </Card>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Sources:</p>
                    <ul className="space-y-1">
                      {results.sources.map((source: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {source}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
