#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { INDEXABLE_ROUTES, SEO_ROUTES, SITE_ORIGIN, canonicalUrl } from '../src/seo/seoRoutes.js';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const buildRoot = path.resolve('build/client');
const failures = [];
const results = [];
const startedAt = new Date().toISOString();
const externalOrigin = process.env.RELEASE_EXTERNAL_ORIGIN || '';

function runStep(label, args) {
  console.log(`\n[release:qa] ${label}`);
  const stepStartedAt = Date.now();
  const result = spawnSync(npmCommand, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  const passed = !result.error && result.status === 0;
  results.push({
    label,
    command: [npmCommand, ...args].join(' '),
    passed,
    exitCode: result.error ? null : result.status,
    durationMs: Date.now() - stepStartedAt,
    ...(result.error ? { error: result.error.message } : {}),
  });
  if (!passed) failures.push(label);
  return passed;
}

function outputFileForRoute(route) {
  if (route.path === '/') return path.join(buildRoot, 'index.html');
  return path.join(buildRoot, route.path.slice(1), 'index.html');
}

function listFiles(directory, relativeDirectory = '') {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(absolutePath, relativePath));
    else if (entry.isFile()) files.push(relativePath.split(path.sep).join('/'));
  }
  return files.sort();
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function checkReleasePackage() {
  const requiredFiles = [
    'index.html',
    '404/index.html',
    '.htaccess',
    'robots.txt',
    'sitemap.xml',
    'llms.txt',
    'images/brand/centaur-careers-logo.jpg',
  ];

  if (!fs.existsSync(buildRoot)) {
    failures.push('static release package is missing build/client');
    return { files: [], totalBytes: 0 };
  }

  for (const relativePath of requiredFiles) {
    if (!fs.existsSync(path.join(buildRoot, relativePath))) failures.push(`static release package is missing ${relativePath}`);
  }
  for (const route of SEO_ROUTES) {
    const routeFile = outputFileForRoute(route);
    if (!fs.existsSync(routeFile)) failures.push(`static release package is missing route ${route.path}`);
  }
  if (fs.existsSync(path.join(buildRoot, '__spa-fallback.html'))) failures.push('static release package contains the unused SPA fallback');
  if (fs.existsSync(path.resolve('build/server'))) failures.push('static release package includes build/server');

  const files = listFiles(buildRoot).map((relativePath) => {
    const absolutePath = path.join(buildRoot, relativePath);
    return {
      path: relativePath,
      bytes: fs.statSync(absolutePath).size,
      sha256: sha256(absolutePath),
    };
  });
  return {
    files,
    totalBytes: files.reduce((total, file) => total + file.bytes, 0),
  };
}

function readGitCommit() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: process.cwd(), encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

function buildManifest(packageInfo, externalStatus) {
  return {
    schemaVersion: 1,
    status: failures.length === 0 ? 'local-qa-passed' : 'local-qa-failed',
    generatedAt: new Date().toISOString(),
    repository: 'centaur/web',
    gitCommit: readGitCommit(),
    nodeVersion: process.version,
    platform: `${os.platform()} ${os.arch()}`,
    siteOrigin: SITE_ORIGIN,
    buildDirectory: 'build/client',
    uploadBoundary: 'Upload the contents of build/client/ into the hosting document root; do not upload the build/client directory itself.',
    releaseReadyForUpload: failures.length === 0,
    indexableRouteCount: INDEXABLE_ROUTES.length,
    routeDocumentCount: SEO_ROUTES.length,
    sitemapUrlCount: fs.existsSync(path.join(buildRoot, 'sitemap.xml'))
      ? (fs.readFileSync(path.join(buildRoot, 'sitemap.xml'), 'utf8').match(/<loc>/gi) || []).length
      : 0,
    routes: SEO_ROUTES.map((route) => ({
      id: route.id,
      path: route.path,
      canonical: canonicalUrl(route),
      indexable: route.indexable,
      prerenderPath: route.path === '/' ? '/' : route.path.slice(0, -1),
    })),
    package: {
      fileCount: packageInfo.files.length,
      totalBytes: packageInfo.totalBytes,
      files: packageInfo.files,
    },
    checks: results,
    externalVerification: {
      status: externalStatus,
      command: 'npm run seo:external -- <deployed-origin>',
      requiredBeforeDeclaringLiveDeploymentVerified: true,
    },
    failures,
  };
}

function buildReport(manifest) {
  const checkLines = results.map((result) => `- ${result.status === 'skipped' ? 'SKIP' : result.passed ? 'PASS' : 'FAIL'} — \`${result.command}\` (${result.durationMs || 0} ms)`);
  const externalLine = manifest.externalVerification.status === 'passed'
    ? 'External verification was run and passed.'
    : 'External verification was not run. Set `RELEASE_EXTERNAL_ORIGIN` after deployment to verify the live host.';
  const failureLines = failures.length > 0 ? `\n## Failures\n\n${failures.map((failure) => `- ${failure}`).join('\n')}\n` : '';

  return `# Final Release QA Report

Generated: ${manifest.generatedAt}

Status: **${manifest.status}**

This report covers the repository-controlled static release package. It does not claim that search engines have indexed the site or that external authority/backlinks have been earned.

## Package

- Site origin: ${manifest.siteOrigin}
- Upload directory: \`${manifest.buildDirectory}\`
- Route documents: ${manifest.routeDocumentCount}
- Indexable routes: ${manifest.indexableRouteCount}
- Sitemap URLs: ${manifest.sitemapUrlCount}
- Package files: ${manifest.package.fileCount}
- Package bytes before transfer compression: ${manifest.package.totalBytes}
- Upload rule: upload the contents of \`build/client/\`, preserving \`.htaccess\`; do not upload the repository, \`build/server\`, or a nested \`build/client/\` directory.

## Automated checks

${checkLines.join('\n')}

## External deployment

${externalLine}

The live release remains dependent on uploading this package to the configured hosting document root, clearing any relevant cache, and running the external check against the deployed origin.

## Learning handoff

Run \`npm run release:learn\` after this QA report to record Search Console, GA4/CRM, and keep/revise/stop decision readiness. Missing exports remain pending evidence.\n${failureLines}`;
}

const gatePassed = runStep('complete SEO quality gate', ['run', 'seo:gate']);
const deploymentPassed = gatePassed && runStep('release package deployment check', ['run', 'deployment:check']);
runStep('refresh authority report', ['run', 'seo:authority:report']);
runStep('refresh measurement report', ['run', 'seo:measure:report']);

let externalStatus = 'not-run';
if (externalOrigin) {
  externalStatus = runStep('external deployed-site verification', ['run', 'seo:external', '--', externalOrigin]) ? 'passed' : 'failed';
} else {
  console.log('\n[release:qa] external deployed-site verification skipped (set RELEASE_EXTERNAL_ORIGIN to enable it)');
  results.push({ label: 'external deployed-site verification', command: 'npm run seo:external -- <deployed-origin>', passed: null, status: 'skipped' });
}

const packageInfo = checkReleasePackage();
const manifest = buildManifest(packageInfo, externalStatus);
const manifestPath = path.resolve('RELEASE_MANIFEST.json');
const reportPath = path.resolve('RELEASE_QA_REPORT.md');

try {
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  fs.writeFileSync(reportPath, buildReport(manifest), 'utf8');
  console.log(`\n[release:qa] manifest written: ${manifestPath}`);
  console.log(`[release:qa] report written: ${reportPath}`);
} catch (error) {
  failures.push(`release artifact write failed: ${error instanceof Error ? error.message : 'unknown error'}`);
}

if (failures.length > 0 || !deploymentPassed) {
  console.error(`\nFinal release QA failed: ${failures.join(', ') || 'release package check failed'}.`);
  process.exit(1);
}

console.log('\nFinal release QA passed: the static package is built, validated, checksummed, and ready for manual upload.');
