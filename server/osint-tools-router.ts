import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";
import { getIPGeolocationMaxMind, getCertificateTransparency, getShodanPortData, searchNVDVulnerabilities, analyzeWithVirusTotal, checkIPReputation, getWHOISData, enumerateDNS, searchGitHubRepos, getThreatIntelligence, getAPIConfiguration } from "./real-api-integrations";
import { decodeVINReal, trackCryptoAddressReal, checkPasswordStrengthReal, lookupIMEIReal } from "./real-api-integrations-phase1";
import { searchShodanReal, trackFlightReal, scrapeWebsiteReal, scanIoTDevicesReal } from "./real-api-integrations-phase2";
import { monitorDarkWebReal, detectDeepfakeReal, getMDMDeviceStatusReal, applyMDMSecurityPolicyReal, analyzeFileWithVirusTotalReal, scanURLWithVirusTotalReal } from "./real-api-integrations-phase3";

// Dark Web Monitor - Real Have I Been Pwned + Breach Database API
const darkWebMonitorProcedure = protectedProcedure
  .input(z.object({ query: z.string().min(1) }))
  .mutation(async ({ input, ctx }) => {
    return await monitorDarkWebReal(input.query);
  });

// VIN Decoder - Real NHTSA API
const vinDecoderProcedure = protectedProcedure
  .input(z.object({ vin: z.string().min(17).max(17) }))
  .mutation(async ({ input }) => {
    return await decodeVINReal(input.vin);
  });

// Crypto Tracker - Real Etherscan API
const cryptoTrackerProcedure = protectedProcedure
  .input(z.object({ address: z.string().min(1), chain: z.enum(["ethereum", "bitcoin"]).optional().default("ethereum") }))
  .mutation(async ({ input }) => {
    return await trackCryptoAddressReal(input.address, input.chain);
  });

// Employee Enum — real GitHub + Hunter.io integration
const employeeEnumProcedure = protectedProcedure
  .input(z.object({ company: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const company = input.company.trim();
      const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      const employees: Array<{ name: string; title: string; email: string; linkedin: string; source: string }> = [];
      const errors: string[] = [];

      // 1. GitHub search — find org members / contributors
      try {
        const ghHeaders: Record<string, string> = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
        const ghToken = process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY;
        if (ghToken) ghHeaders.Authorization = `Bearer ${ghToken}`;

        // Search for users affiliated with company
        const ghRes = await axios.get(
          `https://api.github.com/search/users?q=${encodeURIComponent(company)}+type:user&per_page=10`,
          { headers: ghHeaders, timeout: 8000 }
        );
        const ghUsers = (ghRes.data?.items || []).slice(0, 8);
        for (const user of ghUsers) {
          try {
            const profileRes = await axios.get(`https://api.github.com/users/${user.login}`, { headers: ghHeaders, timeout: 5000 });
            const p = profileRes.data;
            if (p.company && p.company.toLowerCase().includes(company.toLowerCase().split(' ')[0])) {
              employees.push({
                name: p.name || p.login,
                title: p.bio?.substring(0, 60) || 'GitHub User',
                email: p.email || `${p.login}@${domain}`,
                linkedin: `linkedin.com/search/results/people/?keywords=${encodeURIComponent(p.name || p.login)}`,
                source: 'GitHub',
              });
            }
          } catch { /* skip individual profile errors */ }
        }
      } catch (e: any) {
        errors.push(`GitHub: ${e.message}`);
      }

      // 2. Hunter.io domain search (free tier: 25 reqs/month)
      const hunterKey = process.env.HUNTER_API_KEY;
      if (hunterKey) {
        try {
          const hunterRes = await axios.get(
            `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${hunterKey}&limit=10`,
            { timeout: 8000 }
          );
          const hunterEmails: any[] = hunterRes.data?.data?.emails || [];
          for (const e of hunterEmails) {
            employees.push({
              name: [e.first_name, e.last_name].filter(Boolean).join(' ') || e.value.split('@')[0],
              title: e.position || e.type || 'Employee',
              email: e.value,
              linkedin: e.linkedin || `linkedin.com/search/results/people/?keywords=${encodeURIComponent([e.first_name, e.last_name].filter(Boolean).join(' '))}`,
              source: 'Hunter.io',
            });
          }
        } catch (e: any) {
          errors.push(`Hunter.io: ${e.message}`);
        }
      }

      // 3. Fallback: enrich with realistic generated data if no real data found
      if (employees.length === 0) {
        const titles = ['CEO', 'CTO', 'VP Engineering', 'Senior Developer', 'Security Engineer', 'Product Manager', 'DevOps Lead'];
        const firstNames = ['James', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
        for (let i = 0; i < 5; i++) {
          const first = firstNames[i]; const last = lastNames[i];
          employees.push({
            name: `${first} ${last}`,
            title: titles[i],
            email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
            linkedin: `linkedin.com/in/${first.toLowerCase()}${last.toLowerCase()}`,
            source: 'Generated (enable GITHUB_TOKEN / HUNTER_API_KEY for real data)',
          });
        }
      }

      // Deduplicate by email
      const seen = new Set<string>();
      const unique = employees.filter(e => { if (seen.has(e.email)) return false; seen.add(e.email); return true; });

      return {
        success: true,
        data: {
          company,
          domain,
          employees: unique,
          count: unique.length,
          emailPatterns: [`first.last@${domain}`, `flast@${domain}`, `first@${domain}`],
          socialMediaPresence: {
            twitter: unique.filter(e => e.source === 'GitHub').length * 3,
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
      const location = {
        address: "123 Main Street, City, Country",
        city: "City",
        country: "Country",
        zipCode: "12345",
        coordinates: { lat: input.latitude, lng: input.longitude },
        nearbyPlaces: ["Park", "School", "Hospital"],
      };
      return { success: true, data: location };
    } catch (error) {
      return { success: false, error: "Failed to reverse geocode" };
    }
  });

// Malware Analyzer
const malwareAnalyzerProcedure = protectedProcedure
  .input(z.object({ fileHash: z.string().min(1) }))
  .mutation(async ({ input }) => {
    return await analyzeFileWithVirusTotalReal(input.fileHash);
  });

// Password Strength Checker - Real zxcvbn + Have I Been Pwned API
const passwordCrackerProcedure = protectedProcedure
  .input(z.object({ password: z.string().min(1) }))
  .mutation(async ({ input }) => {
    return await checkPasswordStrengthReal(input.password);
  });

// IoT Scanner - Real Shodan API
const iotScannerProcedure = protectedProcedure
  .input(z.object({ ipRange: z.string().min(1), limit: z.number().optional().default(10) }))
  .mutation(async ({ input }) => {
    return await scanIoTDevicesReal(input.ipRange, input.limit);
  });

// Flight Tracker - Real OpenSky Network API
const flightTrackerProcedure = protectedProcedure
  .input(z.object({ flightNumber: z.string().min(1) }))
  .mutation(async ({ input }) => {
    return await trackFlightReal(input.flightNumber);
  });

function classifyOntarioPlate(plate: string) {
  if (/^[A-Z]{4}[0-9]{3}$/.test(plate)) {
    return {
      plateType: "Ontario passenger",
      confidence: "high",
      formatNotes: "Current common Ontario passenger plate pattern.",
    };
  }

  if (/^[0-9]{3}[A-Z]{3}$/.test(plate)) {
    return {
      plateType: "Ontario legacy passenger",
      confidence: "medium",
      formatNotes: "Older Ontario passenger plate pattern.",
    };
  }

  if (/^[A-Z0-9]{2,8}$/.test(plate)) {
    return {
      plateType: "Ontario personalized or specialty",
      confidence: "medium",
      formatNotes: "Valid Ontario plate length and character set; exact class requires an authorized provider.",
    };
  }

  return {
    plateType: "Unknown",
    confidence: "low",
    formatNotes: "Plate does not match supported Ontario format rules.",
  };
}

function firstDefined(...values: any[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function maskVin(vin?: string) {
  if (!vin || vin.length < 8) return vin || null;
  return `${vin.slice(0, 3)}${"*".repeat(Math.max(vin.length - 7, 4))}${vin.slice(-4)}`;
}

async function decodeVinPublic(vin?: string) {
  if (!vin || !/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return null;

  try {
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`,
      { timeout: 12000 }
    );
    const decoded = response.data?.Results?.[0];
    if (!decoded) return null;

    return {
      make: firstDefined(decoded.Make, decoded.Manufacturer),
      model: decoded.Model || undefined,
      year: decoded.ModelYear || undefined,
      vehicleType: decoded.VehicleType || undefined,
      bodyClass: decoded.BodyClass || undefined,
      fuelType: firstDefined(decoded.FuelTypePrimary, decoded.FuelTypeSecondary),
      source: "NHTSA vPIC VIN Decoder",
    };
  } catch {
    return null;
  }
}

async function lookupPlateWithProvider(plate: string, region: string) {
  const providerUrl = process.env.LICENSE_PLATE_LOOKUP_API_URL;
  if (!providerUrl) return null;

  const apiKey = process.env.LICENSE_PLATE_LOOKUP_API_KEY;
  const apiKeyHeader = process.env.LICENSE_PLATE_LOOKUP_API_KEY_HEADER || "Authorization";
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers[apiKeyHeader] = apiKeyHeader.toLowerCase() === "authorization" ? `Bearer ${apiKey}` : apiKey;
    headers["x-api-key"] = apiKey;
  }

  const response = await axios.post(
    providerUrl,
    { plate, region, country: "CA" },
    { headers, timeout: 12000, validateStatus: (status) => status >= 200 && status < 500 }
  );

  if (response.status >= 400) {
    return {
      success: false,
      error: response.data?.error || response.data?.message || `Provider returned HTTP ${response.status}`,
      source: "Configured license plate provider",
    };
  }

  const payload = response.data?.data || response.data || {};
  const vehicle = payload.vehicle || payload.result || payload;
  const vin = firstDefined(vehicle.vin, vehicle.VIN, payload.vin);
  const vinDecoded = await decodeVinPublic(vin);

  return {
    success: true,
    data: {
      make: firstDefined(vehicle.make, vehicle.Make, vinDecoded?.make),
      model: firstDefined(vehicle.model, vehicle.Model, vinDecoded?.model),
      year: firstDefined(vehicle.year, vehicle.modelYear, vehicle.ModelYear, vinDecoded?.year),
      color: firstDefined(vehicle.color, vehicle.colour),
      vehicleType: firstDefined(vehicle.vehicleType, vehicle.type, vinDecoded?.vehicleType),
      bodyClass: firstDefined(vehicle.bodyClass, vinDecoded?.bodyClass),
      fuelType: firstDefined(vehicle.fuelType, vinDecoded?.fuelType),
      registrationStatus: firstDefined(vehicle.registrationStatus, vehicle.status),
      registrationExpiry: firstDefined(vehicle.registrationExpiry, vehicle.expiryDate),
      insuranceStatus: firstDefined(vehicle.insuranceStatus, vehicle.insurance),
      safetyStatus: firstDefined(vehicle.safetyStatus, vehicle.safety),
      emissionsStatus: firstDefined(vehicle.emissionsStatus, vehicle.emissions),
      vin: maskVin(vin),
      source: firstDefined(payload.source, response.data?.source, "Configured license plate provider"),
      vinSource: vinDecoded?.source,
      providerReference: firstDefined(payload.reference, payload.id, vehicle.reference),
    },
  };
}

const licensePlateLookupProcedure = protectedProcedure
  .input(z.object({ plate: z.string().min(2), region: z.string().default("Ontario") }))
  .mutation(async ({ input }) => {
    const cleaned = input.plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^[A-Z0-9]{2,8}$/.test(cleaned)) {
      return { success: false, error: "Invalid license plate format." };
    }

    const classification = classifyOntarioPlate(cleaned);

    try {
      const providerResult = await lookupPlateWithProvider(cleaned, input.region);
      if (providerResult?.success === false) {
        return providerResult;
      }

      if (providerResult?.success) {
        return {
          success: true,
          data: {
            licensePlate: cleaned,
            province: input.region,
            plateType: classification.plateType,
            formatConfidence: classification.confidence,
            formatNotes: classification.formatNotes,
            lookedUpAt: new Date().toISOString(),
            providerConfigured: true,
            dataScope: "Vehicle data only. Owner personal information is not returned.",
            ...providerResult.data,
          },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Configured license plate provider lookup failed.",
        providerConfigured: true,
      };
    }

    return {
      success: true,
      needsProvider: true,
      data: {
        licensePlate: cleaned,
        province: input.region,
        plateType: classification.plateType,
        formatConfidence: classification.confidence,
        formatNotes: classification.formatNotes,
        lookedUpAt: new Date().toISOString(),
        providerConfigured: false,
        realDataAvailable: false,
        dataScope: "Validated plate format only. Vehicle registration data requires an authorized provider.",
        source: "Local Ontario plate format validation",
      },
    };
  });

// Supply Chain Analyzer
const supplyChainAnalyzerProcedure = protectedProcedure
  .input(z.object({ productId: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const chain = {
        productId: input.productId,
        manufacturer: "Manufacturer Name",
        suppliers: ["Supplier 1", "Supplier 2", "Supplier 3"],
        distributors: ["Distributor A", "Distributor B"],
        retailers: ["Retailer X", "Retailer Y"],
        riskFactors: ["Geopolitical", "Environmental", "Financial"],
        transparency: Math.floor(Math.random() * 100),
      };
      return { success: true, data: chain };
    } catch (error) {
      return { success: false, error: "Failed to analyze supply chain" };
    }
  });

// Deepfake Detector - Real AWS Rekognition API
const deepfakeDetectorProcedure = protectedProcedure
  .input(z.object({ imageUrl: z.string().url(), videoUrl: z.string().url().optional() }))
  .mutation(async ({ input }) => {
    return await detectDeepfakeReal(input.imageUrl, input.videoUrl);
  });

// Insider Threat
const insiderThreatProcedure = protectedProcedure
  .input(z.object({ userId: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const threat = {
        userId: input.userId,
        riskScore: Math.floor(Math.random() * 100),
        riskLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        indicators: [
          { type: "Unusual Access Patterns", severity: "High" },
          { type: "Large File Downloads", severity: "Medium" },
          { type: "After Hours Activity", severity: "Low" },
        ],
        lastFlaggedDate: new Date(),
        recommendations: ["Monitor closely", "Review access logs", "Conduct interview"],
      };
      return { success: true, data: threat };
    } catch (error) {
      return { success: false, error: "Failed to analyze insider threat" };
    }
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

// Web Scraper - Real Puppeteer + Cheerio API
const webScraperProcedure = protectedProcedure
  .input(z.object({ url: z.string().url(), selector: z.string().optional(), headless: z.boolean().optional().default(true), timeout: z.number().optional().default(15000) }))
  .mutation(async ({ input }) => {
    return await scrapeWebsiteReal(input.url, { headless: input.headless, timeout: input.timeout });
  });

// Shodan device search - Real Shodan API
const shodanDeviceSearchProcedure = protectedProcedure
  .input(z.object({ query: z.string().min(1), page: z.number().optional().default(1) }))
  .query(async ({ input }) => {
    return await searchShodanReal(input.query, input.page);
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
  licensePlateLookup: licensePlateLookupProcedure,
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
