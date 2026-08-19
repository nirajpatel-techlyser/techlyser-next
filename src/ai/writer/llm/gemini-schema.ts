/** Phase 1 — article body only (single large field). */
export const GEMINI_WRITER_BODY_SCHEMA = {
  type: "object",
  properties: {
    articleMarkdown: { type: "string" },
  },
  required: ["articleMarkdown"],
} as const;

/** Phase 2 — SEO + metadata using the article body as context. */
export const GEMINI_WRITER_META_SCHEMA = {
  type: "object",
  properties: {
    seoTitle: { type: "string" },
    metaDescription: { type: "string" },
    slug: { type: "string" },
    outline: { type: "string" },
    excerpt: { type: "string" },
    faqs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
    },
    featuredImagePrompt: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
  },
  required: [
    "seoTitle",
    "metaDescription",
    "slug",
    "outline",
    "excerpt",
    "faqs",
    "featuredImagePrompt",
    "tags",
  ],
} as const;

/** Phase 3 — supplementary fields. */
export const GEMINI_WRITER_EXTRAS_SCHEMA = {
  type: "object",
  properties: {
    howTo: {
      type: "object",
      nullable: true,
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              text: { type: "string" },
            },
            required: ["name", "text"],
          },
        },
      },
    },
    comparisonTable: {
      type: "object",
      nullable: true,
      properties: {
        headers: { type: "array", items: { type: "string" } },
        rows: {
          type: "array",
          items: { type: "array", items: { type: "string" } },
        },
      },
    },
    cta: {
      type: "object",
      properties: {
        headline: { type: "string" },
        body: { type: "string" },
        buttonText: { type: "string" },
        href: { type: "string" },
      },
      required: ["headline", "body", "buttonText", "href"],
    },
    linkedinPersonalPost: { type: "string" },
    linkedinPagePost: { type: "string" },
  },
  required: ["cta", "linkedinPersonalPost", "linkedinPagePost"],
} as const;

/** Full schema for OpenAI/Groq single-call providers. */
export const GEMINI_WRITER_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    ...GEMINI_WRITER_BODY_SCHEMA.properties,
    ...GEMINI_WRITER_META_SCHEMA.properties,
    ...GEMINI_WRITER_EXTRAS_SCHEMA.properties,
  },
  required: [
    ...GEMINI_WRITER_BODY_SCHEMA.required,
    ...GEMINI_WRITER_META_SCHEMA.required,
    "cta",
    "linkedinPersonalPost",
    "linkedinPagePost",
  ],
} as const;

export type GeminiWriterBodyPayload = {
  articleMarkdown: string;
};

export type GeminiWriterMetaPayload = {
  seoTitle: string;
  metaDescription: string;
  slug: string;
  outline: string;
  excerpt: string;
  faqs: { question: string; answer: string }[];
  featuredImagePrompt: string;
  tags: string[];
};

export type GeminiWriterExtrasPayload = {
  howTo?: {
    name: string;
    description: string;
    steps: { name: string; text: string }[];
  } | null;
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  } | null;
  cta: {
    headline: string;
    body: string;
    buttonText: string;
    href: string;
  };
  linkedinPersonalPost: string;
  linkedinPagePost: string;
};

export type GeminiWriterCorePayload = GeminiWriterBodyPayload &
  GeminiWriterMetaPayload;
