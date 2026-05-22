import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Car, Loader2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

type PlateLookupResult = {
  licensePlate: string;
  province: string;
  plateType: string;
  formatConfidence?: string;
  formatNotes?: string;
  lookedUpAt: string;
  providerConfigured?: boolean;
  realDataAvailable?: boolean;
  dataScope?: string;
  source?: string;
  vinSource?: string;
  providerReference?: string;
  make?: string;
  model?: string;
  year?: string | number;
  color?: string;
  vehicleType?: string;
  bodyClass?: string;
  fuelType?: string;
  registrationStatus?: string;
  registrationExpiry?: string;
  insuranceStatus?: string;
  safetyStatus?: string;
  emissionsStatus?: string;
  vin?: string | null;
};

export default function OntarioLicensePlate() {
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PlateLookupResult | null>(null);
  const [error, setError] = useState('');
  const plateLookup = trpc.osintTools.licensePlateLookup.useMutation();

  const handleLookup = async () => {
    const cleaned = licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!cleaned.match(/^[A-Z0-9]{6,8}$/)) {
      setError('Invalid Ontario license plate format');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await plateLookup.mutateAsync({ plate: cleaned, region: 'Ontario' });
      if (!response.success) {
        setError(response.error || 'Failed to lookup license plate');
        return;
      }
      setResults(response.data as PlateLookupResult);
    } catch (err) {
      setError('Failed to lookup license plate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">ONTARIO LICENSE PLATE LOOKUP</h1>
        <p className="text-gray-400">Look up vehicle information from Ontario license plates</p>
      </div>

      <Card className="bg-gray-900 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-pink-400 flex items-center gap-2">
            <Car className="w-5 h-5" />
            Plate Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-cyan-400 text-sm font-mono">LICENSE PLATE</label>
            <Input
              placeholder="ABC 1234 or ABC1234"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              className="bg-gray-800 border-cyan-500/30 text-white mt-2 font-mono"
            />
          </div>

          <Button
            onClick={handleLookup}
            disabled={isLoading || plateLookup.isPending}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isLoading || plateLookup.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                LOOKING UP...
              </>
            ) : (
              'LOOKUP PLATE'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card className="bg-gray-900 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400">
              {results.providerConfigured ? 'VEHICLE INFORMATION' : 'PLATE FORMAT RESULT'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Looked up at {new Date(results.lookedUpAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800 p-4 rounded border border-green-500/30 text-center">
              <p className="text-green-400 text-xs font-mono mb-2">LICENSE PLATE</p>
              <p className="text-3xl font-bold text-yellow-300 font-mono tracking-widest">{results.licensePlate}</p>
              <p className="text-green-400 text-xs font-mono mt-2">{results.province} - {results.plateType}</p>
              {results.formatConfidence && (
                <p className="text-gray-400 text-xs font-mono mt-1">
                  Format confidence: {results.formatConfidence.toUpperCase()}
                </p>
              )}
            </div>

            {!results.providerConfigured && (
              <div className="bg-yellow-950/30 p-4 rounded border border-yellow-500/30">
                <p className="text-yellow-300 text-sm font-semibold mb-2">AUTHORIZED PROVIDER REQUIRED</p>
                <p className="text-gray-300 text-sm">
                  {results.dataScope}
                </p>
                {results.formatNotes && (
                  <p className="text-gray-400 text-xs mt-2">{results.formatNotes}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">MAKE</p>
                <p className="text-lg font-bold text-green-300">{results.make || 'Provider required'}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">MODEL</p>
                <p className="text-lg font-bold text-green-300">{results.model || 'Provider required'}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">YEAR</p>
                <p className="text-lg font-bold text-green-300">{results.year || 'Provider required'}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">COLOR</p>
                <p className="text-lg font-bold text-green-300">{results.color || 'Provider required'}</p>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded border border-green-500/30">
              <p className="text-green-400 text-xs font-mono mb-3">REGISTRATION & STATUS</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Vehicle Type:</span>
                  <span className="text-yellow-300">{results.vehicleType || 'Provider required'}</span>
                </div>
                {results.bodyClass && (
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Body Class:</span>
                    <span className="text-yellow-300">{results.bodyClass}</span>
                  </div>
                )}
                {results.fuelType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Fuel Type:</span>
                    <span className="text-yellow-300">{results.fuelType}</span>
                  </div>
                )}
                {results.vin && (
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">VIN:</span>
                    <span className="text-yellow-300">{results.vin}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Registration Status:</span>
                  <span className={results.registrationStatus === 'Active' ? 'text-green-300' : 'text-red-300'}>
                    {results.registrationStatus || 'Provider required'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Registration Expiry:</span>
                  <span className="text-yellow-300">{results.registrationExpiry || 'Provider required'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Data Scope:</span>
                  <span className="text-yellow-300 text-right">{results.dataScope || 'Vehicle data only'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Insurance Status:</span>
                  <span className="text-green-300">{results.insuranceStatus || 'Provider required'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Safety Status:</span>
                  <span className="text-green-300">{results.safetyStatus || 'Provider required'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Emissions Status:</span>
                  <span className="text-green-300">{results.emissionsStatus || 'Provider required'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Source:</span>
                  <span className="text-yellow-300 text-right">{results.source}</span>
                </div>
                {results.vinSource && (
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">VIN Source:</span>
                    <span className="text-yellow-300 text-right">{results.vinSource}</span>
                  </div>
                )}
                {results.providerReference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-400">Provider Reference:</span>
                    <span className="text-yellow-300 text-right">{results.providerReference}</span>
                  </div>
                )}
                {results.formatNotes && (
                  <div className="pt-2 text-xs text-gray-400">
                    {results.formatNotes}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
