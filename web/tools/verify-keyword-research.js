#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { getKeywordCandidates, getKeywordClusters, KEYWORD_RESEARCH_CONFIG } from '../src/content/seo/keywordResearch.js';

const failures = [];
const keywords = getKeywordCandidates();
const values = keywords.map((candidate) => candidate.keyword.toLowerCase());

function fail(message) {
  failures.push(message);
}

if (keywords.length !== KEYWORD_RESEARCH_CONFIG.targetCount) {
  fail(`candidate inventory must contain exactly ${KEYWORD_RESEARCH_CONFIG.targetCount} terms, found ${keywords.length}`);
}
if (new Set(values).size !== values.length) fail('candidate inventory contains duplicate keywords');
if (getKeywordClusters().length < 10) fail('candidate inventory must cover at least 10 topic clusters');
for (const candidate of keywords) {
  if (!candidate.keyword || !candidate.cluster || !candidate.intent || !candidate.targetUrl) fail('every candidate must have keyword, cluster, intent, and target URL mapping');
  if (candidate.semrush?.volume !== null || candidate.semrush?.keywordDifficulty !== null) fail('candidate inventory must not present unverified Semrush metrics as facts');
}

const importTool = fs.readFileSync(path.resolve('tools/import-semrush-keywords.js'), 'utf8');
for (const required of ['Keyword', 'Volume', 'keywordDifficulty', 'MAX_KEYWORDS = 728', 'country: \'IN\'']) {
  if (!importTool.includes(required)) fail(`Semrush import tool is missing ${required}`);
}

if (failures.length > 0) {
  console.error(`Keyword research verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Keyword research verified: ${keywords.length} mapped candidate terms across ${getKeywordClusters().length} clusters; Semrush metrics remain import-controlled.`);
