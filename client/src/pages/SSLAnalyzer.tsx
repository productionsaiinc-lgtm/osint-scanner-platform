import { useState } from 'react';
import { Lock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SSLIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  remediation: string;
}

interface CipherSuite {
  name: string;
  protocol: string;
  strength: 'strong' | 'weak' | 'deprecated';
}

export default function SSLAnalyzer() {
  const [hostname, setHostname] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const mockAnalyze = async (host: string) => ({
    success: true,
    results: {
      target: host,
      scan_date: new Date(),
      certificate: {
        subject: `CN=${host}`,
        issuer: "Let's Encrypt Authority X3",
        valid_from: new Date('2024-01-01'),
        valid_to: new Date('2025-01-01'),
        fingerprint: 'AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90',
        version: '3',
        serial_number: '1234567890ABCDEF',
        public_key_algorithm: 'RSA',
        signature_algorithm: 'sha256WithRSAEncryption',
      },
      supported_protocols: ['TLSv1.2', 'TLSv1.3'],
      cipher_suites: [
        {
          name: 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
          protocol: 'TLSv1.2',
          strength: 'strong' as const,
        },
        {
          name: 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
          protocol: 'TLSv1.2',
          strength: 'strong' as const,
        },
      ],
      security_issues: [
        {
          type: 'header',
          severity: 'medium' as const,
          title: 'Missing Strict-Transport-Security Header',
          description: 'HSTS header not present in response',
          remediation: 'Add HSTS header to enforce HTTPS',
        },
      ],
      overall_grade: 'A' as const,
      risk_score: 20,
    },
  });

  const handleAnalyze = async () => {
    if (!hostname.trim()) {
      alert('Please enter a hostname');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await mockAnalyze(hostname);
      if (result.success) {
        setAnalysisResults(result.results);
      }
    } catch (error) {
      alert('Error analyzing SSL configuration');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900 text-red-100';
      case 'high':
        return 'bg-orange-900 text-orange-100';
      case 'medium':
        return 'bg-yellow-900 text-yellow-100';
      case 'low':
        return 'bg-blue-900 text-blue-100';
      default:
        return 'bg-gray-900 text-gray-100';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-500';
      case 'B':
        return 'text-blue-500';
      case 'C':
        return 'text-yellow-500';
      case 'D':
      case 'E':
        return 'text-orange-500';
      case 'F':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getCipherColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-900 text-green-100';
      case 'weak':
        return 'bg-red-900 text-red-100';
      case 'deprecated':
        return 'bg-orange-900 text-orange-100';
      default:
        return 'bg-gray-900 text-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lock className="w-8 h-8" />
          SSL/TLS Certificate Analyzer
        </h1>
        <p className="text-gray-400">Analyze SSL/TLS configuration and certificate details</p>
      </div>

      {/* Input Section */}
      <Card className="p-6 border-border bg-card">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Hostname</label>
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                disabled={isAnalyzing}
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !hostname.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {analysisResults && (
        <div className="space-y-6">
          {/* Grade and Summary */}
          <Card className="p-6 border-border bg-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Overall Grade</p>
                <p className={`text-5xl font-bold ${getGradeColor(analysisResults.overall_grade)}`}>
                  {analysisResults.overall_grade}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Risk Score</p>
                <p className="text-3xl font-bold">{analysisResults.risk_score}/100</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Supported Protocols</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.supported_protocols.map((protocol: string) => (
                    <Badge key={protocol} variant="outline">
                      {protocol}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Certificate Details */}
          {analysisResults.certificate && (
            <Card className="p-6 border-border bg-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Certificate Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Subject</p>
                  <p className="font-mono text-gray-300">{analysisResults.certificate.subject}</p>
                </div>
                <div>
                  <p className="text-gray-400">Issuer</p>
                  <p className="font-mono text-gray-300">{analysisResults.certificate.issuer}</p>
                </div>
                <div>
                  <p className="text-gray-400">Valid From</p>
                  <p className="font-mono text-gray-300">
                    {new Date(analysisResults.certificate.valid_from).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Valid To</p>
                  <p className="font-mono text-gray-300">
                    {new Date(analysisResults.certificate.valid_to).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Public Key Algorithm</p>
                  <p className="font-mono text-gray-300">{analysisResults.certificate.public_key_algorithm}</p>
                </div>
                <div>
                  <p className="text-gray-400">Signature Algorithm</p>
                  <p className="font-mono text-gray-300">{analysisResults.certificate.signature_algorithm}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Cipher Suites */}
          {analysisResults.cipher_suites && analysisResults.cipher_suites.length > 0 && (
            <Card className="p-6 border-border bg-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Cipher Suites ({analysisResults.cipher_suites.length})
              </h2>
              <div className="space-y-2">
                {analysisResults.cipher_suites.map((cipher: CipherSuite, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background rounded">
                    <div>
                      <p className="font-mono text-sm text-gray-300">{cipher.name}</p>
                      <p className="text-xs text-gray-500">{cipher.protocol}</p>
                    </div>
                    <Badge className={getCipherColor(cipher.strength)}>
                      {cipher.strength.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Security Issues */}
          {analysisResults.security_issues && analysisResults.security_issues.length > 0 && (
            <Card className="p-6 border-border bg-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Security Issues ({analysisResults.security_issues.length})
              </h2>
              <div className="space-y-4">
                {analysisResults.security_issues.map((issue: SSLIssue, index: number) => (
                  <div key={index} className="p-4 border border-border rounded">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold">{issue.title}</h3>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{issue.description}</p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-300">Remediation: </span>
                      <span className="text-gray-400">{issue.remediation}</span>
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* No Issues */}
          {(!analysisResults.security_issues || analysisResults.security_issues.length === 0) && (
            <Card className="p-6 border-border bg-card text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-lg font-semibold">No security issues found!</p>
              <p className="text-gray-400">Your SSL/TLS configuration looks good.</p>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!analysisResults && (
        <Card className="p-12 border-border bg-card text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-semibold mb-2">Ready to analyze</p>
          <p className="text-gray-400">Enter a hostname above to analyze its SSL/TLS configuration</p>
        </Card>
      )}
    </div>
  );
}
