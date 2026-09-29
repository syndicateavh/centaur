#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { PROPOSED_PAGE_READINESS } from '../src/content/contentGovernance.js';
import {
  KEYWORD_PAGE_ARCHITECTURE,
  KEYWORD_STRATEGY_SOURCE,
  getKeywordOwnership,
  getKeywordRowsForTarget,
} from '../src/seo/keywordMap.js';
import { getInternalLinks } from '../src/seo/internalLinks.js';
import { SEO_ROUTES, SITE_ORIGIN } from '../src/seo/seoRoutes.js';

const outputPath = path.resolve('docs/seo-keyword-content-briefs.json');
const generatedOn = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Calcutta' }).format(new Date());
const routeByPath = new Map(SEO_ROUTES.map((route) => [route.path, route]));
const readinessByPath = new Map(PROPOSED_PAGE_READINESS.map((page) => [page.path, page]));

function titleCase(value) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

function recommendedTitle(targetUrl, primaryKeyword, route) {
  if (route) return route.title;
  if (targetUrl.includes('/career-guides/')) return `${titleCase(primaryKeyword)} | Centaur Careers`;
  if (targetUrl.includes('/india/')) return `${titleCase(primaryKeyword)} | Centaur Careers`;
  return `${titleCase(primaryKeyword)} | Centaur Careers`;
}

function recommendedH1(targetUrl, primaryKeyword, route) {
  if (route) return route.h1;
  if (targetUrl.includes('/career-guides/')) return titleCase(primaryKeyword);
  if (targetUrl.includes('/india/')) return titleCase(primaryKeyword);
  return titleCase(primaryKeyword);
}

function schemaFor(targetUrl, route, pageType) {
  if (route?.program || targetUrl === '/courses/') return ['Course', 'CollectionPage', 'BreadcrumbList'];
  if (pageType.toLowerCase().includes('faq')) return ['FAQPage', 'WebPage', 'BreadcrumbList'];
  if (pageType.toLowerCase().includes('module')) return ['LearningResource', 'WebPage', 'BreadcrumbList'];
  if (pageType.toLowerCase().includes('career') || pageType.toLowerCase().includes('guide') || targetUrl.includes('/resources/')) {
    return ['Article', 'WebPage', 'BreadcrumbList'];
  }
  return ['WebPage', 'BreadcrumbList'];
}

function outlineFor(targetUrl, primaryKeyword, pageType) {
  if (targetUrl === '/courses/') return [
    'Financial Operations Masterclass overview',
    'Who the program is designed for',
    'Modules and practical learning outcomes',
    'Learning modes, duration, and fees',
    'Career paths and placement assistance',
    'Frequently asked program questions',
  ];
  if (targetUrl.includes('/locations/')) return [
    `${titleCase(primaryKeyword)}: local access and training context`,
    'Verified location, directions, and offline availability',
    'What students can learn through the program',
    'Local student FAQs and contact options',
  ];
  if (pageType.toLowerCase().includes('comparison')) return [
    'How to compare finance career programs',
    'Curriculum, duration, fees, and learning mode',
    'Placement assistance and evidence standards',
    'Questions to ask before enrolling',
  ];
  if (pageType.toLowerCase().includes('resource')) return [
    'Interview preparation overview',
    'Role and workflow questions',
    'Answer framework and practical examples',
    'Common preparation mistakes',
    'Next steps for structured training',
  ];
  return [
    `${titleCase(primaryKeyword)} explained`,
    'Key roles, workflows, and skills',
    'Career pathways for graduates and freshers',
    'Practical questions and examples',
    'How the Financial Operations Masterclass relates to this topic',
  ];
}

function faqTopics(rows) {
  return rows
    .filter((row) => /\b(what|how|can|which|is|does|should|difference|salary|fees|duration)\b/i.test(row.keyword))
    .slice(0, 6)
    .map((row) => row.keyword);
}

const briefs = KEYWORD_PAGE_ARCHITECTURE.map((page) => {
  const route = routeByPath.get(page.targetUrl);
  const readiness = readinessByPath.get(page.targetUrl);
  const ownership = getKeywordOwnership(page.targetUrl);
  const rows = getKeywordRowsForTarget(page.targetUrl);
  const outgoing = new Set(route ? getInternalLinks(route.id).map((link) => link.to) : []);
  if (page.targetUrl !== '/courses/') outgoing.add('/courses/');
  if (page.targetUrl.includes('/locations/')) outgoing.add('/contact/');
  if (page.targetUrl.includes('/career-guides/') || page.targetUrl.includes('/resources/')) outgoing.add('/courses/');
  const incoming = SEO_ROUTES
    .filter((candidate) => candidate.id !== route?.id)
    .filter((candidate) => getInternalLinks(candidate.id).some((link) => link.to === page.targetUrl))
    .map((candidate) => candidate.path);
  const recommendedIncoming = incoming.length > 0
    ? incoming
    : page.targetUrl === '/courses/' ? ['/'] : ['/courses/'];

  return {
    targetUrl: page.targetUrl,
    canonical: `${SITE_ORIGIN}${page.targetUrl}`,
    primaryKeyword: ownership.primaryKeyword,
    secondaryKeywords: ownership.secondaryKeywords.slice(0, 15),
    mappedKeywordCount: rows.length,
    searchIntent: ownership.intents,
    funnelStages: [...new Set(rows.map((row) => row.funnel))],
    competitors: [...new Set(rows.flatMap((row) => row.competitors.split(',').map((value) => value.trim()).filter(Boolean)))],
    title: recommendedTitle(page.targetUrl, ownership.primaryKeyword, route),
    h1: recommendedH1(page.targetUrl, ownership.primaryKeyword, route),
    h2Outline: outlineFor(page.targetUrl, ownership.primaryKeyword, page.pageType),
    faqTopics: faqTopics(rows),
    incomingInternalLinks: incoming,
    recommendedIncomingInternalLinks: recommendedIncoming,
    outgoingInternalLinks: [...outgoing],
    schema: schemaFor(page.targetUrl, route, page.pageType),
    contentGaps: readiness?.requirements || ['Preserve original copy and add only verified, genuinely useful supporting material.'],
    pageType: page.pageType,
    pageAction: rows[0].pageAction,
    wave: page.recommendedWave,
    status: route?.indexable ? 'published' : readiness?.status || 'not-governed',
    indexable: route?.indexable === true,
    inSitemap: route?.indexable === true,
    prerendered: route?.indexable === true,
  };
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({
  source: KEYWORD_STRATEGY_SOURCE,
  generatedOn,
  briefs,
}, null, 2)}\n`, 'utf8');
console.log(`Generated ${briefs.length} keyword content briefs in ${path.relative(process.cwd(), outputPath)}.`);
