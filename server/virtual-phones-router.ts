import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createVirtualPhone, getUserVirtualPhones, getVirtualPhone, updateVirtualPhone, deleteVirtualPhone } from "./db";
import { ErrorHandler } from "./error-handler";
import crypto from "crypto";

export const virtualPhonesRouter = router({
  // Create a virtual phone
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        osType: z.enum(["android", "ios"]),
        osVersion: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const deviceId = `device-${crypto.randomBytes(8).toString("hex")}`;
        const imei = generateIMEI();
        const phoneNumber = generatePhoneNumber();

        const phone = await createVirtualPhone({
          userId: ctx.user.id,
          deviceId,
          name: input.name,
          osType: input.osType,
          osVersion: input.osVersion || null,
          imei,
          phoneNumber,
          status: "offline",
          ipAddress: null,
          adbPort: null,
          location: null,
          lastAccessedAt: null,
        });

        if (!phone) {
          throw new Error("Failed to create virtual phone");
        }

        return {
          id: phone.id,
          deviceId: phone.deviceId,
          name: phone.name,
          osType: phone.osType,
          imei: phone.imei,
          phoneNumber: phone.phoneNumber,
          status: "offline",
          message: "Virtual phone created successfully",
        };
      } catch (error) {
        const osintError = ErrorHandler.handleNetworkError(error, "Create Virtual Phone");
        console.error("Failed to create virtual phone:", osintError.message);
        throw osintError;
      }
    }),

  // Get all virtual phones for user
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const phones = await getUserVirtualPhones(ctx.user.id);
      return phones.map((p) => ({
        id: p.id,
        deviceId: p.deviceId,
        name: p.name,
        osType: p.osType,
        osVersion: p.osVersion,
        imei: p.imei,
        phoneNumber: p.phoneNumber,
        status: p.status,
        ipAddress: p.ipAddress,
        adbPort: p.adbPort,
        location: p.location,
        createdAt: p.createdAt,
        lastAccessedAt: p.lastAccessedAt,
      }));
    } catch (error) {
      const osintError = ErrorHandler.handleNetworkError(error, "List Virtual Phones");
      console.error("Failed to list virtual phones:", osintError.message);
      throw osintError;
    }
  }),

  // Get specific phone details
  getPhone: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const phone = await getVirtualPhone(input.id);

        if (!phone || phone.userId !== ctx.user.id) {
          throw new Error("Phone not found or unauthorized");
        }

        return phone;
      } catch (error) {
        const osintError = ErrorHandler.handleNetworkError(error, "Get Virtual Phone");
        console.error("Failed to get virtual phone:", osintError.message);
        throw osintError;
      }
    }),

  // Provision a phone (activate it)
  provision: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const phone = await getVirtualPhone(input.id);

        if (!phone || phone.userId !== ctx.user.id) {
          throw new Error("Phone not found or unauthorized");
        }

        await updateVirtualPhone(input.id, {
          status: "online",
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          adbPort: 5037 + Math.floor(Math.random() * 1000),
          lastAccessedAt: new Date(),
        });

        return {
          success: true,
          message: "Virtual phone provisioned successfully",
          phone: {
            id: phone.id,
            deviceId: phone.deviceId,
            name: phone.name,
            status: "online",
            imei: phone.imei,
            phoneNumber: phone.phoneNumber,
          },
        };
      } catch (error) {
        const osintError = ErrorHandler.handleNetworkError(error, "Provision Virtual Phone");
        console.error("Failed to provision virtual phone:", osintError.message);
        throw osintError;
      }
    }),

  // Activate a phone
  activate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const phone = await getVirtualPhone(input.id);

        if (!phone || phone.userId !== ctx.user.id) {
          throw new Error("Phone not found or unauthorized");
        }

        await updateVirtualPhone(input.id, {
          status: "online",
          lastAccessedAt: new Date(),
        });

        return {
          success: true,
          message: "Virtual phone activated successfully",
          phone: {
            id: phone.id,
            deviceId: phone.deviceId,
            name: phone.name,
            status: "online",
            phoneNumber: phone.phoneNumber,
          },
        };
      } catch (error) {
        const osintError = ErrorHandler.handleNetworkError(error, "Activate Virtual Phone");
        console.error("Failed to activate virtual phone:", osintError.message);
        throw osintError;
      }
    }),

  // Deactivate a phone
  deactivate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const phone = await getVirtualPhone(input.id);

        if (!phone || phone.userId !== ctx.user.id) {
          throw new Error("Phone not found or unauthorized");
        }

        await updateVirtualPhone(input.id, {
          status: "offline",
          lastAccessedAt: new Date(),
        });

        return {
          success: true,
          message: "Virtual phone deactivated successfully",
        };
      } catch (error) {
        const osintError = ErrorHandler.handleNetworkError(error, "Deactivate Virtual Phone");
        console.error("Failed to deactivate virtual phone:", osintError.message);
        throw osintError;
      }
    }),

  // Delete a virtual phone
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const phone = await getVirtualPhone(input.id);

        if (!phone || phone.userId !== ctx.user.id) {
          throw new Error("Phone not found or unauthorized");
        }

        await deleteVirtualPhone(input.id);

        return {
          success: true,
          message: "Virtual phone deleted successfully",
        };
      } catch (error) {
        const osintError = ErrorHandler.handleNetworkError(error, "Delete Virtual Phone");
        console.error("Failed to delete virtual phone:", osintError.message);
        throw osintError;
      }
    }),

  // Update phone details
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const phone = await getVirtualPhone(input.id);

        if (!phone || phone.userId !== ctx.user.id) {
          throw new Error("Phone not found or unauthorized");
        }

        const updates: Record<string, any> = {};
        if (input.name) updates.name = input.name;
        if (input.location) updates.location = input.location;

        if (Object.keys(updates).length === 0) {
          return { success: false, message: "No updates provided" };
        }

        await updateVirtualPhone(input.id, updates);

        return {
          success: true,
          message: "Virtual phone updated successfully",
        };
      } catch (error) {
        const osintError = ErrorHandler.handleNetworkError(error, "Update Virtual Phone");
        console.error("Failed to update virtual phone:", osintError.message);
        throw osintError;
      }
    }),

  // Get phone statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const phones = await getUserVirtualPhones(ctx.user.id);

      const stats = {
        totalDevices: phones.length,
        onlineDevices: phones.filter((p) => p.status === "online").length,
        offlineDevices: phones.filter((p) => p.status === "offline").length,
        osDistribution: {
          ios: phones.filter((p) => p.osType === "ios").length,
          android: phones.filter((p) => p.osType === "android").length,
        },
      };

      return stats;
    } catch (error) {
      const osintError = ErrorHandler.handleNetworkError(error, "Get Virtual Phone Stats");
      console.error("Failed to get virtual phone stats:", osintError.message);
      throw osintError;
    }
  }),
});

// Helper functions to generate realistic device identifiers
function generateIMEI(): string {
  // IMEI format: 15 digits
  const imei = Array(15)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join("");
  return imei;
}

function generatePhoneNumber(): string {
  // Generate realistic phone number
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${exchange}${number}`;
}
