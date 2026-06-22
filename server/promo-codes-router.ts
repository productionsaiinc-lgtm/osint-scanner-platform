import { router, adminProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { promoCodes, promoCodeUsage } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export const promoCodesRouter = router({
  // Admin: List all promo codes
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }),

  // Admin: Create promo code
  create: adminProcedure
    .input(
      z.object({
        code: z.string().min(1).max(50),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().min(0),
        maxUses: z.number().nullable().optional(),
        maxUsesPerUser: z.number().default(1),
        validFrom: z.string(),
        validUntil: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(promoCodes).values({
        code: input.code.toUpperCase(),
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue,
        maxUses: input.maxUses || null,
        currentUses: 0,
        maxUsesPerUser: input.maxUsesPerUser,
        validFrom: new Date(input.validFrom),
        validUntil: new Date(input.validUntil),
        isActive: 1,
        createdBy: ctx.user.id,
      });

      return result;
    }),

  // Admin: Update promo code
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        code: z.string().min(1).max(50).optional(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.number().min(0).optional(),
        maxUses: z.number().nullable().optional(),
        maxUsesPerUser: z.number().optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const updates: any = {};
      if (input.description !== undefined) updates.description = input.description;
      if (input.discountType) updates.discountType = input.discountType;
      if (input.discountValue !== undefined) updates.discountValue = input.discountValue;
      if (input.maxUses !== undefined) updates.maxUses = input.maxUses;
      if (input.maxUsesPerUser) updates.maxUsesPerUser = input.maxUsesPerUser;
      if (input.validFrom) updates.validFrom = new Date(input.validFrom);
      if (input.validUntil) updates.validUntil = new Date(input.validUntil);
      updates.updatedAt = new Date();

      await db.update(promoCodes).set(updates).where(eq(promoCodes.id, input.id));

      return { success: true };
    }),

  // Admin: Delete promo code
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(promoCodes).where(eq(promoCodes.id, input.id));

      return { success: true };
    }),

  // User: Validate promo code
  validate: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const now = new Date();
      const promo = await db
        .select()
        .from(promoCodes)
        .where(
          and(
            eq(promoCodes.code, input.code.toUpperCase()),
            eq(promoCodes.isActive, 1),
            gte(promoCodes.validUntil, now),
            lte(promoCodes.validFrom, now)
          )
        )
        .limit(1);

      if (!promo.length) {
        return { valid: false, error: "Promo code not found or expired" };
      }

      const code = promo[0];

      // Check max uses
      if (code.maxUses && (code.currentUses || 0) >= code.maxUses) {
        return { valid: false, error: "Promo code usage limit reached" };
      }

      // Check user usage
      const userUsage = await db
        .select()
        .from(promoCodeUsage)
        .where(and(eq(promoCodeUsage.promoCodeId, code.id), eq(promoCodeUsage.userId, ctx.user.id)));

      if (userUsage.length >= (code.maxUsesPerUser || 1)) {
        return { valid: false, error: "You have reached the usage limit for this code" };
      }

      return {
        valid: true,
        code: code.code,
        discountType: code.discountType,
        discountValue: code.discountValue,
        description: code.description,
      };
    }),

  // User: Apply promo code to payment
  apply: protectedProcedure
    .input(z.object({ code: z.string(), paymentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const now = new Date();
      const promo = await db
        .select()
        .from(promoCodes)
        .where(
          and(
            eq(promoCodes.code, input.code.toUpperCase()),
            eq(promoCodes.isActive, 1),
            gte(promoCodes.validUntil, now),
            lte(promoCodes.validFrom, now)
          )
        )
        .limit(1);

      if (!promo.length) {
        throw new Error("Promo code not found or expired");
      }

      const code = promo[0];

      // Check limits
      if (code.maxUses && (code.currentUses || 0) >= code.maxUses) {
        throw new Error("Promo code usage limit reached");
      }

      const userUsage = await db
        .select()
        .from(promoCodeUsage)
        .where(and(eq(promoCodeUsage.promoCodeId, code.id), eq(promoCodeUsage.userId, ctx.user.id)));

      if (userUsage.length >= (code.maxUsesPerUser || 1)) {
        throw new Error("You have reached the usage limit for this code");
      }

      // Record usage
      await db.insert(promoCodeUsage).values({
        promoCodeId: code.id,
        userId: ctx.user.id,
        paymentId: input.paymentId,
        discountAmount: code.discountValue,
      });

      // Increment usage count
      await db
        .update(promoCodes)
        .set({ currentUses: (code.currentUses || 0) + 1 })
        .where(eq(promoCodes.id, code.id));

      return {
        success: true,
        discountType: code.discountType,
        discountValue: code.discountValue,
      };
    }),
});
