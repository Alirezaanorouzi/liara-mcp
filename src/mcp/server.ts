import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AppConfig } from "../config.js";
import { LiaraClient } from "../lib/liara-client.js";
import { registerPaasTools } from "../paas/register.js";

export function createMcpServer(config: AppConfig): McpServer {
  const server = new McpServer(
    {
      name: "liara-paas-mcp",
      version: "1.0.0",
    },
    { capabilities: { logging: {} } },
  );

  const client = new LiaraClient(config);
  registerPaasTools(server, client, config);

  return server;
}
