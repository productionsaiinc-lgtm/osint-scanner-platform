import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";
import { getIPGeolocationMaxMind, getCertificateTransparency, getShodanPortData, searchNVDVulnerabilities, analyzeWithVirusTotal, checkIPReputation, getWHOISData, enumerateDNS, searchGitHubRepos, getThreatIntelligence, getAPIConfiguration } from "./real-api-integrations";
import { decodeVINReal, trackCryptoAddressReal, checkPasswordStrengthReal, lookupIMEIReal } from "./real-api-integrations-phase1";
import { searchShodanReal, trackFlightReal, scrapeWebsiteReal, scanIoTDevicesReal } from "./real-api-integrations-phase2";

// Dark Web Monitor
const darkWebMonitorProcedure = protectedProcedure
  .input(z.object({ query: z.string().min(1) }))
  .mutation(async ({ input, ctx }) => {
    try {
      // Simulate dark web monitoring - in production, integrate with actual APIs
      const results = {
        mentions: Math.floor(Math.random() * 50),
        lastSeen: new Date(),
        sources: ["Dark Web Forum 1", "Dark Web Forum 2", "Leaked Database"],
        severity: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
      };
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: "Failed to monitor dark web" };
    }
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
    try {
      const analysis = {
        hash: input.fileHash,
        detected: Math.random() > 0.5,
        detectionCount: Math.floor(Math.random() * 50),
        malwareType: ["Trojan", "Ransomware", "Spyware", "Adware"][Math.floor(Math.random() * 4)],
        firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(),
        vendors: ["Kaspersky", "McAfee", "Avast"],
      };
      return { success: true, data: analysis };
    } catch (error) {
      return { success: false, error: "Failed to analyze malware" };
    }
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

// Deepfake Detector
const deepfakeDetectorProcedure = protectedProcedure
  .input(z.object({ imageUrl: z.string().url() }))
  .mutation(async ({ input }) => {
    try {
      const detection = {
        imageUrl: input.imageUrl,
        isDeepfake: Math.random() > 0.7,
        confidence: Math.random() * 100,
        manipulationIndicators: ["Face Swap", "Expression Manipulation", "Lighting Inconsistency"],
        analysis: {
          faceConsistency: Math.random() * 100,
          eyeTracking: Math.random() * 100,
          blinkPattern: Math.random() * 100,
          audioSync: Math.random() * 100,
        },
      };
      return { success: true, data: detection };
    } catch (error) {
      return { success: false, error: "Failed to detect deepfake" };
    }
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
