#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { AUTHORITY_OUTREACH_GUARDRAILS, AUTHORITY_PATHS, AUTHORITY_TARGETS, LINKABLE_AUTHORITY_ASSETS, getLinkableAuthorityAsset } from '../src/content/seo/authorityBuilding.js';
import { blogPostPath } from '../src/content/blog/blogRoutes.js';
import { BLOG_STATUSES } from '../src/content/blog/blogSchema.js';
import { validateBacklinkCollection } from '../src/content/seo/backlinkWorkflow.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { INTERNAL_LINK_ARCHITECTURE } from '../src/seo/internalLinks.js';

const buildRoot = path.resolve('build/client');
const prospectPath = path.resolve('src/content/seo/backlinkProspects.json');
const failures = [];
const indexableIds = new Set(INDEXABLE_ROUTES.map((route) => route.id));
const indexablePaths = new Set(INDEXABLE_ROUTES.map((route) => route.path));
const blogPostsRoot = path.resolve('src/content/blog/posts');
const publishedBlogPaths = new Set(['/blog/']);
if (fs.existsSync(blogPostsRoot)) {
  for (const fileName of fs.readdirSync(blogPostsRoot).filter((name) => name.endsWith('.json'))) {
    const post = JSON.parse(fs.readFileSync(path.join(blogPostsRoot, fileName), 'utf8'));
    if (post.status === BLOG_STATUSES.PUBLISHED && post.slug) publishedBlogPaths.add(blogPostPath(post.slug));
  }
}

function fail(message) {
  failures.push(message);
}

function outputFileForRoute(route) {
  if (route.path === '/') return path.join(buildRoot, 'index.html');
  return path.join(buildRoot, route.path.slice(1), 'index.html');
}

function checkAuthorityRegistry() {
  const inbound = new Map(INDEXABLE_ROUTES.map((route) => [route.id, new Set()]));

  for (const route of INDEXABLE_ROUTES) {
    const targets = INTERNAL_LINK_ARCHITECTURE[route.id] || [];
    for (const targetId of targets) {
      if (!indexableIds.has(targetId)) continue;
      inbound.get(targetId)?.add(route.id);
    }
  }

  for (const target of AUTHORITY_TARGETS) {
    if (!indexableIds.has(target.routeId)) {
      fail(`authority target is not an indexable route: ${target.routeId}`);
      continue;
    }

    const sources = inbound.get(target.routeId) || new Set();
    if (sources.size < target.minimumInbound) {
      fail(`${target.routeId}: expected at least ${target.minimumInbound} inbound authority links, found ${sources.size}`);
    }

    for (const sourceId of target.requiredInboundRouteIds) {
      if (!indexableIds.has(sourceId)) {
        fail(`${target.routeId}: required inbound source is not indexable: ${sourceId}`);
      } else if (!INTERNAL_LINK_ARCHITECTURE[sourceId]?.includes(target.routeId)) {
        fail(`${target.routeId}: required inbound link is missing from ${sourceId}`);
      }
    }
  }

  for (const route of INDEXABLE_ROUTES) {
    if (!AUTHORITY_TARGETS.some((target) => target.routeId === route.id) && route.id === 'home') continue;
    if (!INTERNAL_LINK_ARCHITECTURE[route.id]?.length) fail(`${route.id}: no authority graph edges are registered`);
  }

  return inbound;
}

function checkAuthorityPaths() {
  for (const journey of AUTHORITY_PATHS) {
    if (journey.routeIds.length < 2) {
      fail(`${journey.id}: authority journey must contain at least two routes`);
      continue;
    }

    for (const routeId of journey.routeIds) {
      if (!indexableIds.has(routeId)) fail(`${journey.id}: route is not indexable: ${routeId}`);
    }

    for (let index = 0; index < journey.routeIds.length - 1; index += 1) {
      const sourceId = journey.routeIds[index];
      const targetId = journey.routeIds[index + 1];
      if (!INTERNAL_LINK_ARCHITECTURE[sourceId]?.includes(targetId)) {
        fail(`${journey.id}: missing graph edge ${sourceId} -> ${targetId}`);
      }
    }
  }
}

function checkCrawlDepth() {
  const distances = new Map([['home', 0]]);
  const queue = ['home'];

  while (queue.length > 0) {
    const sourceId = queue.shift();
    const nextDistance = distances.get(sourceId) + 1;
    for (const targetId of INTERNAL_LINK_ARCHITECTURE[sourceId] || []) {
      if (!indexableIds.has(targetId) || distances.has(targetId)) continue;
      distances.set(targetId, nextDistance);
      queue.push(targetId);
    }
  }

  for (const route of INDEXABLE_ROUTES) {
    if (!distances.has(route.id)) fail(`${route.id}: no crawl path from the homepage exists`);
    if ((distances.get(route.id) || 0) > 3) fail(`${route.id}: crawl depth from the homepage exceeds three clicks`);
  }
}

function checkRenderedAuthorityMarkup() {
  for (const route of INDEXABLE_ROUTES) {
    const outputFile = outputFileForRoute(route);
    if (!fs.existsSync(outputFile)) {
      fail(`${route.path}: missing prerendered output for authority markup check`);
      continue;
    }

    const html = fs.readFileSync(outputFile, 'utf8');
    const groupMatch = html.match(/<nav\b[^>]*\bdata-authority-link-group="internal-graph"[^>]*>([\s\S]*?)<\/nav>/i);
    if (!groupMatch) {
      fail(`${route.path}: prerendered authority link group is missing`);
      continue;
    }

    if (/rel="[^"]*nofollow/i.test(groupMatch[1])) fail(`${route.path}: authority links must remain followable`);
    const anchors = [...groupMatch[1].matchAll(/<a\b[^>]*data-authority-link="contextual"[^>]*>/gi)];
    const expectedCount = (INTERNAL_LINK_ARCHITECTURE[route.id] || []).length;
    if (anchors.length !== expectedCount) fail(`${route.path}: expected ${expectedCount} prerendered authority links, found ${anchors.length}`);
  }
}

function checkBacklinkPlan() {
  for (const guardrail of AUTHORITY_OUTREACH_GUARDRAILS) {
    if (typeof guardrail !== 'string' || guardrail.trim().length < 30) fail('authority outreach guardrail is missing or too short');
  }

  let prospects;
  try {
    prospects = JSON.parse(fs.readFileSync(prospectPath, 'utf8'));
  } catch (error) {
    fail(`backlink prospect registry could not be read: ${error.message}`);
    return;
  }

  const validation = validateBacklinkCollection(prospects);
  for (const error of validation.errors) fail(`backlink registry: ${error}`);

  for (const prospect of prospects) {
    const asset = getLinkableAuthorityAsset(prospect.assetId);
    if (!asset) {
      fail(`${prospect.id}: assetId is not in the authority asset inventory`);
      continue;
    }
    if (asset.targetPath !== prospect.targetPath) fail(`${prospect.id}: targetPath does not match its authority asset`);
    if (asset.status === 'gated' && ['candidate', 'qualified', 'outreach'].includes(prospect.status)) {
      fail(`${prospect.id}: gated authority asset cannot enter the actionable outreach queue`);
    }
    if (typeof prospect.outreachAngle !== 'string' || prospect.outreachAngle.trim().length < 40) {
      fail(`${prospect.id}: outreachAngle must explain a useful editorial fit`);
    }
    if (/buy|paid link|guarantee|automated submission|link exchange/i.test(prospect.outreachAngle || '')) {
      fail(`${prospect.id}: outreachAngle contains a prohibited acquisition claim`);
    }
  }
}

function checkAuthorityAssets() {
  const assetIds = new Set();
  const targetPaths = new Set();
  const resourceHubPath = path.join(buildRoot, 'resources', 'index.html');
  const resourceHubHtml = fs.existsSync(resourceHubPath) ? fs.readFileSync(resourceHubPath, 'utf8') : '';

  for (const asset of LINKABLE_AUTHORITY_ASSETS) {
    if (assetIds.has(asset.id)) fail(`authority asset ID is duplicated: ${asset.id}`);
    assetIds.add(asset.id);
    if (targetPaths.has(asset.targetPath)) fail(`authority asset target is duplicated: ${asset.targetPath}`);
    targetPaths.add(asset.targetPath);
    if (!['active', 'gated'].includes(asset.status)) fail(`${asset.id}: status must be active or gated`);
    if (!asset.format || !asset.audience || !asset.editorialValue || !asset.readerOutcome) {
      fail(`${asset.id}: format, audience, editorialValue, and readerOutcome are required`);
    }

    const targetExists = indexablePaths.has(asset.targetPath) || publishedBlogPaths.has(asset.targetPath);
    if (asset.status === 'gated') {
      if (targetExists) fail(`${asset.id}: gated asset is already public; promote it only after its editorial review is complete`);
      continue;
    }
    if (!targetExists) fail(`${asset.id}: target path is not an indexable or published blog route: ${asset.targetPath}`);

    const outputPath = path.join(buildRoot, asset.targetPath === '/' ? 'index.html' : asset.targetPath.slice(1), 'index.html');
    if (!fs.existsSync(outputPath)) fail(`${asset.id}: target path has no prerendered output: ${asset.targetPath}`);

    if (asset.targetPath.startsWith('/resources/')) {
      if (!resourceHubHtml.includes(`data-authority-asset="${asset.id}"`)) fail(`${asset.id}: resource hub does not visibly surface this asset`);
      if (!resourceHubHtml.includes(`href="${asset.targetPath}"`)) fail(`${asset.id}: resource hub link is missing`);
      const targetHtml = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
      if (!targetHtml.includes(`data-authority-asset="${asset.id}"`)) fail(`${asset.id}: target resource is missing its authority-asset marker`);
      if (!targetHtml.includes('data-resource-authority-note')) fail(`${asset.id}: target resource is missing its reader-value note`);
    }
  }
}

const inbound = checkAuthorityRegistry();
checkAuthorityPaths();
checkCrawlDepth();
checkRenderedAuthorityMarkup();
checkBacklinkPlan();
checkAuthorityAssets();

if (failures.length > 0) {
  console.error(`Authority building verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const priorityInbound = [...inbound.entries()]
  .filter(([routeId]) => AUTHORITY_TARGETS.some((target) => target.routeId === routeId))
  .reduce((total, [, sources]) => total + sources.size, 0);
console.log(`Authority building verified: ${AUTHORITY_TARGETS.length} priority targets, ${AUTHORITY_PATHS.length} tested journeys, ${priorityInbound} priority inbound edges, prerendered followable links, and an evidence-only backlink plan.`);
