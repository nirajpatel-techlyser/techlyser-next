export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;

  date: string;
  author: string;

  categories: string[];
  tags: string[];

  coverImage?: string;
  featured?: boolean;
  commentsEnabled?: boolean;

  content: string;

  readingTime?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  views?: number;
  status?: "DRAFT" | "PUBLISHED";
}
