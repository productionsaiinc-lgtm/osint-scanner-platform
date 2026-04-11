/**
 * Comprehensive SIM Swap Detection Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculateRiskScore,
  getRiskLevel,
  determineSIMSwapStatus,
} from "./sim-swap-db";
import {
  detectViaBreachDatabase,
  detectViaCarrierCheck,
  detectViaPatternAnalysis,
} from "./sim-swap-detector";
import { detectCarrier, getCarrierSpecificCheck } from "./carrier-detection";
import {
  checkHaveIBeenPwned,
  checkCredentialStuffing,
  checkSIMSwapBreaches,
  checkLeakedPhoneLists,
} from "./breach-database-integration";

describe("SIM Swap Detection", () => {
  describe("Risk Score Calculation", () => {
    it("should calculate low risk score", () => {
      const score = calculateRiskScore({
        breachCount: 0,
        breachSeverity: 0,
        carrierProtection: true,
        suspiciousPatterns: 0,
        accountFlagged: false,
        multipleCarrierChanges: false,
        frequentPorting: false,
        suspiciousLogins: 0,
        passwordResets: 0,
        smsVerificationFails: 0,
        unusualGeoLocation: false,
        deviceChanges: 0,
      });

      expect(score).toBeLessThan(30);
    });

    it("should calculate high risk score", () => {
      const score = calculateRiskScore({
        breachCount: 5,
        breachSeverity: 80,
        carrierProtection: false,
        suspiciousPatterns: 3,
        accountFlagged: true,
        multipleCarrierChanges: true,
        frequentPorting: true,
        suspiciousLogins: 5,
        passwordResets: 5,
        smsVerificationFails: 5,
        unusualGeoLocation: true,
        deviceChanges: 5,
      });

      expect(score).toBeGreaterThan(70);
    });

    it("should cap risk score at 100", () => {
      const score = calculateRiskScore({
        breachCount: 100,
        breachSeverity: 100,
        carrierProtection: false,
        suspiciousPatterns: 100,
        accountFlagged: true,
        multipleCarrierChanges: true,
        frequentPorting: true,
        suspiciousLogins: 100,
        passwordResets: 100,
        smsVerificationFails: 100,
        unusualGeoLocation: true,
        deviceChanges: 100,
      });

      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("Risk Level Determination", () => {
    it("should return low risk level", () => {
      expect(getRiskLevel(20)).toBe("low");
    });

    it("should return medium risk level", () => {
      expect(getRiskLevel(50)).toBe("medium");
    });

    it("should return high risk level", () => {
      expect(getRiskLevel(70)).toBe("high");
    });

    it("should return critical risk level", () => {
      expect(getRiskLevel(85)).toBe("critical");
    });
  });

  describe("SIM Swap Status Determination", () => {
    it("should detect SIM swap with high confidence indicators", () => {
      const isSwapped = determineSIMSwapStatus({
        breachCount: 3,
        carrierProtection: false,
        multipleCarrierChanges: true,
        frequentPorting: true,
        accountFlagged: true,
        suspiciousLogins: 3,
        smsVerificationFails: 3,
        riskScore: 80,
      });

      expect(isSwapped).toBe(true);
    });

    it("should not detect SIM swap with low indicators", () => {
      const isSwapped = determineSIMSwapStatus({
        breachCount: 0,
        carrierProtection: true,
        multipleCarrierChanges: false,
        frequentPorting: false,
        accountFlagged: false,
        suspiciousLogins: 0,
        smsVerificationFails: 0,
        riskScore: 15,
      });

      expect(isSwapped).toBe(false);
    });

    it("should detect SIM swap with high risk score", () => {
      const isSwapped = determineSIMSwapStatus({
        breachCount: 1,
        carrierProtection: true,
        multipleCarrierChanges: false,
        frequentPorting: false,
        accountFlagged: false,
        suspiciousLogins: 0,
        smsVerificationFails: 0,
        riskScore: 75,
      });

      expect(isSwapped).toBe(true);
    });
  });

  describe("Carrier Detection", () => {
    it("should detect Verizon from area code", () => {
      const carrier = detectCarrier("2015551234");
      expect(carrier).toBe("Verizon");
    });

    it("should detect AT&T from area code", () => {
      const carrier = detectCarrier("2055551234");
      expect(carrier).toBe("AT&T");
    });

    it("should detect T-Mobile from area code", () => {
      const carrier = detectCarrier("2065551234");
      expect(carrier).toBe("T-Mobile");
    });

    it("should handle formatted phone numbers", () => {
      const carrier = detectCarrier("(201) 555-1234");
      expect(carrier).toBe("Verizon");
    });

    it("should return Unknown for invalid area code", () => {
      const carrier = detectCarrier("0005551234");
      expect(carrier).toBe("Unknown");
    });
  });

  describe("Carrier-Specific Checks", () => {
    it("should return Verizon-specific recommendations", () => {
      const result = getCarrierSpecificCheck("Verizon", "2015551234");
      expect(result.carrier).toBe("Verizon");
      expect(result.protectionAvailable).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain("Verizon Account PIN");
    });

    it("should return AT&T-specific recommendations", () => {
      const result = getCarrierSpecificCheck("AT&T", "2055551234");
      expect(result.carrier).toBe("AT&T");
      expect(result.recommendations[0]).toContain("AT&T Account PIN");
    });

    it("should return T-Mobile-specific recommendations", () => {
      const result = getCarrierSpecificCheck("T-Mobile", "2065551234");
      expect(result.carrier).toBe("T-Mobile");
      expect(result.recommendations[0]).toContain("T-Mobile Account PIN");
    });

    it("should handle case-insensitive carrier names", () => {
      const result1 = getCarrierSpecificCheck("verizon", "2015551234");
      const result2 = getCarrierSpecificCheck("VERIZON", "2015551234");
      expect(result1.carrier).toBe("Verizon");
      expect(result2.carrier).toBe("Verizon");
    });
  });

  describe("Breach Database Checks", () => {
    it("should check HaveIBeenPwned", async () => {
      const result = await checkHaveIBeenPwned("2015551234");
      expect(result.phoneNumber).toBe("2015551234");
      expect(result.breachesFound).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    it("should check credential stuffing", async () => {
      const result = await checkCredentialStuffing("2015551234");
      expect(result.phoneNumber).toBe("2015551234");
      expect(result.breachesFound).toBeGreaterThanOrEqual(0);
    });

    it("should check SIM swap breaches", async () => {
      const result = await checkSIMSwapBreaches("2015551234");
      expect(result.phoneNumber).toBe("2015551234");
      expect(result.simSwapRelatedBreaches).toBeGreaterThanOrEqual(0);
    });

    it("should check leaked phone lists", async () => {
      const result = await checkLeakedPhoneLists("2015551234");
      expect(result.phoneNumber).toBe("2015551234");
      expect(result.breachesFound).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Detection Methods", () => {
    it("should perform breach database detection", async () => {
      const result = await detectViaBreachDatabase("2015551234");
      expect(result.isSwapped).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it("should perform carrier check detection", async () => {
      const result = await detectViaCarrierCheck("2015551234", "Verizon");
      expect(result.isSwapped).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(result.indicators).toBeDefined();
    });

    it("should perform pattern analysis detection", async () => {
      const result = await detectViaPatternAnalysis("2015551234");
      expect(result.isSwapped).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });
  });

  describe("Phone Number Normalization", () => {
    it("should handle various phone number formats", () => {
      const formats = [
        "2015551234",
        "(201) 555-1234",
        "201-555-1234",
        "+1 (201) 555-1234",
        "1-201-555-1234",
      ];

      formats.forEach((format) => {
        const carrier = detectCarrier(format);
        expect(carrier).toBeDefined();
        expect(carrier).not.toBe("");
      });
    });
  });

  describe("Risk Score Edge Cases", () => {
    it("should handle zero risk factors", () => {
      const score = calculateRiskScore({
        breachCount: 0,
        breachSeverity: 0,
        carrierProtection: true,
        suspiciousPatterns: 0,
        accountFlagged: false,
        multipleCarrierChanges: false,
        frequentPorting: false,
        suspiciousLogins: 0,
        passwordResets: 0,
        smsVerificationFails: 0,
        unusualGeoLocation: false,
        deviceChanges: 0,
      });

      expect(score).toBe(0);
    });

    it("should properly weight different risk factors", () => {
      const scoreWithProtection = calculateRiskScore({
        breachCount: 5,
        breachSeverity: 50,
        carrierProtection: true,
        suspiciousPatterns: 0,
        accountFlagged: false,
        multipleCarrierChanges: false,
        frequentPorting: false,
        suspiciousLogins: 0,
        passwordResets: 0,
        smsVerificationFails: 0,
        unusualGeoLocation: false,
        deviceChanges: 0,
      });

      const scoreWithoutProtection = calculateRiskScore({
        breachCount: 5,
        breachSeverity: 50,
        carrierProtection: false,
        suspiciousPatterns: 0,
        accountFlagged: false,
        multipleCarrierChanges: false,
        frequentPorting: false,
        suspiciousLogins: 0,
        passwordResets: 0,
        smsVerificationFails: 0,
        unusualGeoLocation: false,
        deviceChanges: 0,
      });

      expect(scoreWithoutProtection).toBeGreaterThan(scoreWithProtection);
    });
  });
});
