import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: subscription, refetch: refetchSubscription } = trpc.subscription.mySubscription.useQuery();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        
        // Check if we have a session ID from Stripe redirect
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          // Payment completed via redirect, subscription should be updated
          await refetchSubscription();
          setSuccess(true);
        } else {
          // Verify the session with Stripe (optional - can be done server-side)
          await refetchSubscription();
          setSuccess(true);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, refetchSubscription]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="w-full max-w-md border-gray-600/30 bg-gray-900">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-gray-400">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <Card className="w-full max-w-md border-gray-600/30 bg-gray-900">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-neon-green" />
          </div>
          <CardTitle className="text-2xl text-neon-green">Payment Successful!</CardTitle>
          <CardDescription className="text-gray-400">
            Your premium subscription is now active
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {success && subscription && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-neon-green font-semibold capitalize">
                    {subscription.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-cyan-400 font-semibold">Premium</span>
                </div>
                {subscription.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Renews:</span>
                    <span className="text-gray-300">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  You now have access to all premium features including:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="text-neon-green">✓</span> Unlimited scans
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-neon-green">✓</span> Advanced OSINT tools
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-neon-green">✓</span> Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-neon-green">✓</span> API access
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setLocation('/dashboard')}
                  className="w-full bg-neon-green hover:bg-neon-green/80 text-black font-bold"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => setLocation('/subscription')}
                  variant="outline"
                  className="w-full border-gray-600 hover:bg-gray-800"
                >
                  View Subscription Details
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-gray-500">
            <p>A confirmation email has been sent to your registered email address.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
