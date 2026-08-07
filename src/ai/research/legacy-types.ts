export type ResearchBriefInput = {
  keywordId?: string;
  topicId?: string;
  locale?: string;
  competitorIds?: string[];
};

export type ResearchBriefOutput = {
  researchId: string;
  summary: string;
  entities: string[];
  sourceUrls: string[];
  gaps: string[];
};
