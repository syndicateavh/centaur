#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { CAREER_GUIDE_HUB, CAREER_GUIDES } from '../src/content/careerGuides.js';
import { getInternalLinks } from '../src/seo/internalLinks.js';
import { getSeoRoute, SEO_ROUTES } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const routeByPath = new Map(SEO_ROUTES.map((route) => [route.path, route]));

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
    fail(`${publicPath}: prerendered output is missing`);
    return '';
  }
  return decodeHtml(fs.readFileSync(filePath, 'utf8'));
}

function requireText(publicPath, html, text) {
  if (!html.includes(text)) fail(`${publicPath}: rendered content is missing ${text}`);
}

function requireLink(publicPath, html, href) {
  if (!html.includes(`href="${href}"`)) fail(`${publicPath}: rendered link is missing ${href}`);
}

function verifyMetadata(publicPath, html, route) {
  requireText(publicPath, html, `<title>${route.title}</title>`);
  requireText(publicPath, html, `name="description" content="${route.description}"`);
  requireText(publicPath, html, `rel="canonical" href="https://centaurcareers.in${route.path}"`);
  requireText(publicPath, html, 'name="robots" content="index,follow"');
  requireText(publicPath, html, `<h1 id="${route.id}-page-title"`);
  requireText(publicPath, html, route.h1);
  requireText(publicPath, html, 'aria-label="Breadcrumb"');
}

const hubRoute = getSeoRoute('career-guides');
const hubHtml = readPage(CAREER_GUIDE_HUB.path);
if (!hubRoute.indexable) fail(`${CAREER_GUIDE_HUB.path}: career-guide hub must be indexable`);
verifyMetadata(CAREER_GUIDE_HUB.path, hubHtml, hubRoute);
requireText(CAREER_GUIDE_HUB.path, hubHtml, 'data-career-guide-cluster="hub"');
for (const guide of CAREER_GUIDES) requireLink(CAREER_GUIDE_HUB.path, hubHtml, guide.path);
for (const link of getInternalLinks('career-guides')) requireLink(CAREER_GUIDE_HUB.path, hubHtml, link.to);
if (!hubHtml.includes('"@type":"CollectionPage"') && !hubHtml.includes('"@type": "CollectionPage"')) {
  fail(`${CAREER_GUIDE_HUB.path}: CollectionPage structured data is missing`);
}

for (const guide of CAREER_GUIDES) {
  const route = getSeoRoute(guide.routeId);
  const html = readPage(guide.path);
  verifyMetadata(guide.path, html, route);
  requireText(guide.path, html, `data-career-guide="${guide.id}"`);
  requireText(guide.path, html, guide.author.name);
  requireText(guide.path, html, guide.author.role);
  requireText(guide.path, html, 'Updated');
  requireText(guide.path, html, guide.updatedAt);
  requireText(guide.path, html, guide.body[0].text);
  requireText(guide.path, html, guide.h1);
  requireText(guide.path, html, 'data-career-guide-related');
  requireText(guide.path, html, '"@type":"Article"');
  requireText(guide.path, html, `"@id":"https://centaurcareers.in${guide.path}#article"`);
  requireText(guide.path, html, `"datePublished":"${guide.publishedAt}T00:00:00Z"`);
  requireText(guide.path, html, `"dateModified":"${guide.updatedAt}T00:00:00Z"`);
  requireText(guide.path, html, `"@id":"https://centaurcareers.in/about/#${guide.author.id}"`);

  for (const relatedGuideId of guide.relatedGuideIds) {
    const relatedGuide = CAREER_GUIDES.find((candidate) => candidate.id === relatedGuideId);
    if (!relatedGuide) {
      fail(`${guide.path}: related guide is unknown: ${relatedGuideId}`);
      continue;
    }
    requireLink(guide.path, html, relatedGuide.path);
  }

  for (const link of getInternalLinks(guide.routeId)) requireLink(guide.path, html, link.to);
  for (const routeId of guide.relatedRouteIds) {
    const relatedRoute = SEO_ROUTES.find((candidate) => candidate.id === routeId);
    if (!relatedRoute) fail(`${guide.path}: related route is unknown: ${routeId}`);
  }

  const programPositioning = html.match(/<section\b(?=[^>]*data-role-program-positioning)[^>]*>[\s\S]*?<\/section>/i)?.[0] || '';
  if (programPositioning && (!programPositioning.includes('/placements/#job-guarantee-terms') || !programPositioning.includes('does not guarantee a job specifically'))) {
    fail(`${guide.path}: program positioning must state the role limit and link to written terms`);
  }
  const jobIntentTerms = html.match(/<h2\b[^>]*>How the full program guarantee applies<\/h2>[\s\S]*?<a\b[^>]*href="\/placements\/#job-guarantee-terms"[^>]*>[^<]*<\/a>/i)?.[0] || '';
  if (html.includes('How the full program guarantee applies') && (!jobIntentTerms || !jobIntentTerms.includes('not a separately guaranteed course or vacancy'))) {
    fail(`${guide.path}: job-intent section must limit the claim and link to written terms`);
  }
  const claimNeutralHtml = html
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, '')
    .replace(programPositioning, '')
    .replace(jobIntentTerms, '')
    .replace(/100%\s+Job Guarantee/gi, '');
  if (/(?:placement|job)\s+guarantee|guaranteed\s+(?:placement|job|interview)|typical\s+salary|average\s+salary/i.test(claimNeutralHtml)) {
    fail(`${guide.path}: guide contains unsupported guarantee or salary language`);
  }
  if (html.includes('"@type":"BlogPosting"') || html.includes('"@type": "BlogPosting"')) {
    fail(`${guide.path}: career guide must use Article schema, not BlogPosting schema`);
  }
}

for (const guide of CAREER_GUIDES) {
  if (!routeByPath.has(guide.path)) fail(`${guide.path}: guide path is not registered in SEO routes`);
}

if (failures.length > 0) {
  console.error(`Career-guide cluster verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Career-guide cluster verified: ${CAREER_GUIDES.length} authored guides plus the hub have metadata, direct answers, author/date signals, Article schema, related-guide links, program context, and no unsupported guarantee variants or salary language.`);
