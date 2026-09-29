import { BLOG_STATUSES } from './blogSchema.js';
import { getPublishedBlogPostsSorted } from './blogRoutes.js';

const postModules = import.meta.glob('./posts/*.json', {
  eager: true,
  import: 'default',
});

export const BLOG_POSTS = Object.freeze(Object.values(postModules));

export function getBlogPosts() {
  return BLOG_POSTS;
}

export function getPublishedBlogPosts() {
  return getPublishedBlogPostsSorted(BLOG_POSTS);
}

export function getBlogPostBySlug(slug, { publishedOnly = true } = {}) {
  return BLOG_POSTS.find((post) => post.slug === slug
    && (!publishedOnly || post.status === BLOG_STATUSES.PUBLISHED));
}

export function getBlogPostsByCategory(category) {
  return getPublishedBlogPosts().filter((post) => post.category === category);
}
