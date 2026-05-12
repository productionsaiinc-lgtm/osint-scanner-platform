/**
 * OSINT and network utilities backed by live lookups.
 *
 * Some exported names retain the historical `simulate*` prefix because router
 * callers already depend on them. They no longer generate random/mock data.
 */

import axios from "axios";
import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
import { ErrorHandler } from "./error-handler";

const HTTP_TIMEOUT = 12000;
const TCP_TIMEOUT = 2500;

function normalizeHost(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").split("/")[0].replace(/^\[|\]$/g, "");
}

function normalizeDomain(value: string) {
  return normalizeHost(value).replace(/^www\./i, "").toLowerCase();
}

function isLikelyIp(value: string) {
  return net.isIP(value) !== 0;
}

function axiosHeaders() {
  return {
    "User-Agent": "OSINT-Scanner-Platform/1.0",
    Accept: "application/json,text/html;q=0.9,*/*;q=0.8",
  };
}

async function tcpProbe(host: string, port: number, timeout = TCP_TIMEOUT) {
  const started = Date.now();

  return new Promise<{ port: number; status: "open" | "closed"; service: string; protocol: "tcp"; responseTime?: number }>((resolve) => {
    const socket = net.createConnection({ host, port, timeout });
    let settled = false;

    const finish = (status: "open" | "closed") => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({
        port,
        status,
        service: getServiceName(port),
        protocol: "tcp",
        responseTime: Date.now() - started,
      });
    };

    socket.once("connect", () => finish("open"));
    socket.once("timeout", () => finish("closed"));
    socket.once("error", () => finish("closed"));
  });
}

function parsePortList(value?: string) {
  if (!value) return [21, 22, 25, 53, 80, 110, 143, 443, 445, 3306, 5432, 8080, 8443, 27017];

  const ports = new Set<number>();
  for (const part of value.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes("-")) {
      const [startRaw, endRaw] = trimmed.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (Number.isInteger(start) && Number.isInteger(end)) {
        for (let port = Math.max(1, start); port <= Math.min(65535, end, start + 200); port += 1) {
          ports.add(port);
        }
      }
    } else {
      const port = Number(trimmed);
      if (Number.isInteger(port) && port >= 1 && port <= 65535) ports.add(port);
    }
  }

  return ports.size > 0 ? Array.from(ports).slice(0, 250) : [80, 443];
}

function scoreHeaders(headers: Record<string, any>) {
  const checks = ["content-security-policy", "x-content-type-options", "x-frame-options", "strict-transport-security", "referrer-policy"];
  const present = checks.filter((header) => Boolean(headers[header]));
  return Math.round((present.length / checks.length) * 100);
}

// IP Geolocation using ip-api.com (free, no key required)
export async function getIPGeolocation(ip: string) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as`, {
      timeout: HTTP_TIMEOUT,
      headers: axiosHeaders(),
    });

    if (response.data.status === "success") {
      return {
        success: true,
        ip,
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
      };
    }
    return { success: false, error: "IP lookup failed" };
  } catch (error) {
    const osintError = ErrorHandler.handleExternalAPIError(error, "IP Geolocation");
    return { success: false, error: osintError.message };
  }
}

// Real TCP connect scan. Kept name for router compatibility.
export async function simulatePortScan(host: string, ports: number[] = [22, 80, 443, 3306, 5432, 8080, 8443]) {
  try {
    const target = normalizeHost(host);
    const results = await Promise.all(ports.map((port) => tcpProbe(target, port)));

    return {
      success: true,
      host: target,
      timestamp: new Date().toISOString(),
      ports: results,
      openPorts: results.filter((p) => p.status === "open").map((p) => p.port),
    };
  } catch (error) {
    const osintError = ErrorHandler.handleNetworkError(error, "Port Scan");
    return { success: false, error: osintError.message };
  }
}

// ICMP requires privileged system access; use live TCP reachability timing.
export async function simulatePing(host: string) {
  try {
    const target = normalizeHost(host);
    const probes = await Promise.all([443, 80].map((port) => tcpProbe(target, port, 2000)));
    const open = probes.filter((probe) => probe.status === "open");
    const times = open.map((probe) => probe.responseTime || 0);

    return {
      success: open.length > 0,
      host: target,
      timestamp: new Date().toISOString(),
      method: "tcp-connect",
      packets: {
        sent: probes.length,
        received: open.length,
        lost: probes.length - open.length,
      },
      times: times.map((time) => time.toFixed(2)),
      min: times.length ? Math.min(...times).toFixed(2) : undefined,
      max: times.length ? Math.max(...times).toFixed(2) : undefined,
      avg: times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) : undefined,
      responseTime: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : undefined,
      error: open.length === 0 ? "No TCP response on ports 80 or 443" : undefined,
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Reachability check failed" };
  }
}

export async function simulateTraceroute(host: string) {
  return {
    success: false,
    host: normalizeHost(host),
    timestamp: new Date().toISOString(),
    error: "Traceroute requires privileged network tooling and is not simulated.",
  };
}

export async function simulateDNSLookup(domain: string) {
  try {
    const target = normalizeDomain(domain);
    const [a, aaaa, mx, ns, txt, cname, caa] = await Promise.allSettled([
      dns.resolve4(target),
      dns.resolve6(target),
      dns.resolveMx(target),
      dns.resolveNs(target),
      dns.resolveTxt(target),
      dns.resolveCname(target),
      dns.resolveCaa(target),
    ]);

    const records = {
      A: a.status === "fulfilled" ? a.value : [],
      AAAA: aaaa.status === "fulfilled" ? aaaa.value : [],
      MX: mx.status === "fulfilled" ? mx.value : [],
      NS: ns.status === "fulfilled" ? ns.value : [],
      TXT: txt.status === "fulfilled" ? txt.value.map((parts) => parts.join("")) : [],
      CNAME: cname.status === "fulfilled" ? cname.value : [],
      CAA: caa.status === "fulfilled" ? caa.value : [],
    };

    return {
      success: Object.values(records).some((value) => value.length > 0),
      domain: target,
      timestamp: new Date().toISOString(),
      records,
      error: Object.values(records).every((value) => value.length === 0) ? "No DNS records found" : undefined,
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "DNS lookup failed" };
  }
}

export async function simulateWHOISLookup(domain: string) {
  try {
    const target = normalizeDomain(domain);
    const response = await axios.get(`https://rdap.org/domain/${encodeURIComponent(target)}`, {
      timeout: HTTP_TIMEOUT,
      headers: axiosHeaders(),
    });
    const data = response.data;
    const events: any[] = data.events || [];
    const registrationDate = events.find((event) => event.eventAction === "registration")?.eventDate;
    const expirationDate = events.find((event) => event.eventAction === "expiration")?.eventDate;
    const registrarEntity = (data.entities || []).find((entity: any) => entity.roles?.includes("registrar"));
    const registrar = registrarEntity?.vcardArray?.[1]?.find((item: any[]) => item[0] === "fn")?.[3] || data.registrarName || "Unknown";

    return {
      success: true,
      domain: target,
      timestamp: new Date().toISOString(),
      registrar,
      registrationDate,
      expirationDate,
      registrant: undefined,
      nameservers: (data.nameservers || []).map((server: any) => server.ldhName).filter(Boolean),
      status: data.status || [],
      rdapUrl: `https://rdap.org/domain/${target}`,
    };
  } catch (error: any) {
    return { success: false, error: error.response?.status === 404 ? "No RDAP record found" : error.message || "WHOIS/RDAP lookup failed" };
  }
}

export async function simulateSubdomainEnum(domain: string) {
  try {
    const target = normalizeDomain(domain);
    const response = await axios.get(`https://crt.sh/?q=${encodeURIComponent(`%.${target}`)}&output=json`, {
      timeout: HTTP_TIMEOUT,
      headers: axiosHeaders(),
    });
    const rows = Array.isArray(response.data) ? response.data : [];
    const names = new Set<string>();
    for (const row of rows) {
      for (const name of String(row.name_value || "").split(/\n+/)) {
        const cleaned = name.trim().replace(/^\*\./, "").toLowerCase();
        if (cleaned && cleaned.endsWith(`.${target}`)) names.add(cleaned);
      }
    }

    const limitedNames = Array.from(names).slice(0, 50);
    const subdomains = await Promise.all(limitedNames.map(async (subdomain) => {
      const ips = await dns.resolve4(subdomain).catch(() => []);
      return { subdomain, ip: ips[0] || "" };
    }));

    return {
      success: true,
      domain: target,
      timestamp: new Date().toISOString(),
      source: "crt.sh Certificate Transparency",
      subdomains,
      count: subdomains.length,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Subdomain enumeration failed" };
  }
}

export async function simulateSSLLookup(domain: string) {
  try {
    const target = normalizeDomain(domain);
    const certificate = await new Promise<any>((resolve, reject) => {
      const socket = tls.connect({ host: target, port: 443, servername: target, timeout: TCP_TIMEOUT, rejectUnauthorized: false }, () => {
        const cert = socket.getPeerCertificate(true);
        socket.end();
        resolve(cert);
      });
      socket.once("timeout", () => {
        socket.destroy();
        reject(new Error("TLS connection timed out"));
      });
      socket.once("error", reject);
    });

    return {
      success: true,
      domain: target,
      timestamp: new Date().toISOString(),
      certificate: {
        subject: certificate.subject ? Object.entries(certificate.subject).map(([k, v]) => `${k}=${v}`).join(", ") : certificate.subjectaltname,
        issuer: certificate.issuer ? Object.entries(certificate.issuer).map(([k, v]) => `${k}=${v}`).join(", ") : "Unknown",
        issueDate: certificate.valid_from,
        expiryDate: certificate.valid_to,
        fingerprint: certificate.fingerprint256 || certificate.fingerprint,
        keySize: certificate.bits,
        signatureAlgorithm: certificate.sigalg,
        altNames: certificate.subjectaltname ? String(certificate.subjectaltname).replace(/DNS:/g, "").split(", ") : [],
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "SSL lookup failed" };
  }
}

export async function simulateSocialMediaSearch(username: string) {
  try {
    const clean = username.trim().replace(/^@/, "");
    const checks = [
      { platform: "github", url: `https://api.github.com/users/${encodeURIComponent(clean)}` },
      { platform: "reddit", url: `https://www.reddit.com/user/${encodeURIComponent(clean)}/about.json` },
      { platform: "x", url: `https://x.com/${encodeURIComponent(clean)}` },
      { platform: "instagram", url: `https://www.instagram.com/${encodeURIComponent(clean)}/` },
      { platform: "tiktok", url: `https://www.tiktok.com/@${encodeURIComponent(clean)}` },
    ];

    const responses = await Promise.allSettled(checks.map(async (check) => {
      const response = await axios.get(check.url, {
        timeout: 8000,
        headers: axiosHeaders(),
        validateStatus: (status) => status < 500,
      });
      return { check, response };
    }));

    const results = responses.flatMap((result) => {
      if (result.status !== "fulfilled") return [];
      const { check, response } = result.value;
      if (response.status >= 400) return [];
      const data = response.data || {};
      const github = check.platform === "github" ? data : null;
      const reddit = check.platform === "reddit" ? data.data : null;
      return [{
        platform: check.platform,
        username: clean,
        found: true,
        profileUrl: check.platform === "github" ? data.html_url : check.url.replace("/about.json", ""),
        displayName: github?.name || reddit?.subreddit?.display_name || clean,
        followers: github?.followers ?? reddit?.subreddit?.subscribers,
        following: github?.following,
        bio: github?.bio || reddit?.subreddit?.public_description || "",
      }];
    });

    return {
      success: true,
      username: clean,
      timestamp: new Date().toISOString(),
      results,
      platformsFound: results.length,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Social media search failed" };
  }
}

export async function advancedPortScan(host: string, options: { scanType?: string; ports?: string; aggressive?: boolean } = {}) {
  const portList = parsePortList(options.ports);
  const result = await simulatePortScan(host, portList);
  return {
    ...result,
    scanType: options.scanType || "tcp-connect",
    summary: result.success && result.ports ? {
      total: result.ports.length,
      open: result.ports.filter((p: any) => p.status === "open").length,
      filtered: 0,
      closed: result.ports.filter((p: any) => p.status === "closed").length,
    } : undefined,
  };
}

export async function osFingerprinting(host: string) {
  return {
    success: false,
    host: normalizeHost(host),
    timestamp: new Date().toISOString(),
    error: "OS fingerprinting requires packet-level scanner integration and is not simulated.",
  };
}

export async function reverseDNSLookup(ip: string) {
  try {
    const hostnames = await dns.reverse(ip);
    return {
      success: true,
      ip,
      timestamp: new Date().toISOString(),
      hostname: hostnames[0] || "",
      ptr: hostnames,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Reverse DNS lookup failed" };
  }
}

export async function verifyEmail(email: string) {
  try {
    const validSyntax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const domain = email.split("@")[1]?.toLowerCase();
    const mxRecords = validSyntax && domain ? await dns.resolveMx(domain).catch(() => []) : [];

    return {
      success: true,
      email,
      timestamp: new Date().toISOString(),
      valid: validSyntax,
      deliverable: validSyntax && mxRecords.length > 0,
      domain,
      mxRecords,
      smtpCheck: false,
      note: "SMTP mailbox verification is intentionally not simulated.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Email verification failed" };
  }
}

export async function asnLookup(ip: string) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,as,org,country,query`, {
      timeout: HTTP_TIMEOUT,
      headers: axiosHeaders(),
    });
    if (response.data.status !== "success") return { success: false, error: "ASN lookup failed" };
    return {
      success: true,
      ip,
      timestamp: new Date().toISOString(),
      asn: response.data.as,
      organization: response.data.org,
      country: response.data.country,
      prefix: undefined,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "ASN lookup failed" };
  }
}

export async function searchCVE(query: string) {
  try {
    const response = await axios.get("https://services.nvd.nist.gov/rest/json/cves/2.0", {
      params: { keywordSearch: query, resultsPerPage: 20 },
      timeout: HTTP_TIMEOUT,
      headers: axiosHeaders(),
    });
    const results = (response.data.vulnerabilities || []).map((item: any) => ({
      id: item.cve.id,
      severity: item.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || "UNKNOWN",
      score: item.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore,
      description: item.cve.descriptions?.[0]?.value || "",
      published: item.cve.published,
    }));
    return { success: true, query, timestamp: new Date().toISOString(), results };
  } catch (error: any) {
    return { success: false, error: error.message || "CVE search failed" };
  }
}

export async function detectWebTechnology(domain: string) {
  try {
    const target = normalizeDomain(domain);
    const response = await axios.get(`https://${target}`, {
      timeout: HTTP_TIMEOUT,
      headers: axiosHeaders(),
      responseType: "text",
      maxContentLength: 2 * 1024 * 1024,
    });
    const html = String(response.data).toLowerCase();
    const headers = response.headers;
    const technologies = [
      html.includes("react") && { name: "React", category: "JavaScript Framework" },
      html.includes("vue") && { name: "Vue.js", category: "JavaScript Framework" },
      html.includes("angular") && { name: "Angular", category: "JavaScript Framework" },
      html.includes("wp-content") && { name: "WordPress", category: "CMS" },
      html.includes("/_next/") && { name: "Next.js", category: "Web Framework" },
      headers.server && { name: headers.server, category: "Web Server" },
      headers["x-powered-by"] && { name: headers["x-powered-by"], category: "Framework" },
    ].filter(Boolean);

    return {
      success: true,
      domain: target,
      timestamp: new Date().toISOString(),
      technologies,
      headers,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Web technology detection failed" };
  }
}

export async function analyzeSecurityHeaders(domain: string) {
  try {
    const target = normalizeDomain(domain);
    const response = await axios.get(`https://${target}`, {
      timeout: HTTP_TIMEOUT,
      headers: axiosHeaders(),
      validateStatus: (status) => status < 500,
    });
    const headers = response.headers;
    const headerStatus = {
      "Content-Security-Policy": { present: Boolean(headers["content-security-policy"]), status: headers["content-security-policy"] ? "GOOD" : "MISSING" },
      "X-Content-Type-Options": { present: Boolean(headers["x-content-type-options"]), status: headers["x-content-type-options"] ? "GOOD" : "MISSING" },
      "X-Frame-Options": { present: Boolean(headers["x-frame-options"]), status: headers["x-frame-options"] ? "GOOD" : "MISSING" },
      "Strict-Transport-Security": { present: Boolean(headers["strict-transport-security"]), status: headers["strict-transport-security"] ? "GOOD" : "MISSING" },
      "Referrer-Policy": { present: Boolean(headers["referrer-policy"]), status: headers["referrer-policy"] ? "GOOD" : "MISSING" },
    };

    return {
      success: true,
      domain: target,
      timestamp: new Date().toISOString(),
      headers: headerStatus,
      score: scoreHeaders(headers),
      recommendations: Object.entries(headerStatus)
        .filter(([, value]) => !value.present)
        .map(([header]) => `Add ${header} header`),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Security header analysis failed" };
  }
}

export async function searchGitHubRepos(query: string) {
  try {
    const headers: Record<string, string> = axiosHeaders();
    const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY;
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.get("https://api.github.com/search/repositories", {
      params: { q: query, sort: "stars", order: "desc", per_page: 20 },
      timeout: HTTP_TIMEOUT,
      headers,
    });
    const results = (response.data.items || []).map((repo: any) => ({
      name: repo.name,
      owner: repo.owner?.login,
      stars: repo.stargazers_count,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
    }));
    return { success: true, query, timestamp: new Date().toISOString(), results };
  } catch (error: any) {
    return { success: false, error: error.message || "GitHub search failed" };
  }
}

export async function searchWaybackMachine(domain: string) {
  try {
    const target = normalizeDomain(domain);
    const response = await axios.get("https://web.archive.org/cdx", {
      params: {
        url: target,
        output: "json",
        fl: "timestamp,original,statuscode,mimetype",
        collapse: "digest",
        limit: 50,
      },
      timeout: HTTP_TIMEOUT,
      headers: axiosHeaders(),
    });
    const rows = Array.isArray(response.data) ? response.data.slice(1) : [];
    const snapshots = rows.map((row: any[]) => ({
      timestamp: row[0],
      url: `https://web.archive.org/web/${row[0]}/${row[1]}`,
      original: row[1],
      statusCode: row[2],
      mimeType: row[3],
    }));
    return {
      success: true,
      domain: target,
      timestamp: new Date().toISOString(),
      snapshots,
      totalSnapshots: snapshots.length,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Wayback Machine search failed" };
  }
}

export async function searchCredentialLeaks(email: string) {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      email,
      timestamp: new Date().toISOString(),
      error: "Have I Been Pwned API key required. Add HIBP_API_KEY to environment variables.",
    };
  }

  try {
    const response = await axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
      params: { truncateResponse: false },
      timeout: HTTP_TIMEOUT,
      headers: {
        ...axiosHeaders(),
        "hibp-api-key": apiKey,
      },
      validateStatus: (status) => status === 200 || status === 404,
    });

    const breaches = response.status === 404 ? [] : response.data;
    return {
      success: true,
      email,
      timestamp: new Date().toISOString(),
      breached: breaches.length > 0,
      breaches: breaches.map((breach: any) => ({
        name: breach.Name,
        date: breach.BreachDate,
        records: breach.PwnCount,
        dataClasses: breach.DataClasses,
      })),
      recommendations: breaches.length > 0 ? [
        "Change affected passwords",
        "Enable multi-factor authentication",
        "Monitor account activity",
      ] : [],
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Credential leak search failed" };
  }
}

function getServiceName(port: number): string {
  const services: Record<number, string> = {
    21: "FTP",
    22: "SSH",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    3306: "MySQL",
    5432: "PostgreSQL",
    5984: "CouchDB",
    6379: "Redis",
    8080: "HTTP-ALT",
    8443: "HTTPS-ALT",
    27017: "MongoDB",
  };
  return services[port] || "Unknown";
}
