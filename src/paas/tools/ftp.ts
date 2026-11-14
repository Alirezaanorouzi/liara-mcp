import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { diskName, projectId, teamId } from "../schemas.js";

export function registerFtpTools(server: McpServer, client: LiaraClient): void {
  registerRestTool(server, client, {
    name: "paas_list_ftp_accounts",
    description: "List FTP accounts for a disk (includes passwords when permitted).",
    method: "GET",
    path: "/v1/projects/{project_id}/disks/{diskName}/ftp",
    readOnlyHint: true,
    inputSchema: { teamId, project_id: projectId, diskName },
  });

  registerRestTool(server, client, {
    name: "paas_create_ftp_account",
    description: "Create FTP account for a disk.",
    method: "POST",
    path: "/v1/projects/{project_id}/disks/{diskName}/ftp",
    inputSchema: {
      teamId,
      project_id: projectId,
      diskName,
      username: z.string().min(3),
    },
    omitFromQuery: ["username"],
    buildBody: (a) => ({ username: a.username }),
  });

  registerRestTool(server, client, {
    name: "paas_delete_ftp_account",
    description: "Delete an FTP account by username.",
    method: "DELETE",
    path: "/v1/ftp/{username}",
    inputSchema: { teamId, username: z.string() },
  });

  registerRestTool(server, client, {
    name: "paas_check_ftp_username",
    description: "Check if an FTP username is available.",
    method: "GET",
    path: "/v1/ftp/{username}/check-availability",
    readOnlyHint: true,
    inputSchema: { teamId, username: z.string() },
  });
}
