import { formatInternalUrlsForPrompt } from "@/ai/brand/positioning";

export const WRITER_ARTICLE_FULL_TEMPLATE = `Write THREE distinct Techlyser content assets as one JSON object: (1) website SEO article, (2) personal LinkedIn thought leadership, (3) Techlyser company page post.

Every asset must answer: how does this help Techlyser grow (authority, search, leads)? Third-party platforms are research context — not the promotional subject.

Inputs:
- Primary keyword: {{keyword}}
- Target audience: {{audience}}
- Search intent: {{searchIntent}}
- Category / pillar: {{category}}
- Tone: {{tone}}
- Target word count: ~{{targetWords}} words (articleMarkdown body only; prefer 1200–2000 when the topic supports it)

Website article (Asset 3) requirements:
1. seoTitle — ≤60 chars when possible; includes primary keyword; no clickbait; Techlyser/business-problem framing
2. metaDescription — 140–160 chars; keyword + soft value; no hard sell
3. slug — lowercase kebab-case
4. outline — markdown H2/H3 bullets only
5. excerpt — 1–2 sentences for blog cards
6. articleMarkdown — original long-form markdown. Use ## / ### (no H1 in body). Include intro, practical examples, actionable recommendations, business implications, technical insight where relevant, conclusion. Soft Techlyser CTA in prose (1–3 mentions max). Never copy/paraphrase a news release. Never giant code fences wrapping the article.
7. faqs — 4–6 { question, answer } when useful; else still provide solid FAQs for AI/search discoverability
8. howTo — { name, description, steps } when how-to intent fits; else null
9. comparisonTable — only when it improves understanding; else null
10. cta — { headline, body, buttonText, href }. Soft, topic-matched. href MUST be one of: ${formatInternalUrlsForPrompt()}
11. featuredImagePrompt — professional hero image concept; no text in image; business/web context
12. tags — 3–6 lowercase tags
13. linkedinPersonalPost — Asset 1: founder/expert 1st-person voice (~150–250 words). Strong hook, insight, business impact, light technical note, discussion prompt. 0–1 Techlyser mention. No corporate tone, no emoji spam, no hard sell. Different from company post.
14. linkedinPagePost — Asset 2: Techlyser company voice (~120–200 words). Business impact + expertise + useful takeaway + engagement question or soft CTA. 1–2 Techlyser mentions. Do NOT copy the personal post.

Also identify implicitly: primaryKeyword={{keyword}}, searchIntent, targetAudience, contentAngle that connects problem → Techlyser expertise.

If the keyword looks like third-party news or a tool/repo name, REFRAME into what businesses should do / architecture / UX / SEO / ecommerce / AI-ready web implications — never promote that vendor.

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
