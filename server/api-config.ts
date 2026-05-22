/**
 * API Configuration and Key Management
 * Store API keys securely and manage external service integrations
 */

export interface APIConfig {
  // Breach & Threat Intelligence
  haveibeenpwned?: {
    enabled: boolean;
    apiKey?: string;
  };
  
  // GitHub
  github?: {
    enabled: boolean;
    apiKey?: string;
  };

  // CVE & Vulnerability
  nvdCVE?: {
    enabled: boolean;
    apiKey?: string;
  };

  // IP Reputation
  ipQualityScore?: {
    enabled: boolean;
    apiKey?: string;
  };

  // Domain Intelligence
  whois?: {
    enabled: boolean;
    apiKey?: string;
  };

  securityTrails?: {
    enabled: boolean;
    apiKey?: string;
  };

  // Email Intelligence
  hunter?: {
    enabled: boolean;
    apiKey?: string;
  };

  // Malware & URL Scanning
  virustotal?: {
    enabled: boolean;
    apiKey?: string;
  };

  // Device Search
  shodan?: {
    enabled: boolean;
    apiKey?: string;
  };

  // Phone intelligence
  numverify?: {
    enabled: boolean;
    apiKey?: string;
  };

  abstractPhone?: {
    enabled: boolean;
    apiKey?: string;
  };

  // Vehicle intelligence
  licensePlateLookup?: {
    enabled: boolean;
    apiKey?: string;
  };

  // Flight tracking
  aviationstack?: {
    enabled: boolean;
    apiKey?: string;
  };

  // DNS
  cloudflare?: {
    enabled: boolean;
    apiKey?: string;
  };
}

// Load configuration from environment variables
export function loadAPIConfig(): APIConfig {
  return {
    haveibeenpwned: {
      enabled: !!process.env.HIBP_API_KEY,
      apiKey: process.env.HIBP_API_KEY,
    },
    github: {
      enabled: !!process.env.GITHUB_API_KEY,
      apiKey: process.env.GITHUB_API_KEY,
    },
    nvdCVE: {
      enabled: !!process.env.NVD_API_KEY,
      apiKey: process.env.NVD_API_KEY,
    },
    ipQualityScore: {
      enabled: !!(process.env.IPQUALITYSCORE_API_KEY || process.env.IPQS_API_KEY),
      apiKey: process.env.IPQUALITYSCORE_API_KEY || process.env.IPQS_API_KEY,
    },
    whois: {
      enabled: !!process.env.WHOIS_API_KEY,
      apiKey: process.env.WHOIS_API_KEY,
    },
    securityTrails: {
      enabled: !!process.env.SECURITYTRAILS_API_KEY,
      apiKey: process.env.SECURITYTRAILS_API_KEY,
    },
    hunter: {
      enabled: !!process.env.HUNTER_API_KEY,
      apiKey: process.env.HUNTER_API_KEY,
    },
    virustotal: {
      enabled: !!process.env.VIRUSTOTAL_API_KEY,
      apiKey: process.env.VIRUSTOTAL_API_KEY,
    },
    shodan: {
      enabled: !!process.env.SHODAN_API_KEY,
      apiKey: process.env.SHODAN_API_KEY,
    },
    numverify: {
      enabled: !!process.env.NUMVERIFY_API_KEY,
      apiKey: process.env.NUMVERIFY_API_KEY,
    },
    abstractPhone: {
      enabled: !!process.env.ABSTRACT_PHONE_API_KEY,
      apiKey: process.env.ABSTRACT_PHONE_API_KEY,
    },
    licensePlateLookup: {
      enabled: !!process.env.LICENSE_PLATE_LOOKUP_API_URL,
      apiKey: process.env.LICENSE_PLATE_LOOKUP_API_KEY,
    },
    aviationstack: {
      enabled: !!process.env.AVIATIONSTACK_API_KEY,
      apiKey: process.env.AVIATIONSTACK_API_KEY,
    },
    cloudflare: {
      enabled: !!process.env.CLOUDFLARE_API_KEY,
      apiKey: process.env.CLOUDFLARE_API_KEY,
    },
  };
}

// Get status of all configured APIs
export function getAPIStatus(): Record<string, boolean> {
  const config = loadAPIConfig();
  return {
    haveibeenpwned: config.haveibeenpwned?.enabled || false,
    github: config.github?.enabled || false,
    nvdCVE: config.nvdCVE?.enabled || false,
    ipQualityScore: config.ipQualityScore?.enabled || false,
    whois: config.whois?.enabled || false,
    securityTrails: config.securityTrails?.enabled || false,
    hunter: config.hunter?.enabled || false,
    virustotal: config.virustotal?.enabled || false,
    shodan: config.shodan?.enabled || false,
    numverify: config.numverify?.enabled || false,
    abstractPhone: config.abstractPhone?.enabled || false,
    licensePlateLookup: config.licensePlateLookup?.enabled || false,
    aviationstack: config.aviationstack?.enabled || false,
    cloudflare: config.cloudflare?.enabled || false,
  };
}
