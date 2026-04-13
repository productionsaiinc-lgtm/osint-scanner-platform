import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Pricing() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { data: plans, isLoading } = trpc.subscription.plans.useQuery();
  const { data: hasPremium } = trpc.subscription.hasPremium.useQuery();

  const handleUpgrade = (planName: string) => {
    if (!user) {
      toast.error("Please log in to upgrade");
      return;
    }

    setSelectedPlan(planName);
    // In production, redirect to PayPal checkout
    toast.info("Redirecting to PayPal...");
  };

  const premiumFeatures = [
    "Advanced port scanning with service detection",
    "Unlimited API calls to external services",
    "Dark web monitoring",
    "Real-time threat alerts",
    "Custom report templates",
    "Batch scanning capabilities",
    "API access for integrations",
    "Priority email support",
    "Advanced vulnerability scanning",
    "Dedicated account manager",
  ];

  const freeFeatures = [
    "Unlimited network scans",
    "Basic port scanning",
    "Limited API calls (100/month)",
    "Standard reports",
    "Community email support",
    "All core OSINT modules",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neon-cyan animate-pulse">Loading pricing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-neon-pink mb-4 neon-glow">
            PRICING PLANS
          </h1>
          <p className="text-neon-cyan text-lg">
            Choose the perfect plan for your reconnaissance needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <Card className="border-2 border-neon-cyan/50 bg-black/50 backdrop-blur p-8 hover:border-neon-cyan transition-all">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neon-cyan mb-2">FREE</h2>
              <div className="text-3xl font-bold text-neon-green">$0</div>
              <p className="text-gray-400 text-sm mt-2">Forever free</p>
            </div>

            <Button
              className="w-full mb-8 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/30"
              disabled={!hasPremium}
            >
              {hasPremium ? "Current Plan" : "Get Started"}
            </Button>

            <div className="space-y-4">
              <p className="font-semibold text-neon-pink mb-4">Includes:</p>
              {freeFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-neon-pink/50 bg-black/50 backdrop-blur p-8 hover:border-neon-pink transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-neon-pink/20 text-neon-pink px-4 py-1 text-xs font-bold">
              POPULAR
            </div>

           <div>
  <style>.pp-4KE9LVL5YMB78{text-align:center;border:none;border-radius:0.25rem;min-width:11.625rem;padding:0 2rem;height:2.625rem;font-weight:bold;background-color:#FFD140;color:#000000;font-family:"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.25rem;cursor:pointer;}</style>
  <form action="https://www.paypal.com/ncp/payment/4KE9LVL5YMB78" method="post" target="_blank" style="display:inline-grid;justify-items:center;align-content:start;gap:0.5rem;">
    <input class="pp-4KE9LVL5YMB78" type="submit" value="Buy Now" />
    <img src=https://www.paypalobjects.com/images/Debit_Credit_APM.svg alt="cards" />
    <section style="font-size: 0.75rem;"> Powered by <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" style="height:0.875rem;vertical-align:middle;"/></section>
  </form>
</div>

            <div className="space-y-4">
              <p className="font-semibold text-neon-pink mb-4">Everything in Free, plus:</p>
              {premiumFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-neon-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-neon-pink/30 pt-16">
          <h2 className="text-2xl font-bold text-neon-cyan mb-8">FREQUENTLY ASKED QUESTIONS</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-l-2 border-neon-green/50 pl-6">
              <h3 className="font-bold text-neon-green mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">
                Yes, you can cancel your subscription at any time. No questions asked.
              </p>
            </div>

            <div className="border-l-2 border-neon-green/50 pl-6">
              <h3 className="font-bold text-neon-green mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept all major credit cards and PayPal through our secure payment processor.
              </p>
            </div>

            <div className="border-l-2 border-neon-green/50 pl-6">
              <h3 className="font-bold text-neon-green mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400">
                Yes, we offer a 30-day money-back guarantee if you're not satisfied.
              </p>
            </div>

            <div className="border-l-2 border-neon-green/50 pl-6">
              <h3 className="font-bold text-neon-green mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-gray-400">
                Absolutely. You can change your plan at any time and we'll prorate the charges.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 border-t border-neon-pink/30 pt-16 text-center">
          <h2 className="text-2xl font-bold text-neon-pink mb-4 neon-glow">
            Ready to unlock advanced OSINT capabilities?
          </h2>
          <p className="text-neon-cyan mb-8 max-w-2xl mx-auto">
            Join thousands of security professionals using OSINT Scanner Platform for advanced
            reconnaissance and threat intelligence.
          </p>
          <Button
            onClick={() => handleUpgrade("pro")}
            className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold px-8 py-3 text-lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
}
