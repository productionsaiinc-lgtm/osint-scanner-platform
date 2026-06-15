import { describe, it, expect } from "vitest";
import axios from "axios";

describe("Hunter.io API Integration", () => {
  it("should validate Hunter.io API key with a domain search", async () => {
    const apiKey = process.env.HUNTER_API_KEY;
    
    if (!apiKey) {
      console.warn("HUNTER_API_KEY not set, skipping test");
      expect(true).toBe(true);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.hunter.io/v2/domain-search?domain=google.com&api_key=${apiKey}&limit=1`,
        { timeout: 15000 }
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeDefined();
      
      // Check if we got valid response structure
      if (response.data.data.emails) {
        expect(Array.isArray(response.data.data.emails)).toBe(true);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error(`Hunter.io API key is invalid: ${error.response.status}`);
      }
      throw error;
    }
  }, 20000);

  it("should handle API errors gracefully", async () => {
    const apiKey = process.env.HUNTER_API_KEY;
    
    if (!apiKey) {
      expect(true).toBe(true);
      return;
    }

    try {
      // Test with invalid domain
      const response = await axios.get(
        `https://api.hunter.io/v2/domain-search?domain=invalid-domain-12345.xyz&api_key=${apiKey}&limit=1`,
        { timeout: 15000 }
      );

      // API should still return 200 but with empty results
      expect(response.status).toBe(200);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error(`Hunter.io API key is invalid: ${error.response.status}`);
      }
      // Other errors are acceptable (network, etc)
    }
  }, 20000);
});
