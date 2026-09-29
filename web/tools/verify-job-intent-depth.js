#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { CAREER_GUIDES } from '../src/content/careerGuides.js';
import { JOB_INTENT_GUIDE_IDS, JOB_INTENT_REVIEW_DATE } from '../src/content/seo/jobIntentDepth.js';
import { ROLE_INTENTS } from '../src/content/roleIntent.js';
import { loadBlogPosts } from './blog-storage.js';

const failures = [];
const buildRoot = path.resolve('build/client');
const posts = loadBlogPosts();
const cases = [
  { slug: 'kyc-onboarding-case-file-example', downloads: ['kyc-onboarding-case-file.csv', 'kyc-onboarding-case-answer-key.txt'], guideId: 'kyc-aml-analyst' },
  { slug: 'settlement-trade-break-worked-example', downloads: ['settlement-trade-break-source-records.csv', 'settlement-trade-break-answer-key.txt'], guideId: 'investment-banking-operations' },
  { slug: 'payment-reconciliation-process-breaks-controls', downloads: ['payment-reconciliation-source-records.csv', 'payment-reconciliation-answer-key.txt'], guideId: 'digital-payments-operations' },
  { slug: 'chargeback-process-evidence-operations', downloads: ['chargeback-case-source-records.csv', 'chargeback-case-answer-key.txt'], guideId: 'digital-payments-operations' },
  { slug: 'loan-operations-banking-roles-skills-career-path', downloads: ['loan-file-review-source-records.csv', 'loan-file-review-answer-key.txt'], guideId: 'credit-operations-analyst' },
];

function check(value, message) {
  if (!value) failures.push(message);
}

function rendered(pathname) {
  const file = path.join(buildRoot, pathname.slice(1), 'index.html');
  check(fs.existsSync(file), `${pathname}: prerendered page missing`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

check(JOB_INTENT_GUIDE_IDS.length >= 8 && new Set(JOB_INTENT_GUIDE_IDS).size === JOB_INTENT_GUIDE_IDS.length,
  'Expected at least eight distinct upgraded role guides');
check(cases.length === 5, 'Expected five practical case articles');

for (const id of JOB_INTENT_GUIDE_IDS) {
  const guide = CAREER_GUIDES.find((item) => item.id === id);
  check(guide, `${id}: guide missing`);
  if (!guide) continue;
  const intent = ROLE_INTENTS.find((item) => item.guideId === id);
  check(intent?.canonicalPath === guide.path, `${id}: role-intent owner missing or mismatched`);
  const body = guide.body || [];
  for (const phrase of ['How to judge a real vacancy in this role', 'Skills and tools to demonstrate', 'Try a fictional work sample', 'Interview question and next step']) {
    check(body.some((block) => block.type === 'heading' && block.text === phrase), `${id}: missing ${phrase}`);
  }
  check(body.some((block) => block.type === 'paragraph' && block.text.includes('Model reasoning:')), `${id}: model reasoning missing`);
  check(body.some((block) => block.type === 'heading' && block.text === 'How the full program guarantee applies'), `${id}: program guarantee boundary missing`);
  check(body.some((block) => block.type === 'link' && block.href === '/placements/#job-guarantee-terms'), `${id}: guarantee terms link missing`);
  check(body.some((block) => block.type === 'link' && block.href === intent?.coursePath), `${id}: module path missing`);
  const caseLink = body.find((block) => block.type === 'link' && /^\/blog\//.test(block.href) &&
    block.label && /case|packet|break|example|exercise|file/i.test(block.label));
  check(caseLink, `${id}: practical article link missing`);
  const employerSource = body.find((block) => block.type === 'link' && /^https:\/\/jobs\.citi\.com\//.test(block.href));
  check(employerSource, `${id}: dated employer source missing`);
  check(guide.updatedAt === JOB_INTENT_REVIEW_DATE, `${id}: review date missing`);
  const html = rendered(guide.path);
  check(html.includes('Try a fictional work sample'), `${id}: work sample not rendered`);
  check(html.includes('How to judge a real vacancy in this role'), `${id}: vacancy guidance not rendered`);
  check(html.includes('How the full program guarantee applies') && html.includes('href="/placements/#job-guarantee-terms"'), `${id}: program guarantee path not rendered`);
  check(html.includes(`href="${intent?.coursePath}"`), `${id}: module link not rendered`);
  if (caseLink) check(html.includes(`href="${caseLink.href}"`), `${id}: practical article link not rendered`);
  if (employerSource) check(html.includes(`href="${employerSource.href}"`), `${id}: employer source link not rendered`);
  check(!html.includes('"@type":"JobPosting"'), `${id}: career guide must not advertise JobPosting schema`);
}

for (const item of cases) {
  const post = posts.find((candidate) => candidate.slug === item.slug);
  check(post?.status === 'published', `${item.slug}: published article missing`);
  if (!post) continue;
  const articlePath = `/blog/${item.slug}/`;
  const html = rendered(articlePath);
  check(html.includes(`href="/career-guides/${item.guideId}/"`), `${item.slug}: relevant guide link missing`);
  check(html.includes('href="/courses/'), `${item.slug}: module or course link missing`);
  for (const filename of item.downloads) {
    const publicPath = `/downloads/${filename}`;
    check(post.body.some((block) => block.type === 'link' && block.href === publicPath), `${item.slug}: source link missing ${filename}`);
    check(html.includes(`href="${publicPath}"`), `${item.slug}: download link not rendered ${filename}`);
    check(fs.existsSync(path.resolve('public/downloads', filename)), `${item.slug}: source download missing ${filename}`);
    check(fs.existsSync(path.join(buildRoot, 'downloads', filename)), `${item.slug}: built download missing ${filename}`);
  }
  check(post.body.some((block) => block.type === 'paragraph' && /fictional|invented/i.test(block.text)), `${item.slug}: fictional-data boundary missing`);
  check(post.body.some((block) => block.type === 'link' && /^https:\/\//.test(block.href)), `${item.slug}: primary source link missing`);
  check(post.evidenceNotes?.length > 0, `${item.slug}: evidence notes missing`);
  check(!html.includes('"@type":"JobPosting"'), `${item.slug}: case article must not advertise JobPosting schema`);
}

if (failures.length) {
  console.error(`Job-intent depth verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Job-intent depth verified: ${JOB_INTENT_GUIDE_IDS.length} rendered guides, ${cases.length} published cases, 10 source/answer downloads, role owners, module links and no JobPosting markup.`);
