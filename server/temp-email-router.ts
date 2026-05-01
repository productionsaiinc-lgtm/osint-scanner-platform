import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createTempEmail,
  getTempEmail,
  getUserTempEmails,
  deleteTempEmail,
  createTempEmailMessage,
  getTempEmailMessages,
  markTempEmailMessageAsRead,
  deleteTempEmailMessage,
} from "./db";
import { TRPCError } from "@trpc/server";

const TEMP_EMAIL_DOMAINS = ["tempmail.osint", "burner.osint", "anon.osint"];
const EMAIL_EXPIRY_HOURS = 24;

function generateTempEmailAddress(): string {
  const domain = TEMP_EMAIL_DOMAINS[Math.floor(Math.random() * TEMP_EMAIL_DOMAINS.length)];
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const name = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${name}@${domain}`;
}

export const tempEmailRouter = router({
  // Create a new temporary email address
  create: protectedProcedure
    .input(z.object({
      displayName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const emailAddress = generateTempEmailAddress();
      const expiresAt = new Date(Date.now() + EMAIL_EXPIRY_HOURS * 60 * 60 * 1000);

      const tempEmail = await createTempEmail({
        userId: ctx.user.id,
        emailAddress,
        displayName: input.displayName || emailAddress,
        isActive: true,
        expiresAt,
        messageCount: 0,
      } as any);

      if (!tempEmail) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create temporary email",
        });
      }

      return { ...tempEmail, displayName: tempEmail?.displayName || emailAddress } as any;
    }),

  // Get a specific temporary email by address
  getByAddress: protectedProcedure
    .input(z.object({
      emailAddress: z.string().email(),
    }))
    .query(async ({ ctx, input }) => {
      const tempEmail = await getTempEmail(input.emailAddress);

      if (!tempEmail || tempEmail.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Temporary email not found",
        });
      }

      // Check if expired
      if (tempEmail.expiresAt < new Date()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Temporary email has expired",
        });
      }

      return tempEmail as any;
    }),

  // List all temporary emails for the current user
  listMyEmails: protectedProcedure.query(async ({ ctx }) => {
    const emails = await getUserTempEmails(ctx.user.id);
    
    // Filter out expired emails
    return emails.filter(email => email.expiresAt > new Date()).map(e => ({ ...e, displayName: e.displayName || e.emailAddress })) as any[];
  }),

  // Delete a temporary email
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const emails = await getUserTempEmails(ctx.user.id);
      const emailExists = emails.some(e => e.id === input.id);

      if (!emailExists) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this email",
        });
      }

      await deleteTempEmail(input.id);
      return { success: true };
    }),

  // Add a message to a temporary email inbox
  addMessage: protectedProcedure
    .input(z.object({
      tempEmailId: z.number(),
      fromAddress: z.string().email(),
      subject: z.string(),
      body: z.string(),
      htmlBody: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const emails = await getUserTempEmails(ctx.user.id);
      const emailExists = emails.some(e => e.id === input.tempEmailId);

      if (!emailExists) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to add messages to this email",
        });
      }

      const message = await createTempEmailMessage({
        tempEmailId: input.tempEmailId,
        fromAddress: input.fromAddress,
        subject: input.subject,
        body: input.body,
        htmlBody: input.htmlBody,
        isRead: false,
        receivedAt: new Date(),
      });

      if (!message) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add message",
        });
      }

      return message;
    }),

  // Get messages for a temporary email
  getMessages: protectedProcedure
    .input(z.object({
      tempEmailId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const emails = await getUserTempEmails(ctx.user.id);
      const emailExists = emails.some(e => e.id === input.tempEmailId);

      if (!emailExists) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view these messages",
        });
      }

      return (await getTempEmailMessages(input.tempEmailId)) as any;
    }),

  // Mark a message as read
  markMessageAsRead: protectedProcedure
    .input(z.object({
      messageId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Note: In production, you'd verify ownership here too
      await markTempEmailMessageAsRead(input.messageId);
      return { success: true };
    }),

  // Delete a message
  deleteMessage: protectedProcedure
    .input(z.object({
      messageId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Note: In production, you'd verify ownership here too
      await deleteTempEmailMessage(input.messageId);
      return { success: true };
    }),

  // Simulate receiving an email (for testing/demo purposes)
  simulateReceiveEmail: protectedProcedure
    .input(z.object({
      tempEmailId: z.number(),
      fromAddress: z.string().email(),
      subject: z.string(),
      body: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const emails = await getUserTempEmails(ctx.user.id);
      const emailExists = emails.some(e => e.id === input.tempEmailId);

      if (!emailExists) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized",
        });
      }

      const message = await createTempEmailMessage({
        tempEmailId: input.tempEmailId,
        fromAddress: input.fromAddress,
        subject: input.subject,
        body: input.body,
        htmlBody: undefined,
        isRead: false,
        receivedAt: new Date(),
      });

      return message;
    }),
});
