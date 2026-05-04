import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { socialMediaProfiles } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { ErrorHandler } from "./error-handler";

/**
 * Export Social Comments Router
 * Handles exporting social media comments and profiles in various formats
 */
export const exportSocialCommentsRouter = router({
  // Get social media profiles for export
  getProfiles: protectedProcedure
    .input(
      z.object({
        scanId: z.number().optional(),
        platform: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        const conditions = [];
        if (input.scanId) {
          conditions.push(eq(socialMediaProfiles.scanId, input.scanId));
        }
        if (input.platform) {
          conditions.push(eq(socialMediaProfiles.platform, input.platform));
        }

        const profiles = await db
          .select()
          .from(socialMediaProfiles)
          .where(conditions.length > 0 ? conditions[0] : undefined)
          .orderBy(desc(socialMediaProfiles.createdAt))
          .limit(input.limit);

        return {
          success: true,
          count: profiles.length,
          profiles: profiles.map((p) => ({
            id: p.id,
            username: p.username,
            platform: p.platform,
            displayName: p.displayName,
            profileUrl: p.profileUrl,
            bio: p.bio,
            followers: p.followers,
            following: p.following,
            profileData: p.profileData ? JSON.parse(p.profileData) : null,
            createdAt: p.createdAt,
          })),
        };
      } catch (error) {
        ErrorHandler.handleNetworkError(error, "Get Social Profiles");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch social profiles",
        });
      }
    }),

  // Export profiles as CSV
  exportCSV: protectedProcedure
    .input(
      z.object({
        scanId: z.number().optional(),
        platform: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        const conditions = [];
        if (input.scanId) {
          conditions.push(eq(socialMediaProfiles.scanId, input.scanId));
        }
        if (input.platform) {
          conditions.push(eq(socialMediaProfiles.platform, input.platform));
        }

        const profiles = await db
          .select()
          .from(socialMediaProfiles)
          .where(conditions.length > 0 ? conditions[0] : undefined)
          .orderBy(desc(socialMediaProfiles.createdAt));

        // Generate CSV
        const headers = [
          "Username",
          "Platform",
          "Display Name",
          "Profile URL",
          "Bio",
          "Followers",
          "Following",
          "Created At",
        ];
        const rows = profiles.map((p) => [
          p.username,
          p.platform,
          p.displayName || "",
          p.profileUrl || "",
          (p.bio || "").replace(/"/g, '""'), // Escape quotes
          p.followers || 0,
          p.following || 0,
          p.createdAt.toISOString(),
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row) =>
            row
              .map((cell) =>
                typeof cell === "string" && cell.includes(",")
                  ? `"${cell}"`
                  : cell
              )
              .join(",")
          ),
        ].join("\n");

        return {
          success: true,
          data: csv,
          fileName: `social-profiles-${Date.now()}.csv`,
          mimeType: "text/csv",
        };
      } catch (error) {
        ErrorHandler.handleNetworkError(error, "Export Social Comments CSV");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export social profiles as CSV",
        });
      }
    }),

  // Export profiles as JSON
  exportJSON: protectedProcedure
    .input(
      z.object({
        scanId: z.number().optional(),
        platform: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        const conditions = [];
        if (input.scanId) {
          conditions.push(eq(socialMediaProfiles.scanId, input.scanId));
        }
        if (input.platform) {
          conditions.push(eq(socialMediaProfiles.platform, input.platform));
        }

        const profiles = await db
          .select()
          .from(socialMediaProfiles)
          .where(conditions.length > 0 ? conditions[0] : undefined)
          .orderBy(desc(socialMediaProfiles.createdAt));

        const data = {
          exportDate: new Date().toISOString(),
          totalProfiles: profiles.length,
          profiles: profiles.map((p) => ({
            id: p.id,
            username: p.username,
            platform: p.platform,
            displayName: p.displayName,
            profileUrl: p.profileUrl,
            bio: p.bio,
            followers: p.followers,
            following: p.following,
            profileData: p.profileData ? JSON.parse(p.profileData) : null,
            createdAt: p.createdAt.toISOString(),
          })),
        };

        return {
          success: true,
          data: JSON.stringify(data, null, 2),
          fileName: `social-profiles-${Date.now()}.json`,
          mimeType: "application/json",
        };
      } catch (error) {
        ErrorHandler.handleNetworkError(error, "Export Social Comments JSON");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export social profiles as JSON",
        });
      }
    }),

  // Export profiles as HTML report
  exportHTML: protectedProcedure
    .input(
      z.object({
        scanId: z.number().optional(),
        platform: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        const conditions = [];
        if (input.scanId) {
          conditions.push(eq(socialMediaProfiles.scanId, input.scanId));
        }
        if (input.platform) {
          conditions.push(eq(socialMediaProfiles.platform, input.platform));
        }

        const profiles = await db
          .select()
          .from(socialMediaProfiles)
          .where(conditions.length > 0 ? conditions[0] : undefined)
          .orderBy(desc(socialMediaProfiles.createdAt));

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Media Profiles Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 2px solid #ff00ff; padding-bottom: 10px; }
    .export-info { background: #f0f0f0; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #ff00ff; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f9f9f9; }
    .platform-tag { display: inline-block; padding: 4px 8px; background: #ffff00; color: #000; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .profile-link { color: #ff00ff; text-decoration: none; }
    .profile-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Social Media Profiles Export Report</h1>
    <div class="export-info">
      <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Total Profiles:</strong> ${profiles.length}</p>
      <p><strong>Platforms:</strong> ${[...new Set(profiles.map((p) => p.platform))].join(", ")}</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Platform</th>
          <th>Display Name</th>
          <th>Followers</th>
          <th>Following</th>
          <th>Bio</th>
          <th>Profile URL</th>
        </tr>
      </thead>
      <tbody>
        ${profiles
          .map(
            (p) => `
        <tr>
          <td><strong>${p.username}</strong></td>
          <td><span class="platform-tag">${p.platform}</span></td>
          <td>${p.displayName || "N/A"}</td>
          <td>${p.followers || 0}</td>
          <td>${p.following || 0}</td>
          <td>${(p.bio || "").substring(0, 100)}${(p.bio || "").length > 100 ? "..." : ""}</td>
          <td><a href="${p.profileUrl}" class="profile-link" target="_blank">View Profile</a></td>
        </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </div>
</body>
</html>
        `;

        return {
          success: true,
          data: html,
          fileName: `social-profiles-${Date.now()}.html`,
          mimeType: "text/html",
        };
      } catch (error) {
        ErrorHandler.handleNetworkError(error, "Export Social Comments HTML");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export social profiles as HTML",
        });
      }
    }),

  // Get export statistics
  getStats: protectedProcedure
    .input(
      z.object({
        scanId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        const profiles = await db
          .select()
          .from(socialMediaProfiles)
          .where(
            input.scanId
              ? eq(socialMediaProfiles.scanId, input.scanId)
              : undefined
          );

        const platformStats = profiles.reduce(
          (acc, p) => {
            if (!acc[p.platform]) {
              acc[p.platform] = 0;
            }
            acc[p.platform]++;
            return acc;
          },
          {} as Record<string, number>
        );

        const totalFollowers = profiles.reduce((acc, p) => acc + (p.followers || 0), 0);
        const totalFollowing = profiles.reduce((acc, p) => acc + (p.following || 0), 0);

        return {
          success: true,
          totalProfiles: profiles.length,
          platformStats,
          totalFollowers,
          totalFollowing,
          averageFollowers: profiles.length > 0 ? Math.round(totalFollowers / profiles.length) : 0,
          averageFollowing: profiles.length > 0 ? Math.round(totalFollowing / profiles.length) : 0,
        };
      } catch (error) {
        ErrorHandler.handleNetworkError(error, "Get Export Statistics");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get export statistics",
        });
      }
    }),
});
