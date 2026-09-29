import { KEYWORD_OWNERSHIP, getKeywordOwnership } from './keywordMap.js';

function normalizeKeyword(keyword) {
  return String(keyword).toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
}

export { KEYWORD_OWNERSHIP, getKeywordOwnership };

export function getPrimaryKeyword(targetUrl) {
  return getKeywordOwnership(targetUrl)?.primaryKeyword || null;
}

export function getSecondaryKeywords(targetUrl) {
  return getKeywordOwnership(targetUrl)?.secondaryKeywords || [];
}

export function getKeywordOwner(keyword) {
  const normalized = normalizeKeyword(keyword);
  return Object.values(KEYWORD_OWNERSHIP).find((ownership) => ownership.primaryKeywordNormalized === normalized)
    || Object.values(KEYWORD_OWNERSHIP).find((ownership) => ownership.secondaryKeywords.some((candidate) => normalizeKeyword(candidate) === normalized))
    || null;
}
