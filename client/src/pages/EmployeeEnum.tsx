import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { useLocation } from 'wouter';

export function EmployeeEnum() {
  const [, setLocation] = useLocation();
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!company.trim()) return;
    setIsLoading(true);
    
    // Simulate employee enumeration
    const mockResults = {
      company: company,
      employeesFound: Math.floor(Math.random() * 500) + 50,
      employees: [
        { name: 'John Smith', title: 'CEO', email: 'john.smith@' + company.toLowerCase().replace(/\s+/g, '') + '.com', linkedIn: 'linkedin.com/in/johnsmith' },
        { name: 'Sarah Johnson', title: 'CTO', email: 'sarah.johnson@' + company.toLowerCase().replace(/\s+/g, '') + '.com', linkedIn: 'linkedin.com/in/sarahjohnson' },
        { name: 'Michael Chen', title: 'VP Engineering', email: 'michael.chen@' + company.toLowerCase().replace(/\s+/g, '') + '.com', linkedIn: 'linkedin.com/in/michaelchen' },
        { name: 'Emily Davis', title: 'Security Lead', email: 'emily.davis@' + company.toLowerCase().replace(/\s+/g, '') + '.com', linkedIn: 'linkedin.com/in/emilydavis' },
        { name: 'Robert Wilson', title: 'DevOps Manager', email: 'robert.wilson@' + company.toLowerCase().replace(/\s+/g, '') + '.com', linkedIn: 'linkedin.com/in/robertwilson' },
      ],
      linkedInProfiles: Math.floor(Math.random() * 200) + 20,
      emailPatterns: ['firstname.lastname@domain.com', 'first.last@domain.com', 'flastname@domain.com'],
      socialMediaPresence: {
        twitter: Math.floor(Math.random() * 50) + 5,
        github: Math.floor(Math.random() * 30) + 3,
        linkedIn: Math.floor(Math.random() * 100) + 10,
      },
    };
    
    setTimeout(() => {
      setResults(mockResults);
      setIsLoading(false);
    }, 1500);
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

          {isLoading && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Searching for employees...</p>
            </Card>
          )}

          {results && (
            <div className="space-y-6">
              <Card className="p-6 bg-card">
                <h2 className="text-xl font-bold mb-4">Enumeration Results for {results.company}</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Employees Found</p>
                    <p className="text-2xl font-bold">{results.employeesFound}</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">LinkedIn Profiles</p>
                    <p className="text-2xl font-bold">{results.linkedInProfiles}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Identified Employees</h3>
                <div className="space-y-3">
                  {results.employees.map((emp: any, idx: number) => (
                    <div key={idx} className="p-4 bg-background rounded-lg border border-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{emp.name}</p>
                          <p className="text-sm text-muted-foreground">{emp.title}</p>
                          <p className="text-sm text-blue-500 mt-1">{emp.email}</p>
                        </div>
                        <a href={`https://${emp.linkedIn}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                          View Profile
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Email Patterns</h3>
                <div className="space-y-2">
                  {results.emailPatterns.map((pattern: string, idx: number) => (
                    <div key={idx} className="p-3 bg-background rounded-lg text-sm font-mono">
                      {pattern}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Social Media Presence</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Twitter</p>
                    <p className="text-2xl font-bold">{results.socialMediaPresence.twitter}</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">GitHub</p>
                    <p className="text-2xl font-bold">{results.socialMediaPresence.github}</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">LinkedIn</p>
                    <p className="text-2xl font-bold">{results.socialMediaPresence.linkedIn}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
