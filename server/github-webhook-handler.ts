/**
 * GitHub Webhook Handler
 * Handles automatic syncing when commits are pushed to GitHub
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface GitHubWebhookPayload {
  ref: string;
  before: string;
  after: string;
  repository: {
    name: string;
    full_name: string;
    url: string;
  };
  pusher: {
    name: string;
    email: string;
  };
  commits: Array<{
    id: string;
    message: string;
    timestamp: string;
    author: {
      name: string;
      email: string;
    };
  }>;
}

interface SyncResult {
  success: boolean;
  timestamp: string;
  branch: string;
  commits: number;
  message: string;
  error?: string;
}

/**
 * Handle GitHub webhook push event
 */
export async function handleGitHubWebhook(payload: GitHubWebhookPayload): Promise<SyncResult> {
  try {
    const branch = payload.ref.split("/").pop() || "main";
    const commitCount = payload.commits.length;

    console.log(`[GitHub Webhook] Received push to ${branch} with ${commitCount} commits`);

    // Only sync main branch
    if (branch !== "main") {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        branch,
        commits: commitCount,
        message: "Only main branch is auto-synced",
      };
    }

    // Pull latest changes
    const { stdout, stderr } = await execAsync("git pull origin main", {
      cwd: process.cwd(),
    });

    console.log(`[GitHub Webhook] Git pull output:`, stdout);

    if (stderr && !stderr.includes("Already up to date")) {
      console.error(`[GitHub Webhook] Git pull error:`, stderr);
    }

    // Install dependencies if package.json changed
    const packageJsonChanged = payload.commits.some((commit) =>
      commit.message.includes("package.json") || commit.message.includes("dependencies")
    );

    if (packageJsonChanged) {
      console.log("[GitHub Webhook] package.json changed, installing dependencies");
      await execAsync("pnpm install", { cwd: process.cwd() });
    }

    // Rebuild if needed
    console.log("[GitHub Webhook] Rebuilding project");
    await execAsync("pnpm build", { cwd: process.cwd() });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      branch,
      commits: commitCount,
      message: `Successfully synced ${commitCount} commits from ${branch}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[GitHub Webhook] Error:", errorMessage);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      branch: payload.ref.split("/").pop() || "unknown",
      commits: payload.commits.length,
      message: "Failed to sync from GitHub",
      error: errorMessage,
    };
  }
}

/**
 * Verify GitHub webhook signature
 */
export function verifyGitHubSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const digest = "sha256=" + hmac.digest("hex");

    return signature === digest;
  } catch (error) {
    console.error("Error verifying GitHub signature:", error);
    return false;
  }
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  lastSync: string | null;
  branch: string;
  status: string;
  commitsBehind: number;
}> {
  try {
    const { stdout: branch } = await execAsync("git rev-parse --abbrev-ref HEAD", {
      cwd: process.cwd(),
    });

    const { stdout: status } = await execAsync("git status --porcelain", {
      cwd: process.cwd(),
    });

    const { stdout: behindCount } = await execAsync(
      "git rev-list --count HEAD..origin/main",
      { cwd: process.cwd() }
    );

    return {
      lastSync: new Date().toISOString(),
      branch: branch.trim(),
      status: status.trim() || "up-to-date",
      commitsBehind: parseInt(behindCount) || 0,
    };
  } catch (error) {
    console.error("Error getting sync status:", error);
    return {
      lastSync: null,
      branch: "unknown",
      status: "error",
      commitsBehind: 0,
    };
  }
}

/**
 * Manually trigger sync
 */
export async function manualSync(): Promise<SyncResult> {
  try {
    console.log("[Manual Sync] Starting manual sync");

    const { stdout } = await execAsync("git pull origin main", { cwd: process.cwd() });

    console.log("[Manual Sync] Git pull completed:", stdout);

    // Install dependencies
    await execAsync("pnpm install", { cwd: process.cwd() });

    // Rebuild
    await execAsync("pnpm build", { cwd: process.cwd() });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      branch: "main",
      commits: 0,
      message: "Manual sync completed successfully",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Manual Sync] Error:", errorMessage);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      branch: "main",
      commits: 0,
      message: "Manual sync failed",
      error: errorMessage,
    };
  }
}

/**
 * Get commit history
 */
export async function getCommitHistory(limit: number = 10): Promise<
  Array<{
    hash: string;
    author: string;
    message: string;
    date: string;
  }>
> {
  try {
    const { stdout } = await execAsync(
      `git log -${limit} --format="%H|%an|%s|%ai"`,
      { cwd: process.cwd() }
    );

    return stdout
      .trim()
      .split("\n")
      .map((line) => {
        const [hash, author, message, date] = line.split("|");
        return { hash, author, message, date };
      });
  } catch (error) {
    console.error("Error getting commit history:", error);
    return [];
  }
}
