import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Zap, Crown, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { updateMetaTags, pageMetadata } from "@/lib/seo";
import PayPalButton from "@/components/PayPalButton";

export default function PricingSubscription() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pricing" | "subscription">("pricing");

  useEffect(() => {
    updateMetaTags(pageMetadata.pricing);
  }, []);

  const { data: plans, isLoading: plansLoading } = trpc.subscription.plans.useQuery();
  const { data: hasPremium } = trpc.subscription.hasPremium.useQuery();
  const { data: paymentHistory } = trpc.subscription.paymentHistory.useQuery();
  const createCheckout = trpc.subscription.createCheckout.useMutation();
  const capturePayPalOrder = trpc.subscription.capturePayPalOrder.useMutation();

  const handleUpgrade = async (planName: string) => {
    if (!user) {
      toast.error("Please log in to upgrade");
      return;
    }

    // Redirect to PayPal subscription link
    const paypalLink = "https://www.paypal.com/ncp/payment/6M86A33U4CEQU";
    window.open(paypalLink, "_blank");
    toast.info("Opening PayPal subscription page...");
  };

  const handleCaptureOrder = async () => {
    if (!orderId) {
      toast.error("No order ID found");
      return;
    }

    setIsLoading(true);
    try {
      await capturePayPalOrder.mutateAsync({ orderId });
      toast.success("Payment captured successfully!");
      setOrderId(null);
      setActiveTab("subscription");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to capture order";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
    "Advanced analytics dashboard",
    "Vulnerability assessment tools",
    "Compliance reporting",
    "Team collaboration features",
  ];

  const freeFeatures = [
    "Basic network scanning",
    "Limited API calls (100/month)",
    "Domain WHOIS lookup",
    "SSL certificate analysis",
    "Basic threat detection",
    "Email support",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing & Subscription</h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your OSINT needs
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <Button
            variant={activeTab === "pricing" ? "default" : "outline"}
            onClick={() => setActiveTab("pricing")}
            size="lg"
          >
            Pricing Plans
          </Button>
          <Button
            variant={activeTab === "subscription" ? "default" : "outline"}
            onClick={() => setActiveTab("subscription")}
            size="lg"
          >
            My Subscription
          </Button>
        </div>

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Free Plan</span>
                </CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="space-y-3">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-primary/50 shadow-lg">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg text-sm font-semibold">
                Popular
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span>Premium Plan</span>
                </CardTitle>
                <CardDescription>For serious OSINT professionals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-3xl font-bold">$40</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="space-y-3">
                  {premiumFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  onClick={() => handleUpgrade("premium")}
                  disabled={isLoading || hasPremium}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {hasPremium ? "Current Plan" : "Upgrade Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Current Subscription */}
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasPremium ? (
                  <Alert className="bg-green-50 border-green-200">
                    <Crown className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      You have an active Premium subscription
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      You are currently on the Free plan. Upgrade to Premium to unlock advanced features.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => setActiveTab("pricing")}
                  variant="outline"
                  className="w-full"
                >
                  View Pricing Plans
                </Button>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentHistory && paymentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {paymentHistory.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{payment.planName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(payment.amount / 100).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground capitalize">{payment.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No payment history yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pending Order */}
            {orderId && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-900">Pending Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-yellow-800">
                    You have a pending PayPal order. Click below to complete the payment.
                  </p>
                  <Button
                    onClick={handleCaptureOrder}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Complete Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
