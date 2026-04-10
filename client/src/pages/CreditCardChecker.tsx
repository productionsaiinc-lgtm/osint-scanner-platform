import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function CreditCardChecker() {
  const [cardNumber, setCardNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const luhnCheck = (num: string) => {
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const getCardType = (num: string) => {
    const patterns: { [key: string]: RegExp } = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(num)) return type.toUpperCase();
    }
    return 'UNKNOWN';
  };

  const handleCheck = async () => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!cleaned.match(/^\d{13,19}$/)) {
      setError('Invalid card number format');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const isValid = luhnCheck(cleaned);
      const cardType = getCardType(cleaned);

      const mockResults = {
        cardNumber: `****-****-****-${cleaned.slice(-4)}`,
        cardType,
        isValid,
        luhnValid: isValid,
        length: cleaned.length,
        issuer: cardType === 'VISA' ? 'Visa Inc.' : cardType === 'MASTERCARD' ? 'Mastercard' : 'Unknown',
        binNumber: cleaned.slice(0, 6),
        lastFour: cleaned.slice(-4),
        checkedAt: new Date().toLocaleString(),
      };

      setResults(mockResults);
    } catch (err) {
      setError('Failed to check card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">CREDIT CARD CHECKER</h1>
        <p className="text-gray-400">Validate credit card numbers and detect card type</p>
      </div>

      <Card className="bg-gray-900 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-pink-400 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Card Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-cyan-400 text-sm font-mono">CARD NUMBER</label>
            <Input
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="bg-gray-800 border-cyan-500/30 text-white mt-2"
            />
          </div>

          <Button
            onClick={handleCheck}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                CHECKING...
              </>
            ) : (
              'CHECK CARD'
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
            <CardTitle className="text-green-400 flex items-center gap-2">
              {results.isValid ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  VALID CARD
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  INVALID CARD
                </>
              )}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Checked at {results.checkedAt}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">CARD TYPE</p>
                <p className="text-lg font-bold text-green-300">{results.cardType}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">LENGTH</p>
                <p className="text-lg font-bold text-green-300">{results.length} digits</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">BIN</p>
                <p className="text-lg font-bold text-green-300">{results.binNumber}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-green-500/30">
                <p className="text-green-400 text-xs font-mono">LUHN CHECK</p>
                <p className="text-lg font-bold text-green-300">{results.luhnValid ? 'PASS' : 'FAIL'}</p>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded border border-green-500/30">
              <p className="text-green-400 text-xs font-mono mb-3">CARD DETAILS</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Masked Number:</span>
                  <span className="text-yellow-300 font-mono">{results.cardNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Issuer:</span>
                  <span className="text-yellow-300">{results.issuer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">Status:</span>
                  <span className={results.isValid ? 'text-green-300' : 'text-red-300'}>
                    {results.isValid ? 'VALID' : 'INVALID'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
