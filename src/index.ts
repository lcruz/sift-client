/**
 * Sift Client - JavaScript/TypeScript SDK for Sift CMS
 *
 * @example
 * ```typescript
 * import { createSiftClient } from 'sift-client';
 *
 * const sift = createSiftClient({ blogId: 'my-blog' });
 *
 * // Get articles
 * const { articles, totalPages } = await sift.getArticles({ page: 1 });
 *
 * // Get single article
 * const article = await sift.getArticle('my-article-slug');
 *
 * // Get blog metadata
 * const meta = await sift.getMeta();
 *
 * // Get all tags
 * const tags = await sift.getTags();
 * ```
 *
 * @packageDocumentation
 */

export { SiftClient, createSiftClient } from './client.js';

export type {
  SiftClientConfig,
  SiftArticle,
  SiftArticleSummary,
  SiftArticlesResponse,
  SiftBlogMeta,
  SiftTag,
  GetArticlesOptions,
  SiftApiError,
} from './types.js';

export { SiftError } from './types.js';
