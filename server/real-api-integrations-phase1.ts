import axios from "axios";
import { z } from "zod";

/**
 * PHASE 1: Real API Integrations
 * - VIN Decoder (NHTSA API - Free)
 * - Crypto Tracker (Etherscan API - Free tier available)
 * - IMEI Lookup (IMEI.info API)
 * - Password Strength (zxcvbn library + Have I Been Pwned)
 */

// ============================================================================
// 1. VIN DECODER - NHTSA API (FREE)
// ============================================================================

export async function decodeVINReal(vin: string) {
  try {
    if (vin.length !== 17) {
      throw new Error("VIN must be exactly 17 characters");
    }

    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
      { timeout: 10000 }
    );

    if (!response.data.Results || response.data.Results.length === 0) {
      return {
        success: false,
        error: "Invalid VIN - no results found",
      };
    }

    const results = response.data.Results;
    const getField = (variableName: string) =>
      results.find((r: any) => r.Variable === variableName)?.Value || "Unknown";

    return {
      success: true,
      data: {
        vin: vin,
        manufacturer: getField("Make"),
        year: parseInt(getField("Model Year")) || null,
        make: getField("Make"),
        model: getField("Model"),
        bodyType: getField("Body Class"),
        engine: getField("Engine Description"),
        transmission: getField("Transmission Style"),
        driveType: getField("Drive Type"),
        fuelType: getField("Fuel Type - Primary"),
        doors: getField("Doors"),
        seatRows: getField("Seat Rows"),
        source: "NHTSA VIN Decoder API",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "VIN decoding failed",
    };
  }
}

// ============================================================================
// 2. CRYPTO ADDRESS TRACKER - ETHERSCAN API (FREE TIER)
// ============================================================================

export async function trackCryptoAddressReal(
  address: string,
  chain: "ethereum" | "bitcoin" = "ethereum"
) {
  try {
    if (chain === "ethereum") {
      // Etherscan API
      const apiKey = process.env.ETHERSCAN_API_KEY;
      if (!apiKey) {
        throw new Error("ETHERSCAN_API_KEY not configured");
      }

      // Get ETH balance
      const balanceRes = await axios.get(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`,
        { timeout: 10000 }
      );

      if (balanceRes.data.status !== "1") {
        return {
          success: false,
          error: "Invalid Ethereum address",
        };
      }

      const balanceWei = parseInt(balanceRes.data.result);
      const balanceEth = balanceWei / 1e18;

      // Get transaction count
      const txRes = await axios.get(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`,
        { timeout: 10000 }
      );

      const transactions = txRes.data.result ? txRes.data.result.length : 0;

      // Get first and last transaction dates
      let firstSeen = null;
      let lastActive = null;

      if (txRes.data.result && txRes.data.result.length > 0) {
        firstSeen = new Date(
          parseInt(txRes.data.result[0].timeStamp) * 1000
        );
        lastActive = new Date(
          parseInt(txRes.data.result[txRes.data.result.length - 1].timeStamp) *
            1000
        );
      }

      // Determine risk level based on activity
      let riskLevel = "low";
      if (transactions > 1000) riskLevel = "high";
      else if (transactions > 100) riskLevel = "medium";

      return {
        success: true,
        data: {
          address: address,
          chain: "ethereum",
          balance: balanceEth,
          balanceUSD: balanceEth * 2500, // Approximate USD value
          transactions: transactions,
          firstSeen: firstSeen,
          lastActive: lastActive,
          riskLevel: riskLevel,
          source: "Etherscan API",
        },
      };
    } else if (chain === "bitcoin") {
      // BlockChain.com API (free, no key required)
      const btcRes = await axios.get(
        `https://blockchain.info/q/addressbalance/${address}`,
        { timeout: 10000 }
      );

      const balanceSatoshi = parseInt(btcRes.data);
      const balanceBtc = balanceSatoshi / 1e8;

      return {
        success: true,
        data: {
          address: address,
          chain: "bitcoin",
          balance: balanceBtc,
          balanceUSD: balanceBtc * 45000, // Approximate USD value
          transactions: 0, // Would need separate API call
          riskLevel: balanceBtc > 10 ? "high" : "low",
          source: "Blockchain.com API",
        },
      };
    }

    return { success: false, error: "Unsupported chain" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Crypto tracking failed",
    };
  }
}

// ============================================================================
// 3. PHONE IMEI LOOKUP - IMEI.INFO API
// ============================================================================

export async function lookupIMEIReal(imei: string) {
  try {
    if (!/^\d{15}$/.test(imei)) {
      throw new Error("IMEI must be exactly 15 digits");
    }

    const apiKey = process.env.IMEI_API_KEY;
    if (!apiKey) {
      throw new Error("IMEI_API_KEY not configured");
    }

    const response = await axios.get(
      `https://api.imei.info/api/imei/${imei}?token=${apiKey}`,
      { timeout: 10000 }
    );

    if (!response.data.success) {
      return {
        success: false,
        error: response.data.message || "IMEI lookup failed",
      };
    }

    const data = response.data.data;

    return {
      success: true,
      data: {
        imei: imei,
        deviceName: data.device_name || "Unknown",
        manufacturer: data.brand || "Unknown",
        model: data.model || "Unknown",
        type: data.device_type || "Unknown",
        carrier: data.carrier || "Unknown",
        status: data.status || "Unknown",
        blacklistStatus: data.blacklist_status || "Not blacklisted",
        releaseDate: data.release_date || null,
        source: "IMEI.info API",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "IMEI lookup failed",
    };
  }
}

// ============================================================================
// 4. PASSWORD STRENGTH - ZXCVBN + HAVE I BEEN PWNED
// ============================================================================

// Import zxcvbn for local password strength analysis
let zxcvbn: any = null;

async function loadZxcvbn() {
  if (!zxcvbn) {
    try {
      zxcvbn = (await import("zxcvbn")).default;
    } catch {
      console.warn("zxcvbn not installed, using fallback");
    }
  }
  return zxcvbn;
}

export async function checkPasswordStrengthReal(password: string) {
  try {
    if (!password || password.length === 0) {
      throw new Error("Password cannot be empty");
    }

    const zxcvbnLib = await loadZxcvbn();
    let score = 0;
    let feedback = "Password is weak";
    let suggestions: string[] = [];

    if (zxcvbnLib) {
      // Use zxcvbn for detailed analysis
      const result = zxcvbnLib(password);
      score = result.score; // 0-4
      feedback = result.feedback.warning || "Password strength unknown";
      suggestions = result.feedback.suggestions || [];
    } else {
      // Fallback: basic strength analysis
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^a-zA-Z\d]/.test(password)) strength++;

      score = Math.min(Math.floor(strength / 1.5), 4);
      const strengthLabels = [
        "Very Weak",
        "Weak",
        "Fair",
        "Good",
        "Strong",
      ];
      feedback = strengthLabels[score];
    }

    // Check Have I Been Pwned API
    let isCompromised = false;
    let compromisedCount = 0;

    try {
      const crypto = require("crypto");
      const sha1Hash = crypto
        .createHash("sha1")
        .update(password)
        .digest("hex")
        .toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      const hibpRes = await axios.get(
        `https://api.pwnedpasswords.com/range/${prefix}`,
        { timeout: 5000 }
      );

      const hashes = hibpRes.data.split("\r\n");
      for (const hash of hashes) {
        const [hashSuffix, count] = hash.split(":");
        if (hashSuffix === suffix) {
          isCompromised = true;
          compromisedCount = parseInt(count);
          break;
        }
      }
    } catch (error) {
      console.warn("Have I Been Pwned check failed:", error);
    }

    const strengthLabels = [
      "Very Weak",
      "Weak",
      "Fair",
      "Good",
      "Strong",
    ];

    return {
      success: true,
      data: {
        strength: strengthLabels[score],
        score: score, // 0-4
        feedback: feedback,
        suggestions: suggestions,
        isCompromised: isCompromised,
        compromisedCount: compromisedCount,
        length: password.length,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChars: /[^a-zA-Z\d]/.test(password),
        source: "zxcvbn + Have I Been Pwned API",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Password strength check failed",
    };
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const VINSchema = z.object({
  vin: z.string().length(17, "VIN must be exactly 17 characters"),
});

export const CryptoAddressSchema = z.object({
  address: z.string().min(26, "Invalid address format"),
  chain: z.enum(["ethereum", "bitcoin"]).optional().default("ethereum"),
});

export const IMEISchema = z.object({
  imei: z.string().regex(/^\d{15}$/, "IMEI must be exactly 15 digits"),
});

export const PasswordSchema = z.object({
  password: z.string().min(1, "Password cannot be empty"),
});
