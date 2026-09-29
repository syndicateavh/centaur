#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN } from '../src/seo/siteConfig.js';
import { BACKLINK_SNAPSHOT_FILE, validateBacklinkSnapshot } from '../src/content/seo/measurementSchema.js';
import { archiveSnapshotBeforeReplace, writeSnapshot } from './measurement-storage.js';
import { findColumn, normalizeHeader, parseCsv } from './seo-csv.js';

const inputPath = process.argv[2];
const outputPath = path.resolve(BACKLINK_SNAPSHOT_FILE);

function normalizeTargetPath(rawTarget) {
  let target;
  try {
    target = new URL(rawTarget, SITE_ORIGIN);
  } catch {
    throw new Error(`Invalid backlink target URL/path: ${rawTarget}`);
  }
  const site = new URL(SITE_ORIGIN);
  const allowedHosts = new Set([site.hostname, `www.${site.hostname}`]);
  if (!allowedHosts.has(target.hostname.toLowerCase()) || !['http:', 'https:'].includes(target.protocol)) {
    throw new Error(`Backlink target is outside the configured site: ${rawTarget}`);
  }
  let targetPath = target.pathname;
  if (targetPath !== '/' && !targetPath.endsWith('/')) targetPath += '/';
  return targetPath;
}

if (!inputPath) {
  console.error('Usage: npm run seo:measure:import:backlinks -- C:\\path\\to\\backlink-audit.csv');
  process.exit(1);
}

try {
  const csv = fs.readFileSync(path.resolve(inputPath), 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error('The backlink audit CSV has no data rows');
  const headers = rows[0].map(normalizeHeader);
  const sourceColumn = findColumn(headers, [/^source url$/, /^referring url$/, /^url$/]);
  const targetColumn = findColumn(headers, [/^target path$/, /^target url$/, /^target url path$/, /^destination url$/]);
  const statusColumn = findColumn(headers, [/^status$/, /^link status$/]);
  const checkedColumn = findColumn(headers, [/^last checked$/, /^last checked at$/, /^date$/]);
  const anchorColumn = findColumn(headers, [/^anchor text$/, /^anchor$/]);
  const relColumn = findColumn(headers, [/^rel$/, /^link attribute$/]);
  if (sourceColumn < 0 || targetColumn < 0 || statusColumn < 0) throw new Error('The CSV must contain Source URL, Target URL/Path, and Status columns');

  const records = rows.slice(1).map((row) => {
    const sourceUrl = String(row[sourceColumn] || '').trim();
    const rawTarget = String(row[targetColumn] || '').trim();
    const targetPath = normalizeTargetPath(rawTarget);
    return {
      sourceUrl,
      targetPath,
      status: String(row[statusColumn] || '').trim().toLowerCase(),
      lastCheckedAt: checkedColumn >= 0 ? String(row[checkedColumn] || '').trim() || null : null,
      anchorText: anchorColumn >= 0 ? String(row[anchorColumn] || '').trim() || null : null,
      rel: relColumn >= 0 ? String(row[relColumn] || '').trim() || null : null,
    };
  });
  const snapshot = {
    source: 'manual backlink audit CSV',
    importedAt: new Date().toISOString(),
    importedThrough: 'in-house CSV workflow',
    records,
  };
  const errors = validateBacklinkSnapshot(snapshot);
  if (errors.length > 0) throw new Error(`Backlink snapshot validation failed:\n- ${errors.join('\n- ')}`);
  const archivedPath = archiveSnapshotBeforeReplace({ outputPath, archiveName: 'backlinks' });
  writeSnapshot(outputPath, snapshot);
  console.log(`Imported ${records.length} backlink audit rows into ${path.relative(process.cwd(), outputPath)}.`);
  if (archivedPath) console.log(`Previous backlink snapshot archived at ${path.relative(process.cwd(), archivedPath)}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Backlink audit import failed');
  process.exit(1);
}
