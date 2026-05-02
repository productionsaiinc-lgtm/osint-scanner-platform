import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Upload, Download, Trash2, Share2, Lock, HardDrive, FolderPlus, Loader2, RefreshCw, History } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("gzip")) return "📦";
  if (mimeType.startsWith("text/")) return "📝";
  if (mimeType === "application/x-directory") return "📁";
  return "📎";
}

export function CloudStorage() {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [folderStack, setFolderStack] = useState<Array<{ id: number; name: string }>>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"files" | "backups" | "history">("files");

  const { data: listData, isLoading, refetch } = trpc.cloudStorage.list.useQuery(
    { parentFolderId: currentFolder },
    { refetchInterval: 30000 }
  );
  const { data: overview } = trpc.cloudStorage.overview.useQuery(undefined, { refetchInterval: 60000 });
  const { data: backups = [], refetch: refetchBackups } = trpc.cloudStorage.listBackups.useQuery();
  const { data: syncHistory = [] } = trpc.cloudStorage.syncHistory.useQuery({ limit: 30 });

  const files = listData?.files ?? [];
  const storageUsedGB = overview?.usedGB ?? 0;
  const storageQuotaGB = overview?.quotaGB ?? 10;
  const fileCount = overview?.fileCount ?? 0;
  const usedPct = Math.min((storageUsedGB / storageQuotaGB) * 100, 100);

  const createFolderMutation = trpc.cloudStorage.createFolder.useMutation({
    onSuccess: () => {
      toast.success("Folder created");
      setNewFolderName("");
      setShowNewFolder(false);
      utils.cloudStorage.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const requestUploadMutation = trpc.cloudStorage.requestUpload.useMutation({
    onError: (e) => toast.error(e.message),
  });

  const getDownloadUrlQuery = trpc.cloudStorage.getDownloadUrl.useQuery(
    { fileId: -1 },
    { enabled: false }
  );

  const toggleShareMutation = trpc.cloudStorage.toggleShare.useMutation({
    onSuccess: (d) => {
      toast.success(d.isShared ? "File shared — share token generated" : "File unshared");
      utils.cloudStorage.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.cloudStorage.delete.useMutation({
    onSuccess: () => {
      toast.success("Deleted");
      utils.cloudStorage.list.invalidate();
      utils.cloudStorage.overview.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const createBackupMutation = trpc.cloudStorage.createBackup.useMutation({
    onSuccess: (d) => {
      toast.success(`Backup created: ${d.backupName}`);
      refetchBackups();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await requestUploadMutation.mutateAsync({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        parentFolderId: currentFolder,
      });

      if (result.uploadUrl) {
        const putRes = await fetch(result.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
        if (!putRes.ok) throw new Error("S3 upload failed");
        toast.success(`Uploaded ${file.name}`);
      } else {
        toast.success(`${file.name} registered (S3 not configured – metadata only)`);
      }

      utils.cloudStorage.list.invalidate();
      utils.cloudStorage.overview.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const result = await utils.cloudStorage.getDownloadUrl.fetch({ fileId });
      if (result.downloadUrl) {
        const a = document.createElement("a");
        a.href = result.downloadUrl;
        a.download = fileName;
        a.click();
        toast.success(`Downloading ${fileName}`);
      }
    } catch {
      toast.error("Could not generate download link");
    }
  };

  const enterFolder = (id: number, name: string) => {
    setFolderStack([...folderStack, { id: currentFolder ?? -1, name: currentFolder ? folderStack[folderStack.length - 1]?.name ?? "Root" : "Root" }]);
    setCurrentFolder(id);
  };

  const navigateUp = () => {
    const stack = [...folderStack];
    const prev = stack.pop();
    setFolderStack(stack);
    setCurrentFolder(prev && prev.id >= 0 ? prev.id : null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <Cloud className="w-8 h-8" />
            Cloud Storage
          </h1>
          <p className="text-gray-400 mt-2">Secure backup, sync, and file management</p>
        </div>
        <Button onClick={() => { refetch(); utils.cloudStorage.overview.invalidate(); }} variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Storage Overview */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">Storage Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Used Storage</span>
                <span className="text-cyan-400 font-bold">{storageUsedGB} GB / {storageQuotaGB} GB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all bg-gradient-to-r ${usedPct > 80 ? "from-red-500 to-orange-500" : "from-cyan-500 to-blue-500"}`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/50 rounded p-3 border border-cyan-500/20">
                <p className="text-xs text-gray-500 mb-1">Files</p>
                <p className="text-2xl font-bold text-cyan-400">{fileCount}</p>
              </div>
              <div className="bg-black/50 rounded p-3 border border-cyan-500/20">
                <p className="text-xs text-gray-500 mb-1">Available</p>
                <p className="text-2xl font-bold text-green-400">{(storageQuotaGB - storageUsedGB).toFixed(1)} GB</p>
              </div>
              <div className="bg-black/50 rounded p-3 border border-cyan-500/20">
                <p className="text-xs text-gray-500 mb-1">S3 Status</p>
                <p className={`text-sm font-bold ${listData?.s3Available ? "text-green-400" : "text-yellow-400"}`}>
                  {listData?.s3Available ? "Connected" : "Not Configured"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["files", "backups", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "bg-cyan-600 text-white" : "bg-black/40 text-gray-400 hover:text-white border border-cyan-500/20"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "files" && (
        <>
          {/* Upload + New Folder controls */}
          <Card className="border-purple-500/30 bg-black/40">
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload Files
              </h2>

              {/* Breadcrumb */}
              {folderStack.length > 0 && (
                <div className="flex items-center gap-1 mb-4 text-sm text-gray-400">
                  <button onClick={() => { setFolderStack([]); setCurrentFolder(null); }} className="text-cyan-400 hover:underline">Root</button>
                  {folderStack.slice(1).map((f, i) => (
                    <span key={i}> / <span className="text-gray-300">{f.name}</span></span>
                  ))}
                  <span> / <span className="text-white">{folderStack[folderStack.length - 1]?.name}</span></span>
                </div>
              )}
              {currentFolder !== null && (
                <Button onClick={navigateUp} variant="ghost" size="sm" className="mb-3 text-gray-400 hover:text-white">
                  ← Back
                </Button>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/60 transition-colors cursor-pointer"
              >
                <Cloud className="w-12 h-12 text-purple-400 mx-auto mb-2 opacity-50" />
                <p className="text-gray-400 mb-2">Drag and drop files here or click to browse</p>
                <p className="text-xs text-gray-500">Max file size: 1 GB per file · Quota: {storageQuotaGB} GB total</p>
                <Button disabled={uploading} className="mt-4 bg-purple-600 hover:bg-purple-700 pointer-events-none">
                  {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4 mr-2" />Choose Files</>}
                </Button>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />

              {/* New Folder */}
              <div className="mt-4">
                {showNewFolder ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && createFolderMutation.mutate({ name: newFolderName, parentFolderId: currentFolder })}
                      className="flex-1 bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-white text-sm"
                      autoFocus
                    />
                    <Button
                      onClick={() => createFolderMutation.mutate({ name: newFolderName, parentFolderId: currentFolder })}
                      disabled={createFolderMutation.isPending || !newFolderName.trim()}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {createFolderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                    </Button>
                    <Button onClick={() => setShowNewFolder(false)} variant="ghost" size="sm">Cancel</Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowNewFolder(true)} variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                    <FolderPlus className="w-4 h-4 mr-2" /> New Folder
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Files List */}
          <Card className="border-cyan-500/30 bg-black/40">
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold text-cyan-400 mb-4">Files ({files.length})</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading files…
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Cloud className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No files yet. Upload your first file above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-black/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/50 transition-colors flex items-center justify-between"
                    >
                      <div
                        className={`flex-1 ${file.isFolder ? "cursor-pointer" : ""}`}
                        onClick={() => file.isFolder && enterFolder(file.id, file.fileName)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getMimeIcon(file.mimeType)}</span>
                          <h3 className={`font-bold text-white ${file.isFolder ? "hover:text-cyan-400 transition-colors" : ""}`}>
                            {file.fileName}
                          </h3>
                          {!file.isFolder && <Lock className="w-3 h-3 text-green-400" title="Stored securely" />}
                          {file.isShared && <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Shared</span>}
                        </div>
                        {!file.isFolder && (
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>{formatBytes(file.fileSize)}</span>
                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!file.isFolder && (
                          <Button
                            onClick={() => handleDownload(file.id, file.fileName)}
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {!file.isFolder && (
                          <Button
                            onClick={() => toggleShareMutation.mutate({ fileId: file.id })}
                            disabled={toggleShareMutation.isPending && toggleShareMutation.variables?.fileId === file.id}
                            size="sm"
                            className={file.isShared ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 hover:bg-gray-700"}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteMutation.mutate({ fileId: file.id })}
                          disabled={deleteMutation.isPending && deleteMutation.variables?.fileId === file.id}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          {deleteMutation.isPending && deleteMutation.variables?.fileId === file.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "backups" && (
        <Card className="border-green-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-green-400">Backups</h2>
              <Button
                onClick={() => createBackupMutation.mutate({})}
                disabled={createBackupMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                {createBackupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Backup Now
              </Button>
            </div>
            {backups.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No backups yet. Create your first backup above.</p>
            ) : (
              <div className="space-y-2">
                {backups.map((b) => (
                  <div key={b.id} className="bg-black/50 border border-green-500/20 rounded p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{b.backupName}</p>
                      <p className="text-xs text-gray-500">{formatBytes(Number(b.backupSize))} · {b.fileCount} files · {new Date(b.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${b.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "history" && (
        <Card className="border-blue-500/30 bg-black/40">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <History className="w-5 h-5" /> Sync History
            </h2>
            {syncHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sync activity yet.</p>
            ) : (
              <div className="space-y-2">
                {syncHistory.map((entry) => (
                  <div key={entry.id} className="bg-black/50 border border-blue-500/20 rounded p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-white">{entry.fileName ?? "—"}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.syncedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                        entry.syncType === "upload" ? "bg-green-500/20 text-green-400" :
                        entry.syncType === "delete" ? "bg-red-500/20 text-red-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>{entry.syncType}</span>
                      <span className={`text-xs ${entry.status === "completed" ? "text-green-400" : "text-yellow-400"}`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
