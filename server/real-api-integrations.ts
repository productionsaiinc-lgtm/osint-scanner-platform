/**
 * Real API Integrations for OSINT Tools
 * Integrates with multiple real APIs for actual data retrieval
 */

import axios from "axios";

// ============================================================================
// 1. MAXMIND GEOIP2 - IP Geolocation with Enhanced Data
// ============================================================================

export async function getIPGeolocationMaxMind(ip: string, apiKey?: string) {
  try {
    // Using ip-api.com as free alternative (no key required)
    // For MaxMind integration, users can provide their own API key
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      params: {
        fields: "status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting",
      },
    });

    if (response.data.status === "success") {
      return {
        success: true,
        ip: ip,
        country: response.data.country,
        countryCode: response.data.countryCode,
        region: response.data.regionName,
        city: response.data.city,
        latitude: response.data.lat,
        longitude: response.data.lon,
        timezone: response.data.timezone,
        isp: response.data.isp,
        organization: response.data.org,
        asn: response.data.as,
        isMobile: response.data.mobile,
        isProxy: response.data.proxy,
        isHosting: response.data.hosting,
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, error: "IP lookup failed" };
  } catch (error: any) {
    console.error("MaxMind IP geolocation error:", error.message);
    const errorMessage = error.response?.data?.message || error.message || "Failed to lookup IP geolocation";
    return { 
      success: false, 
      error: errorMessage,
      code: error.response?.status || 500,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// 2. CRT.SH - Certificate Transparency Logs
// ============================================================================

export async function getCertificateTransparency(domain: string) {
  try {
    // crt.sh is a free public API for certificate transparency logs
    const response = await axios.get(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`);

    if (Array.isArray(response.data)) {
      const certificates = response.data.map((cert: any) => ({
        id: cert.id,
        logID: cert.log_id,
        issuerName: cert.issuer_name,
        commonName: cert.common_name,
        nameValue: cert.name_value,
        notBefore: cert.not_before,
        notAfter: cert.not_after,
        entryTimestamp: cert.entry_timestamp,
      }));

      return {
        success: true,
        domain,
        certificateCount: certificates.length,
        certificates: certificates.slice(0, 50), // Return latest 50
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, error: "No certificates found" };
  } catch (error: any) {
    console.error("Certificate transparency error:", error.message);
    const errorMessage = error.response?.data?.message || error.message || "Failed to retrieve certificate data";
    return { 
      success: false, 
      error: errorMessage,
      code: error.response?.status || 500,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// 3. SHODAN - Port Scanner and Network Reconnaissance
// ============================================================================

export async function getShodanPortData(ip: string, apiKey?: string) {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: "Shodan API key required. Add SHODAN_API_KEY to environment variables.",
        info: "Get free API key at https://www.shodan.io",
      };
    }

    const response = await axios.get(`https://api.shodan.io/shodan/host/${ip}`, {
      params: { key: apiKey },
    });

    return {
      success: true,
      ip: response.data.ip_str,
      ports: response.data.ports,
      hostnames: response.data.hostnames,
      organization: response.data.org,
      isp: response.data.isp,
      lastUpdate: response.data.last_update,
      services: response.data.data?.map((d: any) => ({
        port: d.port,
        protocol: d._shodan?.module,
        banner: d.data?.substring(0, 200), // First 200 chars
      })) || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Shodan error:", error.message);
    if (error.response?.status === 401) {
      return { success: false, error: "Invalid Shodan API key", code: 401 };
    }
    const errorMessage = error.response?.data?.error || error.message || "Failed to retrieve Shodan data";
    return { 
      success: false, 
      error: errorMessage,
      code: error.response?.status || 500,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// 4. NVD/CVE - National Vulnerability Database
// ============================================================================

export async function searchNVDVulnerabilities(keyword: string, limit: number = 10) {
  try {
    // NVD API v2 (free, no key required)
    const response = await axios.get(`https://services.nvd.nist.gov/rest/json/cves/2.0`, {
      params: {
        keywordSearch: keyword,
        resultsPerPage: limit,
      },
      timeout: 10000,
    });

    if (response.data.vulnerabilities) {
      const vulnerabilities = response.data.vulnerabilities.map((vuln: any) => {
        const cve = vuln.cve;
        return {
          cveId: cve.id,
          description: cve.descriptions?.[0]?.value || "No description",
          published: cve.published,
          lastModified: cve.lastModified,
          cvssScores: cve.metrics?.cvssMetricV31 || [],
          references: cve.references?.map((r: any) => r.url) || [],
          cweIds: cve.weaknesses?.map((w: any) => w.description?.[0]?.value) || [],
        };
      });

      return {
        success: true,
        keyword,
        vulnerabilityCount: response.data.totalResults,
        vulnerabilities: vulnerabilities.slice(0, limit),
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, error: "No vulnerabilities found" };
  } catch (error: any) {
    console.error("NVD search error:", error.message);
    const errorMessage = error.response?.data?.message || error.message || "Failed to search NVD database";
    return { 
      success: false, 
      error: errorMessage,
      code: error.response?.status || 500,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// 5. VIRUSTOTAL - Malware and File Analysis
// ============================================================================

export async function analyzeWithVirusTotal(hash: string, apiKey?: string) {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: "VirusTotal API key required. Add VIRUSTOTAL_API_KEY to environment variables.",
        info: "Get free API key at https://www.virustotal.com/gui/home/upload",
      };
    }

    const response = await axios.get(`https://www.virustotal.com/api/v3/files/${hash}`, {
      headers: { "x-apikey": apiKey },
    });

    const data = response.data.data;
    return {
      success: true,
      hash,
      fileName: data.attributes?.names?.[0] || "Unknown",
      fileSize: data.attributes?.size,
      fileType: data.attributes?.type_description,
      lastAnalysisStats: data.attributes?.last_analysis_stats,
      lastAnalysisResults: data.attributes?.last_analysis_results,
      magicNumber: data.attributes?.magic,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("VirusTotal error:", error.message);
    if (error.response?.status === 401) {
      return { success: false, error: "Invalid VirusTotal API key", code: 401 };
    }
    const errorMessage = error.response?.data?.error?.message || error.message || "Failed to analyze file with VirusTotal";
    return { 
      success: false, 
      error: errorMessage,
      code: error.response?.status || 500,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// 6. IPQUALITYSCORE - IP Reputation and Threat Detection
// ============================================================================

export async function checkIPReputation(ip: string, apiKey?: string) {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: "IPQualityScore API key required. Add IPQUALITYSCORE_API_KEY to environment variables.",
        info: "Get free API key at https://www.ipqualityscore.com",
      };
    }

    const response = await axios.get(`https://ipqualityscore.com/api/json/ip/${ip}`, {
      params: {
        key: apiKey,
        strictness: 1,
      },
    });

    return {
      success: true,
      ip,
      fraudScore: response.data.fraud_score,
      isVPN: response.data.is_vpn,
      isProxy: response.data.is_proxy,
      isTor: response.data.is_tor,
      isBot: response.data.is_bot,
      country: response.data.country_code,
      city: response.data.city,
      isp: response.data.isp,
      threatTypes: response.data.threat_types || [],
      recentAbuse: response.data.recent_abuse,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("IPQualityScore error:", error.message);
    return { success: false, error: "Failed to check IP reputation" };
  }
}

// ============================================================================
// 7. WHOIS LOOKUP - Domain and IP WHOIS Information
// ============================================================================

export async function getWHOISData(domain: string) {
  try {
    // Using whois.com API (free tier available)
    const response = await axios.get(`https://www.whois.com/whois/${domain}`, {
      timeout: 10000,
    });

    // Parse WHOIS data (simplified)
    return {
      success: true,
      domain,
      rawWhois: response.data.substring(0, 1000), // First 1000 chars
      timestamp: new Date().toISOString(),
      note: "For full WHOIS parsing, consider using whoisjs or similar library",
    };
  } catch (error) {
    console.error("WHOIS lookup error:", error);
    return { success: false, error: "Failed to retrieve WHOIS data" };
  }
}

// ============================================================================
// 8. DNS ENUMERATION - Using public DNS APIs
// ============================================================================

export async function enumerateDNS(domain: string) {
  try {
    // Using Google DNS API (free, no key required)
    const response = await axios.get(`https://dns.google/resolve`, {
      params: {
        name: domain,
        type: "ANY",
      },
    });

    const records = response.data.Answer || [];
    return {
      success: true,
      domain,
      records: records.map((r: any) => ({
        name: r.name,
        type: r.type,
        ttl: r.TTL,
        data: r.data,
      })),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("DNS enumeration error:", error);
    return { success: false, error: "Failed to enumerate DNS records" };
  }
}

// ============================================================================
// 9. GITHUB SEARCH - Repository and User Search
// ============================================================================

export async function searchGitHubRepos(query: string, limit: number = 10) {
  try {
    const response = await axios.get(`https://api.github.com/search/repositories`, {
      params: {
        q: query,
        sort: "stars",
        order: "desc",
        per_page: limit,
      },
    });

    return {
      success: true,
      query,
      totalResults: response.data.total_count,
      repositories: response.data.items.map((repo: any) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        lastUpdate: repo.updated_at,
      })),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("GitHub search error:", error);
    return { success: false, error: "Failed to search GitHub" };
  }
}

// ============================================================================
// 10. THREAT INTELLIGENCE - Multiple Sources
// ============================================================================

export async function getThreatIntelligence() {
  try {
    // Combine multiple free threat feeds
    const nvdResponse = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=5`,
      { timeout: 5000 }
    );

    const threats = nvdResponse.data.vulnerabilities?.map((v: any) => ({
      id: v.cve.id,
      description: v.cve.descriptions?.[0]?.value,
      published: v.cve.published,
      severity: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || "UNKNOWN",
    })) || [];

    return {
      success: true,
      threatCount: threats.length,
      threats,
      sources: ["NVD", "NIST"],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Threat intelligence error:", error);
    return { success: false, error: "Failed to retrieve threat intelligence" };
  }
}

// ============================================================================
// API Configuration Helper
// ============================================================================

export function getAPIConfiguration() {
  return {
    maxmind: {
      name: "MaxMind GeoIP2",
      status: process.env.MAXMIND_API_KEY ? "configured" : "not configured",
      docs: "https://www.maxmind.com/en/geoip2-databases",
    },
    crtsh: {
      name: "crt.sh (Certificate Transparency)",
      status: "free - no key required",
      docs: "https://crt.sh",
    },
    shodan: {
      name: "Shodan",
      status: process.env.SHODAN_API_KEY ? "configured" : "not configured",
      docs: "https://www.shodan.io",
    },
    nvd: {
      name: "NVD/CVE",
      status: "free - no key required",
      docs: "https://nvd.nist.gov/developers/vulnerabilities",
    },
    virustotal: {
      name: "VirusTotal",
      status: process.env.VIRUSTOTAL_API_KEY ? "configured" : "not configured",
      docs: "https://www.virustotal.com/gui/home/upload",
    },
    ipqualityscore: {
      name: "IPQualityScore",
      status: process.env.IPQUALITYSCORE_API_KEY ? "configured" : "not configured",
      docs: "https://www.ipqualityscore.com",
    },
  };
}
