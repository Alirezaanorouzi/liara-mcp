import type { AppConfig } from "../config.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface LiaraRequestOptions {
  method: HttpMethod;
  path: string;
  teamId?: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  skipAuth?: boolean;
}

export interface LiaraResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export class LiaraClient {
  constructor(private readonly config: AppConfig) {}

  resolveTeamId(override?: string): string | undefined {
    return override ?? this.config.LIARA_TEAM_ID;
  }

  async request(options: LiaraRequestOptions): Promise<LiaraResponse> {
    const url = new URL(options.path, this.config.LIARA_API_BASE_URL);
    const teamId = options.teamId ?? this.resolveTeamId();
    if (teamId) {
      url.searchParams.set("teamID", teamId);
    }
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (!options.skipAuth) {
      headers.Authorization = `Bearer ${this.config.LIARA_API_TOKEN}`;
    }
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    let data: unknown;
    const contentType = response.headers.get("content-type") ?? "";
    if (response.status === 204) {
      data = null;
    } else if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
    } else {
      const text = await response.text();
      data = text.length ? text : null;
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  }
}
