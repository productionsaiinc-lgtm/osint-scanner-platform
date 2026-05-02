import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { mdmDevices, mdmPolicies, mdmDeviceCommands, mdmDeviceLogs, mdmDevicePolicyAssignments, mdmSecurityEvents, mdmAppUsageAnalytics, mdmDeviceLocations, mdmDevicePerformance, mdmNetworkMonitoring } from "../drizzle/schema";
import { eq, and, desc, gte } from "drizzle-orm";

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

  // ─── Enhanced Security Policies ──────────────────────────────────────────

  // Update policy with enhanced security fields
  updateSecurityPolicy: protectedProcedure
    .input(z.object({
      policyId: z.number(),
      requireBiometric: z.boolean().optional(),
      enforceEncryption: z.boolean().optional(),
      vpnMandatory: z.boolean().optional(),
      maxPasswordAge: z.number().optional(),
      allowUsbDebug: z.boolean().optional(),
      allowUnknownSources: z.boolean().optional(),
      allowedApps: z.array(z.string()).optional(),
      blockedApps: z.array(z.string()).optional(),
      allowedWifi: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const policy = await db
        .select()
        .from(mdmPolicies)
        .where(and(eq(mdmPolicies.id, input.policyId), eq(mdmPolicies.userId, ctx.user.id)))
        .limit(1);
      if (!policy[0]) throw new Error("Policy not found");

      const updates: Record<string, any> = { updatedAt: new Date() };
      if (input.enforceEncryption !== undefined) updates.enableEncryption = input.enforceEncryption ? 1 : 0;
      if (input.vpnMandatory !== undefined) updates.requireVpn = input.vpnMandatory ? 1 : 0;
      if (input.maxPasswordAge !== undefined) updates.maxPasswordAge = input.maxPasswordAge;
      if (input.allowUsbDebug !== undefined) updates.allowUsbDebug = input.allowUsbDebug ? 1 : 0;
      if (input.allowUnknownSources !== undefined) updates.allowUnknownSources = input.allowUnknownSources ? 1 : 0;
      if (input.allowedApps !== undefined) updates.allowedApps = JSON.stringify(input.allowedApps);
      if (input.blockedApps !== undefined) updates.blockedApps = JSON.stringify(input.blockedApps);
      if (input.allowedWifi !== undefined) updates.allowedWifi = JSON.stringify(input.allowedWifi);

      await db.update(mdmPolicies).set(updates).where(eq(mdmPolicies.id, input.policyId));
      return { success: true };
    }),

  // ─── Threat Detection ────────────────────────────────────────────────────

  // Log a security event/threat
  logSecurityEvent: protectedProcedure
    .input(z.object({
      deviceId: z.number(),
      eventType: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      description: z.string().optional(),
      threatName: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify device ownership
      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) throw new Error("Device not found");

      await db.insert(mdmSecurityEvents).values({
        deviceId: input.deviceId,
        eventType: input.eventType,
        severity: input.severity,
        description: input.description,
        threatName: input.threatName,
        source: input.source,
        resolved: false,
        timestamp: new Date(),
        createdAt: new Date(),
      });

      // Auto-log to device logs
      await db.insert(mdmDeviceLogs).values({
        deviceId: input.deviceId,
        logType: "security_event",
        logMessage: `Security event: ${input.eventType} (${input.severity}) — ${input.threatName || input.description || "Unknown threat"}`,
        logData: JSON.stringify({ eventType: input.eventType, severity: input.severity, source: input.source }),
        createdAt: new Date(),
      }).catch(() => {});

      return { success: true };
    }),

  // Get security events for a device
  getSecurityEvents: protectedProcedure
    .input(z.object({ deviceId: z.number(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) return [];

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) return [];

      return db
        .select()
        .from(mdmSecurityEvents)
        .where(eq(mdmSecurityEvents.deviceId, input.deviceId))
        .orderBy(desc(mdmSecurityEvents.createdAt))
        .limit(input.limit);
    }),

  // Resolve a security event
  resolveSecurityEvent: protectedProcedure
    .input(z.object({ eventId: z.number(), resolutionAction: z.string() }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(mdmSecurityEvents)
        .set({ resolved: true, resolutionAction: input.resolutionAction })
        .where(eq(mdmSecurityEvents.id, input.eventId));
      return { success: true };
    }),

  // Get all security events (all user devices) for threat overview
  getAllSecurityEvents: protectedProcedure
    .input(z.object({ limit: z.number().default(50), unresolvedOnly: z.boolean().default(false) }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) return [];

      const userDevices = await db
        .select({ id: mdmDevices.id })
        .from(mdmDevices)
        .where(eq(mdmDevices.userId, ctx.user.id));

      if (userDevices.length === 0) return [];

      const deviceIds = userDevices.map((d: any) => d.id);
      const events = await db
        .select()
        .from(mdmSecurityEvents)
        .orderBy(desc(mdmSecurityEvents.createdAt))
        .limit(input.limit);

      return events.filter((e: any) => {
        const deviceMatch = deviceIds.includes(e.deviceId);
        const resolvedMatch = input.unresolvedOnly ? !e.resolved : true;
        return deviceMatch && resolvedMatch;
      });
    }),

  // ─── App Management ──────────────────────────────────────────────────────

  // Log app usage analytics
  logAppUsage: protectedProcedure
    .input(z.object({
      deviceId: z.number(),
      appPackageName: z.string(),
      appName: z.string(),
      category: z.string().optional(),
      usageTime: z.number().optional(),
      launchCount: z.number().optional(),
      dataUsed: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) throw new Error("Device not found");

      await db.insert(mdmAppUsageAnalytics).values({
        deviceId: input.deviceId,
        appPackageName: input.appPackageName,
        appName: input.appName,
        category: input.category,
        usageTime: input.usageTime,
        launchCount: input.launchCount || 0,
        dataUsed: input.dataUsed,
        lastUsed: new Date(),
        timestamp: new Date(),
        createdAt: new Date(),
      });

      return { success: true };
    }),

  // Get app usage analytics for a device
  getAppUsage: protectedProcedure
    .input(z.object({ deviceId: z.number(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) return [];

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) return [];

      return db
        .select()
        .from(mdmAppUsageAnalytics)
        .where(eq(mdmAppUsageAnalytics.deviceId, input.deviceId))
        .orderBy(desc(mdmAppUsageAnalytics.createdAt))
        .limit(input.limit);
    }),

  // ─── Geofencing ──────────────────────────────────────────────────────────

  // Update device location (for geofencing)
  updateDeviceLocation: protectedProcedure
    .input(z.object({
      deviceId: z.number(),
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
      altitude: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) throw new Error("Device not found");

      await db.insert(mdmDeviceLocations).values({
        deviceId: input.deviceId,
        latitude: String(input.latitude),
        longitude: String(input.longitude),
        accuracy: input.accuracy,
        altitude: input.altitude ? String(input.altitude) : null,
        timestamp: new Date(),
        createdAt: new Date(),
      });

      // Update device location field
      await db
        .update(mdmDevices)
        .set({ location: JSON.stringify({ lat: input.latitude, lon: input.longitude }), updatedAt: new Date() })
        .where(eq(mdmDevices.id, input.deviceId));

      return { success: true };
    }),

  // Get device location history
  getLocationHistory: protectedProcedure
    .input(z.object({ deviceId: z.number(), limit: z.number().default(30) }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) return [];

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) return [];

      return db
        .select()
        .from(mdmDeviceLocations)
        .where(eq(mdmDeviceLocations.deviceId, input.deviceId))
        .orderBy(desc(mdmDeviceLocations.timestamp))
        .limit(input.limit);
    }),

  // ─── User Behavior Analytics ─────────────────────────────────────────────

  // Get device performance metrics
  recordPerformance: protectedProcedure
    .input(z.object({
      deviceId: z.number(),
      cpuUsage: z.number().optional(),
      memoryUsage: z.number().optional(),
      storageUsage: z.number().optional(),
      batteryLevel: z.number().optional(),
      batteryHealth: z.string().optional(),
      temperature: z.number().optional(),
      uptime: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) throw new Error("Device not found");

      await db.insert(mdmDevicePerformance).values({
        deviceId: input.deviceId,
        cpuUsage: input.cpuUsage !== undefined ? String(input.cpuUsage) : null,
        memoryUsage: input.memoryUsage !== undefined ? String(input.memoryUsage) : null,
        storageUsage: input.storageUsage !== undefined ? String(input.storageUsage) : null,
        batteryLevel: input.batteryLevel,
        batteryHealth: input.batteryHealth,
        temperature: input.temperature !== undefined ? String(input.temperature) : null,
        uptime: input.uptime,
        timestamp: new Date(),
        createdAt: new Date(),
      });

      // Update device battery level
      if (input.batteryLevel !== undefined) {
        await db
          .update(mdmDevices)
          .set({ batteryLevel: input.batteryLevel, updatedAt: new Date() })
          .where(eq(mdmDevices.id, input.deviceId));
      }

      return { success: true };
    }),

  getPerformanceHistory: protectedProcedure
    .input(z.object({ deviceId: z.number(), limit: z.number().default(24) }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) return [];

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) return [];

      return db
        .select()
        .from(mdmDevicePerformance)
        .where(eq(mdmDevicePerformance.deviceId, input.deviceId))
        .orderBy(desc(mdmDevicePerformance.timestamp))
        .limit(input.limit);
    }),

  // ─── Compliance Reports ───────────────────────────────────────────────────

  // Generate a compliance report for all devices
  generateComplianceReport: protectedProcedure.query(async ({ ctx }: any) => {
    const db = await getDb();
    if (!db) return { generatedAt: new Date(), devices: [], summary: { total: 0, compliant: 0, nonCompliant: 0, rate: 0 } };

    const devices = await db
      .select()
      .from(mdmDevices)
      .where(eq(mdmDevices.userId, ctx.user.id));

    const policies = await db
      .select()
      .from(mdmPolicies)
      .where(eq(mdmPolicies.userId, ctx.user.id));

    const total = devices.length;
    const compliant = devices.filter((d: any) => d.isCompliant === 1).length;

    const deviceReports = devices.map((device: any) => {
      const issues: string[] = device.complianceIssues
        ? JSON.parse(device.complianceIssues)
        : [];
      return {
        id: device.id,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        enrollmentStatus: device.enrollmentStatus,
        isCompliant: device.isCompliant === 1,
        complianceIssues: issues,
        lastCheckIn: device.lastCheckIn,
        osVersion: device.osVersion,
        batteryLevel: device.batteryLevel,
      };
    });

    return {
      generatedAt: new Date(),
      devices: deviceReports,
      policies: policies.map((p: any) => ({
        id: p.id,
        name: p.policyName,
        type: p.policyType,
        isActive: p.isActive === 1,
      })),
      summary: {
        total,
        compliant,
        nonCompliant: total - compliant,
        rate: total > 0 ? Math.round((compliant / total) * 100) : 0,
      },
      auditTrail: {
        reportId: `RPT-${Date.now()}`,
        requestedBy: ctx.user.id,
        timestamp: new Date().toISOString(),
        scope: "all_devices",
      },
    };
  }),

  // Update device compliance status
  updateDeviceCompliance: protectedProcedure
    .input(z.object({
      deviceId: z.number(),
      isCompliant: z.boolean(),
      issues: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) throw new Error("Device not found");

      await db.update(mdmDevices).set({
        isCompliant: input.isCompliant ? 1 : 0,
        complianceIssues: input.issues ? JSON.stringify(input.issues) : null,
        updatedAt: new Date(),
      }).where(eq(mdmDevices.id, input.deviceId));

      // Log compliance check
      await db.insert(mdmDeviceLogs).values({
        deviceId: input.deviceId,
        logType: "compliance_check",
        logMessage: input.isCompliant
          ? "Device passed compliance check"
          : `Device failed compliance: ${(input.issues ?? []).join(", ")}`,
        logData: JSON.stringify({ isCompliant: input.isCompliant, issues: input.issues }),
        createdAt: new Date(),
      }).catch(() => {});

      return { success: true };
    }),

  // ─── Network Monitoring ───────────────────────────────────────────────────

  // Log network monitoring data
  logNetworkData: protectedProcedure
    .input(z.object({
      deviceId: z.number(),
      networkType: z.string(),
      ssid: z.string().optional(),
      signalStrength: z.number().optional(),
      ipAddress: z.string().optional(),
      downloadSpeed: z.number().optional(),
      uploadSpeed: z.number().optional(),
      latency: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) throw new Error("Device not found");

      await db.insert(mdmNetworkMonitoring).values({
        deviceId: input.deviceId,
        networkType: input.networkType,
        ssid: input.ssid,
        signalStrength: input.signalStrength,
        ipAddress: input.ipAddress,
        downloadSpeed: input.downloadSpeed !== undefined ? String(input.downloadSpeed) : null,
        uploadSpeed: input.uploadSpeed !== undefined ? String(input.uploadSpeed) : null,
        latency: input.latency,
        timestamp: new Date(),
        createdAt: new Date(),
      });

      return { success: true };
    }),

  // Get network monitoring data for a device
  getNetworkData: protectedProcedure
    .input(z.object({ deviceId: z.number(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) return [];

      const device = await db
        .select()
        .from(mdmDevices)
        .where(and(eq(mdmDevices.id, input.deviceId), eq(mdmDevices.userId, ctx.user.id)))
        .limit(1);
      if (!device[0]) return [];

      return db
        .select()
        .from(mdmNetworkMonitoring)
        .where(eq(mdmNetworkMonitoring.deviceId, input.deviceId))
        .orderBy(desc(mdmNetworkMonitoring.timestamp))
        .limit(input.limit);
    }),

  // ─── Device Provisioning ─────────────────────────────────────────────────

  // Provision a device (enroll + assign default policy + log)
  provisionDevice: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      deviceName: z.string(),
      deviceType: z.enum(["android", "ios", "windows", "macos", "linux"]),
      osVersion: z.string().optional(),
      manufacturer: z.string().optional(),
      model: z.string().optional(),
      imei: z.string().optional(),
      applyDefaultPolicy: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 1. Enroll the device
      const enrollResult = await db.insert(mdmDevices).values({
        userId: ctx.user.id,
        deviceId: input.deviceId,
        deviceName: input.deviceName,
        deviceType: input.deviceType,
        osVersion: input.osVersion,
        manufacturer: input.manufacturer,
        model: input.model,
        imei: input.imei,
        enrollmentStatus: "enrolled",
        enrollmentDate: new Date(),
        isCompliant: 1,
      });
      const deviceDbId = enrollResult[0].insertId as number;

      // 2. Log enrollment
      await db.insert(mdmDeviceLogs).values({
        deviceId: deviceDbId,
        logType: "enrollment",
        logMessage: `Device provisioned and enrolled: ${input.deviceName} (${input.deviceType})`,
        logData: JSON.stringify({ manufacturer: input.manufacturer, model: input.model }),
        createdAt: new Date(),
      }).catch(() => {});

      // 3. Optionally apply a default security policy
      if (input.applyDefaultPolicy) {
        // Find existing default policy or create one
        const existingPolicies = await db
          .select()
          .from(mdmPolicies)
          .where(and(eq(mdmPolicies.userId, ctx.user.id), eq(mdmPolicies.policyName, "Default Security Policy")))
          .limit(1);

        let policyId: number;
        if (existingPolicies[0]) {
          policyId = existingPolicies[0].id;
        } else {
          const policyResult = await db.insert(mdmPolicies).values({
            userId: ctx.user.id,
            policyName: "Default Security Policy",
            description: "Auto-generated default security policy",
            policyType: "security",
            minPasswordLength: 8,
            requireNumeric: 1,
            requireSpecialChar: 0,
            enableEncryption: 1,
            requireVpn: 0,
            isActive: 1,
          });
          policyId = policyResult[0].insertId as number;
        }

        await db.insert(mdmDevicePolicyAssignments).values({
          deviceId: deviceDbId,
          policyId,
          assignmentStatus: "applied",
          appliedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }).catch(() => {});
      }

      return { success: true, deviceDbId, message: `Device ${input.deviceName} provisioned successfully` };
    }),
});
