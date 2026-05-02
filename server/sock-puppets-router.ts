import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean } from "drizzle-orm/mysql-core";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// ─── In-module schema (no migration needed – uses DB if available) ────────────

export const sockPuppets = mysqlTable("sockPuppets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  puppetId: varchar("puppetId", { length: 64 }).notNull().unique(),
  alias: varchar("alias", { length: 100 }).notNull(),
  fullName: varchar("fullName", { length: 255 }),
  bio: text("bio"),
  email: varchar("email", { length: 320 }),
  platform: varchar("platform", { length: 50 }).notNull(), // twitter, instagram, reddit, etc.
  avatarUrl: text("avatarUrl"),
  persona: text("persona"),           // JSON: age, location, interests, occupation
  status: mysqlEnum("status", ["active", "suspended", "retired"]).default("active").notNull(),
  postCount: int("postCount").default(0).notNull(),
  followersCount: int("followersCount").default(0).notNull(),
  followingCount: int("followingCount").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastActiveAt: timestamp("lastActiveAt"),
});

export const sockPuppetActivity = mysqlTable("sockPuppetActivity", {
  id: int("id").autoincrement().primaryKey(),
  puppetId: varchar("puppetId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  activityType: mysqlEnum("activityType", ["post", "comment", "follow", "like", "dm", "retweet", "share"]).notNull(),
  content: text("content"),
  targetUrl: text("targetUrl"),
  platform: varchar("platform", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function getUserPuppets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(sockPuppets)
      .where(eq(sockPuppets.userId, userId))
      .orderBy(desc(sockPuppets.createdAt));
  } catch {
    return [];
  }
}

async function getPuppetActivity(puppetId: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(sockPuppetActivity)
      .where(eq(sockPuppetActivity.puppetId, puppetId))
      .orderBy(desc(sockPuppetActivity.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

// Realistic avatar URLs (dicebear api – free, no auth)
function generateAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}`;
}

// Generate a realistic persona
function generatePersona(alias: string) {
  const ages = [22, 25, 28, 31, 34, 37, 40, 43];
  const locations = [
    "Toronto, Canada", "New York, USA", "London, UK", "Sydney, Australia",
    "Berlin, Germany", "Austin, TX", "San Francisco, CA", "Chicago, IL",
  ];
  const interests = [
    ["tech", "gaming", "crypto"],
    ["fitness", "travel", "photography"],
    ["politics", "history", "books"],
    ["music", "art", "film"],
    ["finance", "investing", "startups"],
    ["sports", "outdoors", "cooking"],
  ];
  const occupations = [
    "Software Engineer", "Marketing Manager", "Freelance Writer",
    "Student", "Business Analyst", "Graphic Designer", "Teacher",
  ];
  return {
    age: ages[Math.floor(Math.random() * ages.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    interests: interests[Math.floor(Math.random() * interests.length)],
    occupation: occupations[Math.floor(Math.random() * occupations.length)],
    joinedYear: 2018 + Math.floor(Math.random() * 6),
  };
}

const PLATFORMS = ["twitter", "instagram", "reddit", "facebook", "linkedin", "tiktok", "telegram"] as const;

// ─── Router ──────────────────────────────────────────────────────────────────

export const sockPuppetsRouter = router({
  // List all sock puppets for this user
  list: protectedProcedure.query(async ({ ctx }) => {
    const puppets = await getUserPuppets(ctx.user.id);
    return puppets.map((p) => ({
      ...p,
      persona: p.persona ? JSON.parse(p.persona) : null,
      avatarUrl: p.avatarUrl || generateAvatarUrl(p.puppetId),
    }));
  }),

  // Create a new sock puppet
  create: protectedProcedure
    .input(
      z.object({
        alias: z.string().min(1).max(100),
        platform: z.enum(PLATFORMS),
        fullName: z.string().optional(),
        bio: z.string().optional(),
        email: z.string().email().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const puppetId = `puppet-${crypto.randomBytes(10).toString("hex")}`;
      const persona = generatePersona(input.alias);

      try {
        const result = await db.insert(sockPuppets).values({
          userId: ctx.user.id,
          puppetId,
          alias: input.alias,
          fullName: input.fullName || null,
          bio: input.bio || null,
          email: input.email || null,
          platform: input.platform,
          avatarUrl: generateAvatarUrl(puppetId),
          persona: JSON.stringify(persona),
          status: "active",
          postCount: 0,
          followersCount: 0,
          followingCount: 0,
          notes: input.notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveAt: null,
        });

        const id = result[0].insertId as number;
        const rows = await db.select().from(sockPuppets).where(eq(sockPuppets.id, id)).limit(1);
        const p = rows[0];

        return {
          ...p,
          persona: p?.persona ? JSON.parse(p.persona) : persona,
          avatarUrl: p?.avatarUrl || generateAvatarUrl(puppetId),
          message: "Sock puppet created successfully",
        };
      } catch (err: any) {
        console.error("[SockPuppets] create failed:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create sock puppet" });
      }
    }),

  // Update a sock puppet
  update: protectedProcedure
    .input(
      z.object({
        puppetId: z.string(),
        alias: z.string().optional(),
        bio: z.string().optional(),
        fullName: z.string().optional(),
        status: z.enum(["active", "suspended", "retired"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(sockPuppets)
        .where(and(eq(sockPuppets.puppetId, input.puppetId), eq(sockPuppets.userId, ctx.user.id)))
        .limit(1);
      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const updates: Record<string, any> = { updatedAt: new Date() };
      if (input.alias !== undefined) updates.alias = input.alias;
      if (input.bio !== undefined) updates.bio = input.bio;
      if (input.fullName !== undefined) updates.fullName = input.fullName;
      if (input.status !== undefined) updates.status = input.status;
      if (input.notes !== undefined) updates.notes = input.notes;

      await db.update(sockPuppets).set(updates).where(eq(sockPuppets.puppetId, input.puppetId));
      return { success: true };
    }),

  // Delete a sock puppet
  delete: protectedProcedure
    .input(z.object({ puppetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(sockPuppets)
        .where(and(eq(sockPuppets.puppetId, input.puppetId), eq(sockPuppets.userId, ctx.user.id)))
        .limit(1);
      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(sockPuppetActivity).where(eq(sockPuppetActivity.puppetId, input.puppetId));
      await db.delete(sockPuppets).where(eq(sockPuppets.puppetId, input.puppetId));
      return { success: true };
    }),

  // Log an activity for a puppet
  logActivity: protectedProcedure
    .input(
      z.object({
        puppetId: z.string(),
        activityType: z.enum(["post", "comment", "follow", "like", "dm", "retweet", "share"]),
        content: z.string().optional(),
        targetUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(sockPuppets)
        .where(and(eq(sockPuppets.puppetId, input.puppetId), eq(sockPuppets.userId, ctx.user.id)))
        .limit(1);
      const puppet = rows[0];
      if (!puppet) throw new TRPCError({ code: "NOT_FOUND" });

      await db.insert(sockPuppetActivity).values({
        puppetId: input.puppetId,
        userId: ctx.user.id,
        activityType: input.activityType,
        content: input.content || null,
        targetUrl: input.targetUrl || null,
        platform: puppet.platform,
        createdAt: new Date(),
      });

      // Increment postCount if it's a post/comment
      const increment = ["post", "comment"].includes(input.activityType);
      if (increment) {
        await db
          .update(sockPuppets)
          .set({ postCount: puppet.postCount + 1, lastActiveAt: new Date(), updatedAt: new Date() })
          .where(eq(sockPuppets.puppetId, input.puppetId));
      } else {
        await db
          .update(sockPuppets)
          .set({ lastActiveAt: new Date(), updatedAt: new Date() })
          .where(eq(sockPuppets.puppetId, input.puppetId));
      }

      return { success: true };
    }),

  // Get activity log for a puppet
  getActivity: protectedProcedure
    .input(z.object({ puppetId: z.string(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select()
        .from(sockPuppets)
        .where(and(eq(sockPuppets.puppetId, input.puppetId), eq(sockPuppets.userId, ctx.user.id)))
        .limit(1);
      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });

      return getPuppetActivity(input.puppetId, input.limit);
    }),

  // Get summary stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    const puppets = await getUserPuppets(ctx.user.id);
    return {
      total: puppets.length,
      active: puppets.filter((p) => p.status === "active").length,
      suspended: puppets.filter((p) => p.status === "suspended").length,
      retired: puppets.filter((p) => p.status === "retired").length,
      totalPosts: puppets.reduce((s, p) => s + p.postCount, 0),
      platforms: [...new Set(puppets.map((p) => p.platform))],
    };
  }),
});
