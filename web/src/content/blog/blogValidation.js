import {
  BLOG_BLOCK_TYPES,
  BLOG_STATUSES,
  validateBlogCollection,
  validateBlogPost,
} from './blogSchema.js';
import { isBlogImagePath } from './imageConfig.js';

export const BLOG_VALIDATION_LIMITS = Object.freeze({
  MIN_PUBLISHED_WORDS: 300,
  RECOMMENDED_TITLE_MIN: 30,
  RECOMMENDED_TITLE_MAX: 65,
  RECOMMENDED_DESCRIPTION_MIN: 70,
  RECOMMENDED_DESCRIPTION_MAX: 160,
  RECOMMENDED_EXCERPT_MIN: 80,
  RECOMMENDED_EXCERPT_MAX: 180,
});

function textWords(value) {
  return typeof value === 'string' ? value.trim().split(/\s+/).filter(Boolean) : [];
}

function blockText(block) {
  if (!block) return '';
  if (block.type === BLOG_BLOCK_TYPES.LIST) return (block.items || []).join(' ');
  if (block.type === BLOG_BLOCK_TYPES.FAQ) return `${block.question || ''} ${block.answer || ''}`;
  if (block.type === BLOG_BLOCK_TYPES.CALLOUT) return `${block.title || ''} ${block.text || ''}`;
  if (block.type === BLOG_BLOCK_TYPES.LINK) return block.label || '';
  if (block.type === BLOG_BLOCK_TYPES.IMAGE) return block.image?.alt || '';
  return block.text || '';
}

export function getBlogPostContentMetrics(post) {
  const body = Array.isArray(post?.body) ? post.body : [];
  const headings = body.filter((block) => block?.type === BLOG_BLOCK_TYPES.HEADING);
  const links = body.filter((block) => block?.type === BLOG_BLOCK_TYPES.LINK);
  const images = body.filter((block) => block?.type === BLOG_BLOCK_TYPES.IMAGE);
  const paragraphs = body.filter((block) => block?.type === BLOG_BLOCK_TYPES.PARAGRAPH);
  const bodyText = body.map(blockText).join(' ');

  return Object.freeze({
    wordCount: textWords(bodyText).length,
    paragraphCount: paragraphs.length,
    headingCount: headings.length,
    h2Count: headings.filter((block) => block.level === 2).length,
    h3Count: headings.filter((block) => block.level === 3).length,
    internalLinkCount: links.filter((block) => block.routeId).length,
    imageCount: images.length + (post?.coverImage ? 1 : 0),
    faqCount: body.filter((block) => block?.type === BLOG_BLOCK_TYPES.FAQ).length,
  });
}

function addQualityIssue(errors, warnings, mode, message, { publishOnly = false } = {}) {
  if (publishOnly && mode !== 'publish') {
    warnings.push(message);
  } else if (mode === 'publish') {
    errors.push(message);
  } else {
    warnings.push(message);
  }
}

function validateImageSource(image, fieldName, { mode, availableImagePaths }, errors, warnings) {
  if (!image?.src) return;
  if (!isBlogImagePath(image.src)) {
    addQualityIssue(errors, warnings, mode, `${fieldName}.src must use a first-party path under /images/blog/`);
    return;
  }
  if (availableImagePaths && !availableImagePaths.has(image.src)) {
    addQualityIssue(errors, warnings, mode, `${fieldName}.src does not exist in public/images/blog/`);
  }
}

export function validateBlogPostContent(post, {
  mode = 'draft',
  validRouteIds = [],
  validRoutePaths = [],
  validRoutes = [],
  availableImagePaths,
} = {}) {
  const errors = [];
  const warnings = [];
  const metrics = getBlogPostContentMetrics(post);
  const isPublished = mode === 'publish' || post?.status === BLOG_STATUSES.PUBLISHED;
  const routePathSet = new Set(validRoutePaths);
  const routeIdSet = new Set(validRouteIds);
  const routesById = new Map(validRoutes.map((route) => [route.id, route]));

  if (!post || typeof post !== 'object') return { errors: ['post must be an object'], warnings, metrics };

  if (post.title && (post.title.length < BLOG_VALIDATION_LIMITS.RECOMMENDED_TITLE_MIN || post.title.length > BLOG_VALIDATION_LIMITS.RECOMMENDED_TITLE_MAX)) {
    warnings.push(`title is outside the recommended ${BLOG_VALIDATION_LIMITS.RECOMMENDED_TITLE_MIN}-${BLOG_VALIDATION_LIMITS.RECOMMENDED_TITLE_MAX} character range`);
  }
  if (post.excerpt && (post.excerpt.length < BLOG_VALIDATION_LIMITS.RECOMMENDED_EXCERPT_MIN || post.excerpt.length > BLOG_VALIDATION_LIMITS.RECOMMENDED_EXCERPT_MAX)) {
    warnings.push(`excerpt is outside the recommended ${BLOG_VALIDATION_LIMITS.RECOMMENDED_EXCERPT_MIN}-${BLOG_VALIDATION_LIMITS.RECOMMENDED_EXCERPT_MAX} character range`);
  }
  if (post.seo?.title && (post.seo.title.length < BLOG_VALIDATION_LIMITS.RECOMMENDED_TITLE_MIN || post.seo.title.length > BLOG_VALIDATION_LIMITS.RECOMMENDED_TITLE_MAX)) {
    warnings.push(`seo.title is outside the recommended ${BLOG_VALIDATION_LIMITS.RECOMMENDED_TITLE_MIN}-${BLOG_VALIDATION_LIMITS.RECOMMENDED_TITLE_MAX} character range`);
  }
  if (post.seo?.description && (post.seo.description.length < BLOG_VALIDATION_LIMITS.RECOMMENDED_DESCRIPTION_MIN || post.seo.description.length > BLOG_VALIDATION_LIMITS.RECOMMENDED_DESCRIPTION_MAX)) {
    warnings.push(`seo.description is outside the recommended ${BLOG_VALIDATION_LIMITS.RECOMMENDED_DESCRIPTION_MIN}-${BLOG_VALIDATION_LIMITS.RECOMMENDED_DESCRIPTION_MAX} character range`);
  }

  if (metrics.wordCount < BLOG_VALIDATION_LIMITS.MIN_PUBLISHED_WORDS) {
    addQualityIssue(errors, warnings, mode, `body has ${metrics.wordCount} words; published posts should contain at least ${BLOG_VALIDATION_LIMITS.MIN_PUBLISHED_WORDS} useful words`, { publishOnly: true });
  }
  if (metrics.paragraphCount === 0) addQualityIssue(errors, warnings, mode, 'body should include at least one paragraph', { publishOnly: true });
  if (metrics.h2Count === 0) addQualityIssue(errors, warnings, mode, 'body should include at least one H2 heading; the title remains the single H1', { publishOnly: true });
  if (metrics.internalLinkCount === 0) warnings.push('add at least one contextual internal link to an existing website route');
  if (!post.coverImage) warnings.push('add a cover image for stronger social previews and article presentation');
  if (isPublished && (!Array.isArray(post.evidenceNotes) || post.evidenceNotes.length === 0)) warnings.push('add evidence notes so factual claims can be reviewed before publication');

  let seenH2 = false;
  const headingNames = new Set();
  const body = Array.isArray(post.body) ? post.body : [];
  for (const [index, block] of body.entries()) {
    if (block?.type === BLOG_BLOCK_TYPES.HEADING) {
      const normalizedHeading = block.text?.trim().toLowerCase();
      if (normalizedHeading && headingNames.has(normalizedHeading)) {
        addQualityIssue(errors, warnings, mode, `body[${index}] repeats an earlier heading`);
      }
      if (normalizedHeading) headingNames.add(normalizedHeading);
      if (block.level === 2) seenH2 = true;
      if (block.level === 3 && !seenH2) addQualityIssue(errors, warnings, mode, `body[${index}] uses H3 before the first H2`);
    }

    if (block?.type === BLOG_BLOCK_TYPES.LINK) {
      const href = block.href?.trim() || '';
      if (/^(javascript|data|vbscript):/i.test(href)) errors.push(`body[${index}].href uses a disallowed URL scheme`);
      if (!href.startsWith('/') && !/^https?:\/\//i.test(href)) errors.push(`body[${index}].href must be site-relative or use https://`);
      if (block.routeId && validRouteIds.length > 0 && !routeIdSet.has(block.routeId)) errors.push(`body[${index}].routeId references an unknown route: ${block.routeId}`);
      if (block.routeId && routePathSet.size > 0 && routeIdSet.has(block.routeId)) {
        const route = routesById.get(block.routeId);
        if (route && href.split(/[?#]/)[0] !== route.path) warnings.push(`body[${index}].href does not match its related route path ${route.path}`);
      }
    }

    if (block?.type === BLOG_BLOCK_TYPES.IMAGE) validateImageSource(block.image, `body[${index}].image`, { mode, availableImagePaths }, errors, warnings);
  }

  validateImageSource(post.coverImage, 'coverImage', { mode, availableImagePaths }, errors, warnings);

  return { errors, warnings, metrics };
}

export function validateBlogPostForEditorialUse(post, options = {}) {
  const normalizedOptions = { mode: 'draft', ...options };
  const structuralErrors = validateBlogPost(post, normalizedOptions);
  const content = validateBlogPostContent(post, normalizedOptions);
  return {
    errors: [...structuralErrors, ...content.errors],
    warnings: content.warnings,
    metrics: content.metrics,
  };
}

export function validateBlogCollectionForEditorialUse(posts, options = {}) {
  const structuralErrors = validateBlogCollection(posts, options);
  const errors = [...structuralErrors];
  const warnings = [];
  const records = [];
  const routePathSet = new Set(options.validRoutePaths || []);

  for (const post of posts || []) {
    const mode = post?.status === BLOG_STATUSES.PUBLISHED ? 'publish' : 'draft';
    const content = validateBlogPostContent(post, { ...options, mode });
    records.push({ id: post?.id, slug: post?.slug, ...content });
    for (const error of content.errors) errors.push(`${post?.id || 'unknown'}: ${error}`);
    for (const warning of content.warnings) warnings.push(`${post?.id || 'unknown'}: ${warning}`);

    const canonicalPath = post?.seo?.canonicalPath;
    if (canonicalPath && routePathSet.has(canonicalPath)) errors.push(`${post.id}: canonicalPath conflicts with an existing website route: ${canonicalPath}`);
  }

  return { errors, warnings, records };
}
