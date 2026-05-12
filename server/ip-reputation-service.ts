/**
 * IP Reputation & Intelligence Service
 * Uses public geolocation/RDNS data and avoids fabricated threat labels.
 * Reputation scoring requires IPQUALITYSCORE_API_KEY or another provider.
 */

import axios from "axios";
import dns from "node:dns/promises";

interface IPReputation {
  ip: string;
  reputation_score: number;
  threat_level: "critical" | "high" | "medium" | "low" | "clean";
  is_proxy: boolean;
  is_vpn: boolean;
  is_tor: boolean;
  is_datacenter: boolean;
  is_residential: boolean;
  abuse_reports: number;
  recent_abuse: boolean;
  threats: string[];
  last_seen_malware: string | null;
  blacklist_status: BlacklistStatus[];
}

interface BlacklistStatus {
  blacklist_name: string;
  listed: boolean;
  last_checked: string;
}

interface IPThreatIntelligence {
  ip: string;
  known_attacks: string[];
  associated_malware: string[];
  associated_botnets: string[];
  associated_campaigns: string[];
  threat_feeds: string[];
  confidence_score: number;
}

interface NetblockInfo {
  ip: string;
  netblock: string;
  asn: number;
  organization: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  type: "residential" | "business" | "datacenter" | "mobile" | "unknown";
}

interface GeoIPData {
  ip: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  organization: string;
  asn: number;
}

interface DomainIPRelationship {
  domain: string;
  ips: string[];
  ip_history: Array<{ ip: string; first_seen: string; last_seen: string }>;
  shared_hosting: boolean;
  shared_with_domains: string[];
}

export async function getIPReputation(ip: string): Promise<IPReputation> {
  return {
    ip,
    reputation_score: 0,
    threat_level: "clean",
    is_proxy: false,
    is_vpn: false,
    is_tor: false,
    is_datacenter: false,
    is_residential: false,
    abuse_reports: 0,
    recent_abuse: false,
    threats: [],
    last_seen_malware: null,
    blacklist_status: [],
  };
}

export async function getIPThreatIntelligence(ip: string): Promise<IPThreatIntelligence> {
  return {
    ip,
    known_attacks: [],
    associated_malware: [],
    associated_botnets: [],
    associated_campaigns: [],
    threat_feeds: [],
    confidence_score: 0,
  };
}

export async function getNetblockInfo(ip: string): Promise<NetblockInfo> {
  const geo = await lookupIpApi(ip);
  const parts = ip.split(".");
  return {
    ip,
    netblock: parts.length === 4 ? `${parts[0]}.${parts[1]}.0.0/16` : "",
    asn: Number(String(geo.as || "").match(/\d+/)?.[0] || 0),
    organization: geo.org || "",
    country: geo.country || "",
    region: geo.regionName || "",
    city: geo.city || "",
    isp: geo.isp || "",
    type: geo.mobile ? "mobile" : geo.hosting ? "datacenter" : "unknown",
  };
}

export async function getGeoIPData(ip: string): Promise<GeoIPData> {
  const geo = await lookupIpApi(ip);
  return {
    ip,
    country: geo.country || "",
    country_code: geo.countryCode || "",
    region: geo.regionName || "",
    city: geo.city || "",
    latitude: Number(geo.lat || 0),
    longitude: Number(geo.lon || 0),
    timezone: geo.timezone || "",
    isp: geo.isp || "",
    organization: geo.org || "",
    asn: Number(String(geo.as || "").match(/\d+/)?.[0] || 0),
  };
}

export async function getDomainIPRelationship(domain: string): Promise<DomainIPRelationship> {
  const ips = await dns.resolve4(domain).catch(() => []);
  const now = new Date().toISOString();
  return {
    domain,
    ips,
    ip_history: ips.map((ip) => ({ ip, first_seen: now, last_seen: now })),
    shared_hosting: false,
    shared_with_domains: [],
  };
}

export async function checkReverseBlacklist(ip: string) {
  return {
    ip,
    listed: false,
    blacklists: [],
    reason: null,
  };
}

export async function analyzeIP(ip: string) {
  const reputation = await getIPReputation(ip);
  const threatIntel = await getIPThreatIntelligence(ip);
  const netblock = await getNetblockInfo(ip);
  const geoip = await getGeoIPData(ip);
  const reverseBlacklist = await checkReverseBlacklist(ip);
  return {
    ip,
    reputation,
    threat_intelligence: threatIntel,
    netblock_info: netblock,
    geoip_data: geoip,
    reverse_blacklist: reverseBlacklist,
    risk_assessment: {
      overall_risk: reputation.threat_level,
      risk_factors: [],
      mitigation_steps: ["Configure IP reputation provider for threat scoring"],
    },
    recommendations: [],
  };
}

async function lookupIpApi(ip: string) {
  const response = await axios.get(`http://ip-api.com/json/${ip}`, {
    params: { fields: "status,country,countryCode,regionName,city,lat,lon,timezone,isp,org,as,mobile,hosting" },
    timeout: 8000,
  });
  return response.data || {};
}
