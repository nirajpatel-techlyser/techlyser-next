export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;

  date: string;
  updatedAt?: string;
  author: string;

  categories: string[];
  tags: string[];

  coverImage?: string;
  featured?: boolean;
  commentsEnabled?: boolean;

  content: string;

  readingTime?: string;
  readingTimeMinutes?: number;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  views?: number;
  status?: "DRAFT" | "PUBLISHED";
}
