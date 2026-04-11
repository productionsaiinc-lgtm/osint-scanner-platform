import { useEffect } from 'react';
import { useSearchParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const [, setLocation] = useLocation();

  const reason = searchParams.get('reason') || 'unknown';

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <Card className="w-full max-w-md border-gray-600/30 bg-gray-900">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-neon-pink" />
          </div>
          <CardTitle className="text-2xl text-neon-pink">Payment Cancelled</CardTitle>
          <CardDescription className="text-gray-400">
            Your payment was not completed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              {reason === 'user' && 'You cancelled the payment process. No charges have been made to your account.'}
              {reason === 'timeout' && 'Your payment session expired. Please try again.'}
              {reason === 'error' && 'An error occurred during payment processing. Please try again or contact support.'}
              {reason === 'unknown' && 'The payment could not be completed. Please try again.'}
            </p>
          </div>

          <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">What's next?</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Check your payment method and try again</li>
              <li>• Ensure your card details are correct</li>
              <li>• Contact your bank if you see any charges</li>
              <li>• Reach out to support if you need help</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setLocation('/subscription')}
              className="w-full bg-neon-green hover:bg-neon-green/80 text-black font-bold"
            >
              Try Again
            </Button>
            <Button
              onClick={() => setLocation('/dashboard')}
              variant="outline"
              className="w-full border-gray-600 hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Need help? Contact our support team at support@osintscan.io</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
