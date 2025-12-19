# sift-client

JavaScript/TypeScript client for [Sift CMS](https://sift.app) API.

## Installation

```bash
npm install sift-client
```

## Quick Start

```typescript
import { createSiftClient } from 'sift-client';

const sift = createSiftClient({
  blogId: 'my-blog', // Your blog subdomain or custom domain
});

// Get published articles
const { articles, totalPages } = await sift.getArticles();

// Get a single article
const article = await sift.getArticle('my-article-slug');
```

## Usage with Astro

```astro
---
// src/pages/blog/index.astro
import { createSiftClient } from 'sift-client';
import Layout from '../../layouts/Layout.astro';

const sift = createSiftClient({ blogId: 'my-blog' });
const { articles } = await sift.getArticles({ perPage: 10 });
---

<Layout title="Blog">
  <h1>Blog</h1>
  <ul>
    {articles.map(article => (
      <li>
        <a href={`/blog/${article.slug}`}>
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
        </a>
      </li>
    ))}
  </ul>
</Layout>
```

```astro
---
// src/pages/blog/[slug].astro
import { createSiftClient } from 'sift-client';
import Layout from '../../layouts/Layout.astro';

const sift = createSiftClient({ blogId: 'my-blog' });

export async function getStaticPaths() {
  const { articles } = await sift.getArticles({ perPage: 100 });
  return articles.map(article => ({
    params: { slug: article.slug },
  }));
}

const { slug } = Astro.params;
const article = await sift.getArticle(slug);
---

<Layout title={article.metaTitle}>
  <article>
    <h1>{article.title}</h1>
    {article.featuredImageUrl && (
      <img src={article.featuredImageUrl} alt={article.title} />
    )}
    <div set:html={article.contentHtml} />
  </article>
</Layout>
```

## API Reference

### `createSiftClient(config)`

Creates a new Sift client instance.

```typescript
const sift = createSiftClient({
  blogId: 'my-blog',           // Required: blog subdomain or custom domain
  apiUrl: 'https://api.sift.app', // Optional: API base URL
  timeout: 10000,              // Optional: request timeout in ms
});
```

### `sift.getArticles(options?)`

Get paginated list of published articles.

```typescript
const { articles, total, page, perPage, totalPages } = await sift.getArticles({
  page: 1,        // Page number (default: 1)
  perPage: 10,    // Items per page (default: 10, max: 50)
  tag: 'news',    // Filter by tag slug (optional)
});
```

### `sift.getArticle(slug)`

Get a single article by slug.

```typescript
const article = await sift.getArticle('my-article-slug');

console.log(article.title);
console.log(article.contentHtml);
console.log(article.metaTitle);
console.log(article.metaDescription);
```

### `sift.getMeta()`

Get blog metadata.

```typescript
const meta = await sift.getMeta();

console.log(meta.blogTitle);
console.log(meta.blogDescription);
console.log(meta.themeConfig);
```

### `sift.getTags()`

Get all tags with article counts.

```typescript
const tags = await sift.getTags();

tags.forEach(tag => {
  console.log(`${tag.name}: ${tag.articleCount} articles`);
});
```

### `sift.getRssFeedUrl()`

Get the RSS feed URL for the blog.

```typescript
const rssUrl = sift.getRssFeedUrl();
// https://api.sift.app/api/v1/blog/my-blog/rss.xml
```

### `sift.getSitemapUrl()`

Get the sitemap URL for the blog.

```typescript
const sitemapUrl = sift.getSitemapUrl();
// https://api.sift.app/api/v1/blog/my-blog/sitemap.xml
```

## TypeScript

All types are exported:

```typescript
import type {
  SiftClientConfig,
  SiftArticle,
  SiftArticleSummary,
  SiftArticlesResponse,
  SiftBlogMeta,
  SiftTag,
  GetArticlesOptions,
} from 'sift-client';
```

## Error Handling

```typescript
import { createSiftClient, SiftError } from 'sift-client';

const sift = createSiftClient({ blogId: 'my-blog' });

try {
  const article = await sift.getArticle('non-existent');
} catch (error) {
  if (error instanceof SiftError) {
    console.log(error.status);  // 404
    console.log(error.detail);  // "Article not found"
  }
}
```

## License

MIT
