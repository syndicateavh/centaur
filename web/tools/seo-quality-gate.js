#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const failures = [];
const results = [];
const startedAt = new Date().toISOString();

function runStep(label, args) {
  console.log(`\n[seo:gate] ${label}`);
  const stepStartedAt = Date.now();
  const result = spawnSync(npmCommand, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error(`[seo:gate] ${label} could not run: ${result.error.message}`);
    failures.push(label);
    results.push({ label, args, passed: false, exitCode: null, durationMs: Date.now() - stepStartedAt, error: result.error.message });
    return false;
  }

  if (result.status !== 0) {
    console.error(`[seo:gate] ${label} failed with exit code ${result.status ?? 'unknown'}.`);
    failures.push(label);
    results.push({ label, args, passed: false, exitCode: result.status ?? null, durationMs: Date.now() - stepStartedAt });
    return false;
  }

  results.push({ label, args, passed: true, exitCode: 0, durationMs: Date.now() - stepStartedAt });
  return true;
}

runStep('SEO gate wiring', ['run', 'test:seo:gate-wiring']);
const buildPassed = runStep('production build', ['run', 'build']);
runStep('lint', ['run', 'lint']);

if (buildPassed) {
  runStep('SEO checks', ['run', 'seo:check']);
} else {
  console.error('[seo:gate] SEO checks were skipped because the production build failed.');
  failures.push('SEO checks (build prerequisite)');
}

const report = {
  startedAt,
  completedAt: new Date().toISOString(),
  passed: failures.length === 0,
  failures,
  steps: results,
};
const reportPath = path.resolve('build/seo-quality-gate-report.json');
try {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`\n[seo:gate] report written: ${reportPath}`);
} catch (error) {
  console.error(`[seo:gate] could not write the quality-gate report: ${error instanceof Error ? error.message : 'unknown error'}`);
  failures.push('SEO gate report');
}

if (failures.length > 0) {
  console.error(`\nSEO quality gate failed: ${failures.join(', ')}.`);
  process.exit(1);
}

console.log('\nSEO quality gate passed: wiring, production build, lint, rendered SEO, technical SEO, structured data, internal links, accessibility, and crawler behavior are valid.');
