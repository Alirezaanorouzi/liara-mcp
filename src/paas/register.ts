import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AppConfig } from "../config.js";
import type { LiaraClient } from "../lib/liara-client.js";
import { registerDeployCliTool } from "./cli/deploy.js";
import { registerAppTools } from "./tools/apps.js";
import { registerConfigurationTools } from "./tools/configuration.js";
import { registerDeploymentTools } from "./tools/deployments.js";
import { registerDiskBackupTools } from "./tools/disk-backups.js";
import { registerDiskTools } from "./tools/disks.js";
import { registerDomainSslTools } from "./tools/domain-ssl.js";
import { registerDomainTools } from "./tools/domains.js";
import { registerFtpTools } from "./tools/ftp.js";
import { registerGitTools } from "./tools/git.js";
import { registerNetworkTools } from "./tools/networks.js";
import { registerObservabilityTools } from "./tools/observability.js";
import { registerSettingsTools } from "./tools/settings.js";

export function registerPaasTools(
  server: McpServer,
  client: LiaraClient,
  config: AppConfig,
): void {
  registerAppTools(server, client);
  registerConfigurationTools(server, client);
  registerSettingsTools(server, client);
  registerNetworkTools(server, client);
  registerDeploymentTools(server, client);
  registerObservabilityTools(server, client);
  registerDomainTools(server, client);
  registerDomainSslTools(server, client);
  registerDiskTools(server, client);
  registerDiskBackupTools(server, client);
  registerFtpTools(server, client);
  registerGitTools(server, client);
  registerDeployCliTool(server, config);
}
