#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const outputPath = path.join(projectRoot, 'data/seo/keyword-gap/semrush-organic-competitors-keyword-gap-2026-09-23.json');
const expectedBaseHeaders = [
  'Keyword',
  'Intents',
  'Volume',
  'Keyword Difficulty',
  'CPC',
  'Competition Density',
];

function zipEntries(buffer) {
  let endOffset = -1;
  const searchStart = Math.max(0, buffer.length - 22 - 0xffff);
  for (let offset = buffer.length - 22; offset >= searchStart; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      endOffset = offset;
      break;
    }
  }
  if (endOffset < 0) throw new Error('The workbook is not a readable ZIP/XLSX file');

  const count = buffer.readUInt16LE(endOffset + 10);
  const directoryOffset = buffer.readUInt32LE(endOffset + 16);
  const entries = new Map();
  let offset = directoryOffset;

  for (let index = 0; index < count; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('The workbook ZIP directory is malformed');
    const entry = {
      compressionMethod: buffer.readUInt16LE(offset + 10),
      compressedSize: buffer.readUInt32LE(offset + 20),
      uncompressedSize: buffer.readUInt32LE(offset + 24),
      nameLength: buffer.readUInt16LE(offset + 28),
      extraLength: buffer.readUInt16LE(offset + 30),
      commentLength: buffer.readUInt16LE(offset + 32),
      localHeaderOffset: buffer.readUInt32LE(offset + 42),
    };
    const nameStart = offset + 46;
    const name = buffer.toString('utf8', nameStart, nameStart + entry.nameLength);
    entries.set(name, entry);
    offset += 46 + entry.nameLength + entry.extraLength + entry.commentLength;
  }
  return entries;
}

function readZipEntry(buffer, entries, name) {
  const entry = entries.get(name);
  if (!entry) throw new Error(`Workbook entry not found: ${name}`);
  const localOffset = entry.localHeaderOffset;
  if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error(`Malformed ZIP entry: ${name}`);
  const fileNameLength = buffer.readUInt16LE(localOffset + 26);
  const extraLength = buffer.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + fileNameLength + extraLength;
  const compressed = buffer.subarray(dataStart, dataStart + entry.compressedSize);
  let result;
  if (entry.compressionMethod === 0) result = compressed;
  else if (entry.compressionMethod === 8) result = zlib.inflateRawSync(compressed);
  else throw new Error(`Unsupported ZIP compression method ${entry.compressionMethod} for ${name}`);
  if (result.length !== entry.uncompressedSize) throw new Error(`Unexpected uncompressed size for ${name}`);
  return result.toString('utf8');
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

function xmlAttribute(attributes, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return xmlDecode(String(attributes).match(new RegExp(`(?:^|\\s)${escapedName}="([^"]*)"`))?.[1] || '');
}

function textFromXml(xml) {
  return [...String(xml).matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)]
    .map((match) => xmlDecode(match[1]))
    .join('');
}

function readWorkbookSheets(workbookBuffer, entries) {
  const workbookXml = readZipEntry(workbookBuffer, entries, 'xl/workbook.xml');
  const relationshipsXml = readZipEntry(workbookBuffer, entries, 'xl/_rels/workbook.xml.rels');
  const relationships = new Map();
  for (const match of relationshipsXml.matchAll(/<(?:\w+:)?Relationship\b([^>]*?)\/?\s*>/g)) {
    const id = xmlAttribute(match[1], 'Id');
    const target = xmlAttribute(match[1], 'Target');
    const mode = xmlAttribute(match[1], 'TargetMode');
    if (id && mode !== 'External') relationships.set(id, target);
  }

  const sheetSection = workbookXml.match(/<(?:\w+:)?sheets\b[^>]*>([\s\S]*?)<\/(?:\w+:)?sheets>/)?.[1] || '';
  const sheets = [...sheetSection.matchAll(/<(?:\w+:)?sheet\b([^>]*?)\/?\s*>/g)].map((match) => {
    const attributes = match[1];
    const relationshipId = xmlAttribute(attributes, 'r:id');
    const target = relationships.get(relationshipId);
    if (!target) throw new Error(`Worksheet relationship is missing for ${xmlAttribute(attributes, 'name')}`);
    const worksheetPath = target.startsWith('/')
      ? target.slice(1)
      : path.posix.normalize(path.posix.join('xl', target));
    return {
      name: xmlAttribute(attributes, 'name'),
      state: xmlAttribute(attributes, 'state') || 'visible',
      path: worksheetPath,
    };
  });

  const worksheetFiles = [...entries.keys()].filter((name) => /^xl\/worksheets\/sheet[^/]+\.xml$/.test(name));
  if (sheets.length !== 1 || worksheetFiles.length !== 1 || sheets[0].state !== 'visible') {
    throw new Error(`Expected one visible worksheet; found ${sheets.length} workbook sheets and ${worksheetFiles.length} worksheet files`);
  }
  if (!entries.has(sheets[0].path)) throw new Error(`Worksheet XML not found: ${sheets[0].path}`);
  return sheets;
}

function columnNumber(letters) {
  let number = 0;
  for (const character of letters) number = number * 26 + character.charCodeAt(0) - 64;
  return number;
}

function readWorksheet(workbookBuffer, entries, worksheetPath) {
  const sharedStrings = entries.has('xl/sharedStrings.xml')
    ? [...readZipEntry(workbookBuffer, entries, 'xl/sharedStrings.xml').matchAll(/<(?:\w+:)?si\b[^>]*>([\s\S]*?)<\/(?:\w+:)?si>/g)]
      .map((match) => textFromXml(match[1]))
    : [];
  const xml = readZipEntry(workbookBuffer, entries, worksheetPath);
  if (/<(?:\w+:)?f\b/.test(xml)) throw new Error('Formula cells are not expected in the Semrush export');

  const rows = [];
  for (const rowMatch of xml.matchAll(/<(?:\w+:)?row\b([^>]*?)>([\s\S]*?)<\/(?:\w+:)?row>/g)) {
    const rowNumber = Number(xmlAttribute(rowMatch[1], 'r'));
    const cells = new Map();
    for (const cellMatch of rowMatch[2].matchAll(/<(?:\w+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/g)) {
      const attributes = cellMatch[1];
      const body = cellMatch[2] || '';
      const reference = xmlAttribute(attributes, 'r');
      const letters = reference.match(/^[A-Z]+/)?.[0];
      if (!letters) continue;
      const type = xmlAttribute(attributes, 't');
      const rawValue = body.match(/<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/)?.[1] || '';
      let value = type === 'inlineStr' ? textFromXml(body) : xmlDecode(rawValue);
      if (type === 's') value = sharedStrings[Number(rawValue)] ?? '';
      else if (type === 'str') value = xmlDecode(rawValue);
      else if (type === 'b') value = rawValue === '1' ? 'true' : 'false';
      cells.set(columnNumber(letters), value);
    }
    if (cells.size > 0) rows.push({ rowNumber, cells });
  }
  return rows;
}

function parseNumber(value, field, rowNumber, { integer = false, allowMinusOne = false } = {}) {
  if (value === '' || value === null || value === undefined) return null;
  const normalized = String(value).replace(/,/g, '').trim();
  const parsed = Number(normalized);
  const retainedMinusOne = allowMinusOne && parsed === -1;
  if (!Number.isFinite(parsed) || (parsed < 0 && !retainedMinusOne) || (integer && !Number.isInteger(parsed))) {
    throw new Error(`Row ${rowNumber}: ${field} must be a ${integer ? 'non-negative integer' : 'non-negative number'}${allowMinusOne ? ' or -1' : ''}, received ${JSON.stringify(value)}`);
  }
  return Number(parsed.toFixed(6));
}

function normalizedKeyword(value) {
  return String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

function filenameExportTimestamp(filename) {
  const match = filename.match(/^gap\.keywords_(\d{4}-\d{2}-\d{2}T\d{2})_(\d{2})_(\d{2}\.\d+Z)\.xlsx$/i);
  return match ? `${match[1]}:${match[2]}:${match[3]}` : null;
}

function buildRecords(rows) {
  if (rows.length < 2) throw new Error('The workbook has no keyword data rows');
  const orderedRows = [...rows].sort((left, right) => left.rowNumber - right.rowNumber);
  const headerCells = orderedRows[0].cells;
  const headers = [...headerCells.entries()].sort(([left], [right]) => left - right).map(([, value]) => String(value).trim());
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  if (headerIndex.size !== headers.length) throw new Error('The worksheet contains duplicate column headers');
  for (const header of expectedBaseHeaders) {
    if (!headerIndex.has(header)) throw new Error(`Required column is missing: ${header}`);
  }

  const domainHeaders = headers.slice(expectedBaseHeaders.length, expectedBaseHeaders.length + 5);
  if (domainHeaders.length !== 5 || domainHeaders.some((domain) => !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain))) {
    throw new Error('Expected five domain position columns immediately after the metric columns');
  }
  const pageHeaders = domainHeaders.map((domain) => `${domain} (pages)`);
  for (const header of [...pageHeaders, 'Results']) {
    if (!headerIndex.has(header)) throw new Error(`Required column is missing: ${header}`);
  }
  if (headers.length !== expectedBaseHeaders.length + domainHeaders.length + pageHeaders.length + 1) {
    throw new Error(`Unexpected worksheet columns: ${headers.join(', ')}`);
  }

  const seen = new Set();
  const keywords = [];
  const rowNumbers = new Set();
  for (const { rowNumber, cells } of orderedRows.slice(1)) {
    if (rowNumbers.has(rowNumber)) throw new Error(`Duplicate worksheet row number: ${rowNumber}`);
    rowNumbers.add(rowNumber);
    const row = Object.fromEntries(headers.map((header, index) => [header, String(cells.get(index + 1) ?? '')]));
    const keyword = row.Keyword.trim();
    if (!keyword) throw new Error(`Row ${rowNumber}: Keyword is empty`);
    const normalized = normalizedKeyword(keyword);
    if (seen.has(normalized)) throw new Error(`Duplicate normalized keyword at row ${rowNumber}: ${keyword}`);
    seen.add(normalized);

    const positions = {};
    const rankingPages = {};
    for (const domain of domainHeaders) {
      positions[domain] = parseNumber(row[domain], `${domain} position`, rowNumber, { integer: true });
      if (positions[domain] === null) throw new Error(`Row ${rowNumber}: ${domain} position is blank; Semrush 0 denotes no ranking`);
      rankingPages[domain] = row[`${domain} (pages)`].trim() || null;
    }

    keywords.push({
      keyword,
      normalizedKeyword: normalized,
      intents: row.Intents.trim() || null,
      volume: parseNumber(row.Volume, 'Volume', rowNumber, { integer: true }),
      keywordDifficulty: parseNumber(row['Keyword Difficulty'], 'Keyword Difficulty', rowNumber, { allowMinusOne: true }),
      cpc: parseNumber(row.CPC, 'CPC', rowNumber),
      competitionDensity: parseNumber(row['Competition Density'], 'Competition Density', rowNumber),
      positions,
      rankingPages,
      results: parseNumber(row.Results, 'Results', rowNumber, { integer: true }),
    });
  }

  return { headers, domains: domainHeaders, keywords };
}

function main() {
  const inputArgument = process.argv[2];
  if (!inputArgument) {
    throw new Error('Usage: npm run seo:keywords:gap:import -- <path-to-Semrush-gap.xlsx>');
  }
  const workbookPath = path.resolve(inputArgument);
  if (!fs.existsSync(workbookPath) || !fs.statSync(workbookPath).isFile()) {
    throw new Error(`Input workbook does not exist: ${workbookPath}`);
  }

  const workbookBuffer = fs.readFileSync(workbookPath);
  const workbookEntries = zipEntries(workbookBuffer);
  const sheets = readWorkbookSheets(workbookBuffer, workbookEntries);
  const worksheetRows = readWorksheet(workbookBuffer, workbookEntries, sheets[0].path);
  const { headers, domains, keywords } = buildRecords(worksheetRows);
  const targetDomain = domains[0];
  const competitors = domains.slice(1);
  if (targetDomain !== 'centaurcareers.in') {
    throw new Error(`Expected centaurcareers.in as the first domain, found ${targetDomain}`);
  }

  const targetRankedKeywordCount = keywords.filter((row) => row.positions[targetDomain] > 0).length;
  const keywordDifficultyMinusOneCount = keywords.filter((row) => row.keywordDifficulty === -1).length;
  const competitorTopTenKeywordCount = keywords.filter((row) => competitors.some((domain) => row.positions[domain] > 0 && row.positions[domain] <= 10)).length;
  const competitorCoverage = Object.fromEntries(competitors.map((domain) => [
    domain,
    keywords.filter((row) => row.positions[domain] > 0).length,
  ]));

  const sourceBytes = fs.statSync(workbookPath);
  const source = {
    provider: 'Semrush',
    report: 'Organic competitors / keyword-gap export (filename-derived)',
    filename: path.basename(workbookPath),
    sha256: crypto.createHash('sha256').update(workbookBuffer).digest('hex'),
    sizeBytes: sourceBytes.size,
    fileLastModifiedAt: sourceBytes.mtime.toISOString(),
    exportTimestampFromFilename: filenameExportTimestamp(path.basename(workbookPath)),
    importedAt: new Date().toISOString(),
    importedBy: 'tools/import-semrush-keyword-gap.js',
    analyzedDomain: targetDomain,
    competitors,
    worksheet: sheets[0].name,
    sourceSettings: {
      country: null,
      language: null,
      database: null,
      device: null,
      unavailableReason: 'These settings are not present in the workbook columns or workbook properties; they have not been inferred.',
    },
    columns: headers,
    fieldNotes: {
      positions: 'Semrush numeric position copied as exported; 0 means no ranking was reported for that domain.',
      rankingPages: 'Semrush page URL copied as exported; blank cells are null.',
      intents: 'Semrush intent text copied as exported.',
      keywordDifficulty: '-1 values are retained exactly and counted separately; confirm their Semrush meaning before using them as difficulty scores.',
      numericPrecision: 'Numeric values are normalized to six decimal places to remove Excel floating-point artifacts.',
    },
  };

  const data = {
    schemaVersion: 1,
    source,
    validation: {
      worksheetCount: sheets.length,
      rowCount: keywords.length,
      uniqueKeywordCount: new Set(keywords.map((row) => row.normalizedKeyword)).size,
      duplicateKeywordCount: 0,
      keywordDifficultyMinusOneCount,
      targetRankedKeywordCount,
      competitorTopTenKeywordCount,
      competitorCoverage,
    },
    keywords,
  };

  if (fs.existsSync(outputPath)) {
    let existing;
    try {
      existing = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    } catch {
      throw new Error(`Refusing to overwrite an unrecognized existing file: ${path.relative(projectRoot, outputPath)}`);
    }
    if (existing.source?.importedBy !== 'tools/import-semrush-keyword-gap.js') {
      throw new Error(`Refusing to overwrite a file not generated by this importer: ${path.relative(projectRoot, outputPath)}`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  fs.renameSync(temporaryPath, outputPath);

  console.log(`Validated and imported ${keywords.length.toLocaleString('en-US')} unique keywords into ${path.relative(projectRoot, outputPath)}.`);
  console.log(`Analyzed domain: ${targetDomain}; competitors: ${competitors.join(', ')}.`);
  console.log(`Target-domain rankings in this export: ${targetRankedKeywordCount}; competitor top-10 coverage: ${competitorTopTenKeywordCount.toLocaleString('en-US')} keywords.`);
  console.log('Country, language, database, and device remain unknown because the workbook does not contain those settings.');
  console.log(`Source SHA-256: ${source.sha256}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Semrush keyword-gap import failed');
  process.exit(1);
}
