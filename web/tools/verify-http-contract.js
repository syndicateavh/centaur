#!/usr/bin/env node

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { once } from 'node:events';
import { INDEXABLE_ROUTES, canonicalUrl } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const canonicalHost = 'centaurcareers.in';
const failures = [];
const crawlerUserAgents = [
  ['Googlebot', 'Googlebot/2.1 (+http://www.google.com/bot.html)'],
  ['Bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'],
  ['OAI-SearchBot', 'OAI-SearchBot/1.0; +https://openai.com/searchbot'],
  ['PerplexityBot', 'PerplexityBot/1.0; +https://www.perplexity.ai/perplexitybot'],
  ['GPTBot', 'GPTBot/1.0; +https://openai.com/gptbot'],
  ['Claude-SearchBot', 'Claude-SearchBot'],
  ['Claude-User', 'Claude-User'],
];

function safeBuildPath(pathname) {
  const relativePath = decodeURIComponent(pathname).replace(/^\/+/, '');
  const resolved = path.resolve(buildRoot, relativePath);
  return resolved.startsWith(buildRoot) ? resolved : null;
}

function serveFile(response, filePath, status = 200) {
  const extension = path.extname(filePath).toLowerCase();
  const types = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.xml': 'application/xml; charset=utf-8',
  };
  response.writeHead(status, { 'Content-Type': types[extension] || 'application/octet-stream' });
  response.end(fs.readFileSync(filePath));
}

const server = http.createServer((request, response) => {
  const host = (request.headers['x-test-host'] || request.headers.host || '').split(':')[0].toLowerCase();
  const protocol = request.headers['x-forwarded-proto'] || 'http';
  const requestUrl = new URL(request.url, `http://${host || canonicalHost}`);
  const isProductionHost = host === canonicalHost || host === `www.${canonicalHost}`;

  if (isProductionHost && /^\/financial-operations-masterclass\/?$/.test(requestUrl.pathname)) {
    response.writeHead(301, { Location: `https://${canonicalHost}/courses/${requestUrl.search}` });
    response.end();
    return;
  }

  if (isProductionHost && !requestUrl.pathname.endsWith('/') && !path.extname(requestUrl.pathname)) {
    response.writeHead(301, { Location: `https://${canonicalHost}${requestUrl.pathname}/${requestUrl.search}` });
    response.end();
    return;
  }

  if (isProductionHost && (protocol !== 'https' || host !== canonicalHost)) {
    response.writeHead(301, { Location: `https://${canonicalHost}${requestUrl.pathname}${requestUrl.search}` });
    response.end();
    return;
  }

  const candidate = safeBuildPath(requestUrl.pathname);
  if (candidate) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      if (!requestUrl.pathname.endsWith('/')) {
        response.writeHead(301, { Location: `https://${canonicalHost}${requestUrl.pathname}/${requestUrl.search}` });
        response.end();
        return;
      }
      const indexFile = path.join(candidate, 'index.html');
      if (fs.existsSync(indexFile)) {
        serveFile(response, indexFile);
        return;
      }
    } else if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      serveFile(response, candidate);
      return;
    }
  }

  serveFile(response, path.join(buildRoot, '404', 'index.html'), 404);
});

server.listen(0, '127.0.0.1');
await once(server, 'listening');
const { port } = server.address();

async function request(pathname, { host = canonicalHost, protocol = 'https', redirect = 'manual', headers = {} } = {}) {
  return fetch(`http://127.0.0.1:${port}${pathname}`, {
    headers: { 'X-Test-Host': host, 'X-Forwarded-Proto': protocol, ...headers },
    redirect,
  });
}

function checkIndexableResponse(route, body, crawlerName) {
  const prefix = crawlerName ? `${crawlerName} ${route.path}` : route.path;
  const decodedBody = body
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
  if (!decodedBody.includes(`<title>${route.title}</title>`)) failures.push(`${prefix}: title is missing or changed`);
  if (!decodedBody.includes(`name="robots" content="index,follow"`)) failures.push(`${prefix}: indexable robots directive is missing or changed`);
  if (!decodedBody.includes(`rel="canonical" href="${canonicalUrl(route)}"`)) {
    failures.push(`${prefix}: canonical URL is missing or changed`);
  }
  if (!/<a\b[^>]*\bhref="(?:\/|https:\/\/centaurcareers\.in\/)/i.test(decodedBody)) {
    failures.push(`${prefix}: response body has no internal link`);
  }
}

try {
  for (const route of INDEXABLE_ROUTES) {
    const response = await request(route.path);
    const body = await response.text();
    if (response.status !== 200) failures.push(`${route.path}: expected 200, received ${response.status}`);
    if (!body.includes('<h1')) failures.push(`${route.path}: response body has no H1`);
    checkIndexableResponse(route, body);
  }

  for (const [crawlerName, userAgent] of crawlerUserAgents) {
    for (const route of INDEXABLE_ROUTES) {
      const response = await request(route.path, { headers: { 'User-Agent': userAgent } });
      const body = await response.text();
      if (response.status !== 200) failures.push(`${crawlerName} ${route.path}: expected 200, received ${response.status}`);
      if (!body.includes('<h1')) failures.push(`${crawlerName} ${route.path}: response body has no H1`);
      checkIndexableResponse(route, body, crawlerName);
    }
  }

  const robotsResponse = await request('/robots.txt');
  const robotsBody = await robotsResponse.text();
  if (robotsResponse.status !== 200) failures.push(`robots.txt: expected 200, received ${robotsResponse.status}`);
  if (!robotsBody.includes('Sitemap: https://centaurcareers.in/sitemap.xml')) {
    failures.push('robots.txt: canonical sitemap reference is missing');
  }
  for (const crawler of ['Googlebot', 'Google-Extended', 'GoogleOther', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'Applebot-Extended']) {
    if (!new RegExp('User-agent:\\s*' + crawler + '[\\s\\S]*?Allow:\\s*\\/', 'i').test(robotsBody)) {
      failures.push(`robots.txt: ${crawler} must be allowed`);
    }
  }
  if (/^Disallow:\s*\S/mi.test(robotsBody)) failures.push('robots.txt: no crawler may be blocked');

  const redirects = [
    await request('/courses/?utm_source=seo', { host: `www.${canonicalHost}` }),
    await request('/courses/?utm_source=seo', { protocol: 'http' }),
    await request('/courses/?utm_source=seo', { host: `www.${canonicalHost}`, protocol: 'http' }),
  ];
  for (const response of redirects) {
    if (response.status !== 301) failures.push(`canonical redirect: expected 301, received ${response.status}`);
    if (response.headers.get('location') !== `https://${canonicalHost}/courses/?utm_source=seo`) {
      failures.push(`canonical redirect: path or query was not preserved (${response.headers.get('location')})`);
    }
  }

  const slashRedirect = await request('/courses');
  if (slashRedirect.status !== 301 || slashRedirect.headers.get('location') !== `https://${canonicalHost}/courses/`) {
    failures.push('trailing slash: /courses did not redirect to the canonical /courses/ URL');
  }

  for (const options of [
    { host: canonicalHost, protocol: 'https' },
    { host: canonicalHost, protocol: 'http' },
    { host: `www.${canonicalHost}`, protocol: 'https' },
  ]) {
    for (const oldPath of ['/financial-operations-masterclass', '/financial-operations-masterclass/']) {
      const response = await request(`${oldPath}?utm_source=old_link`, options);
      if (response.status !== 301 || response.headers.get('location') !== `https://${canonicalHost}/courses/?utm_source=old_link`) {
        failures.push(`legacy programme URL did not redirect in one hop: ${options.protocol} ${options.host}${oldPath}`);
      }
    }
  }

  for (const options of [
    { host: canonicalHost, protocol: 'http' },
    { host: `www.${canonicalHost}`, protocol: 'https' },
    { host: `www.${canonicalHost}`, protocol: 'http' },
  ]) {
    const response = await request('/courses?utm_source=seo', options);
    if (response.status !== 301 || response.headers.get('location') !== `https://${canonicalHost}/courses/?utm_source=seo`) {
      failures.push(`trailing slash: non-canonical /courses request was not normalized in one hop (${options.protocol} ${options.host})`);
    }
  }

  for (const missingPath of ['/nonexistent-seo-test/', '/unknown/nested/page/', '/assets/missing-file.js']) {
    const response = await request(missingPath);
    const body = await response.text();
    if (response.status !== 404) failures.push(`${missingPath}: expected 404, received ${response.status}`);
    if (!body.includes('name="robots" content="noindex,follow"')) failures.push(`${missingPath}: 404 body is missing noindex,follow`);
  }

  const publicLogo = await request('/images/brand/centaur-careers-logo.jpg', {
    headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
  });
  if (publicLogo.status !== 200) failures.push(`public asset: expected logo 200 without Referer, received ${publicLogo.status}`);
  if (!publicLogo.headers.get('content-type')?.startsWith('image/')) failures.push('public asset: logo has an incorrect content type');
} finally {
  server.close();
  await once(server, 'close');
}

if (failures.length > 0) {
  console.error(`HTTP contract verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('HTTP contract verified: canonical 200s, one-hop host/protocol redirects, trailing slashes, query preservation and real 404 responses.');
