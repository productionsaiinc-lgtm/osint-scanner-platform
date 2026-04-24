import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Upload, Download, Trash2, Share2, Lock, HardDrive } from "lucide-react";
import { toast } from "sonner";

export function CloudStorage() {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "pentest_report.pdf",
      size: 2.5,
      type: "PDF",
      uploaded: "2026-04-22",
      shared: false,
      encrypted: true,
    },
    {
      id: 2,
      name: "network_scan_results.xlsx",
      size: 1.8,
      type: "Excel",
      uploaded: "2026-04-21",
      shared: true,
      encrypted: true,
    },
    {
      id: 3,
      name: "vulnerability_database.db",
      size: 45.2,
      type: "Database",
      uploaded: "2026-04-20",
      shared: false,
      encrypted: true,
    },
    {
      id: 4,
      name: "osint_tools_config.json",
      size: 0.5,
      type: "JSON",
      uploaded: "2026-04-19",
      shared: false,
      encrypted: true,
    },
  ]);

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    lastBackup: "2026-04-24 02:30 AM",
    nextBackup: "2026-04-25 02:30 AM",
  });

  const [syncSettings, setSyncSettings] = useState({
    syncEnabled: true,
    syncDevices: 3,
    lastSync: "2026-04-24 00:15 AM",
  });

  const deleteFile = (id: number) => {
    setFiles(files.filter((f) => f.id !== id));
    toast.success("File deleted");
  };

  const toggleShare = (id: number) => {
    setFiles(
      files.map((f) =>
        f.id === id ? { ...f, shared: !f.shared } : f
      )
    );
    const file = files.find((f) => f.id === id);
    toast.success(`File ${file?.shared ? "unshared" : "shared"}`);
  };

  const downloadFile = (name: string) => {
    toast.success(`Downloading ${name}...`);
  };

  const totalStorage = files.reduce((sum, f) => sum + f.size, 0);
  const usedPercentage = (totalStorage / 100) * 100;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Cloud className="w-8 h-8" />
          Cloud Storage
        </h1>
        <p className="text-gray-400 mt-2">Secure backup, sync, and file management</p>
      </div>

      {/* Storage Overview */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">Storage Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Used Storage</span>
                <span className="text-cyan-400 font-bold">{totalStorage.toFixed(1)} GB / 100 GB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all"
                  style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/50 rounded p-3 border border-cyan-500/20">
                <p className="text-xs text-gray-500 mb-1">Files</p>
                <p className="text-2xl font-bold text-cyan-400">{files.length}</p>
              </div>
              <div className="bg-black/50 rounded p-3 border border-cyan-500/20">
                <p className="text-xs text-gray-500 mb-1">Available</p>
                <p className="text-2xl font-bold text-green-400">{(100 - totalStorage).toFixed(1)} GB</p>
              </div>
              <div className="bg-black/50 rounded p-3 border border-cyan-500/20">
                <p className="text-xs text-gray-500 mb-1">Shared</p>
                <p className="text-2xl font-bold text-purple-400">
                  {files.filter((f) => f.shared).length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="border-purple-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Files
          </h2>
          <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
            <Cloud className="w-12 h-12 text-purple-400 mx-auto mb-2 opacity-50" />
            <p className="text-gray-400 mb-2">Drag and drop files here or click to browse</p>
            <p className="text-xs text-gray-500">Max file size: 1 GB</p>
            <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">Files ({files.length})</h2>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-black/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-white">{file.name}</h3>
                    {file.encrypted && (
                      <div title="Encrypted">
                        <Lock className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{file.size} GB</span>
                    <span>{file.type}</span>
                    <span>{file.uploaded}</span>
                    {file.shared && <span className="text-purple-400">Shared</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadFile(file.name)}
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => toggleShare(file.id)}
                    size="sm"
                    className={
                      file.shared
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteFile(file.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card className="border-green-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold text-green-400 mb-4">Backup Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black/50 rounded border border-green-500/20">
              <div>
                <p className="font-bold text-white">Auto Backup</p>
                <p className="text-sm text-gray-400">Frequency: {backupSettings.backupFrequency}</p>
              </div>
              <Button
                onClick={() =>
                  setBackupSettings({
                    ...backupSettings,
                    autoBackup: !backupSettings.autoBackup,
                  })
                }
                className={
                  backupSettings.autoBackup
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }
              >
                {backupSettings.autoBackup ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-black/50 rounded p-3 border border-green-500/20">
                <p className="text-gray-500 mb-1">Last Backup</p>
                <p className="text-green-400 font-mono">{backupSettings.lastBackup}</p>
              </div>
              <div className="bg-black/50 rounded p-3 border border-green-500/20">
                <p className="text-gray-500 mb-1">Next Backup</p>
                <p className="text-green-400 font-mono">{backupSettings.nextBackup}</p>
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Backup Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card className="border-blue-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold text-blue-400 mb-4">Sync Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black/50 rounded border border-blue-500/20">
              <div>
                <p className="font-bold text-white">Cloud Sync</p>
                <p className="text-sm text-gray-400">Synced devices: {syncSettings.syncDevices}</p>
              </div>
              <Button
                onClick={() =>
                  setSyncSettings({
                    ...syncSettings,
                    syncEnabled: !syncSettings.syncEnabled,
                  })
                }
                className={
                  syncSettings.syncEnabled
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }
              >
                {syncSettings.syncEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="bg-black/50 rounded p-3 border border-blue-500/20">
              <p className="text-gray-500 mb-1">Last Sync</p>
              <p className="text-blue-400 font-mono">{syncSettings.lastSync}</p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
