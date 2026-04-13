/**
 * Process Payout Script
 * Manually triggers a payout to the owner's PayPal account
 */

import axios from "axios";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const RECEIVER_EMAIL = "productions.ai.inc@gmail.com";
const PAYOUT_AMOUNT = 380; // Your pending balance

async function getAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get PayPal access token:", error.message);
    throw error;
  }
}

async function processPayout() {
  try {
    console.log("🔄 Processing Payout...");
    console.log(`💰 Amount: $${PAYOUT_AMOUNT.toFixed(2)}`);
    console.log(`📧 Recipient: ${RECEIVER_EMAIL}`);
    console.log("");

    const accessToken = await getAccessToken();
    console.log("✅ PayPal authentication successful");

    const batchId = `MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/payments/payouts`,
      {
        sender_batch_header: {
          sender_batch_id: batchId,
          email_subject: "OSINT Scanner Platform Payout",
          email_message: "You have received a payout from OSINT Scanner Platform",
        },
        items: [
          {
            recipient_type: "EMAIL",
            amount: {
              currency_code: "USD",
              value: PAYOUT_AMOUNT.toFixed(2),
            },
            description: "Platform earnings payout",
            sender_item_id: batchId,
            receiver: RECEIVER_EMAIL,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const payoutId = response.data.batch_header.payout_batch_id;
    const status = response.data.batch_header.batch_status;

    console.log("✅ Payout processed successfully!");
    console.log("");
    console.log("📋 Payout Details:");
    console.log(`   Payout ID: ${payoutId}`);
    console.log(`   Status: ${status}`);
    console.log(`   Amount: $${PAYOUT_AMOUNT.toFixed(2)}`);
    console.log(`   Recipient: ${RECEIVER_EMAIL}`);
    console.log(`   Timestamp: ${response.data.batch_header.time_created}`);
    console.log("");
    console.log("⏱️  Processing typically takes 1-2 business days");
    console.log("📧 You'll receive a confirmation email at " + RECEIVER_EMAIL);

    return {
      success: true,
      payoutId,
      status,
      amount: PAYOUT_AMOUNT,
    };
  } catch (error) {
    console.error("❌ Payout failed:", error.message);
    if (error.response?.data) {
      console.error("PayPal Error:", error.response.data);
    }
    throw error;
  }
}

// Run the payout
processPayout().catch((error) => {
  process.exit(1);
});
