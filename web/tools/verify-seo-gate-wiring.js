#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const packagePath = path.resolve('package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const buildScript = packageJson.scripts?.build || '';
const failures = [];

function requireText(source, expected, label) {
  if (!source.includes(expected)) failures.push(`${label} is missing: ${expected}`);
}

const requiredBuildSteps = [
  'tools/prepare-blog-storage.js',
  'tools/verify-blog-images.js',
  'tools/verify-blog-content-structure.js',
  'tools/generate-sitemap.js',
  'tools/generate-indexing-manifest.js',
  'tools/generate-llms.js',
  'tools/generate-page-keyword-map.js',
  'tools/generate-robots.js',
  'react-router build',
  'tools/finalize-static-build.js',
  'tools/verify-blog-build.js',
  'tools/verify-blog-routes.js',
  'tools/generate-keyword-indexability-map.js',
  'tools/generate-site-architecture-report.js',
];
let previousStepIndex = -1;
for (const step of requiredBuildSteps) {
  const stepIndex = buildScript.indexOf(step);
  if (stepIndex < 0) failures.push(`production build is missing ${step}`);
  if (stepIndex >= 0 && stepIndex < previousStepIndex) failures.push(`production build step is out of order: ${step}`);
  if (stepIndex >= 0) previousStepIndex = stepIndex;
}

for (const scriptName of ['build', 'lint', 'seo:check', 'seo:gate', 'release:qa', 'release:learn', 'release:prepare', 'test:seo:gate-wiring', 'test:blog:build', 'test:blog:workflow', 'blog:validate-file', 'blog:workflow', 'blog:publish', 'seo:keywords', 'seo:keywords:check', 'seo:keywords:strategy:import', 'seo:keywords:briefs', 'seo:keywords:report', 'seo:keywords:indexability:map', 'seo:keywords:indexability:check', 'seo:page-keywords:check', 'seo:page-keywords:map', 'seo:intent:check', 'seo:architecture:map', 'seo:indexing:manifest', 'seo:indexing:submit', 'seo:indexing:inspect', 'seo:indexing:import', 'seo:indexing:monitor', 'seo:indexing:check', 'seo:phase1:offer:check', 'seo:phase4:check', 'seo:regional:keywords:check', 'seo:keywords:import', 'seo:llms:generate', 'seo:llms:check', 'seo:commercial:check', 'seo:next-pages:check', 'seo:location:check', 'seo:career-guides:check', 'seo:role-intent:check', 'seo:quiz:lead:check', 'seo:resources-faq:check', 'seo:india:check', 'seo:regional:check', 'seo:phase3:check', 'seo:comparison:check', 'seo:authority:check', 'seo:authority:report', 'seo:technical-routes:check', 'seo:measurement:check', 'seo:measure:report', 'seo:phase7:check', 'test:seo:measurement', 'backlinks:validate', 'backlinks:brief', 'backlinks:export']) {
  if (!packageJson.scripts?.[scriptName]) failures.push(`package script is missing: ${scriptName}`);
}

const seoCheck = fs.readFileSync(path.resolve('tools/seo-check.js'), 'utf8');
for (const scriptName of ['seo:india-keywords:generate', 'seo:india-keywords:check']) {
  if (!packageJson.scripts?.[scriptName]) failures.push(`package script is missing: ${scriptName}`);
}
requireText(seoCheck, "['India keyword map', 'tools/india-keyword-map.js', '--check']", 'SEO check sequence');
for (const label of ['content governance', 'blog image handling', 'blog content structure', 'blog content validation', 'blog publishing workflow', 'keyword strategy ownership', 'regional and online keyword ownership', 'keyword research architecture', 'keyword indexability map', 'page keyword ownership', 'search-intent ownership', 'backlink and measurement workflow', 'GA4 event queue', 'blog SEO implementation', 'blog public routes', 'blog build output', 'commercial page strengthening', 'Phase 1 offer and claims', 'next 20 SEO pages', 'Lucknow location strengthening', 'career-guide information cluster', 'role-intent search cluster', 'quiz lead engine', 'resources and FAQ content', 'India-wide page', 'selective regional pages', 'Phase 3 high-value pages', 'Phase 4 site architecture', 'Phase 6 indexing workflow', 'Phase 7 measurement archive tests', 'Phase 7 measure and maintain readiness', 'comparison content', 'internal authority building', 'new-route technical SEO', 'rendered SEO output', 'HTTP contract']) {
  requireText(seoCheck, label, 'SEO check sequence');
}

const qualityGate = fs.readFileSync(path.resolve('tools/seo-quality-gate.js'), 'utf8');
for (const expected of ["runStep('production build'", "runStep('lint'", "runStep('SEO checks'"]) {
  requireText(qualityGate, expected, 'SEO quality gate sequence');
}

const releaseQa = fs.readFileSync(path.resolve('tools/final-release-qa.js'), 'utf8');
for (const expected of ["runStep('complete SEO quality gate'", 'RELEASE_EXTERNAL_ORIGIN', 'RELEASE_MANIFEST.json', 'Upload the contents of build/client/']) {
  requireText(releaseQa, expected, 'final release QA contract');
}

const routerConfig = fs.readFileSync(path.resolve('react-router.config.js'), 'utf8');
for (const expected of ['getPublishedBlogPostsSorted', 'loadBlogPosts', 'prerender']) {
  requireText(routerConfig, expected, 'React Router blog build integration');
}

if (failures.length > 0) {
  console.error(`SEO gate wiring verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO gate wiring verified: ${requiredBuildSteps.length} ordered build stages, ${Object.keys(packageJson.scripts).length} package scripts, and all blog/site validators are connected.`);
