/**
 * tRPC Router for VPN Connections
 * Manages VPN connection operations and monitoring
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  connectVPN,
  disconnectVPN,
  getVPNStatus,
  reconnectVPN,
  setKillSwitch,
  checkForLeaks,
  getConnectionLogs,
  clearConnectionLogs,
  getConnectionStats,
  updateDataUsage,
  formatDataSize,
  formatConnectionTime,
} from "./vpn-connection-db";

export const vpnConnectionRouter = router({
  // Connect to VPN
  connect: publicProcedure
    .input(
      z.object({
        providerId: z.string(),
        serverLocation: z.string(),
        protocol: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const connection = await connectVPN(
          input.providerId,
          input.serverLocation,
          input.protocol || "WireGuard"
        );
        return {
          success: true,
          connection,
          message: `Connected to ${input.serverLocation}`,
        };
      } catch (error) {
        throw new Error(`Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  // Disconnect from VPN
  disconnect: publicProcedure.mutation(async () => {
    try {
      await disconnectVPN();
      return {
        success: true,
        message: "Disconnected from VPN",
      };
    } catch (error) {
      throw new Error(`Failed to disconnect: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }),

  // Get current VPN status
  status: publicProcedure.query(async () => {
    const status = await getVPNStatus();
    if (!status) {
      return {
        isConnected: false,
        status: null,
      };
    }

    return {
      isConnected: status.status === "connected",
      status: {
        ...status,
        dataUsedFormatted: formatDataSize(status.dataUsed),
        connectionTimeFormatted: status.connectedAt
          ? formatConnectionTime(Date.now() - status.connectedAt.getTime())
          : null,
      },
    };
  }),

  // Reconnect to VPN
  reconnect: publicProcedure.mutation(async () => {
    try {
      const connection = await reconnectVPN();
      return {
        success: true,
        connection,
        message: "Reconnected to VPN",
      };
    } catch (error) {
      throw new Error(`Failed to reconnect: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }),

  // Set kill switch
  setKillSwitch: publicProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        await setKillSwitch(input.enabled);
        return {
          success: true,
          message: `Kill switch ${input.enabled ? "enabled" : "disabled"}`,
        };
      } catch (error) {
        throw new Error(`Failed to set kill switch: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  // Check for leaks
  checkLeaks: publicProcedure.query(async () => {
    try {
      return await checkForLeaks();
    } catch (error) {
      throw new Error(`Failed to check for leaks: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }),

  // Get connection logs
  logs: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await getConnectionLogs(input.limit);
    }),

  // Clear connection logs
  clearLogs: publicProcedure.mutation(async () => {
    try {
      await clearConnectionLogs();
      return {
        success: true,
        message: "Connection logs cleared",
      };
    } catch (error) {
      throw new Error(`Failed to clear logs: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }),

  // Get connection statistics
  stats: publicProcedure.query(async () => {
    const stats = await getConnectionStats();
    return {
      ...stats,
      totalDataUsedFormatted: formatDataSize(stats.totalDataUsed),
      connectionTimeFormatted: stats.connectionTime
        ? formatConnectionTime(stats.connectionTime)
        : null,
    };
  }),

  // Update data usage (for monitoring)
  updateDataUsage: publicProcedure
    .input(z.object({ bytes: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await updateDataUsage(input.bytes);
        return {
          success: true,
          message: "Data usage updated",
        };
      } catch (error) {
        throw new Error(`Failed to update data usage: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),
});
