import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'wouter';

export function EmployeeEnum() {
  const [, navigate] = useRouter();
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!company.trim()) return;
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
            <h1 className="text-3xl font-bold">Employee Enumeration</h1>
            <p className="text-muted-foreground mt-2">Enumerate employees and organizational structure from public sources</p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name or Domain</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter company name or domain..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isLoading}>
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
