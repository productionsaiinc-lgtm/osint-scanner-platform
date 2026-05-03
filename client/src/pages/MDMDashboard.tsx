import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone, Lock, Shield, AlertCircle, Plus, Activity, MapPin,
  Cpu, BarChart3, FileText, Package, Wifi, AlertTriangle,
  CheckCircle2, XCircle, Settings, RefreshCw, Loader2,
  Globe, Eye, TrendingUp, Radio
} from "lucide-react";
import { toast } from "sonner";

function severityColor(s: string) {
  if (s === "critical") return "text-red-400 bg-red-900/30 border-red-500/40";
  if (s === "high") return "text-orange-400 bg-orange-900/30 border-orange-500/40";
  if (s === "medium") return "text-yellow-400 bg-yellow-900/30 border-yellow-500/40";
  return "text-green-400 bg-green-900/30 border-green-500/40";
}

export function MDMDashboard() {
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [activeMainTab, setActiveMainTab] = useState("devices");

  // ── Enroll form ──
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    deviceName: "Device-" + Math.floor(Math.random() * 1000),
    deviceType: "android" as "android" | "ios" | "windows" | "macos" | "linux",
    osVersion: "",
    manufacturer: "",
    model: "",
  });

  // ── Provision form ──
  const [showProvisionForm, setShowProvisionForm] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    deviceName: "",
    deviceType: "android" as "android" | "ios" | "windows" | "macos" | "linux",
    osVersion: "",
    manufacturer: "",
    model: "",
    applyDefaultPolicy: true,
  });

  // ── Threat form ──
  const [showThreatForm, setShowThreatForm] = useState(false);
  const [threatForm, setThreatForm] = useState({
    deviceId: 0,
    eventType: "malware_detected",
    severity: "high" as "low" | "medium" | "high" | "critical",
    description: "",
    threatName: "",
  });

  // ── Geofence / Location form ──
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationForm, setLocationForm] = useState({ latitude: 43.651070, longitude: -79.347015 });

  // ── Policy form ──
  const [showPolicyForm, setShowPolicyForm] = useState(false);

  const utils = trpc.useUtils();

  // Queries
  const { data: devices = [], isLoading: devicesLoading, refetch: refetchDevices } = trpc.mdm.getAllDevices.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.mdm.getDeviceStats.useQuery();
  const { data: policies = [], refetch: refetchPolicies } = trpc.mdm.getAllPolicies.useQuery();
  const { data: deviceLogs = [] } = trpc.mdm.getDeviceLogs.useQuery(
    { deviceId: selectedDevice || 0 },
    { enabled: !!selectedDevice }
  );
  const { data: securityEvents = [], refetch: refetchEvents } = trpc.mdm.getAllSecurityEvents.useQuery(
    { limit: 50, unresolvedOnly: false }
  );
  const { data: complianceReport, refetch: refetchCompliance } = trpc.mdm.generateComplianceReport.useQuery();
  const { data: appUsage = [] } = trpc.mdm.getAppUsage.useQuery(
    { deviceId: selectedDevice || 0, limit: 20 },
    { enabled: !!selectedDevice }
  );
  const { data: locationHistory = [] } = trpc.mdm.getLocationHistory.useQuery(
    { deviceId: selectedDevice || 0, limit: 20 },
    { enabled: !!selectedDevice }
  );
  const { data: perfHistory = [] } = trpc.mdm.getPerformanceHistory.useQuery(
    { deviceId: selectedDevice || 0, limit: 10 },
    { enabled: !!selectedDevice }
  );
  const { data: networkData = [] } = trpc.mdm.getNetworkData.useQuery(
    { deviceId: selectedDevice || 0, limit: 10 },
    { enabled: !!selectedDevice }
  );

  // Mutations
  const enrollMutation = trpc.mdm.enrollDevice.useMutation({
    onSuccess: () => { toast.success("Device enrolled!"); setShowEnrollForm(false); refetchDevices(); refetchStats(); },
    onError: (e) => toast.error(e.message),
  });
  const provisionMutation = trpc.mdm.provisionDevice.useMutation({
    onSuccess: (d) => { toast.success(d.message || "Device provisioned!"); setShowProvisionForm(false); refetchDevices(); refetchStats(); },
    onError: (e) => toast.error(e.message),
  });
  const createPolicyMutation = trpc.mdm.createPolicy.useMutation({
    onSuccess: () => { toast.success("Policy created!"); setShowPolicyForm(false); refetchPolicies(); },
    onError: (e) => toast.error(e.message),
  });
  const sendCommandMutation = trpc.mdm.sendCommand.useMutation({
    onSuccess: () => toast.success("Command sent to device"),
    onError: (e) => toast.error(e.message),
  });
  const logSecurityEventMutation = trpc.mdm.logSecurityEvent.useMutation({
    onSuccess: () => { toast.success("Security event logged"); setShowThreatForm(false); refetchEvents(); },
    onError: (e) => toast.error(e.message),
  });
  const resolveEventMutation = trpc.mdm.resolveSecurityEvent.useMutation({
    onSuccess: () => { toast.success("Event resolved"); refetchEvents(); },
    onError: (e) => toast.error(e.message),
  });
  const updateLocationMutation = trpc.mdm.updateDeviceLocation.useMutation({
    onSuccess: () => { toast.success("Location updated"); setShowLocationForm(false); utils.mdm.getLocationHistory.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const updateComplianceMutation = trpc.mdm.updateDeviceCompliance.useMutation({
    onSuccess: () => { toast.success("Compliance updated"); refetchCompliance(); refetchDevices(); },
    onError: (e) => toast.error(e.message),
  });
  const recordPerfMutation = trpc.mdm.recordPerformance.useMutation({
    onSuccess: () => { toast.success("Performance recorded"); utils.mdm.getPerformanceHistory.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const logAppUsageMutation = trpc.mdm.logAppUsage.useMutation({
    onSuccess: () => { toast.success("App usage logged"); utils.mdm.getAppUsage.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const unresolvedCount = securityEvents.filter((e: any) => !e.resolved).length;
  const criticalCount = securityEvents.filter((e: any) => e.severity === "critical" && !e.resolved).length;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <Smartphone className="w-8 h-8" /> Mobile Device Management
          </h1>
          <p className="text-gray-400 mt-1">Enterprise MDM with threat detection, geofencing, and compliance</p>
        </div>
        <Button variant="ghost" size="sm" className="text-cyan-400" onClick={() => { refetchDevices(); refetchStats(); refetchEvents(); }}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Devices", value: stats?.totalDevices ?? 0, color: "text-white" },
          { label: "Enrolled", value: stats?.enrolledDevices ?? 0, color: "text-green-400" },
          { label: "Compliant", value: stats?.compliantDevices ?? 0, color: "text-blue-400" },
          { label: "Non-Compliant", value: stats?.nonCompliantDevices ?? 0, color: "text-red-400" },
          { label: "Compliance Rate", value: `${stats?.complianceRate ?? 0}%`, color: "text-yellow-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-black/40 border-cyan-500/20">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Threat Alert Banner */}
      {unresolvedCount > 0 && (
        <div className={`flex items-center gap-3 p-3 rounded border ${criticalCount > 0 ? "border-red-500/50 bg-red-900/20 text-red-300" : "border-yellow-500/50 bg-yellow-900/20 text-yellow-300"}`}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">
            {unresolvedCount} unresolved security {unresolvedCount === 1 ? "event" : "events"}
            {criticalCount > 0 && ` — ${criticalCount} CRITICAL`}
          </span>
          <Button size="sm" variant="ghost" className="ml-auto text-xs" onClick={() => setActiveMainTab("threats")}>
            View Threats
          </Button>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-black/40 border border-cyan-500/20 p-1">
          <TabsTrigger value="devices" className="text-xs">Devices</TabsTrigger>
          <TabsTrigger value="policies" className="text-xs">
            Policies <Shield className="w-3 h-3 ml-1" />
          </TabsTrigger>
          <TabsTrigger value="threats" className="text-xs">
            Threats
            {unresolvedCount > 0 && (
              <Badge className="ml-1 h-4 text-[10px] bg-red-600 text-white border-0">{unresolvedCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="geofence" className="text-xs">Geofencing</TabsTrigger>
          <TabsTrigger value="apps" className="text-xs">App Mgmt</TabsTrigger>
          <TabsTrigger value="uba" className="text-xs">UBA</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
          <TabsTrigger value="provision" className="text-xs">Provisioning</TabsTrigger>
          <TabsTrigger value="defense" className="text-xs">Mobile Threat Defense</TabsTrigger>
        </TabsList>

        {/* ── DEVICES ── */}
        <TabsContent value="devices" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Enrolled Devices</h2>
            <Button size="sm" onClick={() => setShowEnrollForm(!showEnrollForm)} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-1" /> Enroll Device
            </Button>
          </div>

          {showEnrollForm && (
            <Card className="bg-black/40 border-cyan-500/30">
              <CardContent className="pt-4 space-y-3">
                <h3 className="text-cyan-400 font-medium">New Enrollment</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">Device Name</label>
                    <Input value={enrollForm.deviceName} onChange={e => setEnrollForm(f => ({ ...f, deviceName: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Type</label>
                    <select value={enrollForm.deviceType} onChange={e => setEnrollForm(f => ({ ...f, deviceType: e.target.value as any }))} className="w-full mt-1 rounded bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm">
                      {["android","ios","windows","macos","linux"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">OS Version</label>
                    <Input placeholder="14.0" value={enrollForm.osVersion} onChange={e => setEnrollForm(f => ({ ...f, osVersion: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Manufacturer</label>
                    <Input placeholder="Samsung" value={enrollForm.manufacturer} onChange={e => setEnrollForm(f => ({ ...f, manufacturer: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" disabled={enrollMutation.isPending} onClick={() => enrollMutation.mutate({
                    deviceId: `dev-${Date.now()}`, deviceName: enrollForm.deviceName, deviceType: enrollForm.deviceType,
                    osVersion: enrollForm.osVersion || undefined, manufacturer: enrollForm.manufacturer || undefined,
                  })} className="bg-cyan-600 hover:bg-cyan-700">
                    {enrollMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enroll"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowEnrollForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {devicesLoading ? (
            <div className="text-center py-8 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>
          ) : devices.length === 0 ? (
            <Card className="bg-black/40 border-gray-700">
              <CardContent className="py-10 text-center">
                <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">No devices enrolled yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {devices.map((device: any) => (
                <Card key={device.id} className={`cursor-pointer border transition-colors ${selectedDevice === device.id ? "border-cyan-500 bg-cyan-900/10" : "border-gray-700 bg-black/40 hover:border-gray-500"}`} onClick={() => setSelectedDevice(device.id === selectedDevice ? null : device.id)}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">{device.deviceName}</p>
                        <p className="text-xs text-gray-400">{device.deviceType} • {device.osVersion || "Unknown OS"}</p>
                        <p className="text-xs text-gray-500">{device.manufacturer} {device.model}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={`text-xs ${device.enrollmentStatus === "enrolled" ? "bg-green-800 text-green-300" : "bg-yellow-800 text-yellow-300"}`}>{device.enrollmentStatus}</Badge>
                        <div className="flex items-center gap-1 justify-end">
                          {device.isCompliant ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                          <span className="text-xs text-gray-400">{device.batteryLevel != null ? `${device.batteryLevel}%` : "—"}</span>
                        </div>
                      </div>
                    </div>
                    {selectedDevice === device.id && (
                      <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap gap-2">
                        {["lock","wipe","restart","get_location"].map(cmd => (
                          <Button key={cmd} size="sm" variant="outline" className={`text-xs ${cmd === "wipe" ? "border-red-600 text-red-400 hover:bg-red-900/20" : "border-gray-600 text-gray-300"}`}
                            onClick={e => { e.stopPropagation(); sendCommandMutation.mutate({ deviceId: device.id, commandType: cmd as any }); }}>
                            {cmd.replace("_", " ")}
                          </Button>
                        ))}
                        <Button size="sm" variant="outline" className="text-xs border-blue-600 text-blue-400"
                          onClick={e => { e.stopPropagation(); updateComplianceMutation.mutate({ deviceId: device.id, isCompliant: !device.isCompliant }); }}>
                          Toggle Compliant
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedDevice && deviceLogs.length > 0 && (
            <Card className="bg-black/40 border-gray-700">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-300">Activity Log</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {deviceLogs.map((log: any) => (
                    <div key={log.id} className="text-xs border-l-2 border-cyan-700 pl-2">
                      <p className="text-cyan-400 font-medium">{log.logType}</p>
                      <p className="text-gray-400">{log.logMessage}</p>
                      <p className="text-gray-600">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── POLICIES ── */}
        <TabsContent value="policies" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Security Policies</h2>
            <Button size="sm" onClick={() => setShowPolicyForm(!showPolicyForm)} className="bg-purple-700 hover:bg-purple-800">
              <Plus className="w-4 h-4 mr-1" /> Create Policy
            </Button>
          </div>

          {showPolicyForm && (
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="pt-4 space-y-3">
                <h3 className="text-purple-400 font-medium">New Security Policy</h3>
                <PolicyCreateForm onSubmit={(data) => createPolicyMutation.mutate(data)} isPending={createPolicyMutation.isPending} onCancel={() => setShowPolicyForm(false)} />
              </CardContent>
            </Card>
          )}

          {policies.length === 0 ? (
            <Card className="bg-black/40 border-gray-700"><CardContent className="py-10 text-center">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">No policies yet</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {policies.map((p: any) => (
                <Card key={p.id} className="bg-black/40 border-gray-700">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">{p.policyName}</p>
                        <p className="text-xs text-gray-400">{p.description}</p>
                      </div>
                      <Badge className="bg-purple-900/50 text-purple-300 border border-purple-700 text-xs">{p.policyType}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.requireNumeric ? <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">Requires Numbers</span> : null}
                      {p.enableEncryption ? <span className="text-xs bg-green-900/30 text-green-300 px-2 py-0.5 rounded">Encryption</span> : null}
                      {p.requireVpn ? <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-0.5 rounded">VPN Required</span> : null}
                      {p.minPasswordLength ? <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Min PW: {p.minPasswordLength}</span> : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── THREAT DETECTION ── */}
        <TabsContent value="threats" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Threat Detection
            </h2>
            <Button size="sm" onClick={() => setShowThreatForm(!showThreatForm)} className="bg-red-700 hover:bg-red-800" disabled={devices.length === 0}>
              <Plus className="w-4 h-4 mr-1" /> Log Threat
            </Button>
          </div>

          {showThreatForm && devices.length > 0 && (
            <Card className="bg-black/40 border-red-500/30">
              <CardContent className="pt-4 space-y-3">
                <h3 className="text-red-400 font-medium">Log Security Event</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">Device</label>
                    <select className="w-full mt-1 rounded bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm"
                      value={threatForm.deviceId} onChange={e => setThreatForm(f => ({ ...f, deviceId: Number(e.target.value) }))}>
                      <option value={0}>Select device…</option>
                      {devices.map((d: any) => <option key={d.id} value={d.id}>{d.deviceName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Severity</label>
                    <select className="w-full mt-1 rounded bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm"
                      value={threatForm.severity} onChange={e => setThreatForm(f => ({ ...f, severity: e.target.value as any }))}>
                      {["low","medium","high","critical"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Event Type</label>
                    <Input value={threatForm.eventType} onChange={e => setThreatForm(f => ({ ...f, eventType: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" placeholder="malware_detected" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Threat Name</label>
                    <Input value={threatForm.threatName} onChange={e => setThreatForm(f => ({ ...f, threatName: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" placeholder="TrojanAgent.X" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400">Description</label>
                    <Input value={threatForm.description} onChange={e => setThreatForm(f => ({ ...f, description: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" placeholder="Brief description…" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" disabled={logSecurityEventMutation.isPending || !threatForm.deviceId} onClick={() => logSecurityEventMutation.mutate({ ...threatForm })} className="bg-red-700 hover:bg-red-800">
                    {logSecurityEventMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log Event"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowThreatForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {securityEvents.length === 0 ? (
            <Card className="bg-black/40 border-gray-700"><CardContent className="py-10 text-center">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">No security events detected</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {securityEvents.map((evt: any) => (
                <Card key={evt.id} className={`border ${severityColor(evt.severity)}`}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">{evt.threatName || evt.eventType}</p>
                        <p className="text-xs text-gray-400">{evt.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(evt.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`text-xs border ${severityColor(evt.severity)}`}>{evt.severity}</Badge>
                        {evt.resolved ? (
                          <span className="text-xs text-green-400">✓ Resolved</span>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-xs text-blue-400 h-6 px-2" onClick={() => resolveEventMutation.mutate({ eventId: evt.id, resolutionAction: "Manual review" })}>
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── GEOFENCING ── */}
        <TabsContent value="geofence" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" /> Geofencing & Location
            </h2>
            <Button size="sm" onClick={() => setShowLocationForm(!showLocationForm)} className="bg-green-700 hover:bg-green-800" disabled={!selectedDevice}>
              <Plus className="w-4 h-4 mr-1" /> Update Location
            </Button>
          </div>

          {!selectedDevice && (
            <div className="text-sm text-gray-400 bg-gray-800/50 border border-gray-700 p-3 rounded">
              Select a device from the <strong className="text-cyan-400">Devices</strong> tab to manage geofencing.
            </div>
          )}

          {selectedDevice && showLocationForm && (
            <Card className="bg-black/40 border-green-500/30">
              <CardContent className="pt-4 space-y-3">
                <h3 className="text-green-400 font-medium">Update Device Location</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">Latitude</label>
                    <Input type="number" value={locationForm.latitude} onChange={e => setLocationForm(f => ({ ...f, latitude: parseFloat(e.target.value) }))} className="bg-gray-800 border-gray-600 text-white mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Longitude</label>
                    <Input type="number" value={locationForm.longitude} onChange={e => setLocationForm(f => ({ ...f, longitude: parseFloat(e.target.value) }))} className="bg-gray-800 border-gray-600 text-white mt-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" disabled={updateLocationMutation.isPending} onClick={() => updateLocationMutation.mutate({ deviceId: selectedDevice, ...locationForm })} className="bg-green-700 hover:bg-green-800">
                    {updateLocationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Location"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowLocationForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDevice && locationHistory.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-300 font-medium">Location History</h3>
              {locationHistory.map((loc: any) => (
                <Card key={loc.id} className="bg-black/40 border-gray-700">
                  <CardContent className="pt-3 pb-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-white font-mono">{parseFloat(loc.latitude).toFixed(5)}, {parseFloat(loc.longitude).toFixed(5)}</p>
                      <p className="text-xs text-gray-500">{loc.accuracy ? `Accuracy: ±${loc.accuracy}m` : ""}</p>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(loc.timestamp).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : selectedDevice ? (
            <Card className="bg-black/40 border-gray-700"><CardContent className="py-10 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">No location data for this device</p>
            </CardContent></Card>
          ) : null}
        </TabsContent>

        {/* ── APP MANAGEMENT ── */}
        <TabsContent value="apps" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" /> App Management
            </h2>
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800" disabled={!selectedDevice}
              onClick={() => selectedDevice && logAppUsageMutation.mutate({ deviceId: selectedDevice, appPackageName: "com.example.app", appName: "Example App", category: "Productivity", usageTime: 30, launchCount: 5, dataUsed: 1024 })}>
              <Plus className="w-4 h-4 mr-1" /> Log Sample App
            </Button>
          </div>

          {!selectedDevice && (
            <div className="text-sm text-gray-400 bg-gray-800/50 border border-gray-700 p-3 rounded">
              Select a device from the <strong className="text-cyan-400">Devices</strong> tab to view app analytics.
            </div>
          )}

          {selectedDevice && appUsage.length > 0 ? (
            <div className="space-y-2">
              {appUsage.map((app: any) => (
                <Card key={app.id} className="bg-black/40 border-gray-700">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{app.appName}</p>
                        <p className="text-xs text-gray-400">{app.appPackageName}</p>
                        <p className="text-xs text-gray-500">{app.category}</p>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <p>{app.usageTime ? `${app.usageTime}m usage` : ""}</p>
                        <p>{app.launchCount ? `${app.launchCount} launches` : ""}</p>
                        <p>{app.dataUsed ? `${(app.dataUsed / 1024).toFixed(1)}KB` : ""}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : selectedDevice ? (
            <Card className="bg-black/40 border-gray-700"><CardContent className="py-10 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">No app usage data. Click "Log Sample App" to test.</p>
            </CardContent></Card>
          ) : null}

          <Card className="bg-black/40 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-400">App Policy Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-400">
              <p>• Blocked apps are enforced via security policies</p>
              <p>• Allowed app lists restrict installs to approved software</p>
              <p>• Version enforcement ensures apps stay up-to-date</p>
              <p>• Data usage monitoring detects anomalous app behaviour</p>
              <Button size="sm" className="mt-2 bg-blue-700 hover:bg-blue-800 text-xs" onClick={() => setActiveMainTab("policies")}>
                Manage App Policies →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── USER BEHAVIOR ANALYTICS ── */}
        <TabsContent value="uba" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-yellow-400" /> User Behavior Analytics
            </h2>
            <Button size="sm" className="bg-yellow-700 hover:bg-yellow-800" disabled={!selectedDevice}
              onClick={() => selectedDevice && recordPerfMutation.mutate({
                deviceId: selectedDevice,
                cpuUsage: Math.random() * 80 + 10,
                memoryUsage: Math.random() * 70 + 20,
                batteryLevel: Math.floor(Math.random() * 100),
                temperature: 35 + Math.random() * 15,
              })}>
              <Activity className="w-4 h-4 mr-1" /> Record Sample
            </Button>
          </div>

          {!selectedDevice && (
            <div className="text-sm text-gray-400 bg-gray-800/50 border border-gray-700 p-3 rounded">
              Select a device from the <strong className="text-cyan-400">Devices</strong> tab to view behaviour analytics.
            </div>
          )}

          {selectedDevice && perfHistory.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(() => {
                  const latest: any = perfHistory[0] || {};
                  return [
                    { label: "CPU", value: latest.cpuUsage ? `${parseFloat(latest.cpuUsage).toFixed(1)}%` : "—", color: parseFloat(latest.cpuUsage) > 80 ? "text-red-400" : "text-white" },
                    { label: "Memory", value: latest.memoryUsage ? `${parseFloat(latest.memoryUsage).toFixed(1)}%` : "—", color: "text-white" },
                    { label: "Battery", value: latest.batteryLevel != null ? `${latest.batteryLevel}%` : "—", color: latest.batteryLevel < 20 ? "text-red-400" : "text-green-400" },
                    { label: "Temp", value: latest.temperature ? `${parseFloat(latest.temperature).toFixed(1)}°C` : "—", color: parseFloat(latest.temperature) > 45 ? "text-red-400" : "text-white" },
                  ].map(s => (
                    <Card key={s.label} className="bg-black/40 border-yellow-500/20">
                      <CardContent className="pt-3 pb-3 text-center">
                        <p className="text-xs text-gray-400">{s.label}</p>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      </CardContent>
                    </Card>
                  ));
                })()}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm text-gray-300 font-medium">Performance History</h3>
                {perfHistory.map((p: any) => (
                  <Card key={p.id} className="bg-black/40 border-gray-700">
                    <CardContent className="pt-2 pb-2 text-xs flex justify-between text-gray-400">
                      <span>CPU: {p.cpuUsage ? `${parseFloat(p.cpuUsage).toFixed(1)}%` : "—"}</span>
                      <span>Mem: {p.memoryUsage ? `${parseFloat(p.memoryUsage).toFixed(1)}%` : "—"}</span>
                      <span>Bat: {p.batteryLevel != null ? `${p.batteryLevel}%` : "—"}</span>
                      <span className="text-gray-600">{new Date(p.timestamp).toLocaleTimeString()}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {selectedDevice && perfHistory.length === 0 && (
            <Card className="bg-black/40 border-gray-700"><CardContent className="py-10 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">No performance data yet. Click "Record Sample" to test.</p>
            </CardContent></Card>
          )}

          <Card className="bg-black/40 border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-400">Anomaly Detection Rules</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-400 space-y-1">
              <p>🔴 CPU &gt; 90% for more than 5 min → alert</p>
              <p>🟠 Battery drops &gt;20% in 10 min → investigate</p>
              <p>🟡 Memory &gt; 95% → potential memory leak</p>
              <p>🔵 Temperature &gt; 45°C → thermal throttle risk</p>
              <p>⚪ App launches &gt; 100/day → usage anomaly</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── COMPLIANCE REPORTS ── */}
        <TabsContent value="compliance" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Compliance Reports
            </h2>
            <Button size="sm" onClick={() => refetchCompliance()} className="bg-indigo-700 hover:bg-indigo-800">
              <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
            </Button>
          </div>

          {complianceReport && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Devices", value: complianceReport.summary.total, color: "text-white" },
                  { label: "Compliant", value: complianceReport.summary.compliant, color: "text-green-400" },
                  { label: "Non-Compliant", value: complianceReport.summary.nonCompliant, color: "text-red-400" },
                  { label: "Rate", value: `${complianceReport.summary.rate}%`, color: complianceReport.summary.rate >= 80 ? "text-green-400" : "text-red-400" },
                ].map(s => (
                  <Card key={s.label} className="bg-black/40 border-indigo-500/20">
                    <CardContent className="pt-3 pb-3 text-center">
                      <p className="text-xs text-gray-400">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-black/40 border-indigo-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-indigo-400">Audit Trail</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-400 space-y-1">
                  <p>Report ID: <span className="text-white font-mono">{(complianceReport as any).auditTrail?.reportId}</span></p>
                  <p>Generated: <span className="text-white">{new Date((complianceReport as any).auditTrail?.timestamp).toLocaleString()}</span></p>
                  <p>Scope: <span className="text-white">{(complianceReport as any).auditTrail?.scope}</span></p>
                </CardContent>
              </Card>

              {complianceReport.devices.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm text-gray-300 font-medium">Device Compliance Details</h3>
                  {complianceReport.devices.map((d: any) => (
                    <Card key={d.id} className={`border ${d.isCompliant ? "border-green-700/40 bg-green-900/10" : "border-red-700/40 bg-red-900/10"}`}>
                      <CardContent className="pt-3 pb-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-white">{d.deviceName}</p>
                            <p className="text-xs text-gray-400">{d.deviceType} • {d.osVersion}</p>
                            {d.complianceIssues.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {d.complianceIssues.map((issue: string, i: number) => (
                                  <span key={i} className="text-xs bg-red-900/30 text-red-300 px-1.5 py-0.5 rounded">{issue}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {d.isCompliant ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                            <span className="text-xs text-gray-500">{d.enrollmentStatus}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ── DEVICE PROVISIONING ── */}
        <TabsContent value="provision" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-400" /> Device Provisioning
            </h2>
            <Button size="sm" onClick={() => setShowProvisionForm(!showProvisionForm)} className="bg-orange-700 hover:bg-orange-800">
              <Plus className="w-4 h-4 mr-1" /> Provision Device
            </Button>
          </div>

          {showProvisionForm && (
            <Card className="bg-black/40 border-orange-500/30">
              <CardContent className="pt-4 space-y-3">
                <h3 className="text-orange-400 font-medium">Auto-Provision New Device</h3>
                <p className="text-xs text-gray-500">Provisioning automatically enrolls the device and applies the Default Security Policy.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">Device Name</label>
                    <Input value={provisionForm.deviceName} onChange={e => setProvisionForm(f => ({ ...f, deviceName: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" placeholder="Corp-Phone-001" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Type</label>
                    <select value={provisionForm.deviceType} onChange={e => setProvisionForm(f => ({ ...f, deviceType: e.target.value as any }))} className="w-full mt-1 rounded bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm">
                      {["android","ios","windows","macos","linux"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">OS Version</label>
                    <Input value={provisionForm.osVersion} onChange={e => setProvisionForm(f => ({ ...f, osVersion: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" placeholder="14.0" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Manufacturer</label>
                    <Input value={provisionForm.manufacturer} onChange={e => setProvisionForm(f => ({ ...f, manufacturer: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" placeholder="Apple / Samsung…" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={provisionForm.applyDefaultPolicy} onChange={e => setProvisionForm(f => ({ ...f, applyDefaultPolicy: e.target.checked }))} className="rounded" />
                  Apply Default Security Policy
                </label>
                <div className="flex gap-2">
                  <Button size="sm" disabled={provisionMutation.isPending || !provisionForm.deviceName} onClick={() => provisionMutation.mutate({ deviceId: `prov-${Date.now()}`, ...provisionForm })} className="bg-orange-700 hover:bg-orange-800">
                    {provisionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Provision"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowProvisionForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-black/40 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-400">Provisioning Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-400">
              {[
                { step: "1", label: "Device Registration", desc: "Device is enrolled with unique ID and metadata" },
                { step: "2", label: "Policy Assignment", desc: "Default Security Policy is automatically applied" },
                { step: "3", label: "Compliance Check", desc: "Device baseline compliance is validated" },
                { step: "4", label: "Activation Log", desc: "All steps are recorded in audit log" },
              ].map(s => (
                <div key={s.step} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-orange-800 text-orange-200 text-xs flex items-center justify-center flex-shrink-0">{s.step}</span>
                  <div>
                    <p className="text-white text-xs font-medium">{s.label}</p>
                    <p className="text-gray-500 text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MOBILE THREAT DEFENSE ── */}
        <TabsContent value="defense" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-pink-400" /> Mobile Threat Defense
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Phishing Detection",
                icon: Globe,
                color: "text-red-400 border-red-500/30",
                status: "Active",
                statusColor: "text-green-400",
                desc: "Scans URLs and messages in real-time for phishing indicators. Blocks suspicious sites before users can interact.",
                rules: ["Known phishing domains blocked", "URL reputation scoring", "Suspicious redirect detection"],
              },
              {
                title: "Malware Protection",
                icon: Shield,
                color: "text-orange-400 border-orange-500/30",
                status: "Active",
                statusColor: "text-green-400",
                desc: "Continuous app and file scanning for malicious code signatures and behaviour patterns.",
                rules: ["On-install app scanning", "File hash verification", "Behavioural anomaly detection"],
              },
              {
                title: "Data Loss Prevention",
                icon: Lock,
                color: "text-yellow-400 border-yellow-500/30",
                status: "Active",
                statusColor: "text-green-400",
                desc: "Prevents sensitive data exfiltration through clipboard monitoring, screenshot control, and data transfer policies.",
                rules: ["Clipboard policy enforcement", "Screenshot restriction", "Outbound data filtering"],
              },
              {
                title: "Network Threat Detection",
                icon: Wifi,
                color: "text-blue-400 border-blue-500/30",
                status: "Monitoring",
                statusColor: "text-yellow-400",
                desc: "Detects rogue Wi-Fi, man-in-the-middle attacks, and insecure network connections.",
                rules: ["Rogue AP detection", "SSL certificate pinning", "VPN enforcement on public Wi-Fi"],
              },
            ].map(({ title, icon: Icon, color, status, statusColor, desc, rules }) => (
              <Card key={title} className={`bg-black/40 border ${color.split(" ")[1]}`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm flex items-center justify-between ${color.split(" ")[0]}`}>
                    <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{title}</span>
                    <span className={`text-xs ${statusColor}`}>{status}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-gray-400">{desc}</p>
                  <ul className="space-y-1">
                    {rules.map(r => (
                      <li key={r} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />{r}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-black/40 border-pink-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-pink-400">OSINT Integration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-400 space-y-2">
              <p>MDM devices can be correlated with OSINT threat intelligence data:</p>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" />IP reputation checks for device connections</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" />Domain blocklist cross-reference</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" />VirusTotal hash scanning for installed apps</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" />CVE vulnerability alerts for OS versions</li>
              </ul>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="text-xs border-pink-600 text-pink-400" onClick={() => window.location.assign("/ip-reputation")}>IP Reputation →</Button>
                <Button size="sm" variant="outline" className="text-xs border-pink-600 text-pink-400" onClick={() => window.location.assign("/threat-feed")}>Threat Feed →</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Policy Create Sub-form ──
function PolicyCreateForm({ onSubmit, isPending, onCancel }: { onSubmit: (d: any) => void; isPending: boolean; onCancel: () => void }) {
  const [form, setForm] = useState({
    policyName: "Security Policy",
    description: "",
    policyType: "security" as "security" | "compliance" | "app_management" | "network" | "device_control",
    minPasswordLength: 8,
    requireNumeric: true,
    requireSpecialChar: false,
    enableEncryption: true,
    requireVpn: false,
  });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400">Policy Name</label>
          <Input value={form.policyName} onChange={e => setForm(f => ({ ...f, policyName: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Type</label>
          <select value={form.policyType} onChange={e => setForm(f => ({ ...f, policyType: e.target.value as any }))} className="w-full mt-1 rounded bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm">
            {["security","compliance","app_management","network","device_control"].map(t => <option key={t} value={t}>{t.replace("_"," ")}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-400">Description</label>
          <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-gray-800 border-gray-600 text-white mt-1" placeholder="Policy description…" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Min Password Length</label>
          <Input type="number" value={form.minPasswordLength} onChange={e => setForm(f => ({ ...f, minPasswordLength: Number(e.target.value) }))} className="bg-gray-800 border-gray-600 text-white mt-1" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {([
          ["requireNumeric","Require Numbers"],
          ["requireSpecialChar","Require Special Chars"],
          ["enableEncryption","Enforce Encryption"],
          ["requireVpn","Require VPN"],
        ] as [keyof typeof form, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="rounded" />
            {label}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled={isPending || !form.policyName} onClick={() => onSubmit(form)} className="bg-purple-700 hover:bg-purple-800">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Policy"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
