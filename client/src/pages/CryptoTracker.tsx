import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'wouter';

export function CryptoTracker() {
  const [, navigate] = useRouter();
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async () => {
    if (!address.trim()) return;
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
            <h1 className="text-3xl font-bold">Crypto Tracker</h1>
            <p className="text-muted-foreground mt-2">Track cryptocurrency addresses and transactions across multiple blockchains</p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Wallet Address</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter Bitcoin, Ethereum, or other wallet address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  />
                  <Button onClick={handleTrack} disabled={isLoading}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
