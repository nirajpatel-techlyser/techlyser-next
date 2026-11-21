import { existsSync } from "node:fs";

/**
 * Render Website Studio HTML as a desktop full-page screenshot (not tablet/print layout).
 */

function windowsBrowserCandidates() {
  if (process.platform !== "win32") {
    return [process.env.PUPPETEER_EXECUTABLE_PATH, process.env.CHROME_PATH].filter(
      (p): p is string => Boolean(p),
    );
  }
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  return candidates.filter((p): p is string => Boolean(p && existsSync(p)));
}

/** Load puppeteer only at runtime — never bundle Chromium into the Next graph. */
async function loadPuppeteer(): Promise<typeof import("puppeteer") | null> {
  try {
    // webpackIgnore keeps Vercel/Next from resolving puppeteer's native deps at build time.
    return await import(/* webpackIgnore: true */ "puppeteer");
  } catch (err) {
    console.warn("[puppeteer] unavailable in this environment:", err);
    return null;
  }
}

async function launchBrowser(puppeteer: typeof import("puppeteer")) {
  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--font-render-hinting=none",
    "--hide-scrollbars",
  ];

  for (const executablePath of windowsBrowserCandidates()) {
    try {
      return await puppeteer.launch({
        headless: true,
        executablePath,
        args,
      });
    } catch {
      // try next candidate
    }
  }

  // Puppeteer's typed channels are Chrome only ("chrome" | "chrome-beta" | …).
  // Edge is covered above via executablePath on Windows.
  try {
    return await puppeteer.launch({
      headless: true,
      channel: "chrome",
      args,
    });
  } catch {
    // fall through to bundled Chromium
  }

  return puppeteer.launch({
    headless: true,
    args,
  });
}

export type DesktopCapture = {
  pngBytes: Uint8Array;
  width: number;
  height: number;
  engine: "puppeteer";
};

/** Desktop viewport capture of the exact studio HTML (screen CSS, full page). */
export async function renderConceptHtmlDesktopCapture(
  html: string,
): Promise<DesktopCapture | null> {
  if (!html || html.length < 200) return null;

  const puppeteer = await loadPuppeteer();
  if (!puppeteer) return null;

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await launchBrowser(puppeteer);
    const page = await browser.newPage();

    // True desktop width (template mobile breakpoint is 900px).
    await page.setViewport({
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
    });
    // Force screen styles — print media was making it look like a tablet/print sheet.
    await page.emulateMediaType("screen");

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await new Promise((r) => setTimeout(r, 1000));

    const pngBytes = await page.screenshot({
      type: "png",
      fullPage: true,
      captureBeyondViewport: true,
    });

    const metrics = await page.evaluate(() => ({
      width: Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth || 0,
        1440,
      ),
      height: Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight || 0,
        900,
      ),
    }));

    return {
      pngBytes,
      width: metrics.width,
      height: metrics.height,
      engine: "puppeteer",
    };
  } catch (err) {
    console.error("[renderConceptHtmlDesktopCapture]", err);
    return null;
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}

/** @deprecated Prefer renderConceptHtmlDesktopCapture for desktop PDF pages. */
export async function renderConceptHtmlToPdf(
  html: string,
): Promise<{ pdfBytes: Uint8Array; engine: "puppeteer" } | null> {
  const capture = await renderConceptHtmlDesktopCapture(html);
  if (!capture) return null;

  // Keep a simple single-engine PDF fallback path unused by proposal builder.
  const puppeteer = await loadPuppeteer();
  if (!puppeteer) return null;

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await launchBrowser(puppeteer);
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaType("screen");
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await new Promise((r) => setTimeout(r, 800));
    const pdfBytes = await page.pdf({
      width: "1440px",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return { pdfBytes, engine: "puppeteer" };
  } catch (err) {
    console.error("[renderConceptHtmlToPdf]", err);
    return null;
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}
