#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REGIONAL_MARKETS, getMeasurementEventFields, MEASUREMENT_TAXONOMY } from '../src/analytics/measurementTaxonomy.js';
import { INDIA_LEAD_INTENT_PAGES } from '../src/content/indiaLeadIntentPages.js';
import { REGIONAL_PAGES } from '../src/content/regionalPages.js';

const failures = [];

function requireText(file, values, label) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} is missing: ${file}`);
    return;
  }
  const source = fs.readFileSync(filePath, 'utf8');
  for (const value of values) {
    if (!source.includes(value)) failures.push(`${label} is missing: ${value}`);
  }
}

requireText('src/components/AnalyticsPageView.jsx', [
  'getMeasurementEventFields(location.pathname)',
  'getMeasurementEventFields(path)',
  "sendGoogleAnalyticsEvent('page_view'",
  "trackAnalyticsEvent(pathwayEvent",
  "trackAnalyticsEvent(eventName",
  "trackAnalyticsEvent('download_click'",
], 'Phase 0 event wiring');

const analyticsSource = fs.readFileSync(path.resolve('src/components/AnalyticsPageView.jsx'), 'utf8');
if (/page_(?:path|location|referrer):[^\n]*location\.search/.test(analyticsSource)) {
  failures.push('page-view payload must not include raw URL query strings');
}
if (!analyticsSource.includes('const navigationKey = `${location.pathname}${location.search}`;')
  || !analyticsSource.includes('const pageLocation = `${SITE_ORIGIN}${location.pathname}`;')) {
  failures.push('query navigation must be counted with a query-free page location');
}
const quizSource = fs.readFileSync(path.resolve('src/components/QuizLeadCapture.jsx'), 'utf8');
if (!quizSource.includes("pushQuizLeadEvent('quiz_whatsapp_request_prepared'")
  || quizSource.includes("pushQuizLeadEvent('quiz_lead_submitted'")) {
  failures.push('quiz WhatsApp drafts must not be labeled as submitted leads');
}

requireText('src/analytics/measurementTaxonomy.js', [
  'page_type',
  'content_cluster',
  'access_scope',
  'regional_market',
  'lead_intent_group',
  'conversion_stage',
  'delhi_ncr',
  'bengaluru',
  'mumbai',
  'pune',
  'hyderabad',
], 'measurement taxonomy');

requireText('docs/SEO_PHASE0_MEASUREMENT_BASELINE.md', [
  'external performance exports are still required',
  'Search Console clicks/impressions/CTR/position',
  'Confirmed leads and qualified enquiries',
  'unavailable rather than zero',
  'regional_market',
], 'Phase 0 baseline handoff');

requireText('docs/ANALYTICS_CONFIGURATION.md', [
  'Page measurement taxonomy',
  'Register the six names as GA4 custom dimensions',
  'They contain no IP-derived location',
], 'analytics configuration');

try {
  assert.deepEqual(getMeasurementEventFields('/best-finance-course-in-pune/?utm_source=search'), {
    page_type: 'regional_guide',
    content_cluster: 'regional',
    access_scope: 'online_from_regional_market',
    regional_market: 'pune',
    lead_intent_group: 'commercial_mode',
    conversion_stage: 'evaluate',
  });
  assert.deepEqual(getMeasurementEventFields('/best-finance-course-in-bangalore/'), {
    page_type: 'regional_guide',
    content_cluster: 'regional',
    access_scope: 'online_from_regional_market',
    regional_market: 'bengaluru',
    lead_intent_group: 'commercial_mode',
    conversion_stage: 'evaluate',
  });
  assert.deepEqual(getMeasurementEventFields('/india/'), {
    page_type: 'india_landing',
    content_cluster: 'national',
    access_scope: 'online_across_india',
    lead_intent_group: 'commercial_mode',
    conversion_stage: 'evaluate',
  });
  assert.deepEqual(getMeasurementEventFields('/best-finance-course-in-lucknow/'), {
    page_type: 'location',
    content_cluster: 'locations',
    access_scope: 'in_person_lucknow',
    lead_intent_group: 'regional_access',
    conversion_stage: 'decide',
  });
  assert.deepEqual(getMeasurementEventFields('/'), {
    page_type: 'home',
    content_cluster: 'home',
    access_scope: 'sitewide',
    lead_intent_group: 'site_discovery',
    conversion_stage: 'discover',
  });
  assert.deepEqual(getMeasurementEventFields('/compare/best-finance-institutes-india/'), {
    page_type: 'comparison',
    content_cluster: 'comparisons',
    access_scope: 'sitewide',
    lead_intent_group: 'commercial_best_institute',
    conversion_stage: 'evaluate',
  });
  assert.deepEqual(getMeasurementEventFields('/blog/how-to-evaluate-finance-institute-reviews/'), {
    page_type: 'blog',
    content_cluster: 'blog',
    access_scope: 'sitewide',
    lead_intent_group: 'trust_support',
    conversion_stage: 'trust',
  });
  assert.deepEqual(MEASUREMENT_TAXONOMY.eventFields, ['page_type', 'content_cluster', 'access_scope', 'regional_market', 'lead_intent_group', 'conversion_stage']);
  assert.equal(MEASUREMENT_TAXONOMY.regionalOnlineOwner, '/india/');
  assert.equal(Object.keys(REGIONAL_MARKETS).length, REGIONAL_PAGES.length);
  for (const page of REGIONAL_PAGES) {
    const fields = getMeasurementEventFields(page.path);
    assert.equal(fields.page_type, 'regional_guide');
    assert.equal(fields.content_cluster, 'regional');
    assert.equal(fields.access_scope, 'online_from_regional_market');
    assert.equal(fields.regional_market, REGIONAL_MARKETS[page.path]);
    assert.equal(fields.lead_intent_group, 'commercial_mode');
    assert.equal(fields.conversion_stage, 'evaluate');
    assert.equal(REGIONAL_MARKETS[page.path], page.id.replaceAll('-', '_'));
  }
  const expectedLeadPages = new Map([
    ['/best-finance-course-in-india-with-placement/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'evaluate']],
    ['/best-investment-banking-course-india/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_program', 'evaluate']],
    ['/best-finance-course-after-graduation/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'career_fit', 'evaluate']],
    ['/best-finance-course-after-bcom/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'career_fit', 'evaluate']],
    ['/finance-course-with-placement/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'decide']],
    ['/finance-course-with-job-guarantee/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'decide']],
    ['/finance-course-fees-in-india/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_fees', 'decide']],
    ['/finance-course-duration/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_program', 'evaluate']],
    ['/finance-course-eligibility/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_program', 'decide']],
    ['/online-finance-course-with-placement/', ['commercial', 'courses', 'online_across_india', 'commercial_placement', 'evaluate']],
    ['/job-oriented-finance-course-india/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_program', 'evaluate']],
    ['/banking-finance-course-with-placement/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'evaluate']],
    ['/investment-banking-operations-course-with-placement/', ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'evaluate']],
    ['/finance-institute-lucknow-with-placement/', ['commercial', 'locations', 'in_person_lucknow', 'commercial_placement', 'evaluate']],
    ['/finance-course-cities-india/', ['comparison', 'national', 'online_across_india', 'commercial_mode', 'evaluate']],
    ['/finance-course-vs-mba-cfa-financial-modelling/', ['comparison', 'comparisons', 'sitewide', 'comparison_path', 'evaluate']],
    ['/which-finance-course-is-right-for-me/', ['career_guide', 'career_guides', 'sitewide', 'career_fit', 'evaluate']],
  ]);
  assert.deepEqual(
    INDIA_LEAD_INTENT_PAGES.map(({ path: pagePath }) => pagePath).sort(),
    [...expectedLeadPages.keys()].sort(),
    'Every published India lead-intent page needs a reviewed measurement classification',
  );
  for (const [pagePath, expected] of expectedLeadPages) {
    const [page_type, content_cluster, access_scope, lead_intent_group, conversion_stage] = expected;
    assert.deepEqual(
      getMeasurementEventFields(`${pagePath}?utm_source=search#details`),
      { page_type, content_cluster, access_scope, lead_intent_group, conversion_stage },
      `Incorrect measurement classification for ${pagePath}`,
    );
  }
  assert.deepEqual(getMeasurementEventFields('/finance-course-fees-in-india-2027/'), {
    page_type: 'page',
    content_cluster: 'site',
    access_scope: 'sitewide',
    lead_intent_group: 'site_discovery',
    conversion_stage: 'discover',
  }, 'Lead-intent rules must match exact paths, not nearby URLs');
} catch (error) {
  failures.push(`measurement taxonomy behavior: ${error.message}`);
}

if (failures.length > 0) {
  console.error(`Phase 0 measurement verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Phase 0 measurement verified: event taxonomy, all India lead pages, regional segmentation, external-baseline boundary, and privacy-safe reporting contract.');
