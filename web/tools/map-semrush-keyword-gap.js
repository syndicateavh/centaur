#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KEYWORD_STRATEGY_ROWS } from '../src/content/seo/keywordStrategyData.js';
import { SEO_ROUTES } from '../src/seo/seoRoutes.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const dataDirectory = path.join(projectRoot, 'data/seo/keyword-gap');
const inputPath = path.join(dataDirectory, 'semrush-organic-competitors-keyword-gap-classified-2026-09-23.json');
const outputPath = path.join(dataDirectory, 'semrush-organic-competitors-keyword-gap-mapped-2026-09-23.json');
const keywordCsvPath = path.join(dataDirectory, 'semrush-keyword-gap-keyword-map-2026-09-23.csv');
const clusterCsvPath = path.join(dataDirectory, 'semrush-keyword-gap-clusters-2026-09-23.csv');
const reportPath = path.join(dataDirectory, 'semrush-keyword-gap-phase3-cluster-and-map-report-2026-09-23.md');
const MAPPER_ID = 'tools/map-semrush-keyword-gap.js';
const MAPPER_VERSION = '1.0.0';

const ROUTES = new Map(SEO_ROUTES.filter((route) => route.indexable).map((route) => [route.path, route]));

const PROPOSED_CLUSTERS = {
  'qualification.ca': {
    label: 'CA / Chartered Accountancy explainers',
    title: 'CA and chartered accountancy: neutral explainer',
    scope: 'Definitions, pathway comparisons, and factual questions about CA/ICAI; not coaching or exam preparation.',
  },
  'qualification.cs': {
    label: 'CS / Company Secretary explainers',
    title: 'Company Secretary qualification: neutral explainer',
    scope: 'Company Secretary definitions and pathway context; acronym-only queries remain in manual review.',
  },
  'qualification.cfa': {
    label: 'CFA explainers',
    title: 'CFA qualification: neutral explainer',
    scope: 'Factual CFA credential and pathway information based on current CFA Institute sources; never exam-prep marketing.',
  },
  'qualification.acca': {
    label: 'ACCA explainers',
    title: 'ACCA qualification: neutral explainer',
    scope: 'Factual ACCA credential and pathway information based on current ACCA sources; never exam-prep marketing.',
  },
  'qualification.cma': {
    label: 'CMA explainers',
    title: 'CMA qualification: neutral explainer',
    scope: 'Disambiguate awarding bodies and explain the relevant credential from official sources; no preparation-course claim.',
  },
  'qualification.cpa': {
    label: 'CPA explainers',
    title: 'CPA qualification: neutral explainer',
    scope: 'Explain jurisdiction and awarding-body differences from primary sources; no preparation-course claim.',
  },
  'qualification.frm': {
    label: 'FRM explainers',
    title: 'FRM qualification: neutral explainer',
    scope: 'Factual GARP/FRM credential and pathway information; no exam-preparation claim.',
  },
  'qualification.cfp': {
    label: 'CFP explainers',
    title: 'CFP qualification: neutral explainer',
    scope: 'Factual credential and awarding-body information; avoid personal-financial-advice framing and preparation claims.',
  },
  'qualification.other': {
    label: 'Other finance credentials (verify first)',
    title: 'Other finance credentials: verified explainers',
    scope: 'Only retain a credential after identifying its exact awarding body and primary sources; informational coverage only.',
  },
  'education.bcom': {
    label: 'BCom and commerce-degree explainers',
    title: 'BCom and commerce-degree study explainers',
    scope: 'Degree definitions, subjects, and study-context queries. Do not imply Centaur awards a degree.',
  },
  'education.bba': {
    label: 'BBA explainers',
    title: 'BBA degree and subject explainers',
    scope: 'BBA definitions and general subject information; do not imply Centaur awards a degree.',
  },
  'education.other_commerce': {
    label: 'Other commerce-degree explainers',
    title: 'Commerce degrees: neutral study guide',
    scope: 'Introductory explainers for commerce degrees and subjects relevant to finance-career learners.',
  },
  'education.commerce_pathways': {
    label: 'Commerce student and career pathways',
    title: 'Commerce student pathways into finance careers',
    scope: 'Informational career options and next-step comparisons; any Centaur program reference must describe only the current Masterclass.',
  },
  'career.finance_pathways': {
    label: 'Finance career pathways',
    title: 'Finance career pathways and role explainers',
    scope: 'Finance-role and pathway information; salary, eligibility, hiring, and outcomes require current evidence.',
  },
  'career.readiness': {
    label: 'Interview and workplace readiness',
    title: 'Interview and workplace readiness for early-career learners',
    scope: 'General educational guidance on interviews, communication, and workplace skills; no placement or employment promise.',
  },
  'operations.fintech': {
    label: 'Fintech and digital-lending operations explainers',
    title: 'Fintech operations: roles and workflows',
    scope: 'Independent industry education only; any reference to Centaur must be checked against the current Financial Operations Masterclass curriculum.',
  },
  'foundation.finance': {
    label: 'Finance and banking foundations',
    title: 'Finance and banking foundations',
    scope: 'Foundational definitions and institutional concepts for finance-career learners; avoid investment, legal, and tax advice.',
  },
  'foundation.accounting': {
    label: 'Accounting and reporting concepts',
    title: 'Accounting and reporting concepts',
    scope: 'Accounting concepts beyond the scope of the live accounting-basics resource; verify accounting standards and avoid professional advice.',
  },
  'foundation.markets': {
    label: 'Financial markets and instruments',
    title: 'Financial markets and instruments: introductory guide',
    scope: 'Neutral, introductory market and instrument definitions from authoritative sources; no investment recommendations.',
  },
  'foundation.analysis': {
    label: 'Financial analysis and valuation concepts',
    title: 'Financial analysis and valuation concepts',
    scope: 'Educational definitions and worked examples only; no investment, valuation, tax, or professional advice.',
  },
  'foundation.economics': {
    label: 'Economics and business fundamentals (fit review)',
    title: 'Economics concepts for commerce and finance learners',
    scope: 'Proposed only if SERP review confirms a finance-career audience; otherwise exclude as broad academic content.',
  },
  'foundation.tax': {
    label: 'Tax and regulatory fundamentals (source review)',
    title: 'Tax and regulatory terms: neutral explainers',
    scope: 'Hold for jurisdiction-specific primary-source and legal review; no filing, tax, or compliance advice.',
  },
};

const REVIEW_CLUSTERS = {
  brand: { label: 'Brand and competitor navigation review', scope: 'No target page. Inspect exact query and SERP; do not impersonate or imply affiliation.' },
  destination: { label: 'Employer, provider, and destination review', scope: 'No target page. Preserve official destinations and avoid implied affiliation.' },
  offer_scope: { label: 'Course-query and current-offer scope review', scope: 'The query appears to seek a course/certification/program not confirmed as the current Financial Operations Masterclass. Do not map it to a Centaur offer or make a curriculum claim until explicitly verified.' },
  salary_data: { label: 'Salary and pay evidence review', scope: 'Do not publish pay figures, averages, or promises from this export. Verify role, location, seniority, date, and authoritative data before assigning a page.' },
  role_scope: { label: 'Specialist finance-role scope review', scope: 'This query names a specialist/front-office role not directly covered by the current operations-career page. Confirm audience fit and page ownership before targeting it.' },
  localized: { label: 'Localized-query review', scope: 'The current page is English-only. Do not map a language-specific query to it as if it answered in that language.' },
  credential: { label: 'Credential and certification review', scope: 'Verify the exact awarding body and official scope. Do not imply Centaur awards or prepares learners for a third-party credential.' },
  source_scope: { label: 'Specific-topic and source review', scope: 'The query needs more specific factual/source coverage than the current live page provides; hold until the topic and authoritative support are verified.' },
  qualification: { label: 'Qualification ambiguity and claim review', scope: 'No target page until acronym, intent, awarding body, and query meaning are verified.' },
  ambiguous: { label: 'Short-query and acronym review', scope: 'No target page until live SERP context disambiguates the query.' },
  unclassified: { label: 'Unclassified keyword review', scope: 'No target page until a human assigns a supported topic and audience fit.' },
  finance_scope: { label: 'Finance-foundation scope review', scope: 'No target page until relevance, factual scope, and source requirements are confirmed.' },
  education_scope: { label: 'Education-topic scope review', scope: 'No target page until the finance-career audience fit is confirmed.' },
};

function normalize(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function csvCell(value) {
  const raw = Array.isArray(value) ? value.join('; ') : String(value ?? '');
  const isNumericValue = typeof value === 'number' && Number.isFinite(value);
  const spreadsheetSafe = !isNumericValue && /^[\s]*[=+@-]/.test(raw) ? `'${raw}` : raw;
  return `"${spreadsheetSafe.replace(/"/g, '""')}"`;
}

function sumBy(rows, field) {
  const counts = new Map();
  for (const row of rows) {
    const value = row[field] || 'unspecified';
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function addCluster(registry, definition) {
  const existing = registry.get(definition.id);
  if (existing) return existing;
  const cluster = { keywordCount: 0, examples: [], ...definition };
  registry.set(cluster.id, cluster);
  return cluster;
}

function existingCluster(registry, route, mapKind = 'active_route') {
  const id = `existing.${slug(route.path) || 'home'}`;
  return addCluster(registry, {
    id,
    label: route.title,
    pageTitle: route.title,
    clusterType: 'existing_page',
    routeStatus: 'live_indexable_route',
    targetUrl: route.path,
    proposedPath: null,
    scope: route.keywordPurpose || 'Existing indexable page; use only for directly relevant search intent.',
    mapKind,
  });
}

function proposedCluster(registry, id) {
  const definition = PROPOSED_CLUSTERS[id];
  if (!definition) throw new Error(`Missing proposed cluster definition: ${id}`);
  return addCluster(registry, {
    id: `proposed.${id}`,
    label: definition.label,
    pageTitle: definition.title,
    clusterType: 'proposed_informational_page',
    routeStatus: 'not_created_not_approved',
    targetUrl: null,
    proposedPath: null,
    scope: definition.scope,
    mapKind: 'proposed_page_cluster',
  });
}

function reviewCluster(registry, key) {
  const definition = REVIEW_CLUSTERS[key];
  return addCluster(registry, {
    id: `review.${key}`,
    label: definition.label,
    pageTitle: null,
    clusterType: 'manual_review_queue',
    routeStatus: 'not_a_page',
    targetUrl: null,
    proposedPath: null,
    scope: definition.scope,
    mapKind: 'hold_for_manual_review',
  });
}

function excludedCluster(registry, key, label, scope) {
  return addCluster(registry, {
    id: `exclude.${key}`,
    label,
    pageTitle: null,
    clusterType: 'excluded_scope',
    routeStatus: 'not_a_page',
    targetUrl: null,
    proposedPath: null,
    scope,
    mapKind: 'exclude_from_current_scope',
  });
}

function qualificationClusterId(row) {
  const label = row.detectedQualifications[0] || '';
  if (/^CA\s\//i.test(label)) return 'qualification.ca';
  if (/^CS\s\//i.test(label)) return 'qualification.cs';
  if (/^CFA\s\//i.test(label)) return 'qualification.cfa';
  if (/^ACCA/i.test(label)) return 'qualification.acca';
  if (/^CMA\s\//i.test(label)) return 'qualification.cma';
  if (/^CPA\s\//i.test(label)) return 'qualification.cpa';
  if (/^FRM/i.test(label)) return 'qualification.frm';
  if (/^CFP\s\//i.test(label)) return 'qualification.cfp';
  return 'qualification.other';
}

function foundationClusterId(keyword) {
  if (/\b(tax|taxation|income tax|gst|customs duty|tariff|tax slab|tds)\b/i.test(keyword)) return 'foundation.tax';
  if (/\b(economics|demand|supply|elasticity|monopoly|oligopoly|market structure|fiscal policy|trade cycle|pestel|pestle)\b/i.test(keyword)) return 'foundation.economics';
  if (/\b(capm|dcf|wacc|valuation|ratio analysis|financial analysis|financial modelling|financial modeling|capital budgeting|cost of capital|break even|cvp analysis|du ?pont|enterprise value|net asset value|working capital|time value of money)\b/i.test(keyword)) return 'foundation.analysis';
  if (/\b(stock market|share market|securities market|capital markets?|money market|mutual funds?|hedge funds?|venture capital|equity|derivatives|fixed income|forex|foreign exchange|exchange rate|portfolio|asset management|wealth management|ipo|initial public offering|alternative investments?|syndicated loan|project finance|algorithmic trading|leveraged buyout|mergers and acquisitions)\b/i.test(keyword)) return 'foundation.markets';
  if (/\b(accounting|bookkeeping|journal|ledger|trial balance|balance sheet|profit and loss|financial statements?|audit|auditing|ifrs|gaap|cost accounting|management accounting|carriage inward|carriage outward|golden rules|classification of cost|accounting equation)\b/i.test(keyword)) return 'foundation.accounting';
  return 'foundation.finance';
}

function educationClusterId(keyword) {
  if (/\b(career|careers|job|jobs|salary|scope|future|options|after 12th|after graduation|after b\.?\s?com)\b/i.test(keyword)) return 'education.commerce_pathways';
  if (/\b(b\s?\.?\s?com|bcom|bachelor of commerce)\b/i.test(keyword)) return 'education.bcom';
  if (/\b(bba|bachelor of business administration)\b/i.test(keyword)) return 'education.bba';
  return 'education.other_commerce';
}

function mapOne(row, registry, strategyByKeyword) {
  const keyword = row.keyword;
  const normalizedKeyword = normalize(row.normalizedKeyword || keyword);
  const approved = strategyByKeyword.get(normalizedKeyword);

  if (approved && ROUTES.has(approved.targetUrl)) {
    const cluster = existingCluster(registry, ROUTES.get(approved.targetUrl), 'approved_strategy_owner');
    return {
      cluster,
      ownershipStatus: 'exact_approved_strategy_route',
      reason: 'Exact normalized keyword match in the approved 728-keyword strategy; its target is a currently indexable route.',
      strategyRowId: approved.id,
    };
  }

  if (row.topic === 'other_professional_or_education_topic' || row.contentDisposition === 'exclude_from_current_content_scope') {
    const cluster = excludedCluster(
      registry,
      'non-finance-education',
      'Non-finance profession and education topics',
      'Outside the current Financial Operations Masterclass and finance-career audience. Do not create a Centaur offering or topical page from these terms.',
    );
    return { cluster, ownershipStatus: 'excluded', reason: 'Phase 2 classified the subject outside current content scope; no target URL is assigned.', strategyRowId: null };
  }

  if (row.topic === 'competitor_or_brand_navigation') {
    const cluster = reviewCluster(registry, 'brand');
    return { cluster, ownershipStatus: 'review_required', reason: 'Competitor/brand navigation requires human query and SERP review; no landing page is assigned.', strategyRowId: null };
  }
  if (row.topic === 'employer_or_institution_navigation' || row.searchIntent?.primary === 'navigational') {
    const cluster = reviewCluster(registry, 'destination');
    return { cluster, ownershipStatus: 'review_required', reason: 'Destination-seeking query must remain with the named employer/provider/official destination; no Centaur page is assigned.', strategyRowId: null };
  }
  if (row.topic === 'ambiguous_or_low_context') {
    const cluster = reviewCluster(registry, 'ambiguous');
    return { cluster, ownershipStatus: 'review_required', reason: 'Short or ambiguous query needs live-SERP disambiguation before it can have a content owner.', strategyRowId: null };
  }
  if (row.topic === 'unclassified_other') {
    const cluster = reviewCluster(registry, 'unclassified');
    return { cluster, ownershipStatus: 'review_required', reason: 'No supported Phase 2 topic rule matched; manual topic and audience review is required.', strategyRowId: null };
  }

  if (/\bfinancial operations masterclass\b/i.test(keyword)) {
    const cluster = existingCluster(registry, ROUTES.get('/courses/'));
    return {
      cluster,
      ownershipStatus: 'mapped_existing_route',
      reason: 'The query names Centaur’s single current course; map only to its existing program page and keep all details aligned to current published terms.',
      strategyRowId: null,
    };
  }

  if (row.contentDisposition === 'current_masterclass_page_candidate_not_a_new_course'
    || row.searchIntent?.querySignals?.includes('course_or_training')
    || row.searchIntent?.sourceLabels?.includes('transactional')) {
    const cluster = reviewCluster(registry, 'offer_scope');
    return {
      cluster,
      ownershipStatus: 'offer_scope_hold',
      reason: 'A course/training/program/certification intent is not evidence Centaur offers that subject. Hold for SERP and current-offer verification; exact approved strategy matches were handled separately. Never imply a separate course.',
      strategyRowId: null,
    };
  }

  if (row.searchIntent?.querySignals?.includes('salary_or_pay')) {
    const cluster = reviewCluster(registry, 'salary_data');
    return { cluster, ownershipStatus: 'source_review_hold', reason: 'Salary/pay terms are time- and location-sensitive. This plan has no authoritative salary evidence, so do not assign them to a live page yet.', strategyRowId: null };
  }

  if (/\b(tamil|hindi|gujarati|marathi|bengali|telugu|kannada|malayalam|punjabi|urdu)\b/i.test(keyword)) {
    const cluster = reviewCluster(registry, 'localized');
    return { cluster, ownershipStatus: 'audience_fit_hold', reason: 'The search explicitly asks for another language; current target pages are English-language resources.', strategyRowId: null };
  }

  if (/\b(certified|certificate|certification|credential|credentials|professional qualification|exam|examination)\b/i.test(keyword)) {
    const cluster = reviewCluster(registry, 'credential');
    return { cluster, ownershipStatus: 'credential_review_hold', reason: 'Credential/certification query needs exact awarding-body and intent verification; do not imply Centaur offers that credential or preparation.', strategyRowId: null };
  }

  if (/\b(aditya birla|accenture|google|infosys|tvs finance|kissht|kotak mahindra|amazon|icici|hdfc|axis bank|state bank of india|\bsbi\b)\b/i.test(keyword)
    && /\b(job|jobs|career|careers|vacancy|vacancies|hiring|relationship manager|role|responsibilities)\b/i.test(keyword)) {
    const cluster = reviewCluster(registry, 'destination');
    return { cluster, ownershipStatus: 'review_required', reason: 'Employer-specific job query; the generic career guide is not an employer vacancy or official destination.', strategyRowId: null };
  }

  if ((row.topic === 'finance_career_and_employment'
    || row.suggestedExistingRoute === '/career-guides/finance-careers-after-graduation/')
    && /\b(investment banker|financial analyst|chief financial officer|\bcfo\b|fund manager|portfolio manager|hedge fund|quantitative finance|quantitative analyst)\b/i.test(keyword)) {
    const cluster = reviewCluster(registry, 'role_scope');
    return { cluster, ownershipStatus: 'audience_fit_hold', reason: 'The keyword targets a specialist or front-office role not directly covered by the current finance-operations career guide; do not force it onto that page.', strategyRowId: null };
  }

  if (row.topic === 'accounting_finance_foundations'
    && /\b(ifrs|iasb|international accounting standards|australian accounting standards|us gaap|gaap convergence)\b/i.test(keyword)) {
    const cluster = reviewCluster(registry, 'source_scope');
    return { cluster, ownershipStatus: 'source_review_hold', reason: 'International accounting frameworks and comparisons need dedicated authoritative sourcing beyond the current introductory accounting resource.', strategyRowId: null };
  }

  if (row.topic === 'finance_career_and_employment'
    && /\b(credit risk model(?:l)?ing|types of credit risk|credit risk analyst jobs|4\s?rs?|four rs)\b/i.test(keyword)) {
    const cluster = reviewCluster(registry, 'source_scope');
    return { cluster, ownershipStatus: 'source_review_hold', reason: 'Credit-risk modeling, taxonomy, mnemonic, and vacancy queries need dedicated role or technical sources beyond this introductory operations guide.', strategyRowId: null };
  }

  const mappedRoutePath = row.suggestedExistingRoute === '/career-guides/finance-careers-after-graduation/'
    && /\b(credit analyst|credit analysis|credit risk|credit underwriting|loan processing|nbfc)\b/i.test(keyword)
    ? '/career-guides/finance-operations/'
    : row.suggestedExistingRoute;
  if (mappedRoutePath && ROUTES.has(mappedRoutePath)) {
    const route = ROUTES.get(mappedRoutePath);
    if (route.path === '/resources/accounting-basics/'
      && /\b(ifrs|iasb|international accounting standards|australian accounting standards|us gaap|gaap convergence|comparison|compare)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'source_scope');
      return { cluster, ownershipStatus: 'source_review_hold', reason: 'The current accounting resource is introductory and does not explain international frameworks or compare standards; assign only after a separately sourced scope review.', strategyRowId: null };
    }
    if (route.path === '/career-guides/finance-careers-after-graduation/'
      && /\b(in|near|jobs? in|careers? in)\s+(chennai|delhi(?: ncr)?|noida|kolkata|bengaluru|bangalore|pune|hyderabad|mumbai|dubai|uae|usa|uk|australia)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'source_scope');
      return { cluster, ownershipStatus: 'source_review_hold', reason: 'Location-specific career queries need current market and destination evidence; this general guide should not imply local vacancies or hiring conditions.', strategyRowId: null };
    }
    if (route.path === '/career-guides/finance-operations/'
      && !/\b(finance operations|financial operations|banking operations|bank operations|credit risk|credit analysis|credit analyst|credit underwriting|loan processing|loan operations|nbfc|bfsi operations|back[- ]office|middle[- ]office|credit assessment|operational risk management)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'source_scope');
      return { cluster, ownershipStatus: 'audience_fit_hold', reason: 'The query is broader than the live finance-operations guide’s documented workflow and career scope; do not force it onto this page.', strategyRowId: null };
    }
    if (route.path === '/career-guides/finance-operations/'
      && /\b(credit risk model(?:l)?ing|types of credit risk|credit risk analyst jobs|4\s?rs?|four rs)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'source_scope');
      return { cluster, ownershipStatus: 'source_review_hold', reason: 'Credit-risk modeling, taxonomy, mnemonic, and vacancy queries need dedicated role or technical sources beyond this introductory operations guide.', strategyRowId: null };
    }
    if (route.path === '/career-guides/kyc-aml-analyst/'
      && /\b(strict adherence|norms? is achieved|norms? are achieved|regulatory compliance requirements)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'source_scope');
      return { cluster, ownershipStatus: 'source_review_hold', reason: 'This phrasing implies a regulatory outcome and needs jurisdiction- and institution-specific authority before publication.', strategyRowId: null };
    }
    if (route.path === '/career-guides/retail-banking-operations/'
      && /\brelationship manager\b/i.test(keyword)
      && !/\b(bank|banking|retail|branch|loan|nri)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'role_scope');
      return { cluster, ownershipStatus: 'audience_fit_hold', reason: 'Unqualified relationship-manager wording is broader than retail banking and needs SERP/context validation.', strategyRowId: null };
    }
    if (route.path === '/career-guides/finance-operations/'
      && /\b(disaster risk|enterprise risk|financial risk|market risk|derivatives risk|business risk|treasury investment|bfsi companies|top bfsi companies|risk management software|risk management identifies|bvoc banking|underwriting securities)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'source_scope');
      return { cluster, ownershipStatus: 'audience_fit_hold', reason: 'This broad risk, software, company-list, or education query is not a direct match for the current finance-operations career page.', strategyRowId: null };
    }
    if (route.path === '/career-guides/trade-lifecycle/'
      && /\b(t\s?2 settlement|rolling settlement|settlement cycle|gross settlement|trade for trade)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'source_scope');
      return { cluster, ownershipStatus: 'source_review_hold', reason: 'Specific settlement-cycle terminology needs current market/source validation before this page can target it.', strategyRowId: null };
    }
    if (route.path === '/resources/reconciliation-in-finance/'
      && /\b(material reconciliation|bank reconciliation formula)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'source_scope');
      return { cluster, ownershipStatus: 'source_review_hold', reason: 'The query is either outside finance-operations reconciliation or asks for a formula that requires context-specific sourcing.', strategyRowId: null };
    }
    if (route.path === '/resources/investment-banking-interview-questions/'
      && /\b(pdf|download)\b/i.test(keyword)) {
      const cluster = reviewCluster(registry, 'source_scope');
      return { cluster, ownershipStatus: 'audience_fit_hold', reason: 'The live resource is an HTML explainer, not a downloadable PDF or file.', strategyRowId: null };
    }
    if (route.path !== '/courses/' || row.contentDisposition === 'current_masterclass_page_candidate_not_a_new_course') {
      const cluster = existingCluster(registry, route);
      return {
        cluster,
        ownershipStatus: 'mapped_existing_route',
        reason: `Direct Phase 2 topic/subtopic fit to the live indexable route ${route.path}; keep the assignment informational unless current curriculum evidence authorizes otherwise.`,
        strategyRowId: null,
      };
    }
  }

  if (row.topic === 'professional_qualification') {
    if (row.manualReviewRequired || row.confidence === 'low') {
      const cluster = reviewCluster(registry, 'qualification');
      return { cluster, ownershipStatus: 'review_required', reason: 'Qualification query is ambiguous or otherwise flagged; verify exact credential, search intent, and official sources before grouping it.', strategyRowId: null };
    }
    const cluster = proposedCluster(registry, qualificationClusterId(row));
    return { cluster, ownershipStatus: 'proposed_needs_review', reason: 'Grouped as a potential informational credential explainer only; require SERP, awarding-body, and factual review. Not a Centaur course or exam-prep offer.', strategyRowId: null };
  }

  if (row.topic === 'general_business_or_management') {
    const cluster = reviewCluster(registry, 'education_scope');
    return { cluster, ownershipStatus: 'audience_fit_hold', reason: 'Broad business topic is deprioritized until a clear finance-career audience fit is demonstrated.', strategyRowId: null };
  }

  if (row.topic === 'commerce_and_business_education') {
    if (row.manualReviewRequired) {
      const cluster = reviewCluster(registry, 'education_scope');
      return { cluster, ownershipStatus: 'review_required', reason: 'Commerce education topic is flagged for human audience-fit or query review before assignment to a proposed page.', strategyRowId: null };
    }
    const cluster = proposedCluster(registry, educationClusterId(keyword));
    return { cluster, ownershipStatus: 'proposed_needs_review', reason: 'Grouped into a proposed student/degree information page, not a Centaur degree or course offering; validate audience fit and SERP before approval.', strategyRowId: null };
  }

  if (row.topic === 'career_readiness_and_soft_skills') {
    if (row.manualReviewRequired) {
      const cluster = reviewCluster(registry, 'education_scope');
      return { cluster, ownershipStatus: 'review_required', reason: 'Human audience and SERP review is required before creating a general readiness resource.', strategyRowId: null };
    }
    const cluster = proposedCluster(registry, 'career.readiness');
    return { cluster, ownershipStatus: 'proposed_needs_review', reason: 'Grouped into a proposed informational readiness resource; no employment outcome or guarantee claim.', strategyRowId: null };
  }

  if (row.topic === 'finance_career_and_employment') {
    if (row.manualReviewRequired) {
      const cluster = reviewCluster(registry, 'finance_scope');
      return { cluster, ownershipStatus: 'review_required', reason: 'Career query has a Phase 2 review flag; validate its specific role/audience and any time-sensitive claims.', strategyRowId: null };
    }
    const cluster = proposedCluster(registry, 'career.finance_pathways');
    return { cluster, ownershipStatus: 'proposed_needs_review', reason: 'Grouped under finance career information; salary, eligibility, hiring, and outcomes require current evidence.', strategyRowId: null };
  }

  if (row.topic === 'accounting_finance_foundations') {
    const lowerKeyword = keyword.toLowerCase();
    const accountingBasicsIntent = /\b(golden rules? of accounting|accounting rules|accounting principles|basic accounting principles|accounting basics|financial accounting basics|accounting meaning|what is accounting|accounting standards|debit and credit|debit vs credit|journal entr(y|ies)|accounting equation|bookkeeping|carriage)\b/i.test(keyword);
    const unsupportedAccountingVariant = /\b(accounting software|cloud accounting|environmental accounting|green accounting|accrual accounting|\d+ journal entries|mcq|pdf|download)\b/i.test(keyword);
    if (accountingBasicsIntent && !unsupportedAccountingVariant) {
      const route = ROUTES.get('/resources/accounting-basics/');
      const cluster = existingCluster(registry, route);
      return { cluster, ownershipStatus: 'mapped_existing_route', reason: 'Keyword directly matches the live accounting-basics resource and its stated subjects.', strategyRowId: null };
    }
    if (/\b(finance gk|finance general knowledge|\bbfsi concepts? for beginners\b|\bupi\b|\bneft\b|\brtgs\b|securities market|primary market|secondary market|payment system)\b/i.test(lowerKeyword)) {
      const route = ROUTES.get('/resources/finance-gk/');
      const cluster = existingCluster(registry, route);
      return { cluster, ownershipStatus: 'mapped_existing_route', reason: 'Keyword falls within the existing finance/BFSI basics resource’s published introductory topics.', strategyRowId: null };
    }
    if (row.manualReviewRequired) {
      const cluster = reviewCluster(registry, 'finance_scope');
      return { cluster, ownershipStatus: 'review_required', reason: 'Foundational query has a Phase 2 human-review flag; confirm finance-career fit and the accurate topic owner.', strategyRowId: null };
    }
    const clusterId = foundationClusterId(keyword);
    if (clusterId === 'foundation.tax') {
      const cluster = reviewCluster(registry, 'finance_scope');
      return { cluster, ownershipStatus: 'source_review_hold', reason: 'Tax/regulatory query is held for jurisdiction-specific primary-source and legal-scope review.', strategyRowId: null };
    }
    const cluster = proposedCluster(registry, clusterId);
    return { cluster, ownershipStatus: 'proposed_needs_review', reason: 'Grouped into a proposed finance-learning cluster; verify topical fit, SERP intent, sources, and non-advisory scope before approval.', strategyRowId: null };
  }

  if (row.topic === 'current_program_finance_operations') {
    if (row.manualReviewRequired) {
      const cluster = reviewCluster(registry, 'finance_scope');
      return { cluster, ownershipStatus: 'review_required', reason: 'Operations query is flagged for human review; do not infer Masterclass curriculum inclusion from keyword wording.', strategyRowId: null };
    }
    const cluster = proposedCluster(registry, 'operations.fintech');
    return { cluster, ownershipStatus: 'proposed_needs_review', reason: 'No live route owner was suggested; hold as informational operations content and verify current-curriculum references separately.', strategyRowId: null };
  }

  const cluster = reviewCluster(registry, 'unclassified');
  return { cluster, ownershipStatus: 'review_required', reason: 'No safe mapping rule matched; manual assignment required.', strategyRowId: null };
}

function keywordCsv(rows) {
  const columns = [
    ['sourceWorksheetRow', 'Workbook row'],
    ['keyword', 'Keyword'],
    ['normalizedKeyword', 'Normalized keyword'],
    ['volume', 'Semrush volume'],
    ['keywordDifficulty', 'Keyword difficulty'],
    ['semrushIntent', 'Semrush intent'],
    ['topic', 'Phase 2 topic'],
    ['contentDisposition', 'Phase 2 disposition'],
    ['clusterId', 'Phase 3 cluster ID'],
    ['clusterLabel', 'Cluster / owner'],
    ['clusterType', 'Cluster type'],
    ['ownershipStatus', 'Mapping status'],
    ['targetUrl', 'Existing target URL'],
    ['proposedPath', 'Proposed path (not approved)'],
    ['suggestedExistingRoute', 'Phase 2 route suggestion'],
    ['manualReviewRequired', 'Phase 2 manual review required'],
    ['manualReviewReasons', 'Phase 2 manual review reasons'],
    ['competitorTopTenDomains', 'Competitors ranking top 10'],
    ['mappingReason', 'Mapping rationale / gate'],
    ['courseClaimBoundary', 'Course-claim boundary'],
  ];
  return [
    columns.map(([, label]) => csvCell(label)).join(','),
    ...rows.map((row) => columns.map(([key]) => csvCell(row[key])).join(',')),
  ].join('\r\n') + '\r\n';
}

function clusterCsv(clusters) {
  const columns = [
    ['id', 'Cluster ID'],
    ['label', 'Cluster / owner'],
    ['clusterType', 'Cluster type'],
    ['routeStatus', 'Route status'],
    ['targetUrl', 'Existing target URL'],
    ['proposedPath', 'Proposed path (not approved)'],
    ['keywordCount', 'Keyword count'],
    ['exampleKeywords', 'Examples'],
    ['scope', 'Scope and gates'],
  ];
  return [
    columns.map(([, label]) => csvCell(label)).join(','),
    ...clusters.map((cluster) => columns.map(([key]) => csvCell(key === 'exampleKeywords' ? cluster.examples : cluster[key])).join(',')),
  ].join('\r\n') + '\r\n';
}

function markdownReport(data) {
  const clusterRows = data.clusters
    .filter((cluster) => cluster.keywordCount > 0)
    .sort((a, b) => b.keywordCount - a.keywordCount || a.id.localeCompare(b.id))
    .map((cluster) => `| ${cluster.id} | ${cluster.keywordCount.toLocaleString('en-US')} | ${cluster.clusterType} | ${cluster.targetUrl || '—'} | ${cluster.label.replace(/\|/g, '\\|')} |`)
    .join('\n');
  const statuses = Object.entries(data.summary.byOwnershipStatus).sort((a, b) => b[1] - a[1]).map(([name, count]) => `| ${name} | ${count.toLocaleString('en-US')} |`).join('\n');
  const types = Object.entries(data.summary.byClusterType).sort((a, b) => b[1] - a[1]).map(([name, count]) => `| ${name} | ${count.toLocaleString('en-US')} |`).join('\n');
  const routes = Object.entries(data.summary.byExistingTarget).sort((a, b) => b[1] - a[1]).map(([name, count]) => `| ${name} | ${count.toLocaleString('en-US')} |`).join('\n');

  return `<!-- generated-by: ${MAPPER_ID}; mapper: ${MAPPER_VERSION} -->
# Semrush keyword gap: Phase 3 cluster and map

Generated from the Phase 2 classification on ${data.generatedAt.slice(0, 10)}.
This is a complete **keyword-to-cluster decision inventory** for ${data.summary.total.toLocaleString('en-US')} source keywords. It does not create or publish pages.

## Mapping result

- ${data.summary.total.toLocaleString('en-US')} of ${data.summary.sourceRows.toLocaleString('en-US')} classified rows have exactly one Phase 3 cluster assignment; duplicates and missing assignments are rejected by the generator.
- ${data.summary.clusterCount} keyword clusters are represented in the cluster register.
- ${data.summary.liveRouteKeywordCount.toLocaleString('en-US')} rows map to currently indexable routes; ${data.summary.exactApprovedStrategyMatchCount} of those are exact matches to the approved 728-keyword strategy.
- ${data.summary.proposedKeywordCount.toLocaleString('en-US')} rows belong to proposed informational clusters with **no URL/path approved**. These are not live pages.
- ${data.summary.manualReviewKeywordCount.toLocaleString('en-US')} rows retain Phase 2 human-review flags. A cluster assignment does not mean the SERP or the content decision has been reviewed by a person.
- ${data.summary.excludedKeywordCount.toLocaleString('en-US')} rows are excluded from current content scope; ${data.summary.holdKeywordCount.toLocaleString('en-US')} are held for audience, source, or navigation review.

## Mapping status

| Status | Keywords |
| --- | ---: |
${statuses}

## Cluster register

| Cluster ID | Keywords | Type | Existing URL | Cluster / owner |
| --- | ---: | --- | --- | --- |
${clusterRows}

## Live existing targets

| Target URL | Keywords |
| --- | ---: |
${routes || '| — | 0 |'}

## Guardrails and limitations

- The only Centaur course remains the **Financial Operations Masterclass**. Commercial candidates map only to its existing /courses/ page. They do not create separate course/module offers; curriculum claims require a current published-curriculum check.
- Third-party qualifications are grouped only as potential informational explainers. Never claim Centaur offers CFA, ACCA, CMA, CPA, CA, FRM, CFP, or other qualification preparation. Use current official awarding-body sources.
- Proposed cluster rows have null target URLs and null proposed paths until SERP, editorial, source, and governance checks approve a page. They are planning clusters, not a build instruction.
- Existing route assignments are validated against SEO_ROUTES and the indexable flag. Historical strategy entries for unregistered routes are not treated as live owners.
- Existing-route mappings are topic-level recommendations, not proof that every keyword is already covered in page copy. Check on-page scope before adding a keyword to metadata or writing a section.
- Semrush country/database, language, and device remain unknown. Volumes and KD are preserved per keyword but are not summed or used as a priority forecast.
- No live Google SERPs were inspected in this automated phase. The Phase 2 manual-review queue is still required before approving new-page clusters or resolving uncertain mappings.

## Files

- semrush-organic-competitors-keyword-gap-mapped-2026-09-23.json: classified rows with a single owner/cluster decision and cluster register.
- semrush-keyword-gap-keyword-map-2026-09-23.csv: spreadsheet-friendly row-level map for all source terms.
- semrush-keyword-gap-clusters-2026-09-23.csv: one row per keyword cluster/owner.
- semrush-keyword-gap-phase3-cluster-and-map-report-2026-09-23.md: this summary and governance notes.
`;
}

function main() {
  if (!fs.existsSync(inputPath)) throw new Error(`Missing Phase 2 input: ${inputPath}`);
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (!Array.isArray(input.keywords) || input.keywords.length === 0) throw new Error('Phase 2 JSON has no keyword rows.');

  const strategyByKeyword = new Map();
  for (const row of KEYWORD_STRATEGY_ROWS) {
    const key = normalize(row.normalizedKeyword || row.keyword);
    if (strategyByKeyword.has(key)) throw new Error(`Duplicate approved strategy keyword after normalization: ${key}`);
    strategyByKeyword.set(key, row);
  }

  const registry = new Map();
  const seenKeywords = new Set();
  const mappedKeywords = input.keywords.map((row) => {
    const key = normalize(row.normalizedKeyword || row.keyword);
    if (seenKeywords.has(key)) throw new Error(`Duplicate source keyword after normalization: ${row.keyword}`);
    seenKeywords.add(key);
    const mapping = mapOne(row, registry, strategyByKeyword);
    mapping.cluster.keywordCount += 1;
    if (mapping.cluster.examples.length < 8) mapping.cluster.examples.push(row.keyword);
    return {
      ...row,
      clusterId: mapping.cluster.id,
      clusterLabel: mapping.cluster.label,
      clusterType: mapping.cluster.clusterType,
      ownershipStatus: mapping.ownershipStatus,
      targetUrl: mapping.cluster.targetUrl,
      proposedPath: mapping.cluster.proposedPath,
      mappingReason: mapping.reason,
      strategyRowId: mapping.strategyRowId,
      mappedRouteStatus: mapping.cluster.routeStatus,
    };
  });

  if (mappedKeywords.length !== input.keywords.length) throw new Error('Mapping did not preserve source row count.');
  const ownershipStatusCount = mappedKeywords.filter((row) => row.ownershipStatus).length;
  if (ownershipStatusCount !== input.keywords.length) throw new Error('At least one keyword is missing its single-owner status.');
  for (const row of mappedKeywords) {
    if (row.targetUrl && !ROUTES.has(row.targetUrl)) throw new Error(`Mapped URL is not currently indexable: ${row.keyword} -> ${row.targetUrl}`);
    if (row.clusterType === 'proposed_informational_page' && (row.targetUrl || row.proposedPath)) throw new Error(`Proposed cluster must not claim an approved URL: ${row.clusterId}`);
  }

  const clusters = [...registry.values()].sort((a, b) => a.id.localeCompare(b.id));
  const totalClusterRows = clusters.reduce((sum, cluster) => sum + cluster.keywordCount, 0);
  if (totalClusterRows !== mappedKeywords.length) throw new Error(`Cluster row totals ${totalClusterRows} do not equal source rows ${mappedKeywords.length}.`);

  const summary = {
    total: mappedKeywords.length,
    sourceRows: input.summary?.total ?? mappedKeywords.length,
    clusterCount: clusters.filter((cluster) => cluster.keywordCount > 0).length,
    liveRouteKeywordCount: mappedKeywords.filter((row) => row.targetUrl).length,
    exactApprovedStrategyMatchCount: mappedKeywords.filter((row) => row.ownershipStatus === 'exact_approved_strategy_route').length,
    proposedKeywordCount: mappedKeywords.filter((row) => row.clusterType === 'proposed_informational_page').length,
    manualReviewKeywordCount: mappedKeywords.filter((row) => row.manualReviewRequired).length,
    excludedKeywordCount: mappedKeywords.filter((row) => row.clusterType === 'excluded_scope').length,
    holdKeywordCount: mappedKeywords.filter((row) => ['manual_review_queue', 'audience_fit_hold'].includes(row.clusterType)).length,
    byOwnershipStatus: sumBy(mappedKeywords, 'ownershipStatus'),
    byClusterType: sumBy(mappedKeywords, 'clusterType'),
    byExistingTarget: sumBy(mappedKeywords.filter((row) => row.targetUrl), 'targetUrl'),
  };

  const output = {
    schemaVersion: 1,
    generatedBy: MAPPER_ID,
    mapperVersion: MAPPER_VERSION,
    generatedAt: new Date().toISOString(),
    source: {
      classificationFile: path.basename(inputPath),
      classificationInventorySha256: input.source?.inventorySha256 || null,
      totalKeywords: input.keywords.length,
      strategySource: 'src/content/seo/keywordStrategyData.js',
      routeRegistry: 'src/seo/seoRoutes.js',
    },
    constraints: {
      currentCourse: 'Financial Operations Masterclass only',
      thirdPartyQualifications: 'informational only; no Centaur offering or exam-preparation claims',
      proposedClustersAreLivePages: false,
      onlyRegisteredIndexableRoutesMayBeExistingTargets: true,
      sourceCountryDatabaseLanguageDevice: input.source?.sourceSettings || null,
    },
    summary,
    clusters,
    keywords: mappedKeywords,
  };

  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  fs.writeFileSync(keywordCsvPath, keywordCsv(mappedKeywords), 'utf8');
  fs.writeFileSync(clusterCsvPath, clusterCsv(clusters.filter((cluster) => cluster.keywordCount > 0)), 'utf8');
  fs.writeFileSync(reportPath, markdownReport(output), 'utf8');

  console.log(`Mapped ${summary.total.toLocaleString('en-US')} keywords into ${summary.clusterCount} clusters.`);
  console.log(`Live-route assignments: ${summary.liveRouteKeywordCount.toLocaleString('en-US')}; proposed informational: ${summary.proposedKeywordCount.toLocaleString('en-US')}; human review still flagged: ${summary.manualReviewKeywordCount.toLocaleString('en-US')}; excluded: ${summary.excludedKeywordCount.toLocaleString('en-US')}.`);
}

main();
