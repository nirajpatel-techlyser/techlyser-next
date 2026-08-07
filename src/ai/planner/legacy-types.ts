export type PlanClusterInput = {
  keywordId?: string;
  topicId?: string;
  locale?: string;
  seedKeywordIds?: string[];
};

export type PlanClusterOutput = {
  clusterId: string;
  ideaIds: string[];
};
