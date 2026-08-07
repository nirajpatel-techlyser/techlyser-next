import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  );
}

function isServerlessFilesystem() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function sanitizeBaseName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function uploadImageBuffer(input: {
  buffer: Buffer;
  mimeType?: string;
  baseName?: string;
  folder?: string;
}): Promise<{ url: string; storage: "cloudinary" | "local" }> {
  const mimeType = input.mimeType || "image/png";
  const baseName = sanitizeBaseName(input.baseName || "blog-hero") || "blog-hero";
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const folder = input.folder || `techlyser/blog/${year}/${month}`;

  if (cloudinaryConfigured()) {
    configureCloudinary();
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${baseName}-${randomUUID().slice(0, 8)}`,
          resource_type: "image",
          overwrite: false,
          format: mimeType.includes("jpeg") ? "jpg" : "png",
        },
        (error, uploadResult) => {
          if (error || !uploadResult?.secure_url) {
            reject(error || new Error("Cloudinary upload returned no URL"));
            return;
          }
          resolve({ secure_url: uploadResult.secure_url });
        },
      );
      stream.end(input.buffer);
    });
    return { url: result.secure_url, storage: "cloudinary" };
  }

  if (isServerlessFilesystem()) {
    throw new Error(
      "Cloudinary is required for image upload on Vercel. Set CLOUDINARY_* env vars.",
    );
  }

  const ext = mimeType.includes("jpeg") ? "jpg" : "png";
  const filename = `${baseName}-${randomUUID().slice(0, 8)}.${ext}`;
  const relativeDir = path.join("images", "blog", year, month);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, filename), input.buffer);

  return {
    url: `/${relativeDir.replace(/\\/g, "/")}/${filename}`,
    storage: "local",
  };
}
