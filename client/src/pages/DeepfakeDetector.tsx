import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { useLocation } from 'wouter';

export function DeepfakeDetector() {
  const [, setLocation] = useLocation();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDetect = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
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
            <h1 className="text-3xl font-bold">Deepfake Detector</h1>
            <p className="text-muted-foreground mt-2">Detect deepfakes and manipulated media using AI analysis</p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Media URL or File</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter image or video URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDetect()}
                  />
                  <Button onClick={handleDetect} disabled={isLoading}>
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
