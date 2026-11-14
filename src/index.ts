import "dotenv/config";
import { loadConfig } from "./config.js";
import { createExpressApp } from "./create-app.js";

const port = loadConfig().PORT;
const app = createExpressApp();

const host = process.env.LIARA_LISTEN_HOST ?? "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Liara PaaS MCP listening on http://${host}:${port}`);
  console.log(`MCP endpoint: POST /mcp`);
});