/**
 * IP Reputation & Intelligence Service
 * Provides IP reputation scoring, threat intelligence, and detailed IP analysis
 */

interface IPReputation {
  ip: string;
  reputation_score: number; // 0-100, higher = more suspicious
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
  ip_history: Array<{
    ip: string;
    first_seen: string;
    last_seen: string;
  }>;
  shared_hosting: boolean;
  shared_with_domains: string[];
}

/**
 * Get IP reputation score and threat assessment
 */
export async function getIPReputation(ip: string): Promise<IPReputation> {
  // Simulated IP reputation data
  const isPrivate = isPrivateIP(ip);
  const reputationScore = calculateReputationScore(ip);
  const threatLevel = getThreatLevel(reputationScore);

  const threats: string[] = [];
  if (reputationScore > 75) {
    threats.push("Known malware source");
    threats.push("High abuse reports");
  } else if (reputationScore > 50) {
    threats.push("Moderate abuse history");
  }

  const blacklistStatus: BlacklistStatus[] = [
    {
      blacklist_name: "Spamhaus PBL",
      listed: reputationScore > 60,
      last_checked: new Date().toISOString(),
    },
    {
      blacklist_name: "Spamhaus SBL",
      listed: reputationScore > 75,
      last_checked: new Date().toISOString(),
    },
    {
      blacklist_name: "Project Honey Pot",
      listed: reputationScore > 50,
      last_checked: new Date().toISOString(),
    },
  ];

  return {
    ip,
    reputation_score: reputationScore,
    threat_level: threatLevel,
    is_proxy: reputationScore > 40 && !isPrivate,
    is_vpn: reputationScore > 50 && !isPrivate,
    is_tor: reputationScore > 70,
    is_datacenter: reputationScore > 30,
    is_residential: reputationScore < 30,
    abuse_reports: Math.floor(reputationScore / 10),
    recent_abuse: reputationScore > 50,
    threats,
    last_seen_malware: reputationScore > 70 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
    blacklist_status: blacklistStatus,
  };
}

/**
 * Get threat intelligence for IP
 */
export async function getIPThreatIntelligence(ip: string): Promise<IPThreatIntelligence> {
  const reputation = await getIPReputation(ip);

  const knownAttacks: string[] = [];
  const malware: string[] = [];
  const botnets: string[] = [];
  const campaigns: string[] = [];

  if (reputation.reputation_score > 70) {
    knownAttacks.push("Brute force SSH attacks");
    knownAttacks.push("SQL injection attempts");
    malware.push("Mirai");
    malware.push("Emotet");
    botnets.push("Botnet-X");
    campaigns.push("Campaign-2024-01");
  } else if (reputation.reputation_score > 50) {
    knownAttacks.push("Port scanning");
    malware.push("Generic trojan");
  }

  return {
    ip,
    known_attacks: knownAttacks,
    associated_malware: malware,
    associated_botnets: botnets,
    associated_campaigns: campaigns,
    threat_feeds: ["AbuseIPDB", "Shodan", "Censys"],
    confidence_score: reputation.reputation_score,
  };
}

/**
 * Get netblock information for IP
 */
export async function getNetblockInfo(ip: string): Promise<NetblockInfo> {
  const parts = ip.split(".");
  const firstOctet = parseInt(parts[0]);

  // Determine IP type based on first octet
  let type: "residential" | "business" | "datacenter" | "mobile" | "unknown" = "unknown";
  if (firstOctet >= 1 && firstOctet <= 126) {
    type = Math.random() > 0.5 ? "residential" : "business";
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    type = "datacenter";
  }

  return {
    ip,
    netblock: `${parts[0]}.${parts[1]}.0.0/16`,
    asn: Math.floor(Math.random() * 65000) + 1000,
    organization: generateOrganizationName(),
    country: generateCountry(),
    region: generateRegion(),
    city: generateCity(),
    isp: generateISPName(),
    type,
  };
}

/**
 * Get GeoIP data for IP
 */
export async function getGeoIPData(ip: string): Promise<GeoIPData> {
  const netblock = await getNetblockInfo(ip);

  return {
    ip,
    country: netblock.country,
    country_code: generateCountryCode(),
    region: netblock.region,
    city: netblock.city,
    latitude: Math.random() * 180 - 90,
    longitude: Math.random() * 360 - 180,
    timezone: generateTimezone(),
    isp: netblock.isp,
    organization: netblock.organization,
    asn: netblock.asn,
  };
}

/**
 * Get domain to IP relationship information
 */
export async function getDomainIPRelationship(domain: string): Promise<DomainIPRelationship> {
  // Simulated domain-IP relationship data
  const ips = generateRandomIPs(3);

  const ipHistory = ips.map((ip, idx) => ({
    ip,
    first_seen: new Date(Date.now() - (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date(Date.now() - idx * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const sharedDomains = Math.random() > 0.5
    ? ["example-shared.com", "another-site.com", "hosted-service.com"]
    : [];

  return {
    domain,
    ips,
    ip_history: ipHistory,
    shared_hosting: sharedDomains.length > 0,
    shared_with_domains: sharedDomains,
  };
}

/**
 * Check if IP is in reverse DNS blocklist
 */
export async function checkReverseBlacklist(ip: string): Promise<{
  ip: string;
  listed: boolean;
  blacklists: string[];
  reason: string | null;
}> {
  const reputation = await getIPReputation(ip);
  const listed = reputation.reputation_score > 50;

  return {
    ip,
    listed,
    blacklists: listed
      ? ["Spamhaus", "Project Honey Pot", "SORBS"]
      : [],
    reason: listed ? "High abuse reports and malicious activity" : null,
  };
}

/**
 * Perform comprehensive IP analysis
 */
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
    risk_assessment: generateRiskAssessment(reputation, threatIntel),
    recommendations: generateRecommendations(reputation),
  };
}

/**
 * Calculate reputation score for IP
 */
function calculateReputationScore(ip: string): number {
  // Simulate reputation based on IP pattern
  const parts = ip.split(".");
  const hash = parts.reduce((acc, part) => acc + parseInt(part), 0);

  let score = (hash % 100);

  // Add some variation based on IP ranges
  if (ip.startsWith("192.168") || ip.startsWith("10.") || ip.startsWith("172.")) {
    score = Math.max(0, score - 50); // Private IPs get lower scores
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get threat level based on reputation score
 */
function getThreatLevel(score: number): "critical" | "high" | "medium" | "low" | "clean" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  if (score >= 20) return "low";
  return "clean";
}

/**
 * Generate risk assessment
 */
function generateRiskAssessment(
  reputation: IPReputation,
  threatIntel: IPThreatIntelligence
): {
  overall_risk: string;
  risk_factors: string[];
  mitigation_steps: string[];
} {
  const riskFactors: string[] = [];

  if (reputation.is_tor) riskFactors.push("Known Tor exit node");
  if (reputation.is_vpn) riskFactors.push("VPN/Proxy detected");
  if (reputation.recent_abuse) riskFactors.push("Recent abuse reports");
  if (threatIntel.associated_malware.length > 0) riskFactors.push("Associated with malware");
  if (threatIntel.known_attacks.length > 0) riskFactors.push("Known attack source");

  const overallRisk = reputation.threat_level;

  return {
    overall_risk: overallRisk,
    risk_factors: riskFactors,
    mitigation_steps: [
      "Monitor for suspicious activity",
      "Consider blocking in firewall",
      "Review access logs",
      "Implement rate limiting",
    ],
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(reputation: IPReputation): string[] {
  const recommendations: string[] = [];

  if (reputation.reputation_score > 70) {
    recommendations.push("Block this IP immediately");
    recommendations.push("Add to firewall blacklist");
    recommendations.push("Review recent access logs");
  } else if (reputation.reputation_score > 50) {
    recommendations.push("Implement rate limiting");
    recommendations.push("Monitor for suspicious activity");
    recommendations.push("Consider temporary blocking");
  } else if (reputation.reputation_score > 30) {
    recommendations.push("Monitor for abuse patterns");
  }

  return recommendations;
}

/**
 * Helper functions for data generation
 */
function isPrivateIP(ip: string): boolean {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("172.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("127.")
  );
}

function generateRandomIPs(count: number): string[] {
  const ips: string[] = [];
  for (let i = 0; i < count; i++) {
    ips.push(
      `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(
        Math.random() * 256
      )}.${Math.floor(Math.random() * 256)}`
    );
  }
  return ips;
}

function generateOrganizationName(): string {
  const names = [
    "Amazon Web Services",
    "Google Cloud",
    "Microsoft Azure",
    "DigitalOcean",
    "Linode",
    "Vultr",
    "OVH",
    "Hetzner",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function generateCountry(): string {
  const countries = ["United States", "China", "Russia", "Germany", "Netherlands", "Canada"];
  return countries[Math.floor(Math.random() * countries.length)];
}

function generateCountryCode(): string {
  const codes = ["US", "CN", "RU", "DE", "NL", "CA"];
  return codes[Math.floor(Math.random() * codes.length)];
}

function generateRegion(): string {
  const regions = ["California", "Virginia", "Texas", "New York", "Oregon"];
  return regions[Math.floor(Math.random() * regions.length)];
}

function generateCity(): string {
  const cities = ["San Francisco", "New York", "Los Angeles", "Chicago", "Seattle"];
  return cities[Math.floor(Math.random() * cities.length)];
}

function generateISPName(): string {
  const isps = ["Comcast", "Verizon", "AT&T", "Charter", "Cox", "Spectrum"];
  return isps[Math.floor(Math.random() * isps.length)];
}

function generateTimezone(): string {
  const timezones = ["UTC", "EST", "CST", "MST", "PST", "GMT"];
  return timezones[Math.floor(Math.random() * timezones.length)];
}
