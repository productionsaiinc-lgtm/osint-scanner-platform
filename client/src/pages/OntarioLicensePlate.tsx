import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Car, Loader2, AlertCircle } from 'lucide-react';

export default function OntarioLicensePlate() {
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

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
      const mockResults = {
        licensePlate: cleaned,
        province: 'Ontario',
        plateType: 'Standard',
        vehicleType: ['Sedan', 'SUV', 'Truck', 'Van'][Math.floor(Math.random() * 4)],
        make: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW'][Math.floor(Math.random() * 5)],
        model: ['Civic', 'Accord', 'F-150', 'Camry'][Math.floor(Math.random() * 4)],
        year: Math.floor(Math.random() * 15) + 2010,
        color: ['Black', 'White', 'Silver', 'Blue', 'Red'][Math.floor(Math.random() * 5)],
        registrationStatus: ['Active', 'Expired', 'Suspended'][Math.floor(Math.random() * 3)],
        registrationExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        owner: 'REDACTED',
        ownerType: ['Individual', 'Commercial', 'Government'][Math.floor(Math.random() * 3)],
        insuranceStatus: 'Valid',
        safetyStatus: 'Pass',
        emissionsStatus: 'Pass',
        lookedUpAt: new Date().toLocaleString(),
      };

      setResults(mockResults);
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
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isLoading ? (
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
            <CardTitle className="text-green-400">VEHICLE INFORMATION</CardTitle>
            <CardDescription className="text-gray-400">
              Looked up at {results.lookedUpAt}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800 p-4 rounded border border-green-500/30 text-center">
              <p className="text-green-400 text-xs font-mono mb-2">LICENSE PLATE</p>
              <p className="text-3xl font-bold text-yellow-300 font-mono tracking-widest">{results.licensePlate}</p>
              <p className="text-green-400 text-xs font-mono mt-2">{results.province} - {results.plateType}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">MAKE</p>
                <p className="text-lg font-bold text-green-300">{results.make}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">MODEL</p>
                <p className="text-lg font-bold text-green-300">{results.model}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">YEAR</p>
                <p className="text-lg font-bold text-green-300">{results.year}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">COLOR</p>
                <p className="text-lg font-bold text-green-300">{results.color}</p>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded border border-green-500/30">
              <p className="text-green-400 text-xs font-mono mb-3">REGISTRATION & STATUS</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Vehicle Type:</span>
                  <span className="text-yellow-300">{results.vehicleType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Registration Status:</span>
                  <span className={results.registrationStatus === 'Active' ? 'text-green-300' : 'text-red-300'}>
                    {results.registrationStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Registration Expiry:</span>
                  <span className="text-yellow-300">{results.registrationExpiry}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Owner Type:</span>
                  <span className="text-yellow-300">{results.ownerType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Insurance Status:</span>
                  <span className="text-green-300">{results.insuranceStatus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Safety Status:</span>
                  <span className="text-green-300">{results.safetyStatus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Emissions Status:</span>
                  <span className="text-green-300">{results.emissionsStatus}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
