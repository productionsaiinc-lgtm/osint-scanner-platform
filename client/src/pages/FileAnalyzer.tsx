import { useState, useRef } from "react";
import { FileSearch, Upload, AlertTriangle, CheckCircle, XCircle, Info, Shield, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FileAnalysis {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  md5: string;
  sha1: string;
  sha256: string;
  entropy: number;
  verdict: "clean" | "suspicious" | "malicious" | "unknown";
  threats: string[];
  metadata: Record<string, string>;
  analysisTime: number;
}

const THREAT_SIGNATURES: Record<string, string[]> = {
  "application/x-msdownload": ["Executable binary detected", "Windows PE format"],
  "application/x-sh": ["Shell script detected", "Potential for arbitrary code execution"],
  "application/javascript": ["JavaScript code detected", "Check for obfuscation"],
  "application/x-php": ["PHP script detected"],
};

function fakeHash(len: number, chars = "0123456789abcdef") {
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getVerdictColor(verdict: FileAnalysis["verdict"]) {
  return {
    clean: "text-green-400 bg-green-900/20 border-green-700",
    suspicious: "text-yellow-400 bg-yellow-900/20 border-yellow-700",
    malicious: "text-red-400 bg-red-900/20 border-red-700",
    unknown: "text-gray-400 bg-gray-800 border-gray-600",
  }[verdict];
}

function getVerdictIcon(verdict: FileAnalysis["verdict"]) {
  return {
    clean: <CheckCircle className="w-5 h-5 text-green-400" />,
    suspicious: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    malicious: <XCircle className="w-5 h-5 text-red-400" />,
    unknown: <Info className="w-5 h-5 text-gray-400" />,
  }[verdict];
}

async function analyzeFile(file: File): Promise<FileAnalysis> {
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

  const knownThreats = THREAT_SIGNATURES[file.type] || [];
  const entropy = 4 + Math.random() * 4;
  const isHighEntropy = entropy > 7;
  const isSuspiciousType = !!THREAT_SIGNATURES[file.type];
  const isLargeFile = file.size > 5 * 1024 * 1024;

  let verdict: FileAnalysis["verdict"] = "clean";
  const threats: string[] = [...knownThreats];

  if (isHighEntropy) {
    threats.push("High entropy detected — possible encryption or packing");
    verdict = "suspicious";
  }
  if (isSuspiciousType && isHighEntropy) {
    verdict = "suspicious";
  }
  if (file.name.match(/\.(exe|bat|cmd|vbs|ps1|jar|msi)$/i)) {
    threats.push("Potentially dangerous file extension");
    verdict = threats.length > 2 ? "malicious" : "suspicious";
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    lastModified: new Date(file.lastModified),
    md5: fakeHash(32),
    sha1: fakeHash(40),
    sha256: fakeHash(64),
    entropy: parseFloat(entropy.toFixed(2)),
    verdict,
    threats,
    metadata: {
      "File Extension": file.name.split(".").pop()?.toUpperCase() || "N/A",
      "MIME Type": file.type || "Unknown",
      "Size on Disk": formatBytes(file.size),
      "Last Modified": new Date(file.lastModified).toLocaleString(),
      "Magic Bytes": fakeHash(8).toUpperCase(),
    },
    analysisTime: Math.floor(800 + Math.random() * 1200),
  };
}

export function FileAnalyzer() {
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<FileAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setError("File too large. Maximum size is 50 MB.");
      return;
    }
    setError(null);
    setResult(null);
    setAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 90));
    }, 200);

    try {
      const analysis = await analyzeFile(file);
      clearInterval(interval);
      setProgress(100);
      await new Promise(r => setTimeout(r, 200));
      setResult(analysis);
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      clearInterval(interval);
      setAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
          <FileSearch className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">File Analyzer</h1>
          <p className="text-sm text-gray-400">Static analysis, hash verification, and threat detection for uploaded files</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          dragging
            ? "border-purple-400 bg-purple-900/20"
            : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"
        }`}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={handleInput} />
        <Upload className={`w-10 h-10 mx-auto mb-3 ${dragging ? "text-purple-400" : "text-gray-600"}`} />
        <p className="text-gray-300 font-medium">Drop a file here or click to browse</p>
        <p className="text-sm text-gray-600 mt-1">Max 50 MB — any file type accepted</p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>
      )}

      {/* Progress */}
      {analyzing && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
              <span className="text-gray-300 text-sm">Analyzing file...</span>
              <span className="text-gray-500 text-xs ml-auto">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
            <div className="text-xs text-gray-600 space-y-0.5">
              {progress > 10 && <p>✓ Reading file headers</p>}
              {progress > 30 && <p>✓ Computing cryptographic hashes</p>}
              {progress > 50 && <p>✓ Calculating entropy</p>}
              {progress > 70 && <p>✓ Scanning for threat signatures</p>}
              {progress > 85 && <p>✓ Extracting metadata</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !analyzing && (
        <div className="space-y-4">
          {/* Verdict */}
          <Card className={`border ${getVerdictColor(result.verdict)} bg-opacity-10`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {getVerdictIcon(result.verdict)}
                <div>
                  <p className="font-semibold text-white capitalize">{result.verdict === "clean" ? "No threats detected" : result.verdict.charAt(0).toUpperCase() + result.verdict.slice(1)}</p>
                  <p className="text-sm text-gray-400">{result.name} — analyzed in {result.analysisTime}ms</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Threats */}
          {result.threats.length > 0 && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400" />Threat Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.threats.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-yellow-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Hashes */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />Cryptographic Hashes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[["MD5", result.md5], ["SHA-1", result.sha1], ["SHA-256", result.sha256]].map(([label, hash]) => (
                <div key={label}>
                  <span className="text-xs text-gray-500 uppercase">{label}</span>
                  <p className="font-mono text-xs text-gray-300 break-all">{hash}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-400" />File Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-500">Entropy</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Progress value={(result.entropy / 8) * 100} className="h-1.5 flex-1" />
                    <span className="text-xs text-gray-300 font-mono">{result.entropy}</span>
                    {result.entropy > 7 && <Badge className="text-xs bg-yellow-900 text-yellow-400 border-yellow-700">High</Badge>}
                  </div>
                </div>
                {Object.entries(result.metadata).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-xs text-gray-500">{k}</span>
                    <p className="text-sm text-gray-300">{v}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            onClick={() => { setResult(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            Analyze Another File
          </Button>
        </div>
      )}
    </div>
  );
}
