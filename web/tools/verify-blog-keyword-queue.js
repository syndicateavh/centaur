#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { BLOG_KEYWORD_QUEUE, BLOG_QUEUE_SERP_REVIEW } from '../src/content/seo/blogKeywordQueue.js';
import { BLOG_POSTS_ROOT, loadBlogPosts } from './blog-storage.js';
import { BACKLINK_TARGET_PATHS, validateBacklinkCollection } from '../src/content/seo/backlinkWorkflow.js';
import { KEYWORD_STRATEGY_ROWS } from '../src/seo/keywordMap.js';
import { LINKABLE_AUTHORITY_ASSETS } from '../src/content/seo/authorityBuilding.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';

const failures = [];
const postsById = new Map(loadBlogPosts().map((post) => [post.id, post]));
const normalized = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
const searchable = (value) => normalized(value).replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
const existingOwners = new Set(KEYWORD_STRATEGY_ROWS.map((row) => normalized(row.keyword)));
const authorityById = new Map(LINKABLE_AUTHORITY_ASSETS.map((asset) => [asset.id, asset]));
const indexablePaths = new Set(INDEXABLE_ROUTES.filter((route) => route.indexable).map((route) => route.path));
const queuedPaths = new Set(BLOG_KEYWORD_QUEUE.map((item) => item.targetPath));
const existingBlogPaths = new Set([...postsById.values()]
  .filter((post) => !queuedPaths.has(post.seo?.canonicalPath))
  .map((post) => post.seo?.canonicalPath)
  .filter(Boolean));
const prospects = JSON.parse(fs.readFileSync('src/content/seo/backlinkProspects.json', 'utf8'));
const prospectValidation = validateBacklinkCollection(prospects);

function fail(message) {
  failures.push(message);
}

if (BLOG_KEYWORD_QUEUE.length !== 10) fail('expected 10 queued articles, found ' + BLOG_KEYWORD_QUEUE.length);
if (BLOG_QUEUE_SERP_REVIEW.status !== 'provisional' || BLOG_QUEUE_SERP_REVIEW.market !== 'India' || BLOG_QUEUE_SERP_REVIEW.language !== 'English') {
  fail('record the India/English SERP validation status and caveat');
}

const seenIds = new Set();
const seenKeywords = new Set();
for (const [index, item] of BLOG_KEYWORD_QUEUE.entries()) {
  const expectedPosition = index + 1;
  if (item.position !== expectedPosition) fail(item.postId + ': queue position must be ' + expectedPosition);
  if (typeof item.distinctIntentReview !== 'string' || item.distinctIntentReview.length < 40) fail(item.postId + ': document how this intent differs from existing pages');
  if (!Array.isArray(item.reviewedExistingPaths) || item.reviewedExistingPaths.length === 0) {
    fail(item.postId + ': list the existing pages reviewed for intent overlap');
  } else {
    for (const reviewedPath of item.reviewedExistingPaths) {
      if (!indexablePaths.has(reviewedPath) && !existingBlogPaths.has(reviewedPath)) {
        fail(item.postId + ': reviewed intent-conflict path is not an existing page: ' + reviewedPath);
      }
    }
  }
  if (seenIds.has(item.postId)) fail(item.postId + ': duplicate queued article ID');
  if (seenKeywords.has(normalized(item.primaryKeyword))) fail(item.primaryKeyword + ': duplicate primary keyword ownership in the queue');
  seenIds.add(item.postId);
  seenKeywords.add(normalized(item.primaryKeyword));

  const post = postsById.get(item.postId);
  if (!post) {
    fail(item.postId + ': queued article record is missing');
    continue;
  }
  if (post.status !== 'published') fail(item.postId + ': queued article must be published');
  if (post.seo?.canonicalPath !== item.targetPath) fail(item.postId + ': canonical path does not match the queue');
  if (indexablePaths.has(item.targetPath)) fail(item.postId + ': blog target conflicts with a registered static route');
  if (!Number.isInteger(item.reportedVolume) || item.reportedVolume < 0) fail(item.postId + ': reported Semrush volume is invalid');
  if (!Number.isInteger(item.keywordDifficulty) || item.keywordDifficulty < 0 || item.keywordDifficulty > 100) fail(item.postId + ': keyword difficulty is invalid');
  if (existingOwners.has(normalized(item.primaryKeyword))) fail(item.primaryKeyword + ': primary keyword is already owned by the existing strategy');

  const visibleText = [
    post.title,
    post.excerpt,
    ...(post.body || []).flatMap((block) => [block.text, block.question, block.answer, ...(block.items || [])]),
  ].filter(Boolean).join(' ');
  const visibleSearchText = searchable(visibleText);
  if (!visibleSearchText.includes(searchable(item.primaryKeyword))) {
    fail(item.postId + ': primary keyword is absent from visible article content');
  }
  for (const keyword of item.supportingKeywords || []) {
    if (!visibleSearchText.includes(searchable(keyword))) fail(item.postId + ': supporting keyword is absent from visible article content: ' + keyword);
  }
  if (post.body?.filter((block) => block.type === 'link' && block.routeId).length === 0) fail(item.postId + ': add a contextual internal link');
  if (item.downloadPath) {
    const downloadFile = path.join(process.cwd(), 'public', item.downloadPath.replace(/^\/+/, ''));
    if (!fs.existsSync(downloadFile)) fail(item.postId + ': original downloadable asset is missing: ' + item.downloadPath);
    if (!post.body?.some((block) => block.type === 'link' && block.href === item.downloadPath)) fail(item.postId + ': article does not link to its registered downloadable asset');
  }
  if (!post.author?.type || !['Person', 'Organization'].includes(post.author.type)) fail(item.postId + ': author type must be explicit for queued publication');
  if (!post.evidenceNotes?.length) fail(item.postId + ': add source and editorial evidence notes');
  if (post.seo?.title?.length < 30 || post.seo?.title?.length > 65) fail(item.postId + ': SEO title is outside the 30-65 character editorial range');
  if (post.seo?.description?.length < 70 || post.seo?.description?.length > 160) fail(item.postId + ': SEO description is outside the 70-160 character editorial range');

  const authority = authorityById.get(item.authorityAssetId);
  if (!authority) {
    fail(item.postId + ': authority asset ' + item.authorityAssetId + ' is missing');
  } else if (authority.targetPath !== item.targetPath || authority.status !== 'active') {
    fail(item.postId + ': authority asset must be active and target the article canonical');
  }
  if (!BACKLINK_TARGET_PATHS.includes(item.targetPath)) fail(item.postId + ': canonical is not an allowed backlink target');
  if (!prospects.some((prospect) => prospect.assetId === item.authorityAssetId && prospect.targetPath === item.targetPath)) {
    fail(item.postId + ': earned-link prospect record is missing');
  }
  if (!fs.existsSync(path.join(BLOG_POSTS_ROOT, item.postId + '.json'))) fail(item.postId + ': content file is missing from the canonical blog store');
}

for (const error of prospectValidation.errors) fail('backlink prospect registry: ' + error);

if (failures.length > 0) {
  console.error('Blog keyword queue verification failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log('Blog keyword queue verified: ' + BLOG_KEYWORD_QUEUE.length + ' ordered articles, unique existing-strategy ownership, and evidence-only backlink assets.');
