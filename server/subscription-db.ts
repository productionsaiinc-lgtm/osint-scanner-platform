/**
 * Database helpers for subscription management
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  subscriptionPlans,
  userSubscriptions,
  payments,
  InsertSubscriptionPlan,
  InsertUserSubscription,
  InsertPayment,
} from "../drizzle/schema";

export async function createSubscriptionPlan(plan: InsertSubscriptionPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptionPlans).values(plan);
  return result;
}

export async function getSubscriptionPlan(planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllSubscriptionPlans() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(subscriptionPlans);
}

export async function createUserSubscription(subscription: InsertUserSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userSubscriptions).values(subscription);
  return result;
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, "active")
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserSubscriptionStatus(
  subscriptionId: number,
  status: "active" | "cancelled" | "expired" | "pending"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userSubscriptions)
    .set({ status, updatedAt: new Date() })
    .where(eq(userSubscriptions.id, subscriptionId));
}

export async function recordPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(payment);
  return result;
}

export async function getPaymentHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(payments).where(eq(payments.userId, userId));
}

export async function getPaymentByTransactionId(transactionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.paypalTransactionId, transactionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updatePaymentStatus(
  paymentId: number,
  status: "completed" | "pending" | "failed" | "refunded"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.id, paymentId));
}

export async function hasActivePremiumSubscription(userId: number): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const now = new Date();
  const isActive =
    subscription.status === "active" &&
    subscription.startDate <= now &&
    (!subscription.endDate || subscription.endDate > now);

  return isActive;
}

export async function getUserSubscriptionFeatures(userId: number): Promise<string[]> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return [];

  const plan = await getSubscriptionPlan(subscription.planId);
  if (!plan || !plan.features) return [];

  try {
    return JSON.parse(plan.features);
  } catch {
    return [];
  }
}

export async function canUserAccessFeature(userId: number, feature: string): Promise<boolean> {
  const features = await getUserSubscriptionFeatures(userId);
  return features.includes(feature);
}
