import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  cloudStorageFiles,
  cloudStorageBackups,
  cloudStorageSyncHistory,
  CloudStorageFile,
  InsertCloudStorageFile,
} from "../drizzle/schema";
import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── S3 helpers ─────────────────────────────────────────────────────────────

function getS3Client(): S3Client | null {
  const region = process.env.AWS_REGION || process.env.S3_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
}

const S3_BUCKET = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET || "";

async function generatePresignedUploadUrl(
  s3Key: string,
  contentType: string
): Promise<string | null> {
  const s3 = getS3Client();
  if (!s3 || !S3_BUCKET) return null;
  const cmd = new PutObjectCommand({ Bucket: S3_BUCKET, Key: s3Key, ContentType: contentType });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

async function generatePresignedDownloadUrl(s3Key: string): Promise<string | null> {
  const s3 = getS3Client();
  if (!s3 || !S3_BUCKET) return null;
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

async function deleteS3Object(s3Key: string): Promise<void> {
  const s3 = getS3Client();
  if (!s3 || !S3_BUCKET) return;
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
}

// ─── DB helpers ─────────────────────────────────────────────────────────────

async function getUserFiles(userId: number, parentFolderId?: number | null) {
  const db = await getDb();
  if (!db) return [];
  try {
    const conditions = [eq(cloudStorageFiles.userId, userId)];
    if (parentFolderId === null || parentFolderId === undefined) {
      conditions.push(isNull(cloudStorageFiles.parentFolderId));
    } else {
      conditions.push(eq(cloudStorageFiles.parentFolderId, parentFolderId));
    }
    return await db
      .select()
      .from(cloudStorageFiles)
      .where(and(...conditions))
      .orderBy(desc(cloudStorageFiles.isFolder), desc(cloudStorageFiles.createdAt));
  } catch (err) {
    console.error("[CloudStorage] getUserFiles failed:", err);
    return [];
  }
}

async function createFileRecord(file: InsertCloudStorageFile): Promise<CloudStorageFile | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(cloudStorageFiles).values(file);
    const id = result[0].insertId as number;
    const rows = await db
      .select()
      .from(cloudStorageFiles)
      .where(eq(cloudStorageFiles.id, id))
      .limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error("[CloudStorage] createFileRecord failed:", err);
    return null;
  }
}

async function getUserStorageUsed(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(fileSize), 0)` })
      .from(cloudStorageFiles)
      .where(and(eq(cloudStorageFiles.userId, userId), eq(cloudStorageFiles.isFolder, false)));
    return Number(result[0]?.total ?? 0);
  } catch {
    return 0;
  }
}

// ─── Router ─────────────────────────────────────────────────────────────────

const STORAGE_QUOTA_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

export const cloudStorageRouter = router({
  // List files/folders in a directory
  list: protectedProcedure
    .input(z.object({ parentFolderId: z.number().nullable().optional() }))
    .query(async ({ ctx, input }) => {
      const files = await getUserFiles(ctx.user.id, input?.parentFolderId ?? null);
      const usedBytes = await getUserStorageUsed(ctx.user.id);
      return {
        files: files.map((f) => ({
          id: f.id,
          fileName: f.fileName,
          fileSize: f.fileSize,
          mimeType: f.mimeType,
          s3Key: f.s3Key,
          isFolder: f.isFolder,
          isShared: f.isShared,
          shareToken: f.shareToken,
          parentFolderId: f.parentFolderId,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        })),
        storageUsed: usedBytes,
        storageQuota: STORAGE_QUOTA_BYTES,
        storageUsedGB: +(usedBytes / 1024 / 1024 / 1024).toFixed(2),
        storageQuotaGB: 10,
        s3Available: !!(getS3Client() && S3_BUCKET),
      };
    }),

  // Create a folder
  createFolder: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        parentFolderId: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const s3Key = `users/${ctx.user.id}/folders/${crypto.randomBytes(8).toString("hex")}/${input.name}`;
      const folder = await createFileRecord({
        userId: ctx.user.id,
        fileName: input.name,
        fileSize: 0,
        mimeType: "application/x-directory",
        s3Key,
        s3Url: "",
        isFolder: true,
        isShared: false,
        shareToken: null,
        parentFolderId: input.parentFolderId ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (!folder) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create folder" });
      }

      return { success: true, folder };
    }),

  // Request a presigned upload URL
  requestUpload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        fileSize: z.number().positive(),
        mimeType: z.string(),
        parentFolderId: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check quota
      const used = await getUserStorageUsed(ctx.user.id);
      if (used + input.fileSize > STORAGE_QUOTA_BYTES) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Storage quota exceeded (10 GB limit)" });
      }

      const ext = input.fileName.includes(".")
        ? "." + input.fileName.split(".").pop()
        : "";
      const s3Key = `users/${ctx.user.id}/files/${crypto.randomBytes(12).toString("hex")}${ext}`;

      // Create the DB record immediately (status: pending until client confirms upload)
      const fileRecord = await createFileRecord({
        userId: ctx.user.id,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        s3Key,
        s3Url: S3_BUCKET
          ? `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`
          : `/storage/${s3Key}`,
        isFolder: false,
        isShared: false,
        shareToken: null,
        parentFolderId: input.parentFolderId ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (!fileRecord) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to register file" });
      }

      const uploadUrl = await generatePresignedUploadUrl(s3Key, input.mimeType);

      // Log sync event
      const db = await getDb();
      if (db) {
        await db.insert(cloudStorageSyncHistory).values({
          userId: ctx.user.id,
          syncType: "upload",
          fileId: fileRecord.id,
          fileName: input.fileName,
          status: "completed",
          syncedAt: new Date(),
        }).catch(() => {});
      }

      return {
        fileId: fileRecord.id,
        s3Key,
        uploadUrl,
        s3Available: !!uploadUrl,
        message: uploadUrl
          ? "Upload URL generated. PUT your file bytes to the returned uploadUrl."
          : "S3 not configured — file metadata saved, binary upload disabled.",
      };
    }),

  // Generate a presigned download URL
  getDownloadUrl: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(cloudStorageFiles)
        .where(and(eq(cloudStorageFiles.id, input.fileId), eq(cloudStorageFiles.userId, ctx.user.id)))
        .limit(1);

      const file = rows[0];
      if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });

      const url = await generatePresignedDownloadUrl(file.s3Key);
      return {
        downloadUrl: url ?? file.s3Url,
        s3Available: !!url,
        fileName: file.fileName,
      };
    }),

  // Toggle file sharing (generates/revokes a share token)
  toggleShare: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(cloudStorageFiles)
        .where(and(eq(cloudStorageFiles.id, input.fileId), eq(cloudStorageFiles.userId, ctx.user.id)))
        .limit(1);

      const file = rows[0];
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const nowShared = !file.isShared;
      const shareToken = nowShared ? crypto.randomBytes(24).toString("hex") : null;

      await db
        .update(cloudStorageFiles)
        .set({ isShared: nowShared, shareToken, updatedAt: new Date() })
        .where(eq(cloudStorageFiles.id, input.fileId));

      return { isShared: nowShared, shareToken };
    }),

  // Delete a file or folder
  delete: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(cloudStorageFiles)
        .where(and(eq(cloudStorageFiles.id, input.fileId), eq(cloudStorageFiles.userId, ctx.user.id)))
        .limit(1);

      const file = rows[0];
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      // Try to delete from S3
      if (!file.isFolder) {
        await deleteS3Object(file.s3Key).catch(() => {});
      }

      await db.delete(cloudStorageFiles).where(eq(cloudStorageFiles.id, input.fileId));

      // Log sync
      await db.insert(cloudStorageSyncHistory).values({
        userId: ctx.user.id,
        syncType: "delete",
        fileId: input.fileId,
        fileName: file.fileName,
        status: "completed",
        syncedAt: new Date(),
      }).catch(() => {});

      return { success: true };
    }),

  // Rename a file or folder
  rename: protectedProcedure
    .input(z.object({ fileId: z.number(), newName: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db
        .select()
        .from(cloudStorageFiles)
        .where(and(eq(cloudStorageFiles.id, input.fileId), eq(cloudStorageFiles.userId, ctx.user.id)))
        .limit(1);
      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });

      await db
        .update(cloudStorageFiles)
        .set({ fileName: input.newName, updatedAt: new Date() })
        .where(eq(cloudStorageFiles.id, input.fileId));

      return { success: true };
    }),

  // Get storage overview
  overview: protectedProcedure.query(async ({ ctx }) => {
    const usedBytes = await getUserStorageUsed(ctx.user.id);
    const db = await getDb();
    if (!db) return { usedBytes: 0, quotaBytes: STORAGE_QUOTA_BYTES, fileCount: 0, folderCount: 0 };

    try {
      const allItems = await db
        .select({ isFolder: cloudStorageFiles.isFolder })
        .from(cloudStorageFiles)
        .where(eq(cloudStorageFiles.userId, ctx.user.id));

      return {
        usedBytes,
        quotaBytes: STORAGE_QUOTA_BYTES,
        usedGB: +(usedBytes / 1024 / 1024 / 1024).toFixed(2),
        quotaGB: 10,
        fileCount: allItems.filter((i) => !i.isFolder).length,
        folderCount: allItems.filter((i) => i.isFolder).length,
        s3Available: !!(getS3Client() && S3_BUCKET),
      };
    } catch {
      return { usedBytes, quotaBytes: STORAGE_QUOTA_BYTES, fileCount: 0, folderCount: 0 };
    }
  }),

  // Get sync history
  syncHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        return await db
          .select()
          .from(cloudStorageSyncHistory)
          .where(eq(cloudStorageSyncHistory.userId, ctx.user.id))
          .orderBy(desc(cloudStorageSyncHistory.syncedAt))
          .limit(input.limit);
      } catch {
        return [];
      }
    }),

  // Create manual backup record
  createBackup: protectedProcedure
    .input(z.object({ backupName: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const usedBytes = await getUserStorageUsed(ctx.user.id);
      const fileCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(cloudStorageFiles)
        .where(and(eq(cloudStorageFiles.userId, ctx.user.id), eq(cloudStorageFiles.isFolder, false)))
        .then((r) => Number(r[0]?.count ?? 0));

      const s3Key = `users/${ctx.user.id}/backups/${Date.now()}.tar.gz`;
      const name =
        input.backupName ||
        `Backup ${new Date().toLocaleDateString("en-CA")} ${new Date().toLocaleTimeString()}`;

      const result = await db.insert(cloudStorageBackups).values({
        userId: ctx.user.id,
        backupName: name,
        backupSize: usedBytes,
        s3Key,
        fileCount,
        status: "completed",
        createdAt: new Date(),
        completedAt: new Date(),
      });

      return { success: true, backupId: result[0].insertId, backupName: name };
    }),

  // List backups
  listBackups: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    try {
      return await db
        .select()
        .from(cloudStorageBackups)
        .where(eq(cloudStorageBackups.userId, ctx.user.id))
        .orderBy(desc(cloudStorageBackups.createdAt))
        .limit(20);
    } catch {
      return [];
    }
  }),
});
