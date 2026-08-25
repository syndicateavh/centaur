#!/usr/bin/env node

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { once } from 'node:events';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const canonicalHost = 'centaurcareers.in';
const failures = [];

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
    '.js': 'text/javascript; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
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

async function request(pathname, { host = canonicalHost, protocol = 'https', redirect = 'manual' } = {}) {
  return fetch(`http://127.0.0.1:${port}${pathname}`, {
    headers: { 'X-Test-Host': host, 'X-Forwarded-Proto': protocol },
    redirect,
  });
}

try {
  for (const route of INDEXABLE_ROUTES) {
    const response = await request(route.path);
    const body = await response.text();
    if (response.status !== 200) failures.push(`${route.path}: expected 200, received ${response.status}`);
    if (!body.includes('<h1')) failures.push(`${route.path}: response body has no H1`);
  }

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

  for (const missingPath of ['/nonexistent-seo-test/', '/unknown/nested/page/', '/assets/missing-file.js']) {
    const response = await request(missingPath);
    const body = await response.text();
    if (response.status !== 404) failures.push(`${missingPath}: expected 404, received ${response.status}`);
    if (!body.includes('name="robots" content="noindex,follow"')) failures.push(`${missingPath}: 404 body is missing noindex,follow`);
  }
} finally {
  server.close();
  await once(server, 'close');
}

if (failures.length > 0) {
  console.error(`HTTP contract verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('HTTP contract verified: canonical 200s, one-hop host/protocol redirects, trailing slashes, query preservation and real 404 responses.');
