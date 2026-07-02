import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================
const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize && keptLines.length > 0) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"));
  } catch (e) {
    console.error(`Failed to trim log file ${logPath}:`, e);
  }
}

function writeLog(source: LogSource, message: string) {
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logPath, logEntry);
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

// Vite plugin for collecting browser logs
const debugCollectorPlugin: Plugin = {
  name: "manus-debug-collector",
  apply: "serve",
  configResolved() {
    ensureLogDir();
  },
  transformIndexHtml: {
    order: "pre",
    handler(html) {
      const debugScript = `
        <script>
          // Collect console logs
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;

          console.log = function(...args) {
            originalLog.apply(console, args);
            fetch('/__manus-debug/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ source: 'browserConsole', message: args.map(a => String(a)).join(' ') })
            }).catch(() => {});
          };

          console.warn = function(...args) {
            originalWarn.apply(console, args);
            fetch('/__manus-debug/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ source: 'browserConsole', message: '[WARN] ' + args.map(a => String(a)).join(' ') })
            }).catch(() => {});
          };

          console.error = function(...args) {
            originalError.apply(console, args);
            fetch('/__manus-debug/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ source: 'browserConsole', message: '[ERROR] ' + args.map(a => String(a)).join(' ') })
            }).catch(() => {});
          };

          // Collect network requests
          const originalFetch = window.fetch;
          window.fetch = function(...args) {
            const startTime = performance.now();
            return originalFetch.apply(window, args).then(response => {
              const duration = performance.now() - startTime;
              const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
              fetch('/__manus-debug/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  source: 'networkRequests',
                  message: \`\${url} [\${response.status}] \${duration.toFixed(0)}ms\`
                })
              }).catch(() => {});
              return response;
            });
          };
        </script>
      `;
      return html.replace("</head>", `${debugScript}</head>`);
    },
  },
  configureServer(server: ViteDevServer) {
    return () => {
      server.middlewares.use("/__manus-debug/log", (req, res) => {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const { source, message } = JSON.parse(body);
            writeLog(source, message);
            res.writeHead(200);
            res.end("OK");
          } catch (e) {
            res.writeHead(400);
            res.end("Invalid JSON");
          }
        });
      });
    };
  },
};

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  debugCollectorPlugin,
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  base: "/osint-scanner-platform/", // GitHub Pages base path
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
