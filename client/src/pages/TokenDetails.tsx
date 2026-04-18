import { useEffect, useState } from "react";
import { useParams, useRouter } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, MapPin, Globe, Smartphone, Monitor } from "lucide-react";

export function TokenDetails() {
  const [params] = useParams<{ tokenId: string }>();
  const [, navigate] = useRouter();
  const [copied, setCopied] = useState(false);

  // Fetch token details
  const tokenQuery = trpc.canaryToken.getById.useQuery(
    { tokenId: params.tokenId },
    { enabled: !!params.tokenId }
  );

  // Fetch trigger history
  const triggersQuery = trpc.canaryToken.getTriggerHistory.useQuery(
    { tokenId: params.tokenId, limit: 100 },
    { enabled: !!params.tokenId }
  );

  // Fetch trigger statistics
  const statsQuery = trpc.canaryToken.getTriggerStats.useQuery(
    { tokenId: params.tokenId },
    { enabled: !!params.tokenId }
  );

  const handleCopyUrl = () => {
    if (tokenQuery.data?.token?.tokenUrl) {
      navigator.clipboard.writeText(tokenQuery.data.token.tokenUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (tokenQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!tokenQuery.data?.token) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Token Not Found</h1>
          <Button onClick={() => navigate("/canary-tokens")}>
            Back to Canary Tokens
          </Button>
        </div>
      </div>
    );
  }

  const token = tokenQuery.data.token;
  const triggers = triggersQuery.data?.triggers || [];
  const stats = statsQuery.data;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/canary-tokens")}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold text-cyan-500 mb-2">{token.name}</h1>
          <p className="text-gray-400">{token.description}</p>
        </div>

        {/* Token Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Token Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                {token.tokenType?.replace("_", " ").toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  token.status === "Active"
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-red-500/20 text-red-400 border-red-500/50"
                }
              >
                {token.status}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-cyan-400">{token.triggerCount || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Token URL */}
        <Card className="bg-gray-900 border-cyan-500/30 mb-8">
          <CardHeader>
            <CardTitle>Token URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 bg-gray-800 p-3 rounded border border-gray-700">
              <code className="flex-1 text-sm text-cyan-400 break-all">
                {token.tokenUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="bg-gray-900 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-sm text-gray-400">Unique IPs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-cyan-400">
                  {stats.uniqueIPs || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-sm text-gray-400">Last Triggered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-cyan-400">
                  {stats.lastTriggered
                    ? new Date(stats.lastTriggered).toLocaleString()
                    : "Never"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trigger History */}
        <Card className="bg-gray-900 border-cyan-500/30">
          <CardHeader>
            <CardTitle>Trigger History</CardTitle>
          </CardHeader>
          <CardContent>
            {triggersQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
              </div>
            ) : triggers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No triggers recorded yet</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {triggers.map((trigger: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-800 p-4 rounded border border-gray-700 hover:border-cyan-500/50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-cyan-400" />
                        <code className="text-sm text-cyan-400">{trigger.ipAddress}</code>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(trigger.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {trigger.country && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-300">
                            {trigger.city}, {trigger.country}
                          </span>
                        </div>
                      )}

                      {trigger.browser && (
                        <div className="flex items-center gap-2">
                          <Monitor className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-300">
                            {trigger.browser} {trigger.browserVersion}
                          </span>
                        </div>
                      )}

                      {trigger.os && (
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-300">
                            {trigger.os} {trigger.osVersion}
                          </span>
                        </div>
                      )}

                      {trigger.deviceType && (
                        <div className="text-gray-400">
                          Device: <span className="text-gray-300 capitalize">{trigger.deviceType}</span>
                        </div>
                      )}
                    </div>

                    {trigger.referer && (
                      <div className="mt-2 text-xs text-gray-500">
                        Referer: {trigger.referer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
