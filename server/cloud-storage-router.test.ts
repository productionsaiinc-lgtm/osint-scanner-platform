import { describe, it, expect, vi, beforeEach } from "vitest";
import { cloudStorageRouter } from "./cloud-storage-router";
import { TRPCError } from "@trpc/server";

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(),
  storageGet: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  ListObjectsV2Command: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

describe("Cloud Storage Router", () => {
  const mockContext = {
    user: { id: 1, role: "user" as const },
    req: {} as any,
    res: {} as any,
  };

  const caller = cloudStorageRouter.createCaller(mockContext);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return storage list structure", async () => {
      const { getDb } = await import("./db");
      vi.mocked(getDb).mockResolvedValue({
        select: () => ({
          from: () => ({
            where: () => ({
              orderBy: () => Promise.resolve([]),
            }),
          }),
        }),
      } as any);

      const result = await caller.list({ parentFolderId: null });
      expect(result).toHaveProperty("files");
      expect(result).toHaveProperty("storageUsed");
      expect(result).toHaveProperty("storageQuota");
      expect(Array.isArray(result.files)).toBe(true);
    });
  });

  describe("overview", () => {
    it("should return storage overview", async () => {
      const { getDb } = await import("./db");
      vi.mocked(getDb).mockResolvedValue({
        select: () => ({
          from: () => ({
            where: () => Promise.resolve([]),
          }),
        }),
      } as any);

      const result = await caller.overview();
      expect(result).toHaveProperty("usedBytes");
      expect(result).toHaveProperty("quotaBytes");
      expect(result.quotaGB).toBe(10);
    });
  });

  describe("createFolder", () => {
    it("should reject folder creation with empty name", async () => {
      await expect(caller.createFolder({ name: "" })).rejects.toThrow();
    });
  });

  describe("toggleShare", () => {
    it("should throw error for non-existent file", async () => {
      const { getDb } = await import("./db");
      vi.mocked(getDb).mockResolvedValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      } as any);

      await expect(caller.toggleShare({ fileId: 999 })).rejects.toThrow(
        TRPCError
      );
    });
  });

  describe("delete", () => {
    it("should throw error when deleting non-existent file", async () => {
      const { getDb } = await import("./db");
      vi.mocked(getDb).mockResolvedValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      } as any);

      await expect(caller.delete({ fileId: 999 })).rejects.toThrow(
        TRPCError
      );
    });
  });

  describe("rename", () => {
    it("should throw error when renaming non-existent file", async () => {
      const { getDb } = await import("./db");
      vi.mocked(getDb).mockResolvedValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      } as any);

      await expect(caller.rename({ fileId: 999, newName: "new.txt" })).rejects.toThrow(
        TRPCError
      );
    });
  });

  describe("syncHistory", () => {
    it("should return sync history", async () => {
      const { getDb } = await import("./db");
      vi.mocked(getDb).mockResolvedValue({
        select: () => ({
          from: () => ({
            where: () => ({
              orderBy: () => ({
                limit: () => Promise.resolve([]),
              }),
            }),
          }),
        }),
      } as any);

      const result = await caller.syncHistory({ limit: 20 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("listBackups", () => {
    it("should return list of backups", async () => {
      const { getDb } = await import("./db");
      vi.mocked(getDb).mockResolvedValue({
        select: () => ({
          from: () => ({
            where: () => ({
              orderBy: () => ({
                limit: () => Promise.resolve([]),
              }),
            }),
          }),
        }),
      } as any);

      const result = await caller.listBackups();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
