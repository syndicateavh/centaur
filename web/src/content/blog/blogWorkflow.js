import { BLOG_STATUSES } from './blogSchema.js';

export const BLOG_WORKFLOW_TRANSITIONS = Object.freeze({
  [BLOG_STATUSES.DRAFT]: Object.freeze([BLOG_STATUSES.REVIEW, BLOG_STATUSES.ARCHIVED]),
  [BLOG_STATUSES.REVIEW]: Object.freeze([
    BLOG_STATUSES.DRAFT,
    BLOG_STATUSES.SCHEDULED,
    BLOG_STATUSES.PUBLISHED,
    BLOG_STATUSES.ARCHIVED,
  ]),
  [BLOG_STATUSES.SCHEDULED]: Object.freeze([
    BLOG_STATUSES.REVIEW,
    BLOG_STATUSES.PUBLISHED,
    BLOG_STATUSES.ARCHIVED,
  ]),
  [BLOG_STATUSES.PUBLISHED]: Object.freeze([BLOG_STATUSES.REVIEW, BLOG_STATUSES.ARCHIVED]),
  [BLOG_STATUSES.ARCHIVED]: Object.freeze([BLOG_STATUSES.DRAFT]),
});

const WORKFLOW_ACTION_LABELS = Object.freeze({
  [BLOG_STATUSES.DRAFT]: 'Reopen as draft',
  [BLOG_STATUSES.REVIEW]: 'Submit for review',
  [BLOG_STATUSES.SCHEDULED]: 'Schedule publication',
  [BLOG_STATUSES.PUBLISHED]: 'Publish',
  [BLOG_STATUSES.ARCHIVED]: 'Archive',
});

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

export function getWorkflowTransitions(status) {
  return [...(BLOG_WORKFLOW_TRANSITIONS[status] || [])];
}

export function getWorkflowActionLabel(status) {
  return WORKFLOW_ACTION_LABELS[status] || `Move to ${status}`;
}

export function assertWorkflowTransition(currentStatus, targetStatus) {
  if (!Object.values(BLOG_STATUSES).includes(currentStatus)) {
    throw new Error(`Unknown current blog status: ${currentStatus}`);
  }
  if (!Object.values(BLOG_STATUSES).includes(targetStatus)) {
    throw new Error(`Unknown target blog status: ${targetStatus}`);
  }
  if (currentStatus === targetStatus) return true;
  if (!getWorkflowTransitions(currentStatus).includes(targetStatus)) {
    throw new Error(`Blog workflow cannot move from ${currentStatus} to ${targetStatus}`);
  }
  return true;
}

export function transitionBlogPost(post, targetStatus, { scheduledAt, today = todayString() } = {}) {
  if (!post || typeof post !== 'object') throw new Error('A blog post is required for a workflow transition');
  assertWorkflowTransition(post.status, targetStatus);
  if (!isValidDate(today)) throw new Error(`Workflow date must be a valid YYYY-MM-DD date: ${today}`);

  const nextPost = {
    ...post,
    status: targetStatus,
    updatedAt: today,
    seo: { ...post.seo },
  };

  if (targetStatus === BLOG_STATUSES.SCHEDULED) {
    const effectiveScheduledAt = scheduledAt || post.scheduledAt;
    if (!effectiveScheduledAt || !isValidDate(effectiveScheduledAt)) {
      throw new Error('A scheduled post requires a valid scheduledAt date');
    }
    if (effectiveScheduledAt < today) {
      throw new Error('A scheduled post must use today or a future scheduledAt date');
    }
    nextPost.scheduledAt = effectiveScheduledAt;
    nextPost.publishedAt = null;
    nextPost.seo.noindex = true;
  } else if (targetStatus === BLOG_STATUSES.PUBLISHED) {
    nextPost.scheduledAt = null;
    nextPost.publishedAt = post.publishedAt || today;
    nextPost.seo.noindex = false;
  } else {
    nextPost.scheduledAt = null;
    nextPost.seo.noindex = true;
  }

  return nextPost;
}
