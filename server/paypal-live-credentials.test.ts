import { describe, it, expect, beforeAll } from "vitest";
import axios from "axios";

/**
 * Test PayPal Live Mode Credentials
 * Verifies that the PayPal live credentials are valid and can authenticate
 */

describe("PayPal Live Mode Credentials", () => {
  let accessToken: string;

  beforeAll(async () => {
    // Verify environment variables are set
    expect(process.env.PAYPAL_CLIENT_ID).toBeDefined();
    expect(process.env.PAYPAL_CLIENT_SECRET).toBeDefined();
    expect(process.env.PAYPAL_PAYOUT_EMAIL).toBeDefined();
    expect(process.env.PAYPAL_MODE).toBe("live");
  });

  it("should authenticate with PayPal live API using provided credentials", async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    expect(clientId).toBeTruthy();
    expect(clientSecret).toBeTruthy();

    try {
      const response = await axios.post(
        "https://api.paypal.com/v1/oauth2/token",
        "grant_type=client_credentials",
        {
          auth: {
            username: clientId,
            password: clientSecret,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.access_token).toBeTruthy();
      expect(response.data.token_type).toBe("Bearer");
      
      accessToken = response.data.access_token;
    } catch (error: any) {
      throw new Error(
        `Failed to authenticate with PayPal: ${error.response?.data?.error_description || error.message}`
      );
    }
  });

  it("should be able to fetch payout data with valid credentials", async () => {
    expect(accessToken).toBeTruthy();

    try {
      const response = await axios.get(
        "https://api.paypal.com/v1/payments/payouts",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            page_size: 1,
            page: 1,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      // Response should have batch_header or be empty (no payouts yet)
      expect(
        response.data.batch_header !== undefined ||
          response.data.payout_batch_id !== undefined ||
          Array.isArray(response.data)
      ).toBe(true);
    } catch (error: any) {
      // 404 is expected if no payouts have been made yet
      if (error.response?.status === 404) {
        console.log("No payouts found yet (expected on new account)");
        return;
      }
      throw new Error(
        `Failed to fetch payout data: ${error.response?.data?.message || error.message}`
      );
    }
  });

  it("should have valid payout email configured", () => {
    const payoutEmail = process.env.PAYPAL_PAYOUT_EMAIL;
    expect(payoutEmail).toBe("productions.ai.inc@gmail.com");
    expect(payoutEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("should be in live mode", () => {
    expect(process.env.PAYPAL_MODE).toBe("live");
  });
});
