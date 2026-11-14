import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { LiaraClient, HttpMethod } from "./liara-client.js";
import { fromLiaraResponse } from "./mcp-result.js";

type ZodShape = Record<string, z.ZodTypeAny>;

export interface RestToolConfig<
  T extends ZodShape = ZodShape,
> {
  name: string;
  description: string;
  method: HttpMethod;
  path: string | ((args: z.infer<z.ZodObject<T>>) => string);
  inputSchema: T;
  queryKeys?: (keyof z.infer<z.ZodObject<T>> & string)[];
  omitFromQuery?: (keyof z.infer<z.ZodObject<T>> & string)[];
  buildBody?: (args: z.infer<z.ZodObject<T>>) => unknown;
  readOnlyHint?: boolean;
  skipAuth?: boolean;
}

const defaultOmit = ["teamId"] as const;

export function registerRestTool<T extends ZodShape>(
  server: McpServer,
  client: LiaraClient,
  config: RestToolConfig<T>,
): void {
  const shape = config.inputSchema;
  server.registerTool(
    config.name,
    {
      description: config.description,
      inputSchema: shape,
      annotations: config.readOnlyHint
        ? { readOnlyHint: true, openWorldHint: true }
        : { openWorldHint: true },
    },
    (async (args: unknown): Promise<CallToolResult> => {
      const record = (args ?? {}) as z.infer<z.ZodObject<T>> & {
        teamId?: string;
      };
      const path =
        typeof config.path === "function"
          ? config.path(record)
          : substitutePath(config.path, record as Record<string, string>);

      const pathParams = new Set(getPathParamNames(path));
      const omit = new Set([
        ...defaultOmit,
        ...pathParams,
        ...(config.omitFromQuery ?? []),
      ]);

      let query: Record<string, string | number | boolean | undefined> | undefined;
      if (config.queryKeys?.length) {
        query = {};
        for (const key of config.queryKeys) {
          const val = record[key];
          if (val !== undefined) query[key] = val as string | number | boolean;
        }
      } else {
        query = {};
        for (const [key, val] of Object.entries(record)) {
          if (omit.has(key)) continue;
          if (config.buildBody && key === "body") continue;
          if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
            query[key] = val;
          }
        }
        if (Object.keys(query).length === 0) query = undefined;
      }

      const body = config.buildBody?.(record);
      const res = await client.request({
        method: config.method,
        path,
        teamId: record.teamId,
        query,
        body,
        skipAuth: config.skipAuth,
      });
      return fromLiaraResponse(res);
    }) as never,
  );
}

function getPathParamNames(template: string): string[] {
  const names: string[] = [];
  const re = /\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    names.push(m[1]);
  }
  return names;
}

function substitutePath(
  template: string,
  params: Record<string, string | number | undefined>,
): string {
  return template.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing path parameter: ${key}`);
    }
    return encodeURIComponent(String(value));
  });
}
