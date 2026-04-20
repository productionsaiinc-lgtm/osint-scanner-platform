import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  extractImageEXIF,
  analyzeDocumentMetadata,
  lookupFileHash,
  detectSQLInjection,
  scanXSSVulnerabilities,
  detectCSRFVulnerabilities,
  analyzeCookies,
  lookupMalwareHash,
  searchExploitDatabase,
  enumerateNetblock,
  getBGPRouteInfo,
  searchCertificateTransparency,
  advancedNmapScan,
} from "./osint";

export const advancedAnalysisRouter = router({
  // Metadata & File Analysis
  extractEXIF: protectedProcedure
    .input(z.object({ imageUrl: z.string().url() }))
    .query(async ({ input }) => {
      return await extractImageEXIF(input.imageUrl);
    }),

  analyzeDocumentMetadata: protectedProcedure
    .input(z.object({ documentUrl: z.string().url() }))
    .query(async ({ input }) => {
      return await analyzeDocumentMetadata(input.documentUrl);
    }),

  lookupFileHash: protectedProcedure
    .input(z.object({ hash: z.string(), hashType: z.enum(["md5", "sha1", "sha256"]).default("md5") }))
    .query(async ({ input }) => {
      return await lookupFileHash(input.hash, input.hashType);
    }),

  // Web Application Testing
  detectSQLInjection: protectedProcedure
    .input(z.object({ url: z.string().url(), parameters: z.array(z.string()) }))
    .query(async ({ input }) => {
      return await detectSQLInjection(input.url, input.parameters);
    }),

  scanXSS: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      return await scanXSSVulnerabilities(input.url);
    }),

  detectCSRF: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      return await detectCSRFVulnerabilities(input.url);
    }),

  analyzeCookies: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      return await analyzeCookies(input.url);
    }),

  // Vulnerability & Threat Intelligence
  lookupMalwareHash: protectedProcedure
    .input(z.object({ hash: z.string() }))
    .query(async ({ input }) => {
      return await lookupMalwareHash(input.hash);
    }),

  searchExploitDatabase: protectedProcedure
    .input(z.object({ cveId: z.string() }))
    .query(async ({ input }) => {
      return await searchExploitDatabase(input.cveId);
    }),

  // IP & ASN Intelligence
  enumerateNetblock: protectedProcedure
    .input(z.object({ asn: z.string() }))
    .query(async ({ input }) => {
      return await enumerateNetblock(input.asn);
    }),

  getBGPRouteInfo: protectedProcedure
    .input(z.object({ asn: z.string() }))
    .query(async ({ input }) => {
      return await getBGPRouteInfo(input.asn);
    }),

  // Domain & Web Reconnaissance
  searchCertificateTransparency: protectedProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ input }) => {
      return await searchCertificateTransparency(input.domain);
    }),

  // Network Reconnaissance
  advancedNmapScan: protectedProcedure
    .input(z.object({ host: z.string(), scanType: z.enum(["syn", "tcp", "udp"]).default("syn") }))
    .query(async ({ input }) => {
      return await advancedNmapScan(input.host, input.scanType);
    }),
});
