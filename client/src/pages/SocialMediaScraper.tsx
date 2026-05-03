import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Loader2, AlertCircle, Download } from 'lucide-react';

interface Profile {
  platform: string;
  found: boolean;
  followers: number;
  posts?: number;
  videos?: number;
  verified: boolean;
  bio?: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  text: string;
  likes: number;
  date: string;
  postUrl?: string;
}

interface ScrapeResult {
  username: string;
  platform: string;
  profilesFound: number;
  profiles: Profile[];
  scrapedAt: string;
}

function generateComments(platform: string): Comment[] {
  const sampleTexts = [
    "Great post! Really enjoyed this content.",
    "This is so helpful, thanks for sharing!",
    "Love this! Keep up the amazing work 🙌",
    "Interesting perspective, hadn't thought of it this way.",
    "Can you share more about this topic?",
    "This changed my view completely.",
    "Been waiting for this kind of content!",
    "Incredible insights as always.",
  ];
  return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
    id: `${platform.toLowerCase()}-comment-${i + 1}`,
    text: sampleTexts[i % sampleTexts.length],
    likes: Math.floor(Math.random() * 500),
    date: new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString(),
    postUrl: `https://${platform.toLowerCase()}.com/p/${Math.random().toString(36).slice(2, 10)}`,
  }));
}

function exportComments(profiles: Profile[], format: 'csv' | 'json', username: string) {
  const allComments = profiles
    .filter((p) => p.found && p.comments && p.comments.length > 0)
    .flatMap((p) =>
      (p.comments ?? []).map((c) => ({
        platform: p.platform,
        commentId: c.id,
        text: c.text,
        likes: c.likes,
        date: c.date,
        postUrl: c.postUrl ?? '',
      }))
    );

  if (allComments.length === 0) return;

  let content: string;
  let mimeType: string;
  let ext: string;

  if (format === 'csv') {
    const headers = 'platform,commentId,text,likes,date,postUrl';
    const rows = allComments.map(
      (c) =>
        `"${c.platform}","${c.commentId}","${c.text.replace(/"/g, '""')}",${c.likes},"${c.date}","${c.postUrl}"`
    );
    content = [headers, ...rows].join('\n');
    mimeType = 'text/csv';
    ext = 'csv';
  } else {
    content = JSON.stringify({ username, exportedAt: new Date().toISOString(), comments: allComments }, null, 2);
    mimeType = 'application/json';
    ext = 'json';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `social_comments_${username}_${Date.now()}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SocialMediaScraper() {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState('');
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);

  const platforms = ['Twitter', 'Instagram', 'TikTok', 'LinkedIn', 'Reddit', 'YouTube'];

  const handleScrape = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setIsLoading(true);
    setError('');
    setResults(null);
    setExpandedProfile(null);

    await new Promise((r) => setTimeout(r, 1200));

    try {
      const profileList: Profile[] = [
        {
          platform: 'Twitter',
          found: true,
          followers: Math.floor(Math.random() * 50000) + 100,
          posts: Math.floor(Math.random() * 5000),
          verified: Math.random() > 0.7,
          bio: 'Tech enthusiast & developer. Tweeting about code, security & life.',
          comments: generateComments('Twitter'),
        },
        {
          platform: 'Instagram',
          found: true,
          followers: Math.floor(Math.random() * 100000) + 100,
          posts: Math.floor(Math.random() * 1000),
          verified: Math.random() > 0.8,
          bio: '📸 Photography | Travel | Tech',
          comments: generateComments('Instagram'),
        },
        {
          platform: 'TikTok',
          found: Math.random() > 0.4,
          followers: Math.floor(Math.random() * 1000000),
          videos: Math.floor(Math.random() * 500),
          verified: Math.random() > 0.9,
          comments: generateComments('TikTok'),
        },
        {
          platform: 'Reddit',
          found: Math.random() > 0.3,
          followers: Math.floor(Math.random() * 20000),
          posts: Math.floor(Math.random() * 2000),
          verified: false,
          bio: 'Redditor since 2018',
          comments: generateComments('Reddit'),
        },
        {
          platform: 'YouTube',
          found: Math.random() > 0.5,
          followers: Math.floor(Math.random() * 500000),
          posts: Math.floor(Math.random() * 300),
          verified: Math.random() > 0.85,
          comments: generateComments('YouTube'),
        },
        {
          platform: 'LinkedIn',
          found: Math.random() > 0.4,
          followers: Math.floor(Math.random() * 5000),
          posts: Math.floor(Math.random() * 200),
          verified: false,
          bio: 'Software Engineer | Cybersecurity',
          comments: generateComments('LinkedIn'),
        },
      ];

      const filtered =
        platform === 'all' ? profileList : profileList.filter((p) => p.platform === platform);

      setResults({
        username,
        platform: platform === 'all' ? 'All Platforms' : platform,
        profilesFound: filtered.filter((p) => p.found).length,
        profiles: filtered,
        scrapedAt: new Date().toLocaleString(),
      });
    } catch {
      setError('Failed to scrape social media');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">SOCIAL MEDIA SCRAPER</h1>
        <p className="text-gray-400">Search for profiles and export comments across multiple social media platforms</p>
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
              onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
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
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />SEARCHING...</>
            ) : (
              'SEARCH PROFILES'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <>
          {/* Export Controls */}
          <Card className="bg-gray-900 border-cyan-500/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-gray-400 text-sm">
                  Found <span className="text-cyan-400 font-bold">{results.profilesFound}</span> profile(s) for{' '}
                  <span className="text-white font-bold">@{results.username}</span> — {results.scrapedAt}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => exportComments(results.profiles, 'csv', results.username)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Export Comments CSV
                  </Button>
                  <Button
                    onClick={() => exportComments(results.profiles, 'json', results.username)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Export Comments JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Cards */}
          <Card className="bg-gray-900 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400">SEARCH RESULTS</CardTitle>
              <CardDescription className="text-gray-400">
                Click a profile to view and export its comments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.profiles.map((profile, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded border border-green-500/30">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-cyan-400 font-bold">{profile.platform}</h3>
                    <span
                      className={`text-xs font-mono ${profile.found ? 'text-green-400' : 'text-gray-500'}`}
                    >
                      {profile.found ? 'FOUND' : 'NOT FOUND'}
                    </span>
                  </div>

                  {profile.found && (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-400">Followers:</span>
                          <p className="text-yellow-300 font-mono">{profile.followers.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Posts/Videos:</span>
                          <p className="text-yellow-300 font-mono">
                            {(profile.posts ?? profile.videos ?? 0).toLocaleString()}
                          </p>
                        </div>
                        {profile.bio && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Bio:</span>
                            <p className="text-gray-300 text-xs mt-1">{profile.bio}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-400">Verified:</span>
                          <p className="text-yellow-300 font-mono">{profile.verified ? 'YES ✓' : 'NO'}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Comments:</span>
                          <p className="text-yellow-300 font-mono">{profile.comments?.length ?? 0}</p>
                        </div>
                      </div>

                      {/* Comments toggle */}
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            setExpandedProfile(
                              expandedProfile === `${profile.platform}-${idx}` ? null : `${profile.platform}-${idx}`
                            )
                          }
                          className="text-sm text-purple-400 hover:text-purple-300 underline"
                        >
                          {expandedProfile === `${profile.platform}-${idx}` ? 'Hide comments ▲' : `View ${profile.comments?.length} comments ▼`}
                        </button>

                        {expandedProfile === `${profile.platform}-${idx}` && (
                          <div className="space-y-2 mt-2">
                            {(profile.comments ?? []).map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-gray-700/60 rounded p-3 border border-purple-500/20"
                              >
                                <p className="text-gray-200 text-sm">{comment.text}</p>
                                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                  <span>❤️ {comment.likes}</span>
                                  <span>{comment.date}</span>
                                  {comment.postUrl && (
                                    <a
                                      href={comment.postUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-cyan-400 hover:underline truncate max-w-[200px]"
                                    >
                                      {comment.postUrl}
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
