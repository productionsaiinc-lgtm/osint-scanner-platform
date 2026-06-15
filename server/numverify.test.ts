import { describe, it, expect, beforeAll } from "vitest";
import { lookupPhoneReal } from "./phone-lookup-real";

describe("Numverify API Integration", () => {
  beforeAll(() => {
    // Ensure API key is set
    if (!process.env.NUMVERIFY_API_KEY) {
      console.warn("NUMVERIFY_API_KEY not set, test will use mock data");
    }
  });

  it("should validate a valid US phone number", async () => {
    const result = await lookupPhoneReal("+1-202-555-0173");
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    
    if (result.data) {
      expect(result.data.isValid).toBe(true);
      expect(result.data.country).toBeDefined();
      expect(result.data.carrier).toBeDefined();
      expect(result.data.type).toBeDefined();
    }
  });

  it("should reject invalid phone numbers", async () => {
    const result = await lookupPhoneReal("123");
    
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.valid).toBe(false);
  });

  it("should handle formatted phone numbers", async () => {
    const result = await lookupPhoneReal("(202) 555-0173");
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("should return carrier information", async () => {
    const result = await lookupPhoneReal("2025550173");
    
    if (result.success && result.data) {
      expect(result.data.carrier).toBeTruthy();
      expect(result.data.operatorName).toBeTruthy();
      expect(result.data.type).toMatch(/Mobile|Landline|VoIP/);
    }
  });
});
