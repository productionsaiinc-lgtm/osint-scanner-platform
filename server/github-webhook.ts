import { Router } from "express";
import crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = Router();

/**
 * GitHub Webhook Handler
 * Triggered on push events to automatically build, test, and deploy
 * 
 * Setup Instructions:
 * 1. Go to https://github.com/YOUR_USERNAME/osint-scanner-platform/settings/hooks
 * 2. Click "Add webhook"
 * 3. Payload URL: https://osintscan-fftqerzj.manus.space/api/github/webhook
 * 4. Content type: application/json
 * 5. Secret: Use the GITHUB_WEBHOOK_SECRET from your environment
 * 6. Events: Select "Push events"
 * 7. Save
 */

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "your-secret-here";

// Verify GitHub webhook signature
function verifyGitHubSignature(
  req: any,
  secret: string
): boolean {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const payload = JSON.stringify(req.body);
  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const expected = `sha256=${hash}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// GitHub webhook endpoint
router.post("/webhook", async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifyGitHubSignature(req, GITHUB_WEBHOOK_SECRET)) {
      console.warn("[GitHub Webhook] Invalid signature");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`[GitHub Webhook] Received ${event} event from ${payload.repository?.full_name}`);

    // Only process push events
    if (event !== "push") {
      return res.json({ status: "ignored", reason: `Event type: ${event}` });
    }

    const branch = payload.ref?.split("/").pop();
    console.log(`[GitHub Webhook] Push to branch: ${branch}`);

    // Only deploy from main branch
    if (branch !== "main") {
      return res.json({ status: "ignored", reason: "Not main branch" });
    }

    console.log("[GitHub Webhook] Starting build and deploy pipeline...");

    // Execute build pipeline in background (don't wait for response)
    triggerBuildPipeline().catch((error) => {
      console.error("[GitHub Webhook] Pipeline error:", error);
    });

    // Return success immediately
    return res.json({
      status: "accepted",
      message: "Build pipeline triggered",
      branch: branch,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GitHub Webhook] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Trigger the build, test, and deploy pipeline
 */
async function triggerBuildPipeline() {
  try {
    const projectPath = "/home/ubuntu/osint-scanner-platform";

    console.log("[Pipeline] Step 1: Pulling latest changes from GitHub...");
    await execAsync(`cd ${projectPath} && git pull user_github main`);
    console.log("[Pipeline] ✓ Git pull completed");

    console.log("[Pipeline] Step 2: Installing dependencies...");
    await execAsync(`cd ${projectPath} && pnpm install --frozen-lockfile`, {
      timeout: 300000, // 5 minutes
    });
    console.log("[Pipeline] ✓ Dependencies installed");

    console.log("[Pipeline] Step 3: Running tests...");
    await execAsync(`cd ${projectPath} && pnpm test --run`, {
      timeout: 300000, // 5 minutes
    });
    console.log("[Pipeline] ✓ All tests passed");

    console.log("[Pipeline] Step 4: Building project...");
    await execAsync(`cd ${projectPath} && pnpm build`, {
      timeout: 300000, // 5 minutes
    });
    console.log("[Pipeline] ✓ Build completed");

    console.log("[Pipeline] Step 5: Deployment triggered via Manus platform...");
    // Note: Actual deployment is handled by Manus platform automatically
    // when code is pushed to the repository
    console.log("[Pipeline] ✓ Deployment queued");

    console.log("[Pipeline] ✅ Build pipeline completed successfully!");
    return { success: true, message: "Pipeline completed" };
  } catch (error: any) {
    console.error("[Pipeline] ❌ Pipeline failed:", error.message);
    throw error;
  }
}

// Manual trigger endpoint (for testing)
router.post("/trigger", async (req, res) => {
  try {
    console.log("[GitHub Webhook] Manual trigger requested");

    triggerBuildPipeline().catch((error) => {
      console.error("[GitHub Webhook] Pipeline error:", error);
    });

    return res.json({
      status: "accepted",
      message: "Build pipeline triggered manually",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    webhook: "github",
    timestamp: new Date().toISOString(),
  });
});

export default router;
