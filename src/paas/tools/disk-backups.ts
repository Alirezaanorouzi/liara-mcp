import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { diskName, projectID, teamId } from "../schemas.js";

export function registerDiskBackupTools(
  server: McpServer,
  client: LiaraClient,
): void {
  registerRestTool(server, client, {
    name: "paas_list_disk_backups",
    description: "List backups for a disk (newest first).",
    method: "GET",
    path: "/v1/projects/{projectID}/disks/{name}/backups",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      projectID,
      name: diskName,
      page: z.number().int().positive().optional(),
      count: z.number().int().positive().optional(),
    },
    queryKeys: ["page", "count"],
  });

  registerRestTool(server, client, {
    name: "paas_backup_disk_now",
    description: "Start a manual disk backup.",
    method: "POST",
    path: "/v1/projects/{projectID}/disks/{name}/backups",
    inputSchema: { teamId, projectID, name: diskName },
  });

  registerRestTool(server, client, {
    name: "paas_get_disk_backup_download_link",
    description: "Temporary download link for a disk backup (12 hours).",
    method: "GET",
    path: "/v1/projects/{projectID}/disks/{name}/backups/{interval}/{backup}/download",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      projectID,
      name: diskName,
      interval: z.string().describe("Backup interval label from list backups"),
      backup: z.string().describe("Backup id/name from list backups"),
    },
  });

  registerRestTool(server, client, {
    name: "paas_restore_disk_backup",
    description: "Restore a backup onto a target disk (same or another app).",
    method: "POST",
    path: "/v2/projects/{projectID}/disks/{name}/restore",
    inputSchema: {
      teamId,
      projectID,
      name: diskName,
      backupName: z.string(),
      targetProjectID: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
      targetDiskName: z.string().optional(),
    },
    omitFromQuery: ["backupName", "targetProjectID", "targetDiskName"],
    buildBody: (a) => ({
      backupName: a.backupName,
      ...(a.targetProjectID ? { targetProjectID: a.targetProjectID } : {}),
      ...(a.targetDiskName ? { targetDiskName: a.targetDiskName } : {}),
    }),
  });
}
