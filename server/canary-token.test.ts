import { describe, it, expect } from "vitest";
import {
  generateCanaryToken,
  createCanaryToken,
  logCanaryTokenEvent,
  sendCanaryTokenAlert,
  getCanaryTokenStats,
  validateCanaryToken,
  formatCanaryTokenForDisplay,
} from "./canary-token-service";

describe("Canary Token Service", () => {
  it("should generate a valid canary token", () => {
    const token = generateCanaryToken();
    expect(token).toHaveLength(32);
    expect(/^[a-zA-Z0-9]+$/.test(token)).toBe(true);
  });

  it("should create a canary token", async () => {
    const token = await createCanaryToken("Test Token", "test@example.com", "page_view", "Test description");
    expect(token).toHaveProperty("id");
    expect(token).toHaveProperty("token");
    expect(token.name).toBe("Test Token");
    expect(token.email).toBe("test@example.com");
    expect(token.is_active).toBe(true);
    expect(token.trigger_count).toBe(0);
  });

  it("should log a canary token event", async () => {
    const token = await createCanaryToken("Event Test", "test@example.com");
    const event = await logCanaryTokenEvent(
      token.id,
      token.token,
      "192.168.1.1",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );

    expect(event).toHaveProperty("id");
    expect(event.token_id).toBe(token.id);
    expect(event.visitor_ip).toBe("192.168.1.1");
    expect(event).toHaveProperty("country");
    expect(event).toHaveProperty("device_type");
    expect(event).toHaveProperty("browser");
    expect(event).toHaveProperty("os");
  });

  it("should send a canary token alert", async () => {
    const token = await createCanaryToken("Alert Test", "alert@example.com");
    const event = await logCanaryTokenEvent(token.id, token.token, "10.0.0.1", "Mozilla/5.0");
    const alert = await sendCanaryTokenAlert(token, event);

    expect(alert).toHaveProperty("id");
    expect(alert.token_id).toBe(token.id);
    expect(alert.email_sent).toBe(true);
    expect(alert.email_address).toBe("alert@example.com");
    expect(alert.subject).toContain("Alert Test");
  });

  it("should get canary token statistics", async () => {
    const token1 = await createCanaryToken("Token 1", "test1@example.com");
    const token2 = await createCanaryToken("Token 2", "test2@example.com");
    token1.trigger_count = 5;
    token2.trigger_count = 3;

    const stats = await getCanaryTokenStats([token1, token2]);
    expect(stats.total_tokens).toBe(2);
    expect(stats.active_tokens).toBe(2);
    expect(stats.total_triggers).toBe(8);
    expect(stats.most_triggered).toBe(token1);
  });

  it("should validate canary token format", () => {
    const validToken = generateCanaryToken();
    expect(validateCanaryToken(validToken)).toBe(true);

    expect(validateCanaryToken("short")).toBe(false);
    expect(validateCanaryToken("invalid@token#with$special%chars")).toBe(false);
  });

  it("should format canary token for display", async () => {
    const token = await createCanaryToken("Display Test", "display@example.com");
    const formatted = formatCanaryTokenForDisplay(token);

    expect(formatted).toHaveProperty("id");
    expect(formatted).toHaveProperty("name");
    expect(formatted).toHaveProperty("type");
    expect(formatted).toHaveProperty("status");
    expect(formatted).toHaveProperty("url");
    expect(formatted.url).toContain("canary=");
  });

  it("should detect device type from user agent", async () => {
    const mobileUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)";
    const desktopUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    const tabletUA = "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)";

    const mobileEvent = await logCanaryTokenEvent("id1", "token1", "1.1.1.1", mobileUA);
    const desktopEvent = await logCanaryTokenEvent("id2", "token2", "2.2.2.2", desktopUA);
    const tabletEvent = await logCanaryTokenEvent("id3", "token3", "3.3.3.3", tabletUA);

    expect(mobileEvent.device_type).toBe("mobile");
    expect(desktopEvent.device_type).toBe("desktop");
    expect(tabletEvent.device_type).toBe("tablet");
  });

  it("should extract browser from user agent", async () => {
    const chromeUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0";
    const firefoxUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0";

    const chromeEvent = await logCanaryTokenEvent("id1", "token1", "1.1.1.1", chromeUA);
    const firefoxEvent = await logCanaryTokenEvent("id2", "token2", "2.2.2.2", firefoxUA);

    expect(chromeEvent.browser).toBe("Chrome");
    expect(firefoxEvent.browser).toBe("Firefox");
  });

  it("should handle multiple tokens with different states", async () => {
    const activeToken = await createCanaryToken("Active", "active@example.com");
    const inactiveToken = await createCanaryToken("Inactive", "inactive@example.com");
    inactiveToken.is_active = false;

    const stats = await getCanaryTokenStats([activeToken, inactiveToken]);
    expect(stats.active_tokens).toBe(1);
    expect(stats.total_tokens).toBe(2);
  });
});
