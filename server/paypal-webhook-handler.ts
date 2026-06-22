import { getDb } from "./db";
import { payouts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Handle PayPal payout webhook events
 * Updates payout status in database based on PayPal notifications
 */
export async function handlePayPalPayoutWebhook(event: any) {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database not available for webhook processing");
      return { success: false, error: "Database unavailable" };
    }

    const { event_type, resource } = event;

    if (!event_type || !resource) {
      console.error("Invalid PayPal webhook event", event);
      return { success: false, error: "Invalid event structure" };
    }

    switch (event_type) {
      case "PAYMENT.PAYOUTSBATCH.DENIED":
        return handlePayoutDenied(resource, db);
      case "PAYMENT.PAYOUTSBATCH.PROCESSING":
        return handlePayoutProcessing(resource, db);
      case "PAYMENT.PAYOUTSBATCH.PROCESSED":
        return handlePayoutProcessed(resource, db);
      case "PAYMENT.PAYOUTSBATCH.FAILED":
        return handlePayoutFailed(resource, db);
      case "PAYMENT.PAYOUT_ITEM.BLOCKED":
        return handlePayoutItemBlocked(resource, db);
      case "PAYMENT.PAYOUT_ITEM.CANCELED":
        return handlePayoutItemCanceled(resource, db);
      case "PAYMENT.PAYOUT_ITEM.DENIED":
        return handlePayoutItemDenied(resource, db);
      case "PAYMENT.PAYOUT_ITEM.FAILED":
        return handlePayoutItemFailed(resource, db);
      case "PAYMENT.PAYOUT_ITEM.HELD":
        return handlePayoutItemHeld(resource, db);
      case "PAYMENT.PAYOUT_ITEM.REFUNDED":
        return handlePayoutItemRefunded(resource, db);
      case "PAYMENT.PAYOUT_ITEM.RETURNED":
        return handlePayoutItemReturned(resource, db);
      case "PAYMENT.PAYOUT_ITEM.SUCCEEDED":
        return handlePayoutItemSucceeded(resource, db);
      case "PAYMENT.PAYOUT_ITEM.UNCLAIMED":
        return handlePayoutItemUnclaimed(resource, db);
      default:
        console.log("Unhandled PayPal webhook event:", event_type);
        return { success: true, message: "Event logged but not processed" };
    }
  } catch (error) {
    console.error("Error handling PayPal webhook:", error);
    return { success: false, error: String(error) };
  }
}

async function handlePayoutDenied(resource: any, db: any) {
  const { payout_batch_id } = resource;
  if (!payout_batch_id) return { success: false, error: "Missing payout_batch_id" };

  await db
    .update(payouts)
    .set({
      status: "DENIED",
      failureReason: "Payout batch denied by PayPal",
      updatedAt: new Date(),
    })
    .where(eq(payouts.payoutId, payout_batch_id));

  return { success: true, message: "Payout marked as DENIED" };
}

async function handlePayoutProcessing(resource: any, db: any) {
  const { payout_batch_id } = resource;
  if (!payout_batch_id) return { success: false, error: "Missing payout_batch_id" };

  await db
    .update(payouts)
    .set({
      status: "PROCESSING",
      updatedAt: new Date(),
    })
    .where(eq(payouts.payoutId, payout_batch_id));

  return { success: true, message: "Payout marked as PROCESSING" };
}

async function handlePayoutProcessed(resource: any, db: any) {
  const { payout_batch_id } = resource;
  if (!payout_batch_id) return { success: false, error: "Missing payout_batch_id" };

  await db
    .update(payouts)
    .set({
      status: "SUCCESS",
      updatedAt: new Date(),
    })
    .where(eq(payouts.payoutId, payout_batch_id));

  return { success: true, message: "Payout marked as SUCCESS" };
}

async function handlePayoutFailed(resource: any, db: any) {
  const { payout_batch_id } = resource;
  if (!payout_batch_id) return { success: false, error: "Missing payout_batch_id" };

  await db
    .update(payouts)
    .set({
      status: "FAILED",
      failureReason: "Payout batch processing failed",
      retryCount: (await db.select({ count: payouts.retryCount }).from(payouts).where(eq(payouts.payoutId, payout_batch_id)))[0]?.count || 0 + 1,
      lastRetryAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payouts.payoutId, payout_batch_id));

  return { success: true, message: "Payout marked as FAILED with retry count incremented" };
}

async function handlePayoutItemBlocked(resource: any, db: any) {
  const { payout_item_id } = resource;
  if (!payout_item_id) return { success: false, error: "Missing payout_item_id" };

  await db
    .update(payouts)
    .set({
      transactionStatus: "BLOCKED",
      failureReason: "Payout item blocked by PayPal",
      updatedAt: new Date(),
    })
    .where(eq(payouts.transactionId, payout_item_id));

  return { success: true, message: "Payout item marked as BLOCKED" };
}

async function handlePayoutItemCanceled(resource: any, db: any) {
  const { payout_item_id } = resource;
  if (!payout_item_id) return { success: false, error: "Missing payout_item_id" };

  await db
    .update(payouts)
    .set({
      transactionStatus: "CANCELED",
      updatedAt: new Date(),
    })
    .where(eq(payouts.transactionId, payout_item_id));

  return { success: true, message: "Payout item marked as CANCELED" };
}

async function handlePayoutItemDenied(resource: any, db: any) {
  const { payout_item_id } = resource;
  if (!payout_item_id) return { success: false, error: "Missing payout_item_id" };

  await db
    .update(payouts)
    .set({
      transactionStatus: "DENIED",
      failureReason: "Payout item denied by PayPal",
      updatedAt: new Date(),
    })
    .where(eq(payouts.transactionId, payout_item_id));

  return { success: true, message: "Payout item marked as DENIED" };
}

async function handlePayoutItemFailed(resource: any, db: any) {
  const { payout_item_id, errors } = resource;
  if (!payout_item_id) return { success: false, error: "Missing payout_item_id" };

  const failureReason = errors?.[0]?.message || "Payout item failed";

  await db
    .update(payouts)
    .set({
      transactionStatus: "FAILED",
      failureReason,
      updatedAt: new Date(),
    })
    .where(eq(payouts.transactionId, payout_item_id));

  return { success: true, message: "Payout item marked as FAILED" };
}

async function handlePayoutItemHeld(resource: any, db: any) {
  const { payout_item_id } = resource;
  if (!payout_item_id) return { success: false, error: "Missing payout_item_id" };

  await db
    .update(payouts)
    .set({
      transactionStatus: "HELD",
      failureReason: "Payout item held pending review",
      updatedAt: new Date(),
    })
    .where(eq(payouts.transactionId, payout_item_id));

  return { success: true, message: "Payout item marked as HELD" };
}

async function handlePayoutItemRefunded(resource: any, db: any) {
  const { payout_item_id } = resource;
  if (!payout_item_id) return { success: false, error: "Missing payout_item_id" };

  await db
    .update(payouts)
    .set({
      transactionStatus: "REFUNDED",
      updatedAt: new Date(),
    })
    .where(eq(payouts.transactionId, payout_item_id));

  return { success: true, message: "Payout item marked as REFUNDED" };
}

async function handlePayoutItemReturned(resource: any, db: any) {
  const { payout_item_id } = resource;
  if (!payout_item_id) return { success: false, error: "Missing payout_item_id" };

  await db
    .update(payouts)
    .set({
      transactionStatus: "RETURNED",
      failureReason: "Payout item returned",
      updatedAt: new Date(),
    })
    .where(eq(payouts.transactionId, payout_item_id));

  return { success: true, message: "Payout item marked as RETURNED" };
}

async function handlePayoutItemSucceeded(resource: any, db: any) {
  const { payout_item_id } = resource;
  if (!payout_item_id) return { success: false, error: "Missing payout_item_id" };

  await db
    .update(payouts)
    .set({
      transactionStatus: "SUCCESS",
      status: "SUCCESS",
      updatedAt: new Date(),
    })
    .where(eq(payouts.transactionId, payout_item_id));

  return { success: true, message: "Payout item marked as SUCCESS" };
}

async function handlePayoutItemUnclaimed(resource: any, db: any) {
  const { payout_item_id } = resource;
  if (!payout_item_id) return { success: false, error: "Missing payout_item_id" };

  await db
    .update(payouts)
    .set({
      transactionStatus: "UNCLAIMED",
      failureReason: "Payout item unclaimed by recipient",
      updatedAt: new Date(),
    })
    .where(eq(payouts.transactionId, payout_item_id));

  return { success: true, message: "Payout item marked as UNCLAIMED" };
}
