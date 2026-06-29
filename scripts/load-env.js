// Load repo-root .env into process.env (does not override existing vars).
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function loadEnv({ root = REPO_ROOT } = {}) {
  const path = join(root, ".env");
  if (!existsSync(path)) return false;

  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trimEnd();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
  return true;
}

/** Call at startup for CLI scripts in scripts/ or pipeline/. */
export function loadEnvFromRepo() {
  return loadEnv({ root: REPO_ROOT });
}
