import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Loader2, AlertCircle } from 'lucide-react';

export default function SocialMediaScraper() {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const platforms = ['Twitter', 'Instagram', 'TikTok', 'LinkedIn', 'Reddit', 'YouTube'];

  const handleScrape = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const mockResults = {
        username,
        platform: platform === 'all' ? 'All Platforms' : platform,
        profilesFound: platform === 'all' ? Math.floor(Math.random() * 6) + 1 : 1,
        profiles: [
          {
            platform: 'Twitter',
            found: true,
            followers: Math.floor(Math.random() * 50000) + 100,
            posts: Math.floor(Math.random() * 5000),
            verified: Math.random() > 0.7,
            bio: 'Sample bio text',
          },
          {
            platform: 'Instagram',
            found: true,
            followers: Math.floor(Math.random() * 100000) + 100,
            posts: Math.floor(Math.random() * 1000),
            verified: Math.random() > 0.8,
            bio: 'Instagram bio',
          },
          {
            platform: 'TikTok',
            found: Math.random() > 0.5,
            followers: Math.floor(Math.random() * 1000000),
            videos: Math.floor(Math.random() * 500),
            verified: Math.random() > 0.9,
          },
        ],
        scrapedAt: new Date().toLocaleString(),
      };

      setResults(mockResults);
    } catch (err) {
      setError('Failed to scrape social media');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">SOCIAL MEDIA SCRAPER</h1>
        <p className="text-gray-400">Search for profiles across multiple social media platforms</p>
      </div>

      <Card className="bg-gray-900 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-pink-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Profile Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-cyan-400 text-sm font-mono">USERNAME</label>
            <Input
              placeholder="Enter username to search"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-cyan-500/30 text-white mt-2"
            />
          </div>

          <div>
            <label className="text-cyan-400 text-sm font-mono">PLATFORM</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-gray-800 border border-cyan-500/30 text-white p-2 rounded mt-2"
            >
              <option value="all">All Platforms</option>
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleScrape}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                SEARCHING...
              </>
            ) : (
              'SEARCH PROFILES'
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
            <CardTitle className="text-green-400">SEARCH RESULTS</CardTitle>
            <CardDescription className="text-gray-400">
              Found {results.profilesFound} profile(s) - Searched at {results.scrapedAt}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.profiles.map((profile: any, idx: number) => (
              <div key={idx} className="bg-gray-800 p-4 rounded border border-green-500/30">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-cyan-400 font-bold">{profile.platform}</h3>
                  <span className={`text-xs font-mono ${profile.found ? 'text-green-400' : 'text-gray-400'}`}>
                    {profile.found ? 'FOUND' : 'NOT FOUND'}
                  </span>
                </div>

                {profile.found && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Followers:</span>
                      <p className="text-yellow-300 font-mono">{profile.followers.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Posts/Videos:</span>
                      <p className="text-yellow-300 font-mono">{(profile.posts || profile.videos).toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Verified:</span>
                      <p className="text-yellow-300 font-mono">{profile.verified ? 'YES' : 'NO'}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
