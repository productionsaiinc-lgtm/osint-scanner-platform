import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";
import dns from "node:dns/promises";
import { getIPGeolocationMaxMind, getCertificateTransparency, getShodanPortData, searchNVDVulnerabilities, analyzeWithVirusTotal, checkIPReputation, getWHOISData, enumerateDNS, searchGitHubRepos, getThreatIntelligence, getAPIConfiguration } from "./real-api-integrations";

const API_TIMEOUT = 12000;

function normalizeDomain(value: string) {
  const trimmed = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmed) ? trimmed : "";
}

function domainFromCompany(value: string) {
  const normalized = normalizeDomain(value);
  if (normalized) return normalized;
  return `${value.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/^www/, "")}.com`;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function extractSelectorText(html: string, selector?: string) {
  if (!selector) return [];
  const trimmed = selector.trim();
  if (!trimmed || /[>,+~:[\]]/.test(trimmed)) return [];

  let pattern: RegExp;
  if (trimmed.startsWith("#")) {
    const id = trimmed.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pattern = new RegExp(`<([a-z0-9-]+)(?=[^>]*\\bid=["']${id}["'])[^>]*>([\\s\\S]*?)<\\/\\1>`, "gi");
  } else if (trimmed.startsWith(".")) {
    const klass = trimmed.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pattern = new RegExp(`<([a-z0-9-]+)(?=[^>]*\\bclass=["'][^"']*\\b${klass}\\b[^"']*["'])[^>]*>([\\s\\S]*?)<\\/\\1>`, "gi");
  } else if (/^[a-z][a-z0-9-]*$/i.test(trimmed)) {
    pattern = new RegExp(`<${trimmed}\\b[^>]*>([\\s\\S]*?)<\\/${trimmed}>`, "gi");
  } else {
    return [];
  }

  const matches: string[] = [];
  let match;
  while ((match = pattern.exec(html)) !== null && matches.length < 25) {
    const content = stripTags(match[2] || match[1] || "");
    if (content) matches.push(content.slice(0, 500));
  }
  return matches;
}

// Dark Web Monitor
const darkWebMonitorProcedure = protectedProcedure
  .input(z.object({ query: z.string().min(1) }))
  .mutation(async ({ input, ctx }) => {
    try {
      if (!process.env.HIBP_API_KEY) {
        return {
          success: false,
          error: "Dark web/breach monitoring requires HIBP_API_KEY or another breach-intelligence provider.",
          needsKey: true,
        };
      }

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.query);
      if (!isEmail) {
        return {
          success: false,
          error: "Real breach monitoring currently supports email queries through Have I Been Pwned.",
        };
      }

      const res = await axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(input.query)}`, {
        params: { truncateResponse: false },
        headers: { "hibp-api-key": process.env.HIBP_API_KEY, "User-Agent": "OSINT-Scanner-Platform" },
        timeout: API_TIMEOUT,
        validateStatus: (status) => status === 200 || status === 404,
      });
      const breaches = res.status === 404 ? [] : res.data;
      return {
        success: true,
        data: {
          query: input.query,
          mentions: breaches.length,
          lastSeen: breaches[0]?.ModifiedDate || null,
          sources: breaches.map((breach: any) => breach.Name),
          severity: breaches.length > 0 ? "high" : "low",
          breaches,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to monitor breach sources" };
    }
  });

// VIN Decoder
const vinDecoderProcedure = protectedProcedure
  .input(z.object({ vin: z.string().min(17).max(17) }))
  .mutation(async ({ input }) => {
    try {
      const res = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(input.vin)}`, {
        params: { format: "json" },
        timeout: API_TIMEOUT,
      });
      const vehicle = res.data?.Results?.[0] || {};
      const decoded = {
        vin: input.vin,
        manufacturer: vehicle.Manufacturer || vehicle.ManufacturerName || "Unknown",
        year: vehicle.ModelYear || "Unknown",
        make: vehicle.Make || "Unknown",
        model: vehicle.Model || "Unknown",
        bodyType: vehicle.BodyClass || "Unknown",
        engine: [vehicle.EngineCylinders, vehicle.DisplacementL, vehicle.FuelTypePrimary].filter(Boolean).join(" / ") || "Unknown",
        transmission: vehicle.TransmissionStyle || "Unknown",
        driveType: vehicle.DriveType || "Unknown",
        plantCountry: vehicle.PlantCountry || undefined,
        source: "NHTSA vPIC",
      };
      return { success: true, data: decoded };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to decode VIN" };
    }
  });

// Crypto Tracker
const cryptoTrackerProcedure = protectedProcedure
  .input(z.object({ address: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const address = input.address.trim();
      if (!/^[13bc1][a-zA-HJ-NP-Z0-9]{25,90}$/i.test(address)) {
        return {
          success: false,
          error: "Real crypto tracking currently supports Bitcoin addresses through Blockstream public API.",
        };
      }
      const [addressRes, txRes] = await Promise.all([
        axios.get(`https://blockstream.info/api/address/${address}`, { timeout: API_TIMEOUT }),
        axios.get(`https://blockstream.info/api/address/${address}/txs`, { timeout: API_TIMEOUT }),
      ]);
      const chainStats = addressRes.data?.chain_stats || {};
      const mempoolStats = addressRes.data?.mempool_stats || {};
      const funded = (chainStats.funded_txo_sum || 0) + (mempoolStats.funded_txo_sum || 0);
      const spent = (chainStats.spent_txo_sum || 0) + (mempoolStats.spent_txo_sum || 0);
      const cryptoData = {
        address,
        network: "bitcoin",
        balance: (funded - spent) / 100_000_000,
        transactions: chainStats.tx_count || 0,
        firstSeen: txRes.data?.at(-1)?.status?.block_time ? new Date(txRes.data.at(-1).status.block_time * 1000) : null,
        lastActive: txRes.data?.[0]?.status?.block_time ? new Date(txRes.data[0].status.block_time * 1000) : null,
        riskLevel: "unknown",
        source: "Blockstream public API",
      };
      return { success: true, data: cryptoData };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to track crypto address" };
    }
  });

// Employee Enum — real public-source enrichment from Hunter.io and GitHub profiles.
const employeeEnumProcedure = protectedProcedure
  .input(z.object({ company: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const company = input.company.trim();
      const domain = domainFromCompany(company);
      const employees: Array<{ name: string; title: string; email: string; linkedin: string; source: string; confidence?: number }> = [];
      const errors: string[] = [];

      // 1. Hunter.io domain search returns verified public email records when configured.
      const hunterKey = process.env.HUNTER_API_KEY;
      if (hunterKey) {
        try {
          const hunterRes = await axios.get(
            `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${hunterKey}&limit=10`,
            { timeout: API_TIMEOUT }
          );
          const hunterEmails: any[] = hunterRes.data?.data?.emails || [];
          for (const e of hunterEmails) {
            employees.push({
              name: [e.first_name, e.last_name].filter(Boolean).join(' ') || e.value.split('@')[0],
              title: e.position || e.type || 'Employee',
              email: e.value,
              linkedin: e.linkedin || `linkedin.com/search/results/people/?keywords=${encodeURIComponent([e.first_name, e.last_name].filter(Boolean).join(' '))}`,
              source: 'Hunter.io',
              confidence: e.confidence,
            });
          }
        } catch (e: any) {
          errors.push(`Hunter.io: ${e.message}`);
        }
      } else {
        errors.push('Hunter.io: HUNTER_API_KEY is not configured');
      }

      // 2. GitHub public user search can identify staff profiles without inventing emails.
      try {
        const ghHeaders: Record<string, string> = {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'OSINT-Scanner-Platform',
        };
        const ghToken = process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY;
        if (ghToken) ghHeaders.Authorization = `Bearer ${ghToken}`;

        const terms = [domain, company].filter(Boolean);
        const ghRes = await axios.get("https://api.github.com/search/users", {
          params: { q: `${terms.join(" ")} in:company type:user`, per_page: 20 },
          headers: ghHeaders,
          timeout: API_TIMEOUT,
        });

        const ghUsers = (ghRes.data?.items || []).slice(0, 12);
        for (const user of ghUsers) {
          try {
            const profileRes = await axios.get(`https://api.github.com/users/${user.login}`, { headers: ghHeaders, timeout: 6000 });
            const p = profileRes.data;
            const profileCompany = String(p.company || '').toLowerCase();
            const profileEmail = String(p.email || '');
            const companyToken = company.toLowerCase().split(/[.\s-]/)[0];
            const matchesCompany = profileCompany.includes(companyToken) || profileEmail.endsWith(`@${domain}`);
            if (!matchesCompany) continue;

            employees.push({
              name: p.name || p.login,
              title: p.bio?.substring(0, 80) || 'GitHub profile',
              email: profileEmail || '',
              linkedin: p.blog || `https://github.com/${p.login}`,
              source: 'GitHub',
            });
          } catch {
            // Skip individual profile failures; the aggregate result remains useful.
          }
        }
      } catch (e: any) {
        errors.push(`GitHub: ${e.response?.data?.message || e.message}`);
      }

      // Deduplicate by email
      const seen = new Set<string>();
      const unique = employees.filter(e => {
        const key = e.email || `${e.name}:${e.source}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return {
        success: true,
        data: {
          company,
          domain,
          employees: unique,
          count: unique.length,
          source: unique.length > 0 ? 'Real public OSINT sources' : 'No matching public employee records found',
          emailPatterns: [`first.last@${domain}`, `flast@${domain}`, `first@${domain}`],
          socialMediaPresence: {
            twitter: 0,
            github: unique.filter(e => e.source === 'GitHub').length,
            linkedIn: unique.filter(e => e.source === 'Hunter.io').length + unique.length,
          },
          errors: errors.length > 0 ? errors : undefined,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to enumerate employees' };
    }
  });

// Geo Reverse
const geoReverseProcedure = protectedProcedure
  .input(z.object({ latitude: z.number(), longitude: z.number() }))
  .mutation(async ({ input }) => {
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: { format: "jsonv2", lat: input.latitude, lon: input.longitude, addressdetails: 1 },
        headers: { "User-Agent": "OSINT-Scanner-Platform/1.0" },
        timeout: API_TIMEOUT,
      });
      const address = res.data?.address || {};
      const location = {
        address: res.data?.display_name || "Unknown",
        city: address.city || address.town || address.village || address.hamlet || "Unknown",
        country: address.country || "Unknown",
        zipCode: address.postcode || "",
        coordinates: { lat: input.latitude, lng: input.longitude },
        nearbyPlaces: [],
        source: "OpenStreetMap Nominatim",
      };
      return { success: true, data: location };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to reverse geocode" };
    }
  });

// Malware Analyzer
const malwareAnalyzerProcedure = protectedProcedure
  .input(z.object({ fileHash: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const vt = await analyzeWithVirusTotal(input.fileHash, process.env.VIRUSTOTAL_API_KEY);
      if (!vt.success) return vt;
      const stats = vt.lastAnalysisStats || {};
      const analysis = {
        hash: input.fileHash,
        detected: (stats.malicious || 0) > 0,
        detectionCount: stats.malicious || 0,
        suspiciousCount: stats.suspicious || 0,
        malwareType: vt.fileType || "Unknown",
        firstSeen: null,
        lastSeen: vt.timestamp,
        vendors: Object.entries(vt.lastAnalysisResults || {})
          .filter(([, result]: any) => ["malicious", "suspicious"].includes(result.category))
          .map(([vendor]) => vendor),
        source: "VirusTotal",
      };
      return { success: true, data: analysis };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to analyze malware" };
    }
  });

// Password Cracker (Educational - shows strength only)
const passwordCrackerProcedure = protectedProcedure
  .input(z.object({ password: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const checks = {
        hasUppercase: /[A-Z]/.test(input.password),
        hasLowercase: /[a-z]/.test(input.password),
        hasNumbers: /[0-9]/.test(input.password),
        hasSpecialChars: /[^A-Za-z0-9]/.test(input.password),
      };
      const score = Math.min(100, input.password.length * 4 + Object.values(checks).filter(Boolean).length * 15);
      const label = score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Weak";
      const strength = {
        password: "***",
        length: input.password.length,
        ...checks,
        score,
        strength: label,
        suggestions: [
          input.password.length < 14 ? "Use at least 14 characters" : null,
          !checks.hasUppercase ? "Add uppercase letters" : null,
          !checks.hasNumbers ? "Add numbers" : null,
          !checks.hasSpecialChars ? "Add special characters" : null,
        ].filter(Boolean),
      };
      return { success: true, data: strength };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to analyze password" };
    }
  });

// IoT Scanner — Shodan-backed search for internet-exposed IoT devices.
const iotScannerProcedure = protectedProcedure
  .input(z.object({ ipRange: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const query = input.ipRange.trim();
      const shodanKey = process.env.SHODAN_API_KEY;
      const devices: Array<{ ip: string; device: string; status: string; ports: number[]; os?: string; org?: string; country?: string; vulnerabilities?: string[] }> = [];

      if (!shodanKey) {
        return {
          success: false,
          error: 'Shodan API key not configured. Set SHODAN_API_KEY for real IoT device data.',
          needsKey: true,
        };
      }

      // Build Shodan query: if it looks like an IP/network use net:, otherwise preserve Shodan syntax and bias toward IoT.
      const isNetwork = /^\d{1,3}(\.\d{1,3}){1,3}(\/\d{1,2})?$/.test(query);
      const hasShodanFilter = /\b(port|product|org|country|city|vuln|hostname|net):/i.test(query);
      const shodanQuery = isNetwork ? `net:${query}` : hasShodanFilter ? query : `category:iot ${query}`;
      const res = await axios.get("https://api.shodan.io/shodan/host/search", {
        params: { key: shodanKey, query: shodanQuery, minify: false },
        timeout: API_TIMEOUT,
      });
      const matches = (res.data?.matches || []).slice(0, 20);
      for (const m of matches) {
        const ports: number[] = m.port ? [m.port] : [];
        if (Array.isArray(m.ports)) ports.push(...m.ports);
        devices.push({
          ip: m.ip_str || m.ip,
          device: m.product || m.devicetype || m._shodan?.module || m.tags?.[0] || 'IoT Device',
          status: 'Online',
          ports: Array.from(new Set(ports)),
          os: m.os || undefined,
          org: m.org || m.isp || undefined,
          country: m.location?.country_name || undefined,
          vulnerabilities: m.vulns ? Object.keys(m.vulns).slice(0, 5) : undefined,
        });
      }

      return {
        success: true,
        data: {
          ipRange: query,
          shodanQuery,
          devices,
          count: devices.length,
          shodanPowered: true,
          total: res.data?.total || devices.length,
          note: devices.length > 0 ? 'Results from Shodan API' : 'No Shodan matches for this query',
        },
      };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || 'Failed to scan IoT devices' };
    }
  });

// Flight Tracker
const flightTrackerProcedure = protectedProcedure
  .input(z.object({ flightNumber: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const apiKey = process.env.AVIATIONSTACK_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          error: "Flight tracking requires AVIATIONSTACK_API_KEY or another aviation-data provider.",
          needsKey: true,
        };
      }
      const res = await axios.get("http://api.aviationstack.com/v1/flights", {
        params: { access_key: apiKey, flight_iata: input.flightNumber },
        timeout: API_TIMEOUT,
      });
      const item = res.data?.data?.[0];
      if (!item) return { success: false, error: "No live flight data found" };
      const flight = {
        flightNumber: input.flightNumber,
        airline: item.airline?.name || "Unknown",
        departure: { airport: item.departure?.iata, time: item.departure?.scheduled, city: item.departure?.airport },
        arrival: { airport: item.arrival?.iata, time: item.arrival?.scheduled, city: item.arrival?.airport },
        status: item.flight_status || "Unknown",
        aircraft: item.aircraft?.registration || item.aircraft?.iata || "Unknown",
        altitude: item.live?.altitude || null,
        speed: item.live?.speed_horizontal || null,
        source: "Aviationstack",
      };
      return { success: true, data: flight };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to track flight" };
    }
  });

// Supply Chain Analyzer
const supplyChainAnalyzerProcedure = protectedProcedure
  .input(z.object({ productId: z.string().min(1) }))
  .mutation(async ({ input }) => {
    return {
      success: false,
      error: "Supply-chain analysis requires a real product or vendor intelligence provider. No mock data returned.",
      data: { productId: input.productId },
      needsProvider: true,
    };
  });

// Deepfake Detector
const deepfakeDetectorProcedure = protectedProcedure
  .input(z.object({ imageUrl: z.string().url() }))
  .mutation(async ({ input }) => {
    return {
      success: false,
      error: "Deepfake detection requires a configured media-forensics provider. No mock detection returned.",
      data: { imageUrl: input.imageUrl },
      needsProvider: true,
    };
  });

// Insider Threat
const insiderThreatProcedure = protectedProcedure
  .input(z.object({ userId: z.string().min(1) }))
  .mutation(async ({ input }) => {
    return {
      success: false,
      error: "Insider-threat scoring requires real audit/access logs. No mock risk score returned.",
      data: { userId: input.userId },
      needsDataSource: true,
    };
  });

// Real API Integration Procedures
const ipGeolocationProcedure = protectedProcedure
  .input(z.object({ ip: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address") }))
  .query(async ({ input }) => {
    try {
      const result = await getIPGeolocationMaxMind(input.ip, process.env.MAXMIND_API_KEY);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message || "IP geolocation lookup failed", code: error.code };
    }
  });

const certificateTransparencyProcedure = protectedProcedure
  .input(z.object({ domain: z.string().min(1) }))
  .query(async ({ input }) => {
    try {
      const result = await getCertificateTransparency(input.domain);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message || "Certificate transparency lookup failed", code: error.code };
    }
  });

const shodanPortScanProcedure = protectedProcedure
  .input(z.object({ ip: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address") }))
  .query(async ({ input }) => {
    try {
      const result = await getShodanPortData(input.ip, process.env.SHODAN_API_KEY);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message || "Shodan port scan failed", code: error.code };
    }
  });

const nvdVulnerabilitySearchProcedure = protectedProcedure
  .input(z.object({ keyword: z.string().min(1), limit: z.number().min(1).max(50).default(10) }))
  .query(async ({ input }) => {
    try {
      const result = await searchNVDVulnerabilities(input.keyword, input.limit);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message || "NVD vulnerability search failed", code: error.code };
    }
  });

const virusTotalAnalysisProcedure = protectedProcedure
  .input(z.object({ hash: z.string().min(32) }))
  .query(async ({ input }) => {
    try {
      const result = await analyzeWithVirusTotal(input.hash, process.env.VIRUSTOTAL_API_KEY);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message || "VirusTotal analysis failed", code: error.code };
    }
  });

const ipReputationProcedure = protectedProcedure
  .input(z.object({ ip: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address") }))
  .query(async ({ input }) => {
    try {
      const result = await checkIPReputation(input.ip, process.env.IPQUALITYSCORE_API_KEY);
      return result;
    } catch (error) {
      return { success: false, error: "IP reputation check failed" };
    }
  });

const whoisLookupProcedure = protectedProcedure
  .input(z.object({ domain: z.string().min(1) }))
  .query(async ({ input }) => {
    try {
      const result = await getWHOISData(input.domain);
      return result;
    } catch (error) {
      return { success: false, error: "WHOIS lookup failed" };
    }
  });

const dnsEnumerationProcedure = protectedProcedure
  .input(z.object({ domain: z.string().min(1) }))
  .query(async ({ input }) => {
    try {
      const result = await enumerateDNS(input.domain);
      return result;
    } catch (error) {
      return { success: false, error: "DNS enumeration failed" };
    }
  });

const githubSearchProcedure = protectedProcedure
  .input(z.object({ query: z.string().min(1), limit: z.number().min(1).max(100).default(10) }))
  .query(async ({ input }) => {
    try {
      const result = await searchGitHubRepos(input.query, input.limit);
      return result;
    } catch (error) {
      return { success: false, error: "GitHub search failed" };
    }
  });

const threatIntelligenceProcedure = protectedProcedure
  .query(async () => {
    try {
      const result = await getThreatIntelligence();
      return result;
    } catch (error) {
      return { success: false, error: "Threat intelligence retrieval failed" };
    }
  });

const apiConfigurationProcedure = publicProcedure
  .query(async () => {
    try {
      return { success: true, data: getAPIConfiguration() };
    } catch (error) {
      return { success: false, error: "Failed to retrieve API configuration" };
    }
  });

// Web Scraper — real HTTP fetch + parse
const webScraperProcedure = protectedProcedure
  .input(z.object({ url: z.string().url(), selector: z.string().optional() }))
  .mutation(async ({ input }) => {
    try {
      const target = new URL(input.url);
      if (!["http:", "https:"].includes(target.protocol)) {
        return { success: false, error: "Only HTTP and HTTPS URLs are supported" };
      }
      const addresses = await dns.lookup(target.hostname, { all: true }).catch(() => []);
      const privateAddress = addresses.find(({ address }) =>
        /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|::1$|fc|fd)/i.test(address)
      );
      if (privateAddress) {
        return { success: false, error: "Private and loopback network targets are blocked" };
      }

      const res = await axios.get(input.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OSINTScanner/2.0)',
          Accept: 'text/html,application/xhtml+xml',
        },
        maxRedirects: 5,
        responseType: "text",
        maxContentLength: 2 * 1024 * 1024,
      });

      const html: string = res.data;
      const selectedText = extractSelectorText(html, input.selector);

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? decodeHtml(titleMatch[1]) : 'N/A';

      // Extract meta description
      const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
      const metaDescription = metaDescMatch ? decodeHtml(metaDescMatch[1]) : 'N/A';

      // Count links
      const linkMatches = html.match(/<a\s[^>]*href=[^>]*>/gi) || [];
      const linksFound = linkMatches.length;

      // Count images
      const imgMatches = html.match(/<img\s[^>]*>/gi) || [];
      const imagesFound = imgMatches.length;

      // Extract all unique external links
      const hrefRe = /href=["']((https?:\/\/)[^"']+)["']/gi;
      let m;
      const externalLinks: string[] = [];
      while ((m = hrefRe.exec(html)) !== null) {
        if (!externalLinks.includes(m[1])) externalLinks.push(m[1]);
      }

      // Extract h1-h3 headings
      const headingRe = /<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi;
      const headings: string[] = [];
      while ((m = headingRe.exec(html)) !== null) {
        headings.push(decodeHtml(m[1]));
        if (headings.length >= 10) break;
      }

      // Detect technologies from HTML
      const lowerHtml = html.toLowerCase();
      const techs: string[] = [];
      if (lowerHtml.includes('react')) techs.push('React');
      if (lowerHtml.includes('vue')) techs.push('Vue.js');
      if (lowerHtml.includes('angular')) techs.push('Angular');
      if (lowerHtml.includes('jquery')) techs.push('jQuery');
      if (lowerHtml.includes('bootstrap')) techs.push('Bootstrap');
      if (lowerHtml.includes('wp-content') || lowerHtml.includes('wordpress')) techs.push('WordPress');
      if (lowerHtml.includes('shopify')) techs.push('Shopify');
      if (lowerHtml.includes('/_next/') || lowerHtml.includes('__next_data__')) techs.push('Next.js');
      if (lowerHtml.includes('tailwind')) techs.push('Tailwind CSS');

      // Word count (approximate)
      const textContent = stripTags(html);
      const wordCount = textContent.split(' ').filter(Boolean).length;

      return {
        success: true,
        data: {
          url: input.url,
          selector: input.selector || 'all',
          statusCode: res.status,
          title,
          metaDescription,
          linksFound,
          imagesFound,
          wordCount,
          headings,
          externalLinks: externalLinks.slice(0, 15),
          technologies: techs,
          selectedText,
          extractedData: [
            { type: 'Title', value: title },
            { type: 'Meta Description', value: metaDescription },
            { type: 'Links Found', value: String(linksFound) },
            { type: 'Images Found', value: String(imagesFound) },
            { type: 'Word Count', value: String(wordCount) },
            { type: 'Technologies', value: techs.join(', ') || 'None detected' },
            ...(input.selector ? [{ type: `Selector Matches (${input.selector})`, value: String(selectedText.length) }] : []),
          ],
          itemsFound: linksFound + imagesFound + headings.length + selectedText.length,
          dataTypes: ['Text', 'Links', 'Images', 'Metadata', 'Headings'],
          scrapedAt: new Date().toISOString(),
          contentLength: html.length,
        },
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return { success: false, error: `HTTP ${error.response?.status || 'Error'}: ${error.message}` };
      }
      return { success: false, error: error.message || 'Failed to scrape website' };
    }
  });

// Shodan device + SecurityTrails domain search
const shodanDeviceSearchProcedure = protectedProcedure
  .input(z.object({ query: z.string().min(1) }))
  .query(async ({ input }) => {
    try {
      const shodanKey = process.env.SHODAN_API_KEY;
      if (!shodanKey) {
        return {
          success: false,
          error: 'Shodan API key not configured. Set SHODAN_API_KEY in environment variables.',
          needsKey: true,
        };
      }
      const res = await axios.get(
        `https://api.shodan.io/shodan/host/search?key=${shodanKey}&query=${encodeURIComponent(input.query)}&minify=false`,
        { timeout: 12000 }
      );
      const data = res.data;
      return {
        success: true,
        total: data.total,
        matches: (data.matches || []).slice(0, 20).map((m: any) => ({
          ip: m.ip_str,
          port: m.port,
          product: m.product,
          version: m.version,
          os: m.os,
          org: m.org,
          isp: m.isp,
          country: m.location?.country_name,
          city: m.location?.city,
          tags: m.tags || [],
          vulns: m.vulns ? Object.keys(m.vulns) : [],
          timestamp: m.timestamp,
          hostnames: m.hostnames || [],
          domains: m.domains || [],
          transport: m.transport,
          data: (m.data || '').substring(0, 200),
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || 'Shodan search failed' };
    }
  });

const securityTrailsProcedure = protectedProcedure
  .input(z.object({ domain: z.string().min(1) }))
  .query(async ({ input }) => {
    try {
      const stKey = process.env.SECURITYTRAILS_API_KEY;
      if (!stKey) {
        // Fallback: use public DNS records via Google DNS
        const dnsRes = await axios.get(
          `https://dns.google/resolve?name=${encodeURIComponent(input.domain)}&type=ANY`,
          { timeout: 8000 }
        );
        const answers = dnsRes.data?.Answer || [];
        return {
          success: true,
          source: 'Google DNS (no SecurityTrails key)',
          domain: input.domain,
          dns: answers.map((a: any) => ({ type: a.type, name: a.name, data: a.data, ttl: a.TTL })),
          subdomains: [],
          whois: null,
        };
      }
      const [domainRes, subdomainRes] = await Promise.allSettled([
        axios.get(`https://api.securitytrails.com/v1/domain/${input.domain}`, {
          headers: { apikey: stKey }, timeout: 8000,
        }),
        axios.get(`https://api.securitytrails.com/v1/domain/${input.domain}/subdomains?children_only=false&include_inactive=false`, {
          headers: { apikey: stKey }, timeout: 8000,
        }),
      ]);
      const domainData = domainRes.status === 'fulfilled' ? domainRes.value.data : {};
      const subData = subdomainRes.status === 'fulfilled' ? subdomainRes.value.data : {};
      return {
        success: true,
        source: 'SecurityTrails',
        domain: input.domain,
        currentDns: domainData.current_dns || {},
        subdomains: (subData.subdomains || []).slice(0, 30),
        subdomain_count: subData.subdomain_count || 0,
        alexa_rank: domainData.alexa_rank,
      };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'SecurityTrails lookup failed' };
    }
  });

export const osintToolsRouter = router({
  darkWebMonitor: darkWebMonitorProcedure,
  vinDecoder: vinDecoderProcedure,
  cryptoTracker: cryptoTrackerProcedure,
  employeeEnum: employeeEnumProcedure,
  geoReverse: geoReverseProcedure,
  malwareAnalyzer: malwareAnalyzerProcedure,
  passwordCracker: passwordCrackerProcedure,
  iotScanner: iotScannerProcedure,
  flightTracker: flightTrackerProcedure,
  supplyChainAnalyzer: supplyChainAnalyzerProcedure,
  deepfakeDetector: deepfakeDetectorProcedure,
  insiderThreat: insiderThreatProcedure,
  // Real API Integrations
  ipGeolocation: ipGeolocationProcedure,
  certificateTransparency: certificateTransparencyProcedure,
  shodanPortScan: shodanPortScanProcedure,
  nvdVulnerabilitySearch: nvdVulnerabilitySearchProcedure,
  virusTotalAnalysis: virusTotalAnalysisProcedure,
  ipReputation: ipReputationProcedure,
  whoisLookup: whoisLookupProcedure,
  dnsEnumeration: dnsEnumerationProcedure,
  githubSearch: githubSearchProcedure,
  threatIntelligence: threatIntelligenceProcedure,
  apiConfiguration: apiConfigurationProcedure,
  webScraper: webScraperProcedure,
  shodanDeviceSearch: shodanDeviceSearchProcedure,
  securityTrails: securityTrailsProcedure,
});
