import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Smartphone,
  Search,
  AlertCircle,
  Cpu,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface IMEIResult {
  imei: string;
  isValid: boolean;
  deviceModel: string;
  manufacturer: string;
  deviceType: string;
  releaseYear: number;
  tac: string;
  snr: string;
  checkDigit: string;
  isBlacklisted: boolean;
  blacklistStatus: string;
  supportedBands: string[];
  networkTechnology: string[];
}

export function IMEIChecker() {
  const [imei, setImei] = useState('');
  const [results, setResults] = useState<IMEIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateIMEI = (value: string): boolean => {
    // Remove spaces and dashes
    const cleanIMEI = value.replace(/[\s-]/g, '');

    // Check if it's 15 digits
    if (!/^\d{15}$/.test(cleanIMEI)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let digit = parseInt(cleanIMEI[i], 10);

      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
    }

    return sum % 10 === 0;
  };

  const handleSearch = async () => {
    if (!imei.trim()) {
      setError('Please enter an IMEI number');
      return;
    }

    if (!validateIMEI(imei)) {
      setError('Invalid IMEI format. IMEI must be 15 digits.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Simulate API call - replace with actual tRPC call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const cleanIMEI = imei.replace(/[\s-]/g, '');

      // Mock result
      const mockResult: IMEIResult = {
        imei: cleanIMEI,
        isValid: true,
        deviceModel: 'iPhone 14 Pro Max',
        manufacturer: 'Apple Inc.',
        deviceType: 'Smartphone',
        releaseYear: 2022,
        tac: cleanIMEI.substring(0, 8),
        snr: cleanIMEI.substring(8, 14),
        checkDigit: cleanIMEI[14],
        isBlacklisted: false,
        blacklistStatus: 'Not Blacklisted',
        supportedBands: ['GSM 850/900/1800/1900', 'UMTS Band 1/2/4/5/8', 'LTE Band 1-32'],
        networkTechnology: ['2G GSM', '3G UMTS', '4G LTE', '5G NR'],
      };

      setResults(mockResult);
    } catch (err) {
      setError('Failed to check IMEI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-neon-green flex items-center gap-2">
          <Cpu className="w-8 h-8" />
          IMEI Checker
        </h1>
        <p className="text-gray-400 mt-2">Validate IMEI numbers and retrieve device information</p>
      </div>

      {/* Search Card */}
      <Card className="border-neon-green/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-neon-green">IMEI Validation</CardTitle>
          <CardDescription>Enter an IMEI number to validate and retrieve device details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter IMEI (15 digits, e.g., 358240051111110)"
                value={imei}
                onChange={(e) => setImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                onKeyPress={handleKeyPress}
                className="border-neon-green/30 bg-black/40 text-neon-green placeholder-gray-500 font-mono"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-neon-green hover:bg-neon-green/80 text-black font-semibold"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Checking...' : 'Check'}
            </Button>
          </div>

          <div className="text-sm text-gray-400">
            IMEI must be exactly 15 digits. Format: NNNNNNNNNNNNNNNN
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Status Card */}
          <Card className={`border-l-4 ${results.isValid && !results.isBlacklisted ? 'border-l-neon-green' : 'border-l-neon-red'} border-gray-500/30 bg-black/40`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {results.isValid && !results.isBlacklisted ? (
                    <CheckCircle2 className="w-6 h-6 text-neon-green" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-neon-red" />
                  )}
                  <div>
                    <div className="text-sm text-gray-400">IMEI Status</div>
                    <div className={`text-lg font-bold ${results.isValid && !results.isBlacklisted ? 'text-neon-green' : 'text-neon-red'}`}>
                      {results.isValid ? 'Valid' : 'Invalid'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">IMEI Number</div>
                  <div className="text-lg font-mono text-neon-green">{results.imei}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device Details */}
            <Card className="border-neon-cyan/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-neon-cyan flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400">Device Model</div>
                  <div className="text-sm font-semibold text-white">{results.deviceModel}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Manufacturer</div>
                  <div className="text-sm font-semibold text-white">{results.manufacturer}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Device Type</div>
                  <div className="text-sm font-semibold text-white">{results.deviceType}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Release Year</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-neon-cyan" />
                    <span className="text-sm font-semibold text-white">{results.releaseYear}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* IMEI Components */}
            <Card className="border-neon-yellow/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-neon-yellow flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  IMEI Components
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400">TAC (Type Allocation Code)</div>
                  <div className="text-sm font-mono text-white bg-black/60 p-2 rounded mt-1">{results.tac}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">SNR (Serial Number)</div>
                  <div className="text-sm font-mono text-white bg-black/60 p-2 rounded mt-1">{results.snr}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Check Digit</div>
                  <div className="text-sm font-mono text-white bg-black/60 p-2 rounded mt-1">{results.checkDigit}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blacklist Status */}
          <Card className={`border-l-4 ${results.isBlacklisted ? 'border-l-neon-red' : 'border-l-neon-green'} border-gray-500/30 bg-black/40`}>
            <CardHeader>
              <CardTitle className="text-neon-pink">Blacklist Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {results.isBlacklisted ? (
                  <AlertTriangle className="w-6 h-6 text-neon-red" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-neon-green" />
                )}
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <div className={`text-lg font-bold ${results.isBlacklisted ? 'text-neon-red' : 'text-neon-green'}`}>
                    {results.blacklistStatus}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Support */}
          <Card className="border-neon-purple/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-neon-purple">Network Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-white mb-2">Supported Bands</div>
                <div className="flex flex-wrap gap-2">
                  {results.supportedBands.map((band, idx) => (
                    <span key={idx} className="px-3 py-1 bg-neon-purple/20 border border-neon-purple/50 rounded text-xs text-neon-purple">
                      {band}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-2">Network Technologies</div>
                <div className="flex flex-wrap gap-2">
                  {results.networkTechnology.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan/50 rounded text-xs text-neon-cyan">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Alert */}
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-400">
              IMEI information is based on public device databases. Use for OSINT and research purposes only. Blacklist status may not reflect real-time carrier databases.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Info Alert */}
      {!results && (
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-400">
            Enter a 15-digit IMEI number to validate and retrieve device information including manufacturer, model, and network support details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
