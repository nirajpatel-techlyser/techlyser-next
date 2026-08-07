import { uploadImageBuffer } from "@/lib/upload-image-buffer";
import { getImageModel } from "./config";

type ImageGenerationResult = {
  url: string;
  storage: "cloudinary" | "local";
  model: string;
};

export async function generateFeaturedImage(input: {
  prompt: string;
  slug: string;
}): Promise<ImageGenerationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[autopilot.image] OPENAI_API_KEY missing — skip image generation");
    return null;
  }

  const model = getImageModel();
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: input.prompt.slice(0, 950),
      n: 1,
      size: "1792x1024",
      quality: "standard",
      response_format: "b64_json",
    }),
  });

  const data = (await response.json()) as {
    data?: { b64_json?: string }[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI image API error (${response.status})`);
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI image API returned no image data");
  }

  const buffer = Buffer.from(b64, "base64");
  const uploaded = await uploadImageBuffer({
    buffer,
    mimeType: "image/png",
    baseName: input.slug,
    folder: "techlyser/blog/autopilot",
  });

  return { url: uploaded.url, storage: uploaded.storage, model };
}
