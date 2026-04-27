import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { tempEmailAddresses, tempEmailMessages } from "../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import { nanoid } from "nanoid";

export const temporaryEmailRouter = router({
  // Generate a new temporary email address
  generateAddress: protectedProcedure
    .input(z.object({ displayName: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const domain = "osintscan.com"; // In production, use a real configured domain
      const emailAddress = `${nanoid(10).toLowerCase()}@${domain}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      const [result] = await db.insert(tempEmailAddresses).values({
        userId: ctx.user.id,
        emailAddress,
        displayName: input.displayName || "My Temp Email",
        expiresAt,
        isActive: true,
      });

      return {
        id: result.insertId,
        emailAddress,
        expiresAt,
      };
    }),

  // Get active temporary email addresses for the user
  getActiveAddresses: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(tempEmailAddresses)
      .where(
        and(
          eq(tempEmailAddresses.userId, ctx.user.id),
          eq(tempEmailAddresses.isActive, true),
          gt(tempEmailAddresses.expiresAt, new Date())
        )
      );
  }),

  // Get messages for a specific temporary email address
  getMessages: protectedProcedure
    .input(z.object({ emailId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const [address] = await db
        .select()
        .from(tempEmailAddresses)
        .where(
          and(
            eq(tempEmailAddresses.id, input.emailId),
            eq(tempEmailAddresses.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!address) throw new Error("Email address not found or unauthorized");

      return await db
        .select()
        .from(tempEmailMessages)
        .where(eq(tempEmailMessages.tempEmailId, input.emailId));
    }),

  // Delete/Deactivate a temporary email address
  deleteAddress: protectedProcedure
    .input(z.object({ emailId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(tempEmailAddresses)
        .set({ isActive: false })
        .where(
          and(
            eq(tempEmailAddresses.id, input.emailId),
            eq(tempEmailAddresses.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
