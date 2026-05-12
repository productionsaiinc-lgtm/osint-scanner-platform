import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Plus, Trash2, Play, Square, Settings, Terminal, Wifi, HardDrive } from "lucide-react";
import { toast } from "sonner";

export function VirtualComputers() {
  const [selectedVmId, setSelectedVmId] = useState(1);
  const [vms, setVms] = useState([
    {
      id: 1,
      name: "Ubuntu 22.04 LTS",
      os: "Linux",
      cpu: 4,
      ram: 8,
      storage: 100,
      status: "running",
      ip: "192.168.1.100",
      created: "2026-04-15",
    },
    {
      id: 2,
      name: "Windows 11 Pro",
      os: "Windows",
      cpu: 8,
      ram: 16,
      storage: 250,
      status: "stopped",
      ip: "192.168.1.101",
      created: "2026-04-10",
    },
    {
      id: 3,
      name: "Kali Linux",
      os: "Linux",
      cpu: 6,
      ram: 12,
      storage: 150,
      status: "running",
      ip: "192.168.1.102",
      created: "2026-04-05",
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVM, setNewVM] = useState({
    name: "",
    os: "Linux",
    cpu: 4,
    ram: 8,
    storage: 100,
  });

  const createVM = () => {
    if (!newVM.name.trim()) {
      toast.error("Please enter a VM name");
      return;
    }

    const vm = {
      id: vms.length + 1,
      ...newVM,
      status: "stopped",
      ip: `192.168.1.${100 + vms.length}`,
      created: new Date().toISOString().split("T")[0],
    };

    setVms([...vms, vm]);
    setSelectedVmId(vm.id);
    setNewVM({ name: "", os: "Linux", cpu: 4, ram: 8, storage: 100 });
    setShowCreateForm(false);
    toast.success("Virtual machine created!");
  };

  const toggleVM = (id: number) => {
    setVms(
      vms.map((vm) =>
        vm.id === id
          ? { ...vm, status: vm.status === "running" ? "stopped" : "running" }
          : vm
      )
    );
    const vm = vms.find((v) => v.id === id);
    toast.success(`VM ${vm?.status === "running" ? "stopped" : "started"}`);
  };

  const deleteVM = (id: number) => {
    setVms(vms.filter((vm) => vm.id !== id));
    if (selectedVmId === id) setSelectedVmId(vms.find((vm) => vm.id !== id)?.id || 0);
    toast.success("Virtual machine deleted");
  };

  const selectedVm = vms.find((vm) => vm.id === selectedVmId) || vms[0];

  const desktopTheme = (os: string) => {
    if (os === "Windows") return "from-blue-950 via-sky-900 to-slate-950";
    if (os === "macOS") return "from-slate-900 via-purple-950 to-zinc-950";
    return "from-zinc-950 via-emerald-950 to-slate-950";
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Monitor className="w-8 h-8" />
          Virtual Computers
        </h1>
        <p className="text-gray-400 mt-2">Create and manage virtual machines for pentesting</p>
      </div>

      {/* Create VM Form */}
      {showCreateForm && (
        <Card className="border-purple-500/30 bg-black/40">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-bold text-purple-400">Create New VM</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">VM Name</label>
                <input
                  type="text"
                  placeholder="Ubuntu Server"
                  value={newVM.name}
                  onChange={(e) => setNewVM({ ...newVM, name: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Operating System</label>
                <select
                  value={newVM.os}
                  onChange={(e) => setNewVM({ ...newVM, os: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white"
                >
                  <option>Linux</option>
                  <option>Windows</option>
                  <option>macOS</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">CPU Cores</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={newVM.cpu}
                  onChange={(e) => setNewVM({ ...newVM, cpu: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">RAM (GB)</label>
                <input
                  type="number"
                  min="1"
                  max="128"
                  value={newVM.ram}
                  onChange={(e) => setNewVM({ ...newVM, ram: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Storage (GB)</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={newVM.storage}
                  onChange={(e) => setNewVM({ ...newVM, storage: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createVM} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Create VM
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
          Create New Virtual Machine
        </Button>
      )}

      {/* Graphical VM Console */}
      {selectedVm && (
        <Card className="border-cyan-500/30 bg-black/40 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-cyan-500/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <div>
                  <h2 className="text-sm font-bold text-cyan-300">Graphical Console</h2>
                  <p className="text-xs text-gray-500">{selectedVm.name} • {selectedVm.status}</p>
                </div>
              </div>
              <select
                value={selectedVm.id}
                onChange={(e) => setSelectedVmId(Number(e.target.value))}
                className="rounded bg-black/60 border border-cyan-500/30 text-cyan-200 px-3 py-2 text-xs"
              >
                {vms.map((vm) => <option key={vm.id} value={vm.id}>{vm.name}</option>)}
              </select>
            </div>
            <div className="p-4">
              <div className="mx-auto max-w-5xl rounded-lg border border-cyan-500/30 bg-zinc-950 shadow-2xl shadow-cyan-950/50">
                <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-3 text-xs text-gray-400">{selectedVm.ip}</span>
                </div>
                <div className={`relative aspect-video overflow-hidden rounded-b-lg bg-gradient-to-br ${desktopTheme(selectedVm.os)}`}>
                  {selectedVm.status !== "running" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-gray-400">
                      <Square className="mb-3 h-10 w-10" />
                      <p className="text-sm font-medium">Virtual machine is stopped</p>
                    </div>
                  ) : (
                    <>
                      <div className="absolute left-4 top-4 grid grid-cols-1 gap-3">
                        {["Terminal", "Files", "Browser"].map((label, idx) => (
                          <div key={label} className="flex w-20 flex-col items-center gap-1 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/10">
                              {idx === 0 ? <Terminal className="h-5 w-5 text-cyan-200" /> : idx === 1 ? <HardDrive className="h-5 w-5 text-cyan-200" /> : <Wifi className="h-5 w-5 text-cyan-200" />}
                            </div>
                            <span className="text-[11px] text-white/80">{label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="absolute left-[18%] top-[16%] w-[58%] rounded-md border border-cyan-400/20 bg-black/75 shadow-xl">
                        <div className="border-b border-cyan-400/20 px-3 py-2 text-xs text-cyan-300">terminal — {selectedVm.name}</div>
                        <div className="space-y-1 p-3 font-mono text-xs text-green-300">
                          <p>$ hostname</p>
                          <p className="text-cyan-200">{selectedVm.name.toLowerCase().replace(/\s+/g, "-")}</p>
                          <p>$ ip addr show</p>
                          <p className="text-cyan-200">inet {selectedVm.ip}/24</p>
                          <p>$ resources</p>
                          <p className="text-cyan-200">{selectedVm.cpu} vCPU • {selectedVm.ram} GB RAM • {selectedVm.storage} GB disk</p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-white/10 bg-black/45 px-4 py-2 text-xs text-white/80">
                        <span>{selectedVm.os} desktop</span>
                        <span>{new Date().toLocaleTimeString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VMs List */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Virtual Machines ({vms.length})</h2>
          <div className="space-y-3">
            {vms.map((vm) => (
              <div
                key={vm.id}
                className="bg-black/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-white">{vm.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          vm.status === "running"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {vm.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-400">
                      <div>
                        <p className="text-xs text-gray-500">OS</p>
                        <p className="text-cyan-400">{vm.os}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CPU</p>
                        <p className="text-cyan-400">{vm.cpu} cores</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">RAM</p>
                        <p className="text-cyan-400">{vm.ram} GB</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">IP</p>
                        <p className="text-cyan-400 font-mono">{vm.ip}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleVM(vm.id)}
                      size="sm"
                      className={
                        vm.status === "running"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }
                    >
                      {vm.status === "running" ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline" className="text-blue-400">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => deleteVM(vm.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card className="border-yellow-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold text-yellow-400 mb-4">Total Resources Used</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/50 rounded p-3 border border-yellow-500/20">
              <p className="text-xs text-gray-500 mb-1">CPU Cores</p>
              <p className="text-2xl font-bold text-yellow-400">
                {vms.reduce((sum, vm) => sum + vm.cpu, 0)}
              </p>
            </div>
            <div className="bg-black/50 rounded p-3 border border-yellow-500/20">
              <p className="text-xs text-gray-500 mb-1">RAM (GB)</p>
              <p className="text-2xl font-bold text-yellow-400">
                {vms.reduce((sum, vm) => sum + vm.ram, 0)}
              </p>
            </div>
            <div className="bg-black/50 rounded p-3 border border-yellow-500/20">
              <p className="text-xs text-gray-500 mb-1">Storage (GB)</p>
              <p className="text-2xl font-bold text-yellow-400">
                {vms.reduce((sum, vm) => sum + vm.storage, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
