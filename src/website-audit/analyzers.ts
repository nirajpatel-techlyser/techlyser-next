import {
  countForms,
  detectCtaSignals,
  detectTrustSignals,
  getCanonical,
  getHeadings,
  getImages,
  getLinks,
  getMetaContent,
  getTitle,
  hasHttps,
  hasViewport,
  stripTags,
} from "@/website-audit/html";
import type { CrawledSite as CrawlResult } from "@/website-audit/crawler";
import type { AuditFinding } from "@/website-audit/types";

function finding(
  partial: Omit<AuditFinding, "id"> & { id?: string },
): AuditFinding {
  return {
    id: partial.id || `${partial.category}-${partial.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80),
    ...partial,
  };
}

export function analyzeTechnical(site: CrawlResult): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const home = site.pages.find((p) => p.status === "ok" && p.html);
  if (!home?.html) {
    findings.push(
      finding({
        category: "seo",
        title: "Homepage could not be analyzed",
        observation: "The homepage HTML was unavailable, so most checks could not run.",
        whyItMatters: "Without page access we cannot verify SEO, UX, or conversion signals.",
        recommendation: "Confirm the site is publicly reachable over HTTPS and try again.",
        severity: "critical",
        confidence: "unable_to_verify",
        scoreImpact: 10,
        passed: false,
        available: false,
      }),
    );
    return findings;
  }

  const html = home.html;
  const title = getTitle(html);
  const description = getMetaContent(html, "description");
  const robots = getMetaContent(html, "robots");
  const canonical = getCanonical(html);
  const ogTitle = getMetaContent(html, "og:title");
  const headings = getHeadings(html);
  const images = getImages(html);
  const links = getLinks(html, home.url);
  const missingAlt = images.filter((img) => img.alt === null).length;
  const ctaSignals = detectCtaSignals(html);
  const trustSignals = detectTrustSignals(html);
  const forms = countForms(html);
  const text = stripTags(html);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  findings.push(
    finding({
      category: "seo",
      title: "Page title present",
      observation: title
        ? `Title found: “${title.slice(0, 90)}” (${title.length} chars).`
        : "No <title> tag was found on the homepage.",
      whyItMatters: "Titles are a primary search and browser-tab signal.",
      recommendation: title
        ? title.length < 30 || title.length > 65
          ? "Tighten the title to roughly 50–60 characters with a clear business benefit."
          : "Keep the title unique per page and aligned with the primary offer."
        : "Add a unique, benefit-led homepage title.",
      severity: title ? "low" : "high",
      confidence: "verified",
      scoreImpact: title ? (title.length >= 30 && title.length <= 65 ? 0 : 3) : 8,
      passed: Boolean(title),
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "seo",
      title: "Meta description",
      observation: description
        ? `Meta description present (${description.length} chars).`
        : "No meta description was found.",
      whyItMatters: "Descriptions influence click clarity in search results when shown.",
      recommendation: description
        ? "Ensure the description summarizes the offer and next step in ~140–160 characters."
        : "Add a clear meta description that states who you help and what to do next.",
      severity: description ? "low" : "medium",
      confidence: "verified",
      scoreImpact: description ? 0 : 5,
      passed: Boolean(description),
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "seo",
      title: "H1 structure",
      observation:
        headings.h1.length === 0
          ? "No H1 heading was detected."
          : headings.h1.length === 1
            ? `One H1 found: “${headings.h1[0]}”.`
            : `${headings.h1.length} H1 headings were found.`,
      whyItMatters: "A single clear H1 helps visitors and search engines understand the page topic.",
      recommendation:
        headings.h1.length === 1
          ? "Keep one focused H1 that names the audience and value."
          : "Use exactly one clear H1 on the homepage.",
      severity: headings.h1.length === 1 ? "info" : "medium",
      confidence: "verified",
      scoreImpact: headings.h1.length === 1 ? 0 : 5,
      passed: headings.h1.length === 1,
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "seo",
      title: "Canonical URL",
      observation: canonical ? `Canonical set to ${canonical}` : "No canonical link tag detected.",
      whyItMatters: "Canonicals reduce duplicate-URL confusion for crawlers.",
      recommendation: canonical
        ? "Confirm the canonical matches the preferred public homepage URL."
        : "Add a self-referencing canonical on key pages.",
      severity: canonical ? "info" : "low",
      confidence: "verified",
      scoreImpact: canonical ? 0 : 2,
      passed: Boolean(canonical),
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "seo",
      title: "Open Graph title",
      observation: ogTitle ? "og:title is present." : "og:title was not found.",
      whyItMatters: "Social sharing previews rely on Open Graph tags for clarity.",
      recommendation: ogTitle
        ? "Keep OG tags consistent with the page offer."
        : "Add Open Graph title/description/image for cleaner social shares.",
      severity: ogTitle ? "info" : "low",
      confidence: "verified",
      scoreImpact: ogTitle ? 0 : 2,
      passed: Boolean(ogTitle),
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "seo",
      title: "robots.txt availability",
      observation: site.robotsTxt
        ? "robots.txt was reachable."
        : "robots.txt was not found at the site root.",
      whyItMatters: "Crawlers use robots.txt to understand allowed paths.",
      recommendation: site.robotsTxt
        ? "Review robots.txt so important pages are not blocked."
        : "Publish a robots.txt that allows indexing of public marketing pages.",
      severity: site.robotsTxt ? "info" : "medium",
      confidence: "verified",
      scoreImpact: site.robotsTxt ? 0 : 3,
      passed: Boolean(site.robotsTxt),
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "seo",
      title: "XML sitemap signal",
      observation: site.sitemapFound
        ? "An XML sitemap was detected at a common path."
        : "No XML sitemap was detected at common paths.",
      whyItMatters: "Sitemaps help search engines discover important URLs.",
      recommendation: site.sitemapFound
        ? "Submit and maintain the sitemap in Search Console."
        : "Publish sitemap.xml and keep it updated as pages change.",
      severity: site.sitemapFound ? "info" : "medium",
      confidence: "verified",
      scoreImpact: site.sitemapFound ? 0 : 3,
      passed: site.sitemapFound,
      available: true,
    }),
  );

  if (robots && /noindex/i.test(robots)) {
    findings.push(
      finding({
        category: "seo",
        title: "Homepage may be set to noindex",
        observation: `robots meta includes: ${robots}`,
        whyItMatters: "noindex prevents the page from appearing in search results.",
        recommendation: "Remove noindex from public marketing pages unless intentional.",
        severity: "critical",
        confidence: "verified",
        scoreImpact: 10,
        passed: false,
        available: true,
      }),
    );
  }

  findings.push(
    finding({
      category: "mobile",
      title: "Viewport meta tag",
      observation: hasViewport(html)
        ? "Viewport meta tag is present."
        : "Viewport meta tag was not found.",
      whyItMatters: "Without a viewport, mobile layouts often render poorly.",
      recommendation: hasViewport(html)
        ? "Validate spacing and tap targets on real devices."
        : "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
      severity: hasViewport(html) ? "info" : "high",
      confidence: "verified",
      scoreImpact: hasViewport(html) ? 0 : 8,
      passed: hasViewport(html),
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "trust",
      title: "HTTPS",
      observation: hasHttps(home.url)
        ? "Homepage is served over HTTPS."
        : "Homepage is not using HTTPS.",
      whyItMatters: "Browsers and visitors expect secure connections for trust.",
      recommendation: hasHttps(home.url)
        ? "Keep HTTPS and HSTS configured."
        : "Enable HTTPS and redirect HTTP to HTTPS.",
      severity: hasHttps(home.url) ? "info" : "critical",
      confidence: "verified",
      scoreImpact: hasHttps(home.url) ? 0 : 10,
      passed: hasHttps(home.url),
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "trust",
      title: "Image alternative text",
      observation:
        images.length === 0
          ? "No <img> tags detected on the homepage sample."
          : `${missingAlt} of ${images.length} images are missing an alt attribute.`,
      whyItMatters: "Alt text supports accessibility and image understanding.",
      recommendation:
        missingAlt > 0
          ? "Add meaningful alt text to informative images; use empty alt for decorative ones."
          : "Continue providing descriptive alt text for meaningful images.",
      severity: missingAlt > 0 ? "medium" : "info",
      confidence: "verified",
      scoreImpact: images.length === 0 ? 0 : missingAlt > 0 ? Math.min(6, missingAlt) : 0,
      passed: missingAlt === 0,
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "conversion",
      title: "Call-to-action language",
      observation:
        ctaSignals.length > 0
          ? `Detected CTA-related phrases: ${ctaSignals.slice(0, 5).join(", ")}.`
          : "No common CTA phrases were detected in homepage text.",
      whyItMatters: "Clear next steps help visitors convert into enquiries or purchases.",
      recommendation:
        ctaSignals.length > 0
          ? "Place the primary CTA near the hero and repeat it after key sections."
          : "Add a visible primary CTA that states the next step (contact, book, buy, get quote).",
      severity: ctaSignals.length > 0 ? "low" : "high",
      confidence: "verified",
      scoreImpact: ctaSignals.length > 0 ? 0 : 7,
      passed: ctaSignals.length > 0,
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "conversion",
      title: "Lead capture form",
      observation:
        forms > 0
          ? `${forms} form(s) detected on the homepage HTML.`
          : "No form element was detected on the homepage.",
      whyItMatters: "Forms reduce friction for contact and lead capture.",
      recommendation:
        forms > 0
          ? "Ensure the form is easy to find and asks only for necessary fields."
          : "Add a contact/enquiry form or a clear path to contact within one click.",
      severity: forms > 0 ? "info" : "medium",
      confidence: "verified",
      scoreImpact: forms > 0 ? 0 : 5,
      passed: forms > 0,
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "trust",
      title: "Trust / proof signals",
      observation:
        trustSignals.length > 0
          ? `Detected signals: ${trustSignals.join(", ")}.`
          : "Few common trust signals (privacy, reviews, case studies) were detected.",
      whyItMatters: "Trust content reduces hesitation before contacting a business.",
      recommendation:
        trustSignals.length > 0
          ? "Make proof (reviews, clients, policies) easier to notice above the fold."
          : "Add privacy policy, contact details, and social proof near conversion points.",
      severity: trustSignals.length > 0 ? "low" : "medium",
      confidence: "verified",
      scoreImpact: trustSignals.length > 0 ? 0 : 4,
      passed: trustSignals.length > 0,
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "content",
      title: "Homepage content depth",
      observation: `Approx. ${wordCount} words of visible text on the homepage sample.`,
      whyItMatters: "Thin pages make it harder to communicate offer, proof, and next steps.",
      recommendation:
        wordCount < 150
          ? "Expand the homepage with a clear value proposition, services, and proof."
          : "Keep copy scannable with strong headings and a crisp offer statement.",
      severity: wordCount < 150 ? "medium" : "info",
      confidence: "verified",
      scoreImpact: wordCount < 150 ? 4 : 0,
      passed: wordCount >= 150,
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "content",
      title: "Heading support structure",
      observation: `${headings.h2.length} H2 and ${headings.h3.length} H3 headings detected.`,
      whyItMatters: "Heading hierarchy improves scanability and topical clarity.",
      recommendation:
        headings.h2.length >= 2
          ? "Keep H2s outcome-focused rather than generic labels."
          : "Organize homepage sections under clear H2 headings.",
      severity: headings.h2.length >= 2 ? "info" : "low",
      confidence: "verified",
      scoreImpact: headings.h2.length >= 2 ? 0 : 3,
      passed: headings.h2.length >= 2,
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "uiux",
      title: "Internal navigation links",
      observation: `${links.filter((l) => l.internal).length} internal links detected in the homepage sample.`,
      whyItMatters: "Clear navigation helps visitors reach services and contact paths.",
      recommendation:
        links.filter((l) => l.internal).length >= 5
          ? "Audit menu labels for clarity and reduce dead ends."
          : "Improve navigation so key pages (services, about, contact) are one click away.",
      severity: links.filter((l) => l.internal).length >= 5 ? "info" : "medium",
      confidence: "verified",
      scoreImpact: links.filter((l) => l.internal).length >= 5 ? 0 : 4,
      passed: links.filter((l) => l.internal).length >= 5,
      available: true,
    }),
  );

  findings.push(
    finding({
      category: "uiux",
      title: "Visual design inspection",
      observation:
        "Automated DOM checks ran; a full visual design review (spacing, alignment, screenshots) was not performed in this audit pass.",
      whyItMatters: "Visual hierarchy and spacing affect trust and comprehension.",
      recommendation:
        "Manually review hero hierarchy, section spacing, and CTA contrast on desktop and mobile.",
      severity: "info",
      confidence: "not_tested",
      scoreImpact: 0,
      passed: false,
      available: false,
    }),
  );

  findings.push(
    finding({
      category: "performance",
      title: "Core Web Vitals measurement",
      observation: process.env.PAGESPEED_API_KEY
        ? "PageSpeed Insights can be queried when the performance step runs."
        : "PAGESPEED_API_KEY is not configured, so live CWV were not measured.",
      whyItMatters: "Performance affects experience and search quality signals.",
      recommendation:
        "Enable PageSpeed Insights API for measured LCP/INP/CLS, or run Lighthouse manually.",
      severity: "info",
      confidence: process.env.PAGESPEED_API_KEY ? "potential" : "not_tested",
      scoreImpact: 0,
      passed: false,
      available: Boolean(process.env.PAGESPEED_API_KEY),
    }),
  );

  return findings;
}

// re-export type bridge if needed
export type { AuditFinding };
