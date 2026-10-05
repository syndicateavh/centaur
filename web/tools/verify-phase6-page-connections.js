#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { CAREER_TRACKS } from '../src/content/sourceContent.js';
import { getCourseModulePath } from '../src/content/courseModulePaths.js';
import { ROLE_INTENTS } from '../src/content/roleIntent.js';
import { KEYWORD_PAGE_ARCHITECTURE } from '../src/content/seo/keywordStrategy.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { INTERNAL_LINK_ARCHITECTURE } from '../src/seo/internalLinks.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const routesById = new Map(INDEXABLE_ROUTES.map((route) => [route.id, route]));
const routesByPath = new Map(INDEXABLE_ROUTES.map((route) => [route.path, route]));
const moduleTracks = CAREER_TRACKS.filter((track) => getCourseModulePath(track.id));
const phase5Paths = [
  '/courses/kyc-aml/',
  '/career-guides/choosing-finance-career-course/',
  '/best-finance-course-in-pune/',
  '/best-finance-course-in-hyderabad/',
  '/courses/digital-payments/',
  '/career-guides/fintech-operations/',
  '/courses/fintech/',
];

function fail(message) {
  failures.push(message);
}

function routeHtml(route) {
  const outputPath = route.path === '/'
    ? path.join(buildRoot, 'index.html')
    : path.join(buildRoot, route.path.slice(1), 'index.html');
  if (!fs.existsSync(outputPath)) {
    fail(`${route.path}: prerendered page is missing`);
    return '';
  }
  return fs.readFileSync(outputPath, 'utf8');
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

function textFromHtml(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function sectionContent(html, attribute, value) {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const marker = new RegExp(`<section\\b(?=[^>]*\\b${attribute}="${escapedValue}")[^>]*>([\\s\\S]*?)<\\/section>`, 'i');
  return html.match(marker)?.[1] || '';
}

function anchorsIn(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
    href: decodeHtml(match[1].match(/\bhref="([^"]+)"/i)?.[1] || ''),
    text: textFromHtml(match[2]),
  }));
}

function checkHubModuleLinks() {
  const homeRoute = routesById.get('home');
  const coursesRoute = routesById.get('courses');
  const indiaRoute = routesById.get('india');
  if (!homeRoute || !coursesRoute || !indiaRoute) {
    fail('homepage, Courses hub, or India hub route is not indexable');
    return;
  }

  const homeHtml = routeHtml(homeRoute);
  const courseHtml = routeHtml(coursesRoute);
  const indiaHtml = routeHtml(indiaRoute);
  const homeCards = anchorsIn(sectionContent(homeHtml, 'data-home-section', 'career-tracks'));
  const courseCards = anchorsIn(sectionContent(courseHtml, 'data-commercial-section', 'program-modules'));
  const indiaCards = anchorsIn(sectionContent(indiaHtml, 'data-national-page', 'india'));

  for (const track of moduleTracks) {
    const modulePath = getCourseModulePath(track.id);
    const homeLink = homeCards.find((anchor) => anchor.href === modulePath);
    if (!homeLink || !homeLink.text.includes(track.title)) fail(`homepage career-track card does not link directly to ${track.title} (${modulePath})`);

    const courseLink = courseCards.find((anchor) => anchor.href === modulePath);
    if (!courseLink || !courseLink.text.includes('module guide')) fail(`Courses hub does not render a descriptive module-guide link for ${track.title} (${modulePath})`);

    const indiaLink = indiaCards.find((anchor) => anchor.href === modulePath);
    if (!indiaLink || !indiaLink.text.includes(track.title)) fail(`India hub topic card does not link directly to ${track.title} (${modulePath})`);
  }
}

function checkTopicGraph() {
  const requiredEdges = [
    ['courses', 'kyc-aml-compliance'],
    ['courses', 'digital-payments'],
    ['courses', 'fintech-neo-banking'],
    ['india', 'kyc-aml-compliance'],
    ['india', 'digital-payments'],
    ['india', 'fintech-neo-banking'],
    ['career-guide-kyc-aml-analyst', 'kyc-aml-compliance'],
    ['career-guide-digital-payments-operations', 'digital-payments'],
    ['career-guide-fintech-operations', 'fintech-neo-banking'],
    ['kyc-aml-compliance', 'career-guide-kyc-aml-analyst'],
    ['digital-payments', 'career-guide-digital-payments-operations'],
    ['fintech-neo-banking', 'career-guide-fintech-operations'],
  ];

  for (const [sourceId, targetId] of requiredEdges) {
    if (!routesById.has(sourceId) || !routesById.has(targetId)) {
      fail(`topic connection references a non-indexable route: ${sourceId} -> ${targetId}`);
      continue;
    }
    if (!INTERNAL_LINK_ARCHITECTURE[sourceId]?.includes(targetId)) {
      fail(`topic connection is missing from the registered internal-link graph: ${sourceId} -> ${targetId}`);
      continue;
    }

    const sourceHtml = routeHtml(routesById.get(sourceId));
    const targetPath = routesById.get(targetId).path;
    const relatedGroup = sourceHtml.match(/<nav\b(?=[^>]*\baria-label="Related pages")(?=[^>]*\bdata-internal-link-group)[^>]*>([\s\S]*?)<\/nav>/i)?.[1] || '';
    const renderedLink = anchorsIn(relatedGroup).some((anchor) => anchor.href === targetPath);
    if (!renderedLink) fail(`${routesById.get(sourceId).path}: registered topic connection to ${targetPath} is not rendered`);
  }
}

function checkRolePathways() {
  const rolePathways = [
    { routeId: 'career-guide-kyc-aml-analyst', intentId: 'kyc-aml-analyst-role', targetPath: '/courses/kyc-aml/' },
    { routeId: 'career-guide-digital-payments-operations', intentId: 'digital-payments-operations-role', targetPath: '/courses/digital-payments/' },
    { routeId: 'career-guide-fintech-operations', intentId: 'fintech-operations-role', targetPath: '/courses/fintech/' },
  ];

  for (const expected of rolePathways) {
    const route = routesById.get(expected.routeId);
    const intent = ROLE_INTENTS.find((candidate) => candidate.id === expected.intentId);
    if (!route || !intent) {
      fail(`role pathway is missing its route or intent: ${expected.intentId}`);
      continue;
    }
    if (intent.coursePath !== expected.targetPath || !/Masterclass module/i.test(intent.coursePathLabel)) {
      fail(`${expected.intentId}: course next-step must point to its module guide and identify it as a Masterclass module`);
    }

    const html = routeHtml(route);
    const pathwayHtml = html.match(new RegExp(`<section\\b(?=[^>]*\\bdata-role-intent-pathway="${expected.intentId}")[^>]*>([\\s\\S]*?)<\\/section>`, 'i'))?.[1] || '';
    if (!pathwayHtml) {
      fail(`${route.path}: rendered role-intent pathway ${expected.intentId} is missing`);
      continue;
    }
    const link = anchorsIn(pathwayHtml).find((anchor) => anchor.href === expected.targetPath);
    if (!link || !link.text.includes(intent.coursePathLabel)) fail(`${route.path}: role-intent pathway does not render the labelled module link to ${expected.targetPath}`);
  }
}

function checkPublishedKeywordDestinations() {
  const missing = KEYWORD_PAGE_ARCHITECTURE.filter((page) => !routesByPath.has(page.targetUrl));
  for (const page of missing) fail(`approved keyword destination is not an indexable published route: ${page.targetUrl}`);

  for (const pagePath of phase5Paths) {
    const route = routesByPath.get(pagePath);
    if (!route) {
      fail(`Phase 5 destination is not indexable: ${pagePath}`);
      continue;
    }
    const inbound = INDEXABLE_ROUTES.filter((source) => INTERNAL_LINK_ARCHITECTURE[source.id]?.includes(route.id));
    if (inbound.length === 0) fail(`${pagePath}: no registered internal page links point to this published destination`);
    routeHtml(route);
  }
}

checkHubModuleLinks();
checkTopicGraph();
checkRolePathways();
checkPublishedKeywordDestinations();

if (failures.length > 0) {
  console.error(`Phase 6 page-connection verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Phase 6 connections verified: ${moduleTracks.length} module pages linked from the home, Courses, and India hubs; reciprocal topical paths rendered; ${phase5Paths.length} Phase 5 destinations reachable; all ${KEYWORD_PAGE_ARCHITECTURE.length} approved keyword destinations indexable.`);
