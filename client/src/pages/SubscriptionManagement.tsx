import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Crown, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function SubscriptionManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: plans } = trpc.subscription.plans.useQuery();
  const { data: hasPremium } = trpc.subscription.hasPremium.useQuery();
  const createCheckout = trpc.subscription.createCheckout.useMutation();

  const handlePremiumPurchase = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await createCheckout.mutateAsync({ priceId: 'premium_20' });
      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, '_blank');
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      setError('Payment error. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: number) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await createCheckout.mutateAsync({ priceId: 'premium_20' });
      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, '_blank');
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      setError('Payment error. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <CreditCard className="w-8 h-8" />
          Subscription Management
        </h1>
        <p className="text-gray-400 mt-2">Manage your OSINT Scanner subscription and billing</p>
      </div>

      {/* Premium Purchase CTA */}
      {!hasPremium && (
        <Card className="border-l-4 border-l-neon-green border-gray-600/30 bg-gradient-to-r from-neon-green/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Zap className="w-8 h-8 text-neon-green flex-shrink-0" />
                <div>
                  <div className="text-lg font-bold text-neon-green">Unlock Premium Features</div>
                  <div className="text-sm text-gray-400 mt-1">Get unlimited scans, advanced tools, and priority support</div>
                </div>
              </div>
              <Button
                onClick={handlePremiumPurchase}
                disabled={isLoading}
                className="bg-neon-green hover:bg-neon-green/80 text-black font-bold text-lg px-8 py-6 h-auto whitespace-nowrap flex-shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Upgrade for $20
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Subscription */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasPremium ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-cyan-500/30 rounded bg-cyan-500/5">
                  <div className="text-xs text-gray-400">Plan Name</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1 capitalize">
                    Pro
                  </div>
                </div>
                <div className="p-3 border border-cyan-500/30 rounded bg-cyan-500/5">
                  <div className="text-xs text-gray-400">Status</div>
                  <div className="text-lg font-bold text-green-400 mt-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </div>
                </div>
              </div>
              <div className="p-3 border border-cyan-500/30 rounded bg-cyan-500/5">
                <div className="text-xs text-gray-400 mb-2">Included Features</div>
                <div className="space-y-1">
                  <div className="text-sm text-cyan-400 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Advanced OSINT Tools
                  </div>
                  <div className="text-sm text-cyan-400 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Priority Support
                  </div>
                  <div className="text-sm text-cyan-400 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Custom Reports
                  </div>
                  <div className="text-sm text-cyan-400 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Unlimited Scans
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Alert className="border-yellow-500/30 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-400">
                You are currently on the Free plan. Upgrade to Pro to unlock premium features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      {plans && plans.length > 0 && (
        <Card className="border-purple-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-purple-400">Available Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan: any) => (
                <div
                  key={plan.id}
                  className={`p-4 border rounded ${
                    hasPremium && plan.name === 'pro'
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-purple-500/30 bg-purple-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-purple-400 capitalize">
                      {plan.name}
                    </div>
                    {hasPremium && plan.name === 'pro' && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-cyan-400 mb-3">
                    ${(plan.price / 100).toFixed(2)}
                    <span className="text-sm text-gray-400">/month</span>
                  </div>
                  {plan.features && (
                    <div className="space-y-2 mb-4">
                      {plan.features.map((feature: string, idx: number) => (
                        <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}
                  {!(hasPremium && plan.name === 'pro') && (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoading}
                      className="w-full bg-neon-purple hover:bg-neon-purple/80 text-black font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Upgrade for $20
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      <Card className="border-pink-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-pink-400">Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert className="border-blue-500/30 bg-blue-500/10">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-400">
                Invoices and receipts are sent to your email address. Manage your payment methods in account settings.
              </AlertDescription>
            </Alert>
            <div className="p-3 border border-pink-500/30 rounded bg-pink-500/5">
              <div className="text-xs text-gray-400">Payment Methods</div>
              <div className="text-sm text-pink-400 mt-2 space-y-1">
                <div>💳 Credit Card (Stripe)</div>
                <div>🏦 PayPal - productions.ai.inc@gmail.com</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="border-orange-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-orange-400">Subscription FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-orange-400">Can I cancel anytime?</div>
              <div className="text-xs text-gray-400 mt-1">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-orange-400">What payment methods do you accept?</div>
              <div className="text-xs text-gray-400 mt-1">
                We accept Stripe (credit cards) and PayPal for all subscription payments. Your payment is processed securely.
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-orange-400">Is there a free trial?</div>
              <div className="text-xs text-gray-400 mt-1">
                No, but you can use our Free plan indefinitely to explore basic features before upgrading.
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-orange-400">How do I get a refund?</div>
              <div className="text-xs text-gray-400 mt-1">
                Contact our support team within 30 days of purchase for a full refund. No questions asked.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
