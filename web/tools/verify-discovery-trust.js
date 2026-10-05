#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDIA_LEAD_INTENT_PAGES } from '../src/content/indiaLeadIntentPages.js';
import { LEAD_INTENT_ACTIONS } from '../src/content/leadIntentActions.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';

const failures = [];
const routes = new Set(INDEXABLE_ROUTES.map((route) => route.path));
const output = (routePath) => fs.readFileSync(path.resolve('build/client', routePath === '/' ? 'index.html' : `${routePath.slice(1)}index.html`), 'utf8');
const fail = (message) => failures.push(message);

for (const page of INDIA_LEAD_INTENT_PAGES) {
  const action = LEAD_INTENT_ACTIONS[page.id];
  if (!action) {
    fail(`${page.id}: missing intent-specific next step`);
    continue;
  }
  if (!routes.has(action[2].split('#')[0])) fail(`${page.id}: next-step destination is not an indexable route`);
  const html = output(page.path);
  if (!html.includes(`data-lead-intent-action="${page.id}"`)) fail(`${page.id}: contextual action is missing`);
  if (!html.includes(`href="${action[2]}"`)) fail(`${page.id}: destination is missing`);
  if (!html.includes(`data-analytics-id="lead_${page.id}_phone"`)) fail(`${page.id}: tracked tap-to-call is missing`);
  if (!html.includes(`data-analytics-id="lead_${page.id}_whatsapp"`)) fail(`${page.id}: tracked WhatsApp action is missing`);
  if (!html.includes('Page updated <time')) fail(`${page.id}: precise update date is missing`);
  if (html.includes('Content reviewed')) fail(`${page.id}: reviewer is unnamed`);
}

for (const pageId of Object.keys(LEAD_INTENT_ACTIONS)) {
  if (!INDIA_LEAD_INTENT_PAGES.some((page) => page.id === pageId)) fail(`${pageId}: action has no lead page`);
}

const about = output('/about/');
for (const marker of ['data-trust-evidence', 'data-preview-asset="/downloads/financial-operations-masterclass-syllabus.txt"', '/blog/settlement-trade-break-worked-example/', '/placements/#job-guarantee-terms']) {
  if (!about.includes(marker)) fail(`/about/: missing trust evidence ${marker}`);
}

for (const routePath of ['/courses/', '/india/']) {
  const html = output(routePath);
  const group = html.match(/<nav\b(?=[^>]*\baria-label="Related pages")[^>]*>([\s\S]*?)<\/nav>/i)?.[1] || '';
  if (!group.includes('<details')) fail(`${routePath}: browseable related-page expansion is missing`);
  if (!group.includes('Explore related topics')) fail(`${routePath}: related-page heading is missing`);
}

if (failures.length) {
  console.error(`Discovery and trust verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Discovery and trust verified: ${INDIA_LEAD_INTENT_PAGES.length} lead paths, evidence links, and browseable hubs.`);
