import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function MetadataExtractor() {
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("image");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [sensitiveData, setSensitiveData] = useState<any>(null);

  const extractImageMutation = trpc.securityTools.metadataExtractor.extractImage.useMutation();
  const extractDocumentMutation = trpc.securityTools.metadataExtractor.extractDocument.useMutation();
  const extractAudioMutation = trpc.securityTools.metadataExtractor.extractAudio.useMutation();
  const detectSensitiveMutation = trpc.securityTools.metadataExtractor.detectSensitive.useMutation();

  const handleExtract = async () => {
    if (!fileUrl.trim()) {
      toast.error("Please enter a file URL");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (fileType === "image") {
        result = await extractImageMutation.mutateAsync({ imageUrl: fileUrl });
      } else if (fileType === "document") {
        result = await extractDocumentMutation.mutateAsync({ documentUrl: fileUrl });
      } else {
        result = await extractAudioMutation.mutateAsync({ audioUrl: fileUrl });
      }

      setResults(result.metadata);
      toast.success("Metadata extracted successfully");

      // Detect sensitive data
      const sensitive = await detectSensitiveMutation.mutateAsync({ metadata: result.metadata });
      setSensitiveData(sensitive.analysis);
    } catch (error) {
      toast.error("Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-cyan-400">Metadata Extractor</h1>
        <p className="text-gray-400">Extract and analyze metadata from files</p>
      </div>

      <Card className="bg-gray-900 border-cyan-500/30 p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">File URL</label>
          <Input
            placeholder="https://example.com/file.jpg"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">File Type</label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
          >
            <option value="image">Image</option>
            <option value="document">Document</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <Button
          onClick={handleExtract}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 w-full"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
          Extract Metadata
        </Button>
      </Card>

      {sensitiveData && (
        <Card className={`${sensitiveData.risk_level === 'critical' ? 'border-red-500/30' : sensitiveData.risk_level === 'high' ? 'border-orange-500/30' : 'border-yellow-500/30'} bg-gray-900 p-4`}>
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className={`w-5 h-5 ${getRiskColor(sensitiveData.risk_level)}`} />
            <div>
              <h3 className="text-lg font-semibold text-cyan-400">Sensitive Data Detected</h3>
              <p className={`text-sm ${getRiskColor(sensitiveData.risk_level)} font-semibold`}>
                Risk Level: {sensitiveData.risk_level.toUpperCase()}
              </p>
            </div>
          </div>

          {sensitiveData.sensitive_fields && sensitiveData.sensitive_fields.length > 0 && (
            <div className="mb-3">
              <p className="text-gray-400 text-sm mb-2">Sensitive Fields Found:</p>
              <div className="flex flex-wrap gap-2">
                {sensitiveData.sensitive_fields.map((field: string, idx: number) => (
                  <span key={idx} className="bg-red-900/30 text-red-300 px-2 py-1 rounded text-sm">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sensitiveData.recommendations && sensitiveData.recommendations.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Recommendations:</p>
              <ul className="space-y-1">
                {sensitiveData.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-gray-300 text-sm flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {results && (
        <div className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/30 p-4">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">File Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Filename</p>
                <p className="text-cyan-300 break-all">{results.filename}</p>
              </div>
              <div>
                <p className="text-gray-400">File Type</p>
                <p className="text-cyan-300">{results.filetype}</p>
              </div>
              <div>
                <p className="text-gray-400">Size</p>
                <p className="text-cyan-300">{(results.filesize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-gray-400">MIME Type</p>
                <p className="text-cyan-300">{results.mime_type}</p>
              </div>
            </div>
          </Card>

          {results.width && (
            <Card className="bg-gray-900 border-purple-500/30 p-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Image Properties</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Dimensions</p>
                  <p className="text-purple-300">{results.width}x{results.height}</p>
                </div>
                <div>
                  <p className="text-gray-400">DPI</p>
                  <p className="text-purple-300">{results.dpi}</p>
                </div>
                <div>
                  <p className="text-gray-400">Color Space</p>
                  <p className="text-purple-300">{results.color_space}</p>
                </div>
                {results.camera_make && (
                  <div>
                    <p className="text-gray-400">Camera</p>
                    <p className="text-purple-300">{results.camera_make}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {results.gps_latitude && (
            <Card className="bg-red-900/20 border-red-500/30 p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">GPS Location Found</h3>
              <p className="text-red-300 text-sm">
                Latitude: {results.gps_latitude.toFixed(4)}, Longitude: {results.gps_longitude.toFixed(4)}
              </p>
            </Card>
          )}

          {results.author && (
            <Card className="bg-gray-900 border-blue-500/30 p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Document Information</h3>
              <div className="space-y-2 text-sm">
                {results.author && <div><p className="text-gray-400">Author</p><p className="text-blue-300">{results.author}</p></div>}
                {results.title && <div><p className="text-gray-400">Title</p><p className="text-blue-300">{results.title}</p></div>}
                {results.subject && <div><p className="text-gray-400">Subject</p><p className="text-blue-300">{results.subject}</p></div>}
              </div>
            </Card>
          )}

          {results.duration && (
            <Card className="bg-gray-900 border-green-500/30 p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Audio Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="text-green-300">{Math.floor(results.duration / 60)}:{(results.duration % 60).toString().padStart(2, '0')}</p>
                </div>
                <div>
                  <p className="text-gray-400">Bitrate</p>
                  <p className="text-green-300">{results.bitrate} kbps</p>
                </div>
                <div>
                  <p className="text-gray-400">Sample Rate</p>
                  <p className="text-green-300">{results.sample_rate} Hz</p>
                </div>
                <div>
                  <p className="text-gray-400">Channels</p>
                  <p className="text-green-300">{results.channels}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
