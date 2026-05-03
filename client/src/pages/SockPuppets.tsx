import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, Plus, Trash2, Edit2, Activity, Globe, Loader2, RefreshCw, X, Check, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const PLATFORMS = ["twitter", "instagram", "reddit", "facebook", "linkedin", "tiktok", "telegram"] as const;
type Platform = typeof PLATFORMS[number];

const PLATFORM_COLORS: Record<Platform, string> = {
  twitter: "text-sky-400",
  instagram: "text-pink-400",
  reddit: "text-orange-400",
  facebook: "text-blue-400",
  linkedin: "text-blue-300",
  tiktok: "text-purple-400",
  telegram: "text-cyan-400",
};

const STATUS_COLORS = {
  active: "bg-green-500/20 text-green-400",
  suspended: "bg-yellow-500/20 text-yellow-400",
  retired: "bg-gray-500/20 text-gray-400",
};

const ACTIVITY_TYPES = ["post", "comment", "follow", "like", "dm", "retweet", "share"] as const;

export function SockPuppets() {
  const utils = trpc.useUtils();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedPuppet, setSelectedPuppet] = useState<string | null>(null);
  const [activityContent, setActivityContent] = useState("");
  const [activityType, setActivityType] = useState<typeof ACTIVITY_TYPES[number]>("post");
  const [newPuppet, setNewPuppet] = useState({
    alias: "",
    platform: "twitter" as Platform,
    fullName: "",
    bio: "",
    notes: "",
  });

  const { data: puppets = [], isLoading, refetch } = trpc.sockPuppets.list.useQuery(undefined, { refetchInterval: 30000 });
  const { data: stats } = trpc.sockPuppets.stats.useQuery();
  const { data: activity = [] } = trpc.sockPuppets.getActivity.useQuery(
    { puppetId: selectedPuppet ?? "", limit: 20 },
    { enabled: !!selectedPuppet }
  );

  const createMutation = trpc.sockPuppets.create.useMutation({
    onSuccess: () => {
      toast.success("Sock puppet created!");
      setNewPuppet({ alias: "", platform: "twitter", fullName: "", bio: "", notes: "" });
      setShowCreate(false);
      utils.sockPuppets.list.invalidate();
      utils.sockPuppets.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.sockPuppets.delete.useMutation({
    onSuccess: () => {
      toast.success("Sock puppet deleted");
      utils.sockPuppets.list.invalidate();
      utils.sockPuppets.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStatusMutation = trpc.sockPuppets.update.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      utils.sockPuppets.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const logActivityMutation = trpc.sockPuppets.logActivity.useMutation({
    onSuccess: () => {
      toast.success("Activity logged");
      setActivityContent("");
      utils.sockPuppets.getActivity.invalidate();
      utils.sockPuppets.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!newPuppet.alias.trim()) { toast.error("Alias is required"); return; }
    createMutation.mutate({
      alias: newPuppet.alias.trim(),
      platform: newPuppet.platform,
      fullName: newPuppet.fullName || undefined,
      bio: newPuppet.bio || undefined,
      notes: newPuppet.notes || undefined,
    });
  };

  const handleLogActivity = () => {
    if (!selectedPuppet) return;
    logActivityMutation.mutate({
      puppetId: selectedPuppet,
      activityType,
      content: activityContent || undefined,
    });
  };

  const activePuppet = puppets.find((p) => p.puppetId === selectedPuppet);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Sock Puppets
          </h1>
          <p className="text-gray-400 mt-2">Manage fake personas for OSINT investigations and red team operations</p>
        </div>
        <Button onClick={() => refetch()} variant="ghost" size="sm" className="text-cyan-400">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-cyan-400" },
            { label: "Active", value: stats.active, color: "text-green-400" },
            { label: "Suspended", value: stats.suspended, color: "text-yellow-400" },
            { label: "Retired", value: stats.retired, color: "text-gray-400" },
            { label: "Total Posts", value: stats.totalPosts, color: "text-purple-400" },
          ].map((s) => (
            <Card key={s.label} className="border-cyan-500/20 bg-black/40">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <Card className="border-purple-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-purple-400 text-lg">Create Sock Puppet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Alias *</label>
                <input
                  type="text"
                  placeholder="e.g. john_doe_88"
                  value={newPuppet.alias}
                  onChange={(e) => setNewPuppet({ ...newPuppet, alias: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Platform *</label>
                <select
                  value={newPuppet.platform}
                  onChange={(e) => setNewPuppet({ ...newPuppet, platform: e.target.value as Platform })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white text-sm capitalize"
                >
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newPuppet.fullName}
                  onChange={(e) => setNewPuppet({ ...newPuppet, fullName: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Bio</label>
                <input
                  type="text"
                  placeholder="Short bio text"
                  value={newPuppet.bio}
                  onChange={(e) => setNewPuppet({ ...newPuppet, bio: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                <textarea
                  placeholder="Internal notes about this persona…"
                  value={newPuppet.notes}
                  onChange={(e) => setNewPuppet({ ...newPuppet, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Puppet
              </Button>
              <Button onClick={() => setShowCreate(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showCreate && (
        <Button
          onClick={() => setShowCreate(true)}
          className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Sock Puppet
        </Button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Puppets List */}
        <Card className="border-cyan-500/30 bg-black/40">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Personas ({puppets.length})</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading…
              </div>
            ) : puppets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No sock puppets yet. Create your first persona above.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {puppets.map((puppet) => (
                  <div
                    key={puppet.puppetId}
                    onClick={() => setSelectedPuppet(selectedPuppet === puppet.puppetId ? null : puppet.puppetId)}
                    className={`bg-black/50 border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPuppet === puppet.puppetId
                        ? "border-cyan-500/60 bg-cyan-500/5"
                        : "border-cyan-500/20 hover:border-cyan-500/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={puppet.avatarUrl}
                          alt={puppet.alias}
                          className="w-10 h-10 rounded-full border border-cyan-500/30 bg-gray-800"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(puppet.alias)}&background=0f172a&color=22d3ee`; }}
                        />
                        <div>
                          <p className="font-bold text-white">{puppet.alias}</p>
                          {puppet.fullName && <p className="text-xs text-gray-400">{puppet.fullName}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs capitalize ${PLATFORM_COLORS[puppet.platform as Platform]}`}>
                              <Globe className="w-3 h-3 inline mr-0.5" />{puppet.platform}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${STATUS_COLORS[puppet.status as keyof typeof STATUS_COLORS]}`}>
                              {puppet.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <div className="flex gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus = puppet.status === "active" ? "suspended" : "active";
                              updateStatusMutation.mutate({ puppetId: puppet.puppetId, status: nextStatus });
                            }}
                            size="sm"
                            variant="ghost"
                            className="text-yellow-400 hover:text-yellow-300 h-7 w-7 p-0"
                            title="Toggle status"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate({ puppetId: puppet.puppetId });
                            }}
                            disabled={deleteMutation.isPending && deleteMutation.variables?.puppetId === puppet.puppetId}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">{puppet.postCount} posts</p>
                      </div>
                    </div>

                    {puppet.bio && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{puppet.bio}</p>
                    )}

                    {puppet.persona && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {puppet.persona.interests?.map((interest: string) => (
                          <span key={interest} className="text-xs bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">
                            {interest}
                          </span>
                        ))}
                        {puppet.persona.location && (
                          <span className="text-xs text-gray-500">📍 {puppet.persona.location}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Panel */}
        <Card className="border-purple-500/30 bg-black/40">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {activePuppet ? `Activity — @${activePuppet.alias}` : "Activity Log"}
            </h2>

            {!selectedPuppet ? (
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Select a puppet to view and log activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Log new activity */}
                <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20 space-y-3">
                  <p className="text-sm font-semibold text-purple-300">Log New Activity</p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value as typeof ACTIVITY_TYPES[number])}
                      className="bg-black/60 border border-purple-500/30 rounded px-2 py-1.5 text-white text-sm capitalize"
                    >
                      {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Content (optional)"
                      value={activityContent}
                      onChange={(e) => setActivityContent(e.target.value)}
                      className="bg-black/60 border border-purple-500/30 rounded px-2 py-1.5 text-white text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleLogActivity}
                    disabled={logActivityMutation.isPending}
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {logActivityMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Log Activity
                  </Button>
                </div>

                {/* Activity list */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {activity.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 text-sm">No activity logged yet.</p>
                  ) : (
                    activity.map((a: any) => (
                      <div key={a.id} className="bg-black/50 rounded p-3 border border-purple-500/10 text-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-purple-300 capitalize font-semibold">{a.activityType}</span>
                          <span className="text-gray-500 text-xs">{new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                        {a.content && <p className="text-gray-300 text-xs mt-1">{a.content}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
