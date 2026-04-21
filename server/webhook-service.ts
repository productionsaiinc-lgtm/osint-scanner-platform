import axios from "axios";
import { getDb } from "./db";
import { z } from "zod";

export interface Webhook {
  id: string;
  userId: number;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  secret: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookEvent =
  | "scan.completed"
  | "token.triggered"
  | "threat.detected"
  | "payment.completed"
  | "alert.created";

/**
 * Register a webhook for a user
 */
export async function registerWebhook(
  userId: number,
  url: string,
  events: WebhookEvent[],
  secret: string
): Promise<Webhook> {
  const webhook: Webhook = {
    id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    url,
    events,
    active: true,
    secret,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Store in database (implementation would go here)
  console.log(`[Webhook] Registered webhook for user ${userId}:`, webhook.id);

  return webhook;
}

/**
 * Trigger a webhook event
 */
export async function triggerWebhook(
  userId: number,
  event: WebhookEvent,
  payload: any
) {
  try {
    // Get user's webhooks from database (implementation would go here)
    const webhooks = await getUserWebhooks(userId);

    for (const webhook of webhooks) {
      if (!webhook.active || !webhook.events.includes(event)) {
        continue;
      }

      // Create signed payload
      const signature = createSignature(JSON.stringify(payload), webhook.secret);

      try {
        await axios.post(webhook.url, payload, {
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": event,
            "X-Webhook-Timestamp": new Date().toISOString(),
          },
          timeout: 5000,
        });

        console.log(`[Webhook] Successfully triggered ${event} for webhook ${webhook.id}`);
      } catch (error) {
        console.error(`[Webhook] Failed to trigger ${event} for webhook ${webhook.id}:`, error);
        // Implement retry logic here
      }
    }
  } catch (error) {
    console.error(`[Webhook] Error triggering webhooks for user ${userId}:`, error);
  }
}

/**
 * Get user's webhooks
 */
export async function getUserWebhooks(userId: number): Promise<Webhook[]> {
  // Implementation would query database
  // For now, return empty array
  return [];
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(webhookId: string, userId: number): Promise<boolean> {
  try {
    // Delete from database (implementation would go here)
    console.log(`[Webhook] Deleted webhook ${webhookId} for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`[Webhook] Failed to delete webhook ${webhookId}:`, error);
    return false;
  }
}

/**
 * Update webhook status
 */
export async function updateWebhookStatus(
  webhookId: string,
  active: boolean
): Promise<boolean> {
  try {
    // Update in database (implementation would go here)
    console.log(`[Webhook] Updated webhook ${webhookId} status to ${active}`);
    return true;
  } catch (error) {
    console.error(`[Webhook] Failed to update webhook ${webhookId}:`, error);
    return false;
  }
}

/**
 * Create HMAC signature for webhook payload
 */
function createSignature(payload: string, secret: string): string {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createSignature(payload, secret);
  return signature === expectedSignature;
}

/**
 * Webhook event schemas for validation
 */
export const webhookPayloadSchemas = {
  "scan.completed": z.object({
    scanId: z.string(),
    userId: z.number(),
    target: z.string(),
    status: z.enum(["success", "failed"]),
    resultsCount: z.number(),
    completedAt: z.string().datetime(),
  }),

  "token.triggered": z.object({
    tokenId: z.string(),
    tokenName: z.string(),
    userId: z.number(),
    triggerDetails: z.record(z.string(), z.any()),
    triggeredAt: z.string().datetime(),
  }),

  "threat.detected": z.object({
    threatId: z.string(),
    userId: z.number(),
    threatLevel: z.enum(["low", "medium", "high", "critical"] as const),
    description: z.string(),
    affectedAssets: z.array(z.string()),
    detectedAt: z.string().datetime(),
  }),

  "payment.completed": z.object({
    paymentId: z.string(),
    userId: z.number(),
    amount: z.number(),
    currency: z.string(),
    status: z.enum(["success", "failed"] as const),
    completedAt: z.string().datetime(),
  }),

  "alert.created": z.object({
    alertId: z.string(),
    userId: z.number(),
    type: z.string(),
    message: z.string(),
    severity: z.enum(["info", "warning", "error"] as const),
    createdAt: z.string().datetime(),
  }),
};

/**
 * Validate webhook payload
 */
export function validateWebhookPayload(
  event: WebhookEvent,
  payload: any
): boolean {
  try {
    const schema = webhookPayloadSchemas[event as keyof typeof webhookPayloadSchemas];
    if (!schema) return false;
    schema.parse(payload);
    return true;
  } catch (error) {
    console.error(`[Webhook] Payload validation failed for ${event}:`, error);
    return false;
  }
}
