import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Globe, Power, RefreshCw, AlertTriangle, CheckCircle2, Clock, Download, Upload, Activity, Lock, Zap, Trash2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function VPNConnection() {
  const [selectedProvider, setSelectedProvider] = useState<string>('protonvpn');
  const [selectedLocation, setSelectedLocation] = useState<string>('New York');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // VPN Connection mutations and queries
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = trpc.vpnConnection.status.useQuery(
    undefined,
    { refetchInterval: autoRefresh ? 2000 : false }
  );

  const { data: stats } = trpc.vpnConnection.stats.useQuery(undefined, {
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const { data: logs } = trpc.vpnConnection.logs.useQuery({ limit: 20 });
  const { data: leakStatus } = trpc.vpnConnection.checkLeaks.useQuery();

  // Mutations
  const connectMutation = trpc.vpnConnection.connect.useMutation();
  const disconnectMutation = trpc.vpnConnection.disconnect.useMutation();
  const reconnectMutation = trpc.vpnConnection.reconnect.useMutation();
  const killSwitchMutation = trpc.vpnConnection.setKillSwitch.useMutation();
  const clearLogsMutation = trpc.vpnConnection.clearLogs.useMutation();

  const handleConnect = async () => {
    try {
      await connectMutation.mutateAsync({
        providerId: selectedProvider,
        serverLocation: selectedLocation,
        protocol: 'WireGuard',
      });
      refetchStatus();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      refetchStatus();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  const handleReconnect = async () => {
    try {
      await reconnectMutation.mutateAsync();
      refetchStatus();
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  };

  const handleKillSwitch = async (enabled: boolean) => {
    try {
      await killSwitchMutation.mutateAsync({ enabled });
    } catch (error) {
      console.error('Kill switch toggle failed:', error);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearLogsMutation.mutateAsync();
    } catch (error) {
      console.error('Clear logs failed:', error);
    }
  };

  const vpnProviders = ['protonvpn', 'expressvpn', 'nordvpn', 'surfshark', 'mullvad'];
  const locations = ['New York', 'Los Angeles', 'London', 'Amsterdam', 'Tokyo', 'Sydney', 'Toronto', 'Berlin'];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-neon-green flex items-center gap-2">
          <Power className="w-8 h-8" />
          VPN Connection Manager
        </h1>
        <p className="text-gray-400 mt-2">Connect, manage, and monitor your VPN connection</p>
      </div>

      {/* Connection Status */}
      <Card className={`border-2 ${status?.isConnected ? 'border-green-500/50 bg-green-500/5' : 'border-yellow-500/50 bg-yellow-500/5'}`}>
        <CardHeader>
          <CardTitle className={status?.isConnected ? 'text-green-400' : 'text-yellow-400'}>
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status?.isConnected ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-green-400 animate-pulse" />
                  <div>
                    <div className="text-lg font-bold text-green-400">Connected</div>
                    <div className="text-sm text-gray-400">{status?.status?.serverLocation}</div>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-lg font-bold text-yellow-400">Disconnected</div>
                    <div className="text-sm text-gray-400">Not protected</div>
                  </div>
                </>
              )}
            </div>

            {status?.isConnected && status?.status?.connectionTimeFormatted && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-cyan-400">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{status.status.connectionTimeFormatted}</span>
                </div>
              </div>
            )}
          </div>

          {/* Connection Details */}
          {status?.isConnected && status?.status && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-green-500/20">
              <div className="p-2">
                <div className="text-xs text-gray-400">VPN IP</div>
                <div className="text-sm font-mono text-green-400 mt-1">{status.status.ipAddress}</div>
              </div>
              <div className="p-2">
                <div className="text-xs text-gray-400">Protocol</div>
                <div className="text-sm font-semibold text-green-400 mt-1">{status.status.protocol}</div>
              </div>
              <div className="p-2">
                <div className="text-xs text-gray-400">Ping</div>
                <div className="text-sm font-semibold text-green-400 mt-1">{status.status.ping.toFixed(0)} ms</div>
              </div>
              <div className="p-2">
                <div className="text-xs text-gray-400">Data Used</div>
                <div className="text-sm font-semibold text-green-400 mt-1">{status.status.dataUsedFormatted}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Controls */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-cyan-400">Connection Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider Selection */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">VPN Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                disabled={status?.isConnected}
                className="w-full p-2 border border-cyan-500/30 rounded bg-black text-cyan-400 disabled:opacity-50"
              >
                {vpnProviders.map((provider) => (
                  <option key={provider} value={provider} className="bg-black text-cyan-400">
                    {provider.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Selection */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Server Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={status?.isConnected}
                className="w-full p-2 border border-cyan-500/30 rounded bg-black text-cyan-400 disabled:opacity-50"
              >
                {locations.map((location) => (
                  <option key={location} value={location} className="bg-black text-cyan-400">
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
            {!status?.isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-black font-bold col-span-2 md:col-span-1"
              >
                {connectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-black font-bold"
                >
                  {disconnectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2" />
                      Disconnect
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleReconnect}
                  disabled={reconnectMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
                >
                  {reconnectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reconnect
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleKillSwitch(!status?.status?.killSwitchEnabled)}
                  className={status?.status?.killSwitchEnabled ? 'bg-neon-green hover:bg-neon-green/80 text-black' : 'bg-gray-600 hover:bg-gray-700 text-white'}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Kill Switch
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Speed & Performance */}
      {status?.isConnected && status?.status && (
        <Card className="border-orange-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Speed & Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 border border-orange-500/30 rounded bg-orange-500/5">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <Download className="w-4 h-4" />
                  <span className="text-xs">Download</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">{status.status.downloadSpeed.toFixed(1)}</div>
                <div className="text-xs text-gray-400">Mbps</div>
              </div>

              <div className="p-3 border border-orange-500/30 rounded bg-orange-500/5">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-xs">Upload</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">{status.status.uploadSpeed.toFixed(1)}</div>
                <div className="text-xs text-gray-400">Mbps</div>
              </div>

              <div className="p-3 border border-orange-500/30 rounded bg-orange-500/5">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs">Ping</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">{status.status.ping.toFixed(0)}</div>
                <div className="text-xs text-gray-400">ms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Status */}
      {leakStatus && (
        <Card className={`border-2 ${leakStatus.hasLeak ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/50 bg-green-500/5'}`}>
          <CardHeader>
            <CardTitle className={leakStatus.hasLeak ? 'text-red-400' : 'text-green-400'}>
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              {leakStatus.hasLeak ? (
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              )}
              <div>
                <div className={`font-semibold ${leakStatus.hasLeak ? 'text-red-400' : 'text-green-400'}`}>
                  {leakStatus.hasLeak ? 'Leak Detected' : 'No Leaks Detected'}
                </div>
                <div className="text-sm text-gray-400 mt-1">{leakStatus.details}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <Card className="border-purple-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-purple-400">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border border-purple-500/20 rounded">
                <div className="text-xs text-gray-400">Total Connections</div>
                <div className="text-2xl font-bold text-purple-400 mt-2">{stats.totalConnections}</div>
              </div>
              <div className="p-3 border border-purple-500/20 rounded">
                <div className="text-xs text-gray-400">Total Data Used</div>
                <div className="text-lg font-bold text-purple-400 mt-2">{stats.totalDataUsedFormatted}</div>
              </div>
              <div className="p-3 border border-purple-500/20 rounded">
                <div className="text-xs text-gray-400">Average Ping</div>
                <div className="text-2xl font-bold text-purple-400 mt-2">{stats.averagePing.toFixed(0)} ms</div>
              </div>
              <div className="p-3 border border-purple-500/20 rounded">
                <div className="text-xs text-gray-400">Connection Time</div>
                <div className="text-lg font-bold text-purple-400 mt-2">{stats.connectionTimeFormatted || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Logs */}
      {logs && logs.length > 0 && (
        <Card className="border-blue-500/30 bg-black/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-blue-400">Connection Logs</CardTitle>
            <Button
              onClick={handleClearLogs}
              variant="outline"
              size="sm"
              className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className={`p-3 border rounded text-sm ${
                  log.status === 'success' ? 'border-green-500/20 bg-green-500/5' :
                  log.status === 'warning' ? 'border-yellow-500/20 bg-yellow-500/5' :
                  'border-red-500/20 bg-red-500/5'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`font-semibold capitalize ${
                        log.status === 'success' ? 'text-green-400' :
                        log.status === 'warning' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{log.details}</div>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto Refresh Toggle */}
      <div className="flex items-center gap-2 p-4 border border-gray-500/20 rounded bg-gray-500/5">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
        <label className="text-sm text-gray-400 cursor-pointer">Auto-refresh status every 2 seconds</label>
      </div>
    </div>
  );
}
