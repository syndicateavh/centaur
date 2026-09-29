import { BLOG_CATEGORIES, BLOG_STATUSES } from './blogSchema.js';

export const BLOG_INDEX_PATH = '/blog/';
export const BLOG_CATEGORY_PREFIX = '/blog/category/';

export function blogPostPath(slug) {
  return `/blog/${slug}/`;
}

export function blogCategoryPath(category) {
  return `${BLOG_CATEGORY_PREFIX}${category}/`;
}

export function blogCategoryLabel(category) {
  return category.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getPublishedBlogPostsSorted(posts = []) {
  return posts
    .filter((post) => post?.status === BLOG_STATUSES.PUBLISHED)
    .slice()
    .sort((left, right) => {
      const dateDifference = String(right.publishedAt || '').localeCompare(String(left.publishedAt || ''));
      return dateDifference || String(left.slug || '').localeCompare(String(right.slug || ''));
    });
}

export function getBlogSitemapEntries(posts = []) {
  const publishedPosts = getPublishedBlogPostsSorted(posts);
  const categories = [...new Set(publishedPosts.map((post) => post.category))]
    .filter((category) => BLOG_CATEGORIES.includes(category))
    .sort()
    .map((category) => ({
      kind: 'category',
      path: blogCategoryPath(category),
      lastModified: publishedPosts
        .filter((post) => post.category === category)
        .map((post) => post.updatedAt || post.publishedAt)
        .sort()
        .at(-1),
    }));

  return [
    ...categories,
    ...publishedPosts.map((post) => ({
      kind: 'post',
      path: blogPostPath(post.slug),
      lastModified: post.updatedAt || post.publishedAt,
    })),
  ];
}
