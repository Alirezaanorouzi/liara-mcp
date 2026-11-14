import { spawn } from "node:child_process";
import path from "node:path";
import { realpath } from "node:fs/promises";

const OUTPUT_TAIL = 12_000;

export interface RunLiaraOptions {
  args: string[];
  cwd?: string;
  timeoutMs?: number;
}

export interface RunLiaraResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export async function runLiaraCli(
  options: RunLiaraOptions,
): Promise<RunLiaraResult> {
  const timeoutMs = options.timeoutMs ?? 30 * 60 * 1000;

  return new Promise((resolve) => {
    const child =
      process.platform === "win32"
        ? spawn("cmd.exe", ["/d", "/s", "/c", "npx", "@liara/cli", ...options.args], {
            cwd: options.cwd,
            windowsHide: true,
            env: process.env,
            stdio: ["ignore", "pipe", "pipe"],
          })
        : spawn("npx", ["@liara/cli", ...options.args], {
            cwd: options.cwd,
            env: process.env,
            stdio: ["ignore", "pipe", "pipe"],
          });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
      if (stdout.length > OUTPUT_TAIL * 2) {
        stdout = stdout.slice(-OUTPUT_TAIL * 2);
      }
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > OUTPUT_TAIL * 2) {
        stderr = stderr.slice(-OUTPUT_TAIL * 2);
      }
    });

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({
        exitCode,
        stdout: tail(stdout),
        stderr: tail(stderr),
        timedOut,
      });
    });
  });
}

function tail(text: string): string {
  if (text.length <= OUTPUT_TAIL) return text;
  return "…\n" + text.slice(-OUTPUT_TAIL);
}

export async function assertDeployPathAllowed(
  deployPath: string,
  allowlist: string[],
): Promise<string> {
  const resolved = await realpath(deployPath);
  if (allowlist.length === 0) {
    return resolved;
  }
  for (const allowed of allowlist) {
    const allowedResolved = await realpath(allowed).catch(() => path.resolve(allowed));
    const rel = path.relative(allowedResolved, resolved);
    if (!rel.startsWith("..") && !path.isAbsolute(rel)) {
      return resolved;
    }
  }
  throw new Error(
    `Deploy path ${resolved} is outside LIARA_DEPLOY_PATH_ALLOWLIST`,
  );
}
