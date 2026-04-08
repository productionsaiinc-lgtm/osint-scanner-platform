import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Crown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function SubscriptionManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const { data: plans } = trpc.subscription.plans.useQuery();
  const { data: hasPremium } = trpc.subscription.hasPremium.useQuery();

  const handleUpgrade = async (planId: number) => {
    setIsLoading(true);
    try {
      // Redirect to checkout or payment page
      window.location.href = '/pricing';
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
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Upgrading...
                        </>
                      ) : (
                        'Upgrade to ' + plan.name.charAt(0).toUpperCase() + plan.name.slice(1)
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
              <div className="text-xs text-gray-400">Payment Method</div>
              <div className="text-sm font-mono text-pink-400 mt-1">
                PayPal - productions.ai.inc@gmail.com
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
                We accept PayPal for all subscription payments. Your payment is processed securely.
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-orange-400">Is there a free trial?</div>
              <div className="text-xs text-gray-400 mt-1">
                Yes! Start with our Free plan to explore all features, then upgrade to Pro when you need advanced capabilities.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
