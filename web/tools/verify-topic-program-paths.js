#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INFORMATIONAL_MODULES } from '../src/content/informationalModules.js';
import { JOB_GUARANTEE, PROGRAM } from '../src/content/sourceContent.js';
import { TOPIC_PROGRAM_IDS, TOPIC_PROGRAM_REVIEW_DATE, getTopicProgramPath } from '../src/content/topicProgramPaths.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { loadBlogPosts } from './blog-storage.js';

const failures = [];
const routePaths = new Set(INDEXABLE_ROUTES.map((route) => route.path));
for (const post of loadBlogPosts().filter((item) => item.status === 'published')) {
  routePaths.add(post.seo?.canonicalPath || `/blog/${post.slug}/`);
}
const expected = [
  'investment-banking-operations',
  'retail-banking',
  'finance-operations',
  'kyc-aml-compliance',
  'digital-payments',
  'fintech-neo-banking',
];

function check(value, message) {
  if (!value) failures.push(message);
}

check(TOPIC_PROGRAM_IDS.length === expected.length && expected.every((id) => TOPIC_PROGRAM_IDS.includes(id)),
  'The six program topic paths must be complete and unique');
check(JOB_GUARANTEE.termsPath === '/placements/#job-guarantee-terms', 'Canonical guarantee terms path changed');

for (const id of expected) {
  const data = getTopicProgramPath(id);
  const route = INDEXABLE_ROUTES.find((item) => item.id === id);
  check(data && route, `${id}: topic content or indexable page missing`);
  if (!data || !route) continue;

  check(data.label?.length > 3, `${id}: topic label missing`);
  for (const key of ['decision', 'practice', 'answer', 'roleBoundary']) {
    check(data[key]?.length >= 30, `${id}: ${key} lacks a useful topic-specific answer`);
  }
  for (const key of ['casePath', 'rolePath']) {
    check(routePaths.has(data[key]), `${id}: ${key} is not an indexable owned destination: ${data[key]}`);
  }
  check(route.lastModified === TOPIC_PROGRAM_REVIEW_DATE, `${id}: page review date is stale`);

  const file = path.resolve('build/client', route.path.slice(1), 'index.html');
  check(fs.existsSync(file), `${id}: prerendered page missing`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');
  check(html.includes(`data-topic-program="${id}"`), `${id}: topic pathway is not rendered`);
  check(html.includes(data.practice), `${id}: unique practical task is not rendered`);
  check(html.includes(data.answer), `${id}: model reasoning is not rendered`);
  check(html.includes(JOB_GUARANTEE.description), `${id}: approved full-program guarantee is not rendered`);
  check(html.includes(PROGRAM.name), `${id}: full-program name missing`);
  check(html.includes(`href="${JOB_GUARANTEE.termsPath}"`), `${id}: written-terms path missing`);
  check(html.includes(`href="${data.casePath}"`) && html.includes(`href="${data.rolePath}"`), `${id}: case or role path missing`);
  check(html.includes('href="/courses/"') && html.includes('href="/contact/"'), `${id}: program or enquiry path missing`);
  check(!/No\.?\s*1\s+assured placement|number one assured placement/i.test(html), `${id}: unsupported No. 1 placement claim rendered`);
  check(!html.includes('"@type":"JobPosting"'), `${id}: curriculum page must not use JobPosting schema`);
}

check(INFORMATIONAL_MODULES.length === 3, 'Expected three informational module pages');

if (failures.length) {
  console.error(`Topic program pathway verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Topic program pathways verified: six rendered module pages, unique practical tasks, approved full-program guarantee, written terms, case/role links, enquiry paths and no No. 1 placement claim.');
