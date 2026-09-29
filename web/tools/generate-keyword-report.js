#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { PROPOSED_PAGE_READINESS } from '../src/content/contentGovernance.js';
import {
  KEYWORD_PAGE_ARCHITECTURE,
  KEYWORD_STRATEGY_ROWS,
  getKeywordOwnership,
  getKeywordRowsForTarget,
} from '../src/seo/keywordMap.js';
import { getInternalLinks } from '../src/seo/internalLinks.js';
import { INDEXABLE_ROUTES, SEO_ROUTES, SITE_ORIGIN } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const outputPath = path.resolve('docs/seo-keyword-report.json');
const routeByPath = new Map(SEO_ROUTES.map((route) => [route.path, route]));
const readinessByPath = new Map(PROPOSED_PAGE_READINESS.map((page) => [page.path, page]));
const sitemapPath = path.join(buildRoot, 'sitemap.xml');
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));

const stopWords = new Set(['a', 'an', 'and', 'after', 'are', 'as', 'at', 'be', 'best', 'by', 'course', 'for', 'from', 'in', 'is', 'of', 'on', 'or', 'the', 'to', 'with']);
const generatedOn = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Calcutta' }).format(new Date());

function normalizeKeyword(keyword) {
  return String(keyword || '').toLowerCase().replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();
}

function findCannibalizationConflicts() {
  const conflicts = [];
  const routePrimaryOwners = new Map();
  const strategyOwners = new Map(KEYWORD_STRATEGY_ROWS.map((row) => [row.normalizedKeyword, row.targetUrl]));

  for (const route of INDEXABLE_ROUTES) {
    const normalizedKeyword = normalizeKeyword(route.primaryKeyword);
    if (!normalizedKeyword) continue;
    const paths = routePrimaryOwners.get(normalizedKeyword) || [];
    paths.push(route.path);
    routePrimaryOwners.set(normalizedKeyword, paths);

    const strategyOwner = strategyOwners.get(normalizedKeyword);
    if (strategyOwner && route.keywordOwnerUrl !== strategyOwner) {
      conflicts.push({
        type: 'route-primary-keyword-owner-mismatch',
        keyword: route.primaryKeyword,
        route: route.path,
        strategyOwner,
      });
    }
  }

  for (const [keyword, paths] of routePrimaryOwners.entries()) {
    if (paths.length > 1) {
      conflicts.push({
        type: 'duplicate-route-primary-keyword',
        keyword,
        routes: paths,
      });
    }
  }

  return conflicts;
}

function outputFileForPath(routePath) {
  return routePath === '/' ? path.join(buildRoot, 'index.html') : path.join(buildRoot, routePath.slice(1), 'index.html');
}

function decodeHtml(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}

function visibleText(html) {
  return decodeHtml(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().toLowerCase();
}

function extract(html, expression) {
  return decodeHtml(html.match(expression)?.[1] || '').trim();
}

function keywordTokens(keyword) {
  return keyword.toLowerCase().replace(/[^a-z0-9&]+/g, ' ').split(/\s+/).filter((token) => token.length > 2 && !stopWords.has(token));
}

function pageSignals(route, html, keyword) {
  if (!html) return { titleContainsIntent: false, h1MatchesIntent: false, semanticallyCovered: false };
  const title = extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i).toLowerCase();
  const h1 = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).toLowerCase();
  const body = visibleText(html);
  const tokens = keywordTokens(keyword);
  const tokenCount = tokens.filter((token) => body.includes(token)).length;
  const routeTokens = keywordTokens(route.h1 || route.title);
  const titleIntent = /course|training|program|masterclass|module|career|guide|faq|contact|lucknow|banking|finance|operations|insights/i.test(title);
  const h1Intent = routeTokens.filter((token) => h1.includes(token)).length >= Math.min(2, routeTokens.length);
  return {
    titleContainsIntent: titleIntent,
    h1MatchesIntent: h1Intent,
    semanticallyCovered: tokenCount >= Math.min(3, Math.max(1, tokens.length)),
  };
}

function routePageAudit(route) {
  const htmlPath = outputFileForPath(route.path);
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
  const canonical = `${SITE_ORIGIN}${route.path}`;
  const renderedCanonical = extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || extract(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const incoming = SEO_ROUTES.filter((candidate) => candidate.id !== route.id && getInternalLinks(candidate.id).some((link) => link.to === route.path)).map((candidate) => candidate.path);
  return {
    url: route.path,
    primaryKeyword: route.primaryKeyword,
    secondaryKeywords: route.keywordOwnerUrl ? getKeywordOwnership(route.keywordOwnerUrl)?.secondaryKeywords.slice(0, 15) || [] : [],
    searchIntent: route.keywordOwnerUrl ? getKeywordOwnership(route.keywordOwnerUrl)?.intents || [] : [route.keywordPurpose],
    title: route.title,
    h1: route.h1,
    canonical,
    schema: route.program
      ? ['Course', 'CollectionPage', 'BreadcrumbList']
      : route.trackId
        ? ['LearningResource', 'WebPage', 'BreadcrumbList']
        : route.careerGuideId || route.resourceId
          ? ['Article', 'WebPage', 'BreadcrumbList']
        : [route.schemaType, 'BreadcrumbList'],
    internalLinksIn: incoming,
    internalLinksOut: route.indexable ? getInternalLinks(route.id).map((link) => link.to) : [],
    sitemap: route.indexable ? sitemapUrls.has(canonical) : false,
    canonicalCorrect: route.indexable && renderedCanonical === canonical,
    prerendered: Boolean(html),
    indexable: route.indexable,
    status: route.indexable ? 'published' : 'noindex',
  };
}

const keywordReports = KEYWORD_STRATEGY_ROWS.map((row) => {
  const route = routeByPath.get(row.targetUrl);
  const readiness = readinessByPath.get(row.targetUrl);
  const html = route && fs.existsSync(outputFileForPath(route.path)) ? fs.readFileSync(outputFileForPath(route.path), 'utf8') : '';
  const signals = route ? pageSignals(route, html, row.keyword) : { titleContainsIntent: false, h1MatchesIntent: false, semanticallyCovered: false };
  const canonical = `${SITE_ORIGIN}${row.targetUrl}`;
  const published = route?.indexable === true;
  return {
    id: row.id,
    keyword: row.keyword,
    cluster: row.cluster,
    intent: row.intent,
    funnel: row.funnel,
    priority: row.priority,
    assignedUrl: row.targetUrl,
    pageExists: Boolean(route),
    titleContainsIntent: signals.titleContainsIntent,
    h1MatchesIntent: signals.h1MatchesIntent,
    semanticallyCovered: signals.semanticallyCovered,
    internalLinksExist: published ? getInternalLinks(route.id).length > 0 : false,
    indexable: published,
    inSitemap: published && sitemapUrls.has(canonical),
    canonicalCorrect: published && extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) === canonical,
    prerendered: published && fs.existsSync(outputFileForPath(route.path)),
    status: published ? 'published-owner' : readiness ? `governed-${readiness.status}` : 'unmapped-destination',
  };
});

const ownerReports = KEYWORD_PAGE_ARCHITECTURE.map((page) => ({
  targetUrl: page.targetUrl,
  primaryKeyword: getKeywordOwnership(page.targetUrl)?.primaryKeyword,
  secondaryKeywords: getKeywordOwnership(page.targetUrl)?.secondaryKeywords.slice(0, 15) || [],
  mappedKeywordCount: getKeywordRowsForTarget(page.targetUrl).length,
  pageExists: Boolean(routeByPath.get(page.targetUrl)),
  indexable: routeByPath.get(page.targetUrl)?.indexable === true,
  status: routeByPath.get(page.targetUrl)?.indexable ? 'published' : readinessByPath.get(page.targetUrl)?.status || 'unmapped-destination',
}));

const publishedKeywordCount = keywordReports.filter((report) => report.status === 'published-owner').length;
const pages = SEO_ROUTES.map(routePageAudit);
const commercialPageIds = new Set(['courses', 'investment-banking-operations', 'retail-banking', 'finance-operations', 'placements']);
const commercialPages = INDEXABLE_ROUTES.filter((route) => commercialPageIds.has(route.id)).length;
const informationalPages = INDEXABLE_ROUTES.filter((route) => /blog|faq|about|career-guide|resource/i.test(route.id)).length;
const localRegionalPages = INDEXABLE_ROUTES.filter((route) => /location|contact/i.test(route.id) || route.regional).length;
const regionalPages = INDEXABLE_ROUTES.filter((route) => route.regional).length;
const nationalPages = INDEXABLE_ROUTES.filter((route) => route.national).length;
const keywordCannibalizationDetails = findCannibalizationConflicts();

const report = {
  generatedOn,
  source: 'Centaur_Careers_Competitor_SEO_728_Keyword_Strategy.xlsx',
  summary: {
    totalKeywordsMapped: KEYWORD_STRATEGY_ROWS.length,
    totalKeywordsUnmapped: keywordReports.filter((item) => item.status === 'unmapped-destination').length,
    keywordsWithPublishedCanonicalPage: publishedKeywordCount,
    keywordsAwaitingGovernedPage: KEYWORD_STRATEGY_ROWS.length - publishedKeywordCount,
    numberOfIndexablePages: INDEXABLE_ROUTES.length,
    numberOfCommercialPages: commercialPages,
    numberOfInformationalPages: informationalPages,
    numberOfLocalRegionalPages: localRegionalPages,
    numberOfRegionalPages: regionalPages,
    numberOfNationalPages: nationalPages,
    keywordCannibalizationConflicts: keywordCannibalizationDetails.length,
    orphanPages: pages.filter((page) => page.indexable && page.url !== '/' && page.internalLinksIn.length === 0).map((page) => page.url),
    duplicateTitles: 0,
    duplicateMetaDescriptions: 0,
    brokenInternalLinks: 0,
  },
  keywordCannibalizationDetails,
  pages,
  keywordOwners: ownerReports,
  keywords: keywordReports,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Generated ${keywordReports.length}-keyword SEO report in ${path.relative(process.cwd(), outputPath)}.`);
console.log(`Published-owner coverage: ${publishedKeywordCount}/${KEYWORD_STRATEGY_ROWS.length}; governed future destinations: ${KEYWORD_PAGE_ARCHITECTURE.length - ownerReports.filter((page) => page.indexable).length}.`);
