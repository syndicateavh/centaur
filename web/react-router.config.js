import { PRERENDER_PATHS } from './src/seo/seoRoutes.js';
import { blogCategoryPath, blogPostPath, getPublishedBlogPostsSorted } from './src/content/blog/blogRoutes.js';
import { loadBlogPosts } from './tools/blog-storage.js';

const publishedBlogPosts = getPublishedBlogPostsSorted(loadBlogPosts());
const blogPrerenderPaths = new Set([
  ...publishedBlogPosts.map((post) => blogPostPath(post.slug).slice(0, -1)),
  ...[...new Set(publishedBlogPosts.map((post) => post.category))].map((category) => blogCategoryPath(category).slice(0, -1)),
  // Keep the editorially gated archive reachable as a static, noindex page
  // while its first article is being reviewed.
  blogCategoryPath('industry-updates').slice(0, -1),
]);

/** @type {import('@react-router/dev/config').Config} */
export default {
  appDirectory: 'src',
  ssr: false,
  prerender: [...PRERENDER_PATHS, ...blogPrerenderPaths],
};
