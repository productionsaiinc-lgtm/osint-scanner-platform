import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function EmailVerification() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const verifyEmail = trpc.scans.verifyEmailAddress.useQuery(
    { email: email.trim() },
    { enabled: false }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    verifyEmail.refetch().then((result) => {
      setResults(result.data);
      setIsLoading(false);
    }).catch((error: any) => {
      setResults({ error: error.message });
      setIsLoading(false);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Verification
          </CardTitle>
          <CardDescription>
            Verify email addresses and check for valid mailbox existence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-green-400">Email Address</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-green-500/30 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-green-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-green-400">Verification Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <Alert className="border-red-500/30 bg-red-500/10">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  {results.error}
                </AlertDescription>
              </Alert>
            ) : results.success && results.results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 border rounded ${
                    results.results.valid
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-red-500/30 bg-red-500/5'
                  }`}>
                    <div className="text-xs text-gray-400">Status</div>
                    <div className={`text-sm font-mono font-bold mt-1 flex items-center gap-2 ${
                      results.results.valid ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {results.results.valid ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Valid
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Invalid
                        </>
                      )}
                    </div>
                  </div>
                  {results.results.domain && (
                    <div className="p-3 border border-green-500/30 rounded bg-green-500/5">
                      <div className="text-xs text-gray-400">Domain</div>
                      <div className="text-sm font-mono text-green-400 mt-1">
                        {results.results.domain}
                      </div>
                    </div>
                  )}
                </div>

                {results.results.mxRecords && results.results.mxRecords.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-green-400 font-bold">MX Records Found</div>
                    <div className="space-y-1">
                      {results.results.mxRecords.map((record: string, idx: number) => (
                        <div
                          key={idx}
                          className="text-xs p-2 rounded bg-green-500/10 border border-green-500/30 text-green-400 font-mono"
                        >
                          {record}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.results.smtpValid !== undefined && (
                  <div className={`p-3 border rounded ${
                    results.results.smtpValid
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-yellow-500/30 bg-yellow-500/5'
                  }`}>
                    <div className="text-xs text-gray-400">SMTP Validation</div>
                    <div className={`text-sm font-mono font-bold mt-1 ${
                      results.results.smtpValid ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {results.results.smtpValid ? 'Mailbox Exists' : 'Mailbox Not Verified'}
                    </div>
                  </div>
                )}
              </div>
            ) : results.success ? (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertDescription className="text-yellow-400">
                  Could not verify this email address.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
