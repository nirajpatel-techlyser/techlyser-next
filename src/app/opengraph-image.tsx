import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b1220 0%, #1a2744 55%, #0f172a 100%)",
          color: "#fff",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#fb923c",
            fontWeight: 700,
          }}
        >
          Techlyser
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 980,
            }}
          >
            Shopify Developers India
          </div>
          <div style={{ fontSize: 28, color: "#cbd5e1", maxWidth: 900 }}>
            Premium Shopify, Shopify Plus, Next.js & AI automation agency
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#94a3b8" }}>
          techlyser.com
        </div>
      </div>
    ),
    { ...size },
  );
}
