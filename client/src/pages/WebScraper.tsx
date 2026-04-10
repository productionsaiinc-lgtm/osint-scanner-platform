import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Loader2, AlertCircle } from 'lucide-react';

export default function WebScraper() {
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      // Simulated web scraping
      const mockResults = {
        url,
        selector: selector || 'all',
        itemsFound: Math.floor(Math.random() * 50) + 5,
        dataTypes: ['Text', 'Links', 'Images', 'Metadata'],
        extractedData: [
          { type: 'Title', value: 'Sample Page Title' },
          { type: 'Meta Description', value: 'Sample meta description content' },
          { type: 'Links Found', value: '42' },
          { type: 'Images Found', value: '18' },
        ],
        scrapedAt: new Date().toLocaleString(),
      };

      setResults(mockResults);
    } catch (err) {
      setError('Failed to scrape website');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">WEB SCRAPER</h1>
        <p className="text-gray-400">Extract data from websites with CSS selectors</p>
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
              className="bg-gray-800 border-cyan-500/30 text-white mt-2"
            />
          </div>

          <div>
            <label className="text-cyan-400 text-sm font-mono">CSS SELECTOR (Optional)</label>
            <Input
              placeholder=".article, #content, div.data"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="bg-gray-800 border-cyan-500/30 text-white mt-2"
            />
          </div>

          <Button
            onClick={handleScrape}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isLoading ? (
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
        <Card className="bg-gray-900 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400">SCRAPE RESULTS</CardTitle>
            <CardDescription className="text-gray-400">
              Scraped at {results.scrapedAt}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">ITEMS FOUND</p>
                <p className="text-2xl font-bold text-green-300">{results.itemsFound}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">DATA TYPES</p>
                <p className="text-lg font-bold text-green-300">{results.dataTypes.length}</p>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded border border-green-500/30">
              <p className="text-green-400 text-xs font-mono mb-3">EXTRACTED DATA</p>
              <div className="space-y-2">
                {results.extractedData.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-cyan-400">{item.type}:</span>
                    <span className="text-yellow-300">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
