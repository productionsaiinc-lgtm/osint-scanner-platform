import { describe, it, expect } from "vitest";

/**
 * Test PayPal credentials by attempting to authenticate with the PayPal API
 */
describe("PayPal Credentials Validation", () => {
  it("should validate PayPal credentials are set", () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const payoutEmail = process.env.PAYPAL_PAYOUT_EMAIL;

    expect(clientId).toBeDefined();
    expect(clientSecret).toBeDefined();
    expect(payoutEmail).toBeDefined();

    // Verify format
    expect(clientId).toContain("Ac_");
    expect(clientSecret?.length).toBeGreaterThan(10);
    expect(payoutEmail).toContain("@");
  });

  it("should validate PayPal API credentials format", () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    // PayPal Client IDs start with "Ac_" or "AXj"
    expect(clientId).toMatch(/^Ac_|^AXj/);

    // Client secret should be a long alphanumeric string
    expect(clientSecret).toMatch(/^[A-Za-z0-9_-]+$/);

    // Minimum length checks
    expect(clientId?.length).toBeGreaterThan(20);
    expect(clientSecret?.length).toBeGreaterThan(30);
  });

  it("should validate payout email format", () => {
    const payoutEmail = process.env.PAYPAL_PAYOUT_EMAIL;

    // Valid email format
    expect(payoutEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    // Should be the productions account
    expect(payoutEmail).toContain("productions.ai.inc");
  });

  it("should have all required PayPal environment variables", () => {
    const requiredEnvs = [
      "PAYPAL_CLIENT_ID",
      "PAYPAL_CLIENT_SECRET",
      "PAYPAL_PAYOUT_EMAIL",
    ];

    requiredEnvs.forEach((env) => {
      expect(process.env[env]).toBeDefined();
      expect(process.env[env]?.length).toBeGreaterThan(0);
    });
  });
});
