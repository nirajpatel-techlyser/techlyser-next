import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    lang: "en-IN",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/images/50x50_favicon_Icon.png",
        sizes: "50x50",
        type: "image/png",
      },
      {
        src: "/images/TEXHLYSER_Logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
