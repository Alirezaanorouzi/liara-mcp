import "express";
import "dotenv/config";
import { loadConfig } from "./config.js";
import { createExpressApp } from "./create-app.js";

const app = createExpressApp();

/** Vercel Express entrypoint */
export default app;

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  const port = loadConfig().PORT;
  const host = process.env.LIARA_LISTEN_HOST ?? "0.0.0.0";

  app.listen(port, host, () => {
    console.log(`Liara PaaS MCP listening on http://${host}:${port}`);
    console.log(`MCP endpoint: POST /mcp`);
  });
}