import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { domainID, domainName, teamId } from "../schemas.js";

export function registerDomainTools(
  server: McpServer,
  client: LiaraClient,
): void {
  registerRestTool(server, client, {
    name: "paas_list_domains",
    description: "List custom domains for apps or buckets.",
    method: "GET",
    path: "/v1/domains",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      type: z.enum(["PROJECT", "BUCKET"]).optional(),
      project: z.string().optional(),
      bucket: z.string().optional(),
      domain: z.string().optional(),
      page: z.number().int().positive().optional(),
      count: z.number().int().positive().optional(),
    },
    queryKeys: ["type", "project", "bucket", "domain", "page", "count"],
  });

  registerRestTool(server, client, {
    name: "paas_add_domain",
    description: "Add a domain to an app or bucket.",
    method: "POST",
    path: "/v1/domains",
    inputSchema: {
      teamId,
      name: domainName,
      type: z.enum(["PROJECT", "BUCKET"]),
      project: z.string().optional(),
      bucket: z.string().optional(),
      isWildcard: z.boolean().optional(),
    },
    omitFromQuery: ["name", "type", "project", "bucket", "isWildcard"],
    buildBody: (a) => ({
      name: a.name,
      type: a.type,
      ...(a.project ? { project: a.project } : {}),
      ...(a.bucket ? { bucket: a.bucket } : {}),
      ...(a.isWildcard !== undefined ? { isWildcard: a.isWildcard } : {}),
    }),
  });

  registerRestTool(server, client, {
    name: "paas_get_domain",
    description: "Get domain details including verification DNS targets.",
    method: "GET",
    path: "/v1/domains/{domainName}",
    readOnlyHint: true,
    inputSchema: { teamId, domainName },
  });

  registerRestTool(server, client, {
    name: "paas_check_domain_dns",
    description: "Check domain DNS records and update status.",
    method: "POST",
    path: "/v1/domains/{domainID}/check",
    inputSchema: { teamId, domainID },
  });

  registerRestTool(server, client, {
    name: "paas_remove_domain",
    description: "Remove a domain from its app or bucket.",
    method: "DELETE",
    path: "/v1/domains/{domainID}",
    inputSchema: { teamId, domainID },
  });
}
