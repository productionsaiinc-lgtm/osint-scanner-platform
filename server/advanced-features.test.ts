import { describe, it, expect } from "vitest";
import {
  searchPerson,
  detectEmailFormat,
  findPersonEmails,
  analyzePhoneNumber,
  reversePhoneLookup,
  checkEmailBreach,
  generateOrganizationEmailPatterns,
} from "./person-search-service";
import {
  parseRobotsTxt,
  parseSitemap,
  enumerateDirectories,
  crawlWebsite,
  analyzePageSecurity,
} from "./web-crawler-service";

describe("Person Search Service", () => {
  it("should search for person by name", async () => {
    const results = await searchPerson("John Doe", "New York");
    expect(results).toHaveLength(3);
    expect(results[0]).toHaveProperty("name");
    expect(results[0]).toHaveProperty("email");
    expect(results[0]).toHaveProperty("social_profiles");
  });

  it("should detect email format patterns", async () => {
    const result = await detectEmailFormat("john.doe@example.com");
    expect(result).toHaveProperty("format_pattern");
    expect(result).toHaveProperty("format_type");
    expect(result.email).toBe("john.doe@example.com");
  });

  it("should find emails associated with person", async () => {
    const result = await findPersonEmails("Jane Smith");
    expect(result).toHaveProperty("emails");
    expect(result.emails).toHaveLength(5);
    expect(result).toHaveProperty("email_patterns");
  });

  it("should analyze phone number", async () => {
    const result = await analyzePhoneNumber("+1-555-123-4567");
    expect(result).toHaveProperty("country");
    expect(result).toHaveProperty("carrier");
    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("is_valid");
  });

  it("should perform reverse phone lookup", async () => {
    const result = await reversePhoneLookup("+1-555-123-4567");
    expect(result).toHaveProperty("phone");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("location");
    expect(result).toHaveProperty("is_spam");
  });

  it("should check email breach status", async () => {
    const result = await checkEmailBreach("test@example.com");
    expect(result).toHaveProperty("is_breached");
    expect(result).toHaveProperty("breaches");
    expect(result).toHaveProperty("password_exposed");
    expect(result).toHaveProperty("recommendations");
  });

  it("should generate organization email patterns", async () => {
    const patterns = await generateOrganizationEmailPatterns("Example Corp");
    expect(patterns).toHaveLength(6);
    expect(patterns[0]).toContain("examplecorp.com");
  });
});

describe("Web Crawler Service", () => {
  it("should parse robots.txt", async () => {
    const result = await parseRobotsTxt("example.com");
    expect(result).toHaveLength(4);
    expect(result[0]).toHaveProperty("user_agent");
    expect(result[0]).toHaveProperty("rules");
  });

  it("should parse sitemap", async () => {
    const result = await parseSitemap("example.com");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("url");
    expect(result[0]).toHaveProperty("change_frequency");
  });

  it("should enumerate directories", async () => {
    const result = await enumerateDirectories("example.com");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should crawl website", async () => {
    const result = await crawlWebsite("https://example.com", 10);
    expect(result).toHaveProperty("domain");
    expect(result).toHaveProperty("pages_crawled");
    expect(result).toHaveProperty("unique_urls");
    expect(result).toHaveProperty("forms_found");
    expect(result.pages_crawled).toBeGreaterThan(0);
  });

  it("should analyze page security", async () => {
    const result = await analyzePageSecurity("https://example.com");
    expect(result).toHaveProperty("security_headers");
    expect(result).toHaveProperty("missing_headers");
    expect(result).toHaveProperty("security_issues");
    expect(result).toHaveProperty("recommendations");
  });

  it("should detect security headers", async () => {
    const result = await analyzePageSecurity("https://example.com");
    expect(result.security_headers).toHaveProperty("X-Content-Type-Options");
    expect(result.security_headers).toHaveProperty("X-Frame-Options");
  });

  it("should identify forms in crawled pages", async () => {
    const result = await crawlWebsite("https://example.com", 5);
    expect(result.forms_found).toBeDefined();
    expect(Array.isArray(result.forms_found)).toBe(true);
  });

  it("should categorize links correctly", async () => {
    const result = await crawlWebsite("https://example.com", 5);
    expect(result.internal_links).toBeDefined();
    expect(result.external_links).toBeDefined();
    expect(Array.isArray(result.internal_links)).toBe(true);
    expect(Array.isArray(result.external_links)).toBe(true);
  });
});
