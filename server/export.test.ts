import { describe, expect, it } from "vitest";
import {
  exportScanResultsJSON,
  exportScanResultsCSV,
  generatePDFReport,
  generateXLSXReport,
} from "./export";
import type { Scan, DiscoveredHost, DomainRecord, SocialMediaProfile } from "../drizzle/schema";

const mockScan: Scan = {
  id: 1,
  userId: 1,
  scanType: "network",
  target: "192.168.1.1",
  status: "completed",
  analysisReport: "Test analysis",
  createdAt: new Date("2026-04-08"),
  updatedAt: new Date("2026-04-08"),
};

const mockHosts: DiscoveredHost[] = [
  {
    id: 1,
    scanId: 1,
    ipAddress: "192.168.1.100",
    hostname: "test-host.local",
    openPorts: "22,80,443",
    services: "SSH,HTTP,HTTPS",
    geolocation: '{"city":"New York","country":"USA"}',
    createdAt: new Date(),
  },
];

const mockDomains: DomainRecord[] = [
  {
    id: 1,
    scanId: 1,
    domain: "example.com",
    registrar: "GoDaddy",
    registrationDate: "2020-01-01",
    expirationDate: "2025-01-01",
    nameservers: "ns1.example.com,ns2.example.com",
    createdAt: new Date(),
  },
];

const mockProfiles: SocialMediaProfile[] = [
  {
    id: 1,
    scanId: 1,
    username: "testuser",
    platform: "Twitter",
    followers: 1000,
    verified: false,
    createdAt: new Date(),
  },
];

describe("Export Functions", () => {
  it("should export scan results as JSON", async () => {
    const result = await exportScanResultsJSON(
      mockScan,
      mockHosts,
      mockDomains,
      mockProfiles
    );

    expect(result).toHaveProperty("scan");
    expect(result).toHaveProperty("hosts");
    expect(result).toHaveProperty("domains");
    expect(result).toHaveProperty("profiles");
    expect(result).toHaveProperty("exportedAt");
    expect(result.scan.type).toBe("network");
    expect(result.scan.target).toBe("192.168.1.1");
    expect(result.hosts).toHaveLength(1);
    expect(result.domains).toHaveLength(1);
    expect(result.profiles).toHaveLength(1);
  });

  it("should export scan results as CSV", async () => {
    const result = await exportScanResultsCSV(
      mockScan,
      mockHosts,
      mockDomains,
      mockProfiles
    );

    expect(typeof result).toBe("string");
    expect(result).toContain("OSINT Scan Results Export");
    expect(result).toContain("Scan Type: network");
    expect(result).toContain("Target: 192.168.1.1");
    expect(result).toContain("DISCOVERED HOSTS");
    expect(result).toContain("192.168.1.100");
    expect(result).toContain("DOMAIN RECORDS");
    expect(result).toContain("example.com");
    expect(result).toContain("SOCIAL PROFILES");
    expect(result).toContain("testuser");
  });

  it("should generate PDF report metadata", async () => {
    const analysis = "Test vulnerability analysis";
    const result = await generatePDFReport(
      mockScan,
      mockHosts,
      mockDomains,
      mockProfiles,
      analysis
    );

    expect(result).toHaveProperty("title", "OSINT Scan Report");
    expect(result).toHaveProperty("scanType", "network");
    expect(result).toHaveProperty("target", "192.168.1.1");
    expect(result).toHaveProperty("status", "completed");
    expect(result).toHaveProperty("hostsCount", 1);
    expect(result).toHaveProperty("domainsCount", 1);
    expect(result).toHaveProperty("profilesCount", 1);
    expect(result).toHaveProperty("analysis", analysis);
    expect(result).toHaveProperty("generatedAt");
  });

  it("should generate XLSX report structure", async () => {
    const result = await generateXLSXReport(
      mockScan,
      mockHosts,
      mockDomains,
      mockProfiles
    );

    expect(result).toHaveProperty("sheets");
    expect(result.sheets).toHaveLength(4);

    // Check Summary sheet
    const summarySheet = result.sheets[0];
    expect(summarySheet.name).toBe("Summary");
    expect(summarySheet.data).toContainEqual(["Scan Type", "network"]);
    expect(summarySheet.data).toContainEqual(["Target", "192.168.1.1"]);
    expect(summarySheet.data).toContainEqual(["Hosts Found", 1]);

    // Check Hosts sheet
    const hostsSheet = result.sheets[1];
    expect(hostsSheet.name).toBe("Hosts");
    expect(hostsSheet.data[0]).toEqual(["IP", "Hostname", "Open Ports", "Services"]);

    // Check Domains sheet
    const domainsSheet = result.sheets[2];
    expect(domainsSheet.name).toBe("Domains");
    expect(domainsSheet.data[0]).toEqual([
      "Domain",
      "Registrar",
      "Registration Date",
      "Expiration Date",
    ]);

    // Check Profiles sheet
    const profilesSheet = result.sheets[3];
    expect(profilesSheet.name).toBe("Profiles");
    expect(profilesSheet.data[0]).toEqual(["Username", "Platform", "Followers"]);
  });

  it("should handle empty results in CSV export", async () => {
    const result = await exportScanResultsCSV(mockScan, [], [], []);

    expect(result).toContain("OSINT Scan Results Export");
    expect(result).toContain("Scan Type: network");
    expect(result).not.toContain("DISCOVERED HOSTS");
    expect(result).not.toContain("DOMAIN RECORDS");
    expect(result).not.toContain("SOCIAL PROFILES");
  });

  it("should handle empty results in XLSX export", async () => {
    const result = await generateXLSXReport(mockScan, [], [], []);

    expect(result.sheets).toHaveLength(4);
    const hostsSheet = result.sheets[1];
    expect(hostsSheet.data).toHaveLength(1); // Only header row
  });

  it("should use default analysis text in PDF report when not provided", async () => {
    const result = await generatePDFReport(
      mockScan,
      mockHosts,
      mockDomains,
      mockProfiles
    );

    expect(result.analysis).toBe("No analysis available");
  });
});
