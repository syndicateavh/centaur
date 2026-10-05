#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES, SEO_ROUTES, SITE_ORIGIN, canonicalUrl } from '../src/seo/seoRoutes.js';
import { getExpectedSitemapUrls } from './blog-sitemap.js';

const buildRoot = path.resolve('build/client');
const publicRoot = path.resolve('public');
const failures = [];
const expectedOrigin = 'https://centaurcareers.in';

function fail(message) {
  failures.push(message);
}

function outputFileForRoute(route) {
  if (route.path === '/') return path.join(buildRoot, 'index.html');
  return path.join(buildRoot, route.path.slice(1), 'index.html');
}

function checkRequiredFile(relativePath, root = buildRoot) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) fail(`deployment: missing ${path.relative(process.cwd(), filePath)}`);
  return filePath;
}

if (SITE_ORIGIN !== expectedOrigin) {
  fail(`deployment: SITE_ORIGIN must be ${expectedOrigin}, found ${SITE_ORIGIN}`);
}

let parsedOrigin;
try {
  parsedOrigin = new URL(SITE_ORIGIN);
  if (parsedOrigin.protocol !== 'https:' || parsedOrigin.hostname.startsWith('www.') || parsedOrigin.pathname !== '/') {
    fail(`deployment: SITE_ORIGIN is not the canonical HTTPS origin: ${SITE_ORIGIN}`);
  }
} catch {
  fail(`deployment: SITE_ORIGIN is not a valid URL: ${SITE_ORIGIN}`);
}

if (!fs.existsSync(buildRoot)) {
  fail('deployment: build/client does not exist; run npm run build first');
} else {
  checkRequiredFile('index.html');
  checkRequiredFile('404/index.html');
  checkRequiredFile('.htaccess');
  checkRequiredFile('robots.txt');
  checkRequiredFile('sitemap.xml');
  checkRequiredFile('llms.txt');
  checkRequiredFile('images/brand/centaur-careers-logo.jpg');

  for (const route of SEO_ROUTES) {
    checkRequiredFile(path.relative(buildRoot, outputFileForRoute(route)));
  }

  if (fs.existsSync(path.join(buildRoot, '__spa-fallback.html'))) {
    fail('deployment: __spa-fallback.html must not be uploaded');
  }
  if (fs.existsSync(path.resolve('build/server'))) {
    fail('deployment: build/server must not be present in the static upload package');
  }

  const textFiles = ['.htaccess', 'robots.txt', 'sitemap.xml', 'llms.txt'];
  for (const relativePath of textFiles) {
    const sourceFile = checkRequiredFile(relativePath, publicRoot);
    const deployedFile = path.join(buildRoot, relativePath);
    if (fs.existsSync(sourceFile) && fs.existsSync(deployedFile)
      && fs.readFileSync(sourceFile, 'utf8') !== fs.readFileSync(deployedFile, 'utf8')) {
      fail(`deployment: build/client/${relativePath} differs from public/${relativePath}`);
    }
  }

  const htaccess = fs.readFileSync(path.join(buildRoot, '.htaccess'), 'utf8');
  for (const requiredRule of [
    'DirectoryIndex index.html',
    'RewriteEngine On',
    'https://centaurcareers.in%{REQUEST_URI}',
    'ErrorDocument 404 /404/index.html',
    'RewriteRule ^india/delhi-ncr/?$ https://centaurcareers.in/best-finance-course-in-delhi/ [R=301,L,NE]',
    'RewriteRule ^india/bengaluru/?$ https://centaurcareers.in/best-finance-course-in-bangalore/ [R=301,L,NE]',
    'RewriteRule ^india/mumbai/?$ https://centaurcareers.in/best-finance-course-in-mumbai/ [R=301,L,NE]',
    'RewriteRule ^india/pune/?$ https://centaurcareers.in/best-finance-course-in-pune/ [R=301,L,NE]',
    'RewriteRule ^india/hyderabad/?$ https://centaurcareers.in/best-finance-course-in-hyderabad/ [R=301,L,NE]',
    'RewriteRule ^locations/lucknow/?$ https://centaurcareers.in/best-finance-course-in-lucknow/ [R=301,L,NE]',
    'RewriteRule ^financial-operations-masterclass/?$ https://centaurcareers.in/courses/ [R=301,L,NE]',
  ]) {
    if (!htaccess.includes(requiredRule)) fail(`deployment: .htaccess is missing ${requiredRule}`);
  }
  if (/HTTP_REFERER/i.test(htaccess)) fail('deployment: .htaccess must not gate public files by Referer');

  const robots = fs.readFileSync(path.join(buildRoot, 'robots.txt'), 'utf8');
  if (!/^User-agent:\s*\*\s*$/mi.test(robots)) fail('deployment: deployed robots.txt is missing the wildcard user-agent rule');
  if (!/^Allow:\s*\/\s*$/mi.test(robots)) fail('deployment: deployed robots.txt is missing Allow: /');
  if (!new RegExp('^Sitemap:\\s*' + expectedOrigin.replace(/[.*+?^()|[\]\\]/g, '\\$&') + '/sitemap\\.xml\\s*$', 'mi').test(robots)) {
    fail('deployment: deployed robots.txt has the wrong sitemap reference');
  }
  for (const crawler of ['Googlebot', 'Google-Extended', 'GoogleOther', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'Applebot-Extended']) {
    if (!new RegExp('User-agent:\\s*' + crawler + '[\\s\\S]*?Allow:\\s*\\/', 'i').test(robots)) {
      fail(`deployment: robots.txt must explicitly allow ${crawler}`);
    }
  }
  if (/^Disallow:\s*\S/mi.test(robots)) fail('deployment: robots.txt must not block any crawler');

  const sitemap = fs.readFileSync(path.join(buildRoot, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => match[1].trim());
  const expectedLocations = getExpectedSitemapUrls();
  if (locations.length !== expectedLocations.length) {
    fail(`deployment: deployed sitemap has ${locations.length} URLs; expected ${expectedLocations.length}`);
  }
  for (const location of expectedLocations) {
    if (!locations.includes(location)) fail(`deployment: deployed sitemap is missing ${location}`);
  }
  if (locations.some((location) => location.includes('/404/') || location.includes('localhost'))) {
    fail('deployment: deployed sitemap contains an invalid or private URL');
  }

  for (const route of SEO_ROUTES) {
    const html = fs.readFileSync(outputFileForRoute(route), 'utf8');
    if (/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|horizons-cdn\.hostinger\.com)/i.test(html)) {
      fail(`deployment: ${route.path} contains a local, preview, or blocked CDN reference`);
    }
    if (!html.includes(`rel="canonical" href="${canonicalUrl(route)}"`)) {
      fail(`deployment: ${route.path} has no canonical for the configured production origin`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Deployment foundation verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Deployment foundation verified: ${INDEXABLE_ROUTES.length} indexable routes, ${SEO_ROUTES.length} route documents, production origin, static assets, redirects, 404 handling, robots.txt, and sitemap are upload-ready.`);
