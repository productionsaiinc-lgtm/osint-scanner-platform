import { getUserScans } from "./db";

export interface AnalyticsData {
  totalScans: number;
  threatsDetected: number;
  tokensTriggered: number;
  criticalAlerts: number;
  averageResponseTime: number;
  topTargets: Array<{ target: string; scanCount: number }>;
  scansByType: Record<string, number>;
  threatsByLevel: Record<string, number>;
  timelineData: Array<{ date: string; scans: number; threats: number }>;
}

export async function getUserAnalytics(userId: number, timeRange: "day" | "week" | "month" | "year" = "month"): Promise<AnalyticsData> {
  const scans = await getUserScans(userId, 1000).catch(() => []) as any[];
  return buildAnalytics(scans, timeRange);
}

export async function getOrganizationAnalytics(timeRange: "day" | "week" | "month" | "year" = "month"): Promise<AnalyticsData> {
  return buildAnalytics([], timeRange);
}

export async function getThreatTrends(timeRange: "day" | "week" | "month" | "year" = "month") {
  return emptyTimeline(timeRange).map((item) => ({ date: item.date, threats: item.threats, severity: "none" }));
}

export async function getScanPerformanceMetrics() {
  return {
    averageTime: 0,
    fastestScan: 0,
    slowestScan: 0,
    successRate: 0,
  };
}

export async function getUserActivityReport(_userId: number, _timeRange: "day" | "week" | "month" | "year" = "month") {
  return {
    activeUsers: 0,
    newUsers: 0,
    returningUsers: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
  };
}

export async function exportAnalytics(userId: number, format: "csv" | "json" | "pdf"): Promise<Buffer> {
  const analytics = await getUserAnalytics(userId);
  if (format === "csv") return Buffer.from(convertAnalyticsToCSV(analytics));
  return Buffer.from(JSON.stringify(analytics, null, 2));
}

function buildAnalytics(scans: any[], timeRange: "day" | "week" | "month" | "year"): AnalyticsData {
  const completed = scans.filter((scan) => scan.status === "completed");
  const targets = new Map<string, number>();
  const byType: Record<string, number> = {};
  for (const scan of scans) {
    targets.set(scan.target, (targets.get(scan.target) || 0) + 1);
    byType[scan.scanType] = (byType[scan.scanType] || 0) + 1;
  }
  return {
    totalScans: scans.length,
    threatsDetected: 0,
    tokensTriggered: 0,
    criticalAlerts: 0,
    averageResponseTime: 0,
    topTargets: Array.from(targets.entries()).map(([target, scanCount]) => ({ target, scanCount })).sort((a, b) => b.scanCount - a.scanCount).slice(0, 5),
    scansByType: byType,
    threatsByLevel: { critical: 0, high: 0, medium: 0, low: 0 },
    timelineData: timelineFromScans(completed, timeRange),
  };
}

function timelineFromScans(scans: any[], timeRange: "day" | "week" | "month" | "year") {
  const timeline = emptyTimeline(timeRange);
  const byDate = new Map(timeline.map((item) => [item.date, item]));
  for (const scan of scans) {
    const date = new Date(scan.createdAt || scan.updatedAt || Date.now()).toISOString().split("T")[0];
    const item = byDate.get(date);
    if (item) item.scans += 1;
  }
  return timeline;
}

function emptyTimeline(timeRange: "day" | "week" | "month" | "year") {
  const data: Array<{ date: string; scans: number; threats: number }> = [];
  const days = timeRange === "day" ? 1 : timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({ date: date.toISOString().split("T")[0], scans: 0, threats: 0 });
  }
  return data;
}

function convertAnalyticsToCSV(analytics: AnalyticsData): string {
  return [
    "metric,value",
    `totalScans,${analytics.totalScans}`,
    `threatsDetected,${analytics.threatsDetected}`,
    `tokensTriggered,${analytics.tokensTriggered}`,
    `criticalAlerts,${analytics.criticalAlerts}`,
    `averageResponseTime,${analytics.averageResponseTime}`,
  ].join("\n");
}
