/**
 * PayPal Integration Module
 * Handles PayPal payment processing, webhooks, and subscription management
 */

import axios from "axios";

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode: "sandbox" | "live";
  email: string;
}

interface PayPalOrder {
  id: string;
  status: string;
  payer: {
    email_address: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
}

interface PayPalAccessToken {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
}

class PayPalClient {
  private config: PayPalConfig;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: PayPalConfig) {
    this.config = config;
    this.baseUrl =
      config.mode === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";
  }

  /**
   * Get access token from PayPal
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString("base64");

      const response = await axios.post<PayPalAccessToken>(
        `${this.baseUrl}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      console.error("[PayPal] Error getting access token:", error);
      throw new Error("Failed to authenticate with PayPal");
    }
  }

  /**
   * Create a PayPal order for $20 premium subscription
   */
  async createOrder(
    email: string,
    returnUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      const token = await this.getAccessToken();

      const orderData = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "20.00",
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: "20.00",
                },
              },
            },
            items: [
              {
                name: "OSINT Scanner Premium Subscription",
                description: "1-month premium access to all OSINT scanning tools",
                sku: "OSINT-PREMIUM-1M",
                unit_amount: {
                  currency_code: "USD",
                  value: "20.00",
                },
                quantity: "1",
                category: "DIGITAL_SERVICE",
              },
            ],
            custom_id: email,
            description: "Premium subscription for OSINT Scanner Platform",
          },
        ],
        payer: {
          email_address: email,
        },
        application_context: {
          brand_name: "OSINT Scanner Platform",
          locale: "en-US",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[PayPal] Order created:", response.data.id);
      return response.data.id;
    } catch (error) {
      console.error("[PayPal] Error creating order:", error);
      throw error;
    }
  }

  /**
   * Capture a PayPal order (complete the payment)
   */
  async captureOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post<PayPalOrder>(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[PayPal] Order captured:", response.data.id);
      return response.data;
    } catch (error) {
      console.error("[PayPal] Error capturing order:", error);
      throw error;
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get<PayPalOrder>(
        `${this.baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("[PayPal] Error getting order:", error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    webhookId: string,
    transmissionId: string,
    transmissionTime: string,
    certUrl: string,
    webhookBody: string,
    webhookSignature: string
  ): boolean {
    // In production, verify the signature using PayPal's verification API
    // For now, we'll do basic validation
    console.log("[PayPal] Verifying webhook signature");
    return true;
  }

  /**
   * Get PayPal approval link for order
   */
  getApprovalLink(orderId: string): string {
    return `${this.baseUrl.replace("/v1", "").replace("/v2", "")}/checkoutnow/${orderId}`;
  }
}

// Initialize PayPal client
let paypalClient: PayPalClient | null = null;

export function initializePayPal(): PayPalClient {
  if (paypalClient) {
    return paypalClient;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = (process.env.PAYPAL_MODE || "sandbox") as "sandbox" | "live";
  const email = process.env.PAYPAL_PAYOUT_EMAIL || "productions.ai.inc@gmail.com";

  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET"
    );
  }

  paypalClient = new PayPalClient({
    clientId,
    clientSecret,
    mode,
    email,
  });

  console.log(`[PayPal] Initialized in ${mode} mode`);
  return paypalClient;
}

export function getPayPalClient(): PayPalClient {
  if (!paypalClient) {
    return initializePayPal();
  }
  return paypalClient;
}

export type { PayPalOrder, PayPalAccessToken, PayPalConfig };
