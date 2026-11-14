import { z } from "zod";

/** Optional team context; overrides LIARA_TEAM_ID env. */
export const teamId = z
  .string()
  .optional()
  .describe("24-char team ID for team-scoped resources (overrides LIARA_TEAM_ID)");

/** App name (`project_id`), e.g. my-app. */
export const projectId = z
  .string()
  .min(1)
  .describe("Liara app name (project_id)");

/** App 24-char hex `_id` from list/get app. */
export const projectID = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .describe("Liara app 24-char ID (_id)");

export const releaseID = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .describe("Release 24-char ID");

export const diskName = z.string().min(1).describe("Disk name");

export const domainName = z.string().min(1).describe("Domain hostname");

export const domainID = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .describe("Domain 24-char ID");

export const githubProvider = z
  .enum(["github"])
  .describe("Git provider (currently only github)");

export const envVar = z.object({
  key: z.string(),
  value: z.string(),
});

export const platforms = z.enum([
  "node",
  "next",
  "react",
  "vue",
  "angular",
  "static",
  "laravel",
  "php",
  "django",
  "flask",
  "python",
  "netcore",
  "dotnet",
  "go",
  "docker",
]);

export const appPlanId = z.enum([
  "small-g2",
  "medium-g2",
  "standard-base-g2",
  "standard-plus-g2",
  "pro-g2",
  "pro-plus-g2",
  "pro-max-g2",
]);

export const bundlePlanId = z.enum(["basic", "standard", "pro"]);
