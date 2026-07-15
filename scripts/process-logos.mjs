import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const logosDir = path.join(process.cwd(), "public/images/CLIENT_LOGOS");
const files = fs
  .readdirSync(logosDir)
  .filter((file) => file.endsWith(".png") && file !== "logos.zip");

for (const file of files) {
  const inputPath = path.join(logosDir, file);
  const { data, info } = await sharp(inputPath)
    .resize(1200, 452, {
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Remove near-black background so logos render crisp on light sections.
    if (r < 40 && g < 40 && b < 40) {
      pixels[i + 3] = 0;
    }
  }

  await sharp(pixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 6, quality: 100 })
    .toFile(inputPath);

  console.log(`Processed ${file} -> ${info.width}x${info.height}`);
}
