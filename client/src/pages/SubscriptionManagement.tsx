import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Crown, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

export function SubscriptionManagement() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: plans } = trpc.subscription.plans.useQuery();
  const { data: hasPremium } = trpc.subscription.hasPremium.useQuery();
  const { data: paymentHistory } = trpc.subscription.paymentHistory.useQuery();
  const createCheckout = trpc.subscription.createCheckout.useMutation();
  const capturePayPalOrder = trpc.subscription.capturePayPalOrder.useMutation();
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  const handlePremiumPurchase = async () => {
    if (!user) {
      toast.error('Please log in to purchase premium');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await createCheckout.mutateAsync({ priceId: 'premium_20' });
      if (result.checkoutUrl && result.orderId) {
        setOrderId(result.orderId);
        window.open(result.checkoutUrl, '_blank');
        toast.info('Redirecting to PayPal checkout...');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureOrder = async () => {
    if (!orderId) {
      toast.error('No order ID found');
      return;
    }

    setIsLoading(true);
    try {
      await capturePayPalOrder.mutateAsync({ orderId });
      toast.success('Payment captured successfully!');
      setOrderId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture order';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetReceipt = async (paymentId: number) => {
    try {
      // For now, just show a toast
      toast.info('Receipt generation coming soon');
    } catch (err) {
      console.error('Receipt error:', err);
      toast.error('Failed to generate receipt');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card className="border-neon-pink/30 bg-black/50">
        <CardHeader>
          <CardTitle className="text-neon-pink flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasPremium ? (
            <Alert className="border-neon-green/30 bg-neon-green/10">
              <CheckCircle className="h-4 w-4 text-neon-green" />
              <AlertDescription className="text-neon-green">
                You have an active premium subscription
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert className="border-neon-cyan/30 bg-neon-cyan/10">
                <AlertCircle className="h-4 w-4 text-neon-cyan" />
                <AlertDescription className="text-neon-cyan">
                  You are currently on the free plan
                </AlertDescription>
              </Alert>
              <Button
                onClick={handlePremiumPurchase}
                disabled={isLoading}
                className="w-full bg-neon-pink hover:bg-neon-pink/80 text-black font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade to Premium - $20/month
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Capture */}
      {orderId && (
        <Card className="border-neon-cyan/30 bg-black/50">
          <CardHeader>
            <CardTitle className="text-neon-cyan">Complete Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">Order ID: {orderId}</p>
            <Button
              onClick={handleCaptureOrder}
              disabled={isLoading}
              className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Capturing...
                </>
              ) : (
                'Capture Payment'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment History */}
      {paymentHistory && paymentHistory.length > 0 && (
        <Card className="border-neon-green/30 bg-black/50">
          <CardHeader>
            <CardTitle className="text-neon-green flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment History
            </CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded border border-neon-cyan/20 hover:border-neon-cyan/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedPaymentId(payment.id)}
                >
                  <div className="flex-1">
                    <p className="text-neon-cyan font-semibold">${payment.amount.toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        payment.status === 'completed'
                          ? 'bg-neon-green/20 text-neon-green'
                          : payment.status === 'pending'
                            ? 'bg-neon-yellow/20 text-neon-yellow'
                            : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {payment.status}
                    </span>
                    {payment.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetReceipt(payment.id);
                        }}
                        className="border-neon-cyan/30 hover:border-neon-cyan text-neon-cyan text-xs"
                      >
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Information */}
      {plans && (
        <Card className="border-neon-purple/30 bg-black/50">
          <CardHeader>
            <CardTitle className="text-neon-purple">Available Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plans.map((plan: any) => (
                <div key={plan.id} className="p-3 rounded border border-neon-purple/20">
                  <p className="text-neon-purple font-semibold">{plan.name}</p>
                  <p className="text-gray-400 text-sm">${plan.price}/month</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
