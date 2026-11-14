import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AppConfig } from "../../config.js";
import {
  assertDeployPathAllowed,
  runLiaraCli,
} from "../../lib/liara-cli.js";
import { errorResult, successResult } from "../../lib/mcp-result.js";
import { teamId } from "../schemas.js";

export function registerDeployCliTool(
  server: McpServer,
  config: AppConfig,
): void {
  server.registerTool(
    "paas_deploy",
    {
      description:
        "Deploy app source via Liara CLI (recommended for coding agents). After deploy, poll paas_list_releases, paas_get_build_logs, and paas_get_app_logs.",
      inputSchema: {
        teamId,
        app: z.string().describe("Liara app name (project_id)"),
        path: z
          .string()
          .optional()
          .describe("Project root directory on this machine"),
        port: z.number().int().positive().optional(),
        platform: z.string().optional(),
        image: z.string().optional().describe("Docker image (docker platform)"),
        message: z.string().optional(),
        disks: z
          .array(z.string())
          .optional()
          .describe('Disk mounts like "data=/var/www/html"'),
        buildLocation: z.enum(["iran", "germany"]).optional(),
        dockerfile: z.string().optional(),
        buildArg: z.array(z.string()).optional(),
        noCache: z.boolean().optional(),
        detach: z.boolean().default(true),
        noAppLogs: z.boolean().default(true),
      },
    },
    async (args) => {
      try {
        const deployPath = await assertDeployPathAllowed(
          args.path ?? process.cwd(),
          config.deployPathAllowlist,
        );

        const cliArgs = [
          "deploy",
          "--api-token",
          config.LIARA_API_TOKEN,
          "--app",
          args.app,
          "--path",
          deployPath,
        ];

        const effectiveTeam = args.teamId ?? config.LIARA_TEAM_ID;
        if (effectiveTeam) {
          cliArgs.push("--team-id", effectiveTeam);
        }
        if (args.port !== undefined) {
          cliArgs.push("--port", String(args.port));
        }
        if (args.platform) cliArgs.push("--platform", args.platform);
        if (args.image) cliArgs.push("--image", args.image);
        if (args.message) cliArgs.push("--message", args.message);
        if (args.buildLocation) {
          cliArgs.push("--build-location", args.buildLocation);
        }
        if (args.dockerfile) cliArgs.push("--dockerfile", args.dockerfile);
        if (args.buildArg?.length) {
          for (const ba of args.buildArg) cliArgs.push("--build-arg", ba);
        }
        if (args.disks?.length) {
          for (const d of args.disks) cliArgs.push("--disks", d);
        }
        if (args.noCache) cliArgs.push("--no-cache");
        if (args.detach) cliArgs.push("--detach");
        if (args.noAppLogs) cliArgs.push("--no-app-logs");

        const result = await runLiaraCli({
          args: cliArgs,
          cwd: deployPath,
        });

        const summary = {
          exitCode: result.exitCode,
          timedOut: result.timedOut,
          stdout: result.stdout,
          stderr: result.stderr,
          nextSteps: [
            "paas_list_releases",
            "paas_get_build_logs",
            "paas_get_app_logs",
          ],
        };

        if (result.exitCode === 0 && !result.timedOut) {
          return successResult(summary);
        }
        return errorResult(
          `liara deploy failed (exit ${result.exitCode ?? "unknown"})`,
          summary,
        );
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
