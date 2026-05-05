import { describe, it, expect, vi } from "vitest";
import { dataIntegrationsRouter } from "./data-integrations-router";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockImplementation(async (input: any) => {
    // Return appropriate mock data based on the prompt
    const content = input.messages[1]?.content || "";
    let responseData: any = {};

    if (content.includes("employee")) {
      responseData = {
        employees: [
          {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@company.com",
            department: "Engineering",
            title: "Senior Engineer",
          },
        ],
      };
    } else if (content.includes("Shodan")) {
      responseData = {
        results: [
          {
            ip: "192.168.1.1",
            port: 22,
            hostnames: ["example.com"],
            os: "Linux",
            organization: "Example Corp",
            location: "US",
            services: ["SSH"],
          },
        ],
      };
    } else if (content.includes("IoT")) {
      responseData = {
        devices: [
          {
            ip: "192.168.1.100",
            deviceType: "Smart Camera",
            manufacturer: "Hikvision",
            model: "DS-2CD2143G0-I",
            firmware: "8.4.0",
            vulnerabilities: ["CVE-2021-1234"],
            openPorts: [80, 443],
          },
        ],
      };
    } else if (content.includes("scraping")) {
      responseData = {
        pages: [
          {
            url: "https://example.com",
            title: "Example Page",
            description: "An example website",
            headings: ["Welcome", "About Us"],
            links: ["https://example.com/about", "https://example.com/contact"],
            emails: ["contact@example.com"],
            phoneNumbers: ["+1-555-0123"],
          },
        ],
      };
    }

    return {
      choices: [
        {
          message: {
            content: JSON.stringify(responseData),
          },
        },
      ],
    };
  }),
}));

describe("Data Integrations Router", () => {
  const mockContext = {
    user: { id: 1, role: "user" as const },
    req: {} as any,
    res: {} as any,
  };

  const caller = dataIntegrationsRouter.createCaller(mockContext);

  describe("employeeEnumeration", () => {
    it("should enumerate employees for a company", async () => {
      const result = await caller.employeeEnumeration({
        companyName: "Acme Corp",
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.company).toBe("Acme Corp");
      expect(Array.isArray(result.employees)).toBe(true);
      expect(result.employees.length).toBeGreaterThan(0);
    });
  });

  describe("shodanSearch", () => {
    it("should search Shodan for devices", async () => {
      const result = await caller.shodanSearch({
        query: "port:22 country:US",
        limit: 20,
      });

      expect(result.success).toBe(true);
      expect(result.query).toBe("port:22 country:US");
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });
  });

  describe("iotScanner", () => {
    it("should scan for IoT devices", async () => {
      const result = await caller.iotScanner({
        networkRange: "192.168.1.0/24",
        scanType: "quick",
      });

      expect(result.success).toBe(true);
      expect(result.networkRange).toBe("192.168.1.0/24");
      expect(result.scanType).toBe("quick");
      expect(Array.isArray(result.devices)).toBe(true);
      expect(result.devices.length).toBeGreaterThan(0);
    });
  });

  describe("webScraper", () => {
    it("should scrape web content", async () => {
      const result = await caller.webScraper({
        url: "https://example.com",
        depth: 1,
      });

      expect(result.success).toBe(true);
      expect(result.sourceUrl).toBe("https://example.com");
      expect(result.depth).toBe(1);
      expect(Array.isArray(result.pages)).toBe(true);
      expect(result.pages.length).toBeGreaterThan(0);
    });
  });
});
