export const WRITER_ARTICLE_FULL_TEMPLATE = `Write a complete SEO article draft for Techlyser.

Inputs:
- Primary keyword: {{keyword}}
- Target audience: {{audience}}
- Search intent: {{searchIntent}}
- Category: {{category}}
- Tone: {{tone}}
- Target word count: ~{{targetWords}} words (articleMarkdown body only)

Requirements:
1. seoTitle — compelling, ≤60 chars when possible, includes keyword naturally
2. metaDescription — 140–160 chars, includes keyword + CTA hint
3. slug — lowercase kebab-case, no leading/trailing hyphens, no year unless essential
4. outline — markdown bullet outline (H2/H3 headings only)
5. excerpt — 1–2 sentence summary for blog cards
6. articleMarkdown — full article body in markdown (H2/H3, lists, bold). No H1. No FAQ/HowTo/CTA sections here — those are separate fields
7. faqs — array of 4–6 objects { question, answer } aligned to People Also Ask
8. howTo — optional object { name, description, steps: [{ name, text }] } when intent is informational/how-to; null otherwise
9. comparisonTable — optional { headers: string[], rows: string[][] } when commercial/comparison intent fits; null otherwise
10. cta — { headline, body, buttonText, href } — href must start with / (internal page)
11. featuredImagePrompt — one detailed prompt for a professional blog hero image (no text in image)
12. tags — 3–6 lowercase slug-friendly tags
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
