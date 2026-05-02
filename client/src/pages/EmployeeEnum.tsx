import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Users, Mail, Linkedin, Github, Loader2, AlertCircle, Download } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function EmployeeEnum() {
  const [, setLocation] = useLocation();
  const [company, setCompany] = useState('');

  const mutation = trpc.osintTools.employeeEnum.useMutation({
    onError: (e) => toast.error(e.message || 'Enumeration failed'),
  });

  const results = mutation.data?.success ? mutation.data.data : null;

  const handleSearch = () => {
    if (!company.trim()) return;
    mutation.mutate({ company: company.trim() });
  };

  const exportCsv = () => {
    if (!results) return;
    const rows = [
      ['Name', 'Title', 'Email', 'LinkedIn', 'Source'],
      ...results.employees.map((e: any) => [e.name, e.title, e.email, e.linkedin, e.source]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `employees_${results.company}_${Date.now()}.csv`;
    a.click();
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
            <p className="text-muted-foreground mt-2">
              Enumerate employees and organisational structure from public sources (GitHub, Hunter.io)
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name or Domain</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter company name or domain…"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={mutation.isPending}
                  />
                  <Button onClick={handleSearch} disabled={mutation.isPending || !company.trim()}>
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {mutation.isPending && (
            <Card className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
              <p className="text-muted-foreground">Querying GitHub & Hunter.io…</p>
            </Card>
          )}

          {mutation.data && !mutation.data.success && (
            <Card className="p-4 border-red-500/30 bg-red-900/10">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{(mutation.data as any).error}</span>
              </div>
            </Card>
          )}

          {results && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="p-6 bg-card">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Results for {results.company}</h2>
                  <Button size="sm" variant="outline" onClick={exportCsv}>
                    <Download className="w-4 h-4 mr-1" /> Export CSV
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Employees Found</p>
                    <p className="text-2xl font-bold">{results.employees.length}</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Domain</p>
                    <p className="text-lg font-mono text-blue-400">{results.domain}</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Twitter</p>
                    <p className="text-2xl font-bold">{results.socialMediaPresence.twitter}</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">GitHub Profiles</p>
                    <p className="text-2xl font-bold">{results.socialMediaPresence.github}</p>
                  </div>
                </div>
                {results.errors && results.errors.length > 0 && (
                  <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
                    <p className="font-medium mb-1">API Warnings:</p>
                    {results.errors.map((e: string, i: number) => <p key={i}>• {e}</p>)}
                  </div>
                )}
              </Card>

              {/* Employees */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" /> Identified Employees
                </h3>
                <div className="space-y-3">
                  {results.employees.map((emp: any, idx: number) => (
                    <div key={idx} className="p-4 bg-background rounded-lg border border-border">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="font-semibold">{emp.name}</p>
                          <p className="text-sm text-muted-foreground">{emp.title}</p>
                          <div className="flex items-center gap-1 text-sm text-blue-400">
                            <Mail className="w-3 h-3" />
                            <span className="font-mono">{emp.email}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="text-xs">
                            {emp.source === 'GitHub' ? <Github className="w-3 h-3 mr-1" /> : <Linkedin className="w-3 h-3 mr-1" />}
                            {emp.source}
                          </Badge>
                          <a
                            href={`https://${emp.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <Linkedin className="w-3 h-3" /> View Profile
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Email Patterns */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" /> Discovered Email Patterns
                </h3>
                <div className="space-y-2">
                  {results.emailPatterns.map((pattern: string, idx: number) => (
                    <div key={idx} className="p-3 bg-background rounded-lg text-sm font-mono text-cyan-400">
                      {pattern}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Social Media */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Social Media Presence</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Twitter/X', value: results.socialMediaPresence.twitter, icon: '𝕏' },
                    { label: 'GitHub', value: results.socialMediaPresence.github, icon: '⌥' },
                    { label: 'LinkedIn', value: results.socialMediaPresence.linkedIn, icon: 'in' },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="p-4 bg-background rounded-lg text-center">
                      <p className="text-xl mb-1">{icon}</p>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="text-2xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
