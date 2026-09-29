import { getBlogSitemapEntries } from '../src/content/blog/blogRoutes.js';
import { INDEXABLE_ROUTES, SITE_ORIGIN, canonicalUrl } from '../src/seo/seoRoutes.js';
import { loadBlogPosts } from './blog-storage.js';

export function getExpectedSitemapUrls() {
  return [
    ...INDEXABLE_ROUTES.map(canonicalUrl),
    ...getBlogSitemapEntries(loadBlogPosts()).map((entry) => `${SITE_ORIGIN}${entry.path}`),
  ];
}
