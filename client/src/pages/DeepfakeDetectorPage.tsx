import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function DeepfakeDetectorPage() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResults({
        url: url,
        media_type: "video",
        duration: "2:34",
        resolution: "1920x1080",
        fps: 30,
        deepfake_score: 23,
        confidence: 89,
        is_deepfake: false,
        detection_method: "Facial Recognition + Audio Analysis",
        facial_inconsistencies: 2,
        audio_inconsistencies: 1,
        artifacts_detected: ["slight_blur_artifacts", "lighting_inconsistencies"],
        recommendations: [
          "Video appears to be authentic",
          "Minor compression artifacts detected",
          "Audio and video are synchronized"
        ],
        analysis_time: "4.2s"
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deepfake Detector</h1>
        <p className="text-muted-foreground">Analyze images and videos to detect deepfakes and synthetic media</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
          <CardDescription>Enter URL or upload media file for deepfake analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter media URL (image or video)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Detection Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Deepfake Probability</p>
                  <p className="text-3xl font-bold">{results.deepfake_score}%</p>
                </div>
                <Badge variant={results.is_deepfake ? "destructive" : "default"} className="text-lg py-2 px-4">
                  {results.is_deepfake ? "DEEPFAKE DETECTED" : "AUTHENTIC"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence Level</p>
                <p className="font-semibold">{results.confidence}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-semibold capitalize">{results.media_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{results.duration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolution</p>
                <p className="font-semibold">{results.resolution}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">FPS</p>
                <p className="font-semibold">{results.fps}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Detection Method</p>
                <p className="font-semibold">{results.detection_method}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Facial Inconsistencies</p>
                <p className="font-semibold">{results.facial_inconsistencies}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audio Inconsistencies</p>
                <p className="font-semibold">{results.audio_inconsistencies}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Artifacts Detected</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {results.artifacts_detected.map((artifact: string) => (
                    <Badge key={artifact} variant="secondary" className="capitalize">
                      {artifact.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
