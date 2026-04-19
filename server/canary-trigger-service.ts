/**
 * Canary Token Trigger Service
 * Handles trigger tracking, visitor information collection, and notifications
 */

import { getDb } from "./db";
import { canaryTokenTriggers, canaryTokens } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

interface TriggerData {
  tokenId: string;
  userId: number;
  ipAddress: string;
  userAgent?: string;
  referer?: string;
}

interface VisitorInfo {
  ipAddress: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  deviceType?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
}

/**
 * Parse User-Agent to extract device information
 */
function parseUserAgent(userAgent: string): {
  deviceType: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
} {
  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();

  return {
    deviceType: result.device.type || "desktop",
    browser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "Unknown",
    os: result.os.name || "Unknown",
    osVersion: result.os.version || "Unknown",
  };
}

/**
 * Get geolocation data from IP address
 * Using a simple mock implementation - can be replaced with real API
 */
async function getGeolocationData(ipAddress: string): Promise<{
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}> {
  try {
    // Mock geolocation data - in production, use a real IP geolocation API
    // Examples: MaxMind, IPStack, GeoIP2, etc.
    
    // For now, return mock data based on IP patterns
    const mockData: { [key: string]: any } = {
      "127.0.0.1": { country: "Local", city: "Localhost", latitude: 0, longitude: 0 },
      "192.168": { country: "Private", city: "Private Network", latitude: 0, longitude: 0 },
      "10.": { country: "Private", city: "Private Network", latitude: 0, longitude: 0 },
    };

    for (const [pattern, data] of Object.entries(mockData)) {
      if (ipAddress.startsWith(pattern)) {
        return data;
      }
    }

    // Return generic data for public IPs
    return {
      country: "Unknown",
      city: "Unknown",
      latitude: 0,
      longitude: 0,
    };
  } catch (error) {
    console.error("[Canary Trigger] Geolocation error:", error);
    return {};
  }
}

/**
 * Collect visitor information from request
 */
async function collectVisitorInfo(triggerData: TriggerData): Promise<VisitorInfo> {
  const userAgentInfo = triggerData.userAgent ? parseUserAgent(triggerData.userAgent) : {
    deviceType: "unknown",
    browser: "Unknown",
    browserVersion: "Unknown",
    os: "Unknown",
    osVersion: "Unknown",
  };

  const geoData = await getGeolocationData(triggerData.ipAddress);

  return {
    ipAddress: triggerData.ipAddress,
    country: geoData.country,
    city: geoData.city,
    latitude: geoData.latitude ? parseFloat(geoData.latitude.toString()) : undefined,
    longitude: geoData.longitude ? parseFloat(geoData.longitude.toString()) : undefined,
    ...userAgentInfo,
  };
}

/**
 * Record a canary token trigger
 */
export async function recordCanaryTrigger(triggerData: TriggerData): Promise<any> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Collect visitor information
    const visitorInfo = await collectVisitorInfo(triggerData);

    // Record trigger in database
    const trigger: any = await db.insert(canaryTokenTriggers).values({
      tokenId: triggerData.tokenId,
      userId: triggerData.userId,
      ipAddress: visitorInfo.ipAddress,
      userAgent: triggerData.userAgent,
      referer: triggerData.referer,
      country: visitorInfo.country,
      city: visitorInfo.city,
      latitude: visitorInfo.latitude ? (visitorInfo.latitude as any) : undefined,
      longitude: visitorInfo.longitude ? (visitorInfo.longitude as any) : undefined,
      deviceType: visitorInfo.deviceType,
      browser: visitorInfo.browser,
      browserVersion: visitorInfo.browserVersion,
      os: visitorInfo.os,
      osVersion: visitorInfo.osVersion,
      timestamp: new Date(),
      createdAt: new Date(),
    });

    // Update token trigger count and last triggered time
    const allTriggers: any[] = await db
      .select()
      .from(canaryTokenTriggers)
      .where(eq(canaryTokenTriggers.tokenId, triggerData.tokenId));
    
    const triggerCount = allTriggers.length;
    
    await db
      .update(canaryTokens)
      .set({
        triggerCount,
        lastTriggeredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(canaryTokens.id, triggerData.tokenId));

    console.log(`[Canary Trigger] Token ${triggerData.tokenId} triggered from ${visitorInfo.ipAddress}`);

    return {
      success: true,
      trigger,
      visitorInfo,
    };
  } catch (error) {
    console.error("[Canary Trigger] Error recording trigger:", error);
    throw error;
  }
}

/**
 * Get trigger history for a token
 */
export async function getTokenTriggerHistory(tokenId: string, userId: number, limit: number = 50) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const triggers = await db
      .select()
      .from(canaryTokenTriggers)
      .where(eq(canaryTokenTriggers.tokenId, tokenId))
      .limit(limit);

    return triggers as any[];
  } catch (error) {
    console.error("[Canary Trigger] Error fetching trigger history:", error);
    throw error;
  }
}

/**
 * Get trigger statistics for a token
 */
export async function getTokenTriggerStats(tokenId: string) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const triggers: any[] = await db
      .select()
      .from(canaryTokenTriggers)
      .where(eq(canaryTokenTriggers.tokenId, tokenId));

    const stats = {
      totalTriggers: triggers.length,
      uniqueIPs: new Set(triggers.map((t: any) => t.ipAddress)).size,
      topCountries: {} as { [key: string]: number },
      topBrowsers: {} as { [key: string]: number },
      topDevices: {} as { [key: string]: number },
      lastTriggered: triggers.length > 0 ? triggers[triggers.length - 1].timestamp : null,
    };

    // Calculate statistics
    triggers.forEach((trigger: any) => {
      if (trigger.country) {
        stats.topCountries[trigger.country] = (stats.topCountries[trigger.country] || 0) + 1;
      }
      if (trigger.browser) {
        stats.topBrowsers[trigger.browser] = (stats.topBrowsers[trigger.browser] || 0) + 1;
      }
      if (trigger.deviceType) {
        stats.topDevices[trigger.deviceType] = (stats.topDevices[trigger.deviceType] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error("[Canary Trigger] Error calculating stats:", error);
    throw error;
  }
}

/**
 * Delete all triggers for a token
 */
export async function deleteTokenTriggers(tokenId: string) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    await db.delete(canaryTokenTriggers).where(eq(canaryTokenTriggers.tokenId, tokenId));
    console.log(`[Canary Trigger] Deleted all triggers for token ${tokenId}`);
  } catch (error) {
    console.error("[Canary Trigger] Error deleting triggers:", error);
    throw error;
  }
}
