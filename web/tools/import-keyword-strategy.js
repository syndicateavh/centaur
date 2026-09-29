#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const inputPath = process.argv[2];
const outputPath = path.resolve('src/content/seo/keywordStrategyData.js');
const EXPECTED_KEYWORD_COUNT = 728;

function readZipEntry(buffer, entryName) {
  let endOfCentralDirectory = -1;
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      endOfCentralDirectory = offset;
      break;
    }
  }
  if (endOfCentralDirectory < 0) throw new Error('The workbook is not a readable ZIP/XLSX file');

  const entryCount = buffer.readUInt16LE(endOfCentralDirectory + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(endOfCentralDirectory + 16);
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('The workbook ZIP directory is malformed');
    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);
    if (name === entryName) {
      if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) throw new Error(`Malformed local ZIP entry: ${entryName}`);
      const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
      if (compressionMethod === 0) return compressed.toString('utf8');
      if (compressionMethod === 8) return zlib.inflateRawSync(compressed).toString('utf8');
      throw new Error(`Unsupported ZIP compression method ${compressionMethod} for ${entryName}`);
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error(`Workbook entry not found: ${entryName}`);
}

function xmlDecode(value) {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function textFromXml(value) {
  return [...String(value).matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)]
    .map((match) => xmlDecode(match[1]))
    .join('');
}

function xmlAttribute(attributes, name) {
  return String(attributes).match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || '';
}

function readSharedStrings(workbookBuffer) {
  const xml = readZipEntry(workbookBuffer, 'xl/sharedStrings.xml');
  return [...xml.matchAll(/<(?:\w+:)?si\b[^>]*>([\s\S]*?)<\/(?:\w+:)?si>/g)].map((match) => textFromXml(match[1]));
}

function readWorksheet(workbookBuffer, entryName, sharedStrings) {
  const xml = readZipEntry(workbookBuffer, entryName);
  const rows = new Map();

  for (const match of xml.matchAll(/<(?:\w+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/g)) {
    const attributes = match[1];
    const body = match[2] || '';
    const reference = xmlAttribute(attributes, 'r');
    const rowNumber = Number(reference.match(/\d+/)?.[0]);
    const columnLetters = reference.match(/^[A-Z]+/)?.[0] || '';
    if (!Number.isInteger(rowNumber) || !columnLetters) continue;

    let columnNumber = 0;
    for (const character of columnLetters) columnNumber = columnNumber * 26 + character.charCodeAt(0) - 64;

    const type = xmlAttribute(attributes, 't');
    const rawValue = body.match(/<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/)?.[1] || '';
    let value = type === 'inlineStr' ? textFromXml(body) : xmlDecode(rawValue);
    if (type === 's') value = sharedStrings[Number(rawValue)] || '';

    if (!rows.has(rowNumber)) rows.set(rowNumber, new Map());
    rows.get(rowNumber).set(columnNumber, value);
  }
  return rows;
}

function rowsToRecords(rows) {
  const headerRow = rows.get(1);
  if (!headerRow) throw new Error('Worksheet is missing its header row');
  const headers = [...headerRow.entries()].sort(([left], [right]) => left - right);
  return [...rows.entries()]
    .filter(([rowNumber]) => rowNumber > 1)
    .sort(([left], [right]) => left - right)
    .map(([, row]) => Object.fromEntries(headers.map(([columnNumber, header]) => [header, row.get(columnNumber) || ''])));
}

function numberOrValue(value, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be numeric, received ${JSON.stringify(value)}`);
  return parsed;
}

function normalizeKeyword(value) {
  return String(value).toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
}

function mapKeywordRecord(row) {
  const keyword = String(row.Keyword || '').replace(/\s+/g, ' ').trim();
  return {
    id: numberOrValue(row.ID, `Keyword ID for ${keyword}`),
    keyword,
    normalizedKeyword: normalizeKeyword(keyword),
    cluster: String(row.Cluster || '').trim(),
    intent: String(row.Intent || '').trim(),
    funnel: String(row.Funnel || '').trim(),
    priority: numberOrValue(row['Priority /100'], `Priority for ${keyword}`),
    targetUrl: String(row['Recommended Target URL'] || '').trim(),
    pageType: String(row['Page Type'] || '').trim(),
    pageAction: String(row['Page Action'] || '').trim(),
    pageTheme: String(row['Suggested Page Theme'] || '').trim(),
    competitors: String(row['Main Competitors'] || '').trim(),
    evidenceUrl: String(row['Evidence URL'] || '').trim(),
    wave: String(row.Wave || '').trim(),
    notes: String(row.Notes || '').trim(),
  };
}

function mapArchitectureRecord(row) {
  return {
    targetUrl: String(row['Target URL'] || '').trim(),
    primaryPurpose: String(row['Primary Purpose'] || '').trim(),
    mappedKeywordCount: numberOrValue(row['Mapped Keyword Count'], `Mapped keyword count for ${row['Target URL']}`),
    topPriority: numberOrValue(row['Top Priority'], `Top priority for ${row['Target URL']}`),
    mainClusters: String(row['Main Clusters'] || '').trim(),
    recommendedWave: String(row['Recommended Wave'] || '').trim(),
    pageType: String(row['Page Type'] || '').trim(),
    buildGuidance: String(row['Build Guidance'] || '').trim(),
    sampleKeywords: String(row['Sample Keywords'] || '').trim(),
  };
}

if (!inputPath) {
  console.error('Usage: node tools/import-keyword-strategy.js C:\\path\\to\\Centaur_Careers_Competitor_SEO_728_Keyword_Strategy.xlsx');
  process.exit(1);
}

try {
  const workbookPath = path.resolve(inputPath);
  const workbookBuffer = fs.readFileSync(workbookPath);
  const sharedStrings = readSharedStrings(workbookBuffer);
  const keywordRows = rowsToRecords(readWorksheet(workbookBuffer, 'xl/worksheets/sheet3.xml', sharedStrings));
  const architectureRows = rowsToRecords(readWorksheet(workbookBuffer, 'xl/worksheets/sheet4.xml', sharedStrings));
  const keywords = keywordRows.map(mapKeywordRecord);
  const architecture = architectureRows.map(mapArchitectureRecord);

  if (keywords.length !== EXPECTED_KEYWORD_COUNT) throw new Error(`Expected ${EXPECTED_KEYWORD_COUNT} keyword rows, found ${keywords.length}`);
  if (architecture.length !== 24) throw new Error(`Expected 24 content architecture rows, found ${architecture.length}`);
  const duplicateKeywords = keywords.filter((row, index) => keywords.findIndex((candidate) => candidate.normalizedKeyword === row.normalizedKeyword) !== index);
  if (duplicateKeywords.length > 0) throw new Error(`Duplicate normalized keywords found: ${duplicateKeywords.map((row) => row.keyword).join(', ')}`);
  if (keywords.some((row) => !row.keyword || !row.cluster || !row.intent || !row.funnel || !row.targetUrl || !row.pageType || !row.pageAction || !row.wave)) {
    throw new Error('Every keyword row must contain keyword, cluster, intent, funnel, target URL, page type, action, and wave');
  }

  const source = {
    workbook: path.basename(workbookPath),
    keywordSheet: 'Keyword Map',
    architectureSheet: 'Content Architecture',
    keywordCount: keywords.length,
    targetUrlCount: architecture.length,
    importedOn: '2026-09-13',
    normalization: 'Preserve workbook wording; collapse whitespace and normalize case/dash variants for ownership checks.',
  };
  const module = `// Generated from the approved 728-keyword strategy workbook. Do not edit rows manually.\n// Re-import with: node tools/import-keyword-strategy.js <path-to-workbook>\n\nexport const KEYWORD_STRATEGY_SOURCE = Object.freeze(${JSON.stringify(source, null, 2)});\n\nexport const KEYWORD_STRATEGY_ROWS = Object.freeze(${JSON.stringify(keywords, null, 2)});\n\nexport const KEYWORD_PAGE_ARCHITECTURE = Object.freeze(${JSON.stringify(architecture, null, 2)});\n`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, module, 'utf8');
  console.log(`Imported ${keywords.length} keywords and ${architecture.length} target-page definitions into ${path.relative(process.cwd(), outputPath)}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Keyword strategy import failed');
  process.exit(1);
}
