/**
 * Restore backups/<folder>/data/*.json into Neon.
 * Drops foreign keys, inserts from JSON, then run: npx prisma db push
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, Prisma } from "@prisma/client";

function sqlLiteral(value: unknown): Prisma.Sql {
  if (value === null || value === undefined) return Prisma.sql`NULL`;
  if (typeof value === "number") return Prisma.sql`${value}`;
  if (typeof value === "boolean") return Prisma.sql`${value}`;
  if (typeof value === "string") {
    // Dates serialized as ISO strings in JSON for DateTime columns
    return Prisma.sql`${value}`;
  }
  if (typeof value === "object") {
    return Prisma.sql`${JSON.stringify(value)}::jsonb`;
  }
  return Prisma.sql`${String(value)}`;
}

async function main() {
  const folder = process.argv[2] || "backups/supabase-20261102-055010Z";
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is missing.");
  const host = new URL(url).hostname;
  if (!host.includes("neon.tech")) {
    throw new Error(`Refusing restore: host is not Neon (${host}).`);
  }

  const dataDir = path.resolve(process.cwd(), folder, "data");
  const files = (await readdir(dataDir)).filter((name) => name.endsWith(".json")).sort();
  console.log(`data_dir=${dataDir}`);
  console.log(`restore_host=${host}`);
  console.log(`tables=${files.length}`);

  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    console.log("connected=yes");

    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE r RECORD;
      BEGIN
        FOR r IN (
          SELECT c.conname, c.conrelid::regclass::text AS tbl
          FROM pg_constraint c
          JOIN pg_namespace n ON n.oid = c.connamespace
          WHERE c.contype = 'f' AND n.nspname = 'public'
        ) LOOP
          EXECUTE 'ALTER TABLE ' || r.tbl || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        END LOOP;
      END $$;
    `);
    console.log("foreign_keys=dropped");

    let total = 0;
    for (const file of files) {
      const table = file.replace(/\.json$/, "");
      const rows = JSON.parse(await readFile(path.join(dataDir, file), "utf8")) as Record<
        string,
        unknown
      >[];
      if (rows.length === 0) {
        console.log(`${table}=0`);
        continue;
      }

      const quotedTable = `"${table.replace(/"/g, '""')}"`;
      await prisma.$executeRawUnsafe(`DELETE FROM ${quotedTable}`);

      const columns = Object.keys(rows[0]);
      const colList = columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(", ");
      let inserted = 0;
      for (const row of rows) {
        const values = columns.map((c) => {
          const value = row[c];
          if (value === null || value === undefined) return "NULL";
          if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
          if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
          if (Array.isArray(value)) {
            if (value.every((item) => typeof item === "string")) {
              const items = value
                .map((item) => `'${String(item).replace(/'/g, "''")}'`)
                .join(", ");
              return `ARRAY[${items}]::text[]`;
            }
            return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
          }
          if (typeof value === "object") {
            return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
          }
          return `'${String(value).replace(/'/g, "''")}'`;
        });
        await prisma.$executeRawUnsafe(
          `INSERT INTO ${quotedTable} (${colList}) VALUES (${values.join(", ")})`,
        );
        inserted += 1;
      }
      total += inserted;
      console.log(`${table}=${inserted}`);
    }
    console.log(`restored_rows=${total}`);

    const blogs = await prisma.blog.count();
    const users = await prisma.user.count();
    const ideas = await prisma.contentIdea.count();
    const pageViews = await prisma.pageView.count();
    console.log(`verify Blog=${blogs} User=${users} ContentIdea=${ideas} PageView=${pageViews}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
