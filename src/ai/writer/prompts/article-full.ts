export const WRITER_ARTICLE_FULL_TEMPLATE = `Write a complete SEO article draft for Techlyser that helps Shopify stores grow and positions Techlyser as the expert partner.

Inputs:
- Primary keyword: {{keyword}}
- Target audience: {{audience}}
- Search intent: {{searchIntent}}
- Category: {{category}}
- Tone: {{tone}}
- Target word count: ~{{targetWords}} words (articleMarkdown body only)

Content strategy (mandatory):
- Center the article on Shopify / D2C store growth outcomes (revenue, conversion, speed, discoverability)
- Include at least one section useful to founders (decisions, ROI, prioritization, briefing vendors)
- Include at least one section useful to developers or implementers (how to execute, measure, or ship safely)
- Cover practical CRO, GEO/AEO, A/B testing, UX, or technical delivery details when the keyword allows
- Soft-sell Techlyser as the agency that audits, builds, and optimizes Shopify stores — never hard-sell unrelated products
- If the keyword looks like a third-party product or GitHub repo, REFRAME it into a Shopify growth / implementation problem Techlyser solves (do not write a product marketing piece for that vendor)

Requirements:
1. seoTitle — compelling, ≤60 chars when possible, includes keyword naturally; prefer Shopify/growth framing
2. metaDescription — 140–160 chars, includes keyword + CTA hint toward Techlyser help
3. slug — lowercase kebab-case, no leading/trailing hyphens, no year unless essential
4. outline — markdown bullet outline (H2/H3 headings only)
5. excerpt — 1–2 sentence summary for blog cards
6. articleMarkdown — full article body in markdown (H2/H3, lists, bold). No H1. No FAQ/HowTo/CTA sections here — those are separate fields
7. faqs — array of 4–6 objects { question, answer } aligned to People Also Ask
8. howTo — optional object { name, description, steps: [{ name, text }] } when intent is informational/how-to; null otherwise
9. comparisonTable — optional { headers: string[], rows: string[][] } when commercial/comparison intent fits; null otherwise
10. cta — { headline, body, buttonText, href } — href must be one of /free-shopify-audit, /services/shopify, /shopify-developers-india, /contact (internal only)
11. featuredImagePrompt — one detailed prompt for a professional blog hero image (no text in image); ecommerce/Shopify context
12. tags — 3–6 lowercase slug-friendly tags; include shopify when relevant
13. linkedinPersonalPost — markdown post for a personal LinkedIn profile (1st-person founder/expert voice, ~150–250 words, line breaks, 3–6 hashtags, soft CTA + mention the article topic; no HTML)
14. linkedinPagePost — markdown post for Techlyser company LinkedIn page (brand voice, ~120–200 words, line breaks, 3–6 hashtags, CTA to contact/consult; no HTML). Different angle from the personal post — more brand/agency oriented

Return JSON:
{
  "seoTitle": string,
  "metaDescription": string,
  "slug": string,
  "outline": string,
  "excerpt": string,
  "articleMarkdown": string,
  "faqs": [{ "question": string, "answer": string }],
  "howTo": { "name": string, "description": string, "steps": [{ "name": string, "text": string }] } | null,
  "comparisonTable": { "headers": string[], "rows": string[][] } | null,
  "cta": { "headline": string, "body": string, "buttonText": string, "href": string },
  "featuredImagePrompt": string,
  "tags": string[],
  "linkedinPersonalPost": string,
  "linkedinPagePost": string
}`;
