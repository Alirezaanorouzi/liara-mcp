import { z } from "zod";

const envSchema = z.object({
  LIARA_API_TOKEN: z.string().min(1),
  MCP_ACCESS_TOKEN: z.string().min(1),
  LIARA_TEAM_ID: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3100),
  LIARA_API_BASE_URL: z.string().url().default("https://api.liara.ir"),
  LIARA_DEPLOY_PATH_ALLOWLIST: z.string().optional(),
});

export type AppConfig = z.infer<typeof envSchema> & {
  deployPathAllowlist: string[];
};

export function loadConfig(): AppConfig {
  const parsed = envSchema.parse(process.env);
  const deployPathAllowlist = parsed.LIARA_DEPLOY_PATH_ALLOWLIST
    ? parsed.LIARA_DEPLOY_PATH_ALLOWLIST.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  return { ...parsed, deployPathAllowlist };
}
