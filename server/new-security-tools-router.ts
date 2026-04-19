/**
 * tRPC Router for New Security Analysis Tools
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  analyzeImage,
  findImagesByColor,
  detectObjects,
  extractTextFromImage,
} from "./reverse-image-search-service";
import {
  enumerateDNS,
  checkZoneTransfer,
  validateDNSSEC,
  reverseNSLookup,
  getDNSHistory,
} from "./dns-enumeration-service";
import {
  detectWAF,
  testWAFBypass,
  analyzeWAFRules,
} from "./waf-detection-service";
import {
  scanSubdomainTakeover,
  checkSubdomainTakeover,
  monitorSubdomainChanges,
  getSubdomainHistory,
} from "./subdomain-takeover-service";
import {
  performWHOISLookup,
  checkDomainExpiration,
  getPrivacyStatus,
  getWHOISHistory,
} from "./whois-lookup-service";
import {
  extractImageMetadata,
  extractDocumentMetadata,
  extractAudioMetadata,
  detectSensitiveMetadata,
  stripMetadata,
  compareMetadata,
  getMetadataTimeline,
} from "./metadata-extractor-service";

export const newSecurityToolsRouter = router({
  // Reverse Image Search
  reverseImageSearch: router({
    analyze: publicProcedure
      .input(z.object({ imageUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const result = await analyzeImage(input.imageUrl);
          return {
            success: true,
            data: result,
          };
        } catch (error) {
          throw new Error(`Reverse image search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    findByColor: publicProcedure
      .input(z.object({ color: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await findImagesByColor(input.color);
          return {
            success: true,
            images: result,
          };
        } catch (error) {
          throw new Error(`Color search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    detectObjects: publicProcedure
      .input(z.object({ imageUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const result = await detectObjects(input.imageUrl);
          return {
            success: true,
            objects: result,
          };
        } catch (error) {
          throw new Error(`Object detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    extractText: publicProcedure
      .input(z.object({ imageUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const result = await extractTextFromImage(input.imageUrl);
          return {
            success: true,
            text: result,
          };
        } catch (error) {
          throw new Error(`Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
  }),

  // DNS Enumeration
  dnsEnumeration: router({
    enumerate: publicProcedure
      .input(z.object({ domain: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await enumerateDNS(input.domain);
          return {
            success: true,
            data: result,
          };
        } catch (error) {
          throw new Error(`DNS enumeration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    checkZoneTransfer: publicProcedure
      .input(z.object({ domain: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await checkZoneTransfer(input.domain);
          return {
            success: true,
            vulnerable: result,
          };
        } catch (error) {
          throw new Error(`Zone transfer check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    validateDNSSEC: publicProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await validateDNSSEC(input.domain);
          return {
            success: true,
            dnssec: result,
          };
        } catch (error) {
          throw new Error(`DNSSEC validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    getHistory: publicProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await getDNSHistory(input.domain);
          return {
            success: true,
            history: result,
          };
        } catch (error) {
          throw new Error(`DNS history retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
  }),

  // WAF Detection
  wafDetection: router({
    detect: publicProcedure
      .input(z.object({ domain: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await detectWAF(input.domain);
          return {
            success: true,
            data: result,
          };
        } catch (error) {
          throw new Error(`WAF detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    testBypass: publicProcedure
      .input(z.object({ domain: z.string(), technique: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await testWAFBypass(input.domain, input.technique);
          return {
            success: true,
            result,
          };
        } catch (error) {
          throw new Error(`WAF bypass test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    analyzeRules: publicProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await analyzeWAFRules(input.domain);
          return {
            success: true,
            rules: result,
          };
        } catch (error) {
          throw new Error(`WAF rules analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
  }),

  // Subdomain Takeover Detection
  subdomainTakeover: router({
    scan: publicProcedure
      .input(z.object({ domain: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await scanSubdomainTakeover(input.domain);
          return {
            success: true,
            data: result,
          };
        } catch (error) {
          throw new Error(`Subdomain takeover scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    check: publicProcedure
      .input(z.object({ subdomain: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await checkSubdomainTakeover(input.subdomain);
          return {
            success: true,
            data: result,
          };
        } catch (error) {
          throw new Error(`Subdomain check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    monitor: publicProcedure
      .input(z.object({ subdomain: z.string(), interval: z.number().optional() }))
      .mutation(async ({ input }) => {
        try {
          const result = await monitorSubdomainChanges(input.subdomain, input.interval);
          return {
            success: true,
            monitoring: result,
          };
        } catch (error) {
          throw new Error(`Subdomain monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    getHistory: publicProcedure
      .input(z.object({ subdomain: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await getSubdomainHistory(input.subdomain);
          return {
            success: true,
            history: result,
          };
        } catch (error) {
          throw new Error(`Subdomain history retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
  }),

  // WHOIS Lookup
  whoislookup: router({
    lookup: publicProcedure
      .input(z.object({ domain: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await performWHOISLookup(input.domain);
          return {
            success: true,
            data: result,
          };
        } catch (error) {
          throw new Error(`WHOIS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    checkExpiration: publicProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await checkDomainExpiration(input.domain);
          return {
            success: true,
            expiration: result,
          };
        } catch (error) {
          throw new Error(`Expiration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    getPrivacy: publicProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await getPrivacyStatus(input.domain);
          return {
            success: true,
            privacy: result,
          };
        } catch (error) {
          throw new Error(`Privacy status retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    getHistory: publicProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await getWHOISHistory(input.domain);
          return {
            success: true,
            history: result,
          };
        } catch (error) {
          throw new Error(`WHOIS history retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
  }),

  // Metadata Extractor
  metadataExtractor: router({
    extractImage: publicProcedure
      .input(z.object({ imageUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const result = await extractImageMetadata(input.imageUrl);
          return {
            success: true,
            metadata: result,
          };
        } catch (error) {
          throw new Error(`Image metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    extractDocument: publicProcedure
      .input(z.object({ documentUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const result = await extractDocumentMetadata(input.documentUrl);
          return {
            success: true,
            metadata: result,
          };
        } catch (error) {
          throw new Error(`Document metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    extractAudio: publicProcedure
      .input(z.object({ audioUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const result = await extractAudioMetadata(input.audioUrl);
          return {
            success: true,
            metadata: result,
          };
        } catch (error) {
          throw new Error(`Audio metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    detectSensitive: publicProcedure
      .input(z.object({ metadata: z.record(z.string(), z.any()) }))
      .mutation(async ({ input }) => {
        try {
          const result = await detectSensitiveMetadata(input.metadata as any);
          return {
            success: true,
            analysis: result,
          };
        } catch (error) {
          throw new Error(`Sensitive metadata detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    strip: publicProcedure
      .input(z.object({ fileUrl: z.string().url() }))
      .mutation(async ({ input }) => {
        try {
          const result = await stripMetadata(input.fileUrl);
          return {
            success: true,
            result,
          };
        } catch (error) {
          throw new Error(`Metadata stripping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    compare: publicProcedure
      .input(z.object({ files: z.array(z.string().url()) }))
      .mutation(async ({ input }) => {
        try {
          const result = await compareMetadata(input.files);
          return {
            success: true,
            comparison: result,
          };
        } catch (error) {
          throw new Error(`Metadata comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    getTimeline: publicProcedure
      .input(z.object({ fileUrl: z.string().url() }))
      .query(async ({ input }) => {
        try {
          const result = await getMetadataTimeline(input.fileUrl);
          return {
            success: true,
            timeline: result,
          };
        } catch (error) {
          throw new Error(`Metadata timeline retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
  }),
});
