/**
 * PayPal Payouts Integration
 * Handles automatic payouts to receiver email
 */

import axios from "axios";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const RECEIVER_EMAIL = "productions.ai.inc@gmail.com"; // Payout recipient

interface PayPalPayoutResponse {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
    time_created: string;
    time_completed?: string;
    sender_batch_header: {
      sender_batch_id: string;
      email_subject: string;
    };
  };
  links: Array<{ rel: string; href: string; method: string }>;
}

interface PayPalPayoutItem {
  recipient_type: "EMAIL" | "PHONE" | "PAYPAL_ID";
  amount: {
    value: string;
    currency_code: string;
  };
  description: string;
  sender_item_id: string;
  receiver: string;
  note?: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

    const response = await axios.post<{ access_token: string; expires_in: number }>(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const expiresAt = Date.now() + response.data.expires_in * 1000;
    cachedAccessToken = { token: response.data.access_token, expiresAt };

    return response.data.access_token;
  } catch (error) {
    console.error("[PayPal Payouts] Failed to get access token:", error);
    throw new Error("Failed to authenticate with PayPal");
  }
}

/**
 * Process payout to receiver email
 * @param amount Amount in USD (e.g., 100 for $100)
 * @param description Description of the payout
 * @param senderBatchId Unique batch ID for tracking
 */
export async function processPayout(
  amount: number,
  description: string,
  senderBatchId: string
): Promise<PayPalPayoutResponse> {
  const accessToken = await getAccessToken();

  const payoutItem: PayPalPayoutItem = {
    recipient_type: "EMAIL",
    amount: {
      value: amount.toFixed(2),
      currency_code: "USD",
    },
    description,
    sender_item_id: senderBatchId,
    receiver: RECEIVER_EMAIL,
    note: `Payout for OSINT Scanner Platform - ${description}`,
  };

  try {
    const response = await axios.post<PayPalPayoutResponse>(
      `${PAYPAL_API_BASE}/v1/payments/payouts`,
      {
        sender_batch_header: {
          sender_batch_id: senderBatchId,
          email_subject: "OSINT Scanner Platform Payout",
          email_message: "You have received a payout from OSINT Scanner Platform",
        },
        items: [payoutItem],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[PayPal Payouts] Payout processed successfully:", response.data.batch_header.payout_batch_id);
    return response.data;
  } catch (error) {
    console.error("[PayPal Payouts] Failed to process payout:", error);
    throw new Error("Failed to process payout");
  }
}

/**
 * Get payout batch status
 */
export async function getPayoutStatus(payoutBatchId: string) {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/payments/payouts/${payoutBatchId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[PayPal Payouts] Failed to get payout status:", error);
    throw new Error("Failed to retrieve payout status");
  }
}

/**
 * Get payout item details
 */
export async function getPayoutItemDetails(payoutBatchId: string, payoutItemId: string) {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/payments/payouts/${payoutBatchId}/items/${payoutItemId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[PayPal Payouts] Failed to get payout item details:", error);
    throw new Error("Failed to retrieve payout item details");
  }
}

/**
 * Calculate payout amount from subscription revenue
 * Platform keeps 70%, pays out 30% to receiver
 */
export function calculatePayoutAmount(totalRevenue: number): number {
  return totalRevenue * 0.30; // 30% payout to receiver
}

/**
 * Get receiver email
 */
export function getReceiverEmail(): string {
  return RECEIVER_EMAIL;
}
