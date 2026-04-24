import { describe, it, expect, beforeEach, vi } from "vitest";
import { virtualComputersRouter } from "./virtual-computers-router";
import * as db from "./db";

vi.mock("./db", () => ({
  createVirtualComputer: vi.fn(),
  getUserVirtualComputers: vi.fn(),
  updateVirtualComputer: vi.fn(),
  deleteVirtualComputer: vi.fn(),
}));

describe("Virtual Computers Router", () => {
  const mockUser = { id: 1, name: "Test User" };
  const mockContext = { user: mockUser };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a virtual computer with all parameters", async () => {
      const mockComputer = {
        id: 1,
        userId: 1,
        vmId: "vm-abc123",
        name: "Windows VM",
        osType: "windows",
        osVersion: "Windows 11",
        ram: 8192,
        storage: 256,
        cpu: 4,
        status: "stopped" as const,
        ipAddress: null,
        rdpPort: null,
        sshPort: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: null,
      };

      vi.mocked(db.createVirtualComputer).mockResolvedValue(mockComputer);

      const caller = virtualComputersRouter.createCaller(mockContext);
      const result = await caller.create({
        name: "Windows VM",
        osType: "windows",
        osVersion: "Windows 11",
        ram: 8192,
        storage: 256,
        cpu: 4,
      });

      expect(result.name).toBe("Windows VM");
      expect(result.status).toBe("stopped");
      expect(result.vmId).toBeTruthy();
      expect(db.createVirtualComputer).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          name: "Windows VM",
          osType: "windows",
        })
      );
    });

    it("should throw error if creation fails", async () => {
      vi.mocked(db.createVirtualComputer).mockResolvedValue(null);

      const caller = virtualComputersRouter.createCaller(mockContext);

      await expect(
        caller.create({
          name: "Test VM",
          osType: "linux",
          ram: 4096,
          storage: 100,
          cpu: 2,
        })
      ).rejects.toThrow("Failed to create virtual computer");
    });
  });

  describe("list", () => {
    it("should return user's virtual computers with uptime", async () => {
      const mockComputers = [
        {
          id: 1,
          userId: 1,
          vmId: "vm-1",
          name: "Linux VM",
          osType: "linux",
          osVersion: "Ubuntu 22.04",
          ram: 4096,
          storage: 100,
          cpu: 2,
          status: "running" as const,
          ipAddress: "192.168.1.10",
          rdpPort: null,
          sshPort: 22001,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      ];

      vi.mocked(db.getUserVirtualComputers).mockResolvedValue(mockComputers);

      const caller = virtualComputersRouter.createCaller(mockContext);
      const result = await caller.list();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Linux VM");
      expect(result[0].status).toBe("running");
      expect(result[0].uptime).toBeGreaterThanOrEqual(0);
    });

    it("should return empty array if no computers", async () => {
      vi.mocked(db.getUserVirtualComputers).mockResolvedValue([]);

      const caller = virtualComputersRouter.createCaller(mockContext);
      const result = await caller.list();

      expect(result).toEqual([]);
    });
  });

  describe("start", () => {
    it("should start a virtual computer and assign network resources", async () => {
      vi.mocked(db.updateVirtualComputer).mockResolvedValue(undefined);

      const caller = virtualComputersRouter.createCaller(mockContext);
      const result = await caller.start({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Virtual computer started");
      expect(db.updateVirtualComputer).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: "running",
          ipAddress: expect.stringMatching(/^192\.168\.1\.\d+$/),
          rdpPort: expect.any(Number),
          sshPort: expect.any(Number),
        })
      );
    });
  });

  describe("stop", () => {
    it("should stop a virtual computer", async () => {
      vi.mocked(db.updateVirtualComputer).mockResolvedValue(undefined);

      const caller = virtualComputersRouter.createCaller(mockContext);
      const result = await caller.stop({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Virtual computer stopped");
      expect(db.updateVirtualComputer).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: "stopped",
        })
      );
    });
  });

  describe("delete", () => {
    it("should delete a virtual computer", async () => {
      vi.mocked(db.deleteVirtualComputer).mockResolvedValue(undefined);

      const caller = virtualComputersRouter.createCaller(mockContext);
      const result = await caller.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Virtual computer deleted");
      expect(db.deleteVirtualComputer).toHaveBeenCalledWith(1);
    });
  });

  describe("update", () => {
    it("should update virtual computer name", async () => {
      vi.mocked(db.updateVirtualComputer).mockResolvedValue(undefined);

      const caller = virtualComputersRouter.createCaller(mockContext);
      const result = await caller.update({
        id: 1,
        name: "Updated VM Name",
      });

      expect(result.success).toBe(true);
      expect(db.updateVirtualComputer).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: "Updated VM Name",
        })
      );
    });

    it("should return false if no updates provided", async () => {
      const caller = virtualComputersRouter.createCaller(mockContext);
      const result = await caller.update({ id: 1 });

      expect(result.success).toBe(false);
      expect(db.updateVirtualComputer).not.toHaveBeenCalled();
    });
  });
});
