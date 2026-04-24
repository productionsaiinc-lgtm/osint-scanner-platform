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
import { recordCanaryTrigger } from "../canary-trigger-service";

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
  
  const app = express();
  const server = createServer(app);
  
  // CRITICAL: Register webhooks BEFORE express.json() to preserve raw body for signature verification
  registerStripeWebhook(app);
  registerPayoutWebhook(app);
  
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
    await setupVite(app, server);
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
