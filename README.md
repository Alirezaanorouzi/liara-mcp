# Liara PaaS MCP

Streamable HTTP MCP server for [Liara PaaS](https://developers.liara.ir/pages/paas.md): apps, deploy history, logs, disks, domains, GitHub integration, and **`paas_deploy`** via [`@liara/cli`](https://docs.liara.ir/references/cli/deploy-app/).

## Setup

```bash
cd liara-mcp
cp .env.example .env
# Edit .env: LIARA_API_TOKEN, MCP_ACCESS_TOKEN
npm install
npm run dev
```

Health: `GET http://127.0.0.1:3100/health`  
MCP: `POST http://127.0.0.1:3100/mcp` with header `Authorization: Bearer <MCP_ACCESS_TOKEN>`

## Cursor MCP config

See [`mcp.json.example`](mcp.json.example) — add to Cursor MCP settings (HTTP transport).

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `LIARA_API_TOKEN` | yes | Liara API token (`Authorization: Bearer` + CLI deploy) |
| `MCP_ACCESS_TOKEN` | yes | Protects the MCP HTTP endpoint |
| `LIARA_TEAM_ID` | no | Default `teamID` for team-scoped resources |
| `PORT` | no | Default `3100` |
| `LIARA_DEPLOY_PATH_ALLOWLIST` | no | Comma-separated roots allowed for `paas_deploy` `--path` |

## Agent deploy flow

1. `paas_deploy` — runs `npx @liara/cli deploy` from the project directory  
2. `paas_list_releases` / `paas_get_release` — track deployment state  
3. `paas_get_build_logs` — build output while building  
4. `paas_get_app_logs` — runtime logs  

## Tool groups

- **Apps & networks** — create/list apps, networks  
- **Configuration & settings** — env, plan, scale, zero-downtime, etc.  
- **Deployments** — release history (upload omitted; use CLI deploy)  
- **Observability** — logs, metrics, events  
- **Domains & SSL** — custom domains, certs, redirect  
- **Disks & backups & FTP** — persistent storage  
- **Git / one-click** — GitHub linking (OAuth steps need a human in the browser)  

All REST tools accept optional `teamId` to override `LIARA_TEAM_ID`.

## Scripts

- `npm run dev` — watch mode  
- `npm start` — run server  
- `npm run build` — compile to `dist/`  
