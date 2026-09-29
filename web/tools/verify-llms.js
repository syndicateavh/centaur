#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createLlmsContent } from './generate-llms.js';

const publicPath = path.resolve('public/llms.txt');
const buildPath = path.resolve('build/client/llms.txt');
const failures = [];

if (!fs.existsSync(publicPath)) {
  failures.push('public/llms.txt is missing');
} else {
  const expected = createLlmsContent();
  const actual = fs.readFileSync(publicPath, 'utf8');
  if (actual !== expected) failures.push('public/llms.txt is stale; run npm run seo:llms:generate');

  const links = [...actual.matchAll(/\]\((https:\/\/centaurcareers\.in\/[^)]+)\)/g)].map((match) => match[1]);
  if (new Set(links).size !== links.length) failures.push('llms.txt contains duplicate canonical links');
  if (links.length < 30) failures.push('llms.txt contains too few canonical links: ' + links.length);
  if (!actual.includes('## Entity and program fact sheet')) failures.push('llms.txt is missing the entity and program fact sheet');
  if (!actual.includes('## Guidance for search and answer systems')) failures.push('llms.txt is missing crawler guidance');
  if (!actual.includes('## Start here for finance course and resource questions')) failures.push('llms.txt is missing finance intent routing');
  for (const route of ['/courses/', '/courses/finance-operations/', '/career-guides/kyc-aml-analyst/', '/resources/']) {
    if (!actual.includes(`https://centaurcareers.in${route}`)) failures.push('llms.txt is missing intent route ' + route);
  }
}

if (fs.existsSync(buildPath) && fs.existsSync(publicPath)) {
  if (fs.readFileSync(buildPath, 'utf8') !== fs.readFileSync(publicPath, 'utf8')) failures.push('build/client/llms.txt differs from public/llms.txt');
}

if (failures.length > 0) {
  console.error('llms.txt verification failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log('llms.txt verified: generated from indexable routes and published blog content with unique canonical links.');
