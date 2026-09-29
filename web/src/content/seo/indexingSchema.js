import { SITE_ORIGIN } from '../../seo/siteConfig.js';

export const INDEXING_SCHEMA_VERSION = 1;
export const INDEXING_DATA_DIRECTORY = 'data/seo/indexing';
export const INDEXING_MANIFEST_FILE = `${INDEXING_DATA_DIRECTORY}/indexing-manifest.json`;
export const INDEXING_INSPECTION_FILE = `${INDEXING_DATA_DIRECTORY}/inspections/latest.json`;
export const INDEXING_INSPECTION_HISTORY_DIRECTORY = `${INDEXING_DATA_DIRECTORY}/inspections/history`;
export const INDEXING_SUBMISSIONS_DIRECTORY = `${INDEXING_DATA_DIRECTORY}/submissions`;
export const INDEXING_REPORT_FILE = `${INDEXING_DATA_DIRECTORY}/INDEXING_REPORT.md`;

export const INDEXING_STATUSES = Object.freeze([
  'pending_submission',
  'submitted',
  'indexed',
  'not_indexed',
  'excluded',
  'error',
  'unknown',
]);

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function isValidDate(value) {
  return typeof value === 'string'
    && ISO_DATE_PATTERN.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function isValidDateTime(value) {
  return typeof value === 'string'
    && ISO_DATETIME_PATTERN.test(value)
    && !Number.isNaN(Date.parse(value));
}

export function normalizeIndexingUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl, SITE_ORIGIN);
  } catch {
    throw new Error(`Invalid indexing URL: ${rawUrl}`);
  }

  const site = new URL(SITE_ORIGIN);
  const allowedHosts = new Set([site.hostname, `www.${site.hostname}`]);
  if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname.toLowerCase())) {
    throw new Error(`Indexing URL is outside the configured site: ${rawUrl}`);
  }
  if (url.search || url.hash) throw new Error(`Indexing URL must be canonical and must not contain a query or hash: ${rawUrl}`);

  const pathname = url.pathname === '/' ? '/' : (url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`);
  return `${SITE_ORIGIN}${pathname}`;
}

export function classifyInspectionStatus({ verdict = '', coverageState = '', indexingState = '', pageFetchState = '', error = '' } = {}) {
  const combined = [verdict, coverageState, indexingState, pageFetchState, error].join(' ').toLowerCase();
  if (/(error|failure|failed|blocked|server error|redirect error)/i.test(combined)) return 'error';
  if (/(excluded|duplicate|alternate|canonical issue|not indexed|not_indexed|noindex|crawled - currently not indexed|discovered - currently not indexed)/i.test(combined)) return 'excluded';
  if (/(url is on google|indexed|pass)/i.test(combined) && !/(not indexed|not_indexed|excluded|error|fail)/i.test(combined)) return 'indexed';
  if (/(unknown to google|not available|not found|blocked by robots|never crawled|pending)/i.test(combined)) return 'not_indexed';
  return 'unknown';
}

export function validateIndexingManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return ['manifest must be an object'];
  if (manifest.schemaVersion !== INDEXING_SCHEMA_VERSION) errors.push(`schemaVersion must be ${INDEXING_SCHEMA_VERSION}`);
  if (manifest.siteOrigin !== SITE_ORIGIN) errors.push(`siteOrigin must be ${SITE_ORIGIN}`);
  if (manifest.sitemapUrl !== `${SITE_ORIGIN}/sitemap.xml`) errors.push(`sitemapUrl must be ${SITE_ORIGIN}/sitemap.xml`);
  if (!Array.isArray(manifest.urls) || manifest.urls.length === 0) {
    errors.push('urls must contain at least one canonical URL');
    return errors;
  }
  if (manifest.urlCount !== manifest.urls.length) errors.push('urlCount must match urls.length');

  const seen = new Set();
  for (const [index, entry] of manifest.urls.entries()) {
    if (!entry || typeof entry !== 'object') {
      errors.push(`urls[${index}] must be an object`);
      continue;
    }
    let normalized;
    try {
      normalized = normalizeIndexingUrl(entry.url);
    } catch (error) {
      errors.push(`urls[${index}]: ${error.message}`);
      continue;
    }
    if (normalized !== entry.url) errors.push(`urls[${index}]: url is not canonical: ${entry.url}`);
    if (seen.has(entry.url)) errors.push(`urls[${index}]: duplicate URL ${entry.url}`);
    seen.add(entry.url);
    if (!entry.path || entry.path !== new URL(entry.url).pathname) errors.push(`urls[${index}]: path does not match url`);
    if (!['site-route', 'blog-article', 'blog-category'].includes(entry.kind)) errors.push(`urls[${index}]: unknown kind ${entry.kind}`);
    if (entry.lastModified !== null && entry.lastModified !== undefined && !isValidDate(entry.lastModified)) errors.push(`urls[${index}]: lastModified must be YYYY-MM-DD or null`);
  }
  return errors;
}

export function validateIndexingInspectionSnapshot(snapshot, manifestUrls = new Set()) {
  const errors = [];
  if (!snapshot || typeof snapshot !== 'object' || !Array.isArray(snapshot.records)) return ['inspection snapshot must contain a records array'];
  if (snapshot.schemaVersion !== INDEXING_SCHEMA_VERSION) errors.push(`schemaVersion must be ${INDEXING_SCHEMA_VERSION}`);
  if (snapshot.siteOrigin !== SITE_ORIGIN) errors.push(`siteOrigin must be ${SITE_ORIGIN}`);
  if (!isValidDate(snapshot.observationDate)) errors.push('observationDate must be YYYY-MM-DD');
  if (!isValidDateTime(snapshot.importedAt)) errors.push('importedAt must be an ISO UTC datetime');

  const seen = new Set();
  for (const [index, record] of snapshot.records.entries()) {
    if (!record || typeof record !== 'object') {
      errors.push(`records[${index}] must be an object`);
      continue;
    }
    try {
      const normalized = normalizeIndexingUrl(record.url);
      if (normalized !== record.url) errors.push(`records[${index}]: url is not canonical`);
    } catch (error) {
      errors.push(`records[${index}]: ${error.message}`);
    }
    if (manifestUrls.size > 0 && !manifestUrls.has(record.url)) errors.push(`records[${index}]: URL is not in the current indexing manifest: ${record.url}`);
    if (seen.has(record.url)) errors.push(`records[${index}]: duplicate URL ${record.url}`);
    seen.add(record.url);
    if (!INDEXING_STATUSES.includes(record.status)) errors.push(`records[${index}]: unknown status ${record.status}`);
    for (const field of ['verdict', 'coverageState', 'indexingState', 'pageFetchState', 'robotsTxtState', 'googleCanonical', 'userCanonical', 'reason']) {
      if (record[field] !== null && record[field] !== undefined && typeof record[field] !== 'string') errors.push(`records[${index}]: ${field} must be a string or null`);
    }
    if (record.lastCrawledAt !== null && record.lastCrawledAt !== undefined && !isValidDateTime(record.lastCrawledAt)) errors.push(`records[${index}]: lastCrawledAt must be an ISO UTC datetime or null`);
  }
  return errors;
}

export function validateIndexingSubmissionReceipt(receipt) {
  const errors = [];
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) return ['submission receipt must be an object'];
  if (receipt.schemaVersion !== INDEXING_SCHEMA_VERSION) errors.push(`schemaVersion must be ${INDEXING_SCHEMA_VERSION}`);
  if (receipt.type !== 'sitemap') errors.push('submission receipt type must be sitemap');
  if (receipt.siteOrigin !== SITE_ORIGIN) errors.push(`submission receipt siteOrigin must be ${SITE_ORIGIN}`);
  if (receipt.sitemapUrl !== `${SITE_ORIGIN}/sitemap.xml`) errors.push('submission receipt sitemapUrl must be the canonical sitemap');
  if (!isValidDateTime(receipt.requestedAt)) errors.push('requestedAt must be an ISO UTC datetime');
  if (!['dry-run', 'live'].includes(receipt.mode)) errors.push('submission receipt mode must be dry-run or live');
  if (!['planned', 'submitted', 'failed'].includes(receipt.status)) errors.push('submission receipt status must be planned, submitted, or failed');
  if (receipt.status === 'submitted' && receipt.httpStatus !== 200) errors.push('a submitted receipt must contain HTTP status 200');
  return errors;
}
