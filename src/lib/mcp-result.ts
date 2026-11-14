import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { LiaraResponse } from "./liara-client.js";

export function successResult(data: unknown): CallToolResult {
  const text =
    typeof data === "string"
      ? data
      : JSON.stringify(data, null, 2);
  return {
    content: [{ type: "text", text: text || "(empty response)" }],
  };
}

export function errorResult(message: string, data?: unknown): CallToolResult {
  const text =
    data !== undefined
      ? `${message}\n\n${JSON.stringify(data, null, 2)}`
      : message;
  return {
    content: [{ type: "text", text }],
    isError: true,
  };
}

export function fromLiaraResponse(res: LiaraResponse) {
  if (res.ok) {
    return successResult(res.data ?? "(empty response)");
  }
  return errorResult(
    `Liara API ${res.status}: ${formatLiaraError(res.data)}`,
    res.data,
  );
}

function formatLiaraError(data: unknown): string {
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    if (typeof o.error === "string") return o.error;
  }
  if (typeof data === "string") return data;
  return "Request failed";
}
