#!/usr/bin/env node

import assert from 'node:assert/strict';
import { BLOG_STATUSES } from '../src/content/blog/blogSchema.js';
import {
  assertWorkflowTransition,
  getWorkflowTransitions,
  transitionBlogPost,
} from '../src/content/blog/blogWorkflow.js';

const basePost = {
  schemaVersion: 1,
  id: 'workflow-fixture',
  slug: 'workflow-fixture',
  status: BLOG_STATUSES.DRAFT,
  title: 'Workflow fixture',
  excerpt: 'Workflow fixture excerpt',
  category: 'career-guides',
  author: { id: 'editorial-team', name: 'Editorial Team', role: 'Content editor' },
  body: [{ type: 'paragraph', text: 'Workflow fixture body.' }],
  coverImage: null,
  publishedAt: null,
  updatedAt: '2026-09-11',
  scheduledAt: null,
  seo: { title: 'Workflow fixture', description: 'Workflow fixture description', canonicalPath: '/blog/workflow-fixture/', noindex: true },
  relatedRouteIds: [],
  redirects: [],
  evidenceNotes: [],
};

assert.deepEqual(getWorkflowTransitions(BLOG_STATUSES.DRAFT), [BLOG_STATUSES.REVIEW, BLOG_STATUSES.ARCHIVED]);
assert.doesNotThrow(() => assertWorkflowTransition(BLOG_STATUSES.REVIEW, BLOG_STATUSES.PUBLISHED));
assert.throws(() => assertWorkflowTransition(BLOG_STATUSES.DRAFT, BLOG_STATUSES.PUBLISHED), /cannot move/);

const reviewPost = transitionBlogPost(basePost, BLOG_STATUSES.REVIEW, { today: '2026-09-11' });
assert.equal(reviewPost.status, BLOG_STATUSES.REVIEW);
assert.equal(reviewPost.seo.noindex, true);
assert.equal(reviewPost.updatedAt, '2026-09-11');

assert.throws(
  () => transitionBlogPost(reviewPost, BLOG_STATUSES.SCHEDULED, { today: '2026-09-11' }),
  /requires a valid scheduledAt/,
);
assert.throws(
  () => transitionBlogPost(reviewPost, BLOG_STATUSES.SCHEDULED, { scheduledAt: '2026-09-10', today: '2026-09-11' }),
  /today or a future/,
);

const scheduledPost = transitionBlogPost(reviewPost, BLOG_STATUSES.SCHEDULED, {
  scheduledAt: '2026-09-12',
  today: '2026-09-11',
});
assert.equal(scheduledPost.status, BLOG_STATUSES.SCHEDULED);
assert.equal(scheduledPost.scheduledAt, '2026-09-12');
assert.equal(scheduledPost.publishedAt, null);
assert.equal(scheduledPost.seo.noindex, true);

const publishedPost = transitionBlogPost(scheduledPost, BLOG_STATUSES.PUBLISHED, { today: '2026-09-11' });
assert.equal(publishedPost.status, BLOG_STATUSES.PUBLISHED);
assert.equal(publishedPost.publishedAt, '2026-09-11');
assert.equal(publishedPost.scheduledAt, null);
assert.equal(publishedPost.seo.noindex, false);

const archivedPost = transitionBlogPost(publishedPost, BLOG_STATUSES.ARCHIVED, { today: '2026-09-11' });
assert.equal(archivedPost.status, BLOG_STATUSES.ARCHIVED);
assert.equal(archivedPost.seo.noindex, true);
const reopenedPost = transitionBlogPost(archivedPost, BLOG_STATUSES.DRAFT, { today: '2026-09-11' });
assert.equal(reopenedPost.status, BLOG_STATUSES.DRAFT);

console.log('Blog publishing workflow verified: guarded transitions, schedule dates, index state, publication dates, and archive/reopen behavior are valid.');
