import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Search, Loader2, AlertCircle, Users, Target, Zap } from 'lucide-react';

export function HunterSearch() {
  const [domain, setDomain] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!domain.trim()) return;
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Mail className="w-8 h-8" />
          Email Enumeration (Hunter.io)
        </h1>
        <p className="text-gray-400 mt-2">Find business email addresses associated with a domain</p>
      </div>

      {/* Search Section */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-cyan-400">Domain Email Search</CardTitle>
          <CardDescription>Enter a company domain to find associated email addresses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border-cyan-500/30 bg-black/40 text-cyan-400 placeholder:text-gray-600"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !domain.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isSearching ? (
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
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-cyan-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Total Emails</div>
            <div className="text-2xl font-bold text-cyan-400 mt-2">47</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Verified</div>
            <div className="text-2xl font-bold text-green-400 mt-2">43</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Departments</div>
            <div className="text-2xl font-bold text-yellow-400 mt-2">12</div>
          </CardContent>
        </Card>
      </div>

      {/* Email Results */}
      <Card className="border-purple-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Found Emails
          </CardTitle>
          <CardDescription>Business email addresses for example.com</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: 'John Smith', title: 'CEO', email: 'john@example.com', verified: true },
              { name: 'Jane Doe', title: 'CTO', email: 'jane@example.com', verified: true },
              { name: 'Mike Johnson', title: 'Sales Manager', email: 'mike@example.com', verified: true },
              { name: 'Sarah Williams', title: 'Marketing Director', email: 'sarah@example.com', verified: true },
              { name: 'Tom Brown', title: 'Developer', email: 'tom@example.com', verified: false },
            ].map((contact, idx) => (
              <div
                key={idx}
                className="p-3 border border-purple-500/30 rounded bg-purple-500/5 hover:bg-purple-500/10 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-purple-400">{contact.name}</div>
                    <div className="text-xs text-gray-400">{contact.title}</div>
                    <div className="text-xs font-mono text-purple-300 mt-1">{contact.email}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold ${
                      contact.verified
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {contact.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card className="border-green-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Department Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { dept: 'Engineering', count: 18, percent: 38 },
              { dept: 'Sales', count: 12, percent: 26 },
              { dept: 'Marketing', count: 9, percent: 19 },
              { dept: 'Operations', count: 5, percent: 11 },
              { dept: 'HR', count: 3, percent: 6 },
            ].map((dept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">{dept.dept}</span>
                  <span className="text-gray-400">{dept.count} emails ({dept.percent}%)</span>
                </div>
                <div className="w-full bg-green-500/10 rounded h-2 border border-green-500/30">
                  <div
                    className="bg-green-500 h-full rounded"
                    style={{ width: `${dept.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Pattern */}
      <Card className="border-pink-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-pink-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Email Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border border-pink-500/30 rounded bg-pink-500/5">
              <div className="text-xs text-gray-400">Most Common Format</div>
              <div className="text-sm font-mono text-pink-400 mt-1">{'{first}.{last}@example.com'}</div>
              <div className="text-xs text-gray-500 mt-1">Used by 85% of employees</div>
            </div>
            <div className="p-3 border border-pink-500/30 rounded bg-pink-500/5">
              <div className="text-xs text-gray-400">Alternative Formats</div>
              <div className="text-xs font-mono text-pink-300 mt-1 space-y-1">
                <div>{'{first}{last}@example.com'} - 10%</div>
                <div>{'{first}@example.com'} - 5%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert className="border-blue-500/30 bg-blue-500/10">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-400">
          Hunter.io aggregates publicly available business email addresses. Use for legitimate business intelligence and outreach only.
        </AlertDescription>
      </Alert>
    </div>
  );
}
