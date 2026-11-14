import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import {
  appPlanId,
  bundlePlanId,
  platforms,
  projectID,
  projectId,
  teamId,
} from "../schemas.js";

export function registerAppTools(server: McpServer, client: LiaraClient): void {
  registerRestTool(server, client, {
    name: "paas_list_apps",
    description: "List Liara PaaS apps (newest first).",
    method: "GET",
    path: "/v1/projects",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      isManagedWordpress: z
        .enum(["true"])
        .optional()
        .describe("Set to true to list managed WordPress sites only"),
    },
    queryKeys: ["isManagedWordpress"],
  });

  registerRestTool(server, client, {
    name: "paas_create_app",
    description:
      "Create a new app in a network. Requires verified account and sufficient balance.",
    method: "POST",
    path: "/v1/projects",
    inputSchema: {
      teamId,
      name: z.string().min(3).max(50),
      planID: appPlanId,
      bundlePlanID: bundlePlanId,
      platform: platforms,
      network: z.string().regex(/^[0-9a-fA-F]{24}$/),
      readOnlyRootFilesystem: z.boolean().optional(),
      isOneClickApp: z.boolean().optional(),
    },
    omitFromQuery: [
      "name",
      "planID",
      "bundlePlanID",
      "platform",
      "network",
      "readOnlyRootFilesystem",
      "isOneClickApp",
    ],
    buildBody: (a) => ({
      name: a.name,
      planID: a.planID,
      bundlePlanID: a.bundlePlanID,
      platform: a.platform,
      network: a.network,
      ...(a.readOnlyRootFilesystem !== undefined
        ? { readOnlyRootFilesystem: a.readOnlyRootFilesystem }
        : {}),
      ...(a.isOneClickApp !== undefined
        ? { isOneClickApp: a.isOneClickApp }
        : {}),
    }),
  });

  registerRestTool(server, client, {
    name: "paas_check_app_name",
    description: "Check whether an app name is available.",
    method: "GET",
    path: "/v1/projects/{project_id}/check-availability",
    readOnlyHint: true,
    inputSchema: { teamId, project_id: projectId },
  });

  registerRestTool(server, client, {
    name: "paas_get_app",
    description: "Get app details including env vars and settings.",
    method: "GET",
    path: "/v1/projects/{project_id}",
    readOnlyHint: true,
    inputSchema: { teamId, project_id: projectId },
  });

  registerRestTool(server, client, {
    name: "paas_delete_app",
    description: "Delete an app (manage permission required).",
    method: "DELETE",
    path: "/v1/projects/{project_id}",
    inputSchema: { teamId, project_id: projectId },
  });

  registerRestTool(server, client, {
    name: "paas_unfreeze_app",
    description: "Unfreeze a frozen app using its 24-char project ID.",
    method: "POST",
    path: "/v1/projects/{projectID}/unfreeze",
    inputSchema: { teamId, projectID },
  });

  registerRestTool(server, client, {
    name: "paas_get_npm_audit_report",
    description:
      "Get npm audit report from latest build (node apps with npmAudit enabled).",
    method: "GET",
    path: "/v1/projects/{projectID}/npm-audit-report",
    readOnlyHint: true,
    inputSchema: { teamId, projectID },
  });
}
