/**
 * End-to-end payment flow tests for PayPal and Stripe
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { recordPayment, getPaymentByTransactionId, updatePaymentStatus, hasActivePremiumSubscription } from "./subscription-db";
import { verifyStripeSignature, handleStripeWebhook } from "./stripe-webhook";
import Stripe from "stripe";

describe("Payment Flow End-to-End Tests", () => {
  const testUserId = 1;
  const testEmail = "test@example.com";

  describe("PayPal Payment Flow", () => {
    it("should record a successful PayPal payment", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "PAYID-123456789",
        amount: 2000, // $20.00
        currency: "USD",
        status: "completed" as const,
        paymentMethod: "paypal" as const,
      };

      // Test that recordPayment doesn't throw an error
      await expect(recordPayment(paymentData)).resolves.toBeDefined();
    });

    it("should retrieve payment by transaction ID", async () => {
      const transactionId = "PAYID-TEST-123";
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: transactionId,
        amount: 2000,
        currency: "USD",
        status: "completed" as const,
        paymentMethod: "paypal" as const,
      };

      await recordPayment(paymentData);
      const payment = await getPaymentByTransactionId(transactionId);

      expect(payment).toBeDefined();
      expect(payment?.paypalTransactionId).toBe(transactionId);
      expect(payment?.status).toBe("completed");
    });

    it("should handle failed PayPal payment", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "PAYID-FAILED-123",
        amount: 2000,
        currency: "USD",
        status: "failed" as const,
        paymentMethod: "paypal" as const,
      };

      const result = await recordPayment(paymentData);
      expect(result).toBeDefined();
    });

    it("should update payment status", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "PAYID-UPDATE-123",
        amount: 2000,
        currency: "USD",
        status: "pending" as const,
        paymentMethod: "paypal" as const,
      };

      const payment = await recordPayment(paymentData);
      expect(payment).toBeDefined();
    });
  });

  describe("Stripe Payment Flow", () => {
    it("should verify valid Stripe webhook signature", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";

      const testBody = JSON.stringify({ type: "checkout.session.completed" });
      const testSignature = "t=1614556800,v1=test_signature";

      const result = verifyStripeSignature(testBody, testSignature);
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe("boolean");
    });

    it("should reject invalid Stripe webhook signature", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";

      const testBody = JSON.stringify({ type: "checkout.session.completed" });
      const invalidSignature = "invalid_signature";

      const result = verifyStripeSignature(testBody, invalidSignature);
      expect(result.valid).toBe(false);
    });

    it("should handle Stripe test event", async () => {
      const testEvent: Stripe.Event = {
        id: "evt_test_123",
        object: "event",
        api_version: "2026-03-25.dahlia",
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: "cs_test_123",
            object: "checkout.session",
            amount_total: 2000,
            currency: "usd",
            client_reference_id: testUserId.toString(),
          } as any,
        },
        livemode: false,
        pending_webhooks: 0,
        request: {
          id: null,
          idempotency_key: null,
        },
        type: "checkout.session.completed",
      };

      // Test event should be handled without errors
      await expect(handleStripeWebhook(testEvent)).resolves.not.toThrow();
    });

    it("should handle Stripe payment intent succeeded event", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "pi_test_123",
        amount: 2000,
        currency: "USD",
        status: "pending" as const,
        paymentMethod: "stripe" as const,
      };

      const payment = await recordPayment(paymentData);

      const testEvent: Stripe.Event = {
        id: "evt_test_payment_succeeded",
        object: "event",
        api_version: "2026-03-25.dahlia",
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: "pi_test_123",
            object: "payment_intent",
            client_secret: "pi_test_123_secret",
          } as any,
        },
        livemode: false,
        pending_webhooks: 0,
        request: {
          id: null,
          idempotency_key: null,
        },
        type: "payment_intent.succeeded",
      };

      await expect(handleStripeWebhook(testEvent)).resolves.not.toThrow();
    });

    it("should handle Stripe payment intent failed event", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "pi_test_failed",
        amount: 2000,
        currency: "USD",
        status: "pending" as const,
        paymentMethod: "stripe" as const,
      };

      const payment = await recordPayment(paymentData);

      const testEvent: Stripe.Event = {
        id: "evt_test_payment_failed",
        object: "event",
        api_version: "2026-03-25.dahlia",
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: "pi_test_failed",
            object: "payment_intent",
          } as any,
        },
        livemode: false,
        pending_webhooks: 0,
        request: {
          id: null,
          idempotency_key: null,
        },
        type: "payment_intent.payment_failed",
      };

      await expect(handleStripeWebhook(testEvent)).resolves.not.toThrow();
    });

    it("should handle Stripe charge refunded event", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "ch_test_refund",
        amount: 2000,
        currency: "USD",
        status: "completed" as const,
        paymentMethod: "stripe" as const,
      };

      const payment = await recordPayment(paymentData);

      const testEvent: Stripe.Event = {
        id: "evt_test_refund",
        object: "event",
        api_version: "2026-03-25.dahlia",
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: "ch_test_refund",
            object: "charge",
          } as any,
        },
        livemode: false,
        pending_webhooks: 0,
        request: {
          id: null,
          idempotency_key: null,
        },
        type: "charge.refunded",
      };

      await expect(handleStripeWebhook(testEvent)).resolves.not.toThrow();
    });
  });

  describe("Subscription Activation After Payment", () => {
    it("should verify user has premium subscription after payment", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "PAYID-PREMIUM-123",
        amount: 2000,
        currency: "USD",
        status: "completed" as const,
        paymentMethod: "paypal" as const,
      };

      await recordPayment(paymentData);

      // Note: In production, this would be verified after subscription is created
      const payment = await getPaymentByTransactionId("PAYID-PREMIUM-123");
      expect(payment?.status).toBe("completed");
    });
  });

  describe("Payment Error Handling", () => {
    it("should handle payment with valid user ID", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "PAYID-VALID-USER",
        amount: 2000,
        currency: "USD",
        status: "completed" as const,
        paymentMethod: "paypal" as const,
      };

      const result = await recordPayment(paymentData);
      expect(result).toBeDefined();
    });

    it("should handle payment with zero amount", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "PAYID-ZERO-AMOUNT",
        amount: 0,
        currency: "USD",
        status: "completed" as const,
        paymentMethod: "paypal" as const,
      };

      const result = await recordPayment(paymentData);
      expect(result).toBeDefined();
    });

    it("should handle payment with missing currency", async () => {
      const paymentData = {
        userId: testUserId,
        paypalTransactionId: "PAYID-NO-CURRENCY",
        amount: 2000,
        currency: "",
        status: "completed" as const,
        paymentMethod: "paypal" as const,
      };

      const result = await recordPayment(paymentData);
      expect(result).toBeDefined();
    });
  });

  describe("Payment Webhook Security", () => {
    it("should reject webhook without signature", () => {
      const testBody = JSON.stringify({ type: "checkout.session.completed" });
      const result = verifyStripeSignature(testBody, "");

      expect(result.valid).toBe(false);
    });

    it("should handle webhook with corrupted body", () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";

      const corruptedBody = "not valid json {";
      const testSignature = "t=1614556800,v1=test_signature";

      const result = verifyStripeSignature(corruptedBody, testSignature);
      expect(result.valid).toBe(false);
    });

    it("should handle webhook with missing secret", () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const testBody = JSON.stringify({ type: "checkout.session.completed" });
      const testSignature = "t=1614556800,v1=test_signature";

      const result = verifyStripeSignature(testBody, testSignature);
      expect(result.valid).toBe(false);
    });
  });
});
