#!/usr/bin/env node

import { INDEXABLE_ROUTES, SITE_ORIGIN, canonicalUrl } from '../src/seo/seoRoutes.js';
import {
  blogCategoryLabel,
  blogCategoryPath,
  blogPostPath,
  getPublishedBlogPostsSorted,
} from '../src/content/blog/blogRoutes.js';
import { loadBlogPosts } from './blog-storage.js';

const requestedOrigin = process.argv[2] || SITE_ORIGIN;
const expectedOrigin = process.env.SEO_EXPECTED_ORIGIN || SITE_ORIGIN;
const timeoutMs = Number(process.env.SEO_EXTERNAL_TIMEOUT_MS || 15000);
// The live host rate-limits the verification burst; pace read-only checks like a crawler.
const requestDelayMs = Number(process.env.SEO_EXTERNAL_DELAY_MS ?? 750);
const failures = [];
const REQUIRED_CRAWLERS = ['Googlebot', 'Google-Extended', 'GoogleOther', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'Applebot-Extended'];
const publishedBlogPosts = getPublishedBlogPostsSorted(loadBlogPosts());
const publishedBlogCategories = [...new Set(publishedBlogPosts.map((post) => post.category))].sort();
const BLOG_ROUTES = [
  ...publishedBlogPosts.map((post) => ({
    id: `blog-post-${post.slug}`,
    path: blogPostPath(post.slug),
    title: post.seo.title || post.title,
    description: post.seo.description || post.excerpt,
    h1: post.title,
  })),
  ...publishedBlogCategories.map((category) => ({
    id: `blog-category-${category}`,
    path: blogCategoryPath(category),
    title: `${blogCategoryLabel(category)} | Centaur Careers Blog`,
    description: `Centaur Careers articles and resources about ${blogCategoryLabel(category).toLowerCase()}.`,
    h1: `${blogCategoryLabel(category)} articles`,
  })),
];
const INDEXABLE_PUBLIC_ROUTES = [...INDEXABLE_ROUTES, ...BLOG_ROUTES];

function fail(message) {
  failures.push(message);
}

async function paceRequests() {
  if (requestDelayMs > 0) await new Promise((resolve) => setTimeout(resolve, requestDelayMs));
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

function normalizeOrigin(value, label) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute HTTP(S) URL: ${value}`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${label} must use HTTP or HTTPS: ${value}`);
  }

  return parsed.origin;
}

function urlFor(origin, pathname) {
  return new URL(pathname, `${origin}/`).toString();
}

async function fetchText(origin, pathname, headers = {}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(urlFor(origin, pathname), {
        headers,
        redirect: 'manual',
        signal: controller.signal,
      });
      const body = await response.text();
      if (response.status !== 429 || attempt === 2) return { response, body };

      const retryAfter = Number(response.headers.get('retry-after'));
      const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 5000)
        : (attempt + 1) * 2000;
      console.warn(`Rate limited on ${pathname}; retrying after ${delayMs} ms.`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Too many rate-limited responses for ${pathname}`);
}

function checkRouteResponse(route, response, body, label) {
  const decodedBody = decodeHtml(body);
  const prefix = `${label} ${route.path}`;

  if (response.status !== 200) {
    fail(`${prefix}: expected HTTP 200, received ${response.status}`);
    return;
  }
  if (!response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
    fail(`${prefix}: response is not HTML (${response.headers.get('content-type') || 'missing content type'})`);
  }
  if (!decodedBody.includes(`<title>${route.title}</title>`)) fail(`${prefix}: title does not match the route registry`);
  if (!decodedBody.includes(`name="description" content="${route.description}"`)) {
    fail(`${prefix}: meta description does not match the route registry`);
  }
  if (!decodedBody.includes(`name="robots" content="index,follow"`)) fail(`${prefix}: index,follow is missing`);
  if (!decodedBody.includes(`rel="canonical" href="${canonicalUrl(route)}"`)) {
    fail(`${prefix}: canonical URL is missing or incorrect`);
  }
  if (!decodedBody.includes(`<h1>${route.h1}</h1>`) && !decodedBody.includes(route.h1)) {
    fail(`${prefix}: registered H1 text is missing`);
  }
  if (!decodedBody.includes('<main')) fail(`${prefix}: main content is missing`);
  if (!/<a\b[^>]*\bhref="(?:\/|https:\/\/[^"/]+\/)/i.test(decodedBody)) {
    fail(`${prefix}: no crawlable link was found in the response`);
  }
  if (/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|horizons-cdn\.hostinger\.com)/i.test(decodedBody)) {
    fail(`${prefix}: response contains a local, preview, or blocked CDN reference`);
  }

  const jsonLdBlocks = [...decodedBody.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (jsonLdBlocks.length === 0) {
    fail(`${prefix}: JSON-LD is missing`);
  } else {
    for (const [index, match] of jsonLdBlocks.entries()) {
      try {
        JSON.parse(match[1].trim());
      } catch (error) {
        fail(`${prefix}: JSON-LD block ${index + 1} is invalid (${error.message})`);
      }
    }
  }
}

async function checkPublicRoutes(origin) {
  for (const route of INDEXABLE_PUBLIC_ROUTES) {
    try {
      const { response, body } = await fetchText(origin, route.path, {
        'User-Agent': 'Centaur-SEO-External-Verification/1.0',
      });
      checkRouteResponse(route, response, body, 'browser');
    } catch (error) {
      fail(`browser ${route.path}: request failed (${error.message})`);
    }
    await paceRequests();
  }
}

async function checkCrawlerRoutes(origin) {
  const crawlerUserAgents = [
    ['Googlebot', 'Googlebot/2.1 (+http://www.google.com/bot.html)'],
    ['Bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'],
    ['OAI-SearchBot', 'OAI-SearchBot/1.0; +https://openai.com/searchbot'],
    ['PerplexityBot', 'PerplexityBot/1.0; +https://www.perplexity.ai/perplexitybot'],
    ['GPTBot', 'GPTBot/1.0; +https://openai.com/gptbot'],
    ['Claude-SearchBot', 'Claude-SearchBot'],
    ['Claude-User', 'Claude-User'],
  ];
  const home = INDEXABLE_ROUTES[0];

  for (const [crawlerName, userAgent] of crawlerUserAgents) {
    try {
      const { response, body } = await fetchText(origin, home.path, { 'User-Agent': userAgent });
      checkRouteResponse(home, response, body, crawlerName);
    } catch (error) {
      fail(`${crawlerName} ${home.path}: request failed (${error.message})`);
    }
    await paceRequests();
  }
}

async function checkRobots(origin, expected) {
  try {
    const { response, body } = await fetchText(origin, '/robots.txt');
    if (response.status !== 200) fail(`robots.txt: expected HTTP 200, received ${response.status}`);
    if (!/^User-agent:\s*\*\s*$/mi.test(body)) fail('robots.txt: wildcard user-agent rule is missing');
    if (!/^Allow:\s*\/\s*$/mi.test(body)) fail('robots.txt: public Allow: / rule is missing');
    if (!new RegExp('^Sitemap:\\s*' + expected.replace(/[.*+?^()|[\]\\]/g, '\\$&') + '\\s*$', 'mi').test(body)) {
      fail('robots.txt: canonical sitemap reference is missing');
    }
    for (const crawler of REQUIRED_CRAWLERS) {
      if (!new RegExp('User-agent:\\s*' + crawler + '[\\s\\S]*?Allow:\\s*\\/', 'i').test(body)) {
        fail(`robots.txt: ${crawler} must be explicitly allowed`);
      }
    }
    if (/^Disallow:\s*\S/mi.test(body)) fail('robots.txt: no crawler may be blocked');
  } catch (error) {
    fail(`robots.txt: request failed (${error.message})`);
  }
}

async function checkSitemap(origin, expected) {
  try {
    const { response, body } = await fetchText(origin, '/sitemap.xml');
    if (response.status !== 200) fail(`sitemap.xml: expected HTTP 200, received ${response.status}`);
    if (!/<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/i.test(body)) {
      fail('sitemap.xml: urlset namespace is missing or invalid');
    }

    const locations = [...body.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeHtml(match[1].trim()));
    const expectedLocations = [
      ...INDEXABLE_ROUTES.map(canonicalUrl),
      ...BLOG_ROUTES.map((route) => `${SITE_ORIGIN}${route.path}`),
    ].map((value) => value.replace(SITE_ORIGIN, expected));
    if (locations.length !== expectedLocations.length) {
      fail(`sitemap.xml: expected ${expectedLocations.length} URLs, found ${locations.length}`);
    }
    if (new Set(locations).size !== locations.length) fail('sitemap.xml: duplicate URLs are present');
    for (const location of expectedLocations) {
      if (!locations.includes(location)) fail(`sitemap.xml: missing ${location}`);
    }
    for (const location of locations) {
      if (!expectedLocations.includes(location)) fail(`sitemap.xml: unexpected URL ${location}`);
    }
  } catch (error) {
    fail(`sitemap.xml: request failed (${error.message})`);
  }
}

async function checkNotFound(origin) {
  const missingPath = '/__centaur-external-seo-missing-check__/';
  try {
    const { response, body } = await fetchText(origin, missingPath, {
      'User-Agent': 'Centaur-SEO-External-Verification/1.0',
    });
    if (response.status !== 404) fail(`${missingPath}: expected HTTP 404, received ${response.status}`);
    if (!/name="robots" content="noindex,follow"/i.test(body)) {
      fail(`${missingPath}: noindex,follow is missing from the 404 response`);
    }
  } catch (error) {
    fail(`${missingPath}: request failed (${error.message})`);
  }
}

async function checkCanonicalRedirects(origin, expected) {
  const expectedUrl = `${expected}/courses/`;
  const expectedHost = new URL(expected).hostname;
  const redirectTargets = [
    ['HTTP', `http://${expectedHost}/courses/`],
    ['www', `https://www.${expectedHost}/courses/`],
  ];

  for (const [label, target] of redirectTargets) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(target, { redirect: 'manual', signal: controller.signal });
      clearTimeout(timeout);
      const location = response.headers.get('location');
      if (![301, 302, 307, 308].includes(response.status)) {
        fail(`${label} redirect: expected a redirect to ${expectedUrl}, received ${response.status}`);
      } else if (location && new URL(location, target).toString() !== expectedUrl) {
        fail(`${label} redirect: expected ${expectedUrl}, received ${location}`);
      }
    } catch (error) {
      fail(`${label} redirect: request failed (${error.message})`);
    }
  }
}

let requestOrigin;
let expectedCanonicalOrigin;
try {
  requestOrigin = normalizeOrigin(requestedOrigin, 'request origin');
  expectedCanonicalOrigin = normalizeOrigin(expectedOrigin, 'expected origin');
} catch (error) {
  console.error(`External SEO verification could not start: ${error.message}`);
  process.exit(1);
}

console.log(`External SEO verification target: ${requestOrigin}`);
console.log(`Expected canonical origin: ${expectedCanonicalOrigin}`);
console.log('This verifies deployed HTTP/HTML behavior only; it does not prove indexing or Search Console status.');

await checkPublicRoutes(requestOrigin);
await checkCrawlerRoutes(requestOrigin);
await checkRobots(requestOrigin, `${expectedCanonicalOrigin}/sitemap.xml`);
await checkSitemap(requestOrigin, expectedCanonicalOrigin);
await checkNotFound(requestOrigin);
if (new URL(expectedCanonicalOrigin).protocol === 'https:' && new URL(expectedCanonicalOrigin).hostname !== 'localhost') {
  await checkCanonicalRedirects(requestOrigin, expectedCanonicalOrigin);
}

if (failures.length > 0) {
  console.error(`External SEO verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`External SEO verification passed: ${INDEXABLE_PUBLIC_ROUTES.length} indexable routes, robots.txt, sitemap.xml, crawler responses, redirects, and 404 behavior matched the configured contract.`);
