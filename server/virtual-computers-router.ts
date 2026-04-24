import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createVirtualComputer, getUserVirtualComputers, updateVirtualComputer, deleteVirtualComputer } from "./db";
import crypto from "crypto";

export const virtualComputersRouter = router({
  // Create a virtual computer
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        osType: z.enum(["windows", "linux", "macos"]),
        osVersion: z.string().optional(),
        ram: z.number().min(512).max(65536),
        storage: z.number().min(10).max(1000),
        cpu: z.number().min(1).max(64),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vmId = `vm-${crypto.randomBytes(8).toString("hex")}`;

      const computer = await createVirtualComputer({
        userId: ctx.user.id,
        vmId,
        name: input.name,
        osType: input.osType,
        osVersion: input.osVersion || null,
        ram: input.ram,
        storage: input.storage,
        cpu: input.cpu,
        status: "stopped",
        ipAddress: null,
        rdpPort: null,
        sshPort: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: null,
      });

      if (!computer) {
        throw new Error("Failed to create virtual computer");
      }

      return {
        id: computer.id,
        vmId: computer.vmId,
        name: computer.name,
        osType: computer.osType,
        status: "stopped",
        message: "Virtual computer created successfully",
      };
    }),

  // Get all virtual computers for user
  list: protectedProcedure.query(async ({ ctx }) => {
    const computers = await getUserVirtualComputers(ctx.user.id);
    return computers.map((c) => ({
      id: c.id,
      vmId: c.vmId,
      name: c.name,
      osType: c.osType,
      osVersion: c.osVersion,
      ram: c.ram,
      storage: c.storage,
      cpu: c.cpu,
      status: c.status,
      ipAddress: c.ipAddress,
      rdpPort: c.rdpPort,
      sshPort: c.sshPort,
      createdAt: c.createdAt,
      lastAccessedAt: c.lastAccessedAt,
      uptime: c.status === "running" ? Math.floor(Math.random() * 720) : 0,
    }));
  }),

  // Start a virtual computer
  start: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const rdpPort = 3389 + Math.floor(Math.random() * 1000);
      const sshPort = 22000 + Math.floor(Math.random() * 1000);

      await updateVirtualComputer(input.id, {
        status: "running",
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        rdpPort,
        sshPort,
        lastAccessedAt: new Date(),
      });
      return { success: true, message: "Virtual computer started" };
    }),

  // Stop a virtual computer
  stop: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await updateVirtualComputer(input.id, {
        status: "stopped",
        lastAccessedAt: new Date(),
      });
      return { success: true, message: "Virtual computer stopped" };
    }),

  // Delete a virtual computer
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteVirtualComputer(input.id);
      return { success: true, message: "Virtual computer deleted" };
    }),

  // Update virtual computer
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, any> = {};
      if (input.name) updates.name = input.name;

      if (Object.keys(updates).length === 0) {
        return { success: false };
      }

      await updateVirtualComputer(input.id, updates);
      return { success: true };
    }),
});
