#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN } from '../src/seo/siteConfig.js';
import {
  SEARCH_CONSOLE_SNAPSHOT_FILES,
  validateSearchConsoleSnapshot,
} from '../src/content/seo/measurementSchema.js';
import { archiveSnapshotBeforeReplace, writeSnapshot } from './measurement-storage.js';
import { findColumn, normalizeHeader, numberValue, parseCsv, percentageValue } from './seo-csv.js';

const inputArguments = process.argv.slice(2);

function parseArguments(args) {
  const options = { inputPath: null, from: null, to: null, property: null, searchType: null, country: null, device: null, filters: null };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (['--from', '--to', '--property', '--search-type', '--country', '--device', '--filters'].includes(argument)) {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
      options[argument.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
      index += 1;
    } else if (argument.startsWith('--')) {
      throw new Error(`Unknown option: ${argument}`);
    } else if (options.inputPath) {
      throw new Error('Only one input CSV path may be supplied');
    } else {
      options.inputPath = argument;
    }
  }
  if (!options.inputPath) throw new Error('A Search Console CSV path is required');
  if (Boolean(options.from) !== Boolean(options.to)) throw new Error('Provide both --from and --to, or neither');
  const context = ['property', 'searchType', 'country', 'device', 'filters'];
  if (context.some((key) => options[key]) && context.some((key) => !options[key])) {
    throw new Error('For comparable exports provide all of --property, --search-type, --country, --device, and --filters (use "none" when no extra filter was applied)');
  }
  return options;
}

function normalizePage(rawPage) {
  let url;
  try {
    url = new URL(rawPage, SITE_ORIGIN);
  } catch {
    throw new Error(`Invalid Search Console page URL: ${rawPage}`);
  }
  const site = new URL(SITE_ORIGIN);
  const allowedHosts = new Set([site.hostname, `www.${site.hostname}`]);
  if (!allowedHosts.has(url.hostname.toLowerCase()) || !['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Search Console page is outside the configured site: ${rawPage}`);
  }
  let page = url.pathname;
  if (page !== '/' && !page.endsWith('/')) page += '/';
  return page;
}

function validDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`)) || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} must be a valid YYYY-MM-DD date`);
  }
  return value;
}

try {
  const options = parseArguments(inputArguments);
  const csv = fs.readFileSync(path.resolve(options.inputPath), 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error('The Search Console CSV has no data rows');
  const headers = rows[0].map(normalizeHeader);
  const dateColumn = findColumn(headers, [/^date$/]);
  const queryColumn = findColumn(headers, [/^top queries?$/, /^query$/]);
  const pageColumn = findColumn(headers, [/^top pages?$/, /^page$/]);
  const clicksColumn = findColumn(headers, [/^clicks?$/]);
  const impressionsColumn = findColumn(headers, [/^impressions?$/]);
  const ctrColumn = findColumn(headers, [/^ctr$/]);
  const positionColumn = findColumn(headers, [/^position$/]);
  if (clicksColumn < 0 || impressionsColumn < 0) throw new Error('The CSV must contain Clicks and Impressions columns');
  if (queryColumn < 0 && pageColumn < 0) throw new Error('The CSV must contain a Query or Page dimension column');
  if (dateColumn < 0 && (!options.from || !options.to)) {
    throw new Error('This Search Console export has no Date column. Pass the selected report period with --from YYYY-MM-DD --to YYYY-MM-DD.');
  }

  const records = [];
  for (const [index, row] of rows.slice(1).entries()) {
    const rowNumber = index + 2;
    const query = queryColumn >= 0 ? String(row[queryColumn] || '').trim() : '';
    const rawPage = pageColumn >= 0 ? String(row[pageColumn] || '').trim() : '';
    if (!query && !rawPage) continue;
    if (query && rawPage) throw new Error(`Row ${rowNumber}: provide either a Query or Page dimension, not both`);

    const date = dateColumn >= 0 ? validDate(String(row[dateColumn] || '').trim(), `Row ${rowNumber} Date`) : null;
    records.push({
      date,
      dimension: query ? 'query' : 'page',
      query: query || null,
      page: rawPage ? normalizePage(rawPage) : null,
      clicks: numberValue(row[clicksColumn], 'Clicks', rowNumber),
      impressions: numberValue(row[impressionsColumn], 'Impressions', rowNumber),
      ctrPercent: ctrColumn >= 0 ? percentageValue(row[ctrColumn], 'CTR', rowNumber) : null,
      position: positionColumn >= 0 ? numberValue(row[positionColumn], 'Position', rowNumber) : null,
    });
  }
  if (records.length === 0) throw new Error('The CSV contains no rows with a Query or Page value');
  const dimensions = new Set(records.map((record) => record.dimension));
  if (dimensions.size !== 1) throw new Error('Import one Search Console dimension per CSV: Query or Page, not both');

  const rowDates = records.map((record) => record.date).filter(Boolean).sort();
  const from = options.from ? validDate(options.from, '--from') : rowDates[0];
  const to = options.to ? validDate(options.to, '--to') : rowDates.at(-1);
  if (from > to) throw new Error('--from must not be after --to');
  if (rowDates.some((date) => date < from || date > to)) throw new Error('A CSV Date falls outside the selected --from/--to period');

  const dimension = records[0].dimension;
  const snapshot = {
    source: 'Google Search Console CSV export',
    importedAt: new Date().toISOString(),
    importedFor: SITE_ORIGIN,
    importedThrough: 'in-house CSV workflow',
    sourceFile: path.basename(options.inputPath),
    granularity: dateColumn >= 0 ? 'daily' : 'period',
    dimension,
    dateRange: { from, to },
    sourceFilters: options.property ? {
      property: options.property,
      searchType: options.searchType,
      country: options.country,
      device: options.device,
      filters: options.filters,
    } : null,
    records,
  };
  const errors = validateSearchConsoleSnapshot(snapshot);
  if (errors.length > 0) throw new Error(`Search Console snapshot validation failed:\n- ${errors.join('\n- ')}`);

  const outputPath = path.resolve(SEARCH_CONSOLE_SNAPSHOT_FILES[dimension]);
  const archivedPath = archiveSnapshotBeforeReplace({
    outputPath,
    archiveName: `search-console-${dimension}`,
    nextPeriod: snapshot.dateRange,
    nextSourceFilters: snapshot.sourceFilters,
  });
  writeSnapshot(outputPath, snapshot);
  console.log(`Imported ${records.length} ${dimension} rows for ${from} to ${to} into ${path.relative(process.cwd(), outputPath)}.`);
  if (archivedPath) console.log(`Previous ${dimension} snapshot archived at ${path.relative(process.cwd(), archivedPath)}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Search Console import failed');
  process.exit(1);
}
