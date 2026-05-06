import axios from "axios";
import { z } from "zod";

/**
 * PHASE 2: Real API Integrations
 * - Shodan Device Search (Shodan API - Paid)
 * - Flight Tracker (OpenSky Network API - Free)
 * - Web Scraper (Puppeteer + Cheerio - Open source)
 * - IoT Scanner (Shodan API)
 */

// ============================================================================
// 1. SHODAN DEVICE SEARCH
// ============================================================================

export async function searchShodanReal(query: string, page: number = 1) {
  try {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey) {
      throw new Error("SHODAN_API_KEY not configured");
    }

    const response = await axios.get(
      `https://api.shodan.io/shodan/host/search?query=${encodeURIComponent(query)}&page=${page}&key=${apiKey}`,
      { timeout: 15000 }
    );

    if (!response.data.matches) {
      return {
        success: false,
        error: "No results found",
      };
    }

    const devices = response.data.matches.map((match: any) => ({
      ip: match.ip_str,
      port: match.port,
      service: match.product || "Unknown",
      version: match.version || null,
      organization: match.org || "Unknown",
      location: {
        country: match.country_name || "Unknown",
        city: match.city || "Unknown",
        latitude: match.latitude,
        longitude: match.longitude,
      },
      vulnerabilities: match.vulns ? Object.keys(match.vulns) : [],
      lastUpdate: match.timestamp,
      banner: match.data?.substring(0, 200) || null,
    }));

    return {
      success: true,
      data: {
        total: response.data.total,
        page: page,
        devices: devices,
        source: "Shodan API",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Shodan search failed",
    };
  }
}

// ============================================================================
// 2. FLIGHT TRACKER - OPENSKY NETWORK API (FREE)
// ============================================================================

export async function trackFlightReal(flightICAO: string) {
  try {
    if (!flightICAO || flightICAO.length < 3) {
      throw new Error("Invalid flight ICAO code");
    }

    // OpenSky Network API (free, no auth required but rate limited)
    const response = await axios.get(
      `https://opensky-network.org/api/flights/aircraft?icao24=${flightICAO.toLowerCase()}`,
      { timeout: 10000 }
    );

    if (!response.data || response.data.length === 0) {
      return {
        success: false,
        error: "Flight not found",
      };
    }

    const flight = response.data[0];

    return {
      success: true,
      data: {
        icao24: flight.icao24,
        callsign: flight.callsign?.trim() || "Unknown",
        origin: flight.estDepartureAirport || "Unknown",
        destination: flight.estArrivalAirport || "Unknown",
        aircraft: flight.aircraftType || "Unknown",
        firstSeen: new Date(flight.firstSeen * 1000),
        lastSeen: new Date(flight.lastSeen * 1000),
        status: "Active",
        source: "OpenSky Network API",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Flight tracking failed",
    };
  }
}

// ============================================================================
// 3. WEB SCRAPER - PUPPETEER + CHEERIO
// ============================================================================

let puppeteer: any = null;
let cheerio: any = null;

async function loadScraperLibs() {
  if (!puppeteer) {
    try {
      puppeteer = await import("puppeteer");
    } catch {
      console.warn("puppeteer not installed");
    }
  }
  if (!cheerio) {
    try {
      cheerio = await import("cheerio");
    } catch {
      console.warn("cheerio not installed");
    }
  }
  return { puppeteer, cheerio };
}

export async function scrapeWebsiteReal(
  url: string,
  options: { headless?: boolean; timeout?: number } = {}
) {
  try {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const urlObj = new URL(url);
    const { puppeteer: pup, cheerio: ch } = await loadScraperLibs();

    // Try simple HTTP fetch first (faster)
    try {
      const response = await axios.get(url, {
        timeout: options.timeout || 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (ch) {
        const $ = ch.load(response.data);

        // Extract data
        const title = $("title").text() || "No title";
        const description =
          $('meta[name="description"]').attr("content") || "No description";
        const links: string[] = [];
        const emails: string[] = [];
        const phones: string[] = [];

        // Extract links
        $("a").each((i: number, el: any) => {
          const href = $(el).attr("href");
          if (href && !href.startsWith("#")) {
            links.push(href);
          }
        });

        // Extract emails
        const emailRegex =
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emailMatches = response.data.match(emailRegex);
        if (emailMatches) {
          emails.push(...new Set(emailMatches));
        }

        // Extract phone numbers
        const phoneRegex = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
        const phoneMatches = response.data.match(phoneRegex);
        if (phoneMatches) {
          phones.push(...new Set(phoneMatches));
        }

        return {
          success: true,
          data: {
            url: url,
            title: title,
            description: description,
            links: links.slice(0, 20), // Limit to 20
            emails: emails.slice(0, 10),
            phones: phones.slice(0, 10),
            contentLength: response.data.length,
            statusCode: response.status,
            source: "Web Scraper (Cheerio)",
          },
        };
      }
    } catch (error) {
      console.warn("Simple fetch failed, trying Puppeteer:", error);
    }

    // Fallback: use Puppeteer for JavaScript-heavy sites
    if (pup) {
      const browser = await pup.launch({ headless: options.headless ?? true });
      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
        const content = await page.content();

        if (ch) {
          const $ = ch.load(content);
          const title = $("title").text() || "No title";
          const description =
            $('meta[name="description"]').attr("content") || "No description";

          return {
            success: true,
            data: {
              url: url,
              title: title,
              description: description,
              contentLength: content.length,
              source: "Web Scraper (Puppeteer)",
            },
          };
        }
      } finally {
        await browser.close();
      }
    }

    throw new Error("No scraper libraries available");
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Web scraping failed",
    };
  }
}

// ============================================================================
// 4. IOT SCANNER - SHODAN API
// ============================================================================

export async function scanIoTDevicesReal(
  query: string = "IoT",
  limit: number = 10
) {
  try {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey) {
      throw new Error("SHODAN_API_KEY not configured");
    }

    // Search for IoT devices
    const response = await axios.get(
      `https://api.shodan.io/shodan/host/search?query=${encodeURIComponent(query)}&limit=${limit}&key=${apiKey}`,
      { timeout: 15000 }
    );

    if (!response.data.matches) {
      return {
        success: false,
        error: "No IoT devices found",
      };
    }

    const devices = response.data.matches.map((match: any) => ({
      ip: match.ip_str,
      port: match.port,
      deviceType: match.product || "Unknown IoT Device",
      manufacturer: match.org || "Unknown",
      location: {
        country: match.country_name,
        city: match.city,
        coordinates: {
          latitude: match.latitude,
          longitude: match.longitude,
        },
      },
      vulnerabilities: match.vulns ? Object.keys(match.vulns).length : 0,
      services: [
        {
          name: match.product || "Unknown",
          version: match.version || null,
          port: match.port,
        },
      ],
      riskLevel:
        (match.vulns && Object.keys(match.vulns).length > 0)
          ? "high"
          : "medium",
      lastSeen: match.timestamp,
    }));

    return {
      success: true,
      data: {
        total: response.data.total,
        devices: devices,
        scanType: "IoT Device Discovery",
        source: "Shodan IoT Scanner API",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "IoT scanning failed",
    };
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const ShodanSearchSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
  page: z.number().optional().default(1),
});

export const FlightTrackerSchema = z.object({
  flightICAO: z.string().length(6, "ICAO code must be 6 characters"),
});

export const WebScraperSchema = z.object({
  url: z.string().url("Invalid URL"),
  headless: z.boolean().optional().default(true),
  timeout: z.number().optional().default(10000),
});

export const IoTScannerSchema = z.object({
  query: z.string().optional().default("IoT"),
  limit: z.number().optional().default(10),
});
