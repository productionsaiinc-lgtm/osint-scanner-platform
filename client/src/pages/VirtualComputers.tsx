import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Plus, Trash2, Play, Square, Settings } from "lucide-react";
import { toast } from "sonner";

export function VirtualComputers() {
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
    toast.success("Virtual machine deleted");
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
