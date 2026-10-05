export const BACKLINK_STATUSES = Object.freeze({
  CANDIDATE: 'candidate',
  QUALIFIED: 'qualified',
  OUTREACH: 'outreach',
  EARNED: 'earned',
  MONITORING: 'monitoring',
  REJECTED: 'rejected',
});

export const BACKLINK_TRANSITIONS = Object.freeze({
  [BACKLINK_STATUSES.CANDIDATE]: Object.freeze([BACKLINK_STATUSES.QUALIFIED, BACKLINK_STATUSES.REJECTED]),
  [BACKLINK_STATUSES.QUALIFIED]: Object.freeze([BACKLINK_STATUSES.OUTREACH, BACKLINK_STATUSES.REJECTED]),
  [BACKLINK_STATUSES.OUTREACH]: Object.freeze([BACKLINK_STATUSES.EARNED, BACKLINK_STATUSES.MONITORING, BACKLINK_STATUSES.REJECTED]),
  [BACKLINK_STATUSES.EARNED]: Object.freeze([BACKLINK_STATUSES.MONITORING]),
  [BACKLINK_STATUSES.MONITORING]: Object.freeze([BACKLINK_STATUSES.EARNED, BACKLINK_STATUSES.REJECTED]),
  [BACKLINK_STATUSES.REJECTED]: Object.freeze([BACKLINK_STATUSES.CANDIDATE]),
});

export const BACKLINK_ACQUISITION_METHODS = Object.freeze([
  'editorial-citation',
  'resource-page',
  'partner-profile',
  'local-education-resource',
  'community-contribution',
  'unknown',
]);

export const BACKLINK_TARGET_PATHS = Object.freeze([
  '/blog/',
  '/blog/placement-support-eligibility-and-terms/',
  '/blog/what-centaur-careers-provides-for-finance-careers/',
  '/blog/career-options-in-commerce-decision-map/',
  '/blog/finance-interview-questions-freshers/',
  '/blog/financial-accounting-statements-process-examples/',
  '/blog/cost-accounting-methods-examples/',
  '/blog/investment-banking-teams-operations/',
  '/blog/commercial-banks-services-operations/',
  '/blog/trial-balance-format-errors-reconciliation/',
  '/blog/balance-sheet-meaning-format-example/',
  '/blog/financial-markets-instruments-participants-operations/',
  '/blog/financial-management-decisions-controls/',
  '/resources/investment-banking-interview-questions/',
  '/resources/finance-gk/',
  '/resources/accounting-basics/',
  '/resources/reconciliation-in-finance/',
  '/courses/',
  '/placements/',
  '/best-finance-course-in-lucknow/',
  '/faqs/',
  '/india/',
]);

export const BACKLINK_REQUIRED_FIELDS = Object.freeze([
  'assetId',
  'outreachAngle',
  'evidenceNeeded',
]);

const VALID_STATUSES = new Set(Object.values(BACKLINK_STATUSES));
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isBacklinkTransitionAllowed(currentStatus, nextStatus) {
  return currentStatus === nextStatus || BACKLINK_TRANSITIONS[currentStatus]?.includes(nextStatus) === true;
}

export function getBacklinkNextStatuses(status) {
  return [...(BACKLINK_TRANSITIONS[status] || [])];
}

function isValidDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

function isValidExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.hostname.endsWith('centaurcareers.in');
  } catch {
    return false;
  }
}

export function validateBacklinkRecord(record) {
  const errors = [];
  const warnings = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { errors: ['record must be an object'], warnings };
  if (typeof record.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) errors.push('id must be a lowercase slug');
  if (!VALID_STATUSES.has(record.status)) errors.push(`status must be one of: ${[...VALID_STATUSES].join(', ')}`);
  if (!BACKLINK_ACQUISITION_METHODS.includes(record.acquisitionMethod)) errors.push('acquisitionMethod is not registered');
  if (!BACKLINK_TARGET_PATHS.includes(record.targetPath)) errors.push(`targetPath must be one of: ${BACKLINK_TARGET_PATHS.join(', ')}`);
  for (const field of BACKLINK_REQUIRED_FIELDS) {
    if (typeof record[field] !== 'string' || !record[field].trim()) errors.push(`${field} is required`);
  }
  if (record.sourceUrl !== null && record.sourceUrl !== undefined && !isValidExternalUrl(record.sourceUrl)) {
    errors.push('sourceUrl must be an external HTTPS URL');
  }
  if (record.sourceUrl && record.sourceDomain && new URL(record.sourceUrl).hostname !== record.sourceDomain) {
    errors.push('sourceDomain must match sourceUrl hostname');
  }
  if (!record.sourceUrl && record.sourceDomain) errors.push('sourceDomain requires sourceUrl evidence');
  if ([BACKLINK_STATUSES.EARNED, BACKLINK_STATUSES.MONITORING].includes(record.status) && !record.sourceUrl) {
    errors.push(`${record.status} records require sourceUrl evidence`);
  }
  if (record.firstContactedAt !== null && record.firstContactedAt !== undefined && !isValidDate(record.firstContactedAt)) errors.push('firstContactedAt must be YYYY-MM-DD');
  if (record.lastCheckedAt !== null && record.lastCheckedAt !== undefined && !isValidDate(record.lastCheckedAt)) errors.push('lastCheckedAt must be YYYY-MM-DD');
  if ([BACKLINK_STATUSES.OUTREACH, BACKLINK_STATUSES.EARNED, BACKLINK_STATUSES.MONITORING].includes(record.status) && !record.lastCheckedAt) warnings.push('add lastCheckedAt after each outreach or link audit');
  if (!record.evidenceNeeded) warnings.push('add the evidence needed before outreach is approved');
  return { errors, warnings };
}

export function validateBacklinkCollection(records) {
  const errors = [];
  const warnings = [];
  const ids = new Set();
  for (const [index, record] of (records || []).entries()) {
    const result = validateBacklinkRecord(record);
    for (const error of result.errors) errors.push(`records[${index}] (${record?.id || 'unknown'}): ${error}`);
    for (const warning of result.warnings) warnings.push(`records[${index}] (${record?.id || 'unknown'}): ${warning}`);
    if (record?.id && ids.has(record.id)) errors.push(`duplicate record id: ${record.id}`);
    if (record?.id) ids.add(record.id);
  }
  return { errors, warnings };
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}
