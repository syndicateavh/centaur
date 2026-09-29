#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES, SEO_ROUTES, SITE_ORIGIN, canonicalUrl } from '../src/seo/seoRoutes.js';
import {
  blogCategoryLabel,
  blogCategoryPath,
  blogPostPath,
  getPublishedBlogPostsSorted,
} from '../src/content/blog/blogRoutes.js';
import { loadBlogPosts } from './blog-storage.js';
import { getExpectedSitemapUrls } from './blog-sitemap.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const currentSiteDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const publishedBlogPosts = getPublishedBlogPostsSorted(loadBlogPosts());
const publishedBlogCategories = [...new Set(publishedBlogPosts.map((post) => post.category))].sort();
const BLOG_ROUTES = [
  ...publishedBlogPosts.map((post) => ({
    id: `blog-post-${post.slug}`,
    parentId: 'blog',
    path: blogPostPath(post.slug),
    title: post.seo.title || post.title,
    description: post.seo.description || post.excerpt,
    h1: post.title,
    breadcrumbLabel: post.title,
    schemaType: 'WebPage',
    indexable: post.seo.noindex !== true,
  })),
  ...publishedBlogCategories.map((category) => ({
    id: `blog-category-${category}`,
    parentId: 'blog',
    path: blogCategoryPath(category),
    title: `${blogCategoryLabel(category)} | Centaur Careers Blog`,
    description: `Centaur Careers articles and resources about ${blogCategoryLabel(category).toLowerCase()}.`,
    h1: `${blogCategoryLabel(category)} articles`,
    breadcrumbLabel: blogCategoryLabel(category),
    schemaType: 'CollectionPage',
    indexable: true,
  })),
  ...(!publishedBlogCategories.includes('industry-updates') ? [{
    id: 'blog-category-industry-updates',
    parentId: 'blog',
    path: blogCategoryPath('industry-updates'),
    title: `${blogCategoryLabel('industry-updates')} | Centaur Careers Blog`,
    description: 'Dated, primary-source-led explainers about relevant finance industry developments.',
    h1: 'Finance Industry Updates',
    breadcrumbLabel: blogCategoryLabel('industry-updates'),
    schemaType: 'CollectionPage',
    indexable: false,
  }] : []),
];
const PUBLIC_ROUTES = [...SEO_ROUTES, ...BLOG_ROUTES];
const INDEXABLE_PUBLIC_ROUTES = [...INDEXABLE_ROUTES, ...BLOG_ROUTES.filter((route) => route.indexable)];
const routePaths = new Map(PUBLIC_ROUTES.map((route) => [route.path, route]));
const canonicalOrigin = new URL(SITE_ORIGIN);

function fail(message) {
  failures.push(message);
}

function outputFileForRoute(route) {
  if (route.path === '/') return path.join(buildRoot, 'index.html');
  return path.join(buildRoot, route.path.slice(1), 'index.html');
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

function readRouteHtml(route) {
  const outputFile = outputFileForRoute(route);
  if (!fs.existsSync(outputFile)) {
    fail(route.path + ': missing ' + path.relative(process.cwd(), outputFile));
    return null;
  }

  return fs.readFileSync(outputFile, 'utf8');
}

function parseJsonLd(route, html) {
  const matches = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];

  if (route.indexable && matches.length === 0) {
    fail(route.path + ': indexable route has no JSON-LD block');
  }

  if (!route.indexable && matches.length > 0) {
    fail(route.path + ': noindex route must not publish JSON-LD');
  }

  const graphs = [];
  for (const [index, match] of matches.entries()) {
    try {
      const schema = JSON.parse(match[1].trim());
      if (schema['@context'] !== 'https://schema.org') {
        fail(route.path + ': JSON-LD block ' + (index + 1) + ' has an unexpected @context');
      }
      if (!Array.isArray(schema['@graph'])) {
        fail(route.path + ': JSON-LD block ' + (index + 1) + ' is missing @graph');
        continue;
      }
      graphs.push(schema['@graph']);
    } catch (error) {
      fail(route.path + ': JSON-LD block ' + (index + 1) + ' is not valid JSON (' + error.message + ')');
    }
  }

  const graph = graphs.flat();
  const ids = new Set();
  for (const entity of graph) {
    if (!entity || typeof entity !== 'object') continue;
    if (entity['@id']) {
      if (ids.has(entity['@id'])) {
        fail(route.path + ': duplicate JSON-LD @id ' + entity['@id']);
      }
      ids.add(entity['@id']);
    }
  }

  if (!route.indexable) return;

  const expectedPageId = canonicalUrl(route) + '#webpage';
  const page = graph.find((entity) => entity?.['@id'] === expectedPageId);
  if (!page) {
    fail(route.path + ': JSON-LD is missing its WebPage entity');
  } else if (page.url !== canonicalUrl(route)) {
    fail(route.path + ': JSON-LD WebPage URL does not match its canonical URL');
  }

  if (!graph.some((entity) => entity?.['@id'] === SITE_ORIGIN + '/#organization')) {
    fail(route.path + ': JSON-LD is missing the shared organization entity');
  }

  if (!graph.some((entity) => entity?.['@id'] === SITE_ORIGIN + '/#website')) {
    fail(route.path + ': JSON-LD is missing the shared WebSite entity');
  }

  if (route.path !== '/' && !graph.some((entity) => entity?.['@type'] === 'BreadcrumbList')) {
    fail(route.path + ': JSON-LD is missing BreadcrumbList data');
  }
}

function checkInternalLinks(route, html) {
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => decodeHtml(match[1]));

  for (const href of hrefs) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

    let target;
    try {
      target = new URL(href, SITE_ORIGIN);
    } catch {
      fail(route.path + ': invalid link URL ' + href);
      continue;
    }

    if (target.origin !== canonicalOrigin.origin) continue;
    if (target.hash) continue;

    const targetRoute = routePaths.get(target.pathname);
    if (!targetRoute) {
      const assetPath = resolveBuiltAsset(target.pathname);
      if (assetPath && fs.existsSync(assetPath) && fs.statSync(assetPath).isFile()) continue;
      fail(route.path + ': internal link does not match a registered route: ' + href);
      continue;
    }

    if (target.pathname !== targetRoute.path) {
      fail(route.path + ': internal link is not canonical: ' + href + '; expected ' + targetRoute.path);
    }
  }
}

function resolveBuiltAsset(pathname) {
  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname).replace(/^\/+/, '');
  } catch {
    return null;
  }

  const candidate = path.resolve(buildRoot, relativePath);
  const relativeToBuild = path.relative(buildRoot, candidate);
  if (!relativeToBuild || relativeToBuild.startsWith('..') || path.isAbsolute(relativeToBuild)) return null;
  return candidate;
}

function checkNoLocalhostReferences(route, html) {
  if (/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|horizons-cdn\.hostinger\.com)/i.test(html)) {
    fail(route.path + ': rendered HTML contains a local, preview, or blocked CDN reference');
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^()|[\]\\]/g, '\\$&');
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function validateXmlStructure(xml) {
  const tokenPattern = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<\/?[A-Za-z_][\w:.-]*(?:\s+[^<>]*?)?\/?>|[^<]+/g;
  const stack = [];
  let rootName = null;
  let declarationSeen = false;
  let cursor = 0;

  for (const match of xml.matchAll(tokenPattern)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > cursor && xml.slice(cursor, start).trim()) {
      fail('sitemap.xml: malformed XML near character ' + cursor);
    }
    cursor = start + token.length;

    if (token.startsWith('<?')) {
      if (declarationSeen || start !== 0 || !/^<\?xml\s+[^?]+\?>$/i.test(token)) {
        fail('sitemap.xml: invalid XML declaration');
      }
      declarationSeen = true;
      continue;
    }

    if (token.startsWith('<!--') || token.startsWith('<![CDATA[')) continue;
    if (!token.startsWith('<')) {
      if (!stack.length && token.trim()) fail('sitemap.xml: text is outside the document root');
      continue;
    }

    if (token.startsWith('</')) {
      const closingName = token.match(/^<\/([A-Za-z_][\w:.-]*)\s*>$/)?.[1];
      if (!closingName || stack.at(-1) !== closingName) {
        fail('sitemap.xml: mismatched closing tag ' + token);
      } else {
        stack.pop();
      }
      continue;
    }

    const openingMatch = token.match(/^<([A-Za-z_][\w:.-]*)(?:\s+[^<>]*?)?(\/?)>$/);
    if (!openingMatch) {
      fail('sitemap.xml: malformed tag ' + token);
      continue;
    }

    const [, openingName, selfClosing] = openingMatch;
    if (!stack.length) {
      if (rootName) fail('sitemap.xml: multiple document roots are present');
      rootName = openingName;
    }
    if (!selfClosing) stack.push(openingName);
  }

  if (cursor < xml.length && xml.slice(cursor).trim()) fail('sitemap.xml: malformed XML at the end of the file');
  if (stack.length) fail('sitemap.xml: unclosed XML tag ' + stack.at(-1));
  if (rootName !== 'urlset') fail('sitemap.xml: root element must be urlset');

  const rootOpen = xml.match(/<urlset\b[^>]*>/i)?.[0] || '';
  if (!/\bxmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/i.test(rootOpen)) {
    fail('sitemap.xml: urlset namespace is missing or invalid');
  }
}

function checkRobots() {
  const robotsPath = path.resolve('public/robots.txt');
  if (!fs.existsSync(robotsPath)) {
    fail('public/robots.txt is missing');
    return;
  }

  const robots = fs.readFileSync(robotsPath, 'utf8');
  const expectedSitemap = canonicalOrigin.origin + '/sitemap.xml';
  const directives = robots
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  for (const directive of directives) {
    if (!/^(?:User-agent|Allow|Disallow|Sitemap|Host|Crawl-delay):\s*\S.*$/i.test(directive)) {
      fail('robots.txt: invalid directive ' + directive);
    }
  }

  if (!/^User-agent:\s*\*\s*$/mi.test(robots)) fail('robots.txt: wildcard user-agent rule is missing');
  if (!/^Allow:\s*\/\s*$/mi.test(robots)) fail('robots.txt: public Allow: / rule is missing');
  const sitemapReferences = robots.match(/^Sitemap:\s*\S+\s*$/gim) || [];
  if (sitemapReferences.length !== 1 || !new RegExp('^Sitemap:\\s*' + escapeRegExp(expectedSitemap) + '\\s*$', 'mi').test(robots)) {
    fail('robots.txt: sitemap must be ' + expectedSitemap);
  }
  for (const crawler of ['Googlebot', 'Google-Extended', 'GoogleOther', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'Applebot-Extended']) {
    if (!new RegExp('User-agent:\\s*' + crawler + '[\\s\\S]*?Allow:\\s*\\/', 'i').test(robots)) {
      fail('robots.txt: ' + crawler + ' must be explicitly allowed');
    }
  }
  if (/^Disallow:\s*\S/mi.test(robots)) fail('robots.txt: no crawler may be blocked');
}

function checkSitemap() {
  const sitemapPath = path.resolve('public/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    fail('public/sitemap.xml is missing');
    return;
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  validateXmlStructure(sitemap);

  const urlBlocks = [...sitemap.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map((match) => match[1]);
  const locations = [];
  for (const [index, block] of urlBlocks.entries()) {
    const childTags = [...block.matchAll(/<\/?([A-Za-z_][\w:.-]*)\b[^>]*>/g)].map((match) => match[1].toLowerCase());
    if (childTags.some((tag) => !['loc', 'lastmod'].includes(tag))) {
      fail('sitemap.xml: url ' + (index + 1) + ' contains an unsupported child element');
    }

    const blockLocations = [...block.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
    const lastmods = [...block.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/gi)].map((match) => match[1].trim());
    if (blockLocations.length !== 1) fail('sitemap.xml: each url must contain exactly one loc');
    if (lastmods.length > 1) fail('sitemap.xml: each url may contain at most one lastmod');
    locations.push(...blockLocations);

    const lastmod = lastmods[0];
    if (!lastmod) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
      fail('sitemap.xml: invalid lastmod ' + lastmod + ' for ' + (blockLocations[0] || 'unknown URL'));
      continue;
    }
    const lastmodTime = Date.parse(lastmod + 'T00:00:00Z');
    if (Number.isNaN(lastmodTime) || lastmod > currentSiteDate) {
      fail('sitemap.xml: lastmod is invalid or in the future for ' + (blockLocations[0] || 'unknown URL'));
    }
  }

  const expectedLocations = getExpectedSitemapUrls();
  if (urlBlocks.length !== expectedLocations.length) {
    fail('sitemap.xml: expected ' + expectedLocations.length + ' url elements, found ' + urlBlocks.length);
  }

  if (locations.length !== expectedLocations.length) {
    fail('sitemap.xml: expected ' + expectedLocations.length + ' locations, found ' + locations.length);
  }

  if (new Set(locations).size !== locations.length) {
    fail('sitemap.xml: duplicate locations are present');
  }

  for (const location of locations) {
    let parsed;
    try {
      parsed = new URL(location);
    } catch {
      fail('sitemap.xml: invalid URL ' + location);
      continue;
    }

    if (parsed.origin !== canonicalOrigin.origin || parsed.search || parsed.hash) {
      fail('sitemap.xml: non-canonical URL ' + location);
    }

    if (!expectedLocations.includes(location)) {
      fail('sitemap.xml: URL is not an indexable canonical route ' + location);
    }
  }

  for (const expectedLocation of expectedLocations) {
    if (!locations.includes(expectedLocation)) {
      fail('sitemap.xml: missing ' + expectedLocation);
    }
  }

}

if (canonicalOrigin.protocol !== 'https:' || canonicalOrigin.hostname.startsWith('www.') || canonicalOrigin.pathname !== '/' || canonicalOrigin.search || canonicalOrigin.hash) {
  fail('SITE_ORIGIN is not a canonical HTTPS origin: ' + SITE_ORIGIN);
}

const inboundLinks = new Map(INDEXABLE_PUBLIC_ROUTES.map((route) => [route.path, new Set()]));

for (const route of PUBLIC_ROUTES) {
  const html = readRouteHtml(route);
  if (!html) continue;

  const decodedHtml = decodeHtml(html);
  checkNoLocalhostReferences(route, decodedHtml);
  parseJsonLd(route, decodedHtml);
  checkInternalLinks(route, decodedHtml);

  const hrefs = [...decodedHtml.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1]);
  for (const href of hrefs) {
    let target;
    try {
      target = new URL(href, SITE_ORIGIN);
    } catch {
      continue;
    }
    const targetRoute = inboundLinks.get(target.pathname);
    if (targetRoute && target.pathname !== route.path) targetRoute.add(route.path);
  }
}

for (const [routePath, sources] of inboundLinks.entries()) {
  if (routePath !== '/' && sources.size === 0) {
    fail(routePath + ': no inbound internal link from another indexable route');
  }
}

checkRobots();
checkSitemap();

if (failures.length > 0) {
  console.error('Technical SEO verification failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log('Technical SEO verified: ' + INDEXABLE_PUBLIC_ROUTES.length + ' canonical indexable routes, including published blog routes, valid robots.txt, sitemap, JSON-LD, internal links, and no orphan public routes.');
