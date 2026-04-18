import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Trash2, Eye, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function CanaryTokens() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    tokenType: "page_view" as const,
  });

  const { data: tokenData, isLoading, refetch } = trpc.canaryToken.list.useQuery();
  const createMutation = trpc.canaryToken.create.useMutation({
    onSuccess: () => {
      toast.success("Canary token created!");
      setFormData({ name: "", email: "", description: "", tokenType: "page_view" });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create token: ${error.message}`);
    },
  });

  const deleteMutation = trpc.canaryToken.delete.useMutation({
    onSuccess: () => {
      toast.success("Canary token deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete token: ${error.message}`);
    },
  });

  const toggleMutation = trpc.canaryToken.toggle.useMutation({
    onSuccess: () => {
      toast.success("Token status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update token: ${error.message}`);
    },
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    await createMutation.mutateAsync(formData);
  };

  const handleDelete = (tokenId: string) => {
    if (confirm("Are you sure you want to delete this canary token?")) {
      deleteMutation.mutate({ tokenId });
    }
  };

  const handleToggle = (tokenId: string) => {
    toggleMutation.mutate({ tokenId });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-900 border-neon-cyan/30">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-400">Loading canary tokens...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neon-cyan">Canary Tokens</h1>
          <p className="text-gray-400 mt-2">Monitor unauthorized access to your site</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neon-cyan text-black hover:bg-neon-cyan/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Token
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-neon-cyan/30 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-neon-cyan">Create Canary Token</DialogTitle>
              <DialogDescription>
                Create a unique token to track unauthorized access to your site
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token Name</label>
                <Input
                  placeholder="e.g., Homepage Tracker"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <Input
                  placeholder="What is this token for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token Type</label>
                <select
                  value={formData.tokenType}
                  onChange={(e) => setFormData({ ...formData, tokenType: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="page_view">Page View</option>
                  <option value="resource">Resource Access</option>
                  <option value="form_submission">Form Submission</option>
                  <option value="api_call">API Call</option>
                </select>
              </div>

              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/90"
              >
                {createMutation.isPending ? "Creating..." : "Create Token"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      {tokenData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Total Tokens</p>
                <p className="text-3xl font-bold text-neon-cyan">{tokenData.stats.total_tokens}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-3xl font-bold text-green-400">{tokenData.stats.active_tokens}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Total Triggers</p>
                <p className="text-3xl font-bold text-orange-400">{tokenData.stats.total_triggers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Recent Activity</p>
                <p className="text-3xl font-bold text-red-400">{tokenData.stats.recent_activity}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tokens List */}
      <div className="space-y-3">
        {tokenData?.tokens && tokenData.tokens.length > 0 ? (
          tokenData.tokens.map((token) => (
            <Card key={token.id} className="bg-gray-900 border-neon-cyan/30 hover:border-neon-cyan/60 transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{token.name}</h3>
                      <Badge variant={token.status === "Active" ? "default" : "secondary"}>
                        {token.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {token.type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Token ID</p>
                        <p className="font-mono text-xs text-gray-300 break-all">{token.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-gray-300">{token.created}</p>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded p-3 mb-3 border border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">Token URL</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-neon-cyan break-all">{token.url}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(token.url)}
                          className="text-gray-400 hover:text-neon-cyan"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{token.triggers} triggers</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/canary-tokens/${token.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-neon-cyan"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggle(token.id)}
                      className="text-gray-400 hover:text-green-400"
                      title={token.status === "Active" ? "Disable" : "Enable"}
                    >
                      {token.status === "Active" ? "✓" : "○"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(token.id)}
                      className="text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-400">No canary tokens created yet</p>
              <p className="text-sm text-gray-500 mt-2">Create your first token to start monitoring</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-gray-900 border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="text-neon-cyan">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-white mb-1">1. Create a Token</p>
            <p>Click "Create Token" and provide a name and email address</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">2. Copy the URL</p>
            <p>Copy the generated token URL and embed it in your website or send it to potential targets</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">3. Receive Alerts</p>
            <p>When someone accesses the token URL, you'll receive an email with visitor details including IP, location, device, and browser</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">4. Monitor Activity</p>
            <p>View all triggers and visitor information in the token details page</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
