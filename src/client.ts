import type {
  SiftClientConfig,
  SiftArticle,
  SiftArticleSummary,
  SiftArticlesResponse,
  SiftBlogMeta,
  SiftTag,
  GetArticlesOptions,
} from './types.js';
import { SiftError } from './types.js';

const DEFAULT_API_URL = 'https://api.sift.app';
const DEFAULT_TIMEOUT = 10000;

/**
 * Sift API Client
 *
 * Simple client for fetching content from Sift CMS.
 *
 * @example
 * ```typescript
 * import { createSiftClient } from 'sift-client';
 *
 * const sift = createSiftClient({ blogId: 'my-blog' });
 * const { articles } = await sift.getArticles();
 * ```
 */
export class SiftClient {
  private readonly blogId: string;
  private readonly apiUrl: string;
  private readonly timeout: number;

  constructor(config: SiftClientConfig) {
    if (!config.blogId) {
      throw new Error('blogId is required');
    }

    this.blogId = config.blogId;
    this.apiUrl = (config.apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Internal fetch wrapper with error handling
   */
  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.apiUrl}/api/v1/blog/${this.blogId}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new SiftError(
          `Sift API error: ${response.status}`,
          response.status,
          errorData.detail || 'Unknown error'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SiftError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new SiftError('Request timeout', 408, 'The request timed out');
      }
      throw new SiftError(
        'Network error',
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get blog metadata (title, description, theme, etc.)
   *
   * @example
   * ```typescript
   * const meta = await sift.getMeta();
   * console.log(meta.blogTitle);
   * ```
   */
  async getMeta(): Promise<SiftBlogMeta> {
    const data = await this.fetch<{
      blog_title: string;
      blog_description: string | null;
      blog_logo_url: string | null;
      theme_id: string | null;
      theme_config: Record<string, unknown> | null;
      meta_description: string | null;
      social_image_url: string | null;
      twitter_handle: string | null;
      show_author: boolean;
      show_date: boolean;
      show_tags: boolean;
    }>('/meta');

    return {
      blogTitle: data.blog_title,
      blogDescription: data.blog_description,
      blogLogoUrl: data.blog_logo_url,
      themeId: data.theme_id,
      themeConfig: data.theme_config,
      metaDescription: data.meta_description,
      socialImageUrl: data.social_image_url,
      twitterHandle: data.twitter_handle,
      showAuthor: data.show_author,
      showDate: data.show_date,
      showTags: data.show_tags,
    };
  }

  /**
   * Get paginated list of published articles
   *
   * @example
   * ```typescript
   * // Get first page
   * const { articles, totalPages } = await sift.getArticles();
   *
   * // Get specific page with tag filter
   * const { articles } = await sift.getArticles({
   *   page: 2,
   *   perPage: 20,
   *   tag: 'technology'
   * });
   * ```
   */
  async getArticles(options: GetArticlesOptions = {}): Promise<SiftArticlesResponse> {
    const params = new URLSearchParams();

    if (options.page) params.set('page', String(options.page));
    if (options.perPage) params.set('per_page', String(options.perPage));
    if (options.tag) params.set('tag', options.tag);

    const query = params.toString();
    const endpoint = `/articles${query ? `?${query}` : ''}`;

    const data = await this.fetch<{
      articles: Array<{
        slug: string;
        title: string;
        excerpt: string | null;
        featured_image_url: string | null;
        published_at: string | null;
        tags: Array<{
          name: string;
          slug: string;
          color: string | null;
          article_count: number;
        }>;
      }>;
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
    }>(endpoint);

    return {
      articles: data.articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        featuredImageUrl: a.featured_image_url,
        publishedAt: a.published_at,
        tags: a.tags.map((t) => ({
          name: t.name,
          slug: t.slug,
          color: t.color,
          articleCount: t.article_count,
        })),
      })),
      total: data.total,
      page: data.page,
      perPage: data.per_page,
      totalPages: data.total_pages,
    };
  }

  /**
   * Get a single article by slug
   *
   * @example
   * ```typescript
   * const article = await sift.getArticle('my-article-slug');
   * console.log(article.title);
   * console.log(article.contentHtml);
   * ```
   */
  async getArticle(slug: string): Promise<SiftArticle> {
    const data = await this.fetch<{
      slug: string;
      title: string;
      content_html: string;
      excerpt: string | null;
      featured_image_url: string | null;
      published_at: string | null;
      tags: Array<{
        name: string;
        slug: string;
        color: string | null;
        article_count: number;
      }>;
      meta_title: string;
      meta_description: string | null;
    }>(`/articles/${encodeURIComponent(slug)}`);

    return {
      slug: data.slug,
      title: data.title,
      contentHtml: data.content_html,
      excerpt: data.excerpt,
      featuredImageUrl: data.featured_image_url,
      publishedAt: data.published_at,
      tags: data.tags.map((t) => ({
        name: t.name,
        slug: t.slug,
        color: t.color,
        articleCount: t.article_count,
      })),
      metaTitle: data.meta_title,
      metaDescription: data.meta_description,
    };
  }

  /**
   * Get all tags with article counts
   *
   * @example
   * ```typescript
   * const tags = await sift.getTags();
   * tags.forEach(tag => {
   *   console.log(`${tag.name}: ${tag.articleCount} articles`);
   * });
   * ```
   */
  async getTags(): Promise<SiftTag[]> {
    const data = await this.fetch<
      Array<{
        name: string;
        slug: string;
        color: string | null;
        article_count: number;
      }>
    >('/tags');

    return data.map((t) => ({
      name: t.name,
      slug: t.slug,
      color: t.color,
      articleCount: t.article_count,
    }));
  }

  /**
   * Get RSS feed URL for this blog
   */
  getRssFeedUrl(): string {
    return `${this.apiUrl}/api/v1/blog/${this.blogId}/rss.xml`;
  }

  /**
   * Get sitemap URL for this blog
   */
  getSitemapUrl(): string {
    return `${this.apiUrl}/api/v1/blog/${this.blogId}/sitemap.xml`;
  }
}

/**
 * Create a new Sift client instance
 *
 * @example
 * ```typescript
 * import { createSiftClient } from 'sift-client';
 *
 * const sift = createSiftClient({
 *   blogId: 'my-blog',
 *   apiUrl: 'https://api.sift.app', // optional
 * });
 *
 * const { articles } = await sift.getArticles();
 * const article = await sift.getArticle('my-slug');
 * ```
 */
export function createSiftClient(config: SiftClientConfig): SiftClient {
  return new SiftClient(config);
}
