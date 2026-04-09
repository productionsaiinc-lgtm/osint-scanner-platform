/**
 * tRPC Router for VPN Service
 * Provides VPN provider information, IP detection, and connection testing
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  getAllVPNProviders,
  getVPNProvider,
  getRecommendedVPNProviders,
  getCurrentUserIP,
  checkVPNStatus,
  getVPNConnectionSpeed,
  getVPNComparison,
  getVPNSecurityFeatures,
  getVPNPrivacyPolicy,
  getVPNServerLocations,
} from "./vpn-db";

export const vpnRouter = router({
  // Get all VPN providers
  providers: publicProcedure.query(async () => {
    return await getAllVPNProviders();
  }),

  // Get specific VPN provider
  getProvider: publicProcedure
    .input(z.object({ providerId: z.string() }))
    .query(async ({ input }) => {
      const provider = await getVPNProvider(input.providerId);
      if (!provider) {
        throw new Error("VPN provider not found");
      }
      return provider;
    }),

  // Get recommended providers based on use case
  getRecommended: publicProcedure
    .input(
      z.object({
        useCase: z.enum(["streaming", "privacy", "budget", "security", "general"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return await getRecommendedVPNProviders(input.useCase || "general");
    }),

  // Get current user's IP information
  getCurrentIP: publicProcedure.query(async () => {
    return await getCurrentUserIP();
  }),

  // Check if current IP is from VPN
  checkVPNStatus: publicProcedure.query(async () => {
    return await checkVPNStatus("0.0.0.0");
  }),

  // Get VPN connection speed for provider
  getConnectionSpeed: publicProcedure
    .input(z.object({ providerId: z.string() }))
    .query(async ({ input }) => {
      return await getVPNConnectionSpeed(input.providerId);
    }),

  // Compare multiple VPN providers
  compareProviders: publicProcedure
    .input(z.object({ providerIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      return await getVPNComparison(input.providerIds);
    }),

  // Get security features for provider
  getSecurityFeatures: publicProcedure
    .input(z.object({ providerId: z.string() }))
    .query(async ({ input }) => {
      return await getVPNSecurityFeatures(input.providerId);
    }),

  // Get privacy policy for provider
  getPrivacyPolicy: publicProcedure
    .input(z.object({ providerId: z.string() }))
    .query(async ({ input }) => {
      return await getVPNPrivacyPolicy(input.providerId);
    }),

  // Get server locations for provider
  getServerLocations: publicProcedure
    .input(z.object({ providerId: z.string() }))
    .query(async ({ input }) => {
      return await getVPNServerLocations(input.providerId);
    }),
});
