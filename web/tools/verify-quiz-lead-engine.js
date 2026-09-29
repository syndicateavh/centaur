#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { FINANCE_QUIZ_DOMAINS } from '../src/content/quizLibrary.js';
import { getQuizLeadPath, QUIZ_LEAD_PATHS } from '../src/content/quizLeadPaths.js';
import { getRoleIntentById } from '../src/content/roleIntent.js';
import { loadBlogPosts } from './blog-storage.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const indexablePaths = new Set(INDEXABLE_ROUTES.map((route) => route.path));
const publishedBlogPaths = new Set(
  loadBlogPosts()
    .filter((post) => post.status === 'published')
    .map((post) => post.seo?.canonicalPath || '/blog/' + post.slug + '/'),
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

const quizDomainIds = new Set(FINANCE_QUIZ_DOMAINS.map((domain) => domain.id));
const mappedDomainIds = new Set(Object.keys(QUIZ_LEAD_PATHS));

if (mappedDomainIds.size !== FINANCE_QUIZ_DOMAINS.length + 1) {
  fail('quiz lead paths must cover every quiz domain plus the all-topics fallback');
}

for (const domain of FINANCE_QUIZ_DOMAINS) {
  const leadPath = getQuizLeadPath(domain.id);
  if (!mappedDomainIds.has(domain.id)) fail('missing quiz lead path for domain: ' + domain.id);
  if (leadPath.domainId !== domain.id) fail(domain.id + ': lead path domain id does not match');
  if (!getRoleIntentById(leadPath.roleIntentId)) fail(domain.id + ': lead path references an unknown role intent');
  if (!leadPath.roleLabel || !leadPath.nextStep) fail(domain.id + ': lead path needs a role label and next step');
  if (!indexablePaths.has(leadPath.coursePath)) fail(domain.id + ': lead course path is not indexable: ' + leadPath.coursePath);
  if (!indexablePaths.has(leadPath.rolePath) && !publishedBlogPaths.has(leadPath.rolePath)) {
    fail(domain.id + ': lead role path is not an indexable route or published article: ' + leadPath.rolePath);
  }
}

for (const mappedDomainId of mappedDomainIds) {
  if (mappedDomainId !== 'all' && !quizDomainIds.has(mappedDomainId)) {
    fail('quiz lead path contains an unknown domain: ' + mappedDomainId);
  }
}

const quizPath = '/quiz/';
const quizHtml = readPage(quizPath);
requireText(quizPath, quizHtml, 'data-quiz-lead-engine');
requireText(quizPath, quizHtml, 'data-quiz-lead-state="locked"');
requireText(quizPath, quizHtml, 'Complete the round to unlock role guidance');

const componentPath = path.resolve('src/components/QuizLeadCapture.jsx');
const componentSource = fs.readFileSync(componentPath, 'utf8');
for (const expected of ['quiz_whatsapp_request_prepared', 'consent_recorded', 'Request role guidance', 'https://wa.me/', 'BUSINESS_DATA.enrollmentUrl']) {
  if (!componentSource.includes(expected)) fail('QuizLeadCapture.jsx is missing lead-engine control: ' + expected);
}
if (componentSource.includes('fullName: fields.fullName') || componentSource.includes('contact: fields.contact')) {
  fail('QuizLeadCapture.jsx must not send personally identifiable fields to dataLayer');
}

if (failures.length > 0) {
  console.error('Quiz lead-engine verification failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log('Quiz lead engine verified: ' + FINANCE_QUIZ_DOMAINS.length + ' quiz domains map to owned role paths, indexable course paths, consent-aware WhatsApp handoff, non-PII events, and prerendered lead-engine entry content.');
