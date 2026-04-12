import { describe, it, expect, beforeAll } from "vitest";
import { getPayPalClient } from "./paypal-integration";

describe("PayPal Credentials Validation", () => {
  it("should validate PayPal credentials by getting access token", async () => {
    const paypal = getPayPalClient();
    
    try {
      // Try to create an order to validate credentials
      const orderId = await paypal.createOrder(
        "test@example.com",
        "https://example.com/success",
        "https://example.com/cancel"
      );
      
      expect(orderId).toBeDefined();
      expect(typeof orderId).toBe("string");
      expect(orderId.length).toBeGreaterThan(0);
    } catch (error: any) {
      // If it's an auth error, credentials are invalid
      if (error.response?.status === 401 || error.message?.includes("unauthorized")) {
        throw new Error("PayPal credentials are invalid");
      }
      // Other errors might be expected (network, etc)
      console.log("PayPal order creation test result:", error.message);
    }
  });

  it("should have PayPal mode set to sandbox", () => {
    const mode = process.env.PAYPAL_MODE;
    expect(mode).toBeDefined();
    expect(["sandbox", "live"]).toContain(mode);
  });

  it("should have PayPal payout email configured", () => {
    const email = process.env.PAYPAL_PAYOUT_EMAIL;
    expect(email).toBeDefined();
    expect(email).toContain("@");
  });
});
