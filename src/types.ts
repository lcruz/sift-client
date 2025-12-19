/**
 * Sift Client Configuration
 */
export interface SiftClientConfig {
  /** Blog identifier (subdomain or custom domain) */
  blogId: string;
  /** API base URL (defaults to https://api.sift.app) */
  apiUrl?: string;
  /** Request timeout in milliseconds (defaults to 10000) */
  timeout?: number;
}

/**
 * Tag information
 */
export interface SiftTag {
  name: string;
  slug: string;
  color: string | null;
  articleCount: number;
}

/**
 * Article summary (for listings)
 */
export interface SiftArticleSummary {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: string | null;
  tags: SiftTag[];
}

/**
 * Full article with content
 */
export interface SiftArticle extends SiftArticleSummary {
  contentHtml: string;
  metaTitle: string;
  metaDescription: string | null;
}

/**
 * Blog metadata
 */
export interface SiftBlogMeta {
  blogTitle: string;
  blogDescription: string | null;
  blogLogoUrl: string | null;
  themeId: string | null;
  themeConfig: Record<string, unknown> | null;
  metaDescription: string | null;
  socialImageUrl: string | null;
  twitterHandle: string | null;
  showAuthor: boolean;
  showDate: boolean;
  showTags: boolean;
}

/**
 * Paginated response for articles
 */
export interface SiftArticlesResponse {
  articles: SiftArticleSummary[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Options for fetching articles
 */
export interface GetArticlesOptions {
  /** Page number (starts at 1) */
  page?: number;
  /** Items per page (max 50) */
  perPage?: number;
  /** Filter by tag slug */
  tag?: string;
}

/**
 * API error response
 */
export interface SiftApiError {
  detail: string;
  status: number;
}

/**
 * Custom error class for Sift API errors
 */
export class SiftError extends Error {
  status: number;
  detail: string;

  constructor(message: string, status: number, detail: string) {
    super(message);
    this.name = 'SiftError';
    this.status = status;
    this.detail = detail;
  }
}
