import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { diskName, projectID, projectId, teamId } from "../schemas.js";

export function registerDiskTools(server: McpServer, client: LiaraClient): void {
  registerRestTool(server, client, {
    name: "paas_list_disks",
    description:
      "List app disks and mount paths (uses app 24-char projectID).",
    method: "GET",
    path: "/v1/projects/{projectID}/disks",
    readOnlyHint: true,
    inputSchema: { teamId, projectID },
  });

  registerRestTool(server, client, {
    name: "paas_create_disk",
    description: "Create a persistent disk for an app (mount via deploy disks flag).",
    method: "POST",
    path: "/v1/projects/{project_id}/disks",
    inputSchema: {
      teamId,
      project_id: projectId,
      name: diskName,
      size: z.number().positive().describe("Disk size in GB"),
    },
    omitFromQuery: ["name", "size"],
    buildBody: (a) => ({ name: a.name, size: a.size }),
  });

  registerRestTool(server, client, {
    name: "paas_get_disk",
    description: "Get disk details and mount paths.",
    method: "GET",
    path: "/v1/projects/{project_id}/disks/{name}",
    readOnlyHint: true,
    inputSchema: { teamId, project_id: projectId, name: diskName },
  });

  registerRestTool(server, client, {
    name: "paas_delete_disk",
    description: "Delete disk and data (must not be mounted in latest release).",
    method: "DELETE",
    path: "/v1/projects/{projectID}/disks/{name}",
    inputSchema: { teamId, projectID, name: diskName },
  });

  registerRestTool(server, client, {
    name: "paas_grow_disk",
    description: "Increase disk size (cannot shrink; stop app if mounted).",
    method: "POST",
    path: "/v1/projects/{project_id}/disks/{name}/resize",
    inputSchema: {
      teamId,
      project_id: projectId,
      name: diskName,
      size: z.number().positive(),
    },
    omitFromQuery: ["size"],
    buildBody: (a) => ({ size: a.size }),
  });

  registerRestTool(server, client, {
    name: "paas_get_disk_usage",
    description: "Disk fill percentage and usage.",
    method: "GET",
    path: "/v1/projects/{projectID}/disks/{name}/metrics",
    readOnlyHint: true,
    inputSchema: { teamId, projectID, name: diskName },
  });
}
