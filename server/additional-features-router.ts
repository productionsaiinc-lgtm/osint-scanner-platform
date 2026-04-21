import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createReportTemplate, getUserTemplates, updateReportTemplate, deleteReportTemplate, generateReportFromTemplate, predefinedTemplates } from "./report-templates-service";
import { createScheduledScan, getUserScheduledScans, updateScheduledScan, deleteScheduledScan, getScanHistory, pauseUserScans, resumeUserScans } from "./scheduled-scans-service";
import { getUserAnalytics, getOrganizationAnalytics, getThreatTrends, getScanPerformanceMetrics, getUserActivityReport, exportAnalytics } from "./analytics-service";

export const additionalFeaturesRouter = router({
  // Report Templates (Medium Priority)
  reportTemplates: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string(),
        theme: z.enum(["light", "dark", "professional"] as const),
        sections: z.array(z.object({
          title: z.string(),
          type: z.enum(["summary", "vulnerabilities", "recommendations", "metrics", "timeline", "custom"] as const),
          order: z.number(),
          enabled: z.boolean(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const template = await createReportTemplate(
            ctx.user.id,
            input.name,
            input.description,
            input.sections.map((s, i) => ({
              id: `section_${i}`,
              ...s,
            })),
            input.theme
          );
          return { success: true, template };
        } catch (error) {
          console.error("Failed to create report template:", error);
          return { success: false, error: "Failed to create template" };
        }
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const templates = await getUserTemplates(ctx.user.id);
          return { success: true, templates: [...predefinedTemplates, ...templates] };
        } catch (error) {
          console.error("Failed to list templates:", error);
          return { success: false, error: "Failed to list templates" };
        }
      }),

    update: protectedProcedure
      .input(z.object({
        templateId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        theme: z.enum(["light", "dark", "professional"] as const).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const success = await updateReportTemplate(input.templateId, input);
          return { success };
        } catch (error) {
          console.error("Failed to update template:", error);
          return { success: false, error: "Failed to update template" };
        }
      }),

    delete: protectedProcedure
      .input(z.object({
        templateId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const success = await deleteReportTemplate(input.templateId);
          return { success };
        } catch (error) {
          console.error("Failed to delete template:", error);
          return { success: false, error: "Failed to delete template" };
        }
      }),

    generate: protectedProcedure
      .input(z.object({
        templateId: z.string(),
        scanData: z.record(z.string(), z.any()),
        format: z.enum(["pdf", "html", "docx"] as const),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const buffer = await generateReportFromTemplate(input.templateId, input.scanData, input.format);
          return { success: true, buffer: buffer.toString("base64") };
        } catch (error) {
          console.error("Failed to generate report:", error);
          return { success: false, error: "Failed to generate report" };
        }
      }),
  }),

  // Scheduled Scans (Medium Priority)
  scheduledScans: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        targets: z.array(z.string()),
        scanType: z.enum(["port", "web", "vulnerability", "all"] as const),
        schedule: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const scan = await createScheduledScan(
            ctx.user.id,
            input.name,
            input.targets,
            input.scanType,
            input.schedule
          );
          return { success: true, scan };
        } catch (error) {
          console.error("Failed to create scheduled scan:", error);
          return { success: false, error: "Failed to create scheduled scan" };
        }
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const scans = await getUserScheduledScans(ctx.user.id);
          return { success: true, scans };
        } catch (error) {
          console.error("Failed to list scheduled scans:", error);
          return { success: false, error: "Failed to list scans" };
        }
      }),

    update: protectedProcedure
      .input(z.object({
        scanId: z.string(),
        enabled: z.boolean().optional(),
        schedule: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const success = await updateScheduledScan(input.scanId, input);
          return { success };
        } catch (error) {
          console.error("Failed to update scan:", error);
          return { success: false, error: "Failed to update scan" };
        }
      }),

    delete: protectedProcedure
      .input(z.object({
        scanId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const success = await deleteScheduledScan(input.scanId);
          return { success };
        } catch (error) {
          console.error("Failed to delete scan:", error);
          return { success: false, error: "Failed to delete scan" };
        }
      }),

    history: protectedProcedure
      .input(z.object({
        scanId: z.string(),
        limit: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const history = await getScanHistory(input.scanId, input.limit);
          return { success: true, history };
        } catch (error) {
          console.error("Failed to get scan history:", error);
          return { success: false, error: "Failed to get history" };
        }
      }),

    pause: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          await pauseUserScans(ctx.user.id);
          return { success: true };
        } catch (error) {
          console.error("Failed to pause scans:", error);
          return { success: false, error: "Failed to pause scans" };
        }
      }),

    resume: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          await resumeUserScans(ctx.user.id);
          return { success: true };
        } catch (error) {
          console.error("Failed to resume scans:", error);
          return { success: false, error: "Failed to resume scans" };
        }
      }),
  }),

  // Analytics Dashboard (Medium Priority)
  analytics: router({
    getUserAnalytics: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["day", "week", "month", "year"] as const).optional(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const analytics = await getUserAnalytics(ctx.user.id, input.timeRange || "month");
          return { success: true, analytics };
        } catch (error) {
          console.error("Failed to get analytics:", error);
          return { success: false, error: "Failed to get analytics" };
        }
      }),

    getOrganizationAnalytics: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["day", "week", "month", "year"] as const).optional(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const analytics = await getOrganizationAnalytics(input.timeRange || "month");
          return { success: true, analytics };
        } catch (error) {
          console.error("Failed to get organization analytics:", error);
          return { success: false, error: "Failed to get analytics" };
        }
      }),

    getThreatTrends: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["day", "week", "month", "year"] as const).optional(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const trends = await getThreatTrends(input.timeRange || "month");
          return { success: true, trends };
        } catch (error) {
          console.error("Failed to get threat trends:", error);
          return { success: false, error: "Failed to get trends" };
        }
      }),

    getPerformanceMetrics: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const metrics = await getScanPerformanceMetrics();
          return { success: true, metrics };
        } catch (error) {
          console.error("Failed to get performance metrics:", error);
          return { success: false, error: "Failed to get metrics" };
        }
      }),

    getActivityReport: protectedProcedure
      .input(z.object({
        timeRange: z.enum(["day", "week", "month", "year"] as const).optional(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const report = await getUserActivityReport(ctx.user.id, input.timeRange || "month");
          return { success: true, report };
        } catch (error) {
          console.error("Failed to get activity report:", error);
          return { success: false, error: "Failed to get report" };
        }
      }),

    export: protectedProcedure
      .input(z.object({
        format: z.enum(["csv", "json", "pdf"] as const),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const buffer = await exportAnalytics(ctx.user.id, input.format);
          return { success: true, buffer: buffer.toString("base64") };
        } catch (error) {
          console.error("Failed to export analytics:", error);
          return { success: false, error: "Failed to export analytics" };
        }
      }),
  }),
});
