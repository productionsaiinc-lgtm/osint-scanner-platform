import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Plus, Trash2, Power } from "lucide-react";
import { toast } from "sonner";

export function VirtualPhones() {
  const [phones, setPhones] = useState([
    {
      id: 1,
      name: "iPhone 14 Pro",
      os: "iOS",
      version: "17.4",
      status: "running",
      imei: "123456789012345",
      phone: "+1-555-0101",
      created: "2026-04-18",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      os: "Android",
      version: "14",
      status: "running",
      imei: "987654321098765",
      phone: "+1-555-0102",
      created: "2026-04-16",
    },
    {
      id: 3,
      name: "Google Pixel 8",
      os: "Android",
      version: "14",
      status: "stopped",
      imei: "555666777888999",
      phone: "+1-555-0103",
      created: "2026-04-12",
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPhone, setNewPhone] = useState({
    name: "",
    os: "Android",
    version: "14",
  });

  const createPhone = () => {
    if (!newPhone.name.trim()) {
      toast.error("Please enter a phone name");
      return;
    }

    const phone = {
      id: phones.length + 1,
      ...newPhone,
      status: "stopped",
      imei: Math.random().toString().slice(2, 17),
      phone: `+1-555-${String(100 + phones.length).padStart(4, "0")}`,
      created: new Date().toISOString().split("T")[0],
    };

    setPhones([...phones, phone]);
    setNewPhone({ name: "", os: "Android", version: "14" });
    setShowCreateForm(false);
    toast.success("Virtual phone created!");
  };

  const togglePhone = (id: number) => {
    setPhones(
      phones.map((phone) =>
        phone.id === id
          ? { ...phone, status: phone.status === "running" ? "stopped" : "running" }
          : phone
      )
    );
    const phone = phones.find((p) => p.id === id);
    toast.success(`Phone ${phone?.status === "running" ? "stopped" : "started"}`);
  };

  const deletePhone = (id: number) => {
    setPhones(phones.filter((phone) => phone.id !== id));
    toast.success("Virtual phone deleted");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Smartphone className="w-8 h-8" />
          Virtual Phones
        </h1>
        <p className="text-gray-400 mt-2">Create and manage virtual mobile devices for testing</p>
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
                  placeholder="iPhone 14 Pro"
                  value={newPhone.name}
                  onChange={(e) => setNewPhone({ ...newPhone, name: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Operating System</label>
                <select
                  value={newPhone.os}
                  onChange={(e) => setNewPhone({ ...newPhone, os: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white"
                >
                  <option>iOS</option>
                  <option>Android</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">OS Version</label>
                <input
                  type="text"
                  placeholder="14.0"
                  value={newPhone.version}
                  onChange={(e) => setNewPhone({ ...newPhone, version: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createPhone} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Create Phone
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
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Virtual Devices ({phones.length})</h2>
          <div className="space-y-3">
            {phones.map((phone) => (
              <div
                key={phone.id}
                className="bg-black/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-white">{phone.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          phone.status === "running"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {phone.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-400">
                      <div>
                        <p className="text-xs text-gray-500">OS</p>
                        <p className="text-cyan-400">{phone.os}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Version</p>
                        <p className="text-cyan-400">{phone.version}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="text-cyan-400 font-mono">{phone.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">IMEI</p>
                        <p className="text-cyan-400 font-mono text-xs">{phone.imei}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => togglePhone(phone.id)}
                      size="sm"
                      className={
                        phone.status === "running"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => deletePhone(phone.id)}
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
              <p className="text-xs text-gray-500 mb-1">Running</p>
              <p className="text-2xl font-bold text-green-400">
                {phones.filter((p) => p.status === "running").length}
              </p>
            </div>
            <div className="bg-black/50 rounded p-3 border border-yellow-500/20">
              <p className="text-xs text-gray-500 mb-1">Stopped</p>
              <p className="text-2xl font-bold text-gray-400">
                {phones.filter((p) => p.status === "stopped").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
