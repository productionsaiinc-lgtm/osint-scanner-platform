import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { virtualPhones, VirtualPhone, InsertVirtualPhone } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";

// ─── DB helpers ─────────────────────────────────────────────────────────────

async function createVirtualPhone(phone: InsertVirtualPhone): Promise<VirtualPhone | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(virtualPhones).values(phone);
    const id = result[0].insertId as number;
    const rows = await db.select().from(virtualPhones).where(eq(virtualPhones.id, id)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error("[VirtualPhone] create failed:", err);
    return null;
  }
}

async function getUserVirtualPhones(userId: number): Promise<VirtualPhone[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(virtualPhones)
      .where(eq(virtualPhones.userId, userId))
      .orderBy(desc(virtualPhones.createdAt));
  } catch (err) {
    console.error("[VirtualPhone] list failed:", err);
    return [];
  }
}

async function updateVirtualPhone(id: number, updates: Partial<VirtualPhone>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(virtualPhones).set({ ...updates, updatedAt: new Date() }).where(eq(virtualPhones.id, id));
  } catch (err) {
    console.error("[VirtualPhone] update failed:", err);
  }
}

async function deleteVirtualPhone(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.delete(virtualPhones).where(eq(virtualPhones.id, id));
  } catch (err) {
    console.error("[VirtualPhone] delete failed:", err);
  }
}

// Generate a realistic-looking phone number
function generatePhoneNumber(index: number): string {
  const area = 555;
  const num = String(1000 + index).slice(-4);
  return `+1-${area}-${num}`;
}

// Generate a valid-format IMEI (15 digits)
function generateIMEI(): string {
  const digits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10));
  // Luhn check digit
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = digits[i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  digits.push((10 - (sum % 10)) % 10);
  return digits.join("");
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const virtualPhonesRouter = router({
  // List all virtual phones for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const phones = await getUserVirtualPhones(ctx.user.id);
    return phones.map((p) => ({
      id: p.id,
      deviceId: p.deviceId,
      name: p.name,
      osType: p.osType,
      osVersion: p.osVersion,
      phoneNumber: p.phoneNumber,
      imei: p.imei,
      status: p.status,
      ipAddress: p.ipAddress,
      adbPort: p.adbPort,
      location: p.location,
      createdAt: p.createdAt,
      lastAccessedAt: p.lastAccessedAt,
    }));
  }),

  // Create a new virtual phone
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        osType: z.enum(["android", "ios"]),
        osVersion: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deviceId = `vphone-${crypto.randomBytes(8).toString("hex")}`;
      const existingPhones = await getUserVirtualPhones(ctx.user.id);
      const phoneNumber = generatePhoneNumber(existingPhones.length);
      const imei = generateIMEI();

      const phone = await createVirtualPhone({
        userId: ctx.user.id,
        deviceId,
        name: input.name,
        osType: input.osType,
        osVersion: input.osVersion || (input.osType === "android" ? "14.0" : "17.4"),
        phoneNumber,
        imei,
        status: "offline",
        ipAddress: null,
        adbPort: null,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: null,
      });

      if (!phone) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create virtual phone" });
      }

      return {
        id: phone.id,
        deviceId: phone.deviceId,
        name: phone.name,
        osType: phone.osType,
        osVersion: phone.osVersion,
        phoneNumber: phone.phoneNumber,
        imei: phone.imei,
        status: phone.status,
        message: "Virtual phone created successfully",
      };
    }),

  // Start (bring online) a virtual phone
  start: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const phones = await getUserVirtualPhones(ctx.user.id);
      const phone = phones.find((p) => p.id === input.id);
      if (!phone) throw new TRPCError({ code: "NOT_FOUND", message: "Virtual phone not found" });

      const adbPort = 5554 + Math.floor(Math.random() * 1000);
      const ipOctet = Math.floor(Math.random() * 254) + 1;

      await updateVirtualPhone(input.id, {
        status: "online",
        ipAddress: `10.0.2.${ipOctet}`,
        adbPort,
        lastAccessedAt: new Date(),
      });

      return { success: true, message: "Virtual phone started", adbPort, ipAddress: `10.0.2.${ipOctet}` };
    }),

  // Stop (take offline) a virtual phone
  stop: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const phones = await getUserVirtualPhones(ctx.user.id);
      const phone = phones.find((p) => p.id === input.id);
      if (!phone) throw new TRPCError({ code: "NOT_FOUND", message: "Virtual phone not found" });

      await updateVirtualPhone(input.id, {
        status: "offline",
        lastAccessedAt: new Date(),
      });

      return { success: true, message: "Virtual phone stopped" };
    }),

  // Delete a virtual phone
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const phones = await getUserVirtualPhones(ctx.user.id);
      const phone = phones.find((p) => p.id === input.id);
      if (!phone) throw new TRPCError({ code: "NOT_FOUND", message: "Virtual phone not found" });

      await deleteVirtualPhone(input.id);
      return { success: true, message: "Virtual phone deleted" };
    }),

  // Rename a virtual phone
  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const phones = await getUserVirtualPhones(ctx.user.id);
      const phone = phones.find((p) => p.id === input.id);
      if (!phone) throw new TRPCError({ code: "NOT_FOUND", message: "Virtual phone not found" });

      await updateVirtualPhone(input.id, { name: input.name });
      return { success: true };
    }),
});
