/**
 * OSINT and Network Scanning Utilities
 * Integrates with various free APIs for reconnaissance
 */

import axios from "axios";

// IP Geolocation using ip-api.com (free, no key required)
export async function getIPGeolocation(ip: string) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as`);
    
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
      };
    } else {
      return { success: false, error: "IP lookup failed" };
    }
  } catch (error) {
    console.error("IP geolocation error:", error);
    return { success: false, error: "Failed to lookup IP" };
  }
}

// Simulate port scanning (real scanning would require backend tools)
export async function simulatePortScan(host: string, ports: number[] = [22, 80, 443, 3306, 5432, 8080, 8443]) {
  try {
    // Simulate port scan with random results
    const results = ports.map(port => ({
      port,
      status: Math.random() > 0.6 ? "open" : "closed",
      service: getServiceName(port),
      protocol: "tcp",
    }));

    return {
      success: true,
      host,
      timestamp: new Date().toISOString(),
      ports: results,
      openPorts: results.filter(p => p.status === "open").map(p => p.port),
    };
  } catch (error) {
    console.error("Port scan error:", error);
    return { success: false, error: "Port scan failed" };
  }
}

// Simulate ping/traceroute
export async function simulatePing(host: string) {
  try {
    const times = Array.from({ length: 4 }, () => Math.random() * 100 + 10);
    
    return {
      success: true,
      host,
      timestamp: new Date().toISOString(),
      packets: {
        sent: 4,
        received: 4,
        lost: 0,
      },
      times: times.map(t => t.toFixed(2)),
      min: Math.min(...times).toFixed(2),
      max: Math.max(...times).toFixed(2),
      avg: (times.reduce((a, b) => a + b) / times.length).toFixed(2),
    };
  } catch (error) {
    console.error("Ping error:", error);
    return { success: false, error: "Ping failed" };
  }
}

// Simulate traceroute
export async function simulateTraceroute(host: string) {
  try {
    const hops = Array.from({ length: Math.floor(Math.random() * 8) + 5 }, (_, i) => ({
      hop: i + 1,
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      hostname: `router-${i + 1}.example.com`,
      time: (Math.random() * 50 + 5).toFixed(2),
    }));

    return {
      success: true,
      host,
      timestamp: new Date().toISOString(),
      hops,
    };
  } catch (error) {
    console.error("Traceroute error:", error);
    return { success: false, error: "Traceroute failed" };
  }
}

// DNS lookup simulation
export async function simulateDNSLookup(domain: string) {
  try {
    return {
      success: true,
      domain,
      timestamp: new Date().toISOString(),
      records: {
        A: [`93.184.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`],
        MX: [
          { priority: 10, exchange: `mail1.${domain}` },
          { priority: 20, exchange: `mail2.${domain}` },
        ],
        NS: [
          `ns1.${domain}`,
          `ns2.${domain}`,
          `ns3.${domain}`,
        ],
        TXT: ["v=spf1 include:_spf.google.com ~all"],
        CNAME: [],
      },
    };
  } catch (error) {
    console.error("DNS lookup error:", error);
    return { success: false, error: "DNS lookup failed" };
  }
}

// Simulate WHOIS lookup
export async function simulateWHOISLookup(domain: string) {
  try {
    return {
      success: true,
      domain,
      timestamp: new Date().toISOString(),
      registrar: "Example Registrar Inc.",
      registrationDate: "2015-03-15",
      expirationDate: "2026-03-15",
      registrant: {
        name: "Domain Owner",
        organization: "Example Organization",
        country: "US",
      },
      nameservers: [
        `ns1.${domain}`,
        `ns2.${domain}`,
      ],
      status: ["clientTransferProhibited"],
    };
  } catch (error) {
    console.error("WHOIS lookup error:", error);
    return { success: false, error: "WHOIS lookup failed" };
  }
}

// Simulate subdomain enumeration
export async function simulateSubdomainEnum(domain: string) {
  try {
    const commonSubdomains = [
      "www",
      "mail",
      "ftp",
      "api",
      "admin",
      "blog",
      "shop",
      "cdn",
      "dev",
      "staging",
    ];

    const foundSubdomains = commonSubdomains.filter(() => Math.random() > 0.3).map(sub => ({
      subdomain: `${sub}.${domain}`,
      ip: `93.184.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    }));

    return {
      success: true,
      domain,
      timestamp: new Date().toISOString(),
      subdomains: foundSubdomains,
      count: foundSubdomains.length,
    };
  } catch (error) {
    console.error("Subdomain enumeration error:", error);
    return { success: false, error: "Subdomain enumeration failed" };
  }
}

// Simulate SSL certificate lookup
export async function simulateSSLLookup(domain: string) {
  try {
    const issueDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    return {
      success: true,
      domain,
      timestamp: new Date().toISOString(),
      certificate: {
        subject: `CN=${domain}`,
        issuer: "Let's Encrypt Authority X3",
        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        fingerprint: "AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90",
        keySize: 2048,
        signatureAlgorithm: "sha256WithRSAEncryption",
        altNames: [domain, `www.${domain}`],
      },
    };
  } catch (error) {
    console.error("SSL lookup error:", error);
    return { success: false, error: "SSL lookup failed" };
  }
}

// Simulate social media username search
export async function simulateSocialMediaSearch(username: string) {
  try {
    const platforms = ["twitter", "github", "linkedin", "instagram", "facebook", "reddit", "tiktok"];
    
    const results = platforms
      .filter(() => Math.random() > 0.4)
      .map(platform => ({
        platform,
        username,
        found: true,
        profileUrl: `https://${platform}.com/${username}`,
        displayName: `${username} (${platform})`,
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 5000),
        bio: `User profile on ${platform}`,
      }));

    return {
      success: true,
      username,
      timestamp: new Date().toISOString(),
      results,
      platformsFound: results.length,
    };
  } catch (error) {
    console.error("Social media search error:", error);
    return { success: false, error: "Social media search failed" };
  }
}

// Helper function to get service names for common ports
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
