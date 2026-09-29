#!/usr/bin/env node

import { BLOG_STATUSES } from '../src/content/blog/blogSchema.js';
import { getWorkflowTransitions, transitionBlogPost } from '../src/content/blog/blogWorkflow.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { validateBlogPostForEditorialUse } from '../src/content/blog/blogValidation.js';
import { loadBlogPosts, writeBlogPostFile } from './blog-storage.js';

const routeOptions = {
  validRouteIds: INDEXABLE_ROUTES.map((route) => route.id),
  validRoutePaths: INDEXABLE_ROUTES.map((route) => route.path),
  validRoutes: INDEXABLE_ROUTES,
};

function storageOptions(status) {
  return {
    mode: status === BLOG_STATUSES.PUBLISHED ? 'publish' : 'draft',
    ...routeOptions,
  };
}

function usage() {
  console.log(`Blog publishing workflow

Commands:
  list
  validate [post-id]
  submit <post-id>
  schedule <post-id> <YYYY-MM-DD>
  publish <post-id>
  archive <post-id>
  reopen <post-id>
  transition <post-id> <status>
`);
}

function findPost(id, posts) {
  const post = posts.find((candidate) => candidate.id === id);
  if (!post) throw new Error(`Blog post not found: ${id}`);
  return post;
}

function validationFor(post) {
  return validateBlogPostForEditorialUse(post, {
    mode: post.status === BLOG_STATUSES.PUBLISHED ? 'publish' : 'draft',
    ...routeOptions,
  });
}

function printValidation(post) {
  const result = validationFor(post);
  if (result.errors.length > 0) {
    console.error(`${post.id}: validation errors`);
    for (const error of result.errors) console.error(`- ${error}`);
    return false;
  }
  console.log(`${post.id}: ${post.status} is valid (${result.metrics.wordCount} body words)`);
  for (const warning of result.warnings) console.warn(`  warning: ${warning}`);
  return true;
}

function transition(id, targetStatus, scheduledAt) {
  const post = findPost(id, loadBlogPosts());
  const nextPost = transitionBlogPost(post, targetStatus, { scheduledAt });
  const destination = writeBlogPostFile(nextPost, storageOptions(nextPost.status));
  console.log(`${id}: ${post.status} -> ${nextPost.status}`);
  console.log(`Saved ${destination}`);
}

const [command, ...args] = process.argv.slice(2);

try {
  if (!command || command === 'help' || command === '--help') {
    usage();
  } else if (command === 'list') {
    for (const post of loadBlogPosts()) {
      console.log(`${post.id}\t${post.status}\t${post.slug}\t${post.updatedAt}`);
    }
  } else if (command === 'validate') {
    const posts = loadBlogPosts();
    const selected = args[0] ? [findPost(args[0], posts)] : posts;
    if (selected.some((post) => !printValidation(post))) process.exitCode = 1;
  } else if (command === 'submit') {
    transition(args[0], BLOG_STATUSES.REVIEW);
  } else if (command === 'schedule') {
    transition(args[0], BLOG_STATUSES.SCHEDULED, args[1]);
  } else if (command === 'publish') {
    transition(args[0], BLOG_STATUSES.PUBLISHED);
  } else if (command === 'archive') {
    transition(args[0], BLOG_STATUSES.ARCHIVED);
  } else if (command === 'reopen') {
    transition(args[0], BLOG_STATUSES.DRAFT);
  } else if (command === 'transition') {
    const post = findPost(args[0], loadBlogPosts());
    if (!getWorkflowTransitions(post.status).includes(args[1])) {
      throw new Error(`Allowed transitions from ${post.status}: ${getWorkflowTransitions(post.status).join(', ') || 'none'}`);
    }
    transition(args[0], args[1], args[2]);
  } else {
    throw new Error(`Unknown workflow command: ${command}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Blog workflow command failed');
  process.exitCode = 1;
}
