#!/usr/bin/env node

import path from 'node:path';
import { spawnSync } from 'node:child_process';

const checks = [
  ['rendered SEO output', 'tools/verify-seo-build.js'],
  ['technical SEO contract', 'tools/verify-technical-seo.js'],
  ['performance and accessibility contract', 'tools/verify-performance-accessibility.js'],
  ['deployment foundation', 'tools/verify-deployment-foundation.js'],
  ['HTTP and redirect contract', 'tools/verify-http-contract.js'],
  ['new-route technical contracts', 'tools/verify-new-route-technical-seo.js'],
];

const failures = [];

for (const [label, relativeScript] of checks) {
  console.log(`\n[seo:phase1:check] ${label}`);
  const result = spawnSync(process.execPath, [path.resolve(relativeScript)], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`[seo:phase1:check] ${label} could not run: ${result.error.message}`);
    failures.push(label);
  } else if (result.status !== 0) {
    console.error(`[seo:phase1:check] ${label} failed with exit code ${result.status ?? 'unknown'}.`);
    failures.push(label);
  }
}

if (failures.length > 0) {
  console.error(`\nPhase 1 technical SEO gate failed: ${failures.join(', ')}.`);
  process.exit(1);
}

console.log('\nPhase 1 technical SEO gate passed: prerendering, metadata, indexability, crawl controls, sitemap, redirects, 404 handling, performance safeguards, and route contracts are valid.');
