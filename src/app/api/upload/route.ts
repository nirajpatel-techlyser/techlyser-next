import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function resolveMimeType(file: File) {
  if (file.type && ALLOWED_TYPES.has(file.type)) {
    return file.type === "image/jpg" ? "image/jpeg" : file.type;
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return EXT_TO_MIME[ext] || "";
}

function extensionFromMime(type: string, fallbackName: string) {
  if (type === "image/jpeg" || type === "image/jpg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";

  const fromName = fallbackName.split(".").pop()?.toLowerCase();
  return fromName || "jpg";
}

function sanitizeBaseName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function cloudinaryConfigured() {
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

async function uploadToCloudinary(
  file: File,
  folder: string,
  mimeType: string,
) {
  configureCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());
  const baseName = sanitizeBaseName(file.name) || "upload";

  return new Promise<{ url: string; filename: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${baseName}-${randomUUID().slice(0, 8)}`,
        resource_type: "image",
        overwrite: false,
        format: extensionFromMime(mimeType, file.name),
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error("Cloudinary upload returned no URL"));
          return;
        }
        resolve({
          url: result.secure_url,
          filename: result.public_id,
        });
      },
    );
    stream.end(buffer);
  });
}

async function uploadToLocalPublic(file: File, mimeType: string) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const baseName = sanitizeBaseName(file.name) || "upload";
  const ext = extensionFromMime(mimeType, file.name);
  const filename = `${baseName}-${randomUUID().slice(0, 8)}.${ext}`;

  const relativeDir = path.join("images", "blog", year, month);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const absolutePath = path.join(absoluteDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    url: `/${relativeDir.replace(/\\/g, "/")}/${filename}`,
    filename,
  };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const mimeType = resolveMimeType(file);
    if (!mimeType || !ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP and GIF images are allowed." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image must be smaller than 8MB." },
        { status: 400 },
      );
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const folder = `techlyser/blog/${year}/${month}`;

    if (cloudinaryConfigured()) {
      const uploaded = await uploadToCloudinary(file, folder, mimeType);
      return NextResponse.json(uploaded);
    }

    if (isServerlessFilesystem()) {
      return NextResponse.json(
        {
          error:
            "Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.",
        },
        { status: 503 },
      );
    }

    const uploaded = await uploadToLocalPublic(file, mimeType);
    return NextResponse.json(uploaded);
  } catch (error) {
    console.error("Image upload failed:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
