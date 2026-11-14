import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import {
  appPlanId,
  bundlePlanId,
  envVar,
  projectID,
  projectId,
  teamId,
} from "../schemas.js";

export function registerConfigurationTools(
  server: McpServer,
  client: LiaraClient,
): void {
  registerRestTool(server, client, {
    name: "paas_set_env_vars",
    description:
      "Replace all environment variables for an app (triggers redeploy if previously deployed).",
    method: "POST",
    path: "/v1/projects/update-envs",
    inputSchema: {
      teamId,
      project: projectId,
      variables: z.array(envVar).max(200),
    },
    omitFromQuery: ["project", "variables"],
    buildBody: (a) => ({ project: a.project, variables: a.variables }),
  });

  registerRestTool(server, client, {
    name: "paas_update_port",
    description: "Change app listen port and redeploy latest successful release.",
    method: "POST",
    path: "/v1/projects/update-port",
    inputSchema: {
      teamId,
      project: projectId,
      port: z.number().int().positive(),
    },
    omitFromQuery: ["project", "port"],
    buildBody: (a) => ({ project: a.project, port: a.port }),
  });

  registerRestTool(server, client, {
    name: "paas_set_dns_servers",
    description:
      "Set up to 4 custom DNS servers (empty list resets to default). Uses app 24-char ID.",
    method: "POST",
    path: "/v1/projects/update-dns",
    inputSchema: {
      teamId,
      projectID,
      dns: z.array(z.string()).max(4).optional(),
    },
    omitFromQuery: ["projectID", "dns"],
    buildBody: (a) => ({
      projectID: a.projectID,
      dns: a.dns ?? [],
    }),
  });

  registerRestTool(server, client, {
    name: "paas_change_plan",
    description: "Change app resource plan (manage permission).",
    method: "POST",
    path: "/v1/projects/{project_id}/resize",
    inputSchema: { teamId, project_id: projectId, planID: appPlanId },
    omitFromQuery: ["planID"],
    buildBody: (a) => ({ planID: a.planID }),
  });

  registerRestTool(server, client, {
    name: "paas_change_bundle_plan",
    description: "Change app bundle plan (limits, backups, logs, etc.).",
    method: "POST",
    path: "/v1/projects/{project_id}/resize-bundle-plan",
    inputSchema: {
      teamId,
      project_id: projectId,
      bundlePlanID: bundlePlanId,
    },
    omitFromQuery: ["bundlePlanID"],
    buildBody: (a) => ({ bundlePlanID: a.bundlePlanID }),
  });

  registerRestTool(server, client, {
    name: "paas_scale_app",
    description: "Turn app on (scale 1) or off (scale 0).",
    method: "POST",
    path: "/v1/projects/{project_id}/actions/scale",
    inputSchema: {
      teamId,
      project_id: projectId,
      scale: z.union([z.literal(0), z.literal(1)]),
    },
    omitFromQuery: ["scale"],
    buildBody: (a) => ({ scale: a.scale }),
  });

  registerRestTool(server, client, {
    name: "paas_restart_app",
    description: "Restart a running app.",
    method: "POST",
    path: "/v1/projects/{project_id}/actions/restart",
    inputSchema: { teamId, project_id: projectId },
  });
}
