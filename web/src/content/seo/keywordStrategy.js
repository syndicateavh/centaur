import {
  KEYWORD_STRATEGY_ROWS,
  KEYWORD_STRATEGY_SOURCE,
  KEYWORD_PAGE_ARCHITECTURE,
} from './keywordStrategyData.js';
import { BUSINESS_DATA } from '../businessData.js';

export { KEYWORD_STRATEGY_ROWS, KEYWORD_STRATEGY_SOURCE, KEYWORD_PAGE_ARCHITECTURE };

export const KEYWORD_STRATEGY_CONFIG = Object.freeze({
  country: BUSINESS_DATA.countryCode,
  language: BUSINESS_DATA.language,
  keywordCount: KEYWORD_STRATEGY_SOURCE.keywordCount,
  targetUrlCount: KEYWORD_STRATEGY_SOURCE.targetUrlCount,
});

const PRIMARY_KEYWORD_PREFERENCES = Object.freeze({
  '/courses/': 'investment banking operations course',
  '/locations/lucknow/': 'investment banking course in Lucknow',
  '/courses/kyc-aml/': 'KYC AML course',
  '/india/': 'investment banking operations course India',
  '/career-guides/choosing-finance-career-course/': 'investment banking course with placement support',
  '/india/delhi-ncr/': 'investment banking course in Delhi',
  '/india/bengaluru/': 'investment banking course in Bangalore',
  '/india/mumbai/': 'investment banking course in Mumbai',
  '/india/pune/': 'investment banking course in Pune',
  '/india/hyderabad/': 'investment banking course in Hyderabad',
  '/resources/investment-banking-interview-questions/': 'investment banking operations interview questions for freshers',
  '/career-guides/finance-careers-after-graduation/': 'best finance course after BCom',
  '/career-guides/investment-banking-operations/': 'what is investment banking operations',
  '/career-guides/trade-lifecycle/': 'trade lifecycle in investment banking',
  '/career-guides/finance-operations/': 'finance operations career',
  '/career-guides/kyc-aml-analyst/': 'what is KYC in banking',
  '/career-guides/financial-operations-faq/': 'which course is best for investment banking operations in India',
  '/career-guides/retail-banking-operations/': 'retail banking operations meaning',
  '/courses/retail-banking/': 'retail banking operations course',
  '/career-guides/digital-payments-operations/': 'digital payment operations',
  '/courses/digital-payments/': 'digital payments course',
  '/career-guides/fintech-operations/': 'fintech career for BCom graduates',
  '/courses/fintech/': 'fintech course for graduates',
  '/compare/investment-banking-operations-courses/': 'Imarticus investment banking course alternative',
});

const keywordRowsByTarget = new Map();
const keywordRowByNormalizedKeyword = new Map();

function normalizeKeyword(keyword) {
  return String(keyword).toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
}

for (const row of KEYWORD_STRATEGY_ROWS) {
  if (!keywordRowsByTarget.has(row.targetUrl)) keywordRowsByTarget.set(row.targetUrl, []);
  keywordRowsByTarget.get(row.targetUrl).push(row);
  keywordRowByNormalizedKeyword.set(row.normalizedKeyword, row);
}

function compareRows(left, right) {
  return right.priority - left.priority || left.id - right.id;
}

export const KEYWORD_OWNERSHIP = Object.freeze(
    Object.fromEntries(
    [...keywordRowsByTarget.entries()].map(([targetUrl, rows]) => {
      const sortedRows = [...rows].sort(compareRows);
      const preferredPrimary = PRIMARY_KEYWORD_PREFERENCES[targetUrl];
      const primary = sortedRows.find((row) => row.normalizedKeyword === normalizeKeyword(preferredPrimary)) || sortedRows[0];
      return [targetUrl, Object.freeze({
        targetUrl,
        primaryKeyword: primary.keyword,
        primaryKeywordNormalized: primary.normalizedKeyword,
        secondaryKeywords: Object.freeze(sortedRows.slice(1).map((row) => row.keyword)),
        keywordCount: sortedRows.length,
        topPriority: sortedRows[0].priority,
        clusters: Object.freeze([...new Set(sortedRows.map((row) => row.cluster))]),
        intents: Object.freeze([...new Set(sortedRows.map((row) => row.intent))]),
        waves: Object.freeze([...new Set(sortedRows.map((row) => row.wave))]),
        pageType: primary.pageType,
        pageAction: primary.pageAction,
      })];
    }),
  ),
);

export const KEYWORD_TARGET_URLS = Object.freeze(Object.keys(KEYWORD_OWNERSHIP));

export function getKeywordOwnership(targetUrl) {
  return KEYWORD_OWNERSHIP[targetUrl] || null;
}

export function getKeywordRowsForTarget(targetUrl) {
  return Object.freeze([...(keywordRowsByTarget.get(targetUrl) || [])].sort(compareRows));
}

export function findKeyword(keyword) {
  return keywordRowByNormalizedKeyword.get(normalizeKeyword(keyword)) || null;
}

export function getKeywordArchitecture(targetUrl) {
  return KEYWORD_PAGE_ARCHITECTURE.find((page) => page.targetUrl === targetUrl) || null;
}
