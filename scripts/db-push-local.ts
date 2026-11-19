import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

function loadEnvFile(file: string) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

// Prefer Next.js local override (Neon) over stale .env Supabase.
loadEnvFile(".env");
loadEnvFile(".env.local");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}
try {
  const parsed = new URL(url);
  console.log(`Using DATABASE_URL host: ${parsed.hostname}`);
} catch {
  console.error("DATABASE_URL unparsable");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", "db", "push"], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
