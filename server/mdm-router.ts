import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { mdmDevices, mdmPolicies, mdmDeviceCommands, mdmDeviceLogs, mdmDevicePolicyAssignments } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const mdmRouter = router({
  // Get all devices for user
  getAllDevices: protectedProcedure.query(async ({ ctx }: any) => {
    const db = await getDb();
    if (!db) return [];
    const devices = await db
      .select()
      .from(mdmDevices)
      .where(eq(mdmDevices.userId, ctx.user.id));
    return devices;
  }),

  // Get device details
  getDeviceDetails: protectedProcedure
    .input(z.object({ deviceId: z.number() }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) return null;
      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      return device[0] || null;
    }),

  // Enroll device
  enrollDevice: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        deviceName: z.string(),
        deviceType: z.enum(["android", "ios", "windows", "macos", "linux"]),
        osVersion: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        imei: z.string().optional(),
        serialNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(mdmDevices).values({
        userId: ctx.user.id,
        deviceId: input.deviceId,
        deviceName: input.deviceName,
        deviceType: input.deviceType,
        osVersion: input.osVersion,
        manufacturer: input.manufacturer,
        model: input.model,
        imei: input.imei,
        serialNumber: input.serialNumber,
        enrollmentStatus: "pending",
      });
      return result;
    }),

  // Get all policies
  getAllPolicies: protectedProcedure.query(async ({ ctx }: any) => {
    const db = await getDb();
    if (!db) return [];
    const policies = await db
      .select()
      .from(mdmPolicies)
      .where(eq(mdmPolicies.userId, ctx.user.id));
    return policies;
  }),

  // Create policy
  createPolicy: protectedProcedure
    .input(
      z.object({
        policyName: z.string(),
        description: z.string().optional(),
        policyType: z.enum(["security", "compliance", "app_management", "network", "device_control"]),
        minPasswordLength: z.number().optional(),
        requireNumeric: z.boolean().optional(),
        requireSpecialChar: z.boolean().optional(),
        enableEncryption: z.boolean().optional(),
        requireVpn: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(mdmPolicies).values({
        userId: ctx.user.id,
        policyName: input.policyName,
        description: input.description,
        policyType: input.policyType,
        minPasswordLength: input.minPasswordLength,
        requireNumeric: input.requireNumeric ? 1 : 0,
        requireSpecialChar: input.requireSpecialChar ? 1 : 0,
        enableEncryption: input.enableEncryption ? 1 : 0,
        requireVpn: input.requireVpn ? 1 : 0,
      });
      return result;
    }),

  // Assign policy to device
  assignPolicyToDevice: protectedProcedure
    .input(z.object({ deviceId: z.number(), policyId: z.number() }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(mdmDevicePolicyAssignments).values({
        deviceId: input.deviceId,
        policyId: input.policyId,
        assignmentStatus: "pending",
      });
      return result;
    }),

  // Send command to device
  sendCommand: protectedProcedure
    .input(
      z.object({
        deviceId: z.number(),
        commandType: z.enum(["lock", "wipe", "restart", "update_policy", "install_app", "uninstall_app", "take_screenshot", "get_location"]),
        commandData: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(mdmDeviceCommands).values({
        deviceId: input.deviceId,
        commandType: input.commandType,
        commandStatus: "pending",
        commandData: input.commandData ? JSON.stringify(input.commandData) : null,
      });
      return result;
    }),

  // Get device logs
  getDeviceLogs: protectedProcedure
    .input(z.object({ deviceId: z.number() }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) return [];
      const logs = await db
        .select()
        .from(mdmDeviceLogs)
        .where(eq(mdmDeviceLogs.deviceId, input.deviceId));
      return logs;
    }),

  // Get device statistics
  getDeviceStats: protectedProcedure.query(async ({ ctx }: any) => {
    const db = await getDb();
    if (!db) return { totalDevices: 0, enrolledDevices: 0, compliantDevices: 0, nonCompliantDevices: 0, complianceRate: 0 };
    const devices = await db
      .select()
      .from(mdmDevices)
      .where(eq(mdmDevices.userId, ctx.user.id));

    const totalDevices = devices.length;
    const enrolledDevices = devices.filter((d: any) => d.enrollmentStatus === "enrolled").length;
    const compliantDevices = devices.filter((d: any) => d.isCompliant === 1).length;
    const nonCompliantDevices = totalDevices - compliantDevices;

    return {
      totalDevices,
      enrolledDevices,
      compliantDevices,
      nonCompliantDevices,
      complianceRate: totalDevices > 0 ? Math.round((compliantDevices / totalDevices) * 100) : 0,
    };
  }),
});
