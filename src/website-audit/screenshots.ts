export type ReportScreenshot = {
  id: string;
  device: "desktop" | "mobile";
  kind: "actual" | "suggested";
  pageLabel: string;
  pageUrl: string;
  caption: string;
  /** Remote screenshot URL when available (actual only). */
  imageUrl?: string;
  /** Optional fetched bytes for PDF embedding. */
  imageBytes?: Uint8Array;
  mimeType?: "image/jpeg" | "image/png";
};

function thumUrl(pageUrl: string, device: "desktop" | "mobile") {
  const width = device === "mobile" ? 480 : 1400;
  const crop = device === "mobile" ? 900 : 900;
  return `https://image.thum.io/get/width/${width}/crop/${crop}/noanimate/${pageUrl}`;
}

async function fetchImageBytes(url: string): Promise<{
  bytes: Uint8Array;
  mimeType: "image/jpeg" | "image/png";
} | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { Accept: "image/*,*/*" },
    });
    if (!response.ok) return null;
    const mime = response.headers.get("content-type") || "";
    const buffer = new Uint8Array(await response.arrayBuffer());
    if (buffer.byteLength < 1000) return null;
    if (mime.includes("png")) return { bytes: buffer, mimeType: "image/png" };
    return { bytes: buffer, mimeType: "image/jpeg" };
  } catch {
    return null;
  }
}

export async function buildReportScreenshots(
  pages: Array<{ url: string; label: string }>,
): Promise<ReportScreenshot[]> {
  const slots: ReportScreenshot[] = [];
  const desktopPages = pages.slice(0, 4);
  const mobilePages = pages.slice(0, 2);

  for (const page of desktopPages) {
    slots.push({
      id: `desktop-actual-${page.url}`,
      device: "desktop",
      kind: "actual",
      pageLabel: page.label,
      pageUrl: page.url,
      caption: `Current ${page.label.toLowerCase()} on desktop — what visitors see today.`,
      imageUrl: thumUrl(page.url, "desktop"),
    });
    slots.push({
      id: `desktop-suggested-${page.url}`,
      device: "desktop",
      kind: "suggested",
      pageLabel: page.label,
      pageUrl: page.url,
      caption: `Suggested direction for ${page.label.toLowerCase()} (illustrative concept — not a live redesign).`,
    });
  }

  for (const page of mobilePages) {
    slots.push({
      id: `mobile-actual-${page.url}`,
      device: "mobile",
      kind: "actual",
      pageLabel: page.label,
      pageUrl: page.url,
      caption: `Current ${page.label.toLowerCase()} on mobile.`,
      imageUrl: thumUrl(page.url, "mobile"),
    });
    slots.push({
      id: `mobile-suggested-${page.url}`,
      device: "mobile",
      kind: "suggested",
      pageLabel: page.label,
      pageUrl: page.url,
      caption: `Suggested mobile direction for ${page.label.toLowerCase()} (illustrative).`,
    });
  }

  const limited = slots.slice(0, 10);
  const actuals = limited.filter((s) => s.kind === "actual" && s.imageUrl);
  const fetched = await Promise.all(
    actuals.map(async (slot) => {
      const image = await fetchImageBytes(slot.imageUrl!);
      return { id: slot.id, image };
    }),
  );
  const byId = new Map(fetched.map((row) => [row.id, row.image]));

  return limited.map((slot) => {
    const image = byId.get(slot.id);
    if (!image) return slot;
    return { ...slot, imageBytes: image.bytes, mimeType: image.mimeType };
  });
}
