#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { getInternalLinks } from '../src/seo/internalLinks.js';
import {
  createRouteMeta as createFullRouteMeta,
  SEO_ROUTES,
} from '../src/seo/seoRoutes.js';
import {
  createRouteMeta as createHomeRouteMeta,
  getHomeInternalLinks,
  HOME_SEO_ROUTE,
} from '../src/seo/homeSeo.js';

const buildRoot = path.resolve('build/client');
const failures = [];

function fail(message) {
  failures.push(message);
}

function outputFileForRoute(route) {
  if (route.path === '/') return path.join(buildRoot, 'index.html');
  return path.join(buildRoot, route.path.slice(1), 'index.html');
}

function stripMarkup(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAttribute(attributes, name) {
  return new RegExp(`\\b${name}\\s*=`, 'i').test(attributes);
}

function attributeValue(attributes, name) {
  return attributes.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1] || '';
}

function checkAccessibleNames(route, html) {
  const content = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

  for (const match of content.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const [, attributes, inner] = match;
    const name = attributeValue(attributes, 'aria-label') || attributeValue(attributes, 'aria-labelledby') || stripMarkup(inner);
    if (!name) fail(`${route.path}: button has no accessible name`);
  }

  for (const match of content.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const [, attributes, inner] = match;
    const name = attributeValue(attributes, 'aria-label') || attributeValue(attributes, 'aria-labelledby') || stripMarkup(inner);
    if (!name) fail(`${route.path}: link has no accessible name`);
  }

  for (const match of content.matchAll(/<svg\b([^>]*)>/gi)) {
    if (attributeValue(match[1], 'aria-hidden') !== 'true') {
      fail(`${route.path}: decorative SVG is missing aria-hidden="true"`);
    }
  }
}

function checkLandmarksAndControls(route, html) {
  if (!/<html\b[^>]*\blang="en-IN"/i.test(html)) fail(`${route.path}: document language is missing`);
  if (!/<a\b[^>]*class="[^"]*skip-link[^"]*"[^>]*href="#main-content"/i.test(html)) {
    fail(`${route.path}: skip link is missing`);
  }
  if (!/<main\b[^>]*\bid="main-content"/i.test(html)) fail(`${route.path}: main-content target is missing`);

  const labelledByTargets = [...html.matchAll(/\baria-labelledby="([^"]+)"/gi)].flatMap((match) => match[1].split(/\s+/));
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]));
  for (const target of labelledByTargets) {
    if (!ids.has(target)) fail(`${route.path}: aria-labelledby target is missing: ${target}`);
  }

  for (const match of html.matchAll(/\baria-controls="([^"]+)"/gi)) {
    if (!ids.has(match[1])) fail(`${route.path}: aria-controls target is missing: ${match[1]}`);
  }

  for (const match of html.matchAll(/<button\b([^>]*)>/gi)) {
    if (hasAttribute(match[1], 'aria-expanded') && !hasAttribute(match[1], 'aria-controls')) {
      fail(`${route.path}: expandable button is missing aria-controls`);
    }
  }
}

function checkImagesAndThirdPartyScripts(route, html) {
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const image = match[0];
    if (!hasAttribute(image, 'alt')) fail(`${route.path}: image is missing alt`);
    if (!/\bwidth="\d+"/i.test(image) || !/\bheight="\d+"/i.test(image)) {
      fail(`${route.path}: image is missing width/height dimensions`);
    }
    if (!hasAttribute(image, 'decoding')) fail(`${route.path}: image is missing decoding="async"`);

    const isCriticalBrandImage = /src="\/images\/brand\/centaur-careers-logo\.jpg"/i.test(image)
      && !/loading="lazy"/i.test(image);
    if (!isCriticalBrandImage && !/loading="lazy"/i.test(image)) {
      fail(`${route.path}: non-critical image is missing loading="lazy"`);
    }
  }

  const headEnd = html.indexOf('</head>');
  const bodyStart = html.indexOf('<body');
  const gtmScript = html.indexOf('googletagmanager.com/gtm.js');
  if (gtmScript >= 0 && (gtmScript < bodyStart || gtmScript < headEnd)) {
    fail(`${route.path}: GTM must load after the initial document head`);
  }
}

function checkHomepageLcpContract(route, html) {
  if (route.path !== '/') return;

  const homeHeading = html.match(/<h1\b([^>]*)\bid="home-page-title"([^>]*)>/i);
  if (!homeHeading) {
    fail('/: homepage LCP heading is missing');
    return;
  }

  const attributes = `${homeHeading[1]} ${homeHeading[2]}`;
  if (!hasAttribute(attributes, 'data-home-lcp')) {
    fail('/: homepage LCP heading is missing its performance contract marker');
  }
  if (hasAttribute(attributes, 'data-home-hero-reveal')) {
    fail('/: homepage LCP heading must not be hidden by the hero reveal animation');
  }

  if (!/home-process-placement-opportunities-320\.avif 320w/i.test(html)) {
    fail('/: placement process image is missing its responsive AVIF source set');
  }
  if (/\/assets\/seoRoutes-[^"']+\.js/i.test(html)) {
    fail('/: homepage must not preload the full all-routes SEO bundle');
  }
}

function checkCssAndMotion() {
  const cssFiles = fs.readdirSync(path.join(buildRoot, 'assets')).filter((file) => file.endsWith('.css'));
  const css = cssFiles.map((file) => fs.readFileSync(path.join(buildRoot, 'assets', file), 'utf8')).join('\n');

  if (!/font-display:\s*swap/i.test(css)) fail('performance: local fonts must use font-display: swap');
  if (!/prefers-reduced-motion/i.test(css)) fail('accessibility: reduced-motion CSS fallback is missing');
  if (!/skip-link/i.test(css)) fail('accessibility: skip-link styling is missing');
  if (!/focus-visible/i.test(css)) fail('accessibility: global focus-visible styling is missing');
  if (!/IBM Plex Sans Variable/.test(css)) fail('performance: bundled IBM Plex Sans variable font is not connected to the CSS stack');
}

function checkHomepageSeoBoundary() {
  const registryHomeRoute = SEO_ROUTES.find((route) => route.id === 'home');
  if (JSON.stringify(registryHomeRoute) !== JSON.stringify(HOME_SEO_ROUTE)) {
    fail('performance: lightweight homepage SEO route has drifted from the full route registry');
  }
  if (JSON.stringify(createFullRouteMeta('home')) !== JSON.stringify(createHomeRouteMeta('home'))) {
    fail('performance: lightweight homepage metadata has drifted from the full SEO generator');
  }
  if (JSON.stringify(getInternalLinks('home')) !== JSON.stringify(getHomeInternalLinks())) {
    fail('performance: lightweight homepage internal links have drifted from the full link architecture');
  }
}

for (const route of SEO_ROUTES) {
  const outputFile = outputFileForRoute(route);
  if (!fs.existsSync(outputFile)) {
    fail(`${route.path}: missing ${path.relative(process.cwd(), outputFile)}`);
    continue;
  }

  const html = fs.readFileSync(outputFile, 'utf8');
  checkAccessibleNames(route, html);
  checkLandmarksAndControls(route, html);
  checkImagesAndThirdPartyScripts(route, html);
  checkHomepageLcpContract(route, html);
}

checkCssAndMotion();
checkHomepageSeoBoundary();

if (failures.length > 0) {
  console.error(`Performance and accessibility verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Performance and accessibility verified: ${SEO_ROUTES.length} prerendered routes have accessible controls, stable images, deferred third-party loading, local font-display, focus styles, and reduced-motion support.`);
