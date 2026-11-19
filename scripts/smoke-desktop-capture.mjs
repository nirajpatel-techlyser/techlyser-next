import { readFileSync } from "node:fs";
import { renderConceptHtmlDesktopCapture } from "../src/lib/business-website-generator/render-concept-pdf.ts";

let html = readFileSync("public/templates/business-landing/doctor.html", "utf8");
const demo = {
  BUSINESS_NAME: "Dr Yogendra Singh jamra Clinic",
  CATEGORY: "Doctors",
  CITY: "Indore",
  DEGREE: "Not listed",
  SPECIALTY: "Cardiology",
  PHONE: "+919425047277",
  EMAIL: "Not listed publicly",
  ADDRESS: "42-A Rajendra Nagar Indore",
  HOURS: "Mo-Sa 16:00-18:00",
  ABOUT_SHORT: "Cardiology care in Indore.",
  ABOUT_LONG: "Clinic listing for Indore patients.",
  HERO_IMAGE:
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80",
  ABOUT_IMAGE:
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80",
  GALLERY_1:
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80",
  GALLERY_2:
    "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1000&q=80",
  GALLERY_3:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
  GALLERY_4:
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80",
  GALLERY_5:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=80",
};

html = html
  .replace(/<p class="template-note">[\s\S]*?<\/p>\s*/i, "")
  .replace(/<script>[\s\S]*?<\/script>\s*/i, "");

for (const [k, v] of Object.entries(demo)) {
  html = html.split(`{{${k}}}`).join(v);
}

const c = await renderConceptHtmlDesktopCapture(html);
console.log(
  c
    ? { ok: true, w: c.width, h: c.height, bytes: c.pngBytes.byteLength }
    : { ok: false },
);
