import { describe, expect, it } from "vitest";
import {
  advancedPortScan,
  osFingerprinting,
  reverseDNSLookup,
  verifyEmail,
  asnLookup,
  searchCVE,
  detectWebTechnology,
  analyzeSecurityHeaders,
  searchGitHubRepos,
  searchWaybackMachine,
  searchCredentialLeaks,
} from "./osint";

describe("Advanced OSINT Functions", () => {
  it("should perform advanced port scan", async () => {
    const result = await advancedPortScan("192.168.1.1", { aggressive: true });
    expect(result.success).toBe(true);
    expect(result.host).toBe("192.168.1.1");
    expect(result.ports).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.summary.total).toBeGreaterThan(0);
  });

  it("should perform OS fingerprinting", async () => {
    const result = await osFingerprinting("192.168.1.1");
    expect(result.success).toBe(true);
    expect(result.osGuesses).toBeDefined();
    expect(result.osGuesses.length).toBeGreaterThan(0);
    expect(result.ttl).toBeDefined();
    expect(result.uptime).toBeDefined();
  });

  it("should perform reverse DNS lookup", async () => {
    const result = await reverseDNSLookup("8.8.8.8");
    expect(result.success).toBe(true);
    expect(result.hostname).toBeDefined();
    expect(result.ptr).toBeDefined();
  });

  it("should verify email address", async () => {
    const result = await verifyEmail("test@example.com");
    expect(result.success).toBe(true);
    expect(result.email).toBe("test@example.com");
    expect(result.valid).toBeDefined();
    expect(result.deliverable).toBeDefined();
    expect(result.mxRecords).toBeDefined();
  });

  it("should lookup ASN information", async () => {
    const result = await asnLookup("8.8.8.8");
    expect(result.success).toBe(true);
    expect(result.asn).toBeDefined();
    expect(result.organization).toBeDefined();
    expect(result.country).toBeDefined();
    expect(result.prefix).toBeDefined();
  });

  it("should search CVE database", async () => {
    const result = await searchCVE("SQL Injection");
    expect(result.success).toBe(true);
    expect(result.query).toBe("SQL Injection");
    expect(result.results).toBeDefined();
  });

  it("should detect web technologies", async () => {
    const result = await detectWebTechnology("example.com");
    expect(result.success).toBe(true);
    expect(result.domain).toBe("example.com");
    expect(result.technologies).toBeDefined();
    expect(result.headers).toBeDefined();
  });

  it("should analyze security headers", async () => {
    const result = await analyzeSecurityHeaders("example.com");
    expect(result.success).toBe(true);
    expect(result.domain).toBe("example.com");
    expect(result.headers).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.recommendations).toBeDefined();
  });

  it("should search GitHub repositories", async () => {
    const result = await searchGitHubRepos("osint");
    expect(result.success).toBe(true);
    expect(result.query).toBe("osint");
    expect(result.results).toBeDefined();
  });

  it("should search Wayback Machine", async () => {
    const result = await searchWaybackMachine("example.com");
    expect(result.success).toBe(true);
    expect(result.domain).toBe("example.com");
    expect(result.snapshots).toBeDefined();
    expect(result.totalSnapshots).toBeGreaterThan(0);
  });

  it("should search credential leaks", async () => {
    const result = await searchCredentialLeaks("test@example.com");
    expect(result.success).toBe(true);
    expect(result.email).toBe("test@example.com");
    expect(result.breached).toBeDefined();
    expect(result.recommendations).toBeDefined();
  });

  it("should handle errors gracefully", async () => {
    const result = await advancedPortScan("");
    expect(result).toBeDefined();
    // Should still return a result object even with empty input
    expect(typeof result).toBe("object");
  });

  it("should return consistent data structures", async () => {
    const portScanResult = await advancedPortScan("192.168.1.1");
    const osResult = await osFingerprinting("192.168.1.1");
    
    // All results should have success and timestamp
    expect(portScanResult).toHaveProperty("success");
    expect(portScanResult).toHaveProperty("timestamp");
    expect(osResult).toHaveProperty("success");
    expect(osResult).toHaveProperty("timestamp");
  });

  it("should provide valid timestamps", async () => {
    const result = await advancedPortScan("192.168.1.1");
    expect(result.timestamp).toBeDefined();
    const timestamp = new Date(result.timestamp);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });
});
