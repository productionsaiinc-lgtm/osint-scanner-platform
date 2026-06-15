import axios from "axios";

/**
 * Real Computer & Device Discovery using Shodan API
 * Requires: SHODAN_API_KEY environment variable
 * Returns: Real internet-connected computers, servers, and IoT devices
 */

export async function discoverComputersWithShodan(query: string, page: number = 1) {
  try {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey) {
      throw new Error("SHODAN_API_KEY not configured");
    }

    // Search for computers with specific criteria
    const searchQuery = query || "country:US";

    const response = await axios.get(
      `https://api.shodan.io/shodan/host/search?query=${encodeURIComponent(searchQuery)}&page=${page}&key=${apiKey}`,
      { timeout: 15000 }
    );

    if (!response.data.matches) {
      return {
        success: false,
        error: "No computers found",
      };
    }

    const computers = response.data.matches.map((match: any) => ({
      ip: match.ip_str,
      port: match.port,
      hostname: match.hostnames?.[0] || "Unknown",
      os: match.os || "Unknown",
      service: match.product || "Unknown",
      version: match.version || null,
      organization: match.org || "Unknown",
      country: match.country_name || "Unknown",
      city: match.city || "Unknown",
      latitude: match.latitude,
      longitude: match.longitude,
      lastSeen: match.timestamp,
      vulnerabilities: match.vulns ? Object.keys(match.vulns) : [],
      banner: match.data?.substring(0, 200) || null,
      isVirtual: detectVirtualMachine(match),
      provider: detectCloudProvider(match),
    }));

    return {
      success: true,
      data: {
        total: response.data.total,
        page: page,
        computers: computers,
        source: "Shodan API",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Shodan search failed",
    };
  }
}

/**
 * Get detailed computer information from Shodan
 */
export async function getComputerDetailsWithShodan(ip: string) {
  try {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey) {
      throw new Error("SHODAN_API_KEY not configured");
    }

    const response = await axios.get(
      `https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`,
      { timeout: 15000 }
    );

    if (!response.data) {
      return {
        success: false,
        error: "Computer not found",
      };
    }

    const data = response.data;

    return {
      success: true,
      data: {
        ip: ip,
        hostname: data.hostnames?.[0] || "Unknown",
        organization: data.org || "Unknown",
        country: data.country_name || "Unknown",
        city: data.city || "Unknown",
        latitude: data.latitude,
        longitude: data.longitude,
        ports: data.ports || [],
        services: data.data?.map((d: any) => ({
          port: d.port,
          service: d.product || "Unknown",
          version: d.version || null,
          banner: d.data?.substring(0, 100) || null,
        })) || [],
        os: data.os || "Unknown",
        vulnerabilities: data.vulns ? Object.keys(data.vulns) : [],
        isVirtual: detectVirtualMachine(data),
        provider: detectCloudProvider(data),
        lastSeen: data.last_update,
        source: "Shodan API",
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get computer details",
    };
  }
}

/**
 * Detect if computer is a virtual machine
 */
function detectVirtualMachine(data: any): boolean {
  const vmIndicators = [
    "vmware",
    "virtualbox",
    "hyper-v",
    "kvm",
    "xen",
    "qemu",
    "parallels",
    "docker",
    "container",
  ];

  const banner = (data.data || data.banner || "").toLowerCase();
  const os = (data.os || "").toLowerCase();
  const product = (data.product || "").toLowerCase();

  return vmIndicators.some(
    (indicator) =>
      banner.includes(indicator) || os.includes(indicator) || product.includes(indicator)
  );
}

/**
 * Detect cloud provider (AWS, Azure, GCP, etc.)
 */
function detectCloudProvider(data: any): string {
  const org = (data.org || "").toUpperCase();
  const ip = data.ip_str || "";

  if (org.includes("AMAZON") || org.includes("AWS")) return "AWS";
  if (org.includes("MICROSOFT") || org.includes("AZURE")) return "Azure";
  if (org.includes("GOOGLE") || org.includes("GCP")) return "Google Cloud";
  if (org.includes("DIGITALOCEAN")) return "DigitalOcean";
  if (org.includes("LINODE")) return "Linode";
  if (org.includes("VULTR")) return "Vultr";
  if (org.includes("HETZNER")) return "Hetzner";
  if (org.includes("OVHCLOUD")) return "OVH";

  return "Unknown";
}

/**
 * Search for specific services (SSH, RDP, HTTP, etc.)
 */
export async function findComputersWithService(service: string, page: number = 1) {
  try {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey) {
      throw new Error("SHODAN_API_KEY not configured");
    }

    // Common service queries
    const serviceQueries: Record<string, string> = {
      ssh: "port:22",
      rdp: "port:3389",
      http: "port:80",
      https: "port:443",
      ftp: "port:21",
      smtp: "port:25",
      dns: "port:53",
      mysql: "port:3306",
      postgres: "port:5432",
      mongodb: "port:27017",
      redis: "port:6379",
      elasticsearch: "port:9200",
      jenkins: "port:8080",
      tomcat: "port:8080",
    };

    const query = serviceQueries[service.toLowerCase()] || `port:${service}`;

    return await discoverComputersWithShodan(query, page);
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Service search failed",
    };
  }
}
