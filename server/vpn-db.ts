/**
 * VPN Service Database Helpers
 * Handles VPN provider data, user preferences, and connection logs
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";

// VPN Provider interface
export interface VPNProvider {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  price: string;
  countries: number;
  servers: number;
  protocols: string[];
  encryption: string;
  logging: string;
  features: string[];
  affiliateLink: string;
}

// VPN Providers Database
const VPN_PROVIDERS: Record<string, VPNProvider> = {
  protonvpn: {
    id: "protonvpn",
    name: "ProtonVPN",
    rating: 4.8,
    reviews: 2847,
    price: "$4.99/month",
    countries: 91,
    servers: 3000,
    protocols: ["WireGuard", "OpenVPN", "IKEv2"],
    encryption: "AES-256",
    logging: "No-logs policy",
    features: ["Kill switch", "DNS leak protection", "Split tunneling", "P2P allowed"],
    affiliateLink: "https://protonvpn.com/affiliate",
  },
  expressvpn: {
    id: "expressvpn",
    name: "ExpressVPN",
    rating: 4.7,
    reviews: 3124,
    price: "$6.67/month",
    countries: 94,
    servers: 3000,
    protocols: ["Lightway", "OpenVPN", "IKEv2"],
    encryption: "AES-256",
    logging: "No-logs policy",
    features: ["Kill switch", "Split tunneling", "MediaStreamer", "Trusted servers"],
    affiliateLink: "https://expressvpn.com/affiliate",
  },
  nordvpn: {
    id: "nordvpn",
    name: "NordVPN",
    rating: 4.6,
    reviews: 4521,
    price: "$3.99/month",
    countries: 111,
    servers: 5000,
    protocols: ["NordLynx", "OpenVPN", "IKEv2"],
    encryption: "AES-256",
    logging: "No-logs policy",
    features: ["Kill switch", "Double VPN", "Onion over VPN", "CyberSec"],
    affiliateLink: "https://nordvpn.com/affiliate",
  },
  surfshark: {
    id: "surfshark",
    name: "Surfshark",
    rating: 4.5,
    reviews: 2156,
    price: "$2.49/month",
    countries: 100,
    servers: 3200,
    protocols: ["WireGuard", "OpenVPN", "IKEv2"],
    encryption: "AES-256",
    logging: "No-logs policy",
    features: ["Kill switch", "MultiHop", "CleanWeb", "Unlimited simultaneous connections"],
    affiliateLink: "https://surfshark.com/affiliate",
  },
  mullvad: {
    id: "mullvad",
    name: "Mullvad",
    rating: 4.4,
    reviews: 1823,
    price: "$5.52/month",
    countries: 41,
    servers: 900,
    protocols: ["WireGuard", "OpenVPN"],
    encryption: "AES-256",
    logging: "No-logs policy",
    features: ["Kill switch", "Port forwarding", "No account needed", "Open source"],
    affiliateLink: "https://mullvad.net/affiliate",
  },
};

/**
 * Get all VPN providers
 */
export async function getAllVPNProviders(): Promise<VPNProvider[]> {
  return Object.values(VPN_PROVIDERS);
}

/**
 * Get specific VPN provider by ID
 */
export async function getVPNProvider(providerId: string): Promise<VPNProvider | null> {
  return VPN_PROVIDERS[providerId] || null;
}

/**
 * Get recommended VPN providers based on use case
 */
export async function getRecommendedVPNProviders(useCase: string): Promise<VPNProvider[]> {
  const providers = Object.values(VPN_PROVIDERS);

  switch (useCase) {
    case "streaming":
      // Best for streaming - fast speeds, many servers
      return providers.filter((p) => p.servers > 2500).sort((a, b) => b.rating - a.rating);

    case "privacy":
      // Best for privacy - strict no-logs, open source
      return providers.filter((p) => p.logging === "No-logs policy").sort((a, b) => b.rating - a.rating);

    case "budget":
      // Best budget options
      return providers
        .sort((a, b) => {
          const priceA = parseFloat(a.price.split("/")[0].replace("$", ""));
          const priceB = parseFloat(b.price.split("/")[0].replace("$", ""));
          return priceA - priceB;
        })
        .slice(0, 3);

    case "security":
      // Best for security - strong encryption, many protocols
      return providers.filter((p) => p.protocols.length >= 2).sort((a, b) => b.rating - a.rating);

    default:
      // Top rated overall
      return providers.sort((a, b) => b.rating - a.rating).slice(0, 3);
  }
}

/**
 * Get current user's IP address (simulated)
 */
export async function getCurrentUserIP(): Promise<{
  ip: string;
  country: string;
  city: string;
  isp: string;
  isVPN: boolean;
}> {
  // In production, use a real IP geolocation service
  // For now, return simulated data
  return {
    ip: "203.0.113.42",
    country: "United States",
    city: "New York",
    isp: "Verizon Communications",
    isVPN: false,
  };
}

/**
 * Check if IP is from VPN
 */
export async function checkVPNStatus(ip: string): Promise<{
  isVPN: boolean;
  provider?: string;
  confidence: number;
}> {
  // In production, use a real VPN detection service
  // For now, return simulated data
  return {
    isVPN: false,
    confidence: 0.95,
  };
}

/**
 * Get VPN connection speed estimate
 */
export async function getVPNConnectionSpeed(providerId: string): Promise<{
  download: number; // Mbps
  upload: number; // Mbps
  ping: number; // ms
}> {
  // In production, perform actual speed tests
  // For now, return simulated data based on provider
  const baseSpeed = 100;
  const variance = Math.random() * 20 - 10;

  return {
    download: baseSpeed + variance,
    upload: baseSpeed * 0.8 + variance,
    ping: 20 + Math.random() * 30,
  };
}

/**
 * Get VPN provider comparison
 */
export async function getVPNComparison(providerIds: string[]): Promise<VPNProvider[]> {
  return providerIds
    .map((id) => VPN_PROVIDERS[id])
    .filter((p) => p !== undefined);
}

/**
 * Get VPN security features
 */
export async function getVPNSecurityFeatures(providerId: string): Promise<{
  killSwitch: boolean;
  dnsLeakProtection: boolean;
  ipLeakProtection: boolean;
  webRTCLeakProtection: boolean;
  adBlocking: boolean;
  malwareProtection: boolean;
}> {
  // In production, fetch real security features
  return {
    killSwitch: true,
    dnsLeakProtection: true,
    ipLeakProtection: true,
    webRTCLeakProtection: true,
    adBlocking: false,
    malwareProtection: false,
  };
}

/**
 * Get VPN privacy policy summary
 */
export async function getVPNPrivacyPolicy(providerId: string): Promise<{
  noLogs: boolean;
  jurisdiction: string;
  dataRetention: string;
  thirdPartySharing: boolean;
  gdprCompliant: boolean;
}> {
  // In production, fetch real privacy policies
  return {
    noLogs: true,
    jurisdiction: "Switzerland",
    dataRetention: "No data retention",
    thirdPartySharing: false,
    gdprCompliant: true,
  };
}

/**
 * Get VPN server locations
 */
export async function getVPNServerLocations(providerId: string): Promise<
  Array<{
    country: string;
    city: string;
    servers: number;
    load: number; // 0-100
  }>
> {
  // In production, fetch real server data
  const locations = [
    { country: "United States", city: "New York", servers: 50, load: 45 },
    { country: "United States", city: "Los Angeles", servers: 40, load: 38 },
    { country: "United Kingdom", city: "London", servers: 30, load: 52 },
    { country: "Germany", city: "Berlin", servers: 25, load: 41 },
    { country: "Netherlands", city: "Amsterdam", servers: 35, load: 48 },
    { country: "Japan", city: "Tokyo", servers: 20, load: 55 },
    { country: "Australia", city: "Sydney", servers: 15, load: 62 },
    { country: "Canada", city: "Toronto", servers: 25, load: 39 },
  ];

  return locations;
}
