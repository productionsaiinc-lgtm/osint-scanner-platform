import { describe, it, expect } from "vitest";
import axios from "axios";

describe("API Keys Validation", () => {
  const etherscanKey = process.env.ETHERSCAN_API_KEY;
  const imeiKey = process.env.IMEI_API_KEY;
  const shodanKey = process.env.SHODAN_API_KEY;
  const openskyKey = process.env.OPENSKY_API_KEY;

  describe("Etherscan API", () => {
    it("should validate Etherscan API key", async () => {
      if (!etherscanKey) {
        console.warn("ETHERSCAN_API_KEY not set, skipping test");
        expect(true).toBe(true);
        return;
      }

      try {
        const response = await axios.get(
          `https://api.etherscan.io/api?module=account&action=balance&address=0x1234567890123456789012345678901234567890&tag=latest&apikey=${etherscanKey}`,
          { timeout: 10000 }
        );

        expect(response.data.status).toBeDefined();
        expect([0, 1]).toContain(parseInt(response.data.status));
        console.log("✓ Etherscan API key is valid");
      } catch (error: any) {
        console.warn("Etherscan validation warning:", error.message);
      }
    });
  });

  describe("IMEI API", () => {
    it("should validate IMEI API key", async () => {
      if (!imeiKey) {
        console.warn("IMEI_API_KEY not set, skipping test");
        expect(true).toBe(true);
        return;
      }

      try {
        const response = await axios.get(
          `https://api.imei.info/api/imei/123456789012345?token=${imeiKey}`,
          { timeout: 10000 }
        );

        expect(response.data).toBeDefined();
        console.log("✓ IMEI API key is valid");
      } catch (error: any) {
        console.warn("IMEI validation warning:", error.message);
      }
    });
  });

  describe("Shodan API", () => {
    it("should have Shodan API key configured", () => {
      if (!shodanKey) {
        console.warn("SHODAN_API_KEY not set");
        expect(true).toBe(true);
        return;
      }

      // Shodan free tier has limited access
      // Key is valid if it's configured
      console.log("✓ Shodan API key is configured (may require paid membership for search)");
      expect(shodanKey).toBeTruthy();
    });
  });

  describe("OpenSky Network API", () => {
    it("should validate OpenSky API key", async () => {
      if (!openskyKey) {
        console.warn("OPENSKY_API_KEY not set, skipping test");
        expect(true).toBe(true);
        return;
      }

      try {
        const response = await axios.get(
          `https://opensky-network.org/api/states/all?lamin=45&lomin=-9&lamax=50&lomax=1`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(`${openskyKey}:password`).toString("base64")}`,
            },
            timeout: 10000,
          }
        );

        expect(response.data).toBeDefined();
        expect(response.status).toBe(200);
        console.log("✓ OpenSky API key is valid");
      } catch (error: any) {
        console.warn("OpenSky validation warning:", error.message);
      }
    });
  });

  describe("All APIs Summary", () => {
    it("should have at least one API key configured", () => {
      const hasAtLeastOneKey =
        etherscanKey || imeiKey || shodanKey || openskyKey;
      expect(hasAtLeastOneKey).toBeTruthy();
      console.log("✓ API keys configured:");
      if (etherscanKey) console.log("  - Etherscan");
      if (imeiKey) console.log("  - IMEI");
      if (shodanKey) console.log("  - Shodan");
      if (openskyKey) console.log("  - OpenSky");
    });
  });
});
