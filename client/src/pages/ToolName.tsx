import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function EmailValidator() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = async () => {
    setLoading(true);
    try {
      // Simple email validation
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setResult({
        email,
        isValid,
        message: isValid ? "Valid email address" : "Invalid email address",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Validator</h1>
        <p className="text-gray-400">Check if an email address is valid</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>Enter an email to validate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
          <Button
            onClick={validateEmail}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? "Validating..." : "Validate"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={`bg-gray-900 border-gray-800 ${result.isValid ? 'border-green-800' : 'border-red-800'}`}>
          <CardHeader>
            <CardTitle className={result.isValid ? 'text-green-400' : 'text-red-400'}>
              {result.message}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Email: {result.email}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}