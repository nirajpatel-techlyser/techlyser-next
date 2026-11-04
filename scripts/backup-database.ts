/**
 * Full table dump for Postgres switch. Never logs DATABASE_URL or row contents.
 * Usage: npx tsx --env-file=.env.local scripts/backup-database.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "bigint") return String(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (value instanceof Date) return `'${value.toISOString().replace(/'/g, "''")}'`;
  if (Buffer.isBuffer(value)) return `'\\x${value.toString("hex")}'`;
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is missing.");

  const outDir = path.join(process.cwd(), "backups", `supabase-${stamp()}`);
  const dataDir = path.join(outDir, "data");
  await mkdir(dataDir, { recursive: true });

  // Supabase pooler certs often fail Node's default chain check during one-off dumps.
  const parsed = new URL(url);
  parsed.searchParams.delete("sslmode");
  parsed.searchParams.set("sslmode", "no-verify");
  const client = new Client({
    connectionString: parsed.toString(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30_000,
  });
  await client.connect();

  try {
    const tables = await client.query<{ tablename: string }>(
      `SELECT tablename
       FROM pg_tables
       WHERE schemaname = 'public'
       ORDER BY tablename`,
    );

    const counts: Record<string, number> = {};
    const sqlChunks: string[] = [
      "-- Techlyser Postgres data backup",
      `-- createdAt: ${new Date().toISOString()}`,
      "-- Schema comes from prisma/migrations. This file only restores public table rows.",
      "BEGIN;",
      "",
    ];

    for (const { tablename } of tables.rows) {
      const quoted = `"${tablename.replace(/"/g, '""')}"`;
      const result = await client.query(`SELECT * FROM ${quoted}`);
      counts[tablename] = result.rowCount ?? result.rows.length;
      await writeFile(
        path.join(dataDir, `${tablename}.json`),
        JSON.stringify(result.rows, null, 2),
        "utf8",
      );

      if (result.rows.length === 0) {
        sqlChunks.push(`-- ${tablename}: 0 rows`);
        continue;
      }

      const columns = Object.keys(result.rows[0]);
      const colList = columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(", ");
      sqlChunks.push(`-- ${tablename}: ${result.rows.length} rows`);
      for (const row of result.rows) {
        const values = columns.map((c) => sqlLiteral((row as Record<string, unknown>)[c])).join(", ");
        sqlChunks.push(
          `INSERT INTO ${quoted} (${colList}) VALUES (${values}) ON CONFLICT DO NOTHING;`,
        );
      }
      sqlChunks.push("");
    }

    sqlChunks.push("COMMIT;");
    await writeFile(path.join(outDir, "data.sql"), sqlChunks.join("\n"), "utf8");
    await writeFile(
      path.join(outDir, "manifest.json"),
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          source: "supabase-pooler",
          tableCount: tables.rows.length,
          rowCounts: counts,
          totalRows: Object.values(counts).reduce((a, b) => a + b, 0),
          files: {
            dataSql: "data.sql",
            dataJsonDir: "data/",
            schemaSource: "prisma/migrations",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    console.log(`backup_dir=${outDir}`);
    console.log(`tables=${tables.rows.length}`);
    console.log(`rows=${Object.values(counts).reduce((a, b) => a + b, 0)}`);
    for (const [name, count] of Object.entries(counts)) {
      console.log(`${name}=${count}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Backup failed");
  process.exit(1);
});
