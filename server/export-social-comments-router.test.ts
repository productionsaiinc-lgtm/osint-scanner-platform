import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportSocialCommentsRouter } from "./export-social-comments-router";
import { TRPCError } from "@trpc/server";

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Export Social Comments Router", () => {
  const mockContext = {
    user: { id: 1, role: "user" as const },
    req: {} as any,
    res: {} as any,
  };

  const caller = exportSocialCommentsRouter.createCaller(mockContext);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfiles", () => {
    it("should return social profiles", async () => {
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

      const result = await caller.getProfiles({ limit: 100 });
      expect(result.success).toBe(true);
      expect(Array.isArray(result.profiles)).toBe(true);
    });
  });

  describe("exportCSV", () => {
    it("should export profiles as CSV", async () => {
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

      const result = await caller.exportCSV({});
      expect(result.success).toBe(true);
      expect(result.fileName).toContain(".csv");
      expect(result.mimeType).toBe("text/csv");
    });
  });

  describe("exportJSON", () => {
    it("should export profiles as JSON", async () => {
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

      const result = await caller.exportJSON({});
      expect(result.success).toBe(true);
      expect(result.fileName).toContain(".json");
      expect(result.mimeType).toBe("application/json");
    });
  });

  describe("exportHTML", () => {
    it("should export profiles as HTML", async () => {
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

      const result = await caller.exportHTML({});
      expect(result.success).toBe(true);
      expect(result.fileName).toContain(".html");
      expect(result.mimeType).toBe("text/html");
      expect(result.data).toContain("<!DOCTYPE html>");
    });
  });

  describe("getStats", () => {
    it("should return export statistics", async () => {
      const { getDb } = await import("./db");
      vi.mocked(getDb).mockResolvedValue({
        select: () => ({
          from: () => ({
            where: () => Promise.resolve([]),
          }),
        }),
      } as any);

      const result = await caller.getStats({});
      expect(result.success).toBe(true);
      expect(result).toHaveProperty("totalProfiles");
      expect(result).toHaveProperty("platformStats");
      expect(result).toHaveProperty("totalFollowers");
      expect(result).toHaveProperty("totalFollowing");
    });
  });
});
