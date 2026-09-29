import { KEYWORD_STRATEGY_ROWS, KEYWORD_STRATEGY_SOURCE } from './keywordStrategy.js';

export const KEYWORD_RESEARCH_CONFIG = Object.freeze({
  country: 'IN',
  language: 'en',
  targetCount: KEYWORD_STRATEGY_SOURCE.keywordCount,
  source: KEYWORD_STRATEGY_SOURCE.workbook,
  metricSource: 'Semrush India export required for volume, KD, intent, and CPC values',
});

export const KEYWORD_CANDIDATES = Object.freeze(
  KEYWORD_STRATEGY_ROWS.map((row) => ({
    keyword: row.keyword,
    cluster: row.cluster,
    intent: row.intent.toLowerCase(),
    funnel: row.funnel.toLowerCase(),
    targetUrl: row.targetUrl,
    pageType: row.pageType,
    pageAction: row.pageAction,
    wave: row.wave,
    priority: row.priority,
    seed: row.pageTheme,
    semrush: {
      status: 'pending-import',
      volume: null,
      keywordDifficulty: null,
      cpc: null,
    },
  })),
);

export function getKeywordCandidates() {
  return KEYWORD_CANDIDATES;
}

export function getKeywordClusters() {
  return [...new Set(KEYWORD_CANDIDATES.map((candidate) => candidate.cluster))];
}
