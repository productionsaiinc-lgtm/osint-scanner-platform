import { describe, it, expect, beforeEach, vi } from "vitest";
import { urlShortenerRouter } from "./url-shortener-router";
import * as db from "./db";

// Mock the database module
vi.mock("./db", () => ({
  createShortenedUrl: vi.fn(),
  getShortenedUrl: vi.fn(),
  getUserShortenedUrls: vi.fn(),
  updateShortenedUrl: vi.fn(),
  deleteShortenedUrl: vi.fn(),
}));

describe("URL Shortener Router", () => {
  const mockUser = { id: 1, name: "Test User" };
  const mockContext = { user: mockUser };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a shortened URL with custom alias", async () => {
      const mockUrl = {
        id: 1,
        userId: 1,
        shortCode: "custom",
        originalUrl: "https://example.com/very/long/url",
        customAlias: "custom",
        title: "My Link",
        description: "Test link",
        clickCount: 0,
        isActive: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createShortenedUrl).mockResolvedValue(mockUrl);

      const caller = urlShortenerRouter.createCaller(mockContext);
      const result = await caller.create({
        originalUrl: "https://example.com/very/long/url",
        customAlias: "custom",
        title: "My Link",
        description: "Test link",
      });

      expect(result).toEqual({
        id: 1,
        shortCode: "custom",
        shortUrl: "https://osintscan.short/custom",
        originalUrl: "https://example.com/very/long/url",
      });

      expect(db.createShortenedUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          shortCode: "custom",
          originalUrl: "https://example.com/very/long/url",
        })
      );
    });

    it("should generate a short code if custom alias not provided", async () => {
      const mockUrl = {
        id: 1,
        userId: 1,
        shortCode: "abc123",
        originalUrl: "https://example.com/url",
        customAlias: null,
        title: null,
        description: null,
        clickCount: 0,
        isActive: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createShortenedUrl).mockResolvedValue(mockUrl);

      const caller = urlShortenerRouter.createCaller(mockContext);
      const result = await caller.create({
        originalUrl: "https://example.com/url",
      });

      expect(result.shortCode).toBeTruthy();
      expect(result.shortCode.length).toBeGreaterThan(0);
      expect(result.originalUrl).toBe("https://example.com/url");
    });

    it("should throw error if URL creation fails", async () => {
      vi.mocked(db.createShortenedUrl).mockResolvedValue(null);

      const caller = urlShortenerRouter.createCaller(mockContext);

      await expect(
        caller.create({
          originalUrl: "https://example.com/url",
        })
      ).rejects.toThrow("Failed to create shortened URL");
    });
  });

  describe("list", () => {
    it("should return user's shortened URLs", async () => {
      const mockUrls = [
        {
          id: 1,
          userId: 1,
          shortCode: "link1",
          originalUrl: "https://example.com/1",
          customAlias: null,
          title: "Link 1",
          description: null,
          clickCount: 5,
          isActive: true,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          shortCode: "link2",
          originalUrl: "https://example.com/2",
          customAlias: null,
          title: "Link 2",
          description: null,
          clickCount: 10,
          isActive: true,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getUserShortenedUrls).mockResolvedValue(mockUrls);

      const caller = urlShortenerRouter.createCaller(mockContext);
      const result = await caller.list();

      expect(result).toHaveLength(2);
      expect(result[0].shortCode).toBe("link1");
      expect(result[1].clickCount).toBe(10);
    });

    it("should return empty array if user has no URLs", async () => {
      vi.mocked(db.getUserShortenedUrls).mockResolvedValue([]);

      const caller = urlShortenerRouter.createCaller(mockContext);
      const result = await caller.list();

      expect(result).toEqual([]);
    });
  });

  describe("get", () => {
    it("should return URL details for valid short code", async () => {
      const mockUrl = {
        id: 1,
        userId: 1,
        shortCode: "test123",
        originalUrl: "https://example.com/test",
        customAlias: null,
        title: "Test",
        description: null,
        clickCount: 3,
        isActive: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getShortenedUrl).mockResolvedValue(mockUrl);

      const caller = urlShortenerRouter.createCaller(mockContext);
      const result = await caller.get({ shortCode: "test123" });

      expect(result).toEqual(mockUrl);
    });

    it("should throw error if URL not found", async () => {
      vi.mocked(db.getShortenedUrl).mockResolvedValue(null);

      const caller = urlShortenerRouter.createCaller(mockContext);

      await expect(caller.get({ shortCode: "notfound" })).rejects.toThrow(
        "URL not found"
      );
    });

    it("should throw error if URL belongs to different user", async () => {
      const mockUrl = {
        id: 1,
        userId: 999, // Different user
        shortCode: "test123",
        originalUrl: "https://example.com/test",
        customAlias: null,
        title: "Test",
        description: null,
        clickCount: 0,
        isActive: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getShortenedUrl).mockResolvedValue(mockUrl);

      const caller = urlShortenerRouter.createCaller(mockContext);

      await expect(caller.get({ shortCode: "test123" })).rejects.toThrow(
        "URL not found"
      );
    });
  });

  describe("delete", () => {
    it("should delete a shortened URL", async () => {
      vi.mocked(db.deleteShortenedUrl).mockResolvedValue(undefined);

      const caller = urlShortenerRouter.createCaller(mockContext);
      const result = await caller.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(db.deleteShortenedUrl).toHaveBeenCalledWith(1);
    });
  });

  describe("update", () => {
    it("should update URL title and description", async () => {
      vi.mocked(db.updateShortenedUrl).mockResolvedValue(undefined);

      const caller = urlShortenerRouter.createCaller(mockContext);
      const result = await caller.update({
        id: 1,
        title: "Updated Title",
        description: "Updated Description",
      });

      expect(result.success).toBe(true);
      expect(db.updateShortenedUrl).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: "Updated Title",
          description: "Updated Description",
        })
      );
    });

    it("should return false if no updates provided", async () => {
      const caller = urlShortenerRouter.createCaller(mockContext);
      const result = await caller.update({ id: 1 });

      expect(result.success).toBe(false);
      expect(db.updateShortenedUrl).not.toHaveBeenCalled();
    });

    it("should update isActive status", async () => {
      vi.mocked(db.updateShortenedUrl).mockResolvedValue(undefined);

      const caller = urlShortenerRouter.createCaller(mockContext);
      const result = await caller.update({
        id: 1,
        isActive: false,
      });

      expect(result.success).toBe(true);
      expect(db.updateShortenedUrl).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          isActive: false,
        })
      );
    });
  });
});
