/**
 * GitHub Webhook Handler
 * Handles automatic syncing when commits are pushed to GitHub
 */

import { exec } from "child_process";
import crypto from "crypto";
import { promisify } from "util";

const execAsync = promisify(exec);
const DEFAULT_DEPLOY_BRANCH = "main";
const DEFAULT_INSTALL_COMMAND = "pnpm install --frozen-lockfile";
const DEFAULT_BUILD_COMMAND = "pnpm run build";

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
    added?: string[];
    modified?: string[];
    removed?: string[];
    author: {
      name: string;
      email: string;
    };
  }>;
}

export interface SyncResult {
  success: boolean;
  timestamp: string;
  branch: string;
  commits: number;
  message: string;
  error?: string;
}

interface DeployRunState {
  running: boolean;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastResult: SyncResult | null;
}

const deployRunState: DeployRunState = {
  running: false,
  lastStartedAt: null,
  lastFinishedAt: null,
  lastResult: null,
};

function getDeployBranch() {
  return process.env.GITHUB_DEPLOY_BRANCH || DEFAULT_DEPLOY_BRANCH;
}

function getChangedFiles(payload: GitHubWebhookPayload) {
  return payload.commits.flatMap((commit) => [
    ...(commit.added ?? []),
    ...(commit.modified ?? []),
    ...(commit.removed ?? []),
  ]);
}

async function runDeployCommand(command: string) {
  return execAsync(command, {
    cwd: process.cwd(),
    maxBuffer: 20 * 1024 * 1024,
    timeout: 10 * 60 * 1000,
  });
}

export function triggerGitHubDeploy(payload: GitHubWebhookPayload) {
  const branch = payload.ref?.split("/").pop() || "unknown";
  const commitCount = payload.commits?.length ?? 0;

  if (deployRunState.running) {
    return {
      accepted: false,
      timestamp: new Date().toISOString(),
      branch,
      commits: commitCount,
      message: "Deploy already running",
    };
  }

  deployRunState.running = true;
  deployRunState.lastStartedAt = new Date().toISOString();
  deployRunState.lastFinishedAt = null;

  void handleGitHubWebhook(payload)
    .then((result) => {
      deployRunState.lastResult = result;
    })
    .catch((error) => {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      deployRunState.lastResult = {
        success: false,
        timestamp: new Date().toISOString(),
        branch,
        commits: commitCount,
        message: "Deploy failed",
        error: errorMessage,
      };
    })
    .finally(() => {
      deployRunState.running = false;
      deployRunState.lastFinishedAt = new Date().toISOString();
    });

  return {
    accepted: true,
    timestamp: deployRunState.lastStartedAt,
    branch,
    commits: commitCount,
    message: "Deploy accepted",
  };
}

/**
 * Handle GitHub webhook push event
 */
export async function handleGitHubWebhook(payload: GitHubWebhookPayload): Promise<SyncResult> {
  const branch = payload.ref?.split("/").pop() || "unknown";
  const commitCount = payload.commits?.length ?? 0;

  try {
    const deployBranch = getDeployBranch();

    console.log(`[GitHub Webhook] Received push to ${branch} with ${commitCount} commits`);

    // Only sync the configured deployment branch.
    if (branch !== deployBranch) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        branch,
        commits: commitCount,
        message: `Only ${deployBranch} branch is auto-synced`,
      };
    }

    // Pull latest changes
    const remote = process.env.GITHUB_DEPLOY_REMOTE || "origin";
    const pullCommand = process.env.GITHUB_DEPLOY_PULL_COMMAND || `git pull ${remote} ${deployBranch}`;
    const { stdout, stderr } = await runDeployCommand(pullCommand);

    console.log(`[GitHub Webhook] Git pull output:`, stdout);

    if (stderr && !stderr.includes("Already up to date")) {
      console.error(`[GitHub Webhook] Git pull error:`, stderr);
    }

    // Install dependencies only when dependency metadata changed.
    const changedFiles = getChangedFiles(payload);
    const dependencyFilesChanged = changedFiles.some((file) =>
      ["package.json", "pnpm-lock.yaml", "package-lock.json", "yarn.lock", "patches/"].some((dependencyPath) =>
        file === dependencyPath || file.startsWith(dependencyPath)
      )
    );

    if (dependencyFilesChanged) {
      const installCommand = process.env.GITHUB_DEPLOY_INSTALL_COMMAND || DEFAULT_INSTALL_COMMAND;
      console.log("[GitHub Webhook] Dependency files changed, installing dependencies");
      await runDeployCommand(installCommand);
    }

    // Rebuild if needed
    const buildCommand = process.env.GITHUB_DEPLOY_BUILD_COMMAND || DEFAULT_BUILD_COMMAND;
    console.log("[GitHub Webhook] Rebuilding project");
    await runDeployCommand(buildCommand);

    const restartCommand = process.env.GITHUB_DEPLOY_RESTART_COMMAND;
    if (restartCommand) {
      console.log("[GitHub Webhook] Running restart command");
      await runDeployCommand(restartCommand);
    }

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
      branch,
      commits: commitCount,
      message: "Failed to sync from GitHub",
      error: errorMessage,
    };
  }
}

/**
 * Verify GitHub webhook signature
 */
export function verifyGitHubSignature(
  payload: Buffer | string,
  signature: string | undefined,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const digest = "sha256=" + hmac.digest("hex");
    if (!signature) return false;
    const signatureBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    if (signatureBuffer.length !== digestBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
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
  deploy: DeployRunState;
}> {
  try {
    const { stdout: branch } = await execAsync("git rev-parse --abbrev-ref HEAD", {
      cwd: process.cwd(),
    });

    const { stdout: status } = await execAsync("git status --porcelain", {
      cwd: process.cwd(),
    });

    const { stdout: behindCount } = await runDeployCommand(
      "git rev-list --count HEAD..origin/main",
    );

    return {
      lastSync: new Date().toISOString(),
      branch: branch.trim(),
      status: status.trim() || "up-to-date",
      commitsBehind: parseInt(behindCount) || 0,
      deploy: { ...deployRunState },
    };
  } catch (error) {
    console.error("Error getting sync status:", error);
    return {
      lastSync: null,
      branch: "unknown",
      status: "error",
      commitsBehind: 0,
      deploy: { ...deployRunState },
    };
  }
}

/**
 * Manually trigger sync
 */
export async function manualSync(): Promise<SyncResult> {
  try {
    console.log("[Manual Sync] Starting manual sync");

    const { stdout } = await runDeployCommand("git pull origin main");

    console.log("[Manual Sync] Git pull completed:", stdout);

    // Install dependencies
    await runDeployCommand(process.env.GITHUB_DEPLOY_INSTALL_COMMAND || DEFAULT_INSTALL_COMMAND);

    // Rebuild
    await runDeployCommand(process.env.GITHUB_DEPLOY_BUILD_COMMAND || DEFAULT_BUILD_COMMAND);

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
