import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { teamId } from "../schemas.js";

export function registerNetworkTools(
  server: McpServer,
  client: LiaraClient,
): void {
  registerRestTool(server, client, {
    name: "paas_list_networks",
    description: "List private networks with app/database counts.",
    method: "GET",
    path: "/v1/networks",
    readOnlyHint: true,
    inputSchema: { teamId },
  });

  registerRestTool(server, client, {
    name: "paas_create_network",
    description: "Create a private network (verified account required).",
    method: "POST",
    path: "/v1/networks",
    inputSchema: {
      teamId,
      networkName: z.string().min(3).max(50),
    },
    omitFromQuery: ["networkName"],
    buildBody: (a) => ({ networkName: a.networkName }),
  });
}
