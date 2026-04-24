import { useState } from "react";
import { Link2, Copy, Check, Trash2, BarChart2, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShortenedLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
  expiresAt?: Date;
}

export function URLShortener() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateShortCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    setError(null);
    if (!url.trim()) {
      setError("Please enter a URL to shorten.");
      return;
    }
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    if (!isValidUrl(fullUrl)) {
      setError("Please enter a valid URL.");
      return;
    }
    if (customAlias && !/^[a-zA-Z0-9_-]{3,20}$/.test(customAlias)) {
      setError("Custom alias must be 3-20 characters: letters, numbers, hyphens, underscores only.");
      return;
    }

    const existingAlias = links.find(l => l.shortCode === customAlias);
    if (customAlias && existingAlias) {
      setError("That custom alias is already taken. Please choose another.");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const shortCode = customAlias || generateShortCode();
    const newLink: ShortenedLink = {
      id: Date.now().toString(),
      originalUrl: fullUrl,
      shortCode,
      shortUrl: `https://osint.sc/${shortCode}`,
      clicks: 0,
      createdAt: new Date(),
    };

    setLinks(prev => [newLink, ...prev]);
    setUrl("");
    setCustomAlias("");
    setLoading(false);
  };

  const handleCopy = (link: ShortenedLink) => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const simulateClick = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, clicks: l.clicks + 1 } : l));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
          <Link2 className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">URL Shortener</h1>
          <p className="text-sm text-gray-400">Create short, trackable links for OSINT operations</p>
        </div>
      </div>

      {/* Shorten form */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-base">Shorten a URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Destination URL</label>
            <Input
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleShorten()}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Custom Alias <span className="text-gray-600">(optional)</span></label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm whitespace-nowrap">osint.sc/</span>
              <Input
                placeholder="my-link"
                value={customAlias}
                onChange={e => setCustomAlias(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>
          )}

          <Button
            onClick={handleShorten}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Shortening...</span>
            ) : (
              <span className="flex items-center gap-2"><Link2 className="w-4 h-4" />Shorten URL</span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Links list */}
      {links.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Your Links</h2>
          {links.map(link => (
            <Card key={link.id} className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-cyan-400 font-mono font-semibold">{link.shortUrl}</span>
                      <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">
                        <BarChart2 className="w-3 h-3 mr-1" />{link.clicks} clicks
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-sm truncate">{link.originalUrl}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{link.createdAt.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => simulateClick(link.id)}
                      className="text-gray-400 hover:text-white"
                      title="Simulate click (test)"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(link)}
                      className="text-gray-400 hover:text-cyan-400"
                    >
                      {copiedId === link.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(link.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {links.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No links yet. Shorten your first URL above.</p>
        </div>
      )}
    </div>
  );
}
