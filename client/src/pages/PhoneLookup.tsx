import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Smartphone,
  Search,
  AlertCircle,
  MapPin,
  Building2,
  Phone,
  Globe,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface PhoneResult {
  phoneNumber: string;
  isValid: boolean;
  carrier: string;
  country: string;
  countryCode: string;
  region: string;
  timezone: string;
  type: 'mobile' | 'landline' | 'voip' | 'unknown';
  operatorName: string;
  portabilityStatus: string;
  lastUpdated: string;
}

export function PhoneLookup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [results, setResults] = useState<PhoneResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Simulate API call - replace with actual tRPC call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock result
      const mockResult: PhoneResult = {
        phoneNumber: phoneNumber,
        isValid: true,
        carrier: 'Verizon Wireless',
        country: 'United States',
        countryCode: '+1',
        region: 'California',
        timezone: 'Pacific Time (PT)',
        type: 'mobile',
        operatorName: 'Verizon Communications',
        portabilityStatus: 'Portable',
        lastUpdated: new Date().toISOString(),
      };

      setResults(mockResult);
    } catch (err) {
      setError('Failed to lookup phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-neon-cyan" />;
      case 'landline':
        return <Phone className="w-5 h-5 text-neon-yellow" />;
      case 'voip':
        return <Globe className="w-5 h-5 text-neon-purple" />;
      default:
        return <AlertCircle className="w-5 h-5 text-neon-pink" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-neon-cyan flex items-center gap-2">
          <Smartphone className="w-8 h-8" />
          Phone Number Lookup
        </h1>
        <p className="text-gray-400 mt-2">Identify phone number details, carrier, and location information</p>
      </div>

      {/* Search Card */}
      <Card className="border-neon-cyan/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-neon-cyan">Phone Number Lookup</CardTitle>
          <CardDescription>Enter a phone number to retrieve carrier and location information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter phone number (e.g., +1-555-123-4567 or 5551234567)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-neon-cyan/30 bg-black/40 text-neon-cyan placeholder-gray-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Lookup'}
            </Button>
          </div>

          <div className="text-sm text-gray-400">
            Supported formats: +1-555-123-4567, (555) 123-4567, 555-123-4567, 5551234567
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
          <Card className={`border-l-4 ${results.isValid ? 'border-l-neon-green' : 'border-l-neon-red'} border-gray-500/30 bg-black/40`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {results.isValid ? (
                    <CheckCircle2 className="w-6 h-6 text-neon-green" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-neon-red" />
                  )}
                  <div>
                    <div className="text-sm text-gray-400">Phone Number Status</div>
                    <div className={`text-lg font-bold ${results.isValid ? 'text-neon-green' : 'text-neon-red'}`}>
                      {results.isValid ? 'Valid' : 'Invalid'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Phone Number</div>
                  <div className="text-lg font-mono text-neon-cyan">{results.phoneNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Carrier Information */}
            <Card className="border-neon-yellow/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-neon-yellow flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Carrier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400">Carrier</div>
                  <div className="text-sm font-semibold text-white">{results.carrier}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Operator</div>
                  <div className="text-sm font-semibold text-white">{results.operatorName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Type</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(results.type)}
                    <span className="text-sm font-semibold text-white capitalize">{results.type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Portability</div>
                  <div className="text-sm font-semibold text-white">{results.portabilityStatus}</div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-neon-purple/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-neon-purple flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400">Country</div>
                  <div className="text-sm font-semibold text-white">{results.country}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Country Code</div>
                  <div className="text-sm font-mono text-white">{results.countryCode}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Region</div>
                  <div className="text-sm font-semibold text-white">{results.region}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Timezone</div>
                  <div className="text-sm font-semibold text-white">{results.timezone}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          <Card className="border-neon-pink/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-neon-pink">Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-neon-pink/20 rounded p-3">
                  <div className="text-xs text-gray-400">Last Updated</div>
                  <div className="text-sm font-mono text-neon-pink mt-1">
                    {new Date(results.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Alert */}
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-400">
              Phone number lookup results are based on public carrier databases and may not reflect real-time changes. Use for OSINT and research purposes only.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Info Alert */}
      {!results && (
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-400">
            Enter a phone number to retrieve carrier, location, and validation information. Supports international formats.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
