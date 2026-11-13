import { formatInternalUrlsForPrompt } from "@/ai/brand/positioning";

export const WRITER_ARTICLE_FULL_TEMPLATE = `Write THREE distinct content assets as one JSON object: (1) website SEO article, (2) personal LinkedIn thought leadership, (3) company LinkedIn page post.

Primary job: educate business owners with practical, original guidance. Do NOT force-promote Techlyser. Brand trust grows when the reader feels understood. Third-party platforms are research context — not the promotional subject.

Inputs:
- Primary keyword: {{keyword}}
- Target audience: {{audience}}
- Search intent: {{searchIntent}}
- Category / pillar: {{category}}
- Tone: {{tone}}
- Target word count: ~{{targetWords}} words (articleMarkdown body only; prefer 1200–2000 when the topic supports it)

Website article (Asset 3) requirements:
1. seoTitle — ≤60 chars when possible; includes primary keyword; no clickbait; business-problem framing
2. metaDescription — 140–160 chars; keyword + educational value; no hard sell
3. slug — lowercase kebab-case
4. outline — markdown H2/H3 bullets only
5. excerpt — 1–2 sentences for blog cards
6. articleMarkdown — original long-form markdown. Use ## / ### (no H1 in body). Include: real business problem, why it matters, practical recommendations, technology fit only when appropriate, common mistakes, useful conclusion. Prefer 0 Techlyser mentions in body; at most 1 natural mention if it truly helps. Never shoehorn services. Never copy/paraphrase a news release. Never giant code fences wrapping the article.
7. faqs — 4–6 { question, answer } when useful; answers should teach, not pitch Techlyser
8. howTo — { name, description, steps } when how-to intent fits; else null
9. comparisonTable — only when it improves understanding; else null
10. cta — { headline, body, buttonText, href }. Optional soft invite only — contextual, never pushy. Many posts can use a light "explore / discuss" CTA. href MUST be one of: ${formatInternalUrlsForPrompt()}
11. featuredImagePrompt — professional hero image concept; no text in image; business/web context
12. tags — 3–6 lowercase tags
13. linkedinPersonalPost — Asset 1: founder/expert 1st-person voice (~150–250 words). Strong hook, insight, business impact, light technical note, discussion prompt. Prefer 0 Techlyser mentions. No corporate tone, no emoji spam, no hard sell. Different from company post.
14. linkedinPagePost — Asset 2: company voice (~120–200 words). Useful takeaway + engagement question. Soft CTA only if natural; prefer insight over selling. Do NOT copy the personal post.

Also identify implicitly: primaryKeyword={{keyword}}, searchIntent, targetAudience, contentAngle that connects problem → practical solution (not a sales pitch).

If the keyword looks like third-party news or a tool/repo name, REFRAME into what businesses should do / architecture / UX / SEO / ecommerce / operations implications — never promote that vendor, and never force a Techlyser service pitch.

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
