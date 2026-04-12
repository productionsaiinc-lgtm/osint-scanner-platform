import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getPayPalClient } from "./paypal-integration";
import { getDb } from "./db";
import { users, subscriptions, payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("PayPal Payment Flow - End-to-End", () => {
  let db: any;
  let testUserId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const result = await db
      .insert(users)
      .values({
        email: `paypal-test-${Date.now()}@example.com`,
        name: "PayPal Test User",
        openId: `test-open-id-${Date.now()}`,
      })
      .returning({ id: users.id });

    testUserId = result[0]?.id;
    if (!testUserId) throw new Error("Failed to create test user");
  });

  afterAll(async () => {
    if (!db || !testUserId) return;

    // Clean up test data
    try {
      await db.delete(payments).where(eq(payments.userId, testUserId));
      await db.delete(subscriptions).where(eq(subscriptions.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      console.log("Cleanup error (expected):", error);
    }
  });

  it("should initialize PayPal client in sandbox mode", () => {
    const paypal = getPayPalClient();
    expect(paypal).toBeDefined();
    expect(process.env.PAYPAL_MODE).toBe("sandbox");
  });

  it("should have valid PayPal credentials configured", () => {
    expect(process.env.PAYPAL_CLIENT_ID).toBeDefined();
    expect(process.env.PAYPAL_CLIENT_SECRET).toBeDefined();
    expect(process.env.PAYPAL_MODE).toBe("sandbox");
    expect(process.env.PAYPAL_PAYOUT_EMAIL).toBe("productions.ai.inc@gmail.com");
  });

  it("should record payment in database", async () => {
    const paymentData = {
      userId: testUserId,
      paypalTransactionId: `test-txn-${Date.now()}`,
      amount: 2000, // $20.00 in cents
      currency: "USD",
      status: "completed" as const,
      paymentMethod: "paypal" as const,
    };

    const result = await db.insert(payments).values(paymentData).returning();

    expect(result[0]).toBeDefined();
    expect(result[0].userId).toBe(testUserId);
    expect(result[0].amount).toBe(2000);
    expect(result[0].status).toBe("completed");
  });

  it("should create subscription after payment", async () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const result = await db
      .insert(subscriptions)
      .values({
        userId: testUserId,
        planId: 2, // Premium plan
        paypalSubscriptionId: `paypal-sub-${Date.now()}`,
        status: "active",
        startDate,
        endDate,
        autoRenew: 1,
      })
      .returning();

    expect(result[0]).toBeDefined();
    expect(result[0].status).toBe("active");
    expect(result[0].planId).toBe(2);
  });

  it("should verify subscription is active", async () => {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, testUserId));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].status).toBe("active");
    expect(result[0].planId).toBe(2);
  });

  it("should verify payment is recorded", async () => {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, testUserId));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].amount).toBe(2000);
    expect(result[0].status).toBe("completed");
    expect(result[0].paymentMethod).toBe("paypal");
  });

  it("should calculate correct subscription end date", async () => {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, testUserId));

    const subscription = result[0];
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);
    const daysDifference = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    expect(daysDifference).toBe(30);
  });

  it("should support multiple payments for same user", async () => {
    // Record second payment
    const payment2 = {
      userId: testUserId,
      paypalTransactionId: `test-txn-2-${Date.now()}`,
      amount: 2000,
      currency: "USD",
      status: "completed" as const,
      paymentMethod: "paypal" as const,
    };

    await db.insert(payments).values(payment2);

    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, testUserId));

    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it("should handle payment with different amounts", async () => {
    const payment = {
      userId: testUserId,
      paypalTransactionId: `test-txn-3-${Date.now()}`,
      amount: 5000, // $50.00
      currency: "USD",
      status: "completed" as const,
      paymentMethod: "paypal" as const,
    };

    const result = await db.insert(payments).values(payment).returning();

    expect(result[0].amount).toBe(5000);
  });

  it("should track payment method as PayPal", async () => {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, testUserId));

    const paypalPayments = result.filter((p: any) => p.paymentMethod === "paypal");
    expect(paypalPayments.length).toBeGreaterThan(0);
  });
});
