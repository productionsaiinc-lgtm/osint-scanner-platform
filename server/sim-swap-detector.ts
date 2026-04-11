/**
 * SIM Swap Detection Service
 * Implements multiple detection methods:
 * 1. Breach Database Analysis - checks against known breach databases
 * 2. Carrier Status Check - verifies carrier SIM swap protection
 * 3. Pattern Analysis - detects suspicious account patterns
 * 4. Hybrid Analysis - combines all methods for confidence scoring
 */

import {
  recordSimSwapDetection,
  recordBreachEntry,
  recordCarrierStatus,
  recordSimSwapPattern,
  getBreachEntries,
  getCarrierStatus,
  getSimSwapPattern,
  calculateRiskScore,
  getRiskLevel,
  determineSIMSwapStatus,
} from "./sim-swap-db";

interface SimSwapDetectionResult {
  phoneNumber: string;
  isSwapped: boolean;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
  detectionMethod: string;
  breachIndicators: any[];
  carrierIndicators: any;
  patternIndicators: any;
  simSwapProtectionEnabled: boolean;
  protectionType: string;
  suspiciousActivities: string[];
  recommendations: string[];
}

/**
 * Detect SIM swap using breach database analysis
 */
export async function detectViaBreachDatabase(
  phoneNumber: string
): Promise<{
  isSwapped: boolean;
  riskScore: number;
  indicators: any[];
  confidence: number;
}> {
  try {
    const breachEntries = await getBreachEntries(phoneNumber);

    if (breachEntries.length === 0) {
      return {
        isSwapped: false,
        riskScore: 0,
        indicators: [],
        confidence: 0,
      };
    }

    // Analyze breach entries
    const simSwapRelatedBreaches = breachEntries.filter(
      (b) =>
        b.breachType === "sim_swap_attempt" ||
        b.breachType === "carrier_data" ||
        b.breachType === "phone_list"
    );

    const criticalBreaches = breachEntries.filter(
      (b) => b.severity === "critical" || b.severity === "high"
    );

    // Calculate risk
    let riskScore = 0;
    riskScore += simSwapRelatedBreaches.length * 15;
    riskScore += criticalBreaches.length * 10;
    riskScore = Math.min(riskScore, 100);

    const isSwapped = simSwapRelatedBreaches.length > 0 || riskScore > 60;
    const confidence = Math.min(
      (simSwapRelatedBreaches.length + criticalBreaches.length) * 20,
      100
    );

    return {
      isSwapped,
      riskScore,
      indicators: breachEntries.map((b) => ({
        source: b.breachSource,
        type: b.breachType,
        severity: b.severity,
        date: b.breachDate,
        verified: b.verified === 1,
      })),
      confidence,
    };
  } catch (error) {
    console.error("Breach database detection error:", error);
    return {
      isSwapped: false,
      riskScore: 0,
      indicators: [],
      confidence: 0,
    };
  }
}

/**
 * Detect SIM swap using carrier status check
 */
export async function detectViaCarrierCheck(
  phoneNumber: string,
  carrier: string
): Promise<{
  isSwapped: boolean;
  riskScore: number;
  indicators: any;
  confidence: number;
}> {
  try {
    const carrierStatus = await getCarrierStatus(phoneNumber);

    if (!carrierStatus) {
      // No carrier data available - simulate check
      return {
        isSwapped: false,
        riskScore: 20,
        indicators: {
          protectionEnabled: false,
          protectionType: "unknown",
          accountStatus: "unknown",
          suspiciousActivityCount: 0,
        },
        confidence: 30,
      };
    }

    // Analyze carrier status
    let riskScore = 0;

    if (!carrierStatus.protectionEnabled) {
      riskScore += 30;
    }

    if (carrierStatus.accountStatus === "flagged") {
      riskScore += 25;
    } else if (carrierStatus.accountStatus === "suspended") {
      riskScore += 40;
    }

    riskScore += Math.min((carrierStatus.suspiciousActivityCount || 0) * 5, 20);

    const isSwapped =
      carrierStatus.accountStatus === "flagged" ||
      carrierStatus.accountStatus === "suspended" ||
      riskScore > 65;

    return {
      isSwapped,
      riskScore: Math.min(riskScore, 100),
      indicators: {
        protectionEnabled: carrierStatus.protectionEnabled === 1,
        protectionType: carrierStatus.protectionType,
        accountStatus: carrierStatus.accountStatus,
        suspiciousActivityCount: carrierStatus.suspiciousActivityCount,
        lastVerified: carrierStatus.lastVerified,
      },
      confidence: 70,
    };
  } catch (error) {
    console.error("Carrier detection error:", error);
    return {
      isSwapped: false,
      riskScore: 0,
      indicators: {},
      confidence: 0,
    };
  }
}

/**
 * Detect SIM swap using pattern analysis
 */
export async function detectViaPatternAnalysis(
  phoneNumber: string
): Promise<{
  isSwapped: boolean;
  riskScore: number;
  indicators: any;
  confidence: number;
}> {
  try {
    const pattern = await getSimSwapPattern(phoneNumber);

    if (!pattern) {
      // No pattern data - return neutral
      return {
        isSwapped: false,
        riskScore: 0,
        indicators: {},
        confidence: 0,
      };
    }

    // Analyze patterns
    let riskScore = 0;
    const suspiciousPatterns = [];

    if (pattern.multipleCarrierChanges === 1) {
      riskScore += 20;
      suspiciousPatterns.push("Multiple carrier changes detected");
    }

    if (pattern.frequentPorting === 1) {
      riskScore += 15;
      suspiciousPatterns.push("Frequent number porting detected");
    }

    if (pattern.suspiciousLoginAttempts === 1) {
      riskScore += 15;
      suspiciousPatterns.push("Suspicious login attempts detected");
    }

    riskScore += Math.min((pattern.accountRecoveryAttempts || 0) * 3, 15);
    if ((pattern.accountRecoveryAttempts || 0) > 2) {
      suspiciousPatterns.push(
        `Multiple account recovery attempts (${pattern.accountRecoveryAttempts})`
      );
    }

    riskScore += Math.min((pattern.passwordResetAttempts || 0) * 2, 12);
    if ((pattern.passwordResetAttempts || 0) > 3) {
      suspiciousPatterns.push(
        `Multiple password resets (${pattern.passwordResetAttempts})`
      );
    }

    riskScore += Math.min((pattern.smsVerificationFails || 0) * 4, 20);
    if ((pattern.smsVerificationFails || 0) > 1) {
      suspiciousPatterns.push(
        `Failed SMS verifications (${pattern.smsVerificationFails})`
      );
    }

    if (pattern.unusualGeoLocation === 1) {
      riskScore += 10;
      suspiciousPatterns.push("Unusual geographic location detected");
    }

    riskScore += Math.min((pattern.deviceChanges || 0) * 2, 10);
    if ((pattern.deviceChanges || 0) > 2) {
      suspiciousPatterns.push(`Multiple device changes (${pattern.deviceChanges})`);
    }

    // Add pattern's own risk score
    riskScore = Math.max(riskScore, pattern.riskScore || 0);
    riskScore = Math.min(riskScore, 100);

    const isSwapped =
      pattern.multipleCarrierChanges === 1 ||
      pattern.frequentPorting === 1 ||
      ((pattern.smsVerificationFails || 0) > 2 && (pattern.accountRecoveryAttempts || 0) > 1) ||
      riskScore > 70;

    return {
      isSwapped,
      riskScore,
      indicators: {
        multipleCarrierChanges: pattern.multipleCarrierChanges === 1,
        frequentPorting: pattern.frequentPorting === 1,
        suspiciousLoginAttempts: pattern.suspiciousLoginAttempts === 1,
        accountRecoveryAttempts: pattern.accountRecoveryAttempts || 0,
        passwordResetAttempts: pattern.passwordResetAttempts || 0,
        smsVerificationFails: pattern.smsVerificationFails || 0,
        unusualGeoLocation: pattern.unusualGeoLocation === 1,
        deviceChanges: pattern.deviceChanges || 0,
        suspiciousPatterns,
      },
      confidence: Math.min(suspiciousPatterns.length * 15, 100),
    };
  } catch (error) {
    console.error("Pattern analysis detection error:", error);
    return {
      isSwapped: false,
      riskScore: 0,
      indicators: {},
      confidence: 0,
    };
  }
}

/**
 * Comprehensive SIM swap detection using hybrid analysis
 */
export async function detectSimSwap(
  userId: number,
  phoneNumber: string,
  carrier: string
): Promise<SimSwapDetectionResult> {
  try {
    console.log(`[SIM Swap] Starting detection for ${phoneNumber}`);

    // Run all detection methods in parallel
    const [breachResult, carrierResult, patternResult] = await Promise.all([
      detectViaBreachDatabase(phoneNumber),
      detectViaCarrierCheck(phoneNumber, carrier),
      detectViaPatternAnalysis(phoneNumber),
    ]);

    // Combine results
    const combinedRiskScore = Math.round(
      (breachResult.riskScore * 0.35 +
        carrierResult.riskScore * 0.35 +
        patternResult.riskScore * 0.3) /
        3
    );

    const combinedConfidence = Math.round(
      (breachResult.confidence +
        carrierResult.confidence +
        patternResult.confidence) /
        3
    );

    // Determine if swapped
    const isSwapped = determineSIMSwapStatus({
      breachCount: breachResult.indicators.length,
      carrierProtection: carrierResult.indicators.protectionEnabled || false,
      multipleCarrierChanges:
        patternResult.indicators.multipleCarrierChanges || false,
      frequentPorting: patternResult.indicators.frequentPorting || false,
      accountFlagged:
        carrierResult.indicators.accountStatus === "flagged" ||
        carrierResult.indicators.accountStatus === "suspended",
      suspiciousLogins: patternResult.indicators.suspiciousLoginAttempts ? 1 : 0,
      smsVerificationFails: patternResult.indicators.smsVerificationFails || 0,
      riskScore: combinedRiskScore,
    });

    const riskLevel = getRiskLevel(combinedRiskScore);

    // Collect suspicious activities
    const suspiciousActivities = [
      ...breachResult.indicators.map(
        (b: any) =>
          `Breach detected: ${b.source} (${b.type}) - Severity: ${b.severity}`
      ),
      ...(patternResult.indicators.suspiciousPatterns || []),
    ];

    // Generate recommendations
    const recommendations = generateRecommendations(
      isSwapped,
      riskLevel,
      carrierResult.indicators.protectionEnabled
    );

    // Record detection result
    await recordSimSwapDetection({
      userId,
      phoneNumber,
      carrier,
      isSwapped: isSwapped ? 1 : 0,
      riskScore: combinedRiskScore,
      riskLevel,
      detectionMethod: "hybrid",
      breachIndicators: JSON.stringify(breachResult.indicators),
      carrierIndicators: JSON.stringify(carrierResult.indicators),
      patternIndicators: JSON.stringify(patternResult.indicators),
      simSwapProtectionEnabled: (carrierResult.indicators.protectionEnabled || false) ? 1 : 0,
      protectionType: (carrierResult.indicators.protectionType as string) || "unknown",
      suspiciousActivities: JSON.stringify(suspiciousActivities),
      confidence: combinedConfidence,
    });

    return {
      phoneNumber,
      isSwapped,
      riskScore: combinedRiskScore,
      riskLevel,
      confidence: combinedConfidence,
      detectionMethod: "hybrid",
      breachIndicators: breachResult.indicators,
      carrierIndicators: carrierResult.indicators,
      patternIndicators: patternResult.indicators,
      simSwapProtectionEnabled: carrierResult.indicators.protectionEnabled || false,
      protectionType: (carrierResult.indicators.protectionType as string) || "unknown",
      suspiciousActivities,
      recommendations,
    };
  } catch (error) {
    console.error("[SIM Swap] Detection error:", error);
    throw error;
  }
}

/**
 * Generate security recommendations based on detection results
 */
function generateRecommendations(
  isSwapped: boolean,
  riskLevel: string,
  protectionEnabled: boolean | undefined
): string[] {
  const recommendations = [];

  if (isSwapped) {
    recommendations.push(
      "⚠️ CRITICAL: Contact your carrier immediately to report potential SIM swap"
    );
    recommendations.push(
      "Change passwords for all critical accounts (email, banking, social media)"
    );
    recommendations.push(
      "Enable two-factor authentication using authenticator apps instead of SMS"
    );
    recommendations.push(
      "Monitor your credit reports for fraudulent activity at annualcreditreport.com"
    );
    recommendations.push(
      "Consider placing a fraud alert or credit freeze with credit bureaus"
    );
  }

  if (!protectionEnabled) {
    recommendations.push(
      "Enable SIM swap protection with your carrier immediately"
    );
    recommendations.push(
      "Add a PIN or password to your carrier account for additional security"
    );
  }

  if (riskLevel === "high" || riskLevel === "critical") {
    recommendations.push(
      "Use authenticator apps (Google Authenticator, Authy, Microsoft Authenticator) for 2FA"
    );
    recommendations.push(
      "Enable biometric authentication on all accounts that support it"
    );
    recommendations.push(
      "Regularly review account activity and login history"
    );
  }

  recommendations.push(
    "Use strong, unique passwords for each account (consider a password manager)"
  );
  recommendations.push(
    "Enable notifications for account login attempts and changes"
  );
  recommendations.push(
    "Avoid sharing personal information that could be used for account recovery"
  );

  return recommendations;
}
