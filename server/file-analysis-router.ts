import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { fileAnalyses } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { analyzeWithVirusTotal } from "./real-api-integrations";
import { ErrorHandler } from "./error-handler";

export const fileAnalysisRouter = router({
  // Start file analysis
  analyzeFile: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileHash: z.string(),
      fileSize: z.number(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if file has already been analyzed by THIS USER
      const [existing] = await db
        .select()
        .from(fileAnalyses)
        .where(
          and(
            eq(fileAnalyses.fileHash, input.fileHash),
            eq(fileAnalyses.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existing) {
        return existing;
      }

      // Create new analysis record
      const [result] = await db.insert(fileAnalyses).values({
        userId: ctx.user.id,
        fileName: input.fileName,
        fileHash: input.fileHash,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        status: "pending",
      });

      const analysisId = result.insertId;

      // Start VirusTotal analysis in background
      // In a real app, this would be a background job
      try {
        const vtResult = await analyzeWithVirusTotal(input.fileHash, process.env.VIRUSTOTAL_API_KEY);
        
        if (vtResult.success) {
          const stats = vtResult.lastAnalysisStats;
          const threatLevel = stats && stats.malicious > 0 ? "malicious" : 
                             stats && stats.suspicious > 0 ? "suspicious" : "clean";
          
          await db.update(fileAnalyses)
            .set({
              status: "completed",
              threatLevel: threatLevel as any,
              detectionCount: stats?.malicious || 0,
              totalEngines: (stats?.malicious || 0) + (stats?.clean || 0) + (stats?.suspicious || 0) + (stats?.undetected || 0),
              analysisResults: JSON.stringify(vtResult),
              virusTotalScanId: vtResult.hash,
            })
            .where(eq(fileAnalyses.id, analysisId));
        } else {
          await db.update(fileAnalyses)
            .set({ status: "error" })
            .where(eq(fileAnalyses.id, analysisId));
        }
      } catch (error) {
        const osintError = ErrorHandler.handleExternalAPIError(error, "VirusTotal Analysis");
        console.error("Background analysis failed:", osintError.message);
        await db.update(fileAnalyses)
          .set({ status: "error" })
          .where(eq(fileAnalyses.id, analysisId));
      }

      const [updated] = await db
        .select()
        .from(fileAnalyses)
        .where(eq(fileAnalyses.id, analysisId))
        .limit(1);

      return updated;
    }),

  // Get user's file analysis history
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(fileAnalyses)
      .where(eq(fileAnalyses.userId, ctx.user.id));
  }),

  // Get specific analysis details
  getAnalysis: protectedProcedure
    .input(z.object({ analysisId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [analysis] = await db
        .select()
        .from(fileAnalyses)
        .where(
          and(
            eq(fileAnalyses.id, input.analysisId),
            eq(fileAnalyses.userId, ctx.user.id)
          )
        )
        .limit(1);

      return analysis;
    }),
});
