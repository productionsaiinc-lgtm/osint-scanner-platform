import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { ErrorLogger, ErrorCategory, ErrorSeverity } from "./error-handler";

/**
 * Error Monitoring Router
 * Provides endpoints for monitoring and analyzing errors in the OSINT platform
 */
export const errorMonitoringRouter = router({
  /**
   * Get all logged errors (admin only)
   */
  getAllErrors: adminProcedure.query(() => {
    const logs = ErrorLogger.getLogs();
    return logs.map((log) => ({
      timestamp: log.timestamp,
      message: log.error.message,
      category: log.error.category,
      severity: log.error.severity,
      code: log.error.code,
      statusCode: log.error.statusCode,
      context: log.context,
    }));
  }),

  /**
   * Get error statistics
   */
  getErrorStats: adminProcedure.query(() => {
    const logs = ErrorLogger.getLogs();

    // Count by severity
    const bySeverity = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };

    // Count by category
    const byCategory: Record<string, number> = {};

    logs.forEach((log) => {
      bySeverity[log.error.severity]++;

      const category = log.error.category;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    // Get recent errors (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = logs.filter(
      (log) => log.timestamp > oneHourAgo
    ).length;

    return {
      totalErrors: logs.length,
      bySeverity,
      byCategory,
      recentErrors,
      lastError: logs[logs.length - 1]?.error.timestamp || null,
    };
  }),

  /**
   * Get errors by severity level
   */
  getErrorsBySeverity: adminProcedure
    .input(z.enum([ErrorSeverity.LOW, ErrorSeverity.MEDIUM, ErrorSeverity.HIGH, ErrorSeverity.CRITICAL]))
    .query(({ input }) => {
      const logs = ErrorLogger.getErrorsBySeverity(input);
      return logs.map((log) => ({
        timestamp: log.timestamp,
        message: log.error.message,
        category: log.error.category,
        code: log.error.code,
        context: log.context,
      }));
    }),

  /**
   * Get errors by category
   */
  getErrorsByCategory: adminProcedure
    .input(z.enum([
      ErrorCategory.NETWORK,
      ErrorCategory.VALIDATION,
      ErrorCategory.AUTHENTICATION,
      ErrorCategory.AUTHORIZATION,
      ErrorCategory.DATABASE,
      ErrorCategory.EXTERNAL_API,
      ErrorCategory.RATE_LIMIT,
      ErrorCategory.TIMEOUT,
      ErrorCategory.INTERNAL,
    ]))
    .query(({ input }) => {
      const logs = ErrorLogger.getErrorsByCategory(input);
      return logs.map((log) => ({
        timestamp: log.timestamp,
        message: log.error.message,
        severity: log.error.severity,
        code: log.error.code,
        context: log.context,
      }));
    }),

  /**
   * Get error health check
   */
  getHealthCheck: protectedProcedure.query(() => {
    const stats = ErrorLogger.getLogs();
    const criticalErrors = ErrorLogger.getErrorsBySeverity(ErrorSeverity.CRITICAL);
    const highErrors = ErrorLogger.getErrorsBySeverity(ErrorSeverity.HIGH);

    // Determine health status
    let status: "healthy" | "degraded" | "critical" = "healthy";
    if (criticalErrors.length > 0) {
      status = "critical";
    } else if (highErrors.length > 5) {
      status = "degraded";
    }

    return {
      status,
      totalErrors: stats.length,
      criticalErrors: criticalErrors.length,
      highErrors: highErrors.length,
      message:
        status === "healthy"
          ? "All systems operational"
          : status === "degraded"
            ? "Some services experiencing issues"
            : "Critical errors detected",
    };
  }),

  /**
   * Get error trends (last N hours)
   */
  getErrorTrends: adminProcedure
    .input(z.object({ hours: z.number().min(1).max(24).default(6) }))
    .query(({ input }) => {
      const logs = ErrorLogger.getLogs();
      const now = Date.now();
      const timeWindow = input.hours * 60 * 60 * 1000;

      // Create hourly buckets
      const buckets: Record<string, number> = {};
      for (let i = input.hours - 1; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        const key = time.toISOString().slice(0, 13); // YYYY-MM-DDTHH
        buckets[key] = 0;
      }

      // Count errors in each bucket
      logs.forEach((log) => {
        const timestamp = log.timestamp.getTime();
        if (timestamp > now - timeWindow) {
          const key = log.timestamp.toISOString().slice(0, 13);
          buckets[key]++;
        }
      });

      return Object.entries(buckets).map(([time, count]) => ({
        time,
        count,
      }));
    }),

  /**
   * Clear error logs (admin only)
   */
  clearLogs: adminProcedure.mutation(() => {
    ErrorLogger.clearLogs();
    return { success: true, message: "Error logs cleared" };
  }),

  /**
   * Get top error codes
   */
  getTopErrorCodes: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(({ input }) => {
      const logs = ErrorLogger.getLogs();
      const codeCounts: Record<string, number> = {};

      logs.forEach((log) => {
        const code = log.error.code;
        codeCounts[code] = (codeCounts[code] || 0) + 1;
      });

      return Object.entries(codeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, input.limit)
        .map(([code, count]) => ({ code, count }));
    }),

  /**
   * Get errors for specific context
   */
  getErrorsByContext: adminProcedure
    .input(z.object({ context: z.string() }))
    .query(({ input }) => {
      const logs = ErrorLogger.getLogs();
      const filtered = logs.filter((log) => log.context?.includes(input.context));

      return filtered.map((log) => ({
        timestamp: log.timestamp,
        message: log.error.message,
        category: log.error.category,
        severity: log.error.severity,
        code: log.error.code,
        context: log.context,
      }));
    }),

  /**
   * Export error report
   */
  exportErrorReport: adminProcedure.query(() => {
    const logs = ErrorLogger.getLogs();
    const stats = ErrorLogger.getLogs();

    // Calculate statistics
    const bySeverity = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };

    const byCategory: Record<string, number> = {};

    logs.forEach((log) => {
      bySeverity[log.error.severity]++;
      const category = log.error.category;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      generatedAt: new Date().toISOString(),
      totalErrors: logs.length,
      statistics: {
        bySeverity,
        byCategory,
      },
      topErrors: Object.entries(byCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count })),
      recentErrors: logs
        .slice(-10)
        .map((log) => ({
          timestamp: log.timestamp,
          message: log.error.message,
          category: log.error.category,
          severity: log.error.severity,
        })),
    };
  }),
});
