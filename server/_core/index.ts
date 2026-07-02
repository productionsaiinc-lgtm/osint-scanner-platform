import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerStripeWebhook } from "../stripe-webhook";
import { registerPayoutWebhook } from "../payout-webhook";
import { ensureMonitoringTables } from "../migrations/create-monitoring-tables";
import { ensureMediumPriorityTables } from "../migrations/create-medium-priority-tables";
import { ensureMdmTables } from "../migrations/create-mdm-tables";
import { recordCanaryTrigger } from "../canary-trigger-service";
import { getSyncStatus, triggerGitHubDeploy, verifyGitHubSignature } from "../github-webhook-handler";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Run database migrations on startup
  console.log("[Server] Running database migrations...");
  await ensureMonitoringTables();
  await ensureMediumPriorityTables();
  await ensureMdmTables();
  
  const app = express();
  const server = createServer(app);
  
  // CRITICAL: Register webhooks BEFORE express.json() to preserve raw body for signature verification
  registerStripeWebhook(app);
  registerPayoutWebhook(app);
  app.post("/api/webhooks/github/deploy", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(503).json({
        success: false,
        error: "GitHub deploy webhook is not configured",
      });
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
    const signature = req.get("x-hub-signature-256");
    if (!verifyGitHubSignature(rawBody, signature, secret)) {
      return res.status(401).json({
        success: false,
        error: "Invalid GitHub webhook signature",
      });
    }

    const event = req.get("x-github-event");
    if (event === "ping") {
      return res.json({ success: true, message: "GitHub deploy webhook is ready" });
    }

    if (event !== "push") {
      return res.status(202).json({
        success: true,
        message: `Ignored GitHub ${event || "unknown"} event`,
      });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({
        success: false,
        error: "Invalid JSON payload",
      });
    }

    const result = triggerGitHubDeploy(payload);
    return res.status(result.accepted ? 202 : 409).json(result);
  });

  app.get("/api/webhooks/github/deploy/status", async (_req, res) => {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(503).json({
        success: false,
        error: "GitHub deploy webhook is not configured",
      });
    }

    const authHeader = _req.get("authorization") || "";
    if (authHeader !== `Bearer ${secret}`) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const status = await getSyncStatus();
    return res.json({ success: true, ...status });
  });
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // URL Shortener Redirect Endpoint
  app.get("/s/:shortCode", async (req, res) => {
    try {
      const { shortCode } = req.params;
      const { getShortenedUrl, updateShortenedUrl } = await import("../db");
      
      const urlRecord = await getShortenedUrl(shortCode);
      
      if (!urlRecord) {
        return res.status(404).json({ error: "Short URL not found" });
      }
      
      // Check if URL is expired
      if (urlRecord.expiresAt && new Date(urlRecord.expiresAt) < new Date()) {
        return res.status(410).json({ error: "Short URL has expired" });
      }
      
      // Increment click count
      const newClickCount = (urlRecord.clickCount || 0) + 1;
      await updateShortenedUrl(urlRecord.id, { clickCount: newClickCount });
      
      // Redirect to original URL
      res.redirect(301, urlRecord.originalUrl);
    } catch (error) {
      console.error("[URL Shortener] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Canary Token Trigger Endpoint
  app.get("/api/canary/:tokenId", async (req, res) => {
    try {
      const { tokenId } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"];
      const referer = req.headers["referer"];

      // Get token to find userId
      const { getCanaryToken } = await import("../db");
      const token = await getCanaryToken(tokenId, 0); // userId will be updated after fetch

      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }

      // Record the trigger
      await recordCanaryTrigger({
        tokenId,
        userId: token.userId,
        ipAddress,
        userAgent: userAgent as string,
        referer: referer as string,
      });

      // Return a 1x1 pixel image or redirect
      res.set("Content-Type", "image/gif");
      res.send(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"));
    } catch (error) {
      console.error("[Canary Trigger] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // MDM Real Device Enrollment Endpoint
  app.get("/api/mdm/enroll/:token", async (req, res) => {
    const { token } = req.params;
    res.type("html").send(`<!doctype html>
<html>
  <head>
    <title>MDM Device Enrollment</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, sans-serif; background: #050816; color: #e5f7ff; padding: 24px; }
      main { max-width: 680px; margin: 0 auto; border: 1px solid #155e75; border-radius: 8px; padding: 24px; background: rgba(8, 13, 35, .92); }
      code, pre { background: #020617; color: #67e8f9; padding: 12px; border-radius: 6px; display: block; overflow-x: auto; }
      button { background: #0891b2; color: white; border: 0; border-radius: 6px; padding: 10px 14px; font-weight: 600; }
      input, select { width: 100%; margin: 6px 0 12px; padding: 10px; border-radius: 6px; border: 1px solid #155e75; background: #020617; color: white; }
      label { color: #a5f3fc; font-size: 13px; }
      .muted { color: #94a3b8; }
    </style>
  </head>
  <body>
    <main>
      <h1>MDM Device Enrollment</h1>
      <p class="muted">Submit this form from the real device to complete enrollment. Device metadata is recorded in the MDM dashboard.</p>
      <form id="enroll">
        <label>Device ID</label>
        <input name="deviceId" required placeholder="serial, asset tag, hostname, or UUID" />
        <label>Device Name</label>
        <input name="deviceName" required placeholder="Corp-Phone-001" />
        <label>Device Type</label>
        <select name="deviceType">
          <option value="android">android</option>
          <option value="ios">ios</option>
          <option value="windows">windows</option>
          <option value="macos">macos</option>
          <option value="linux">linux</option>
        </select>
        <label>OS Version</label>
        <input name="osVersion" placeholder="17.4" />
        <label>Manufacturer</label>
        <input name="manufacturer" placeholder="Apple, Samsung, Dell..." />
        <label>Model</label>
        <input name="model" placeholder="iPhone 15, Galaxy S24..." />
        <label>Serial Number</label>
        <input name="serialNumber" />
        <button type="submit">Complete Enrollment</button>
      </form>
      <p id="result" class="muted"></p>
      <h2>Programmatic Enrollment</h2>
      <pre>POST /api/mdm/enroll/${token}
Content-Type: application/json

{
  "deviceId": "device-serial-or-uuid",
  "deviceName": "Corp-Phone-001",
  "deviceType": "android",
  "osVersion": "14",
  "manufacturer": "Samsung",
  "model": "Galaxy"
}</pre>
    </main>
    <script>
      document.getElementById("enroll").addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());
        const result = document.getElementById("result");
        result.textContent = "Submitting enrollment...";
        const response = await fetch("/api/mdm/enroll/${token}", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const json = await response.json();
        result.textContent = json.success ? "Enrollment complete. You can close this page." : json.error || "Enrollment failed.";
      });
    </script>
  </body>
</html>`);
  });

  app.post("/api/mdm/enroll/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { getDb } = await import("../db");
      const { mdmDevices, mdmDeviceLogs } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return res.status(503).json({ success: false, error: "Database not available" });

      const pending = await db
        .select()
        .from(mdmDevices)
        .where(eq(mdmDevices.enrollmentToken, token))
        .limit(1);
      const device = pending[0];
      if (!device) return res.status(404).json({ success: false, error: "Enrollment token not found" });
      if (device.enrollmentStatus !== "pending") return res.status(409).json({ success: false, error: "Enrollment token has already been used" });
      if (device.enrollmentTokenExpiresAt && new Date(device.enrollmentTokenExpiresAt) < new Date()) {
        return res.status(410).json({ success: false, error: "Enrollment token expired" });
      }

      const body = req.body || {};
      const deviceId = String(body.deviceId || "").trim();
      const deviceName = String(body.deviceName || device.deviceName || "").trim();
      const deviceType = String(body.deviceType || device.deviceType || "").trim();
      if (!deviceId || !deviceName || !["android", "ios", "windows", "macos", "linux"].includes(deviceType)) {
        return res.status(400).json({ success: false, error: "deviceId, deviceName, and valid deviceType are required" });
      }

      await db
        .update(mdmDevices)
        .set({
          deviceId,
          deviceName,
          deviceType: deviceType as any,
          osVersion: body.osVersion ? String(body.osVersion) : device.osVersion,
          manufacturer: body.manufacturer ? String(body.manufacturer) : device.manufacturer,
          model: body.model ? String(body.model) : device.model,
          imei: body.imei ? String(body.imei) : device.imei,
          serialNumber: body.serialNumber ? String(body.serialNumber) : device.serialNumber,
          ipAddress: req.ip || req.connection.remoteAddress || device.ipAddress,
          enrollmentStatus: "enrolled",
          enrollmentDate: new Date(),
          lastCheckIn: new Date(),
          enrollmentToken: null,
          enrollmentTokenExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(mdmDevices.id, device.id));

      await db.insert(mdmDeviceLogs).values({
        deviceId: device.id,
        logType: "enrollment",
        logMessage: `Real device completed enrollment: ${deviceName} (${deviceType})`,
        logData: JSON.stringify({ deviceId, userAgent: req.headers["user-agent"], ipAddress: req.ip }),
        createdAt: new Date(),
      }).catch(() => {});

      res.json({ success: true, deviceId: device.id, message: "Device enrollment completed" });
    } catch (error: any) {
      console.error("[MDM Enrollment] Error:", error);
      res.status(500).json({ success: false, error: error.message || "Enrollment failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    try {
      await setupVite(app, server);
    } catch (error: any) {
      console.error("Failed to setup Vite (expected in production):", error.message);
      serveStatic(app);
    }
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
