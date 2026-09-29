#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { APPROVED_CONTENT_SOURCE } from '../src/content/verifiedClaims.js';
import { PROTECTED_CONTENT_FILES } from '../src/content/contentGovernance.js';

if (process.argv[2] !== '--approve') {
  console.error('Refusing to update the content baseline without explicit approval. Use: npm run content:baseline:update');
  process.exit(1);
}

const manifestPath = path.resolve('docs/content-protection-manifest.json');
const files = [APPROVED_CONTENT_SOURCE.file, ...PROTECTED_CONTENT_FILES];
const missing = files.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length > 0) {
  console.error(`Cannot create content baseline; missing files:\n- ${missing.join('\n- ')}`);
  process.exit(1);
}

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.resolve(file))).digest('hex');
const manifest = {
  schemaVersion: 1,
  baselineDate: new Date().toISOString().slice(0, 10),
  purpose: 'Protect approved original literature and business-fact source files from accidental SEO rewrites.',
  approvalRequired: true,
  approvedOriginalSource: {
    path: APPROVED_CONTENT_SOURCE.file,
    description: APPROVED_CONTENT_SOURCE.description,
    sha256: sha256(APPROVED_CONTENT_SOURCE.file),
  },
  protectedFiles: PROTECTED_CONTENT_FILES.map((file) => ({ path: file, sha256: sha256(file) })),
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Content protection baseline updated: ${manifestPath}`);
