#!/usr/bin/env node

// Phase 2 checks the source-of-truth ownership decisions and the actual SEO
// metadata emitted for every indexable route and published blog page.
import fs from 'node:fs';
import path from 'node:path';
import { blogCategoryPath, blogPostPath, getPublishedBlogPostsSorted } from '../src/content/blog/blogRoutes.js';
import { createBlogArchiveMeta, createBlogPostMeta } from '../src/content/blog/blogSeo.js';
import { getBlogCategoryKeywordOwnership, getBlogKeywordOwnership } from '../src/content/seo/blogKeywordOwnership.js';
import { INDIA_LEAD_INTENT_PAGES } from '../src/content/indiaLeadIntentPages.js';
import { INDEXING_MANIFEST_FILE } from '../src/content/seo/indexingSchema.js';
import { INDIA_LEAD_INTENT_PAGE_REGISTER } from '../src/content/seo/indexingPriority.js';
import { SEARCH_INTENT_OWNERS } from '../src/content/seo/searchIntentOwnership.js';
import { KEYWORD_STRATEGY_ROWS } from '../src/seo/keywordMap.js';
import { INTERNAL_LINK_ARCHITECTURE } from '../src/seo/internalLinks.js';
import { createRouteMeta, INDEXABLE_ROUTES, SEO_ROUTES, SITE_ORIGIN } from '../src/seo/seoRoutes.js';
import { loadBlogPosts } from './blog-storage.js';

const failures = [];
const warnings = [];
const secondaryKeywordAdvisories = [];

function normalizeQuery(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function validPath(path) {
  return typeof path === 'string' && /^\/(?:[^?#]*\/)?$/.test(path);
}

function metaValues(meta, predicate) {
  return meta.filter(predicate).map((item) => item.href || item.content);
}

function checkMetadata(page) {
  const expected = `${SITE_ORIGIN}${page.path}`;
  const canonicals = metaValues(page.meta, (item) => item.tagName === 'link' && item.rel === 'canonical');
  const robots = metaValues(page.meta, (item) => item.name === 'robots');
  const openGraphUrls = metaValues(page.meta, (item) => item.property === 'og:url');
  if (canonicals.length !== 1 || canonicals[0] !== expected) {
    failures.push(`${page.path}: expected one self canonical ${expected}; found ${JSON.stringify(canonicals)}`);
  }
  if (robots.length !== 1 || !/^index(?:,|$)/i.test(robots[0])) {
    failures.push(`${page.path}: public page does not emit one indexable robots directive: ${JSON.stringify(robots)}`);
  }
  if (openGraphUrls.length !== 1 || openGraphUrls[0] !== expected) {
    failures.push(`${page.path}: og:url does not match its self canonical: ${JSON.stringify(openGraphUrls)}`);
  }
}

const routeByPath = new Map(SEO_ROUTES.map((route) => [route.path, route]));
const leadPageByPath = new Map(INDIA_LEAD_INTENT_PAGES.map((page) => [page.path, page]));

function linksToOwner(sourcePath, ownerPath) {
  const sourceRoute = routeByPath.get(sourcePath);
  const ownerRoute = routeByPath.get(ownerPath);
  if (sourceRoute && ownerRoute && INTERNAL_LINK_ARCHITECTURE[sourceRoute.id]?.includes(ownerRoute.id)) return true;

  const body = leadPageByPath.get(sourcePath)?.body
    || posts.find((post) => blogPostPath(post.slug) === sourcePath)?.body
    || [];
  return body.some((block) => {
    if (typeof block?.href !== 'string') return false;
    try {
      return new URL(block.href, SITE_ORIGIN).pathname === ownerPath;
    } catch {
      return false;
    }
  });
}

function readOwnerDiscoveryUrls() {
  const sitemapFile = path.resolve('public/sitemap.xml');
  const manifestFile = path.resolve(INDEXING_MANIFEST_FILE);
  let sitemapUrls = new Set();
  let manifestUrls = new Set();
  if (!fs.existsSync(sitemapFile)) failures.push('public/sitemap.xml is missing');
  else {
    const xml = fs.readFileSync(sitemapFile, 'utf8');
    sitemapUrls = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, '&')));
  }
  if (!fs.existsSync(manifestFile)) failures.push(`${INDEXING_MANIFEST_FILE} is missing`);
  else {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      if (!Array.isArray(manifest.urls)) throw new Error('urls must be an array');
      manifestUrls = new Set(manifest.urls.map((entry) => entry.url));
    } catch (error) {
      failures.push(`${INDEXING_MANIFEST_FILE} cannot be read: ${error.message}`);
    }
  }
  return { sitemapUrls, manifestUrls };
}

const posts = getPublishedBlogPostsSorted(loadBlogPosts());
const categories = [...new Set(posts.map((post) => post.category))].sort();
const pages = [
  ...INDEXABLE_ROUTES.map((route) => ({
    path: route.path,
    kind: 'site route',
    primaryKeyword: route.primaryKeyword,
    explicitKeywords: route.keywords || [],
    title: route.title,
    h1: route.h1,
    meta: createRouteMeta(route.id),
  })),
  ...categories.map((category) => ({
    path: blogCategoryPath(category),
    kind: 'blog category',
    primaryKeyword: getBlogCategoryKeywordOwnership(category)?.primaryKeyword,
    explicitKeywords: getBlogCategoryKeywordOwnership(category)?.secondaryKeywords || [],
    title: `${category.replace(/-/g, ' ')} | Centaur Careers Blog`,
    meta: createBlogArchiveMeta(category, posts.filter((post) => post.category === category)),
  })),
  ...posts.map((post) => {
    const ownership = getBlogKeywordOwnership(post);
    return {
      path: blogPostPath(post.slug),
      kind: 'blog article',
      primaryKeyword: ownership?.primaryKeyword,
      explicitKeywords: [...(ownership?.secondaryKeywords || []), ...(post.tags || [])],
      title: post.seo?.title || post.title,
      meta: createBlogPostMeta(post),
    };
  }),
];
const { sitemapUrls, manifestUrls } = readOwnerDiscoveryUrls();

const pageByPath = new Map();
const primaryOwnerByQuery = new Map();
for (const page of pages) {
  const otherPath = pageByPath.get(page.path)?.path;
  if (otherPath) failures.push(`${page.path}: public path is duplicated in the route/blog inventory`);
  else pageByPath.set(page.path, page);

  const query = normalizeQuery(page.primaryKeyword);
  if (!query) failures.push(`${page.path}: missing primary search intent`);
  else if (primaryOwnerByQuery.has(query) && primaryOwnerByQuery.get(query) !== page.path) {
    failures.push(`primary intent "${query}" is claimed by both ${primaryOwnerByQuery.get(query)} and ${page.path}`);
  } else primaryOwnerByQuery.set(query, page.path);

  checkMetadata(page);
}

if (!Array.isArray(SEARCH_INTENT_OWNERS) || SEARCH_INTENT_OWNERS.length === 0) {
  failures.push('SEARCH_INTENT_OWNERS must contain explicit owner decisions');
}

const registeredByQuery = new Map();
const registeredIds = new Set();
for (const entry of SEARCH_INTENT_OWNERS || []) {
  const label = entry?.id || '(missing id)';
  if (typeof entry?.id !== 'string' || !entry.id.trim()) failures.push(`owner entry ${label}: missing id`);
  else if (registeredIds.has(entry.id)) failures.push(`duplicate owner entry id: ${entry.id}`);
  else registeredIds.add(entry.id);

  if (!validPath(entry?.ownerPath)) failures.push(`${label}: invalid canonical ownerPath ${JSON.stringify(entry?.ownerPath)}`);
  const owner = pageByPath.get(entry?.ownerPath);
  if (!owner) {
    const route = SEO_ROUTES.find((candidate) => candidate.path === entry?.ownerPath);
    failures.push(`${label}: ownerPath ${entry?.ownerPath} is ${route ? 'non-indexable' : 'not a published public page'}`);
  }
  if (owner) {
    const canonical = `${SITE_ORIGIN}${entry.ownerPath}`;
    if (!sitemapUrls.has(canonical)) failures.push(`${label}: owner ${entry.ownerPath} is absent from public/sitemap.xml`);
    if (!manifestUrls.has(canonical)) failures.push(`${label}: owner ${entry.ownerPath} is absent from ${INDEXING_MANIFEST_FILE}`);
  }

  const primaryQuery = normalizeQuery(entry?.primaryQuery);
  if (!primaryQuery) failures.push(`${label}: missing primaryQuery`);
  else if (owner && primaryQuery !== normalizeQuery(owner.primaryKeyword)) {
    failures.push(`${label}: primaryQuery "${entry.primaryQuery}" differs from ${entry.ownerPath} primaryKeyword "${owner.primaryKeyword}"`);
  }

  if (entry?.queryVariants !== undefined && !Array.isArray(entry.queryVariants)) {
    failures.push(`${label}: queryVariants must be an array`);
  }
  if (entry?.supportingPaths !== undefined && !Array.isArray(entry.supportingPaths)) {
    failures.push(`${label}: supportingPaths must be an array`);
  }

  for (const phrase of [entry?.primaryQuery, ...(Array.isArray(entry?.queryVariants) ? entry.queryVariants : [])]) {
    const query = normalizeQuery(phrase);
    if (!query) {
      failures.push(`${label}: empty search query or variant`);
      continue;
    }
    const existing = registeredByQuery.get(query);
    if (existing) {
      failures.push(`registered query "${query}" appears more than once: ${existing.id} (${existing.ownerPath}) and ${label} (${entry.ownerPath})`);
    } else registeredByQuery.set(query, entry);

    const otherPrimary = primaryOwnerByQuery.get(query);
    if (otherPrimary && otherPrimary !== entry.ownerPath) {
      failures.push(`registered query "${query}" is assigned to ${entry.ownerPath}, but ${otherPrimary} claims it as a primaryKeyword`);
    }
  }

  const seenSupport = new Set();
  for (const supportPath of Array.isArray(entry?.supportingPaths) ? entry.supportingPaths : []) {
    if (!validPath(supportPath)) failures.push(`${label}: invalid supporting path ${JSON.stringify(supportPath)}`);
    if (supportPath === entry.ownerPath) failures.push(`${label}: owner cannot support itself`);
    if (seenSupport.has(supportPath)) failures.push(`${label}: repeated supporting path ${supportPath}`);
    if (!pageByPath.has(supportPath)) failures.push(`${label}: supporting path is not an indexable published page: ${supportPath}`);
    else if (owner && !linksToOwner(supportPath, entry.ownerPath)) {
      failures.push(`${label}: supporting page ${supportPath} has no source-level internal link to owner ${entry.ownerPath}`);
    }
    seenSupport.add(supportPath);
  }
}

// The 20 India lead criteria are an independent input to the decision. A
// legacy "new-canonical" label cannot silently override the chosen owner.
if (INDIA_LEAD_INTENT_PAGE_REGISTER.length !== 20) {
  failures.push(`expected 20 India lead criteria; found ${INDIA_LEAD_INTENT_PAGE_REGISTER.length}`);
}
for (const criterion of INDIA_LEAD_INTENT_PAGE_REGISTER) {
  const query = normalizeQuery(criterion.primaryKeyword);
  const claim = registeredByQuery.get(query);
  if (!claim) {
    failures.push(`India lead criterion ${criterion.id} has no explicit search-intent owner for "${criterion.primaryKeyword}"`);
    continue;
  }
  if (!Array.isArray(criterion.canonicalPaths) || criterion.canonicalPaths.length !== 1) {
    failures.push(`India lead criterion ${criterion.id} must name exactly one canonical owner path`);
  } else if (criterion.canonicalPaths[0] !== claim.ownerPath) {
    failures.push(`India lead criterion ${criterion.id} points to ${criterion.canonicalPaths[0]}, while search-intent owner is ${claim.ownerPath}`);
  }
  for (const supportPath of criterion.supportingPaths || []) {
    if (!claim.supportingPaths?.includes(supportPath)) {
      failures.push(`India lead criterion ${criterion.id} names supporting page ${supportPath}, missing from owner decision ${claim.id}`);
    }
  }
}

// Exact query claims in explicit metadata can compete even when the page's
// primaryKeyword has been updated. Body text and natural phrasing are omitted.
for (const page of pages) {
  const seenSecondaryQueries = new Set();
  for (const phrase of page.explicitKeywords) {
    const query = normalizeQuery(phrase);
    const claim = registeredByQuery.get(query);
    if (claim && claim.ownerPath !== page.path && !seenSecondaryQueries.has(query)) {
      const message = `${page.path}: secondary keyword or tag "${phrase}" names query owned by ${claim.ownerPath}`;
      if (page.kind === 'site route') failures.push(message);
      else secondaryKeywordAdvisories.push(message);
      seenSecondaryQueries.add(query);
    }
  }
  const normalizedTitle = normalizeQuery(String(page.title || '').replace(/\s*\|\s*Centaur Careers(?: Blog)?\s*$/i, ''));
  const normalizedH1 = normalizeQuery(page.h1);
  for (const [field, query] of [['title', normalizedTitle], ['h1', normalizedH1]]) {
    const claim = registeredByQuery.get(query);
    if (claim && claim.ownerPath !== page.path) {
      failures.push(`${page.path}: ${field} targets "${query}", owned by ${claim.ownerPath}`);
    }
  }
}

// The older 728-keyword workbook is retained for history. Report rows whose
// URL predates a new owner decision so editors can reconcile them separately.
const strategyMismatches = KEYWORD_STRATEGY_ROWS.flatMap((row) => {
  const claim = registeredByQuery.get(normalizeQuery(row.keyword));
  return claim && claim.ownerPath !== row.targetUrl
    ? [`"${row.keyword}": workbook ${row.targetUrl} -> current ${claim.ownerPath}`]
    : [];
});
if (secondaryKeywordAdvisories.length) {
  warnings.push(`${secondaryKeywordAdvisories.length} secondary blog keyword/tag occurrence(s) mention another page's owned query (advisory; these do not claim primary ownership):\n  - ${secondaryKeywordAdvisories.join('\n  - ')}`);
}
if (strategyMismatches.length) {
  warnings.push(`${strategyMismatches.length} legacy workbook assignment(s) differ from the current owner register:\n  - ${strategyMismatches.join('\n  - ')}`);
}

for (const warning of warnings) console.warn(`Intent ownership audit: ${warning}`);
if (failures.length) {
  console.error(`Search-intent ownership check failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Search-intent ownership check passed: ${SEARCH_INTENT_OWNERS.length} decisions, ${registeredByQuery.size} exact queries, ${pages.length} indexable pages, 20 India lead criteria, and ${strategyMismatches.length} historical workbook assignment(s) flagged for review.`);
}
