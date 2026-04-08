import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Search, Loader2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ScanHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "network" | "domain" | "social">("all");
  const [selectedScan, setSelectedScan] = useState<any>(null);

  const { data: scans, isLoading } = trpc.scans.list.useQuery({ limit: 100 });

  const filteredScans = scans?.filter((scan: any) => {
    const matchesSearch = scan.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || scan.scanType === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-[#39ff14]";
      case "running":
        return "text-[#00f5ff]";
      case "error":
        return "text-[#ff006e]";
      case "pending":
        return "text-[#b537f2]";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#39ff14]/10 border-[#39ff14]/30";
      case "running":
        return "bg-[#00f5ff]/10 border-[#00f5ff]/30";
      case "error":
        return "bg-[#ff006e]/10 border-[#ff006e]/30";
      case "pending":
        return "bg-[#b537f2]/10 border-[#b537f2]/30";
      default:
        return "bg-gray-500/10 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-cyan-glow">SCAN HISTORY</h1>
        <p className="text-gray-400">View and manage all previous scans</p>
      </div>

      {/* Filters */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium neon-pink">Search Target</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by target..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0a0e27] border-[#ff006e]/30 text-white placeholder-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium neon-pink">Scan Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-[#0a0e27] border border-[#ff006e]/30 text-white rounded px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="network">Network</option>
              <option value="domain">Domain</option>
              <option value="social">Social Media</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium neon-pink">Results</label>
            <div className="text-2xl font-bold neon-green">{filteredScans.length}</div>
          </div>
        </div>
      </Card>

      {/* Scans List */}
      {isLoading ? (
        <Card className="hud-frame p-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-[#00f5ff]" />
          <p className="text-gray-400">Loading scan history...</p>
        </Card>
      ) : filteredScans.length === 0 ? (
        <Card className="hud-frame p-12 text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-[#00f5ff]/50" />
          <p className="text-gray-400">No scans found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan: any) => (
            <Card
              key={scan.id}
              className={`hud-frame p-4 cursor-pointer transition hover:border-[#ff006e] ${
                selectedScan?.id === scan.id ? "border-[#ff006e]" : ""
              }`}
              onClick={() => setSelectedScan(selectedScan?.id === scan.id ? null : scan)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBg(scan.status)} border`}>
                      <span className={getStatusColor(scan.status)}>{scan.status}</span>
                    </span>
                    <span className="text-sm font-medium neon-pink uppercase">{scan.scanType}</span>
                  </div>
                  <div className="font-mono text-sm text-[#00f5ff]">{scan.target}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(scan.createdAt).toLocaleString()}
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScan(scan);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-[#ff006e]/30 hover:border-[#ff006e]"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Expanded Details */}
              {selectedScan?.id === scan.id && scan.rawResults && (
                <div className="mt-4 pt-4 border-t border-[#ff006e]/20 space-y-3">
                  <div className="bg-[#0a0e27]/50 border border-[#00f5ff]/20 rounded p-4 font-mono text-xs text-[#00f5ff] max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-words">
                      {typeof scan.rawResults === "string"
                        ? JSON.stringify(JSON.parse(scan.rawResults), null, 2)
                        : JSON.stringify(scan.rawResults, null, 2)}
                    </pre>
                  </div>

                  {scan.threatAnalysis && (
                    <div className="space-y-2">
                      <h4 className="font-bold neon-pink">THREAT ANALYSIS</h4>
                      <div className="bg-[#0a0e27]/50 border border-[#ff006e]/20 rounded p-4 text-sm text-gray-300">
                        {typeof scan.threatAnalysis === "string"
                          ? scan.threatAnalysis
                          : JSON.stringify(scan.threatAnalysis)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
