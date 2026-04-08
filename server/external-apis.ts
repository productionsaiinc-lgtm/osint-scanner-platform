/**
 * External API integrations for real OSINT data
 * These functions call real APIs instead of simulated data
 */

import axios from "axios";

const API_TIMEOUT = 10000;

// HaveIBeenPwned API
export async function checkHaveIBeenPwned(email: string) {
  try {
    const response = await axios.get(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
      {
        headers: {
          "User-Agent": "OSINT-Scanner-Platform",
        },
        timeout: API_TIMEOUT,
      }
    );
    return {
      success: true,
      email,
      breaches: response.data || [],
      breached: true,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        success: true,
        email,
        breaches: [],
        breached: false,
      };
    }
    return {
      success: false,
      error: "Failed to check HaveIBeenPwned",
    };
  }
}

// GitHub API - Search repositories
export async function searchGitHubAPI(query: string, token?: string) {
  try {
    const headers: any = {
      "User-Agent": "OSINT-Scanner-Platform",
    };
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const response = await axios.get("https://api.github.com/search/repositories", {
      params: {
        q: query,
        sort: "stars",
        order: "desc",
        per_page: 30,
      },
      headers,
      timeout: API_TIMEOUT,
    });

    return {
      success: true,
      query,
      results: response.data.items.map((repo: any) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        owner: repo.owner.login,
      })),
      totalCount: response.data.total_count,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to search GitHub",
    };
  }
}

// Wayback Machine API
export async function searchWaybackAPI(domain: string) {
  try {
    const response = await axios.get(
      `https://archive.org/wayback/available?url=${encodeURIComponent(domain)}&output=json`,
      {
        timeout: API_TIMEOUT,
      }
    );

    const snapshots = response.data.archived_snapshots?.closest || [];
    return {
      success: true,
      domain,
      snapshots: snapshots,
      totalSnapshots: Object.keys(response.data.archived_snapshots || {}).length,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to search Wayback Machine",
    };
  }
}

// NVD CVE API
export async function searchNVDCVE(keyword: string) {
  try {
    const response = await axios.get("https://services.nvd.nist.gov/rest/json/cves/1.0", {
      params: {
        keyword: keyword,
        resultsPerPage: 20,
      },
      timeout: API_TIMEOUT,
    });

    return {
      success: true,
      keyword,
      results: (response.data.result?.CVE_Items || []).map((item: any) => ({
        id: item.cve.CVE_data_meta.ID,
        description: item.cve.description.description_data[0]?.value,
        publishedDate: item.publishedDate,
        severity: item.impact?.baseMetricV3?.cvssV3?.baseSeverity,
      })),
      totalResults: response.data.totalResults,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to search NVD CVE database",
    };
  }
}

// IPQualityScore API for IP reputation
export async function checkIPReputation(ip: string, apiKey?: string) {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: "API key required for IP reputation check",
      };
    }

    const response = await axios.get("https://ipqualityscore.com/api/json/ip", {
      params: {
        ip: ip,
        key: apiKey,
      },
      timeout: API_TIMEOUT,
    });

    return {
      success: true,
      ip,
      fraudScore: response.data.fraud_score,
      isVPN: response.data.is_vpn,
      isTor: response.data.is_tor,
      isBot: response.data.is_bot,
      country: response.data.country_code,
      isp: response.data.isp,
      threatLevel: response.data.threat_level,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to check IP reputation",
    };
  }
}

// WHOIS API
export async function whoisLookupAPI(domain: string, apiKey?: string) {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: "API key required for WHOIS lookup",
      };
    }

    const response = await axios.get("https://www.whoisxmlapi.com/api/v1", {
      params: {
        domainName: domain,
        apiKey: apiKey,
        outputFormat: "JSON",
      },
      timeout: API_TIMEOUT,
    });

    const whoisData = response.data.WhoisRecord;
    return {
      success: true,
      domain,
      registrar: whoisData.registrarName,
      registrationDate: whoisData.createdDate,
      expirationDate: whoisData.expiresDate,
      updatedDate: whoisData.updatedDate,
      registrant: whoisData.registrant,
      nameservers: whoisData.nameServers,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to perform WHOIS lookup",
    };
  }
}

// DNS Lookup using public DNS API
export async function dnsLookupAPI(domain: string) {
  try {
    const response = await axios.get(`https://dns.google/resolve`, {
      params: {
        name: domain,
      },
      timeout: API_TIMEOUT,
    });

    const records: any = {};
    if (response.data.Answer) {
      for (const answer of response.data.Answer) {
        const type = answer.type === 1 ? "A" : answer.type === 28 ? "AAAA" : answer.type === 5 ? "CNAME" : answer.type === 15 ? "MX" : "OTHER";
        if (!records[type]) records[type] = [];
        records[type].push(answer.data);
      }
    }

    return {
      success: true,
      domain,
      records,
      responseCode: response.data.Status,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to perform DNS lookup",
    };
  }
}

// VirusTotal API for file/URL scanning
export async function virustotalCheck(indicator: string, apiKey?: string) {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: "API key required for VirusTotal check",
      };
    }

    const response = await axios.get("https://www.virustotal.com/api/v3/urls", {
      params: {
        filter: `url:${indicator}`,
      },
      headers: {
        "x-apikey": apiKey,
      },
      timeout: API_TIMEOUT,
    });

    return {
      success: true,
      indicator,
      detections: response.data.data?.length || 0,
      lastAnalysisStats: response.data.data?.[0]?.attributes?.last_analysis_stats,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to check VirusTotal",
    };
  }
}

// Shodan API for device search
export async function shodanSearch(query: string, apiKey?: string) {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: "API key required for Shodan search",
      };
    }

    const response = await axios.get("https://api.shodan.io/shodan/host/search", {
      params: {
        query: query,
        key: apiKey,
      },
      timeout: API_TIMEOUT,
    });

    return {
      success: true,
      query,
      results: response.data.matches?.map((match: any) => ({
        ip: match.ip_str,
        port: match.port,
        org: match.org,
        os: match.os,
        hostnames: match.hostnames,
        data: match.data,
      })),
      totalResults: response.data.total,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to search Shodan",
    };
  }
}

// SecurityTrails API for domain intelligence
export async function securityTrailsLookup(domain: string, apiKey?: string) {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: "API key required for SecurityTrails lookup",
      };
    }

    const response = await axios.get(`https://api.securitytrails.com/v1/domain/${domain}`, {
      headers: {
        "APIKEY": apiKey,
      },
      timeout: API_TIMEOUT,
    });

    return {
      success: true,
      domain,
      firstSeen: response.data.first_seen,
      lastSeen: response.data.last_seen,
      subdomains: response.data.subdomains,
      records: response.data.records,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to lookup SecurityTrails",
    };
  }
}

// Hunter.io API for email enumeration
export async function hunterEmailSearch(domain: string, apiKey?: string) {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: "API key required for Hunter.io search",
      };
    }

    const response = await axios.get("https://api.hunter.io/v2/domain-search", {
      params: {
        domain: domain,
        limit: 100,
      },
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: API_TIMEOUT,
    });

    return {
      success: true,
      domain,
      emails: response.data.data?.emails || [],
      totalEmails: response.data.meta?.results,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to search Hunter.io",
    };
  }
}
