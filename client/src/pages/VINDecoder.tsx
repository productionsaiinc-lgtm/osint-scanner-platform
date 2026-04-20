import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export function VINDecoder() {
  const [, setLocation] = useLocation();
  const [vin, setVin] = useState('');
  const vinDecoder = trpc.osintTools.vinDecoder.useMutation();
  const [results, setResults] = useState<any>(null);

  const handleDecode = async () => {
    if (!vin.trim() || vin.length !== 17) return;
    try {
      const response = await vinDecoder.mutateAsync({ vin });
      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      console.error("Decode failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => setLocation('/')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">VIN Decoder</h1>
            <p className="text-muted-foreground mt-2">Decode vehicle identification numbers to extract manufacturer and vehicle information</p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Vehicle Identification Number (VIN)</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter 17-character VIN..."
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    maxLength={17}
                    onKeyPress={(e) => e.key === 'Enter' && handleDecode()}
                  />
                  <Button onClick={handleDecode} disabled={vinDecoder.isPending || vin.length !== 17}>
                    {vinDecoder.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {results && (
                <div className="space-y-4 mt-6">
                  <h2 className="text-lg font-semibold">Vehicle Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Manufacturer</p>
                      <p className="font-semibold">{results.manufacturer}</p>
                    </Card>
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-semibold">{results.year}</p>
                    </Card>
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Make</p>
                      <p className="font-semibold">{results.make}</p>
                    </Card>
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-semibold">{results.model}</p>
                    </Card>
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Body Type</p>
                      <p className="font-semibold">{results.bodyType}</p>
                    </Card>
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Engine</p>
                      <p className="font-semibold">{results.engine}</p>
                    </Card>
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="font-semibold">{results.transmission}</p>
                    </Card>
                    <Card className="p-4 bg-slate-50">
                      <p className="text-sm text-muted-foreground">Drive Type</p>
                      <p className="font-semibold">{results.driveType}</p>
                    </Card>
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
