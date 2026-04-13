import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Trash2, Eye, EyeOff, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface MonitoredAsset {
  id: number;
  assetType: "domain" | "ip" | "service";
  assetValue: string;
  scanFrequency: "daily" | "weekly" | "monthly";
  description?: string;
  isActive: boolean;
  lastScanned?: Date;
  nextScan?: Date;
}

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

export default function Monitoring() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "alerts">("overview");
  const [newAssetType, setNewAssetType] = useState<"domain" | "ip" | "service">("domain");
  const [newAssetValue, setNewAssetValue] = useState("");
  const [newAssetFrequency, setNewAssetFrequency] = useState<"daily" | "weekly" | "monthly">("daily");

  // Queries
  const { data: stats } = trpc.monitoring.getDashboardStats.useQuery();
  const { data: assets, refetch: refetchAssets } = trpc.monitoring.listAssets.useQuery();
  const { data: alerts, refetch: refetchAlerts } = trpc.monitoring.listAlerts.useQuery({
    limit: 20,
    unreadOnly: false,
  });

  // Mutations
  const createAssetMutation = trpc.monitoring.createAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset added for monitoring");
      setNewAssetValue("");
      refetchAssets();
    },
    onError: (error) => {
      toast.error(`Failed to add asset: ${error.message}`);
    },
  });

  const deleteAssetMutation = trpc.monitoring.deleteAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset removed from monitoring");
      refetchAssets();
    },
    onError: (error) => {
      toast.error(`Failed to delete asset: ${error.message}`);
    },
  });

  const triggerScanMutation = trpc.monitoring.triggerScan.useMutation({
    onSuccess: () => {
      toast.success("Scan triggered successfully");
      refetchAssets();
    },
    onError: (error) => {
      toast.error(`Failed to trigger scan: ${error.message}`);
    },
  });

  const markAlertReadMutation = trpc.monitoring.markAlertRead.useMutation({
    onSuccess: () => {
      refetchAlerts();
    },
  });

  const markAlertResolvedMutation = trpc.monitoring.markAlertResolved.useMutation({
    onSuccess: () => {
      toast.success("Alert resolved");
      refetchAlerts();
    },
  });

  const handleAddAsset = () => {
    if (!newAssetValue.trim()) {
      toast.error("Please enter an asset value");
      return;
    }

    createAssetMutation.mutate({
      assetType: newAssetType,
      assetValue: newAssetValue,
      scanFrequency: newAssetFrequency,
    });
  };

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

  const getSeverityIcon = (severity: string) => {
    if (severity === "critical" || severity === "high") {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neon-cyan/20 pb-6">
        <h1 className="text-3xl font-bold text-neon-cyan mb-2">Real-Time Monitoring</h1>
        <p className="text-gray-400">Monitor your assets for changes and threats in real-time</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-cyan">{stats.totalAssets}</div>
              <p className="text-xs text-gray-500 mt-1">{stats.activeAssets} active</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Unread Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-pink">{stats.unreadAlerts}</div>
              <p className="text-xs text-gray-500 mt-1">Require attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Unresolved Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{stats.unresolvedAlerts}</div>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-neon-cyan">Active</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Monitoring enabled</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neon-cyan/20">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "overview"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "assets"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Monitored Assets
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "alerts"
              ? "text-neon-cyan border-b-2 border-neon-cyan"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Alerts ({stats?.unreadAlerts || 0})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardHeader>
              <CardTitle className="text-neon-cyan">Quick Start</CardTitle>
              <CardDescription>Add your first asset to monitor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Asset Type</label>
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value as any)}
                    className="w-full bg-gray-800 border border-neon-cyan/30 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="domain">Domain</option>
                    <option value="ip">IP Address</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Scan Frequency</label>
                  <select
                    value={newAssetFrequency}
                    onChange={(e) => setNewAssetFrequency(e.target.value as any)}
                    className="w-full bg-gray-800 border border-neon-cyan/30 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Asset Value</label>
                  <Input
                    placeholder="example.com or 192.168.1.1"
                    value={newAssetValue}
                    onChange={(e) => setNewAssetValue(e.target.value)}
                    className="bg-gray-800 border-neon-cyan/30"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddAsset}
                disabled={createAssetMutation.isPending}
                className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createAssetMutation.isPending ? "Adding..." : "Add Asset"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-neon-cyan/30">
            <CardHeader>
              <CardTitle className="text-neon-cyan">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-300">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 rounded-full flex items-center justify-center text-neon-cyan font-bold">1</div>
                <div>
                  <p className="font-medium">Add Assets to Monitor</p>
                  <p className="text-gray-400">Add domains, IP addresses, or services you want to monitor</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 rounded-full flex items-center justify-center text-neon-cyan font-bold">2</div>
                <div>
                  <p className="font-medium">Automatic Scanning</p>
                  <p className="text-gray-400">Assets are scanned at your specified frequency (daily, weekly, or monthly)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 rounded-full flex items-center justify-center text-neon-cyan font-bold">3</div>
                <div>
                  <p className="font-medium">Change Detection</p>
                  <p className="text-gray-400">We detect changes in DNS records, open ports, SSL certificates, and subdomains</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neon-cyan/20 rounded-full flex items-center justify-center text-neon-cyan font-bold">4</div>
                <div>
                  <p className="font-medium">Instant Alerts</p>
                  <p className="text-gray-400">Get notified immediately when changes are detected on your monitored assets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === "assets" && (
        <div className="space-y-4">
          {assets && assets.length > 0 ? (
            assets.map((asset) => (
              <Card key={asset.id} className="bg-gray-900 border-neon-cyan/30">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={asset.isActive ? "bg-green-900 text-green-100" : "bg-gray-700 text-gray-300"}>
                          {asset.assetType.toUpperCase()}
                        </Badge>
                        <Badge className="bg-neon-cyan/20 text-neon-cyan">{asset.scanFrequency}</Badge>
                        {asset.isActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                      </div>
                      <p className="text-lg font-mono text-neon-cyan mb-1">{asset.assetValue}</p>
                      {asset.description && <p className="text-sm text-gray-400 mb-3">{asset.description}</p>}
                      <div className="flex gap-4 text-xs text-gray-500">
                        {asset.lastScanned && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last scanned: {new Date(asset.lastScanned).toLocaleString()}
                          </div>
                        )}
                        {asset.nextScan && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Next scan: {new Date(asset.nextScan).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => triggerScanMutation.mutate({ assetId: asset.id })}
                        disabled={triggerScanMutation.isPending}
                        size="sm"
                        className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan"
                      >
                        Scan Now
                      </Button>
                      <Button
                        onClick={() => deleteAssetMutation.mutate({ assetId: asset.id })}
                        disabled={deleteAssetMutation.isPending}
                        size="sm"
                        variant="destructive"
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
                <p className="text-gray-400 mb-4">No monitored assets yet. Add one to get started!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
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
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(alert.severity)}
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {!alert.isRead && <Badge className="bg-neon-pink text-black">NEW</Badge>}
                        {alert.isResolved && <Badge className="bg-green-900 text-green-100">RESOLVED</Badge>}
                      </div>
                      <p className="text-lg font-medium text-white mb-1">{alert.title}</p>
                      <p className="text-sm text-gray-300 mb-3">{alert.description}</p>
                      <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2">
                      {!alert.isRead && (
                        <Button
                          onClick={() => markAlertReadMutation.mutate({ alertId: alert.id })}
                          size="sm"
                          className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      {!alert.isResolved && (
                        <Button
                          onClick={() => markAlertResolvedMutation.mutate({ alertId: alert.id })}
                          size="sm"
                          className="bg-green-900 hover:bg-green-800 text-green-100"
                        >
                          Resolve
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
                <p className="text-gray-400">No alerts yet. Your monitored assets are looking good!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
