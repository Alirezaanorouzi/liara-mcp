import express from "express";
import { loadConfig } from "./config.js";
import { mountMcpRoutes } from "./http/mcp.js";

/** Shared Express app for local dev and Vercel serverless. */
export function createExpressApp() {
  const config = loadConfig();
  const app = express();

  app.use(express.json({ limit: "4mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/", (_req, res) => {
    res.json({
      name: "liara-paas-mcp",
      mcp: "POST /mcp",
      health: "GET /health",
    });
  });

  mountMcpRoutes(app, config);
  return app;
}