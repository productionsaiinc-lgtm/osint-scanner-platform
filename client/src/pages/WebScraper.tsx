import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2, AlertCircle, Link, Image, FileText, Code, ExternalLink, Download } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function WebScraper() {
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');

  const mutation = trpc.osintTools.webScraper.useMutation({
    onError: (e) => toast.error(e.message || 'Scrape failed'),
  });

  const results = mutation.data?.success ? mutation.data.data : null;
  const error = mutation.data && !mutation.data.success ? (mutation.data as any).error : null;

  const handleScrape = () => {
    let target = url.trim();
    if (!target) { toast.error('Please enter a URL'); return; }
    if (!target.startsWith('http')) target = 'https://' + target;
    mutation.mutate({ url: target, selector: selector.trim() || undefined });
  };

  const exportJson = () => {
    if (!results) return;
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(results, null, 2));
    a.download = `scrape_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">WEB SCRAPER</h1>
        <p className="text-gray-400">Extract real data from websites — titles, links, images, metadata & technologies</p>
      </div>

      <Card className="bg-gray-900 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-pink-400 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Scraping Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-cyan-400 text-sm font-mono">TARGET URL</label>
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
              className="bg-gray-800 border-cyan-500/30 text-white mt-2"
              disabled={mutation.isPending}
            />
          </div>

          <div>
            <label className="text-cyan-400 text-sm font-mono">CSS SELECTOR (Optional — for reference)</label>
            <Input
              placeholder=".article, #content, div.data"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="bg-gray-800 border-cyan-500/30 text-white mt-2"
              disabled={mutation.isPending}
            />
          </div>

          <Button
            onClick={handleScrape}
            disabled={mutation.isPending || !url.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                SCRAPING...
              </>
            ) : (
              'START SCRAPE'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <Card className="bg-gray-900 border-green-500/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-400">SCRAPE RESULTS</CardTitle>
                  <CardDescription className="text-gray-400">
                    {results.url} · Status {results.statusCode} · {new Date(results.scrapedAt).toLocaleString()}
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={exportJson} className="border-green-600 text-green-400">
                  <Download className="w-4 h-4 mr-1" /> JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'LINKS', value: results.linksFound, icon: Link, color: 'text-blue-300' },
                  { label: 'IMAGES', value: results.imagesFound, icon: Image, color: 'text-purple-300' },
                  { label: 'WORDS', value: results.wordCount, icon: FileText, color: 'text-yellow-300' },
                  { label: 'SIZE', value: `${(results.contentLength / 1024).toFixed(1)}KB`, icon: Code, color: 'text-cyan-300' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-gray-800 p-3 rounded border border-green-500/20">
                    <div className="flex items-center gap-1 mb-1">
                      <Icon className={`w-3 h-3 ${color}`} />
                      <p className="text-green-400 text-xs font-mono">{label}</p>
                    </div>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Extracted Data */}
              <div className="bg-gray-800 p-4 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono mb-3">EXTRACTED DATA</p>
                <div className="space-y-2">
                  {results.extractedData.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm gap-4">
                      <span className="text-cyan-400 flex-shrink-0">{item.type}:</span>
                      <span className="text-yellow-300 text-right truncate max-w-xs">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          {results.technologies && results.technologies.length > 0 && (
            <Card className="bg-gray-900 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
                  <Code className="w-4 h-4" /> TECHNOLOGIES DETECTED
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.technologies.map((tech: string) => (
                    <Badge key={tech} className="bg-purple-900/50 text-purple-300 border border-purple-700">{tech}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Headings */}
          {results.headings && results.headings.length > 0 && (
            <Card className="bg-gray-900 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400 text-sm">PAGE HEADINGS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {results.headings.map((h: string, i: number) => (
                    <p key={i} className="text-sm text-gray-300 border-l-2 border-blue-500 pl-2">{h}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* External Links */}
          {results.externalLinks && results.externalLinks.length > 0 && (
            <Card className="bg-gray-900 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> EXTERNAL LINKS ({results.externalLinks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {results.externalLinks.map((link: string, i: number) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-400 hover:underline truncate font-mono"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
