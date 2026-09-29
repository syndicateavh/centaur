import process from 'node:process';

export const MEASUREMENT_DIRECTORY = process.env.SEO_MEASUREMENT_DATA_DIR || 'src/content/seo/measurements';
export const MEASUREMENT_HISTORY_DIRECTORY = `${MEASUREMENT_DIRECTORY}/history`;
export const SEARCH_CONSOLE_SNAPSHOT_FILE = `${MEASUREMENT_DIRECTORY}/search-console.json`;
export const SEARCH_CONSOLE_QUERY_SNAPSHOT_FILE = `${MEASUREMENT_DIRECTORY}/search-console-query.json`;
export const SEARCH_CONSOLE_PAGE_SNAPSHOT_FILE = `${MEASUREMENT_DIRECTORY}/search-console-page.json`;
export const SEARCH_CONSOLE_SNAPSHOT_FILES = Object.freeze({
  query: SEARCH_CONSOLE_QUERY_SNAPSHOT_FILE,
  page: SEARCH_CONSOLE_PAGE_SNAPSHOT_FILE,
});
export const BACKLINK_SNAPSHOT_FILE = `${MEASUREMENT_DIRECTORY}/backlinks.json`;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

function nonNegativeNumber(value, fieldName, errors) {
  if (value === null || value === undefined) return;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) errors.push(`${fieldName} must be a non-negative number or null`);
}

export function validateSearchConsoleRecord(record) {
  const errors = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) return ['record must be an object'];
  if (record.date !== null && record.date !== undefined && !isValidDate(record.date)) errors.push('date must be YYYY-MM-DD or null for period aggregates');
  if (record.dimension !== 'query' && record.dimension !== 'page') errors.push('dimension must be query or page');
  if (record.dimension === 'page' && (!record.page || !record.page.startsWith('/'))) errors.push('page records require a site-relative page');
  if (record.dimension === 'query' && !record.query) errors.push('query records require a query');
  if (record.dimension === 'query' && record.page) errors.push('query records must not also include a page');
  if (record.dimension === 'page' && record.query) errors.push('page records must not also include a query');
  nonNegativeNumber(record.clicks, 'clicks', errors);
  nonNegativeNumber(record.impressions, 'impressions', errors);
  nonNegativeNumber(record.ctrPercent, 'ctrPercent', errors);
  nonNegativeNumber(record.position, 'position', errors);
  if (record.ctrPercent !== null && record.ctrPercent !== undefined && record.ctrPercent > 100) errors.push('ctrPercent must not exceed 100');
  return errors;
}

export function validateSearchConsoleSnapshot(snapshot) {
  const errors = [];
  if (!snapshot || typeof snapshot !== 'object' || !Array.isArray(snapshot.records)) return ['snapshot must contain a records array'];
  if (snapshot.sourceFilters !== null && snapshot.sourceFilters !== undefined) {
    for (const key of ['property', 'searchType', 'country', 'device', 'filters']) {
      if (typeof snapshot.sourceFilters?.[key] !== 'string' || !snapshot.sourceFilters[key].trim()) {
        errors.push(`sourceFilters.${key} must be a non-empty string`);
      }
    }
  }
  if (!snapshot.dateRange || !isValidDate(snapshot.dateRange.from) || !isValidDate(snapshot.dateRange.to)) {
    errors.push('dateRange must contain valid from and to dates');
  } else if (snapshot.dateRange.from > snapshot.dateRange.to) {
    errors.push('dateRange.from must not be after dateRange.to');
  }
  if (snapshot.granularity && !['daily', 'period'].includes(snapshot.granularity)) errors.push('granularity must be daily or period');
  const granularity = snapshot.granularity || 'daily';
  const uniqueRecords = new Set();
  const dimensions = new Set();
  if (snapshot.records.length === 0) errors.push('records must contain at least one data row');
  for (const [index, record] of snapshot.records.entries()) {
    const recordErrors = validateSearchConsoleRecord(record);
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      for (const error of recordErrors) errors.push(`records[${index}]: ${error}`);
      continue;
    }
    if (record.dimension === 'query' || record.dimension === 'page') dimensions.add(record.dimension);
    if (granularity === 'period' && record.date !== null && record.date !== undefined) recordErrors.push('period records must not claim a per-day date');
    if (granularity === 'daily' && !isValidDate(record.date)) recordErrors.push('daily records require a YYYY-MM-DD date');
    if (granularity === 'daily' && record.date && snapshot.dateRange && (record.date < snapshot.dateRange.from || record.date > snapshot.dateRange.to)) {
      recordErrors.push('date must fall within the snapshot dateRange');
    }
    if (record.dimension && (record.query || record.page)) {
      const identity = [record.date || 'period', record.dimension, record.query || record.page].join('|');
      if (uniqueRecords.has(identity)) recordErrors.push('duplicate dimension row in snapshot');
      uniqueRecords.add(identity);
    }
    for (const error of recordErrors) errors.push(`records[${index}]: ${error}`);
  }
  if (dimensions.size > 1) errors.push('a snapshot must contain only one query or page dimension');
  return errors;
}

export function validateBacklinkSnapshot(snapshot) {
  const errors = [];
  if (!snapshot || typeof snapshot !== 'object' || !Array.isArray(snapshot.records)) return ['snapshot must contain a records array'];
  for (const [index, record] of snapshot.records.entries()) {
    if (!record.sourceUrl || !/^https:\/\//i.test(record.sourceUrl)) errors.push(`records[${index}]: sourceUrl must be an HTTPS URL`);
    if (!record.targetPath || !record.targetPath.startsWith('/')) errors.push(`records[${index}]: targetPath must be site-relative`);
    if (!record.status) errors.push(`records[${index}]: status is required`);
    if (record.lastCheckedAt && !isValidDate(record.lastCheckedAt)) errors.push(`records[${index}]: lastCheckedAt must be YYYY-MM-DD`);
  }
  return errors;
}
