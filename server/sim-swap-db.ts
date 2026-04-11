/**
 * SIM Swap detection database helpers
 */

import { getDb } from "./db";
import {
  simSwapRecords,
  breachDatabaseEntries,
  carrierSimSwapStatus,
  simSwapPatterns,
  InsertSimSwapRecord,
  InsertBreachDatabaseEntry,
  InsertCarrierSimSwapStatus,
  InsertSimSwapPattern,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Record a SIM swap detection result
 */
export async function recordSimSwapDetection(data: InsertSimSwapRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(simSwapRecords).values(data);
  return result;
}

/**
 * Get SIM swap record by phone number
 */
export async function getSimSwapRecord(phoneNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const records = await db
    .select()
    .from(simSwapRecords)
    .where(eq(simSwapRecords.phoneNumber, phoneNumber))
    .orderBy((t) => t.createdAt)
    .limit(1);

  return records[0] || null;
}

/**
 * Get all SIM swap records for a user
 */
export async function getUserSimSwapRecords(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const records = await db
    .select()
    .from(simSwapRecords)
    .where(eq(simSwapRecords.userId, userId))
    .orderBy((t) => t.createdAt);

  return records;
}

/**
 * Record breach database entry
 */
export async function recordBreachEntry(data: InsertBreachDatabaseEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(breachDatabaseEntries).values(data);
  return result;
}

/**
 * Get breach entries for a phone number
 */
export async function getBreachEntries(phoneNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const entries = await db
    .select()
    .from(breachDatabaseEntries)
    .where(eq(breachDatabaseEntries.phoneNumber, phoneNumber));

  return entries;
}

/**
 * Record or update carrier SIM swap status
 */
export async function recordCarrierStatus(data: InsertCarrierSimSwapStatus) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if record exists
  const existing = await db
    .select()
    .from(carrierSimSwapStatus)
    .where(eq(carrierSimSwapStatus.phoneNumber, data.phoneNumber))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(carrierSimSwapStatus)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(carrierSimSwapStatus.phoneNumber, data.phoneNumber));
  } else {
    // Insert new
    await db.insert(carrierSimSwapStatus).values(data);
  }
}

/**
 * Get carrier status for a phone number
 */
export async function getCarrierStatus(phoneNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const status = await db
    .select()
    .from(carrierSimSwapStatus)
    .where(eq(carrierSimSwapStatus.phoneNumber, phoneNumber))
    .limit(1);

  return status[0] || null;
}

/**
 * Record SIM swap patterns
 */
export async function recordSimSwapPattern(data: InsertSimSwapPattern) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if pattern exists for this phone number
  const existing = await db
    .select()
    .from(simSwapPatterns)
    .where(eq(simSwapPatterns.phoneNumber, data.phoneNumber))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(simSwapPatterns)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(simSwapPatterns.phoneNumber, data.phoneNumber));
  } else {
    // Insert new
    await db.insert(simSwapPatterns).values(data);
  }
}

/**
 * Get SIM swap patterns for a phone number
 */
export async function getSimSwapPattern(phoneNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const pattern = await db
    .select()
    .from(simSwapPatterns)
    .where(eq(simSwapPatterns.phoneNumber, phoneNumber))
    .limit(1);

  return pattern[0] || null;
}

/**
 * Update SIM swap record
 */
export async function updateSimSwapRecord(
  recordId: number,
  updates: Partial<InsertSimSwapRecord>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(simSwapRecords)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(simSwapRecords.id, recordId));
}

/**
 * Calculate SIM swap risk score based on multiple factors
 */
export function calculateRiskScore(factors: {
  breachCount: number;
  breachSeverity: number; // 0-100
  carrierProtection: boolean;
  suspiciousPatterns: number;
  accountFlagged: boolean;
  multipleCarrierChanges: boolean;
  frequentPorting: boolean;
  suspiciousLogins: number;
  passwordResets: number;
  smsVerificationFails: number;
  unusualGeoLocation: boolean;
  deviceChanges: number;
}): number {
  let score = 0;

  // Breach indicators (max 30 points)
  score += Math.min(factors.breachCount * 5, 20);
  score += Math.min(factors.breachSeverity * 0.1, 10);

  // Carrier protection (max 20 points)
  if (!factors.carrierProtection) {
    score += 20;
  }

  // Suspicious patterns (max 25 points)
  if (factors.multipleCarrierChanges) score += 10;
  if (factors.frequentPorting) score += 8;
  if (factors.accountFlagged) score += 7;

  // Account activity (max 25 points)
  score += Math.min(factors.suspiciousLogins * 2, 8);
  score += Math.min(factors.passwordResets * 1.5, 6);
  score += Math.min(factors.smsVerificationFails * 2, 7);
  if (factors.unusualGeoLocation) score += 2;
  score += Math.min(factors.deviceChanges * 1, 4);

  return Math.min(Math.round(score), 100);
}

/**
 * Determine risk level based on score
 */
export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Determine if number is likely SIM swapped based on indicators
 */
export function determineSIMSwapStatus(factors: {
  breachCount: number;
  carrierProtection: boolean;
  multipleCarrierChanges: boolean;
  frequentPorting: boolean;
  accountFlagged: boolean;
  suspiciousLogins: number;
  smsVerificationFails: number;
  riskScore: number;
}): boolean {
  // High confidence indicators of SIM swap
  if (factors.accountFlagged && factors.multipleCarrierChanges) return true;
  if (factors.frequentPorting && factors.smsVerificationFails > 2) return true;
  if (factors.riskScore >= 75) return true;

  // Medium confidence
  if (
    factors.breachCount > 2 &&
    !factors.carrierProtection &&
    factors.suspiciousLogins > 1
  ) {
    return true;
  }

  return false;
}
