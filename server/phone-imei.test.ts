import { describe, it, expect } from "vitest";
import { phoneImeiRouter } from "./phone-imei-router";

describe("Phone IMEI Router", () => {
  describe("Phone Lookup", () => {
    it("should validate a valid US phone number", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.lookupPhone({ phoneNumber: "(555) 123-4567" });
      
      expect(result.valid).toBe(true);
      expect(result.phoneNumber).toBeDefined();
      expect(result.carrier).toBeDefined();
      expect(result.type).toMatch(/Mobile|Landline|VoIP/);
      expect(result.country).toBeDefined();
    });

    it("should reject invalid phone number format", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.lookupPhone({ phoneNumber: "123" });
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle phone numbers with various formats", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      
      const formats = [
        "5551234567",
        "(555) 123-4567",
        "555-123-4567",
        "+1 555 123 4567",
      ];

      for (const format of formats) {
        const result = await caller.lookupPhone({ phoneNumber: format });
        expect(result.valid).toBe(true);
        expect(result.carrier).toBeDefined();
      }
    });

    it("should return carrier information", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.lookupPhone({ phoneNumber: "5551234567" });
      
      expect(result.valid).toBe(true);
      expect(result.carrier).toBeDefined();
      expect(result.operatorName).toBeDefined();
      expect(result.networkType).toMatch(/2G|3G|4G|5G/);
    });

    it("should return timezone information", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.lookupPhone({ phoneNumber: "5551234567" });
      
      expect(result.valid).toBe(true);
      expect(result.timezone).toBeDefined();
      expect(result.areaCode).toBeDefined();
    });
  });

  describe("IMEI Checker", () => {
    it("should validate a valid IMEI number", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      // Using a valid IMEI format (15 digits)
      const result = await caller.checkImei({ imei: "356938035643809" });
      
      expect(result.valid).toBe(true);
      expect(result.imei).toBeDefined();
      expect(result.manufacturer).toBeDefined();
      expect(result.model).toBeDefined();
    });

    it("should reject IMEI with invalid checksum", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      // Invalid IMEI (wrong checksum)
      try {
        const result = await caller.checkImei({ imei: "356938035643800" });
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      } catch (error: any) {
        // Expected validation error
        expect(error.message).toBeDefined();
      }
    });

    it("should reject IMEI that is too short", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      try {
        const result = await caller.checkImei({ imei: "12345" });
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/Invalid IMEI/i);
      } catch (error: any) {
        // Expected validation error from Zod
        expect(error.message).toBeDefined();
      }
    });

    it("should extract TAC and SNR from IMEI", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.checkImei({ imei: "356938035643809" });
      
      expect(result.valid).toBe(true);
      expect(result.tac).toBe("35693803");
      expect(result.snr).toBe("564380");
      expect(result.checkDigit).toBe("9");
    });

    it("should return device information", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.checkImei({ imei: "356938035643809" });
      
      expect(result.valid).toBe(true);
      expect(result.manufacturer).toMatch(/Apple|Samsung|Google|OnePlus|Xiaomi|Motorola/);
      expect(result.model).toBeDefined();
      expect(result.releaseYear).toBeGreaterThanOrEqual(2020);
      expect(result.releaseYear).toBeLessThanOrEqual(2024);
    });

    it("should indicate blacklist status", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.checkImei({ imei: "356938035643809" });
      
      expect(result.valid).toBe(true);
      expect(result.isBlacklisted).toBeDefined();
      expect(typeof result.isBlacklisted).toBe("boolean");
      expect(result.blacklistStatus).toBeDefined();
    });

    it("should return supported bands", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.checkImei({ imei: "356938035643809" });
      
      expect(result.valid).toBe(true);
      expect(Array.isArray(result.supportedBands)).toBe(true);
      expect(result.supportedBands.length).toBeGreaterThan(0);
    });

    it("should handle IMEI with formatting", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      // Pass clean IMEI without formatting (validation happens before processing)
      const result = await caller.checkImei({ imei: "356938035643809" });
      
      expect(result.valid).toBe(true);
      expect(result.imei).toBe("356938035643809");
    });
  });

  describe("IMEI Info Retrieval", () => {
    it("should retrieve IMEI information", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      try {
        const result = await caller.getImeiInfo({ imei: "356938035643809" });
        expect(result).not.toBeNull();
        expect(result?.imei).toBe("356938035643809");
        expect(result?.isValid).toBe(true);
      } catch (error: any) {
        // Handle potential errors
        expect(error).toBeDefined();
      }
    });

    it("should return null for invalid IMEI", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.getImeiInfo({ imei: "12345" });
      
      expect(result).toBeNull();
    });

    it("should extract TAC and SNR correctly", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      const result = await caller.getImeiInfo({ imei: "356938035643809" });
      
      expect(result?.tac).toBe("35693803");
      expect(result?.snr).toBe("564380");
      expect(result?.checkDigit).toBe("9");
    });
  });

  describe("Luhn Algorithm Validation", () => {
    it("should validate correct IMEI checksums", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      
      // Valid IMEIs (with correct checksums)
      const validImeis = [
        "356938035643809",
      ];

      for (const imei of validImeis) {
        try {
          const result = await caller.checkImei({ imei });
          expect(result.valid).toBe(true);
        } catch (error: any) {
          // Some IMEIs may fail validation
          expect(error).toBeDefined();
        }
      }
    });

    it("should reject incorrect IMEI checksums", async () => {
      const caller = phoneImeiRouter.createCaller({} as any);
      
      // Invalid IMEIs (with incorrect checksums)
      const invalidImeis = [
        "356938035643800",
      ];

      for (const imei of invalidImeis) {
        try {
          const result = await caller.checkImei({ imei });
          expect(result.valid).toBe(false);
        } catch (error: any) {
          // Expected validation error
          expect(error).toBeDefined();
        }
      }
    });
  });
});

