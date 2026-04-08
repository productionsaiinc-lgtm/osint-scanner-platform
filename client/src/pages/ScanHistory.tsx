import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { History, Download, Trash2, Eye } from "lucide-react";

interface ScanRecord {
  id: string;
  type: string;
  target: string;
  timestamp: string;
  status: "completed" | "pending" | "error";
  results: number;
}

const mockScans: ScanRecord[] = [
  {
    id: "1",
    type: "Port Scan",
    target: "192.168.1.1",
    timestamp: "2024-04-08 14:32:15",
    status: "completed",
    results: 3,
  },
  {
    id: "2",
    type: "Domain OSINT",
    target: "example.com",
    timestamp: "2024-04-08 13:15:42",
    status: "completed",
    results: 8,
  },
  {
    id: "3",
    type: "Social Media Search",
    target: "john_doe",
    timestamp: "2024-04-08 12:01:33",
    status: "completed",
    results: 5,
  },
  {
    id: "4",
    type: "Traceroute",
    target: "google.com",
    timestamp: "2024-04-07 16:45:20",
    status: "completed",
    results: 12,
  },
];

export default function ScanHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [scans, setScans] = useState<ScanRecord[]>(mockScans);

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || scan.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    setScans(scans.filter((scan) => scan.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "status-complete";
      case "pending":
        return "status-pending";
      case "error":
        return "status-error";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <History className="h-8 w-8 text-neon-cyan-glow" />
        <h1 className="text-3xl font-bold neon-cyan-glow tracking-wider">SCAN HISTORY</h1>
      </div>

      {/* Search and Filter */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neon-pink-glow uppercase tracking-wider">
              Search Scans
            </label>
            <Input
              placeholder="Target, domain, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0a0e27] border-neon-cyan/30 text-neon-cyan placeholder:text-neon-cyan/40 focus:border-neon-cyan focus:ring-neon-cyan/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neon-pink-glow uppercase tracking-wider">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#0a0e27] border border-neon-cyan/30 text-neon-cyan rounded px-3 py-2 text-sm focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50"
            >
              <option value="all">All Types</option>
              <option value="Port Scan">Port Scan</option>
              <option value="Domain OSINT">Domain OSINT</option>
              <option value="Social Media Search">Social Media</option>
              <option value="Traceroute">Traceroute</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 h-10"
            >
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>
      </Card>

      {/* Scan Results Table */}
      <Card className="hud-frame p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neon-pink/30">
              <th className="text-left py-3 px-4 text-neon-pink-glow font-bold uppercase tracking-wider">Type</th>
              <th className="text-left py-3 px-4 text-neon-pink-glow font-bold uppercase tracking-wider">Target</th>
              <th className="text-left py-3 px-4 text-neon-pink-glow font-bold uppercase tracking-wider">Timestamp</th>
              <th className="text-center py-3 px-4 text-neon-pink-glow font-bold uppercase tracking-wider">Status</th>
              <th className="text-center py-3 px-4 text-neon-pink-glow font-bold uppercase tracking-wider">Results</th>
              <th className="text-center py-3 px-4 text-neon-pink-glow font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredScans.map((scan) => (
              <tr key={scan.id} className="border-b border-neon-cyan/20 hover:bg-neon-cyan/5 transition-colors">
                <td className="py-3 px-4 text-foreground">{scan.type}</td>
                <td className="py-3 px-4 text-neon-cyan font-mono text-xs">{scan.target}</td>
                <td className="py-3 px-4 text-foreground/70 text-xs">{scan.timestamp}</td>
                <td className={`py-3 px-4 text-center font-bold ${getStatusColor(scan.status)}`}>
                  {scan.status.toUpperCase()}
                </td>
                <td className="py-3 px-4 text-center text-neon-green">{scan.results}</td>
                <td className="py-3 px-4 text-center space-x-2">
                  <button className="text-neon-cyan hover:text-neon-cyan/80 transition-colors" title="View Details">
                    <Eye className="h-4 w-4 inline" />
                  </button>
                  <button className="text-neon-pink hover:text-neon-pink/80 transition-colors" title="Delete">
                    <Trash2
                      className="h-4 w-4 inline cursor-pointer"
                      onClick={() => handleDelete(scan.id)}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredScans.length === 0 && (
          <div className="text-center py-8 text-foreground/60">
            <p>No scans found matching your criteria.</p>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hud-frame p-6 text-center">
          <div className="text-2xl font-bold neon-pink-glow mb-2">{scans.length}</div>
          <div className="text-xs text-foreground/70 uppercase tracking-wider">Total Scans</div>
        </Card>
        <Card className="hud-frame p-6 text-center">
          <div className="text-2xl font-bold neon-cyan-glow mb-2">
            {scans.filter((s) => s.status === "completed").length}
          </div>
          <div className="text-xs text-foreground/70 uppercase tracking-wider">Completed</div>
        </Card>
        <Card className="hud-frame p-6 text-center">
          <div className="text-2xl font-bold neon-green mb-2">
            {scans.reduce((sum, s) => sum + s.results, 0)}
          </div>
          <div className="text-xs text-foreground/70 uppercase tracking-wider">Total Results</div>
        </Card>
        <Card className="hud-frame p-6 text-center">
          <div className="text-2xl font-bold neon-purple-glow mb-2">
            {new Set(scans.map((s) => s.type)).size}
          </div>
          <div className="text-xs text-foreground/70 uppercase tracking-wider">Scan Types</div>
        </Card>
      </div>
    </div>
  );
}
