import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function WHOISLookup() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const lookupMutation = trpc.securityTools.whoislookup.lookup.useMutation();
  const checkExpirationMutation = trpc.securityTools.whoislookup.checkExpiration.useQuery(
    { domain: domain || "" },
    { enabled: false }
  );

  const handleLookup = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    setLoading(true);
    try {
      const result = await lookupMutation.mutateAsync({ domain });
      setResults(result.data);
      toast.success("WHOIS lookup completed");
    } catch (error) {
      toast.error("Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-cyan-400">WHOIS Lookup</h1>
        <p className="text-gray-400">Retrieve domain registration and ownership information</p>
      </div>

      <Card className="bg-gray-900 border-cyan-500/30 p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Domain</label>
          <Input
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <Button
          onClick={handleLookup}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 w-full"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
          Lookup WHOIS
        </Button>
      </Card>

      {results && (
        <div className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/30 p-4">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Registrar Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-400">Registrar</p>
                <p className="text-cyan-300">{results.registrar}</p>
              </div>
              <div>
                <p className="text-gray-400">Registrar URL</p>
                <a href={results.registrar_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                  {results.registrar_url}
                </a>
              </div>
              <div>
                <p className="text-gray-400">Registrar Email</p>
                <p className="text-cyan-300">{results.registrar_email}</p>
              </div>
            </div>
          </Card>

          {results.registrant && (
            <Card className="bg-gray-900 border-purple-500/30 p-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Registrant Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-400">Name</p>
                  <p className="text-purple-300">{results.registrant.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Organization</p>
                  <p className="text-purple-300">{results.registrant.organization}</p>
                </div>
                <div>
                  <p className="text-gray-400">Country</p>
                  <p className="text-purple-300">{results.registrant.country}</p>
                </div>
              </div>
            </Card>
          )}

          {results.nameservers && results.nameservers.length > 0 && (
            <Card className="bg-gray-900 border-blue-500/30 p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Nameservers</h3>
              <div className="space-y-1">
                {results.nameservers.map((ns: string, idx: number) => (
                  <p key={idx} className="text-blue-300 text-sm font-mono">{ns}</p>
                ))}
              </div>
            </Card>
          )}

          {results.creation_date && (
            <Card className="bg-gray-900 border-green-500/30 p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Domain Dates</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-400">Created</p>
                  <p className="text-green-300">{new Date(results.creation_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Expires</p>
                  <p className="text-green-300">{new Date(results.expiration_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Updated</p>
                  <p className="text-green-300">{new Date(results.updated_date).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          )}

          {results.status && results.status.length > 0 && (
            <Card className="bg-gray-900 border-yellow-500/30 p-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Domain Status</h3>
              <div className="flex flex-wrap gap-2">
                {results.status.map((status: string, idx: number) => (
                  <span key={idx} className="bg-yellow-900/30 text-yellow-300 px-3 py-1 rounded text-sm font-mono">
                    {status}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {results.dnssec && (
            <Card className={`${results.dnssec === 'signedDelegationSigner' ? 'border-green-500/30' : 'border-red-500/30'} bg-gray-900 p-4`}>
              <h3 className="text-lg font-semibold mb-2">DNSSEC</h3>
              <p className={results.dnssec === 'signedDelegationSigner' ? 'text-green-400' : 'text-red-400'}>
                {results.dnssec}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
