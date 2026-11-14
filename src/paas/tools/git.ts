import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LiaraClient } from "../../lib/liara-client.js";
import { registerRestTool } from "../../lib/register-rest-tool.js";
import { githubProvider, projectID, projectId, teamId } from "../schemas.js";

const repoSettings = z.object({
  branches: z.array(z.string()).min(1),
  autoDeploy: z.boolean().optional(),
  checkSuite: z.boolean().optional(),
});

export function registerGitTools(server: McpServer, client: LiaraClient): void {
  registerRestTool(server, client, {
    name: "paas_start_github_connection",
    description:
      "HUMAN-IN-THE-LOOP: Returns GitHub OAuth URL. User must sign in in browser, then call paas_finish_github_connection.",
    method: "GET",
    path: "/v1/git-provider-integration/{provider}",
    readOnlyHint: true,
    inputSchema: {
      provider: githubProvider,
      callback_url: z.string().url(),
    },
    queryKeys: ["callback_url"],
  });

  registerRestTool(server, client, {
    name: "paas_finish_github_connection",
    description:
      "Complete GitHub account connection using code from OAuth callback.",
    method: "POST",
    path: "/v1/git-provider-integration/{provider}",
    inputSchema: {
      provider: githubProvider,
      code: z.string(),
      callback_url: z.string().url(),
      githubOAuthCSRFToken: z.string(),
    },
    omitFromQuery: ["code", "callback_url", "githubOAuthCSRFToken"],
    buildBody: (a) => ({
      code: a.code,
      callback_url: a.callback_url,
      githubOAuthCSRFToken: a.githubOAuthCSRFToken,
    }),
  });

  registerRestTool(server, client, {
    name: "paas_disconnect_github",
    description: "Disconnect GitHub account and unlink repos from apps.",
    method: "DELETE",
    path: "/v1/git-provider-integration/{provider}",
    inputSchema: { provider: githubProvider },
  });

  registerRestTool(server, client, {
    name: "paas_sync_github_account",
    description: "Refresh connected GitHub account metadata in background.",
    method: "POST",
    path: "/v1/git-integration/{provider}/sync",
    inputSchema: { provider: githubProvider },
  });

  registerRestTool(server, client, {
    name: "paas_list_github_organizations",
    description: "List GitHub organizations for the connected account.",
    method: "GET",
    path: "/v1/git-provider-integration/{provider}/organizations",
    readOnlyHint: true,
    inputSchema: {
      provider: githubProvider,
      page: z.number().int().positive().optional(),
      count: z.number().int().min(1).max(15).optional(),
    },
    queryKeys: ["page", "count"],
  });

  registerRestTool(server, client, {
    name: "paas_get_github_app_install_link",
    description: "Get plain-text URL to install Liara GitHub app.",
    method: "GET",
    path: "/v1/git-repository-integration/{provider}/connect",
    readOnlyHint: true,
    inputSchema: { provider: githubProvider },
  });

  registerRestTool(server, client, {
    name: "paas_list_github_repositories",
    description: "List GitHub repos accessible to Liara GitHub app.",
    method: "GET",
    path: "/v1/git-repository-integration/{provider}/repositories",
    readOnlyHint: true,
    inputSchema: {
      provider: githubProvider,
      organizationID: z.number().int().optional(),
      page: z.number().int().positive().optional(),
      count: z.number().int().positive().optional(),
    },
    queryKeys: ["organizationID", "page", "count"],
  });

  registerRestTool(server, client, {
    name: "paas_list_repository_branches",
    description: "List branch names for a GitHub repository.",
    method: "GET",
    path: "/v1/git-repository-integration/{provider}/show-repository-branches",
    readOnlyHint: true,
    inputSchema: {
      provider: githubProvider,
      repositoryFullname: z.string().describe("owner/repo"),
      organizationID: z.number().int().optional(),
    },
    queryKeys: ["repositoryFullname", "organizationID"],
  });

  registerRestTool(server, client, {
    name: "paas_get_linked_repository",
    description: "Get repository linked to an app and deploy settings.",
    method: "GET",
    path: "/v1/projects/{projectID}/git-repository-integration/{provider}",
    readOnlyHint: true,
    inputSchema: { teamId, projectID, provider: githubProvider },
  });

  registerRestTool(server, client, {
    name: "paas_link_repository",
    description: "Link a GitHub repository to an app for auto/manual deploy.",
    method: "POST",
    path: "/v1/projects/{projectID}/git-repository-integration/{provider}",
    inputSchema: {
      teamId,
      projectID,
      provider: githubProvider,
      repositoryFullname: z.string(),
      organizationID: z.number().int().optional(),
      settings: repoSettings,
    },
    omitFromQuery: ["repositoryFullname", "organizationID", "settings"],
    buildBody: (a) => ({
      repositoryFullname: a.repositoryFullname,
      settings: a.settings,
      ...(a.organizationID !== undefined
        ? { organizationID: a.organizationID }
        : {}),
    }),
  });

  registerRestTool(server, client, {
    name: "paas_change_repository_deploy_settings",
    description: "Update branches / autoDeploy / checkSuite for linked repo.",
    method: "PUT",
    path: "/v1/projects/{projectID}/git-repository-integration/{provider}",
    inputSchema: {
      projectID,
      provider: githubProvider,
      settings: repoSettings,
    },
    omitFromQuery: ["settings"],
    buildBody: (a) => ({ settings: a.settings }),
  });

  registerRestTool(server, client, {
    name: "paas_unlink_repository",
    description: "Remove GitHub repository link from an app.",
    method: "DELETE",
    path: "/v1/projects/{projectID}/git-repository-integration/{provider}",
    inputSchema: { teamId, projectID, provider: githubProvider },
  });

  registerRestTool(server, client, {
    name: "paas_deploy_latest_commit",
    description:
      "Deploy latest commit from linked repository branch (then poll releases).",
    method: "POST",
    path: "/v1/projects/{projectID}/git-repository-integration/{provider}/manual-deploy",
    inputSchema: { projectID, provider: githubProvider },
  });

  registerRestTool(server, client, {
    name: "paas_get_failed_automatic_deployment",
    description: "Explain a failed auto-deploy from GitHub commit link IDs.",
    method: "GET",
    path: "/v1/projects/{project_id}/repository-deployment-failures/{connectedRepositoryID}/{repositoryDeploymentFailureID}",
    readOnlyHint: true,
    inputSchema: {
      teamId,
      project_id: projectId,
      connectedRepositoryID: z.string().regex(/^[0-9a-fA-F]{24}$/),
      repositoryDeploymentFailureID: z.string().regex(/^[0-9a-fA-F]{24}$/),
    },
  });

  registerRestTool(server, client, {
    name: "paas_list_one_click_apps",
    description: "List one-click deploy catalog (no Liara token required).",
    method: "GET",
    path: "/v1/one-click-apps",
    readOnlyHint: true,
    skipAuth: true,
    inputSchema: {
      page: z.number().int().positive().optional(),
      count: z.number().int().positive().optional(),
    },
    queryKeys: ["page", "count"],
  });

  registerRestTool(server, client, {
    name: "paas_get_one_click_app",
    description: "Get one-click app spec YAML (no Liara token required).",
    method: "GET",
    path: "/v1/one-click-apps/{oneClickAppName}",
    readOnlyHint: true,
    skipAuth: true,
    inputSchema: {
      oneClickAppName: z.string(),
    },
  });
}
