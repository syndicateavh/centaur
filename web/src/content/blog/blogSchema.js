import { BLOG_IMAGE_MAX_DIMENSION } from './imageConfig.js';

export const BLOG_SCHEMA_VERSION = 1;

export const BLOG_STATUSES = Object.freeze({
  DRAFT: 'draft',
  REVIEW: 'review',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

export const BLOG_CATEGORIES = Object.freeze([
  'career-guides',
  'investment-banking',
  'retail-banking',
  'finance-operations',
  'lucknow-careers',
  'interview-preparation',
  'industry-updates',
]);

export const BLOG_BLOCK_TYPES = Object.freeze({
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  LIST: 'list',
  QUOTE: 'quote',
  LINK: 'link',
  IMAGE: 'image',
  FAQ: 'faq',
  CALLOUT: 'callout',
});

export const BLOG_FIELD_DEFINITIONS = Object.freeze([
  Object.freeze({ name: 'schemaVersion', type: 'number', required: true, editable: false }),
  Object.freeze({ name: 'id', type: 'slug', required: true, editable: false }),
  Object.freeze({ name: 'slug', type: 'slug', required: true, editable: true }),
  Object.freeze({ name: 'status', type: 'status', required: true, editable: true }),
  Object.freeze({ name: 'title', type: 'text', required: true, editable: true }),
  Object.freeze({ name: 'excerpt', type: 'textarea', required: true, editable: true }),
  Object.freeze({ name: 'category', type: 'category', required: true, editable: true }),
  Object.freeze({ name: 'author', type: 'author', required: true, editable: true }),
  Object.freeze({ name: 'body', type: 'blocks', required: true, editable: true }),
  Object.freeze({ name: 'coverImage', type: 'image', required: false, editable: true }),
  Object.freeze({ name: 'publishedAt', type: 'date', required: false, editable: true }),
  Object.freeze({ name: 'updatedAt', type: 'date', required: true, editable: true }),
  Object.freeze({ name: 'scheduledAt', type: 'date', required: false, editable: true }),
  Object.freeze({ name: 'seo', type: 'seo', required: true, editable: true }),
  Object.freeze({ name: 'tags', type: 'text-list', required: false, editable: true }),
  Object.freeze({ name: 'relatedRouteIds', type: 'route-list', required: false, editable: true }),
  Object.freeze({ name: 'redirects', type: 'path-list', required: false, editable: true }),
  Object.freeze({ name: 'evidenceNotes', type: 'text-list', required: false, editable: true }),
]);

const VALID_STATUSES = new Set(Object.values(BLOG_STATUSES));
const VALID_BLOCK_TYPES = new Set(Object.values(BLOG_BLOCK_TYPES));
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set(['404', 'admin', 'index', 'rss', 'sitemap']);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

function validateStringList(value, fieldName, errors) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((item) => !isNonEmptyString(item))) {
    errors.push(`${fieldName} must be an array of non-empty strings`);
  }
}

function validateImage(image, fieldName, errors) {
  if (image === null || image === undefined) return;
  if (!isPlainObject(image)) {
    errors.push(`${fieldName} must be an object or null`);
    return;
  }
  for (const field of ['src', 'alt']) {
    if (!isNonEmptyString(image[field])) errors.push(`${fieldName}.${field} is required`);
  }
  for (const field of ['width', 'height']) {
    if (!Number.isInteger(image[field]) || image[field] <= 0) errors.push(`${fieldName}.${field} must be a positive integer`);
    if (Number.isInteger(image[field]) && image[field] > BLOG_IMAGE_MAX_DIMENSION) errors.push(`${fieldName}.${field} must not exceed ${BLOG_IMAGE_MAX_DIMENSION} pixels`);
  }
}

function validateAuthor(author, errors) {
  if (!isPlainObject(author)) {
    errors.push('author must be an object');
    return;
  }
  if (author.type !== undefined && !['Person', 'Organization'].includes(author.type)) {
    errors.push('author.type must be Person or Organization when provided');
  }
  if (!isNonEmptyString(author.id) || !SLUG_PATTERN.test(author.id)) errors.push('author.id must be a lowercase slug');
  if (!isNonEmptyString(author.name)) errors.push('author.name is required');
  if (!isNonEmptyString(author.role)) errors.push('author.role is required');
  if (author.profilePath !== undefined && (!isNonEmptyString(author.profilePath) || !author.profilePath.startsWith('/'))) {
    errors.push('author.profilePath must be a site-relative path');
  }
}

function validateBlock(block, index, errors, validRouteIds = []) {
  const prefix = `body[${index}]`;
  if (!isPlainObject(block)) {
    errors.push(`${prefix} must be an object`);
    return;
  }
  if (!VALID_BLOCK_TYPES.has(block.type)) {
    errors.push(`${prefix}.type is not a supported blog block`);
    return;
  }

  if (block.type === BLOG_BLOCK_TYPES.PARAGRAPH) {
    if (!isNonEmptyString(block.text)) errors.push(`${prefix}.text is required`);
  }

  if (block.type === BLOG_BLOCK_TYPES.HEADING) {
    if (![2, 3].includes(block.level)) errors.push(`${prefix}.level must be 2 or 3`);
    if (!isNonEmptyString(block.text)) errors.push(`${prefix}.text is required`);
  }

  if (block.type === BLOG_BLOCK_TYPES.LIST) {
    if (!Array.isArray(block.items) || block.items.length === 0 || block.items.some((item) => !isNonEmptyString(item))) {
      errors.push(`${prefix}.items must contain at least one non-empty string`);
    }
    if (block.ordered !== undefined && typeof block.ordered !== 'boolean') errors.push(`${prefix}.ordered must be boolean`);
  }

  if (block.type === BLOG_BLOCK_TYPES.QUOTE) {
    if (!isNonEmptyString(block.text)) errors.push(`${prefix}.text is required`);
    if (block.cite !== undefined && !isNonEmptyString(block.cite)) errors.push(`${prefix}.cite must be non-empty when provided`);
  }

  if (block.type === BLOG_BLOCK_TYPES.LINK) {
    if (!isNonEmptyString(block.label)) errors.push(`${prefix}.label is required`);
    if (!isNonEmptyString(block.href)) errors.push(`${prefix}.href is required`);
    if (block.routeId !== undefined && !isNonEmptyString(block.routeId)) errors.push(`${prefix}.routeId must be non-empty when provided`);
    if (block.routeId && validRouteIds.length > 0 && !validRouteIds.includes(block.routeId)) errors.push(`${prefix}.routeId references an unknown route: ${block.routeId}`);
  }

  if (block.type === BLOG_BLOCK_TYPES.IMAGE) {
    if (block.image === undefined || block.image === null) errors.push(`${prefix}.image is required`);
    validateImage(block.image, `${prefix}.image`, errors);
  }

  if (block.type === BLOG_BLOCK_TYPES.FAQ) {
    if (!isNonEmptyString(block.question)) errors.push(`${prefix}.question is required`);
    if (!isNonEmptyString(block.answer)) errors.push(`${prefix}.answer is required`);
  }

  if (block.type === BLOG_BLOCK_TYPES.CALLOUT) {
    if (!isNonEmptyString(block.title)) errors.push(`${prefix}.title is required`);
    if (!isNonEmptyString(block.text)) errors.push(`${prefix}.text is required`);
  }
}

function validateSeo(seo, slug, errors) {
  if (!isPlainObject(seo)) {
    errors.push('seo must be an object');
    return;
  }
  if (!isNonEmptyString(seo.title) || seo.title.length > 160) errors.push('seo.title is required and must be at most 160 characters');
  if (!isNonEmptyString(seo.description) || seo.description.length > 320) errors.push('seo.description is required and must be at most 320 characters');
  if (seo.noindex !== undefined && typeof seo.noindex !== 'boolean') errors.push('seo.noindex must be boolean');
  if (seo.canonicalPath !== undefined) {
    const expectedPath = `/blog/${slug}/`;
    if (!isNonEmptyString(seo.canonicalPath) || !seo.canonicalPath.startsWith('/')) errors.push('seo.canonicalPath must be a site-relative path');
    if (seo.canonicalPath !== expectedPath) errors.push(`seo.canonicalPath must be ${expectedPath} for a new blog post`);
  }
  if (seo.focusKeyword !== undefined && (!isNonEmptyString(seo.focusKeyword) || seo.focusKeyword.length > 120)) {
    errors.push('seo.focusKeyword must be a non-empty string of at most 120 characters when provided');
  }
  validateStringList(seo.secondaryKeywords, 'seo.secondaryKeywords', errors);
}

export function validateBlogPost(post, { mode = 'publish', validRouteIds = [] } = {}) {
  const errors = [];
  if (!isPlainObject(post)) return ['post must be an object'];
  if (post.schemaVersion !== BLOG_SCHEMA_VERSION) errors.push(`schemaVersion must be ${BLOG_SCHEMA_VERSION}`);

  for (const field of ['id', 'slug']) {
    if (!isNonEmptyString(post[field]) || !SLUG_PATTERN.test(post[field])) errors.push(`${field} must be a lowercase hyphenated slug`);
    if (post[field]?.length > 96) errors.push(`${field} must be at most 96 characters`);
  }
  if (RESERVED_SLUGS.has(post.slug)) errors.push(`slug is reserved: ${post.slug}`);
  if (!VALID_STATUSES.has(post.status)) errors.push(`status must be one of: ${[...VALID_STATUSES].join(', ')}`);
  if (!isNonEmptyString(post.title) || post.title.length > 160) errors.push('title is required and must be at most 160 characters');
  if (!isNonEmptyString(post.excerpt) || post.excerpt.length > 500) errors.push('excerpt is required and must be at most 500 characters');
  if (!BLOG_CATEGORIES.includes(post.category)) errors.push(`category must be one of: ${BLOG_CATEGORIES.join(', ')}`);
  validateAuthor(post.author, errors);
  if (!Array.isArray(post.body)) errors.push('body must be an array of structured blocks');
  else post.body.forEach((block, index) => validateBlock(block, index, errors, validRouteIds));
  validateImage(post.coverImage, 'coverImage', errors);

  if (!isValidDate(post.updatedAt)) errors.push('updatedAt must be a valid YYYY-MM-DD date');
  if (post.publishedAt !== null && post.publishedAt !== undefined && !isValidDate(post.publishedAt)) errors.push('publishedAt must be a valid YYYY-MM-DD date or null');
  if (post.scheduledAt !== null && post.scheduledAt !== undefined && !isValidDate(post.scheduledAt)) errors.push('scheduledAt must be a valid YYYY-MM-DD date or null');
  validateSeo(post.seo, post.slug, errors);
  validateStringList(post.tags, 'tags', errors);
  validateStringList(post.relatedRouteIds, 'relatedRouteIds', errors);
  validateStringList(post.redirects, 'redirects', errors);
  validateStringList(post.evidenceNotes, 'evidenceNotes', errors);

  if (validRouteIds.length > 0 && Array.isArray(post.relatedRouteIds)) {
    for (const routeId of post.relatedRouteIds) {
      if (!validRouteIds.includes(routeId)) errors.push(`relatedRouteIds contains an unknown route: ${routeId}`);
    }
  }

  if (mode === 'publish') {
    if (post.status !== BLOG_STATUSES.PUBLISHED) errors.push('published validation requires status: published');
    if (!post.publishedAt) errors.push('publishedAt is required for a published post');
    if (!Array.isArray(post.body) || post.body.length === 0) errors.push('published posts require at least one body block');
    if (post.seo?.noindex === true) errors.push('published posts must not be noindex');
  }

  if (post.status === BLOG_STATUSES.SCHEDULED && !post.scheduledAt) errors.push('scheduledAt is required for a scheduled post');

  return errors;
}

export function validateBlogCollection(posts, options = {}) {
  if (!Array.isArray(posts)) return ['blog collection must be an array'];
  const errors = [];
  const ids = new Set();
  const slugs = new Set();

  posts.forEach((post, index) => {
    const postMode = options.mode === 'collection'
      ? (post?.status === BLOG_STATUSES.PUBLISHED ? 'publish' : 'draft')
      : options.mode;
    const postErrors = validateBlogPost(post, { ...options, mode: postMode });
    for (const error of postErrors) errors.push(`posts[${index}] (${post?.slug || 'unknown'}): ${error}`);
    if (post?.id) {
      if (ids.has(post.id)) errors.push(`duplicate blog id: ${post.id}`);
      ids.add(post.id);
    }
    if (post?.slug) {
      if (slugs.has(post.slug)) errors.push(`duplicate blog slug: ${post.slug}`);
      slugs.add(post.slug);
    }
  });

  return errors;
}

export function assertValidBlogPost(post, options = {}) {
  const errors = validateBlogPost(post, options);
  if (errors.length > 0) throw new Error(`Invalid blog post:\n- ${errors.join('\n- ')}`);
  return post;
}
