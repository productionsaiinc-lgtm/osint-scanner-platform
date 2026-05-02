import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Plus, Trash2, Power, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function VirtualPhones() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPhone, setNewPhone] = useState({ name: "", osType: "android" as "android" | "ios", osVersion: "" });

  const utils = trpc.useUtils();

  const { data: phones = [], isLoading, refetch } = trpc.virtualPhones.list.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const createMutation = trpc.virtualPhones.create.useMutation({
    onSuccess: () => {
      toast.success("Virtual phone created!");
      setNewPhone({ name: "", osType: "android", osVersion: "" });
      setShowCreateForm(false);
      utils.virtualPhones.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to create virtual phone"),
  });

  const startMutation = trpc.virtualPhones.start.useMutation({
    onSuccess: (data) => {
      toast.success(`Phone started — ADB port ${data.adbPort}`);
      utils.virtualPhones.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to start phone"),
  });

  const stopMutation = trpc.virtualPhones.stop.useMutation({
    onSuccess: () => {
      toast.success("Phone stopped");
      utils.virtualPhones.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to stop phone"),
  });

  const deleteMutation = trpc.virtualPhones.delete.useMutation({
    onSuccess: () => {
      toast.success("Virtual phone deleted");
      utils.virtualPhones.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to delete phone"),
  });

  const handleCreate = () => {
    if (!newPhone.name.trim()) {
      toast.error("Please enter a phone name");
      return;
    }
    createMutation.mutate({
      name: newPhone.name.trim(),
      osType: newPhone.osType,
      osVersion: newPhone.osVersion || undefined,
    });
  };

  const handleToggle = (phone: (typeof phones)[0]) => {
    if (phone.status === "online") {
      stopMutation.mutate({ id: phone.id });
    } else {
      startMutation.mutate({ id: phone.id });
    }
  };

  const runningCount = phones.filter((p) => p.status === "online").length;
  const stoppedCount = phones.filter((p) => p.status !== "online").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <Smartphone className="w-8 h-8" />
            Virtual Phones
          </h1>
          <p className="text-gray-400 mt-2">Create and manage virtual mobile devices for testing</p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="ghost"
          size="sm"
          className="text-cyan-400 hover:text-cyan-300"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Phone Form */}
      {showCreateForm && (
        <Card className="border-purple-500/30 bg-black/40">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-bold text-purple-400">Create New Virtual Phone</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Phone Name</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 15 Pro"
                  value={newPhone.name}
                  onChange={(e) => setNewPhone({ ...newPhone, name: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Operating System</label>
                <select
                  value={newPhone.osType}
                  onChange={(e) => setNewPhone({ ...newPhone, osType: e.target.value as "android" | "ios" })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white"
                >
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">OS Version (optional)</label>
                <input
                  type="text"
                  placeholder={newPhone.osType === "android" ? "14.0" : "17.4"}
                  value={newPhone.osVersion}
                  onChange={(e) => setNewPhone({ ...newPhone, osVersion: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {createMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                ) : "Create Phone"}
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Button */}
      {!showCreateForm && (
        <Button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Virtual Phone
        </Button>
      )}

      {/* Phones List */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
            Virtual Devices ({phones.length})
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading virtual phones…
            </div>
          ) : phones.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No virtual phones yet. Create your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {phones.map((phone) => {
                const isOnline = phone.status === "online";
                const isToggling =
                  (startMutation.isPending && startMutation.variables?.id === phone.id) ||
                  (stopMutation.isPending && stopMutation.variables?.id === phone.id);
                const isDeleting =
                  deleteMutation.isPending && deleteMutation.variables?.id === phone.id;

                return (
                  <div
                    key={phone.id}
                    className="bg-black/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white">{phone.name}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              isOnline
                                ? "bg-green-500/20 text-green-400"
                                : phone.status === "busy"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {phone.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-400">
                          <div>
                            <p className="text-xs text-gray-500">OS</p>
                            <p className="text-cyan-400 capitalize">{phone.osType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Version</p>
                            <p className="text-cyan-400">{phone.osVersion || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone Number</p>
                            <p className="text-cyan-400 font-mono">{phone.phoneNumber || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">IMEI</p>
                            <p className="text-cyan-400 font-mono text-xs truncate">{phone.imei || "—"}</p>
                          </div>
                          {isOnline && phone.ipAddress && (
                            <div>
                              <p className="text-xs text-gray-500">IP Address</p>
                              <p className="text-green-400 font-mono text-xs">{phone.ipAddress}</p>
                            </div>
                          )}
                          {isOnline && phone.adbPort && (
                            <div>
                              <p className="text-xs text-gray-500">ADB Port</p>
                              <p className="text-green-400 font-mono text-xs">{phone.adbPort}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleToggle(phone)}
                          disabled={isToggling}
                          size="sm"
                          className={isOnline ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                        >
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteMutation.mutate({ id: phone.id })}
                          disabled={isDeleting}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Stats */}
      <Card className="border-yellow-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold text-yellow-400 mb-4">Device Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/50 rounded p-3 border border-yellow-500/20">
              <p className="text-xs text-gray-500 mb-1">Total Devices</p>
              <p className="text-2xl font-bold text-yellow-400">{phones.length}</p>
            </div>
            <div className="bg-black/50 rounded p-3 border border-yellow-500/20">
              <p className="text-xs text-gray-500 mb-1">Online</p>
              <p className="text-2xl font-bold text-green-400">{runningCount}</p>
            </div>
            <div className="bg-black/50 rounded p-3 border border-yellow-500/20">
              <p className="text-xs text-gray-500 mb-1">Offline</p>
              <p className="text-2xl font-bold text-gray-400">{stoppedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
