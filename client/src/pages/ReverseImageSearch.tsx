import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function ReverseImageSearch() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyzeMutation = trpc.securityTools.reverseImageSearch.analyze.useMutation();
  const detectObjectsMutation = trpc.securityTools.reverseImageSearch.detectObjects.useMutation();
  const extractTextMutation = trpc.securityTools.reverseImageSearch.extractText.useMutation();

  const handleAnalyze = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeMutation.mutateAsync({ imageUrl });
      setResults(result.data);
      toast.success("Image analysis completed");
    } catch (error) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDetectObjects = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    setLoading(true);
    try {
      const result = await detectObjectsMutation.mutateAsync({ imageUrl });
      toast.success(`Detected ${result.objects.length} objects`);
      setResults(prev => ({ ...prev, detectedObjects: result.objects }));
    } catch (error) {
      toast.error("Object detection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExtractText = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    setLoading(true);
    try {
      const result = await extractTextMutation.mutateAsync({ imageUrl });
      toast.success("Text extraction completed");
      setResults(prev => ({ ...prev, extractedText: result.text }));
    } catch (error) {
      toast.error("Text extraction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-cyan-400">Reverse Image Search</h1>
        <p className="text-gray-400">Analyze images and find similar images across the web</p>
      </div>

      <Card className="bg-gray-900 border-cyan-500/30 p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Image URL</label>
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Analyze Image
          </Button>
          <Button
            onClick={handleDetectObjects}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Detect Objects
          </Button>
          <Button
            onClick={handleExtractText}
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Extract Text
          </Button>
        </div>
      </Card>

      {results && (
        <div className="space-y-4">
          {results.hash && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Image Hash</h3>
              <p className="text-gray-300 font-mono text-sm break-all">{results.hash}</p>
            </Card>
          )}

          {results.dimensions && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Image Properties</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Dimensions</p>
                  <p className="text-cyan-300">{results.dimensions.width}x{results.dimensions.height}</p>
                </div>
                <div>
                  <p className="text-gray-400">Format</p>
                  <p className="text-cyan-300">{results.format}</p>
                </div>
                <div>
                  <p className="text-gray-400">Size</p>
                  <p className="text-cyan-300">{(results.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="text-gray-400">Color Space</p>
                  <p className="text-cyan-300">{results.metadata?.colorSpace}</p>
                </div>
              </div>
            </Card>
          )}

          {results.detectedObjects && results.detectedObjects.length > 0 && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Detected Objects</h3>
              <div className="flex flex-wrap gap-2">
                {results.detectedObjects.map((obj: string, idx: number) => (
                  <span key={idx} className="bg-cyan-900/30 text-cyan-300 px-3 py-1 rounded text-sm">
                    {obj}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {results.extractedText && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Extracted Text</h3>
              <p className="text-gray-300 text-sm">{results.extractedText}</p>
            </Card>
          )}

          {results.similarImages && results.similarImages.length > 0 && (
            <Card className="bg-gray-900 border-cyan-500/30 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Similar Images</h3>
              <div className="space-y-3">
                {results.similarImages.map((img: any, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 p-3 rounded border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-cyan-300 font-medium">{img.title}</p>
                        <p className="text-gray-400 text-sm">{img.source}</p>
                      </div>
                      <span className="text-green-400 font-semibold">{img.similarity}%</span>
                    </div>
                    <a href={img.url} target="_blank" rel="noopener noreferrer" className="text-cyan-500 text-sm hover:underline truncate block">
                      {img.url}
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
