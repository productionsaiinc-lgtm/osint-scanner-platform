import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Lock, Shield, AlertCircle, Plus } from "lucide-react";

export function MDMDashboard() {
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);

  // Fetch all devices
  const { data: devices = [], isLoading: devicesLoading } = trpc.mdm.getAllDevices.useQuery();

  // Fetch device statistics
  const { data: stats } = trpc.mdm.getDeviceStats.useQuery();

  // Fetch all policies
  const { data: policies = [] } = trpc.mdm.getAllPolicies.useQuery();

  // Fetch device logs for selected device
  const { data: deviceLogs = [] } = trpc.mdm.getDeviceLogs.useQuery(
    { deviceId: selectedDevice || 0 },
    { enabled: !!selectedDevice }
  );

  const enrollDeviceMutation = trpc.mdm.enrollDevice.useMutation();
  const createPolicyMutation = trpc.mdm.createPolicy.useMutation();
  const sendCommandMutation = trpc.mdm.sendCommand.useMutation();

  const handleEnrollDevice = () => {
    enrollDeviceMutation.mutate({
      deviceId: `device-${Date.now()}`,
      deviceName: "New Device",
      deviceType: "android",
      osVersion: "14.0",
      manufacturer: "Samsung",
      model: "Galaxy S24",
    });
  };

  const handleCreatePolicy = () => {
    createPolicyMutation.mutate({
      policyName: "Standard Security Policy",
      description: "Basic security requirements for all devices",
      policyType: "security",
      minPasswordLength: 8,
      requireNumeric: true,
      requireSpecialChar: true,
      enableEncryption: true,
    });
  };

  const handleSendCommand = (deviceId: number, commandType: string) => {
    sendCommandMutation.mutate({
      deviceId,
      commandType: commandType as any,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mobile Device Management</h1>
        <p className="text-gray-400 mt-2">Manage and monitor enrolled devices</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDevices || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats?.enrolledDevices || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats?.compliantDevices || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.complianceRate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="devices" className="w-full">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
        </TabsList>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Enrolled Devices</h2>
            <Button onClick={handleEnrollDevice} disabled={enrollDeviceMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Enroll Device
            </Button>
          </div>

          {devicesLoading ? (
            <div className="text-center py-8">Loading devices...</div>
          ) : devices.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">No devices enrolled yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {devices.map((device: any) => (
                <Card
                  key={device.id}
                  className={`cursor-pointer ${selectedDevice === device.id ? "border-blue-500" : ""}`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{device.deviceName}</h3>
                        <p className="text-sm text-gray-400">{device.deviceType} • {device.osVersion}</p>
                        <p className="text-xs text-gray-500 mt-1">Status: {device.enrollmentStatus}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {device.isCompliant ? (
                            <Shield className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Battery: {device.batteryLevel}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Device Details */}
          {selectedDevice && (
            <Card>
              <CardHeader>
                <CardTitle>Device Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSendCommand(selectedDevice, "lock")}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Lock Device
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-500"
                  onClick={() => handleSendCommand(selectedDevice, "wipe")}
                >
                  Wipe Device
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSendCommand(selectedDevice, "restart")}
                >
                  Restart Device
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Device Logs */}
          {selectedDevice && deviceLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {deviceLogs.map((log: any) => (
                    <div key={log.id} className="text-sm border-l-2 border-gray-600 pl-3 py-1">
                      <p className="font-medium text-gray-300">{log.logType}</p>
                      <p className="text-gray-400">{log.logMessage}</p>
                      <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Security Policies</h2>
            <Button onClick={handleCreatePolicy} disabled={createPolicyMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Create Policy
            </Button>
          </div>

          {policies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">No policies created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {policies.map((policy: any) => (
                <Card key={policy.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{policy.policyName}</h3>
                    <p className="text-sm text-gray-400">{policy.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Type: {policy.policyType}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Commands Tab */}
        <TabsContent value="commands" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Commands</h2>
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-400">Select a device to send commands</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
