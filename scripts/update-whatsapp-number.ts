import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function loadEnvFile(file: string) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) return;
  for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
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

loadEnvFile(".env");
loadEnvFile(".env.local");

const WHATSAPP_URL = "https://wa.me/919203708608";

async function main() {
  const prisma = new PrismaClient();
  try {
    const row = await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: { id: "default", whatsappUrl: WHATSAPP_URL },
      update: { whatsappUrl: WHATSAPP_URL },
      select: { whatsappUrl: true },
    });
    console.log("Updated SiteSettings.whatsappUrl =", row.whatsappUrl);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
