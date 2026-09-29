#!/usr/bin/env node

// Public HTTP evidence only. Google index status comes from URL Inspection.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { SITE_ORIGIN } from '../src/seo/siteConfig.js';
import {
  INDEXING_MANIFEST_FILE,
  normalizeIndexingUrl,
  validateIndexingManifest,
} from '../src/content/seo/indexingSchema.js';
import { INDEXING_PRIORITY_PATHS } from '../src/content/seo/indexingPriority.js';

const OUTPUT_FILE = 'data/seo/indexing/public-checks/latest.json';
const timeoutMs = Number(process.env.SEO_PUBLIC_CHECK_TIMEOUT_MS || 15000);
const requestDelayMs = Number(process.env.SEO_PUBLIC_CHECK_DELAY_MS ?? 500);

function parseArguments(args) {
  const options = { all: false, urls: [], limit: null, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--all') options.all = true;
    else if (argument === '--url') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--url requires a canonical site URL or path');
      options.urls.push(value);
      index += 1;
    } else if (argument === '--limit') {
      const value = Number(args[index + 1]);
      if (!Number.isInteger(value) || value <= 0) throw new Error('--limit requires a positive integer');
      options.limit = value;
      index += 1;
    } else if (argument === '--help') options.help = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (options.all && options.urls.length > 0) throw new Error('Use --all or --url, not both');
  return options;
}

function decodeHtml(value) {
  return String(value || '').replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
}

function attributes(tag) {
  const result = new Map();
  for (const match of tag.matchAll(/([a-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    result.set(match[1].toLowerCase(), decodeHtml(match[2] ?? match[3] ?? match[4]));
  }
  return result;
}

function canonicalLinks(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => attributes(match[0]))
    .filter((attrs) => (attrs.get('rel') || '').toLowerCase().split(/\s+/).includes('canonical'))
    .map((attrs) => attrs.get('href') || '');
}

function hasMetaNoindex(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => attributes(match[0]))
    .some((attrs) => ['robots', 'googlebot'].includes((attrs.get('name') || '').toLowerCase())
      && /(?:^|[,\s])noindex(?:$|[,\s])/i.test(attrs.get('content') || ''));
}

function parseRobotsGroups(text) {
  const groups = [];
  let agents = [];
  let rules = [];
  function flush() {
    if (agents.length > 0) groups.push({ agents, rules });
    agents = [];
    rules = [];
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split('#')[0].trim();
    const match = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!match) continue;
    const directive = match[1].toLowerCase();
    const value = match[2].trim();
    if (directive === 'user-agent') {
      if (rules.length > 0) flush();
      agents.push(value.toLowerCase());
    } else if (directive === 'allow' || directive === 'disallow') {
      if (agents.length > 0) rules.push({ directive, value });
    }
  }
  flush();
  return groups;
}

function googlebotAllowed(robotsText, pathname) {
  const groups = parseRobotsGroups(robotsText);
  const matched = groups.map((group) => ({
    ...group,
    specificity: group.agents.includes('googlebot') ? 9 : group.agents.includes('*') ? 0 : -1,
  })).filter((group) => group.specificity >= 0);
  if (matched.length === 0) return true;
  const highestSpecificity = Math.max(...matched.map((group) => group.specificity));
  const rules = matched.filter((group) => group.specificity === highestSpecificity).flatMap((group) => group.rules);
  const matching = rules.filter((rule) => {
    if (!rule.value) return false;
    const anchored = rule.value.endsWith('$');
    const pattern = (anchored ? rule.value.slice(0, -1) : rule.value)
      .replace(/[|\\{}()[\]^$+?.]/g, '\\$&').replaceAll('*', '.*');
    return new RegExp(`^${pattern}${anchored ? '$' : ''}`).test(pathname);
  });
  if (matching.length === 0) return true;
  matching.sort((left, right) => {
    const lengthDifference = right.value.replaceAll('*', '').length - left.value.replaceAll('*', '').length;
    return lengthDifference || (left.directive === 'allow' ? -1 : 1);
  });
  return matching[0].directive === 'allow';
}

async function fetchText(url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Centaur-SEO-Public-Indexability-Check/1.0' },
        redirect: 'manual',
        signal: controller.signal,
      });
      const body = await response.text();
      if (response.status !== 429 || attempt === 2) return { response, body };
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 2000));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`Rate limited repeatedly while fetching ${url}`);
}

async function fetchSiteFile(url) {
  try {
    const { response, body } = await fetchText(url);
    return { httpStatus: response.status, body, error: null };
  } catch (error) {
    return { httpStatus: null, body: null, error: error.message };
  }
}

async function checkPage(url, liveSitemapUrls, robotsText) {
  const issues = [];
  const sitemapped = liveSitemapUrls ? liveSitemapUrls.has(url) : null;
  if (sitemapped === false) issues.push('URL absent from live sitemap');
  if (sitemapped === null) issues.push('Live sitemap unavailable');
  const robotsAllowed = robotsText === null ? null : googlebotAllowed(robotsText, new URL(url).pathname);
  if (robotsAllowed === false) issues.push('Googlebot disallowed by live robots.txt');
  if (robotsAllowed === null) issues.push('Live robots.txt unavailable');

  try {
    const { response, body } = await fetchText(url);
    const contentType = response.headers.get('content-type');
    const canonicals = canonicalLinks(body);
    const canonical = canonicals.length === 1 ? new URL(canonicals[0], url).toString() : null;
    const metaNoindex = hasMetaNoindex(body);
    const headerNoindex = /(?:^|[,\s])noindex(?:$|[,\s])/i.test(response.headers.get('x-robots-tag') || '');
    const renderedH1 = /<h1\b/i.test(body);
    const renderedMain = /<main\b/i.test(body);
    if (response.status !== 200) issues.push(`HTTP ${response.status}`);
    if (!contentType?.toLowerCase().includes('text/html')) issues.push(`Non-HTML response: ${contentType || 'missing content type'}`);
    if (canonicals.length !== 1 || !canonicals[0]) issues.push(`Expected one nonempty canonical link, found ${canonicals.length}`);
    else if (canonical !== url) issues.push(`Canonical points to ${canonical}`);
    if (metaNoindex) issues.push('Meta robots noindex');
    if (headerNoindex) issues.push('X-Robots-Tag noindex');
    if (!renderedH1 || !renderedMain) issues.push('Rendered HTML is missing an H1 or main element');
    return {
      url,
      status: issues.length === 0 ? 'public_fetchable' : 'needs_review',
      sitemapped,
      robotsAllowed,
      httpStatus: response.status,
      contentType,
      redirectLocation: response.headers.get('location'),
      canonical,
      metaNoindex,
      headerNoindex,
      renderedH1,
      renderedMain,
      issues,
    };
  } catch (error) {
    issues.push(`Request failed: ${error.message}`);
    return { url, status: 'request_error', sitemapped, robotsAllowed, httpStatus: null, issues };
  }
}

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  console.log('Usage: node tools/check-public-indexability.js [--all | --url /courses/] [--limit 5]');
  console.log('Default scope is the priority queue. This checks public HTTP evidence only, never Google index status.');
  process.exit(0);
}
const manifest = JSON.parse(fs.readFileSync(path.resolve(INDEXING_MANIFEST_FILE), 'utf8'));
const manifestErrors = validateIndexingManifest(manifest);
if (manifestErrors.length > 0) throw new Error(`Indexing manifest is invalid:\n- ${manifestErrors.join('\n- ')}`);
const manifestUrls = new Set(manifest.urls.map((entry) => entry.url));
const manifestFingerprint = createHash('sha256').update([...manifestUrls].sort().join('\n')).digest('hex');
let selectedUrls = options.all
  ? manifest.urls.map((entry) => entry.url)
  : options.urls.length > 0
    ? options.urls.map((value) => normalizeIndexingUrl(value))
    : INDEXING_PRIORITY_PATHS.map((value) => normalizeIndexingUrl(value));
selectedUrls = [...new Set(selectedUrls)];
const unknownUrls = selectedUrls.filter((url) => !manifestUrls.has(url));
if (unknownUrls.length > 0) throw new Error(`Requested URL is not in the current manifest: ${unknownUrls.join(', ')}`);
if (options.limit) selectedUrls = selectedUrls.slice(0, options.limit);

const robots = await fetchSiteFile(`${SITE_ORIGIN}/robots.txt`);
const sitemap = await fetchSiteFile(`${SITE_ORIGIN}/sitemap.xml`);
const robotsText = robots.httpStatus === 200 ? robots.body : null;
const liveSitemapUrls = sitemap.httpStatus === 200
  ? new Set([...sitemap.body.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeHtml(match[1].trim())))
  : null;
const records = [];
for (const url of selectedUrls) {
  records.push(await checkPage(url, liveSitemapUrls, robotsText));
  if (requestDelayMs > 0) await new Promise((resolve) => setTimeout(resolve, requestDelayMs));
}
const counts = records.reduce((result, record) => {
  result[record.status] = (result[record.status] || 0) + 1;
  return result;
}, {});
const snapshot = {
  source: 'Public HTTP check; not Google Search Console',
  checkedAt: new Date().toISOString(),
  siteOrigin: SITE_ORIGIN,
  scope: options.all ? 'all' : options.urls.length > 0 ? 'requested' : 'priority',
  manifestUrlCount: manifest.urlCount,
  manifestFingerprint,
  selectedUrlCount: selectedUrls.length,
  robots: { httpStatus: robots.httpStatus, error: robots.error, googlebotRulesAvailable: robotsText !== null },
  liveSitemap: {
    httpStatus: sitemap.httpStatus,
    error: sitemap.error,
    urlCount: liveSitemapUrls?.size ?? null,
    repositoryOnlyUrls: liveSitemapUrls ? [...manifestUrls].filter((url) => !liveSitemapUrls.has(url)) : null,
    liveOnlyUrls: liveSitemapUrls ? [...liveSitemapUrls].filter((url) => !manifestUrls.has(url)) : null,
  },
  summary: counts,
  records,
};
const outputPath = path.resolve(OUTPUT_FILE);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
console.log(`Public indexability check: ${records.length} URL(s), ${counts.public_fetchable || 0} fetchable, ${counts.needs_review || 0} needing review, ${counts.request_error || 0} request errors.`);
console.log(`Live sitemap: ${liveSitemapUrls?.size ?? 'unavailable'} URLs; repository manifest: ${manifest.urlCount} URLs.`);
console.log(`Evidence saved to ${path.relative(process.cwd(), outputPath)}. This does not establish Google indexing.`);
for (const record of records.filter((entry) => entry.status !== 'public_fetchable')) {
  console.log(`- ${record.url}: ${record.issues.join('; ')}`);
}
if (records.some((record) => record.status !== 'public_fetchable')) process.exitCode = 1;
