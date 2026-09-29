#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES, SEO_ROUTES } from '../src/seo/seoRoutes.js';
import { INTERNAL_LINK_ARCHITECTURE, getInternalLinks } from '../src/seo/internalLinks.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const routeById = new Map(SEO_ROUTES.map((route) => [route.id, route]));

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

function textFromHtml(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function checkRegistry() {
  const contextualInbound = new Map(INDEXABLE_ROUTES.map((route) => [route.id, new Set()]));

  for (const route of INDEXABLE_ROUTES) {
    const targetIds = INTERNAL_LINK_ARCHITECTURE[route.id];
    if (!targetIds?.length) {
      fail(`${route.path}: contextual internal-link group is missing`);
      continue;
    }

    if (new Set(targetIds).size !== targetIds.length) {
      fail(`${route.path}: contextual internal-link group contains duplicate targets`);
    }

    for (const targetId of targetIds) {
      const targetRoute = routeById.get(targetId);
      if (!targetRoute) {
        fail(`${route.path}: contextual link targets an unknown route ${targetId}`);
        continue;
      }
      if (!targetRoute.indexable) fail(`${route.path}: contextual link targets a non-indexable route ${targetId}`);
      if (targetId === route.id) fail(`${route.path}: contextual link points back to the same route`);
      contextualInbound.get(targetId)?.add(route.id);
    }
  }

  for (const route of INDEXABLE_ROUTES) {
    if (route.id !== 'home' && !contextualInbound.get(route.id)?.size) {
      fail(`${route.path}: no contextual inbound internal link exists`);
    }
  }
}

function checkRenderedGroup(route) {
  const outputFile = outputFileForRoute(route);
  if (!fs.existsSync(outputFile)) {
    fail(`${route.path}: missing ${path.relative(process.cwd(), outputFile)}`);
    return;
  }

  const html = fs.readFileSync(outputFile, 'utf8');
  const groupMatch = html.match(/<nav\b(?=[^>]*\baria-label="Related pages")(?=[^>]*\bdata-internal-link-group(?:="[^"]*")?)[^>]*>([\s\S]*?)<\/nav>/i);
  if (!groupMatch) {
    fail(`${route.path}: rendered contextual internal-link group is missing`);
    return;
  }

  const anchors = [...groupMatch[1].matchAll(/<a\b[^>]*>/gi)].map((match) => {
    const tag = match[0];
    const target = tag.match(/data-internal-link-target="([^"]+)"/i)?.[1];
    const href = tag.match(/href="([^"]+)"/i)?.[1];
    return { target, href };
  });
  const expected = getInternalLinks(route.id);

  if (anchors.length !== expected.length) {
    fail(`${route.path}: expected ${expected.length} contextual links, found ${anchors.length}`);
  }

  for (const link of expected) {
    const rendered = anchors.find((anchor) => anchor.target === link.routeId);
    if (!rendered) {
      fail(`${route.path}: missing rendered contextual link to ${link.routeId}`);
      continue;
    }
    if (rendered.href !== link.to) fail(`${route.path}: contextual link to ${link.routeId} is not canonical`);
    if (/click here|read more|learn more/i.test(link.label)) {
      fail(`${route.path}: contextual link uses a vague anchor label: ${link.label}`);
    }
  }

  for (const anchor of anchors) {
    if (!anchor.target || !anchor.href) fail(`${route.path}: contextual anchor is missing its route metadata`);
    if (!expected.some((link) => link.routeId === anchor.target)) {
      fail(`${route.path}: rendered contextual link is not in the route registry: ${anchor.target}`);
    }
  }

  const groupText = textFromHtml(groupMatch[1]);
  for (const link of expected) {
    if (!groupText.includes(link.label)) fail(`${route.path}: anchor text is missing: ${link.label}`);
  }
}

checkRegistry();
for (const route of INDEXABLE_ROUTES) checkRenderedGroup(route);

if (failures.length > 0) {
  console.error(`Internal-link architecture verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Internal-link architecture verified: ${INDEXABLE_ROUTES.length} indexable routes have registered contextual navigation and inbound coverage.`);
