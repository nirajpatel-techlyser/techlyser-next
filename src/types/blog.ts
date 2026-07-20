export interface BlogPost {
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

  content: string;

  readingTime?: string;
}