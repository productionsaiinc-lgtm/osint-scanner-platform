import { describe, expect, it, vi, beforeEach } from "vitest";
import { exportRouter } from "./export-router";
import * as db from "./db";

// Mock the database functions
vi.mock("./db", () => ({
  getUserScans: vi.fn(),
  getScanHosts: vi.fn(),
  getScanDomains: vi.fn(),
  getScanProfiles: vi.fn(),
}));

const mockScan = {
  id: 1,
  userId: 1,
  scanType: "network",
  target: "192.168.1.1",
  status: "completed",
  analysisReport: "Test analysis",
  rawResults: null,
  threatAnalysis: null,
  createdAt: new Date("2026-04-08"),
  updatedAt: new Date("2026-04-08"),
};

const mockHosts = [
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

const mockDomains = [
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

const mockProfiles = [
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

const mockContext = {
  user: { id: 1, role: "user" as const },
  req: {} as any,
  res: {} as any,
};

describe("Export Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("exportJSON", () => {
    it("should export scan results as JSON", async () => {
      vi.mocked(db.getUserScans).mockResolvedValue([mockScan]);
      vi.mocked(db.getScanHosts).mockResolvedValue(mockHosts);
      vi.mocked(db.getScanDomains).mockResolvedValue(mockDomains);
      vi.mocked(db.getScanProfiles).mockResolvedValue(mockProfiles);

      const result = await exportRouter.createCaller(mockContext).exportJSON({
        scanId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("scan");
      expect(result.data).toHaveProperty("hosts");
      expect(result.data).toHaveProperty("domains");
      expect(result.data).toHaveProperty("profiles");
      expect(result.filename).toContain("scan-1-");
      expect(result.filename).toContain(".json");
    });

    it("should throw error if scan not found", async () => {
      vi.mocked(db.getUserScans).mockResolvedValue([]);

      await expect(
        exportRouter.createCaller(mockContext).exportJSON({
          scanId: 999,
        })
      ).rejects.toThrow("Scan not found");
    });

    it("should handle empty results", async () => {
      vi.mocked(db.getUserScans).mockResolvedValue([mockScan]);
      vi.mocked(db.getScanHosts).mockResolvedValue(null);
      vi.mocked(db.getScanDomains).mockResolvedValue(null);
      vi.mocked(db.getScanProfiles).mockResolvedValue(null);

      const result = await exportRouter.createCaller(mockContext).exportJSON({
        scanId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.data.hosts).toEqual([]);
      expect(result.data.domains).toEqual([]);
      expect(result.data.profiles).toEqual([]);
    });
  });

  describe("exportCSV", () => {
    it("should export scan results as CSV", async () => {
      vi.mocked(db.getUserScans).mockResolvedValue([mockScan]);
      vi.mocked(db.getScanHosts).mockResolvedValue(mockHosts);
      vi.mocked(db.getScanDomains).mockResolvedValue(mockDomains);
      vi.mocked(db.getScanProfiles).mockResolvedValue(mockProfiles);

      const result = await exportRouter.createCaller(mockContext).exportCSV({
        scanId: 1,
      });

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe("string");
      expect(result.data).toContain("OSINT Scan Results Export");
      expect(result.data).toContain("network");
      expect(result.data).toContain("192.168.1.1");
      expect(result.filename).toContain("scan-1-");
      expect(result.filename).toContain(".csv");
    });

    it("should throw error if scan not found", async () => {
      vi.mocked(db.getUserScans).mockResolvedValue([]);

      await expect(
        exportRouter.createCaller(mockContext).exportCSV({
          scanId: 999,
        })
      ).rejects.toThrow("Scan not found");
    });
  });

  describe("exportXLSX", () => {
    it("should export scan results as XLSX", async () => {
      vi.mocked(db.getUserScans).mockResolvedValue([mockScan]);
      vi.mocked(db.getScanHosts).mockResolvedValue(mockHosts);
      vi.mocked(db.getScanDomains).mockResolvedValue(mockDomains);
      vi.mocked(db.getScanProfiles).mockResolvedValue(mockProfiles);

      const result = await exportRouter.createCaller(mockContext).exportXLSX({
        scanId: 1,
      });

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe("string");
      expect(result.filename).toContain("scan-1-");
      expect(result.filename).toContain(".xlsx");
    });

    it("should throw error if scan not found", async () => {
      vi.mocked(db.getUserScans).mockResolvedValue([]);

      await expect(
        exportRouter.createCaller(mockContext).exportXLSX({
          scanId: 999,
        })
      ).rejects.toThrow("Scan not found");
    });

    it("should handle empty results", async () => {
      vi.mocked(db.getUserScans).mockResolvedValue([mockScan]);
      vi.mocked(db.getScanHosts).mockResolvedValue(null);
      vi.mocked(db.getScanDomains).mockResolvedValue(null);
      vi.mocked(db.getScanProfiles).mockResolvedValue(null);

      const result = await exportRouter.createCaller(mockContext).exportXLSX({
        scanId: 1,
      });

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe("string");
    });
  });

  describe("Export filename generation", () => {
    it("should generate unique filenames with timestamps", async () => {
      vi.mocked(db.getUserScans).mockResolvedValue([mockScan]);
      vi.mocked(db.getScanHosts).mockResolvedValue([]);
      vi.mocked(db.getScanDomains).mockResolvedValue([]);
      vi.mocked(db.getScanProfiles).mockResolvedValue([]);

      const result1 = await exportRouter.createCaller(mockContext).exportJSON({
        scanId: 1,
      });

      // Wait a bit to ensure timestamp differs
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result2 = await exportRouter.createCaller(mockContext).exportJSON({
        scanId: 1,
      });

      expect(result1.filename).not.toBe(result2.filename);
      expect(result1.filename).toMatch(/scan-1-\d+\.json/);
      expect(result2.filename).toMatch(/scan-1-\d+\.json/);
    });
  });
});
