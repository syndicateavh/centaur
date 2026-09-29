#!/usr/bin/env node

import { BLOG_STATUSES } from '../src/content/blog/blogSchema.js';
import { validateBlogPostForEditorialUse } from '../src/content/blog/blogValidation.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';

const validRouteIds = INDEXABLE_ROUTES.map((route) => route.id);
const validRoutePaths = INDEXABLE_ROUTES.map((route) => route.path);
const words = Array.from({ length: 300 }, (_, index) => `contentword${index}`).join(' ');
const validPost = {
  schemaVersion: 1,
  id: 'validation-fixture',
  slug: 'validation-fixture',
  status: BLOG_STATUSES.PUBLISHED,
  title: 'A practical guide to finance career preparation',
  excerpt: 'A useful summary that explains the purpose of this validation fixture clearly for editors and readers.',
  category: 'career-guides',
  author: { id: 'editorial-team', name: 'Editorial Team', role: 'Content editor' },
  body: [
    { type: 'paragraph', text: words },
    { type: 'heading', level: 2, text: 'What to prepare' },
    { type: 'link', label: 'Explore courses', href: '/courses/', routeId: 'courses' },
  ],
  coverImage: { src: '/images/blog/validation-fixture.webp', alt: 'A representative editorial image', width: 1200, height: 630 },
  publishedAt: '2026-09-11',
  updatedAt: '2026-09-11',
  scheduledAt: null,
  seo: {
    title: 'Finance career preparation guide for learners',
    description: 'A practical finance career preparation guide with useful steps, context, and internal resources for readers.',
    canonicalPath: '/blog/validation-fixture/',
    noindex: false,
  },
  relatedRouteIds: ['courses'],
  redirects: [],
  evidenceNotes: ['Validation fixture only'],
};

const options = {
  mode: 'publish',
  validRouteIds,
  validRoutePaths,
  validRoutes: INDEXABLE_ROUTES,
  availableImagePaths: new Set(['/images/blog/validation-fixture.webp']),
};
const validResult = validateBlogPostForEditorialUse(validPost, options);
if (validResult.errors.length > 0) throw new Error(`valid fixture failed: ${validResult.errors.join('; ')}`);

const invalidPost = {
  ...validPost,
  body: [{ type: 'paragraph', text: 'Too short.' }],
  coverImage: { ...validPost.coverImage, src: 'https://external.example/image.webp' },
  relatedRouteIds: [],
  evidenceNotes: [],
};
const invalidResult = validateBlogPostForEditorialUse(invalidPost, options);
if (invalidResult.errors.length === 0) throw new Error('invalid fixture unexpectedly passed publication validation');
if (!invalidResult.errors.some((error) => error.includes('at least 300 useful words'))) throw new Error('word-count validation is not enforced');
if (!invalidResult.errors.some((error) => error.includes('first-party path'))) throw new Error('first-party image validation is not enforced');

const malformedPost = { ...validPost, body: { type: 'paragraph', text: 'not an array' } };
const malformedResult = validateBlogPostForEditorialUse(malformedPost, options);
if (malformedResult.errors.length === 0) throw new Error('malformed body validation is not enforced');

console.log(`Blog content validation verified: valid publication fixture passed; invalid fixture produced ${invalidResult.errors.length} errors and ${invalidResult.warnings.length} warnings.`);
