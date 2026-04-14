import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Filter, Trash2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: number;
  alertType: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
  details?: any;
}

export default function AlertHistory() {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "severity">("newest");

  // Queries - Disabled until database tables are created on deployment
  const alerts: Alert[] = [];
  const isLoading = false;
  const refetch = () => {};
  // const { data: alerts, isLoading, refetch } = trpc.monitoring.listAlerts.useQuery({
  //   limit: 100,
  //   unreadOnly: false,
  // });

  // Mutations
  const markAlertReadMutation = trpc.monitoring.markAlertRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const markAlertResolvedMutation = trpc.monitoring.markAlertResolved.useMutation({
    onSuccess: () => {
      toast.success("Alert resolved");
      refetch();
    },
  });

  // Filter and sort alerts
  const filteredAlerts = React.useMemo(() => {
    let filtered = alerts || [];

    // Filter by severity
    if (filterSeverity !== "all") {
      filtered = filtered.filter((a) => a.severity === filterSeverity);
    }

    // Filter by status
    if (filterStatus === "unread") {
      filtered = filtered.filter((a) => !a.isRead);
    } else if (filterStatus === "unresolved") {
      filtered = filtered.filter((a) => !a.isResolved);
    } else if (filterStatus === "resolved") {
      filtered = filtered.filter((a) => a.isResolved);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          a.alertType.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "severity") {
      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      filtered.sort((a, b) => (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4));
    }

    return filtered;
  }, [alerts, filterSeverity, filterStatus, searchTerm, sortBy]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-900 text-red-100";
      case "high":
        return "bg-orange-900 text-orange-100";
      case "medium":
        return "bg-yellow-900 text-yellow-100";
      case "low":
        return "bg-blue-900 text-blue-100";
      default:
        return "bg-gray-900 text-gray-100";
    }
  };

  const getStatusColor = (isRead: boolean, isResolved: boolean) => {
    if (isResolved) return "bg-green-900 text-green-100";
    if (!isRead) return "bg-neon-pink text-black";
    return "bg-gray-700 text-gray-100";
  };

  const exportToCSV = () => {
    const headers = ["ID", "Type", "Severity", "Title", "Description", "Status", "Created"];
    const rows = filteredAlerts.map((a) => [
      a.id,
      a.alertType,
      a.severity,
      a.title,
      a.description,
      `${a.isResolved ? "Resolved" : a.isRead ? "Read" : "Unread"}`,
      new Date(a.createdAt).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alert-history-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Alerts exported to CSV");
  };

  const stats = React.useMemo(() => {
    const all = alerts || [];
    return {
      total: all.length,
      unread: all.filter((a) => !a.isRead).length,
      unresolved: all.filter((a) => !a.isResolved).length,
      critical: all.filter((a) => a.severity === "critical").length,
      high: all.filter((a) => a.severity === "high").length,
      medium: all.filter((a) => a.severity === "medium").length,
      low: all.filter((a) => a.severity === "low").length,
    };
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neon-cyan/20 pb-6">
        <h1 className="text-3xl font-bold text-neon-cyan mb-2">Alert History</h1>
        <p className="text-gray-400">View and manage all monitoring alerts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-neon-cyan/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-cyan">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-neon-cyan/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-pink">{stats.unread}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-neon-cyan/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{stats.unresolved}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-neon-cyan/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="text-neon-cyan flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-neon-cyan/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full bg-gray-800 border border-neon-cyan/30 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-cyan"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-800 border border-neon-cyan/30 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-cyan"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-gray-800 border border-neon-cyan/30 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-cyan"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="severity">By Severity</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={exportToCSV}
              className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-400">Loading alerts...</p>
            </CardContent>
          </Card>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${
                alert.severity === "critical"
                  ? "border-l-red-500 bg-red-950/20"
                  : alert.severity === "high"
                    ? "border-l-orange-500 bg-orange-950/20"
                    : alert.severity === "medium"
                      ? "border-l-yellow-500 bg-yellow-950/20"
                      : "border-l-blue-500 bg-blue-950/20"
              } border-neon-cyan/30 bg-gray-900`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(alert.isRead, alert.isResolved)}>
                        {alert.isResolved ? "RESOLVED" : alert.isRead ? "READ" : "NEW"}
                      </Badge>
                      <span className="text-xs text-gray-500">ID: {alert.id}</span>
                    </div>
                    <p className="text-lg font-medium text-white mb-1">{alert.title}</p>
                    <p className="text-sm text-gray-300 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Type: {alert.alertType.replace(/_/g, " ").toUpperCase()}</span>
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                    {alert.details && (
                      <div className="mt-3 p-2 bg-gray-800 rounded text-xs text-gray-400 max-h-24 overflow-y-auto">
                        <pre>{JSON.stringify(alert.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {!alert.isRead && (
                      <Button
                        onClick={() => markAlertReadMutation.mutate({ alertId: alert.id })}
                        size="sm"
                        className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {!alert.isResolved && (
                      <Button
                        onClick={() => markAlertResolvedMutation.mutate({ alertId: alert.id })}
                        size="sm"
                        className="bg-green-900 hover:bg-green-800 text-green-100"
                        title="Mark as resolved"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-400">No alerts match your filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      {filteredAlerts.length > 0 && (
        <Card className="bg-gray-900 border-neon-cyan/30">
          <CardHeader>
            <CardTitle className="text-neon-cyan">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Showing</p>
                <p className="text-lg font-bold text-neon-cyan">{filteredAlerts.length}</p>
                <p className="text-xs text-gray-500">of {stats.total} alerts</p>
              </div>
              <div>
                <p className="text-gray-400">Critical</p>
                <p className="text-lg font-bold text-red-400">{stats.critical}</p>
              </div>
              <div>
                <p className="text-gray-400">High</p>
                <p className="text-lg font-bold text-orange-400">{stats.high}</p>
              </div>
              <div>
                <p className="text-gray-400">Medium</p>
                <p className="text-lg font-bold text-yellow-400">{stats.medium}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
