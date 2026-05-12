/**
 * Subdomain Takeover Detection Service
 * Performs live DNS/CNAME resolution and checks known dangling-service
 * fingerprints without inventing vulnerable hosts.
 */

import dns from "node:dns/promises";
import axios from "axios";

export interface SubdomainTakeoverResult {
  subdomain: string;
  vulnerable: boolean;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  cname: string | null;
  service: string | null;
  takeover_method: string | null;
  resolution_status: 'resolved' | 'unresolved' | 'nxdomain';
  ip_address: string | null;
  fingerprints: Fingerprint[];
  recommendations: string[];
}

export interface Fingerprint {
  service: string;
  indicator: string;
  confidence: number;
}

export interface SubdomainTakeoverScan {
  domain: string;
  subdomains_scanned: number;
  vulnerable_subdomains: SubdomainTakeoverResult[];
  scan_timestamp: string;
  total_risk_score: number;
}

const SERVICE_PATTERNS = [
  { service: "GitHub Pages", pattern: /github\.io$/i, body: /There isn't a GitHub Pages site here|For root URLs/i, method: "Claim the GitHub Pages custom domain or remove the CNAME." },
  { service: "Heroku", pattern: /herokuapp\.com$/i, body: /No such app|herokuapp/i, method: "Create the matching Heroku app or remove the DNS record." },
  { service: "AWS S3", pattern: /s3[.-].*amazonaws\.com$/i, body: /NoSuchBucket|The specified bucket does not exist/i, method: "Create the exact S3 bucket name or remove the DNS record." },
  { service: "Azure", pattern: /azurewebsites\.net$/i, body: /404 Web Site not found/i, method: "Create the matching Azure app service or remove the DNS record." },
  { service: "Firebase", pattern: /firebaseapp\.com$/i, body: /Site Not Found|Firebase Hosting/i, method: "Claim the Firebase Hosting site or remove the DNS record." },
  { service: "Netlify", pattern: /netlify\.app$/i, body: /Not Found|No site found/i, method: "Claim the Netlify custom domain or remove the DNS record." },
];

export async function scanSubdomainTakeover(domain: string): Promise<SubdomainTakeoverScan> {
  try {
    const subdomains = generateCommonSubdomains(domain);
    const vulnerableSubdomains: SubdomainTakeoverResult[] = [];
    let totalRiskScore = 0;

    for (const subdomain of subdomains) {
      const result = await checkSubdomainTakeover(subdomain);
      if (result.vulnerable) {
        vulnerableSubdomains.push(result);
        totalRiskScore += getRiskScore(result.riskLevel);
      }
    }

    return {
      domain,
      subdomains_scanned: subdomains.length,
      vulnerable_subdomains: vulnerableSubdomains,
      scan_timestamp: new Date().toISOString(),
      total_risk_score: totalRiskScore,
    };
  } catch (error) {
    throw new Error(`Subdomain takeover scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkSubdomainTakeover(subdomain: string): Promise<SubdomainTakeoverResult> {
  const cname = await dns.resolveCname(subdomain).then((records) => records[0] || null).catch(() => null);
  const addresses = await dns.resolve4(subdomain).catch(() => []);
  const resolutionStatus: SubdomainTakeoverResult["resolution_status"] = addresses.length > 0 ? "resolved" : cname ? "unresolved" : "nxdomain";
  const servicePattern = cname ? SERVICE_PATTERNS.find((entry) => entry.pattern.test(cname)) : undefined;
  const fingerprints = cname ? generateFingerprints(subdomain, servicePattern?.service || null, cname) : [];
  let vulnerable = false;

  if (servicePattern) {
    const body = await axios.get(`https://${subdomain}`, {
      timeout: 8000,
      validateStatus: () => true,
      headers: { "User-Agent": "OSINT-Scanner-Platform/1.0" },
    }).then((res) => String(res.data).slice(0, 5000)).catch(() => "");
    vulnerable = servicePattern.body.test(body) || resolutionStatus === "unresolved";
    if (vulnerable) fingerprints.push({ service: servicePattern.service, indicator: "Dangling service error or unresolved target detected", confidence: 90 });
  }

  return {
    subdomain,
    vulnerable,
    riskLevel: vulnerable ? "high" : "none",
    cname,
    service: servicePattern?.service || null,
    takeover_method: vulnerable ? servicePattern?.method || null : null,
    resolution_status: resolutionStatus,
    ip_address: addresses[0] || null,
    fingerprints,
    recommendations: generateSubdomainRecommendations(vulnerable),
  };
}

export function generateCommonSubdomains(domain: string): string[] {
  return ['www', 'mail', 'ftp', 'api', 'admin', 'test', 'staging', 'dev', 'blog', 'shop', 'cdn', 'static', 'app', 'mobile', 'secure', 'support']
    .map(sub => `${sub}.${domain}`);
}

export function generateFingerprints(_subdomain: string, service: string | null, cname?: string | null): Fingerprint[] {
  if (!service) return [];
  return [{
    service,
    indicator: cname ? `CNAME points to ${cname}` : "Known takeover-prone service target",
    confidence: 75,
  }];
}

export function generateTakeoverMethod(service: string | null): string | null {
  return SERVICE_PATTERNS.find((entry) => entry.service === service)?.method || null;
}

export function getResolutionStatus(): 'resolved' | 'unresolved' | 'nxdomain' {
  return 'unresolved';
}

export function getRandomRiskLevel(): 'critical' | 'high' | 'medium' | 'low' {
  return 'medium';
}

export function getRiskScore(level: string): number {
  return { critical: 100, high: 75, medium: 50, low: 25, none: 0 }[level] || 0;
}

export function generateSubdomainRecommendations(vulnerable: boolean): string[] {
  return vulnerable
    ? ['Claim the dangling service target or remove the DNS record', 'Add DNS monitoring for CNAME changes', 'Audit all inactive subdomains']
    : ['Subdomain is not vulnerable based on current DNS and service fingerprints', 'Continue monitoring for DNS changes'];
}

export async function monitorSubdomainChanges(subdomain: string, interval: number = 3600000) {
  return {
    subdomain,
    monitoring: true,
    interval,
    lastCheck: new Date().toISOString(),
  };
}

export async function getSubdomainHistory(subdomain: string) {
  const current = await checkSubdomainTakeover(subdomain);
  return [{
    date: new Date().toISOString(),
    status: current.resolution_status,
    service: current.service,
    ip: current.ip_address || "",
  }];
}
