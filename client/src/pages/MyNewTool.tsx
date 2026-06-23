import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function MyNewTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Call your backend API or tRPC procedure here
      // const result = await trpc.myTool.analyze.useMutation();
      setResult({ success: true, data: "Your result here" });
    } catch (error) {
      setResult({ success: false, error: "Error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My New Tool</h1>
        <p className="text-gray-400">Description of what this tool does</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Tool Input</CardTitle>
          <CardDescription>Enter your data here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
          <Button
            onClick={handleAnalyze}
            disabled={loading || !input}
            className="w-full"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <pre className="bg-gray-800 p-4 rounded text-green-400">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            ) : (
              <p className="text-red-400">{result.error}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}