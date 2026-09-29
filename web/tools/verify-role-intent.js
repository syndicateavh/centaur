#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { CAREER_GUIDES } from '../src/content/careerGuides.js';
import { loadBlogPosts } from './blog-storage.js';
import { getQuizDomain } from '../src/content/quizLibrary.js';
import {
  INDEXABLE_ROUTES,
  SEO_ROUTES,
} from '../src/seo/seoRoutes.js';
import {
  ROLE_INTENTS,
  getRoleIntentByCanonicalPath,
  getRoleIntentByGuideId,
} from '../src/content/roleIntent.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const indexablePaths = new Set(INDEXABLE_ROUTES.map((route) => route.path));
const routePaths = new Set(SEO_ROUTES.map((route) => route.path));
const publishedPosts = loadBlogPosts().filter((post) => post.status === 'published');
const publishedBlogPaths = new Set(
  publishedPosts.map((post) => post.seo?.canonicalPath || '/blog/' + post.slug + '/'),
);

function fail(message) {
  failures.push(message);
}

function outputFile(publicPath) {
  return path.join(buildRoot, publicPath.slice(1), 'index.html');
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function readPage(publicPath) {
  const filePath = outputFile(publicPath);
  if (!fs.existsSync(filePath)) {
    fail(publicPath + ': prerendered output is missing');
    return '';
  }
  return decodeHtml(fs.readFileSync(filePath, 'utf8'));
}

function requireText(publicPath, html, expected) {
  if (!html.includes(expected)) fail(publicPath + ': rendered content is missing ' + expected);
}

function requireLink(publicPath, html, href) {
  if (!html.includes('href="' + href + '"')) fail(publicPath + ': rendered link is missing ' + href);
}

function quizPath(intent) {
  return '/quiz/?domain=' + encodeURIComponent(intent.quizDomainId) + '#quiz-round-title';
}

const intentIds = new Set();
const canonicalPaths = new Set();
const searchQuestions = new Map();

for (const intent of ROLE_INTENTS) {
  if (intentIds.has(intent.id)) fail('duplicate role-intent id: ' + intent.id);
  intentIds.add(intent.id);

  if (canonicalPaths.has(intent.canonicalPath)) fail('duplicate role-intent canonical path: ' + intent.canonicalPath);
  canonicalPaths.add(intent.canonicalPath);

  if (!intent.label || !intent.summary || !intent.primaryQuestion) fail(intent.id + ': label, summary, and primaryQuestion are required');
  if (!Array.isArray(intent.searchQuestions) || intent.searchQuestions.length < 3) fail(intent.id + ': at least three search questions are required');
  for (const question of intent.searchQuestions) {
    const owner = searchQuestions.get(question);
    if (owner && owner !== intent.id) fail('search question is owned by both ' + owner + ' and ' + intent.id + ': ' + question);
    searchQuestions.set(question, intent.id);
  }

  if (!getQuizDomain(intent.quizDomainId)) fail(intent.id + ': quiz domain is missing: ' + intent.quizDomainId);
  if (!indexablePaths.has(intent.coursePath)) fail(intent.id + ': course path is not indexable: ' + intent.coursePath);

  if (intent.kind === 'guide') {
    const guide = CAREER_GUIDES.find((candidate) => candidate.id === intent.guideId);
    if (!guide) {
      fail(intent.id + ': guide is missing: ' + intent.guideId);
    } else {
      if (guide.path !== intent.canonicalPath) fail(intent.id + ': canonical path does not match guide path');
      if (!indexablePaths.has(guide.path)) fail(intent.id + ': guide path is not indexable: ' + guide.path);
      if (getRoleIntentByGuideId(guide.id)?.id !== intent.id) fail(intent.id + ': guide lookup does not resolve back to this intent');
    }
  } else if (intent.kind === 'specialist') {
    if (!publishedBlogPaths.has(intent.canonicalPath)) fail(intent.id + ': specialist canonical path is not a published blog post: ' + intent.canonicalPath);
    if (getRoleIntentByCanonicalPath(intent.canonicalPath)?.id !== intent.id) fail(intent.id + ': canonical-path lookup does not resolve back to this intent');
  } else {
    fail(intent.id + ': unknown intent kind: ' + intent.kind);
  }

  for (const article of intent.articleLinks) {
    if (!publishedBlogPaths.has(article.path)) fail(intent.id + ': related article is not published: ' + article.path);
  }
}

for (const guide of CAREER_GUIDES) {
  if (!getRoleIntentByGuideId(guide.id)) fail('missing role-intent owner for guide: ' + guide.id);
}

const hubPath = '/career-guides/';
const hubHtml = readPage(hubPath);
requireText(hubPath, hubHtml, 'data-role-intent-specialists');
for (const intent of ROLE_INTENTS) {
  requireLink(hubPath, hubHtml, intent.canonicalPath);
  requireLink(hubPath, hubHtml, quizPath(intent));
  if (intent.kind === 'specialist') {
    requireText(hubPath, hubHtml, 'data-role-intent-pathway="' + intent.id + '"');
    requireLink(hubPath, hubHtml, intent.coursePath);
  }
}

for (const intent of ROLE_INTENTS.filter((candidate) => candidate.kind === 'guide')) {
  const html = readPage(intent.canonicalPath);
  requireText(intent.canonicalPath, html, 'data-role-intent-pathway="' + intent.id + '"');
  requireText(intent.canonicalPath, html, intent.primaryQuestion);
  requireLink(intent.canonicalPath, html, intent.canonicalPath);
  requireLink(intent.canonicalPath, html, quizPath(intent));
  requireLink(intent.canonicalPath, html, intent.coursePath);
  for (const article of intent.articleLinks) requireLink(intent.canonicalPath, html, article.path);
}

for (const intent of ROLE_INTENTS.filter((candidate) => candidate.kind === 'specialist')) {
  const html = readPage(intent.canonicalPath);
  requireText(intent.canonicalPath, html, 'data-role-intent-pathway="' + intent.id + '"');
  requireText(intent.canonicalPath, html, intent.primaryQuestion);
  requireLink(intent.canonicalPath, html, intent.canonicalPath);
  requireLink(intent.canonicalPath, html, quizPath(intent));
  requireLink(intent.canonicalPath, html, intent.coursePath);
}

if (failures.length > 0) {
  console.error('Role-intent search cluster verification failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log('Role-intent search cluster verified: ' + CAREER_GUIDES.length + ' guide owners, ' + ROLE_INTENTS.filter((intent) => intent.kind === 'specialist').length + ' specialist owners, unique search questions, canonical quiz/course paths, and published article connections.');
