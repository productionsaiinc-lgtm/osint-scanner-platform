import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createShortenedUrl, getShortenedUrl, getUserShortenedUrls, updateShortenedUrl, deleteShortenedUrl } from "./db";
import crypto from "crypto";

// Generate a short code for URL
function generateShortCode(length: number = 6): string {
  return crypto.randomBytes(length).toString("hex").substring(0, length);
}

export const urlShortenerRouter = router({
  // Create a shortened URL
  create: protectedProcedure
    .input(
      z.object({
        originalUrl: z.string().url(),
        customAlias: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const shortCode = input.customAlias || generateShortCode();

      const url = await createShortenedUrl({
        userId: ctx.user.id,
        shortCode,
        originalUrl: input.originalUrl,
        customAlias: input.customAlias || null,
        title: input.title || null,
        description: input.description || null,
        expiresAt: input.expiresAt || null,
      });

      if (!url) {
        throw new Error("Failed to create shortened URL");
      }

      return {
        id: url.id,
        shortCode: url.shortCode,
        shortUrl: `https://osintscan.short/${url.shortCode}`,
        originalUrl: url.originalUrl,
      };
    }),

  // Get all shortened URLs for user
  list: protectedProcedure.query(async ({ ctx }) => {
    const urls = await getUserShortenedUrls(ctx.user.id);
    return urls.map((url) => ({
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      customAlias: url.customAlias,
      title: url.title,
      description: url.description,
      clickCount: url.clickCount,
      isActive: url.isActive,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
    }));
  }),

  // Get URL details
  get: protectedProcedure
    .input(z.object({ shortCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const url = await getShortenedUrl(input.shortCode);
      if (!url || url.userId !== ctx.user.id) {
        throw new Error("URL not found");
      }
      return url;
    }),

  // Delete shortened URL
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteShortenedUrl(input.id);
      return { success: true };
    }),

  // Update shortened URL
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, any> = {};

      if (input.title !== undefined) {
        updates.title = input.title;
      }
      if (input.description !== undefined) {
        updates.description = input.description;
      }
      if (input.isActive !== undefined) {
        updates.isActive = input.isActive;
      }

      if (Object.keys(updates).length === 0) {
        return { success: false };
      }

      await updateShortenedUrl(input.id, updates);
      return { success: true };
    }),
});
