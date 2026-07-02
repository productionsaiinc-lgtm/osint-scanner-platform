import { router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { billingAnalytics, promoCodeUsage, promoCodes, userSubscriptions } from "../drizzle/schema";
import { desc, gte } from "drizzle-orm";

export const analyticsRouter = router({
  // Admin: Get revenue analytics for date range
  revenue: adminProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const analytics = await db
        .select()
        .from(billingAnalytics)
        .where(gte(billingAnalytics.date, startDate))
        .orderBy(billingAnalytics.date);

      return analytics.map((item) => ({
        date: new Date(item.date).toISOString().split("T")[0],
        totalRevenue: item.totalRevenue || 0,
        subscriptionCount: item.subscriptionCount || 0,
        activeSubscriptions: item.activeSubscriptions || 0,
        cancelledSubscriptions: item.cancelledSubscriptions || 0,
        churnRate: item.churnRate || 0,
        averageOrderValue: item.averageOrderValue || 0,
        failedPayments: item.failedPayments || 0,
        refunds: item.refunds || 0,
        discountsGiven: item.discountsGiven || 0,
      }));
    }),

  // Admin: Get subscription metrics
  subscriptions: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { activeCount: 0, newThisMonth: 0, churnRate: 0 };

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const subscriptions = await db.select().from(userSubscriptions);
    const activeCount = subscriptions.filter((s) => s.status === 'active').length;
    const newThisMonth = subscriptions.filter((s) => new Date(s.createdAt) >= monthStart).length;

    // Simple churn calculation
    const cancelled = subscriptions.filter((s) => s.status === 'cancelled' || s.status === 'expired').length;
    const churnRate = subscriptions.length > 0 ? (cancelled / subscriptions.length) * 100 : 0;

    return {
      activeCount,
      newThisMonth,
      churnRate: Math.round(churnRate),
      totalSubscriptions: subscriptions.length,
      cancelledCount: cancelled,
    };
  }),

  // Admin: Get promo code metrics
  promos: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalDiscounts: 0, codesUsed: 0, avgDiscount: 0 };

    const usage = await db.select().from(promoCodeUsage);
    const codes = await db.select().from(promoCodes);

    const totalDiscounts = usage.reduce((sum, item) => sum + item.discountAmount, 0);
    const avgDiscount = usage.length > 0 ? totalDiscounts / usage.length : 0;

    return {
      totalDiscounts,
      codesUsed: usage.length,
      avgDiscount: Math.round(avgDiscount),
      activeCodesCount: codes.filter((c) => c.isActive).length,
      totalCodesCount: codes.length,
    };
  }),

  // Admin: Get top performing promo codes
  topPromos: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const usage = await db.select().from(promoCodeUsage);
    const codes = await db.select().from(promoCodes);

    // Group usage by promo code
    const promoStats = codes.map((code) => {
      const codeUsage = usage.filter((u) => u.promoCodeId === code.id);
      const totalDiscount = codeUsage.reduce((sum, u) => sum + u.discountAmount, 0);

      return {
        code: code.code,
        uses: codeUsage.length,
        totalDiscount,
        avgDiscount: codeUsage.length > 0 ? totalDiscount / codeUsage.length : 0,
      };
    });

    return promoStats.sort((a, b) => b.uses - a.uses).slice(0, 10);
  }),

  // Admin: Get daily revenue trend
  revenueTrend: adminProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const analytics = await db
        .select()
        .from(billingAnalytics)
        .where(gte(billingAnalytics.date, startDate))
        .orderBy(billingAnalytics.date);

      return analytics.map((item) => ({
        date: new Date(item.date).toISOString().split("T")[0],
        revenue: item.totalRevenue || 0,
        subscriptions: item.subscriptionCount || 0,
      }));
    }),
});
