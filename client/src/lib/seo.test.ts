/**
 * SEO Helper Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { updateMetaTags, pageMetadata } from "./seo";

describe("SEO Helper Functions", () => {
  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = "";
  });

  afterEach(() => {
    // Clean up after each test
    document.head.innerHTML = "";
  });

  describe("updateMetaTags", () => {
    it("should update document title", () => {
      updateMetaTags({
        title: "Test Page Title",
        description: "Test description",
      });

      expect(document.title).toBe("Test Page Title");
    });

    it("should create and update description meta tag", () => {
      updateMetaTags({
        title: "Test",
        description: "This is a test description",
      });

      const descMeta = document.querySelector('meta[name="description"]');
      expect(descMeta).toBeTruthy();
      expect(descMeta?.getAttribute("content")).toBe("This is a test description");
    });

    it("should create and update keywords meta tag", () => {
      updateMetaTags({
        title: "Test",
        description: "Test",
        keywords: ["keyword1", "keyword2", "keyword3"],
      });

      const keywordsMeta = document.querySelector('meta[name="keywords"]');
      expect(keywordsMeta).toBeTruthy();
      expect(keywordsMeta?.getAttribute("content")).toBe("keyword1, keyword2, keyword3");
    });

    it("should set robots meta tag to index, follow by default", () => {
      updateMetaTags({
        title: "Test",
        description: "Test",
      });

      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute("content")).toBe("index, follow");
    });

    it("should set robots meta tag to noindex, follow when noindex is true", () => {
      updateMetaTags({
        title: "Test",
        description: "Test",
        noindex: true,
      });

      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute("content")).toBe("noindex, follow");
    });

    it("should set robots meta tag to index, nofollow when nofollow is true", () => {
      updateMetaTags({
        title: "Test",
        description: "Test",
        nofollow: true,
      });

      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute("content")).toBe("index, nofollow");
    });

    it("should update Open Graph tags", () => {
      updateMetaTags({
        title: "Test",
        description: "Test description",
        ogTitle: "OG Title",
        ogDescription: "OG Description",
        ogUrl: "https://example.com",
      });

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');

      expect(ogTitle?.getAttribute("content")).toBe("OG Title");
      expect(ogDesc?.getAttribute("content")).toBe("OG Description");
      expect(ogUrl?.getAttribute("content")).toBe("https://example.com");
    });

    it("should update Twitter Card tags", () => {
      updateMetaTags({
        title: "Test",
        description: "Test description",
        ogTitle: "Twitter Title",
        ogDescription: "Twitter Description",
        twitterCard: "summary_large_image",
      });

      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');

      expect(twitterCard?.getAttribute("content")).toBe("summary_large_image");
      expect(twitterTitle?.getAttribute("content")).toBe("Twitter Title");
      expect(twitterDesc?.getAttribute("content")).toBe("Twitter Description");
    });

    it("should update canonical link", () => {
      updateMetaTags({
        title: "Test",
        description: "Test",
        canonical: "https://example.com/canonical",
      });

      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute("href")).toBe("https://example.com/canonical");
    });

    it("should handle multiple updates", () => {
      updateMetaTags({
        title: "First Title",
        description: "First description",
      });

      expect(document.title).toBe("First Title");

      updateMetaTags({
        title: "Second Title",
        description: "Second description",
      });

      expect(document.title).toBe("Second Title");
      const descMeta = document.querySelector('meta[name="description"]');
      expect(descMeta?.getAttribute("content")).toBe("Second description");
    });
  });

  describe("pageMetadata", () => {
    it("should have home page metadata", () => {
      expect(pageMetadata.home).toBeDefined();
      expect(pageMetadata.home.title).toContain("OSINT");
      expect(pageMetadata.home.description).toBeTruthy();
      expect(pageMetadata.home.keywords).toBeDefined();
      expect(Array.isArray(pageMetadata.home.keywords)).toBe(true);
    });

    it("should have pricing page metadata", () => {
      expect(pageMetadata.pricing).toBeDefined();
      expect(pageMetadata.pricing.title).toContain("Pricing");
      expect(pageMetadata.pricing.description).toBeTruthy();
      expect(pageMetadata.pricing.keywords).toBeDefined();
    });

    it("should have network scanner metadata", () => {
      expect(pageMetadata.networkScanner).toBeDefined();
      expect(pageMetadata.networkScanner.title).toContain("Network Scanner");
      expect(pageMetadata.networkScanner.description).toBeTruthy();
    });

    it("should have social OSINT metadata", () => {
      expect(pageMetadata.socialOSINT).toBeDefined();
      expect(pageMetadata.socialOSINT.title).toContain("Social");
      expect(pageMetadata.socialOSINT.description).toBeTruthy();
    });

    it("should have SIM swap metadata", () => {
      expect(pageMetadata.simSwap).toBeDefined();
      expect(pageMetadata.simSwap.title).toContain("SIM Swap");
      expect(pageMetadata.simSwap.description).toBeTruthy();
    });

    it("should have phone lookup metadata", () => {
      expect(pageMetadata.phoneLookup).toBeDefined();
      expect(pageMetadata.phoneLookup.title).toContain("Phone Lookup");
      expect(pageMetadata.phoneLookup.description).toBeTruthy();
    });

    it("should have IMEI checker metadata", () => {
      expect(pageMetadata.imeiChecker).toBeDefined();
      expect(pageMetadata.imeiChecker.title).toContain("IMEI");
      expect(pageMetadata.imeiChecker.description).toBeTruthy();
    });

    it("should have dashboard metadata with noindex", () => {
      expect(pageMetadata.dashboard).toBeDefined();
      expect(pageMetadata.dashboard.noindex).toBe(true);
    });

    it("all metadata should have title and description", () => {
      Object.entries(pageMetadata).forEach(([key, metadata]) => {
        expect(metadata.title).toBeTruthy();
        expect(metadata.description).toBeTruthy();
      });
    });

    it("all metadata descriptions should be reasonable length", () => {
      Object.entries(pageMetadata).forEach(([key, metadata]) => {
        const desc = metadata.description;
        expect(desc.length).toBeGreaterThan(20);
        expect(desc.length).toBeLessThan(300);
      });
    });
  });

  describe("Meta tag requirements", () => {
    it("should have description between 50 and 160 characters for home page", () => {
      const desc = pageMetadata.home.description;
      expect(desc.length).toBeGreaterThanOrEqual(50);
      expect(desc.length).toBeLessThanOrEqual(160);
    });

    it("should have description between 50 and 160 characters for pricing page", () => {
      const desc = pageMetadata.pricing.description;
      expect(desc.length).toBeGreaterThanOrEqual(50);
      expect(desc.length).toBeLessThanOrEqual(160);
    });

    it("should have keywords for home page", () => {
      expect(pageMetadata.home.keywords).toBeDefined();
      expect(pageMetadata.home.keywords!.length).toBeGreaterThan(0);
    });

    it("should have keywords for pricing page", () => {
      expect(pageMetadata.pricing.keywords).toBeDefined();
      expect(pageMetadata.pricing.keywords!.length).toBeGreaterThan(0);
    });
  });
});
