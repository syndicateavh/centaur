#!/usr/bin/env node

import path from 'node:path';
import { spawnSync } from 'node:child_process';

const checks = [
  ['SEO gate wiring', 'tools/verify-seo-gate-wiring.js'],
  ['content governance', 'tools/verify-content-governance.js'],
  ['source controls', 'tools/verify-source-content.js'],
  ['blog image handling', 'tools/verify-blog-images.js'],
  ['blog image parser', 'tools/test-blog-image-parser.js'],
  ['blog content structure', 'tools/verify-blog-content-structure.js'],
  ['blog content validation', 'tools/test-blog-validation.js'],
  ['blog publishing workflow', 'tools/test-blog-workflow.js'],
  ['keyword strategy ownership', 'tools/verify-keyword-strategy.js'],
  ['regional and online keyword ownership', 'tools/verify-regional-keyword-ownership.js'],
  ['India keyword map', 'tools/india-keyword-map.js', '--check'],
  ['keyword research architecture', 'tools/verify-keyword-research.js'],
  ['keyword indexability map', 'tools/verify-keyword-indexability.js'],
  ['page keyword ownership', 'tools/verify-page-keywords.js'],
  ['search-intent ownership', 'tools/verify-search-intent-ownership.js'],
  ['backlink and measurement workflow', 'tools/verify-seo-measurement.js'],
  ['GA4 event queue', 'tools/test-ga4.js'],
  ['blog SEO implementation', 'tools/test-blog-seo.js'],
  ['blog public routes', 'tools/verify-blog-routes.js'],
  ['blog build output', 'tools/verify-blog-build.js'],
  ['blog portal', 'tools/verify-blog-portal.js'],
  ['deployment foundation', 'tools/verify-deployment-foundation.js'],
  ['commercial page strengthening', 'tools/verify-commercial-pages.js'],
  ['Phase 1 offer and claims', 'tools/verify-phase1-offer-claims.js'],
  ['next 20 SEO pages', 'tools/verify-next-seo-pages.js'],
  ['Lucknow location strengthening', 'tools/verify-lucknow-location.js'],
  ['career-guide information cluster', 'tools/verify-career-guides.js'],
  ['role-intent search cluster', 'tools/verify-role-intent.js'],
  ['job-intent depth and practical cases', 'tools/verify-job-intent-depth.js'],
  ['topic program pathways', 'tools/verify-topic-program-paths.js'],
  ['quiz lead engine', 'tools/verify-quiz-lead-engine.js'],
  ['resources and FAQ content', 'tools/verify-resources-faq.js'],
  ['India-wide page', 'tools/verify-india-page.js'],
  ['selective regional pages', 'tools/verify-regional-pages.js'],
  ['Phase 3 high-value pages', 'tools/verify-phase3-high-value-pages.js'],
  ['Phase 4 site architecture', 'tools/verify-phase4-site-architecture.js'],
  ['Phase 5 informational keyword coverage', 'tools/verify-phase5-informational-content.js'],
  ['Phase 6 page connections', 'tools/verify-phase6-page-connections.js'],
  ['Phase 6 indexing workflow', 'tools/verify-indexing-workflow.js'],
  ['India lead-intent page register', 'tools/verify-india-lead-intent-pages.js'],
  ['discovery and trust paths', 'tools/verify-discovery-trust.js'],
  ['Phase 7 measurement archive tests', 'tools/test-seo-measurement.js'],
  ['Phase 7 measure and maintain readiness', 'tools/verify-phase7-measure-maintain.js'],
  ['comparison content', 'tools/verify-comparison-page.js'],
  ['internal authority building', 'tools/verify-authority-building.js'],
  ['new-route technical SEO', 'tools/verify-new-route-technical-seo.js'],
  ['rendered SEO output', 'tools/verify-seo-build.js'],
  ['internal-link architecture', 'tools/verify-internal-links.js'],
  ['performance and accessibility', 'tools/verify-performance-accessibility.js'],
  ['structured data and entity consistency', 'tools/verify-structured-data.js'],
  ['technical SEO', 'tools/verify-technical-seo.js'],
  ['HTTP contract', 'tools/verify-http-contract.js'],
];

const failures = [];

for (const [label, relativeScript, ...args] of checks) {
  console.log('\n[seo:check] ' + label);
  const result = spawnSync(process.execPath, [path.resolve(relativeScript), ...args], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error('[seo:check] ' + label + ' could not run: ' + result.error.message);
    failures.push(label);
    continue;
  }

  if (result.status !== 0) {
    console.error('[seo:check] ' + label + ' failed with exit code ' + (result.status ?? 'unknown') + '.');
    failures.push(label);
  }
}

if (failures.length > 0) {
  console.error('\nSEO check failed: ' + failures.join(', ') + '.');
  process.exit(1);
}

console.log('\nSEO check passed: source, rendered output, technical controls, and HTTP behavior are valid.');
