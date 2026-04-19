import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { useRouter } from 'wouter';

export function DarkWebMonitor() {
  const [, navigate] = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
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
                  <Button onClick={handleSearch} disabled={isLoading}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Feature Coming Soon</p>
                  <p className="text-sm text-yellow-800">Dark web monitoring is under development</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
