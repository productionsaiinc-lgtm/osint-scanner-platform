import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Cpu, Search, Loader2, AlertCircle, Wifi, Server, MapPin, Shield, Globe, Lock, AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function ShodanSearch() {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [activeTab, setActiveTab] = useState<'shodan' | 'securitytrails'>('shodan');

  // Shodan device search
  const shodanQuery = trpc.osintTools.shodanDeviceSearch.useQuery(
    { query: query.trim() },
    { enabled: false }
  );

  // SecurityTrails domain lookup
  const stQuery = trpc.osintTools.securityTrails.useQuery(
    { domain: domain.trim() },
    { enabled: false }
  );

  const handleSearch = () => {
    if (!query.trim()) return;
    shodanQuery.refetch();
  };

  const handleDomainSearch = () => {
    if (!domain.trim()) return;
    stQuery.refetch();
  };

  const shodanData = shodanQuery.data;
  const stData = stQuery.data;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Cpu className="w-8 h-8" />
          Device & Domain Intelligence
        </h1>
        <p className="text-gray-400 mt-2">Combined Shodan device search and SecurityTrails domain reconnaissance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-cyan-500/30">
        <button
          onClick={() => setActiveTab('shodan')}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === 'shodan'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Cpu className="w-4 h-4 inline mr-2" />
          Shodan Devices
        </button>
        <button
          onClick={() => setActiveTab('securitytrails')}
          className={`px-4 py-2 font-mono text-sm uppercase transition-colors ${
            activeTab === 'securitytrails'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          SecurityTrails
        </button>
      </div>

      {/* ─── SHODAN TAB ─── */}
      {activeTab === 'shodan' && (
        <div className="space-y-4">
          <Card className="border-cyan-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-cyan-400">Shodan Query</CardTitle>
              <CardDescription className="text-gray-400">
                Search for internet-connected devices. Examples:{' '}
                <code className="text-cyan-300 text-xs">port:22 country:US</code>,{' '}
                <code className="text-cyan-300 text-xs">product:nginx</code>,{' '}
                <code className="text-cyan-300 text-xs">vuln:CVE-2021-44228</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="port:22, product:Apache, country:CA…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-cyan-500/30 bg-black/40 text-cyan-400 placeholder:text-gray-600"
                  disabled={shodanQuery.isFetching}
                />
                <Button
                  onClick={handleSearch}
                  disabled={shodanQuery.isFetching || !query.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {shodanQuery.isFetching ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching</>
                  ) : (
                    <><Search className="w-4 h-4 mr-2" />Search</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error / No Key */}
          {shodanData && !shodanData.success && (
            <Card className="border-red-500/30 bg-red-900/10">
              <CardContent className="pt-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 text-sm">{(shodanData as any).error}</p>
                  {(shodanData as any).needsKey && (
                    <p className="text-xs text-gray-400 mt-1">
                      Get a free API key at{' '}
                      <a href="https://shodan.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                        shodan.io
                      </a>{' '}
                      and set <code className="text-yellow-400">SHODAN_API_KEY</code> in your environment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {shodanData && shodanData.success && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Found <span className="text-cyan-400 font-bold">{(shodanData as any).total?.toLocaleString() || 0}</span> total results
                  {' · '}showing {((shodanData as any).matches || []).length}
                </p>
              </div>

              <div className="space-y-3">
                {((shodanData as any).matches || []).map((m: any, idx: number) => (
                  <Card key={idx} className="border-cyan-500/20 bg-black/40">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-cyan-400 font-bold">{m.ip}</span>
                            <Badge variant="outline" className="text-xs font-mono border-cyan-700 text-cyan-300">:{m.port}</Badge>
                            {m.transport && <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">{m.transport}</Badge>}
                          </div>
                          {m.product && (
                            <p className="text-sm text-white font-medium">
                              {m.product}{m.version ? ` v${m.version}` : ''}
                            </p>
                          )}
                          {m.os && <p className="text-xs text-gray-400">OS: {m.os}</p>}
                          {m.org && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Server className="w-3 h-3" /> {m.org}
                            </p>
                          )}
                          {(m.country || m.city) && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {[m.city, m.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                          {m.hostnames && m.hostnames.length > 0 && (
                            <p className="text-xs text-blue-400 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> {m.hostnames.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          {m.tags && m.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {m.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700">{tag}</Badge>
                              ))}
                            </div>
                          )}
                          {m.vulns && m.vulns.length > 0 && (
                            <div className="flex items-center gap-1 justify-end">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <span className="text-xs text-red-400 font-medium">{m.vulns.length} CVE{m.vulns.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {m.timestamp && (
                            <p className="text-xs text-gray-600">{new Date(m.timestamp).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      {m.vulns && m.vulns.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-800 flex flex-wrap gap-1">
                          {m.vulns.slice(0, 5).map((cve: string) => (
                            <a
                              key={cve}
                              href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded hover:underline flex items-center gap-1"
                            >
                              {cve} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      )}
                      {m.data && (
                        <pre className="mt-2 text-xs text-gray-500 bg-gray-900 p-2 rounded overflow-x-auto max-h-24 overflow-y-auto border border-gray-800">
                          {m.data}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!shodanData && !shodanQuery.isFetching && (
            <div className="text-center py-12 text-gray-500">
              <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Enter a query to search Shodan</p>
              <p className="text-xs mt-1">Requires <code className="text-yellow-400">SHODAN_API_KEY</code></p>
            </div>
          )}
        </div>
      )}

      {/* ─── SECURITYTRAILS TAB ─── */}
      {activeTab === 'securitytrails' && (
        <div className="space-y-4">
          <Card className="border-purple-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Shield className="w-5 h-5" /> SecurityTrails Domain Lookup
              </CardTitle>
              <CardDescription className="text-gray-400">
                DNS history, subdomains, and WHOIS data. Falls back to Google DNS if no API key is set.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDomainSearch()}
                  className="border-purple-500/30 bg-black/40 text-purple-400 placeholder:text-gray-600"
                  disabled={stQuery.isFetching}
                />
                <Button
                  onClick={handleDomainSearch}
                  disabled={stQuery.isFetching || !domain.trim()}
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                >
                  {stQuery.isFetching ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Looking up</>
                  ) : (
                    <><Search className="w-4 h-4 mr-2" />Lookup</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {stData && !stData.success && (
            <Card className="border-red-500/30 bg-red-900/10">
              <CardContent className="pt-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{(stData as any).error}</p>
              </CardContent>
            </Card>
          )}

          {stData && stData.success && (
            <div className="space-y-4">
              {/* Source badge */}
              <div className="flex items-center gap-2">
                <Badge className={`${(stData as any).source?.includes('SecurityTrails') ? 'bg-purple-900/50 text-purple-300 border-purple-700' : 'bg-yellow-900/50 text-yellow-300 border-yellow-700'}`}>
                  {(stData as any).source}
                </Badge>
                <span className="text-sm text-gray-400">Domain: <span className="text-white">{(stData as any).domain}</span></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DNS Records */}
                {((stData as any).dns || (stData as any).currentDns) && (
                  <Card className="border-blue-500/30 bg-black/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4" /> DNS Records
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {/* Google DNS format */}
                        {((stData as any).dns || []).map((r: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-blue-300 font-mono">{r.type}</span>
                            <span className="text-gray-300 font-mono truncate max-w-[200px]">{r.data}</span>
                          </div>
                        ))}
                        {/* SecurityTrails format */}
                        {Object.entries((stData as any).currentDns || {}).map(([type, recs]: [string, any]) => (
                          <div key={type}>
                            <p className="text-xs text-blue-300 font-medium">{type.toUpperCase()}</p>
                            {(Array.isArray(recs.values) ? recs.values : []).slice(0, 5).map((v: any, i: number) => (
                              <p key={i} className="text-xs text-gray-400 pl-2 font-mono">
                                {v.ip || v.value || v.hostname || JSON.stringify(v)}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Subdomains */}
                {(stData as any).subdomains !== undefined && (
                  <Card className="border-green-500/30 bg-black/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Subdomains
                        {(stData as any).subdomain_count > 0 && (
                          <Badge className="text-xs bg-green-900/50 text-green-300 border-green-700">
                            {(stData as any).subdomain_count} total
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(stData as any).subdomains.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          {(stData as any).source?.includes('SecurityTrails') ? 'No subdomains found' : 'Set SECURITYTRAILS_API_KEY for subdomain data'}
                        </p>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {(stData as any).subdomains.map((sub: string) => (
                            <p key={sub} className="text-xs font-mono text-green-300">
                              {sub}.{(stData as any).domain}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Alexa rank */}
              {(stData as any).alexa_rank && (
                <Card className="border-yellow-500/30 bg-black/40">
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-400">Alexa Rank</p>
                    <p className="text-2xl font-bold text-yellow-400">#{(stData as any).alexa_rank.toLocaleString()}</p>
                  </CardContent>
                </Card>
              )}

              {/* API Key info */}
              {!(stData as any).source?.includes('SecurityTrails') && (
                <div className="text-xs text-yellow-300 bg-yellow-900/20 border border-yellow-700/40 p-3 rounded">
                  ℹ️ For full subdomain history and WHOIS data, set <code className="text-white">SECURITYTRAILS_API_KEY</code> in environment variables.
                  Get a free key at{' '}
                  <a href="https://securitytrails.com" target="_blank" rel="noopener noreferrer" className="underline">securitytrails.com</a>
                </div>
              )}
            </div>
          )}

          {!stData && !stQuery.isFetching && (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Enter a domain to look up DNS & subdomains</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
