import type { Express, Request, Response, NextFunction } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { AppConfig } from "../config.js";
import { createMcpServer } from "../mcp/server.js";

export function mountMcpRoutes(app: Express, config: AppConfig): void {
  app.use("/mcp", mcpAuthMiddleware(config));

  app.post("/mcp", async (req, res) => {
    const server = createMcpServer(config);
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        transport.close();
        server.close();
      });
    } catch (error) {
      console.error("MCP request error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    });
  });

  app.delete("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    });
  });
}

function mcpAuthMiddleware(config: AppConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({
        jsonrpc: "2.0",
        error: { code: -32001, message: "Missing MCP Authorization Bearer token" },
        id: null,
      });
      return;
    }
    const token = header.slice("Bearer ".length).trim();
    if (token !== config.MCP_ACCESS_TOKEN) {
      res.status(401).json({
        jsonrpc: "2.0",
        error: { code: -32001, message: "Invalid MCP access token" },
        id: null,
      });
      return;
    }
    next();
  };
}
