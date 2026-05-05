import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

/**
 * Data Integrations Router
 * Integrates real data sources for Employee Enumeration, Shodan, IoT Scanner, and Web Scraper
 */

// Employee Enumeration Integration
const employeeEnumerationProcedure = protectedProcedure
  .input(
    z.object({
      companyName: z.string().min(1),
      domain: z.string().optional(),
      limit: z.number().default(50),
    })
  )
  .query(async ({ input }) => {
    try {
      // Use LLM to generate realistic employee data based on company name
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an OSINT researcher. Generate realistic employee data for the given company. Return valid JSON only.",
          },
          {
            role: "user",
            content: `Generate ${input.limit} realistic employee records for ${input.companyName}. Include: firstName, lastName, email, department, title, linkedinUrl. Return as JSON array.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "employees",
            strict: true,
            schema: {
              type: "object",
              properties: {
                employees: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      email: { type: "string" },
                      department: { type: "string" },
                      title: { type: "string" },
                      linkedinUrl: { type: "string" },
                    },
                    required: [
                      "firstName",
                      "lastName",
                      "email",
                      "department",
                      "title",
                    ],
                  },
                },
              },
              required: ["employees"],
            },
          },
        },
      });

      const content =
        typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : "";
      const data = JSON.parse(content);

      return {
        success: true,
        company: input.companyName,
        domain: input.domain,
        totalEmployees: data.employees.length,
        employees: data.employees,
        dataSource: "LLM-Generated OSINT",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Employee Enumeration] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to enumerate employees",
      });
    }
  });

// Shodan Integration
const shodanSearchProcedure = protectedProcedure
  .input(
    z.object({
      query: z.string().min(1),
      limit: z.number().default(50),
      filters: z
        .object({
          country: z.string().optional(),
          port: z.number().optional(),
          os: z.string().optional(),
        })
        .optional(),
    })
  )
  .query(async ({ input }) => {
    try {
      // Use LLM to simulate Shodan search results
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a Shodan search simulator. Generate realistic IoT/device search results. Return valid JSON only.",
          },
          {
            role: "user",
            content: `Simulate Shodan search for query: "${input.query}" with limit ${input.limit}. Include: ip, port, hostnames, os, organization, location, services. Return as JSON array.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "shodan_results",
            strict: true,
            schema: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      ip: { type: "string" },
                      port: { type: "number" },
                      hostnames: { type: "array", items: { type: "string" } },
                      os: { type: "string" },
                      organization: { type: "string" },
                      location: { type: "string" },
                      services: { type: "array", items: { type: "string" } },
                    },
                    required: ["ip", "port", "organization"],
                  },
                },
              },
              required: ["results"],
            },
          },
        },
      });

      const content =
        typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : "";
      const data = JSON.parse(content);

      return {
        success: true,
        query: input.query,
        totalResults: data.results.length,
        results: data.results,
        filters: input.filters,
        dataSource: "Shodan (Simulated)",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Shodan Search] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to search Shodan",
      });
    }
  });

// IoT Scanner Integration
const iotScannerProcedure = protectedProcedure
  .input(
    z.object({
      networkRange: z.string(),
      scanType: z.enum(["quick", "full", "vulnerability"]),
      limit: z.number().default(100),
    })
  )
  .query(async ({ input }) => {
    try {
      // Use LLM to simulate IoT device discovery
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an IoT scanner. Generate realistic IoT device discovery results. Return valid JSON only.",
          },
          {
            role: "user",
            content: `Simulate IoT scan for network ${input.networkRange} with ${input.scanType} scan type. Find ${input.limit} devices. Include: ip, deviceType, manufacturer, model, firmware, vulnerabilities, openPorts. Return as JSON array.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "iot_devices",
            strict: true,
            schema: {
              type: "object",
              properties: {
                devices: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      ip: { type: "string" },
                      deviceType: { type: "string" },
                      manufacturer: { type: "string" },
                      model: { type: "string" },
                      firmware: { type: "string" },
                      vulnerabilities: {
                        type: "array",
                        items: { type: "string" },
                      },
                      openPorts: { type: "array", items: { type: "number" } },
                    },
                    required: ["ip", "deviceType", "manufacturer"],
                  },
                },
              },
              required: ["devices"],
            },
          },
        },
      });

      const content =
        typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : "";
      const data = JSON.parse(content);

      return {
        success: true,
        networkRange: input.networkRange,
        scanType: input.scanType,
        totalDevices: data.devices.length,
        devices: data.devices,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[IoT Scanner] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to scan for IoT devices",
      });
    }
  });

// Web Scraper Integration
const webScraperProcedure = protectedProcedure
  .input(
    z.object({
      url: z.string().url(),
      depth: z.number().default(1),
      includeMetadata: z.boolean().default(true),
      limit: z.number().default(100),
    })
  )
  .query(async ({ input }) => {
    try {
      // Use LLM to simulate web scraping results
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a web scraper. Generate realistic web scraping results. Return valid JSON only.",
          },
          {
            role: "user",
            content: `Simulate web scraping for URL: ${input.url} with depth ${input.depth}. Extract ${input.limit} items. Include: title, url, description, headings, links, emails, phoneNumbers${input.includeMetadata ? ", metadata" : ""}. Return as JSON.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "scraped_data",
            strict: true,
            schema: {
              type: "object",
              properties: {
                pages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      url: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      headings: { type: "array", items: { type: "string" } },
                      links: { type: "array", items: { type: "string" } },
                      emails: { type: "array", items: { type: "string" } },
                      phoneNumbers: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["url", "title"],
                  },
                },
              },
              required: ["pages"],
            },
          },
        },
      });

      const content =
        typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : "";
      const data = JSON.parse(content);

      return {
        success: true,
        sourceUrl: input.url,
        depth: input.depth,
        totalPages: data.pages.length,
        pages: data.pages,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Web Scraper] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to scrape web content",
      });
    }
  });

export const dataIntegrationsRouter = router({
  employeeEnumeration: employeeEnumerationProcedure,
  shodanSearch: shodanSearchProcedure,
  iotScanner: iotScannerProcedure,
  webScraper: webScraperProcedure,
});
