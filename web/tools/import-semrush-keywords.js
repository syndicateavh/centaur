#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];
const outputPath = path.resolve('src/content/seo/semrushKeywords.json');
const MAX_KEYWORDS = 728;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
  }
  return rows;
}

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[%()]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function columnIndex(headers, patterns) {
  return headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
}

function numberValue(value, fieldName, rowNumber) {
  const normalized = String(value || '').replace(/,/g, '').replace(/%/g, '').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Row ${rowNumber}: ${fieldName} must be a non-negative number`);
  return parsed;
}

if (!inputPath) {
  console.error('Usage: npm run seo:keywords:import -- C:\\path\\to\\semrush-india-keywords.csv');
  process.exit(1);
}

try {
  const csv = fs.readFileSync(path.resolve(inputPath), 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error('The Semrush CSV has no data rows');

  const headers = rows[0].map(normalizeHeader);
  const keywordColumn = columnIndex(headers, [/^keyword$/, /^phrase$/]);
  const volumeColumn = columnIndex(headers, [/^volume$/, /search volume/]);
  const difficultyColumn = columnIndex(headers, [/^kd$/, /keyword difficulty/]);
  const intentColumn = columnIndex(headers, [/^intent$/, /search intent/]);
  const cpcColumn = columnIndex(headers, [/^cpc$/, /cost per click/]);
  if (keywordColumn < 0 || volumeColumn < 0) throw new Error('The Semrush CSV must contain Keyword and Volume columns');

  const seen = new Set();
  const records = [];
  for (const [index, row] of rows.slice(1).entries()) {
    const rowNumber = index + 2;
    const keyword = String(row[keywordColumn] || '').trim().replace(/\s+/g, ' ');
    if (!keyword) continue;
    const normalizedKeyword = keyword.toLowerCase();
    if (seen.has(normalizedKeyword)) continue;
    seen.add(normalizedKeyword);
    records.push({
      keyword,
      volume: numberValue(row[volumeColumn], 'Volume', rowNumber),
      keywordDifficulty: difficultyColumn >= 0 ? numberValue(row[difficultyColumn], 'KD', rowNumber) : null,
      intent: intentColumn >= 0 ? String(row[intentColumn] || '').trim().toLowerCase() || null : null,
      cpc: cpcColumn >= 0 ? numberValue(row[cpcColumn], 'CPC', rowNumber) : null,
      source: 'semrush',
      country: 'IN',
    });
  }

  records.sort((left, right) => (right.volume || 0) - (left.volume || 0) || left.keyword.localeCompare(right.keyword));
  const selected = records.slice(0, MAX_KEYWORDS);
  if (selected.length === 0) throw new Error('The Semrush CSV did not contain usable keyword rows');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify({
    source: 'Semrush Keyword Magic Tool export',
    importedAt: new Date().toISOString(),
    country: 'IN',
    language: 'en',
    limit: MAX_KEYWORDS,
    keywords: selected,
  }, null, 2)}\n`, 'utf8');
  console.log(`Imported ${selected.length} Semrush keyword records into ${path.relative(process.cwd(), outputPath)}.`);
  if (records.length > MAX_KEYWORDS) console.log(`Selected the top ${MAX_KEYWORDS} rows by exported volume from ${records.length} unique rows.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Semrush keyword import failed');
  process.exit(1);
}
