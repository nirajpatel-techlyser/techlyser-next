import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "templates", "business-landing");
const files = readdirSync(dir).filter((f) => f.endsWith(".html"));
console.log("html files:", files.length);

const urls = [
  ...new Set(
    files.flatMap((f) => {
      const html = readFileSync(path.join(dir, f), "utf8");
      return [...html.matchAll(/https:\/\/images\.unsplash\.com\/[^"'\\\s>]+/g)].map(
        (m) => m[0],
      );
    }),
  ),
];

let bad = 0;
const badList = [];
for (const u of urls) {
  try {
    const r = await fetch(u, { method: "HEAD" });
    if (r.status !== 200) {
      bad += 1;
      badList.push(`${r.status} ${u}`);
    }
  } catch {
    bad += 1;
    badList.push(`FAIL ${u}`);
  }
}
console.log("unique images:", urls.length, "bad:", bad);
for (const row of badList.slice(0, 40)) console.log(row);
if (badList.length > 40) console.log(`... +${badList.length - 40} more`);
