import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { domainID, domainName, teamId } from "../schemas.js";

export function registerDomainSslTools(
  server: McpServer,
  client: LiaraClient,
): void {
  registerRestTool(server, client, {
    name: "paas_request_ssl_certificate",
    description: "Request free SSL certificate for domains (async issuance).",
    method: "POST",
    path: "/v1/domains/provision-ssl-certs",
    inputSchema: {
      teamId,
      domains: z.array(domainID).min(1),
    },
    omitFromQuery: ["domains"],
    buildBody: (a) => ({ domains: a.domains }),
  });

  registerRestTool(server, client, {
    name: "paas_turn_off_ssl",
    description: "Turn off SSL for a domain.",
    method: "POST",
    path: "/v1/domains/{domainID}/ssl/disable",
    inputSchema: { teamId, domainID },
  });

  registerRestTool(server, client, {
    name: "paas_get_certificate_history",
    description: "Certificate issuance/renewal history for a domain.",
    method: "GET",
    path: "/v1/domains/{domainName}/certs-history",
    readOnlyHint: true,
    inputSchema: { teamId, domainName },
  });

  registerRestTool(server, client, {
    name: "paas_redirect_domain",
    description:
      "Redirect app domain to URL (empty redirectTo removes redirect).",
    method: "POST",
    path: "/v1/domains/{domainID}/set-redirect",
    inputSchema: {
      teamId,
      domainID,
      redirectTo: z.string().optional(),
      redirectStatus: z.union([z.literal(301), z.literal(302)]).optional(),
    },
    omitFromQuery: ["redirectTo", "redirectStatus"],
    buildBody: (a) => ({
      redirectTo: a.redirectTo ?? "",
      ...(a.redirectStatus !== undefined
        ? { redirectStatus: a.redirectStatus }
        : {}),
    }),
  });
}
