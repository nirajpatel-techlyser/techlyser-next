function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** First substantive paragraph suitable as an AI-extractable answer. */
export function extractLeadAnswer(title: string, content: string): string {
  const plain = stripHtml(content);
  const sentences = plain.split(/(?<=[.!?])\s+/).filter((s) => s.length > 40);
  const lead = sentences.slice(0, 2).join(" ").trim();
  if (lead.length >= 80) return lead.slice(0, 420);
  return `${title}. ${plain.slice(0, 280)}`.trim();
}

export function extractSpeakablePassages(
  content: string,
  faqs: { question: string; answer: string }[] = [],
): string[] {
  const plain = stripHtml(content);
  const chunks = plain
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length >= 60 && s.length <= 220)
    .slice(0, 4);

  const fromFaqs = faqs.slice(0, 3).map((f) => `${f.question} ${f.answer}`.slice(0, 220));
  return Array.from(new Set([...chunks, ...fromFaqs])).slice(0, 6);
}
