import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { projectId, teamId } from "../schemas.js";

export function registerObservabilityTools(
  server: McpServer,
  client: LiaraClient,
): void {
  registerRestTool(server, client, {
    name: "paas_get_app_logs",
    description:
      "Get runtime app logs (up to 100 lines). Use start/end to page; last_lines=true for newest.",
    method: "GET",
    path: "/v2/projects/{project_id}/logs",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      project_id: projectId,
      start: z.string().optional(),
      end: z.string().optional(),
      direction: z.enum(["forward", "backward"]).optional(),
      appletId: z.string().optional(),
      releaseId: z.string().optional(),
      search: z.string().min(3).optional(),
      last_lines: z.boolean().optional(),
    },
    queryKeys: [
      "start",
      "end",
      "direction",
      "appletId",
      "releaseId",
      "search",
      "last_lines",
    ],
  });

  registerRestTool(server, client, {
    name: "paas_get_log_volume",
    description: "Get log line counts per 5-minute window.",
    method: "GET",
    path: "/v2/projects/{project_id}/logs/chart",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      project_id: projectId,
      start: z.string().optional(),
      end: z.string().optional(),
      appletId: z.string().optional(),
      releaseId: z.string().optional(),
    },
    queryKeys: ["start", "end", "appletId", "releaseId"],
  });

  registerRestTool(server, client, {
    name: "paas_get_resource_usage_current",
    description: "Current CPU, memory, and disk usage summary.",
    method: "GET",
    path: "/v1/projects/{project_id}/metrics/summary",
    readOnlyHint: true,
    inputSchema: { teamId, project_id: projectId },
  });

  registerRestTool(server, client, {
    name: "paas_get_resource_usage_over_time",
    description:
      "Resource metric over time (cpu, memory, network-receive, network-transmit).",
    method: "GET",
    path: "/v1/projects/{project_id}/metrics/{stat}",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      project_id: projectId,
      stat: z.enum([
        "cpu",
        "memory",
        "network-receive",
        "network-transmit",
      ]),
      since: z.number().int().describe("Unix seconds start of range"),
    },
    queryKeys: ["since"],
  });

  registerRestTool(server, client, {
    name: "paas_get_app_events",
    description: "Lifecycle events (start/stop/restart/oom) for last 7 days.",
    method: "GET",
    path: "/v1/projects/{project_id}/events",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      project_id: projectId,
      start: z.number().int().optional(),
      end: z.string().optional(),
      direction: z.enum(["forward", "backward"]).optional(),
      search: z.string().min(3).optional(),
    },
    queryKeys: ["start", "end", "direction", "search"],
  });
}
