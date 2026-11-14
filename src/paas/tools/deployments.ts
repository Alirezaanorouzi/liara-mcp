import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { projectId, releaseID, teamId } from "../schemas.js";

export function registerDeploymentTools(
  server: McpServer,
  client: LiaraClient,
): void {
  registerRestTool(server, client, {
    name: "paas_list_releases",
    description: "List app deployment releases (deployment history), newest first.",
    method: "GET",
    path: "/v1/projects/{project_id}/releases",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      project_id: projectId,
      page: z.number().int().positive().optional(),
      count: z.number().int().min(1).max(20).optional(),
      sort: z.enum(["DESC", "ASC"]).optional(),
      state: z.enum(["PENDING"]).optional(),
    },
    queryKeys: ["page", "count", "sort", "state"],
  });

  registerRestTool(server, client, {
    name: "paas_get_running_release",
    description: "Get the release currently running for an app.",
    method: "GET",
    path: "/v1/projects/{project_id}/releases/current",
    readOnlyHint: true,
    inputSchema: { teamId, project_id: projectId },
  });

  registerRestTool(server, client, {
    name: "paas_get_release",
    description: "Get release state by ID (poll during deploy).",
    method: "GET",
    path: "/v1/releases/{releaseID}",
    readOnlyHint: true,
    inputSchema: { teamId, releaseID },
  });

  registerRestTool(server, client, {
    name: "paas_get_build_logs",
    description:
      "Get build log lines for a release (poll with since=last line createdAt).",
    method: "GET",
    path: "/v2/releases/{releaseID}/build-logs",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      releaseID,
      since: z.string().optional().describe("ISO timestamp from last log line"),
    },
    queryKeys: ["since"],
  });

  registerRestTool(server, client, {
    name: "paas_cancel_build",
    description: "Cancel a release that is still waiting or building.",
    method: "POST",
    path: "/v2/releases/{releaseID}/cancel",
    inputSchema: { teamId, releaseID },
  });

  registerRestTool(server, client, {
    name: "paas_rollback_release",
    description: "Roll back to an earlier successful release (last 6 months).",
    method: "POST",
    path: "/v1/releases/{releaseID}/rollback",
    inputSchema: { teamId, releaseID },
  });

  registerRestTool(server, client, {
    name: "paas_get_release_source_link",
    description: "Get temporary download URL for release source archive (1 hour).",
    method: "POST",
    path: "/v2/releases/{releaseID}/source",
    readOnlyHint: true,
    inputSchema: { teamId, releaseID },
  });

  registerRestTool(server, client, {
    name: "paas_create_release",
    description:
      "Create a release from sourceID or docker image (API path; prefer paas_deploy CLI for source).",
    method: "POST",
    path: "/v2/projects/{project_id}/releases",
    inputSchema: {
      teamId,
      project_id: projectId,
      sourceID: z.string().optional(),
      image: z.string().optional(),
      message: z.string().optional(),
    },
    omitFromQuery: ["sourceID", "image", "message"],
    buildBody: (a) => {
      const body: Record<string, string> = {};
      if (a.sourceID) body.sourceID = a.sourceID;
      if (a.image) body.image = a.image;
      if (a.message) body.message = a.message;
      return body;
    },
  });
}
