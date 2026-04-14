import React, { useState, useEffect } from "react";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CreditCard, Apple, Smartphone, Landmark, Wallet, CheckCircle, AlertCircle, Loader } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<number>(2); // Default to Pro
  const [selectedMethod, setSelectedMethod] = useState<string>("stripe_card");
  const [step, setStep] = useState<"plan" | "payment" | "confirmation">("plan");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const { data: plans } = trpc.subscription.plans.useQuery();
  const { data: methods } = trpc.paymentMethods.getAvailableMethods.useQuery();
  const createCheckout = trpc.subscription.createCheckout.useMutation();
  const createApplePayIntent = trpc.paymentMethods.createApplePayIntent.useMutation();
  const createGooglePayIntent = trpc.paymentMethods.createGooglePayIntent.useMutation();
  const initiateBankTransfer = trpc.paymentMethods.initiateBankTransfer.useMutation();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "stripe_card",
      name: "Credit/Debit Card",
      icon: <CreditCard className="w-6 h-6" />,
      description: "Visa, Mastercard, American Express",
      enabled: true,
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: <Wallet className="w-6 h-6" />,
      description: "Pay securely with your PayPal account",
      enabled: true,
    },
    {
      id: "apple_pay",
      name: "Apple Pay",
      icon: <Apple className="w-6 h-6" />,
      description: "Fast and secure payment with Apple Pay",
      enabled: true,
    },
    {
      id: "google_pay",
      name: "Google Pay",
      icon: <Smartphone className="w-6 h-6" />,
      description: "Quick checkout with Google Pay",
      enabled: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: <Landmark className="w-6 h-6" />,
      description: "Direct bank transfer (ACH)",
      enabled: true,
    },
  ];

  const selectedPlanData = plans?.find((p) => p.id === selectedPlan);

  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }
    setStep("payment");
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedMethod === "stripe_card") {
        const result = await createCheckout.mutateAsync({ priceId: undefined });
        window.open(result.checkoutUrl, "_blank");
        setOrderDetails({
          method: "Credit Card",
          amount: selectedPlanData?.price,
          currency: selectedPlanData?.currency,
        });
        setStep("confirmation");
      } else if (selectedMethod === "paypal") {
        const result = await createCheckout.mutateAsync({ priceId: undefined });
        window.open(result.checkoutUrl, "_blank");
        setOrderDetails({
          method: "PayPal",
          amount: selectedPlanData?.price,
          currency: selectedPlanData?.currency,
        });
        setStep("confirmation");
      } else if (selectedMethod === "apple_pay") {
        const result = await createApplePayIntent.mutateAsync({ planId: selectedPlan });
        toast.info("Apple Pay payment initiated. Complete payment on your device.");
        setOrderDetails({
          method: "Apple Pay",
          amount: selectedPlanData?.price,
          currency: selectedPlanData?.currency,
        });
        setStep("confirmation");
      } else if (selectedMethod === "google_pay") {
        const result = await createGooglePayIntent.mutateAsync({ planId: selectedPlan });
        toast.info("Google Pay payment initiated. Complete payment on your device.");
        setOrderDetails({
          method: "Google Pay",
          amount: selectedPlanData?.price,
          currency: selectedPlanData?.currency,
        });
        setStep("confirmation");
      } else if (selectedMethod === "bank_transfer") {
        const result = await initiateBankTransfer.mutateAsync({ planId: selectedPlan });
        setOrderDetails({
          method: "Bank Transfer",
          amount: selectedPlanData?.price,
          currency: selectedPlanData?.currency,
          bankDetails: result.bankDetails,
          referenceNumber: result.referenceNumber,
        });
        setStep("confirmation");
      }

      toast.success("Payment initiated successfully!");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center ${step === "plan" ? "text-cyan-400" : "text-slate-500"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "plan" ? "bg-cyan-400 text-slate-900" : "bg-slate-700"}`}>
                1
              </div>
              <span className="ml-2 font-semibold">Select Plan</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step !== "plan" ? "bg-cyan-400" : "bg-slate-700"}`} />
            <div className={`flex items-center ${step === "payment" ? "text-cyan-400" : "text-slate-500"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "payment" ? "bg-cyan-400 text-slate-900" : "bg-slate-700"}`}>
                2
              </div>
              <span className="ml-2 font-semibold">Payment</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step === "confirmation" ? "bg-cyan-400" : "bg-slate-700"}`} />
            <div className={`flex items-center ${step === "confirmation" ? "text-cyan-400" : "text-slate-500"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "confirmation" ? "bg-cyan-400 text-slate-900" : "bg-slate-700"}`}>
                3
              </div>
              <span className="ml-2 font-semibold">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Step 1: Plan Selection */}
        {step === "plan" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h1>
            <p className="text-slate-400 mb-8">Upgrade to unlock advanced OSINT capabilities</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {plans?.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "border-cyan-400 bg-slate-800 ring-2 ring-cyan-400"
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-cyan-400">${plan.price}</span>
                    <span className="text-slate-400 ml-2">/month</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                  {selectedPlan === plan.id && (
                    <div className="flex items-center text-cyan-400">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span>Selected</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <Button
              onClick={handleProceedToPayment}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold py-3"
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Step 2: Payment Method Selection */}
        {step === "payment" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Select Payment Method</h1>
            <p className="text-slate-400 mb-8">Choose how you'd like to pay for {selectedPlanData?.name}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 cursor-pointer transition-all flex items-center ${
                    selectedMethod === method.id
                      ? "border-cyan-400 bg-slate-800 ring-2 ring-cyan-400"
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  } ${!method.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{ pointerEvents: !method.enabled ? "none" : "auto" }}
                >
                  <div className="mr-4 text-cyan-400">{method.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{method.name}</h3>
                    <p className="text-slate-400 text-sm">{method.description}</p>
                  </div>
                  {selectedMethod === method.id && <CheckCircle className="w-5 h-5 text-cyan-400" />}
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <Card className="border-slate-700 bg-slate-800 p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>{selectedPlanData?.name} Plan</span>
                  <span>${selectedPlanData?.price}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>Total</span>
                    <span>${selectedPlanData?.price}</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep("plan")}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Payment"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirmation" && (
          <div className="text-center">
            <div className="mb-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Payment Initiated</h1>
              <p className="text-slate-400">Your payment is being processed</p>
            </div>

            {orderDetails && (
              <Card className="border-slate-700 bg-slate-800 p-8 mb-8 text-left">
                <h3 className="text-lg font-bold text-white mb-4">Order Details</h3>
                <div className="space-y-3 text-slate-300">
                  <div className="flex justify-between">
                    <span>Plan</span>
                    <span className="text-white font-semibold">{selectedPlanData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="text-white font-semibold">{orderDetails.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className="text-white font-semibold">
                      {orderDetails.currency} ${orderDetails.amount}
                    </span>
                  </div>

                  {orderDetails.bankDetails && (
                    <>
                      <div className="border-t border-slate-700 pt-4 mt-4">
                        <p className="text-yellow-400 flex items-center mb-4">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Bank Transfer Instructions
                        </p>
                        <div className="bg-slate-900 p-4 rounded space-y-2 text-sm">
                          <div>
                            <span className="text-slate-400">Bank Name:</span>
                            <span className="ml-2 text-white">{orderDetails.bankDetails.bankName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Account Number:</span>
                            <span className="ml-2 text-white">{orderDetails.bankDetails.accountNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Reference Number:</span>
                            <span className="ml-2 text-white font-mono">{orderDetails.referenceNumber}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                View Pricing
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
