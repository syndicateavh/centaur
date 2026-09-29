#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { CAREER_GUIDE_TOPIC_MAP } from '../src/content/careerGuides.js';
import { KEYWORD_PAGE_ARCHITECTURE, getKeywordOwnership } from '../src/content/seo/keywordStrategy.js';
import { SITE_ORIGIN } from '../src/seo/seoRoutes.js';

const targetPaths = new Set([
  '/courses/kyc-aml/',
  '/career-guides/choosing-finance-career-course/',
  '/india/pune/',
  '/india/hyderabad/',
  '/courses/digital-payments/',
  '/career-guides/fintech-operations/',
  '/courses/fintech/',
]);
const buildRoot = path.resolve('build/client');
const failures = [];
let checkedTerms = 0;

function normalize(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&amp;/g, ' and ')
    .replace(/&quot;|&#39;|&#x27;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function articleBody(html, targetUrl) {
  const marker = targetUrl.startsWith('/india/')
    ? 'data-regional-page'
    : targetUrl.startsWith('/career-guides/')
      ? 'data-career-guide'
      : 'data-informational-module';
  const match = html.match(new RegExp(`<article\\b[^>]*\\b${marker}="[^"]+"[^>]*>([\\s\\S]*?)<\\/article>`, 'i'));
  return match?.[1] || '';
}

const hubFile = path.join(buildRoot, 'career-guides', 'index.html');
const hubHtml = fs.existsSync(hubFile) ? fs.readFileSync(hubFile, 'utf8') : '';
if (!hubHtml) failures.push('/career-guides/: prerendered topic-map hub is missing');
if (!hubHtml.includes('data-career-guide-topic-map')) failures.push('/career-guides/: operations topic map marker is missing');

const sitemapFile = path.join(buildRoot, 'sitemap.xml');
const sitemapUrls = fs.existsSync(sitemapFile)
  ? new Set([...fs.readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))
  : new Set();

for (const topic of CAREER_GUIDE_TOPIC_MAP) {
  if (!hubHtml.includes(`data-career-guide-topic="${topic.id}"`)) failures.push(`/career-guides/: topic card is missing ${topic.id}`);
  if (!hubHtml.includes(topic.label)) failures.push(`/career-guides/: topic label is missing ${topic.label}`);
  if (!hubHtml.includes(topic.question)) failures.push(`/career-guides/: topic question is missing ${topic.question}`);
  for (const targetPath of [topic.primaryPath, topic.supportPath]) {
    if (!hubHtml.includes(`href="${targetPath}"`)) failures.push(`/career-guides/: topic ${topic.id} is missing contextual link ${targetPath}`);
    if (!sitemapUrls.has(`${SITE_ORIGIN}${targetPath}`)) failures.push(`/career-guides/: topic ${topic.id} points to a non-sitemap destination ${targetPath}`);
  }
}

for (const page of KEYWORD_PAGE_ARCHITECTURE.filter((candidate) => targetPaths.has(candidate.targetUrl))) {
  const file = path.join(buildRoot, page.targetUrl.slice(1), 'index.html');
  if (!fs.existsSync(file)) {
    failures.push(`${page.targetUrl}: prerendered document is missing`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const article = articleBody(html, page.targetUrl);
  if (!article) {
    failures.push(`${page.targetUrl}: page-specific article body is missing`);
    continue;
  }

  const visibleArticle = normalize(article);
  const ownership = getKeywordOwnership(page.targetUrl);
  for (const keyword of [ownership.primaryKeyword, ...ownership.secondaryKeywords]) {
    checkedTerms += 1;
    if (!visibleArticle.includes(normalize(keyword))) {
      failures.push(`${page.targetUrl}: approved keyword is missing from visible article copy: ${keyword}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Phase 5 informational content verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Phase 5 content verified: ${checkedTerms} approved keyword terms and ${CAREER_GUIDE_TOPIC_MAP.length} operations-topic pathways are rendered in the information cluster.`);
