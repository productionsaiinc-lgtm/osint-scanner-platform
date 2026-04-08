/**
 * PayPal integration for subscription payments
 */

import axios from "axios";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

interface PayPalTokenResponse {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
}

interface PayPalProduct {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  image_url: string;
  home_url: string;
  created_time: string;
  updated_time: string;
  links: Array<{ rel: string; href: string; method: string }>;
}

interface PayPalPlan {
  id: string;
  product_id: string;
  name: string;
  description: string;
  status: string;
  billing_cycles: Array<{
    frequency: { interval_unit: string; interval_value: number };
    tenure_type: string;
    sequence: number;
    total_cycles: number;
    pricing_scheme: { fixed_price: { value: string; currency_code: string } };
  }>;
  payment_preferences: {
    auto_bill_amount: string;
    setup_fee: { value: string; currency_code: string };
    setup_fee_failure_action: string;
    payment_failure_threshold: number;
  };
  taxes: { percentage: string };
  create_time: string;
  update_time: string;
  links: Array<{ rel: string; href: string; method: string }>;
}

interface PayPalSubscription {
  id: string;
  status: string;
  status_update_time: string;
  plan_id: string;
  start_time: string;
  quantity: string;
  shipping_amount: { currency_code: string; value: string };
  subscriber: {
    name: { given_name: string; surname: string };
    email_address: string;
    payer_id: string;
    address: {
      address_line_1: string;
      address_line_2: string;
      admin_area_2: string;
      admin_area_1: string;
      postal_code: string;
      country_code: string;
    };
  };
  billing_info: {
    outstanding_balance: { currency_code: string; value: string };
    cycles_remaining: number;
    cycles_completed: number;
    next_billing_time: string;
    final_collection_time: string;
    failed_payments_count: number;
  };
  create_time: string;
  update_time: string;
  links: Array<{ rel: string; href: string; method: string }>;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

    const response = await axios.post<PayPalTokenResponse>(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in * 1000; // Convert to milliseconds

    cachedAccessToken = {
      token,
      expiresAt: Date.now() + expiresIn - 60000, // Refresh 1 minute before expiry
    };

    return token;
  } catch (error) {
    console.error("[PayPal] Failed to get access token:", error);
    throw new Error("Failed to authenticate with PayPal");
  }
}

export async function createProduct(
  name: string,
  description: string,
  category: string = "SOFTWARE"
): Promise<PayPalProduct> {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.post<PayPalProduct>(
      `${PAYPAL_API_BASE}/v1/billing/products`,
      {
        name,
        description,
        type: "SERVICE",
        category,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[PayPal] Failed to create product:", error);
    throw new Error("Failed to create PayPal product");
  }
}

export async function createPlan(
  productId: string,
  name: string,
  description: string,
  price: number,
  billingCycle: "monthly" | "yearly",
  currency: string = "USD"
): Promise<PayPalPlan> {
  const accessToken = await getAccessToken();

  const intervalUnit = billingCycle === "monthly" ? "MONTH" : "YEAR";
  const intervalValue = billingCycle === "monthly" ? 1 : 1;
  const priceString = (price / 100).toFixed(2); // Convert cents to dollars

  try {
    const response = await axios.post<PayPalPlan>(
      `${PAYPAL_API_BASE}/v1/billing/plans`,
      {
        product_id: productId,
        name,
        description,
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: {
              interval_unit: intervalUnit,
              interval_value: intervalValue,
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0, // 0 means infinite
            pricing_scheme: {
              fixed_price: {
                value: priceString,
                currency_code: currency,
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_amount: "YES",
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[PayPal] Failed to create plan:", error);
    throw new Error("Failed to create PayPal plan");
  }
}

export async function getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.get<PayPalSubscription>(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[PayPal] Failed to get subscription:", error);
    throw new Error("Failed to retrieve PayPal subscription");
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  reason: string = "User requested cancellation"
): Promise<void> {
  const accessToken = await getAccessToken();

  try {
    await axios.post(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[PayPal] Failed to cancel subscription:", error);
    throw new Error("Failed to cancel PayPal subscription");
  }
}

export async function suspendSubscription(
  subscriptionId: string,
  reason: string = "Suspension requested"
): Promise<void> {
  const accessToken = await getAccessToken();

  try {
    await axios.post(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/suspend`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[PayPal] Failed to suspend subscription:", error);
    throw new Error("Failed to suspend PayPal subscription");
  }
}

export async function activateSubscription(
  subscriptionId: string,
  reason: string = "Subscription reactivated"
): Promise<void> {
  const accessToken = await getAccessToken();

  try {
    await axios.post(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/activate`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[PayPal] Failed to activate subscription:", error);
    throw new Error("Failed to activate PayPal subscription");
  }
}

export function verifyWebhookSignature(
  webhookId: string,
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  actualSignature: string,
  body: string
): boolean {
  // In production, verify the webhook signature using PayPal's certificate
  // For now, return true (implement proper verification later)
  console.log("[PayPal] Webhook verification skipped in development mode");
  return true;
}
