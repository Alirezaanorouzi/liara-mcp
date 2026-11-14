import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { projectID, teamId } from "../schemas.js";

function settingPost(
  server: McpServer,
  client: LiaraClient,
  name: string,
  description: string,
  path: string,
): void {
  registerRestTool(server, client, {
    name,
    description,
    method: "POST",
    path,
    inputSchema: { teamId, projectID },
  });
}

export function registerSettingsTools(
  server: McpServer,
  client: LiaraClient,
): void {
  settingPost(
    server,
    client,
    "paas_enable_read_only_fs",
    "Make app filesystem read-only except disks.",
    "/v1/projects/{projectID}/read-only/enable",
  );
  settingPost(
    server,
    client,
    "paas_disable_read_only_fs",
    "Make app filesystem fully writable.",
    "/v1/projects/{projectID}/read-only/disable",
  );
  settingPost(
    server,
    client,
    "paas_enable_default_subdomain",
    "Serve app at <app>.liara.run.",
    "/v1/projects/{projectID}/default-subdomain/enable",
  );
  settingPost(
    server,
    client,
    "paas_disable_default_subdomain",
    "Stop serving app on default liara.run subdomain.",
    "/v1/projects/{projectID}/default-subdomain/disable",
  );
  settingPost(
    server,
    client,
    "paas_enable_zero_downtime",
    "Enable zero-downtime deployment.",
    "/v1/projects/{projectID}/zero-downtime/enable",
  );
  settingPost(
    server,
    client,
    "paas_disable_zero_downtime",
    "Disable zero-downtime deployment.",
    "/v1/projects/{projectID}/zero-downtime/disable",
  );
  settingPost(
    server,
    client,
    "paas_enable_fixed_outbound_ip",
    "Enable fixed outbound IP for the app.",
    "/v1/projects/{projectID}/fixed-ip/enable",
  );
  settingPost(
    server,
    client,
    "paas_disable_fixed_outbound_ip",
    "Disable fixed outbound IP.",
    "/v1/projects/{projectID}/fixed-ip/disable",
  );
}
