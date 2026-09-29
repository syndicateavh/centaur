import { BLOG_IMAGES_PUBLIC_PATH } from './storageConfig.js';

export const BLOG_IMAGE_EXTENSIONS = Object.freeze(['avif', 'gif', 'jpeg', 'jpg', 'png', 'webp']);
export const BLOG_IMAGE_MIME_TYPES = Object.freeze({
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
});
export const BLOG_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const BLOG_IMAGE_MAX_DIMENSION = 8000;
export const BLOG_IMAGE_PATH_PATTERN = /^\/images\/blog\/[a-z0-9][a-z0-9-]*\.(avif|gif|jpeg|jpg|png|webp)$/;
export const BLOG_IMAGE_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*\.(avif|gif|jpeg|jpg|png|webp)$/;

export function getBlogImageExtension(value) {
  const name = String(value || '').split(/[\\/]/).pop().toLowerCase();
  const extension = name.match(/\.([a-z0-9]+)$/)?.[1];
  return BLOG_IMAGE_EXTENSIONS.includes(extension) ? extension : null;
}

export function getBlogImageMimeType(value) {
  const extension = getBlogImageExtension(value);
  return extension ? BLOG_IMAGE_MIME_TYPES[extension] : null;
}

export function isBlogImageName(value) {
  return typeof value === 'string' && BLOG_IMAGE_NAME_PATTERN.test(value);
}

export function isBlogImagePath(value) {
  return typeof value === 'string' && BLOG_IMAGE_PATH_PATTERN.test(value);
}

export function normalizeBlogImageName(value) {
  const name = String(value || '').split(/[\\/]/).pop().toLowerCase();
  if (!isBlogImageName(name)) {
    throw new Error('Image names must use lowercase letters, numbers, hyphens, and a supported image extension');
  }
  return name;
}

export function createBlogImageName(value) {
  const extension = getBlogImageExtension(value);
  const base = String(value || '')
    .split(/[\\/]/)
    .pop()
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'blog-image';
  if (!extension) return null;
  return `${base}.${extension}`;
}

export function blogImagePublicPath(name) {
  return `${BLOG_IMAGES_PUBLIC_PATH}${normalizeBlogImageName(name)}`;
}
