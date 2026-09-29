#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const dataDirectory = path.join(projectRoot, 'data/seo/keyword-gap');
const inputPath = path.join(dataDirectory, 'semrush-organic-competitors-keyword-gap-2026-09-23.json');
const outputPath = path.join(dataDirectory, 'semrush-organic-competitors-keyword-gap-classified-2026-09-23.json');
const reviewCsvPath = path.join(dataDirectory, 'semrush-keyword-gap-manual-review-2026-09-23.csv');
const reportPath = path.join(dataDirectory, 'semrush-keyword-gap-classification-report-2026-09-23.md');
const IMPORTER_ID = 'tools/classify-semrush-keyword-gap.js';
const CLASSIFIER_VERSION = '1.0.0';

const TOPIC_RULES = [
  { id: 'topic.brand_navigation', topic: 'competitor_or_brand_navigation', pattern: /\b(centaur(?: careers)?|imarticus|zelleducation|zell education|quintedge|proschool)\b/i },
  { id: 'topic.employer_navigation', topic: 'employer_or_institution_navigation', pattern: /\b(goldman sachs|jp morgan|jpmorgan|morgan stanley|societe generale|arcesium|citco|blackrock|big 4|deloitte|pwc|ey|kpmg|cma cgm|alliance bernstein)\b.*\b(career|careers|job|jobs|login|portal)\b|\b(myacca|my acca|cfa institute|garp)\b/i },
  { id: 'topic.professional_qualification', topic: 'professional_qualification', pattern: /\b(ca|cs|cfa|acca|cma|cpa|frm|cfp|cipm|cima|icai|icmai|icwa|icwai|nism|ncfm|garp|chartered accountant|chartered accountancy|chartered financial analyst|certified management accountant|certified public accountant|certified financial planner|company secretary|cost accountant|enrolled agent|fmva|certified internal auditor|cia certification|esg certification|risk and ai|aca|caia|aicpa|cmt|prm|rai|professional qualifications?)\b/i },
  { id: 'topic.current_program', topic: 'current_program_finance_operations', pattern: /\b(financial operations masterclass|finance operations|financial operations|investment banking operations|investment banking ops|ib operations|kyc|know your customer|aml|anti money laundering|anti-money laundering|trade lifecycle|trade life cycle|trade settlement|post[- ]trade|reconciliation|retail banking|digital payments?|fintech|neo banking|neo banking|nbfc|loan processing|credit analysis|risk management|banking operations|bank operations|bfs[iy]|swift payments?|upi payments?|rtgs|imps|corporate actions|fund accounting|securities operations|back[- ]office|middle[- ]office)\b/i },
  { id: 'topic.finance_career', topic: 'finance_career_and_employment', pattern: /\b(finance|financial|banking|accounting|investment banking|investment banker|credit analyst|financial analyst|chartered accountant|accountant|fund manager|portfolio manager|treasury analyst|risk analyst|bfs[iy])\b.*\b(career|careers|job|jobs|salary|salaries|role|roles|interview|resume|skills|employment|recruitment|after graduation|after b\.?\s?com|how to become)\b|\b(career|careers|job|jobs|salary|salaries|role|roles|interview|resume|skills|employment)\b.*\b(finance|financial|banking|accounting|investment banking|investment banker|credit analyst|financial analyst|chartered accountant|accountant|fund manager|portfolio manager|bfs[iy])\b/i },
  { id: 'topic.finance_career_readiness', topic: 'career_readiness_and_soft_skills', pattern: /\b(soft skills|employability skills|presentation skills|communication skills|barriers of communication|interpersonal skills|workplace skills|resume writing|cv writing|aptitude test|aptitude questions|interview questions?|interview preparation|interview tips?|career options|best career options|which profession is best|which job is best|best jobs for the future|jobs for the future|after 12th which course)\b/i },
  { id: 'topic.accounting_finance_foundations', topic: 'accounting_finance_foundations', pattern: /\b(accounting|accountant|accounts?|bookkeeping|balance sheet|trial balance|profit and loss|cash flow|financial statements?|financial reporting|financial system|financial services|financial management|financial planning|financial instruments?|financial market|finance meaning|finance definition|what is finance|finance courses?|quantitative finance|banking and finance|banking sector|banking courses?|commercial banks?|different types of banks|investment banking|investment bank|investment banker|investment decision|investment companies|economics|demand|supply|tariff|elasticity|monopoly|oligopoly|market structure|types of market|pestel|pestle|taxation|tax|auditing|audit|ledger|carriage inward|carriage outward|golden rules of accounts|cost accounting|management accounting|financial analysis|financial modeling|financial modelling|capital budgeting|cost of capital|break even analysis|valuation|capital markets?|stock market|share market|initial public offering|ipo|money market|mutual funds?|venture capital|venture capitalist|hedge funds?|wealth management|asset management|equity|derivatives|forex|foreign exchange|exchange rate|treasury|risk and return|financial risk|operational risk|types of risk|working capital|ifrs|gaap|esg|tally|credit|debit|basel norms|time value of money|financial manager|cfo|cash|capital|budgeting|p2p loans?|order to cash|o2c process|mergers and acquisitions|algorithmic trading|leveraged buyout|lbo|dcf|wacc|capm|green finance|microfinance|financial literacy|financial institutions?|financial sector|project finance|enterprise value|net asset value|ratio analysis|cvp analysis|du ?pont analysis|cost control|cost of control|inventory control|fixed income|alternative investments?|syndicated loan|fiscal policy|trade cycle|asset classification|classification of cost|financial|finance|banking|bank)\b/i },
  { id: 'topic.commerce_education', topic: 'commerce_and_business_education', pattern: /\b(b\.?\s?com|bcom|bba|m\.?\s?com|mcom|baf|bbi|bfm|bms|bbm|mms|commerce|business administration|business management|mba|12th commerce|class 12 commerce|commerce stream|commerce students?|best career options after 12th|career options after 12th)\b/i },
  { id: 'topic.other_education', topic: 'other_professional_or_education_topic', pattern: /\b(digital marketing|marketing course|seo|meta tags|keyword research|google keyword planner|google ads|google analytics|data science|data scientist|data analyst|data analytics|data analysis|data visualization|exploratory data|machine learning|artificial intelligence|\bai\b|software development|computer science|programming|python|numpy|mongodb|sql|tableau|power ?bi|excel|etl|database|idempotent|linear programming|linear regression|hypothesis testing|actuarial science|actuary|project management|business analyst|medical|medicine|nursing|law|lawyer|civil services|upsc|government exam|teaching|graphic design|fashion design|hotel management|supply chain|human resources|human resource|\bhr\b|social media|performance appraisal|product manager|cyber ?security|cryptography|information security|cloud computing|reinforcement learning|object oriented programming|\boop\b|\bols\b|\bsas\b|\bipl\b|cricket|sports|facebook|instagram|lead generation|erp|tally software|flipped classroom|\bpm certification\b|future technology|trojan horse|alpha beta pruning|data pipeline|data source|bit manipulation|categorical data|dispersion in statistics|dynamic pricing|minimum viable product|mvp|nlp meaning|promosm|bias|biasness|general manager|process associate|career options|\bfinace\b)\b/i },
  { id: 'topic.general_business', topic: 'general_business_or_management', pattern: /\b(business|management|marketing|entrepreneurship|startup|company|corporate|operations management|project management|supply chain|economics|business analyst|business analytics|wealth management|asset management|financial management)\b/i },
];

const SUBTOPIC_RULES = [
  { id: 'subtopic.investment_banking_operations', label: 'investment_banking_operations', pattern: /\b(investment banking operations|investment banking ops|ib operations|securities operations)\b/i, route: '/career-guides/investment-banking-operations/' },
  { id: 'subtopic.kyc_aml', label: 'kyc_aml_compliance', pattern: /\b(kyc|know your customer|aml|anti[- ]money laundering|transaction monitoring|due diligence|sanctions screening)\b/i, route: '/career-guides/kyc-aml-analyst/' },
  { id: 'subtopic.trade_post_trade', label: 'trade_and_post_trade', pattern: /\b(trade lifecycle|trade life cycle|trade settlement|post[- ]trade|settlement|clearing|corporate actions|custody|trade processing)\b/i, route: '/career-guides/trade-lifecycle/' },
  { id: 'subtopic.reconciliation', label: 'reconciliation', pattern: /\b(reconciliation|reconcile|recon breaks?)\b/i, route: '/resources/reconciliation-in-finance/' },
  { id: 'subtopic.retail_banking', label: 'retail_banking', pattern: /\b(retail banking|branch operations|bank branch|loan officer|relationship manager|nri banking)\b/i, route: '/career-guides/retail-banking-operations/' },
  { id: 'subtopic.digital_payments', label: 'digital_payments', pattern: /\b(digital payments?|payment operations|payment processing|upi|imps|rtgs|swift|wallet reconciliation|payment disputes?)\b/i, route: '/career-guides/digital-payments-operations/' },
  { id: 'subtopic.fintech', label: 'fintech_and_digital_lending', pattern: /\b(fintech|neo banking|neobanking|digital lending|product operations)\b/i, route: null },
  { id: 'subtopic.credit_lending_risk', label: 'credit_lending_and_risk', pattern: /\b(nbfc|loan processing|credit analysis|credit risk|risk management|underwriting|loan operations)\b/i, route: '/career-guides/finance-operations/' },
  { id: 'subtopic.finance_operations', label: 'finance_operations', pattern: /\b(financial operations|finance operations|banking operations|bank operations|back[- ]office|middle[- ]office|bfs[iy])\b/i, route: '/career-guides/finance-operations/' },
  { id: 'subtopic.interview', label: 'finance_interview_prep', pattern: /\b(investment banking|finance|financial|banking)\b.*\b(interview questions?|interview preparation|interview tips?)\b|\b(interview questions?|interview preparation|interview tips?)\b.*\b(investment banking|finance|financial|banking)\b/i, route: '/resources/investment-banking-interview-questions/' },
  { id: 'subtopic.finance_career', label: 'finance_careers_after_graduation', pattern: /\b(finance careers?|finance jobs?|financial analyst jobs?|jobs after b\.?\s?com|careers after graduation|investment banker|financial analyst|credit analyst|cfo|fund manager|portfolio manager|treasury analyst)\b/i, route: '/career-guides/finance-careers-after-graduation/' },
];

const QUALIFICATION_RULES = [
  { id: 'qualification.ca', label: 'CA / Chartered Accountancy', pattern: /\b(ca|chartered accountant|chartered accountancy|icai|icmai|icwa|icwai)\b/i },
  { id: 'qualification.cs', label: 'CS / Company Secretary (acronym may be ambiguous)', pattern: /\b(cs|company secretary)\b/i },
  { id: 'qualification.cfa', label: 'CFA / Chartered Financial Analyst', pattern: /\b(cfa|chartered financial analyst)\b/i },
  { id: 'qualification.acca', label: 'ACCA', pattern: /\bacca\b/i },
  { id: 'qualification.cma', label: 'CMA / Cost or Management Accountant', pattern: /\b(cma|certified management accountant|cost accountant|cost and management accountant)\b/i },
  { id: 'qualification.cpa', label: 'CPA / Certified Public Accountant', pattern: /\b(cpa|certified public accountant)\b/i },
  { id: 'qualification.frm', label: 'FRM', pattern: /\bfrm\b/i },
  { id: 'qualification.cfp', label: 'CFP / Certified Financial Planner', pattern: /\b(cfp|certified financial planner|fpsb)\b/i },
  { id: 'qualification.other_finance_credential', label: 'Other finance credential (verify exact awarding body)', pattern: /\b(cipm|cima|nism|ncfm|garp|enrolled agent|fmva|certified internal auditor|cia certification|\bcia exam\b|esg certification|risk and ai|aca|caia|aicpa|cmt|prm|rai|cwm)\b/i },
];

const TAXONOMY = [
  { id: 'competitor_or_brand_navigation', meaning: 'Centaur or competitor-brand query; navigational/comparison risk; not a standalone target by default.' },
  { id: 'employer_or_institution_navigation', meaning: 'Employer, awarding body, or provider destination query; do not imply affiliation or try to substitute for its official destination.' },
  { id: 'professional_qualification', meaning: 'Third-party professional credential, exam, registration, syllabus, or study query; educational coverage only, never imply Centaur offers that qualification or exam preparation.' },
  { id: 'current_program_finance_operations', meaning: 'Finance/BFSI workflow or role adjacent to the single Financial Operations Masterclass; informational first, with program/curriculum references gated by current evidence.' },
  { id: 'finance_career_and_employment', meaning: 'Finance career, role, interview, job, or salary query; informational, with fresh evidence required for pay, employer, eligibility, and outcome claims.' },
  { id: 'accounting_finance_foundations', meaning: 'Accounting, finance, markets, or related concepts; explain educationally and avoid regulated financial/tax advice.' },
  { id: 'commerce_and_business_education', meaning: 'Commerce/business degree, student, or pathway query; visitor-content candidate only when it serves the finance-career audience.' },
  { id: 'career_readiness_and_soft_skills', meaning: 'General employability, communication, or interview-readiness query; informational only, without employment outcome guarantees.' },
  { id: 'other_professional_or_education_topic', meaning: 'Non-current finance profession, subject, or training market; normally out of scope and never a Centaur offering claim.' },
  { id: 'general_business_or_management', meaning: 'Broad business/management topic with weak or unclear connection to the current audience.' },
  { id: 'ambiguous_or_low_context', meaning: 'Short acronym or very broad query that cannot be safely assigned without SERP/context review.' },
  { id: 'unclassified_other', meaning: 'No supported topic rule matched; manual review before use.' },
];

function normalize(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

function splitIntent(value) {
  return [...new Set(String(value || '').split(',').map((label) => label.trim().toLowerCase()).filter(Boolean))];
}

function querySignals(keyword) {
  const rules = {
    course_or_training: /\b(course|courses|class|classes|coaching|training|bootcamp|program|programme|certification)\b/i,
    commercial_comparison: /\b(best|top|vs\.?|versus|compare|comparison|which|review|alternative)\b/i,
    fees_or_price: /\b(fees?|price|cost|charges?)\b/i,
    salary_or_pay: /\b(salary|salaries|stipend|package|ctc|lpa|pay scale|earnings?)\b/i,
    exam_or_registration: /\b(exam|examination|registration|register|admit card|hall ticket|result|results|cut ?off|pass rate|syllabus|question paper|study material|dates?)\b/i,
    employment_outcome: /\b(job guarantee|placement|recruitment|hiring|employer|companies|job after|jobs after)\b/i,
    geography: /\b(india|lucknow|delhi|ncr|mumbai|bengaluru|bangalore|hyderabad|pune|chennai|usa|uk|canada|uae)\b/i,
    brand: /\b(centaur(?: careers)?|imarticus|zelleducation|zell education|quintedge|proschool)\b/i,
  };
  return Object.entries(rules).filter(([, pattern]) => pattern.test(keyword)).map(([signal]) => signal);
}

function hasLowContext(keyword, normalizedKeyword) {
  const words = normalizedKeyword.split(' ').filter(Boolean);
  const acronymOnly = /^(ca|cs|cma|cpa|cfa|frm|cfp|acca|icai|icmai|upi|rai|api|aca|caia|aicpa|cmt|prm|cipm|cima)$/.test(normalizedKeyword);
  const bareFinanceWord = /^(finance|financial|bank|banking|accounting|business|management|course|courses|bias|career options|best careers|good careers|process associate)$/.test(normalizedKeyword);
  const abbreviationLed = /^(ca|cs|cma|cpa|cfa|frm|cfp|rai|aca|caia|cmt|prm|cipm|cima|ols|sas|ofs|cagpt|bfmi|cwm)\b/.test(normalizedKeyword) && words.length <= 3;
  const likelyMisspelling = /^(finace|finacial|finanace)(\s|$)/.test(normalizedKeyword);
  return acronymOnly || bareFinanceWord || abbreviationLed || likelyMisspelling || keyword.trim().length <= 2;
}

function searchIntent(sourceIntent, signals) {
  const labels = splitIntent(sourceIntent);
  const orderedLabels = ['transactional', 'commercial', 'informational', 'navigational'];
  const normalizedLabels = orderedLabels.filter((label) => labels.includes(label));
  const primary = normalizedLabels[0] || 'unspecified';
  const journeyStage = primary === 'transactional'
    ? 'action'
    : primary === 'commercial'
      ? 'consideration'
      : primary === 'navigational'
        ? 'brand_or_destination_lookup'
        : primary === 'informational'
          ? 'awareness'
          : 'unclassified';
  return {
    sourceLabels: labels,
    primary,
    journeyStage,
    querySignals: signals,
  };
}

function classifyRecord(record, sourceIndex) {
  const keyword = record.keyword;
  const normalizedKeyword = normalize(keyword);
  const signals = querySignals(keyword);
  const matchedTopics = TOPIC_RULES.filter((rule) => rule.pattern.test(keyword));
  const matchedSubtopics = SUBTOPIC_RULES.filter((rule) => rule.pattern.test(keyword));
  const qualifications = QUALIFICATION_RULES.filter((rule) => rule.pattern.test(keyword));
  const sourceIntents = splitIntent(record.intents);
  const lowContext = hasLowContext(keyword, normalizedKeyword);
  const hasBrand = signals.includes('brand');
  const employerNavigation = matchedTopics.some((rule) => rule.topic === 'employer_or_institution_navigation');
  const sourceHasNavigationalIntent = sourceIntents.includes('navigational');
  const hasCourseSignal = signals.includes('course_or_training') || sourceIntents.includes('transactional');
  const explicitCareerSignal = /\b(career|careers|job|jobs|salary|salaries|role|roles|interview|resume|skills|employment|recruitment|after graduation|after b\.?\s?com|how to become)\b/i.test(keyword);

  let topic = 'unclassified_other';
  if (hasBrand) topic = 'competitor_or_brand_navigation';
  else if (employerNavigation) topic = 'employer_or_institution_navigation';
  else if (qualifications.length > 0) topic = 'professional_qualification';
  else if (sourceHasNavigationalIntent) topic = 'employer_or_institution_navigation';
  else if (lowContext) topic = 'ambiguous_or_low_context';
  else if (matchedSubtopics.length > 0 || matchedTopics.some((rule) => rule.topic === 'current_program_finance_operations')) {
    topic = explicitCareerSignal ? 'finance_career_and_employment' : 'current_program_finance_operations';
  } else if (matchedTopics.some((rule) => rule.topic === 'finance_career_and_employment')) topic = 'finance_career_and_employment';
  else if (matchedTopics.some((rule) => rule.topic === 'career_readiness_and_soft_skills')) topic = 'career_readiness_and_soft_skills';
  else if (matchedTopics.some((rule) => rule.topic === 'accounting_finance_foundations')) topic = 'accounting_finance_foundations';
  else if (matchedTopics.some((rule) => rule.topic === 'commerce_and_business_education')) topic = 'commerce_and_business_education';
  else if (matchedTopics.some((rule) => rule.topic === 'other_professional_or_education_topic')) topic = 'other_professional_or_education_topic';
  else if (matchedTopics.some((rule) => rule.topic === 'general_business_or_management')) topic = 'general_business_or_management';

  const textMatches = [...matchedTopics.map((rule) => rule.id), ...matchedSubtopics.map((rule) => rule.id), ...qualifications.map((rule) => rule.id)];
  const reviewReasons = [];
  const evidenceGates = [];
  const sensitiveSignals = signals.filter((signal) => ['fees_or_price', 'salary_or_pay', 'exam_or_registration', 'employment_outcome'].includes(signal));
  if (hasBrand) reviewReasons.push('Brand/navigation query; only consider a factual, neutral comparison after brand and SERP review.');
  if (employerNavigation || sourceHasNavigationalIntent) reviewReasons.push('Destination/provider query; inspect the live result and do not imply an affiliation or substitute Centaur for an official destination.');
  if (lowContext) reviewReasons.push('Short or broad query; inspect the live Google results to confirm the acronym/query meaning.');
  if (qualifications.length > 0) evidenceGates.push('Use current awarding-body sources; never imply Centaur offers the credential or its preparation course.');
  if (topic === 'current_program_finance_operations' && hasCourseSignal) evidenceGates.push('Before mentioning the Masterclass, verify the exact subject in the current published curriculum; never frame it as a separate course.');
  if (hasCourseSignal && topic !== 'current_program_finance_operations' && topic !== 'professional_qualification' && topic !== 'competitor_or_brand_navigation') evidenceGates.push('A course/training query is not evidence Centaur offers the subject; use informational framing only or exclude it.');
  if (sensitiveSignals.includes('fees_or_price')) evidenceGates.push('Fees/prices are time-sensitive and need current primary-source evidence.');
  if (sensitiveSignals.includes('salary_or_pay')) evidenceGates.push('Salary/pay is time-sensitive; no salary or outcome promise without current authoritative evidence.');
  if (sensitiveSignals.includes('exam_or_registration')) evidenceGates.push('Exam, registration, syllabus, or study-material details need current official-source validation.');
  if (sensitiveSignals.includes('employment_outcome')) evidenceGates.push('Employment, placement, employer, or guarantee wording is claim-sensitive; follow approved current program terms only.');
  if (topic === 'other_professional_or_education_topic') evidenceGates.push('This subject does not match the current Financial Operations Masterclass; do not describe it as a Centaur offering.');
  if (topic === 'career_readiness_and_soft_skills') evidenceGates.push('Keep this informational; do not turn job-seeker content into a specific employment outcome or guarantee claim.');
  if (topic === 'general_business_or_management') reviewReasons.push('Business topic fit is weak; confirm a clear finance-career audience path before investing in content.');
  if (topic === 'unclassified_other') reviewReasons.push('No topic rule matched; inspect query and SERP manually before using it.');
  if (sourceIntents.length === 0) reviewReasons.push('Semrush supplied no intent label; classification is based on query wording only.');

  const routeCandidate = topic === 'current_program_finance_operations' && hasCourseSignal
    ? '/courses/'
    : topic === 'current_program_finance_operations' || topic === 'finance_career_and_employment'
      ? matchedSubtopics.find((rule) => rule.route)?.route || null
      : null;
  const relevance = topic === 'current_program_finance_operations'
    ? 'direct_topic_match_curriculum_check_required'
    : topic === 'finance_career_and_employment' || topic === 'accounting_finance_foundations'
      ? 'adjacent_finance_audience'
    : topic === 'professional_qualification' || topic === 'commerce_and_business_education' || topic === 'career_readiness_and_soft_skills'
      ? 'adjacent_visitor_only'
      : topic === 'general_business_or_management'
        ? 'weak_or_unconfirmed'
          : topic === 'competitor_or_brand_navigation' || topic === 'employer_or_institution_navigation' || topic === 'ambiguous_or_low_context' || topic === 'unclassified_other'
            ? 'uncertain'
            : 'out_of_scope';

  const contentDisposition = topic === 'competitor_or_brand_navigation' || topic === 'employer_or_institution_navigation' || sourceHasNavigationalIntent
    ? 'manual_review_brand_or_navigation'
    : topic === 'ambiguous_or_low_context' || topic === 'unclassified_other'
      ? 'manual_review_before_use'
      : topic === 'current_program_finance_operations' && hasCourseSignal
        ? 'current_masterclass_page_candidate_not_a_new_course'
        : topic === 'current_program_finance_operations'
          ? 'informational_finance_operations_candidate'
          : topic === 'finance_career_and_employment'
            ? 'informational_finance_career_candidate'
            : topic === 'professional_qualification'
              ? 'informational_third_party_qualification_only'
              : topic === 'accounting_finance_foundations' || topic === 'commerce_and_business_education'
                ? 'informational_education_candidate'
                : topic === 'career_readiness_and_soft_skills'
                  ? 'informational_career_readiness_candidate'
                : topic === 'general_business_or_management'
                  ? 'deprioritize_until_audience_fit_is_proven'
                  : 'exclude_from_current_content_scope';

  const confidence = lowContext || topic === 'unclassified_other'
    ? 'low'
    : topic === 'current_program_finance_operations' || topic === 'competitor_or_brand_navigation'
      ? 'high'
      : 'medium';
  const queryIntent = searchIntent(record.intents, signals);
  const competitorTopTenDomains = Object.entries(record.positions || {})
    .filter(([domain, position]) => domain !== 'centaurcareers.in' && position > 0 && position <= 10)
    .map(([domain]) => domain);

  return {
    sourceIndex,
    sourceWorksheetRow: sourceIndex + 2,
    keyword,
    normalizedKeyword,
    volume: record.volume,
    keywordDifficulty: record.keywordDifficulty,
    semrushIntent: record.intents,
    searchIntent: queryIntent,
    topic,
    relatedSubtopics: [...new Set(matchedSubtopics.map((rule) => rule.label))],
    detectedQualifications: qualifications.map((rule) => rule.label),
    relevance,
    contentDisposition,
    suggestedExistingRoute: routeCandidate,
    confidence,
    ruleIds: [...new Set([...textMatches, `disposition.${contentDisposition}`])],
    manualReviewRequired: reviewReasons.length > 0,
    manualReviewReasons: reviewReasons,
    contentEvidenceGates: evidenceGates,
    courseClaimBoundary: topic === 'professional_qualification'
      ? 'No Centaur offering/preparation claim for this third-party credential.'
      : topic === 'current_program_finance_operations'
        ? 'Only the Financial Operations Masterclass exists; describe a subject as included only after current-curriculum confirmation; do not imply separate courses.'
        : topic === 'employer_or_institution_navigation' || topic === 'competitor_or_brand_navigation'
          ? 'Do not imply an affiliation with, or official destination for, the named organization.'
        : 'Do not introduce a Centaur course claim from this keyword alone.',
    competitorTopTenDomains,
    competitorBestPosition: Object.entries(record.positions || {})
      .filter(([domain, position]) => domain !== 'centaurcareers.in' && position > 0)
      .reduce((best, [, position]) => best === null || position < best ? position : best, null),
  };
}

function countBy(rows, field) {
  const counts = new Map();
  for (const row of rows) counts.set(row[field], (counts.get(row[field]) || 0) + 1);
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function csvCell(value) {
  const stringValue = String(value ?? '');
  const spreadsheetSafe = /^[\s]*[=+@-]/.test(stringValue) ? `'${stringValue}` : stringValue;
  return `"${spreadsheetSafe.replace(/"/g, '""')}"`;
}

function toCsv(reviewQueue) {
  const columns = [
    ['sourceIndex', 'Source row index'],
    ['sourceWorksheetRow', 'Workbook row number'],
    ['keyword', 'Keyword'],
    ['volume', 'Semrush volume'],
    ['keywordDifficulty', 'Keyword difficulty'],
    ['semrushIntent', 'Semrush intent'],
    ['topic', 'Classified topic'],
    ['relevance', 'Centaur relevance'],
    ['contentDisposition', 'Content disposition'],
    ['suggestedExistingRoute', 'Existing route candidate'],
    ['confidence', 'Rule confidence'],
    ['manualReviewReasons', 'Why manual review is needed'],
    ['contentEvidenceGates', 'Content evidence / claim gates'],
    ['competitorTopTenDomains', 'Competitors ranking top 10'],
  ];
  return [
    columns.map(([, label]) => csvCell(label)).join(','),
    ...reviewQueue.map((row) => columns.map(([key]) => csvCell(Array.isArray(row[key]) ? row[key].join('; ') : row[key])).join(',')),
  ].join('\r\n') + '\r\n';
}

function markdownReport(data) {
  const topicCounts = Object.entries(data.summary.byTopic)
    .sort(([, left], [, right]) => right - left)
    .map(([topic, count]) => `| ${topic} | ${count.toLocaleString('en-US')} |`)
    .join('\n');
  const dispositionCounts = Object.entries(data.summary.byDisposition)
    .sort(([, left], [, right]) => right - left)
    .map(([disposition, count]) => `| ${disposition} | ${count.toLocaleString('en-US')} |`)
    .join('\n');
  const routeCounts = Object.entries(data.summary.byExistingRoute)
    .sort(([, left], [, right]) => right - left)
    .map(([route, count]) => `| ${route} | ${count.toLocaleString('en-US')} |`)
    .join('\n');
  const sourceIntentCounts = Object.entries(data.summary.bySourceIntentLabel)
    .sort(([, left], [, right]) => right - left)
    .map(([intent, count]) => `| ${intent} | ${count.toLocaleString('en-US')} |`)
    .join('\n');
  const primaryIntentCounts = Object.entries(data.summary.byPrimaryIntent)
    .sort(([, left], [, right]) => right - left)
    .map(([intent, count]) => `| ${intent} | ${count.toLocaleString('en-US')} |`)
    .join('\n');
  const examples = data.keywords
    .filter((row) => row.manualReviewRequired)
    .sort((left, right) => (right.volume || 0) - (left.volume || 0))
    .slice(0, 12)
    .map((row) => `| ${row.keyword.replace(/\|/g, '\\|')} | ${row.volume ?? '—'} | \`${row.topic}\` | ${row.manualReviewReasons[0]} |`)
    .join('\n');

  return `<!-- generated-by: ${IMPORTER_ID}; classifier: ${CLASSIFIER_VERSION} -->
# Semrush gap: Phase 2 review and classification

Generated from the imported Semrush workbook on ${data.generatedAt.slice(0, 10)}.
This is an offline classification of **${data.summary.total.toLocaleString('en-US')}**
keywords. It creates no public pages and changes no course or curriculum claim.

## Scope and guardrails

- Centaur's only current course is the **Financial Operations Masterclass**.
- This inventory does not establish that a keyword topic is taught. Every program
  fit or course-page candidate remains subject to current-curriculum confirmation.
- CFA, ACCA, CMA, CPA, CA/ICAI/ICMAI, FRM, CFP, and other third-party credential
  queries are informational-only candidates. Do not imply Centaur offers those
  credentials or preparation courses.
- Salary, fees, exam/registration, employer, placement, and guarantee terms need
  current primary-source review before any copy is written.
- Semrush country/database, language, and device are unknown in the source file;
  do not use its volume/KD figures as a confirmed India-specific forecast yet.
- “Rule confidence” measures phrase-to-topic matching, not keyword quality,
  search-result intent certainty, or expected ranking potential.

## Classification totals

- Classified: ${data.summary.total.toLocaleString('en-US')} / ${data.summary.total.toLocaleString('en-US')}
- Unique normalized keywords: ${data.summary.uniqueKeywordCount.toLocaleString('en-US')}
- Manual classification/SERP review required: ${data.summary.manualReviewRequired.toLocaleString('en-US')}
- Rule-classified without a manual-review flag: ${data.summary.noManualReviewFlag.toLocaleString('en-US')}
- Content items with separate factual/claim gates: ${data.summary.contentEvidenceGateCount.toLocaleString('en-US')}
- Centaur rankings in source export: ${data.summary.targetRankedKeywordCount}
- Source keywords with at least one competitor in the top 10: ${data.summary.competitorTopTenKeywordCount.toLocaleString('en-US')}
- Unavailable Semrush keyword-difficulty marker -1 retained: ${data.summary.keywordDifficultyMinusOneCount}

## By topic

| Topic | Keywords |
| --- | ---: |
${topicCounts}

## By recommended disposition

| Disposition | Keywords |
| --- | ---: |
${dispositionCounts}

## Existing route candidates (not final ownership)

These are possible existing destinations for relevant career/operations queries.
Course-intent terms point to the one current course hub only. Routes still need
editorial/keyword-cannibalization review.

| Existing route | Keywords |
| --- | ---: |
${routeCounts}

## Semrush source intent labels

| Source label | Keywords carrying this label |
| --- | ---: |
${sourceIntentCounts}

## Classifier primary intent

When a keyword has multiple Semrush labels, the primary label uses this order:
transactional, commercial, informational, then navigational. Original labels
remain available on every row.

| Primary label | Keywords |
| --- | ---: |
${primaryIntentCounts}

## Manual-review examples

The complete queue is in ${path.basename(reviewCsvPath)}.

| Keyword | Volume | Topic | Review reason |
| --- | ---: | --- | --- |
${examples}

## Review method

Every source row is joined by its stable row index and normalized keyword. Rules
classify brand/navigational terms, third-party credentials, current-course-topic
terms, finance careers, finance/accounting foundations, commerce education,
other education topics, broad business terms, and low-context/unmatched terms.
Semrush intent is retained separately from query signals such as course, salary,
fees, exam, and geography. No volume-based priority score is assigned because
the source market/device settings are unknown and keyword volumes should not be
summed as additive traffic forecasts. No live Google SERP was fetched in this
classification run; a manual-review flag means human topic/SERP confirmation is
still pending, not that a person has already reviewed the row.

## Use in the next phase

Use the classified JSON as the complete rule-based inventory and the CSV as the
human review queue. Review the CSV flags first, confirm Semrush settings, then
select a small number of distinct content clusters. Consolidate related
keywords onto useful pages; do not create one page per keyword or create pages
that imply an unprovided course.
`;
}

function writeGeneratedFile(filePath, content, isRecognized) {
  if (fs.existsSync(filePath) && !isRecognized(fs.readFileSync(filePath, 'utf8'))) {
    throw new Error(`Refusing to overwrite a file not generated by ${IMPORTER_ID}: ${path.relative(projectRoot, filePath)}`);
  }
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, content, { encoding: 'utf8', flag: 'wx' });
  fs.renameSync(temporaryPath, filePath);
}

function main() {
  if (!fs.existsSync(inputPath)) throw new Error(`Missing imported inventory: ${path.relative(projectRoot, inputPath)}`);
  const inventory = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (inventory.source?.analyzedDomain !== 'centaurcareers.in' || !Array.isArray(inventory.keywords)) {
    throw new Error('Input is not the validated Centaur Semrush gap inventory');
  }
  if (inventory.validation?.rowCount !== inventory.keywords.length || inventory.validation?.uniqueKeywordCount !== inventory.keywords.length) {
    throw new Error('Source inventory row/uniqueness validation does not match its keyword array');
  }

  const keywords = inventory.keywords.map((record, index) => classifyRecord(record, index));
  const uniqueKeywords = new Set(keywords.map((row) => row.normalizedKeyword));
  if (keywords.length !== inventory.validation.rowCount || uniqueKeywords.size !== keywords.length) {
    throw new Error('Classification did not preserve a one-to-one mapping of source keywords');
  }
  const topicIds = new Set(TAXONOMY.map((topic) => topic.id));
  const validDispositions = new Set([
    'manual_review_brand_or_navigation',
    'manual_review_before_use',
    'current_masterclass_page_candidate_not_a_new_course',
    'informational_finance_operations_candidate',
    'informational_finance_career_candidate',
    'informational_third_party_qualification_only',
    'informational_education_candidate',
    'informational_career_readiness_candidate',
    'deprioritize_until_audience_fit_is_proven',
    'exclude_from_current_content_scope',
  ]);
  if (keywords.some((row) => !topicIds.has(row.topic) || !validDispositions.has(row.contentDisposition))) {
    throw new Error('One or more rows have an invalid topic or content disposition');
  }

  const reviewQueue = keywords.filter((row) => row.manualReviewRequired);
  const bySourceIntentLabel = {};
  for (const row of keywords) {
    for (const intent of row.searchIntent.sourceLabels) {
      bySourceIntentLabel[intent] = (bySourceIntentLabel[intent] || 0) + 1;
    }
  }
  const summary = {
    total: keywords.length,
    uniqueKeywordCount: uniqueKeywords.size,
    manualReviewRequired: reviewQueue.length,
    noManualReviewFlag: keywords.length - reviewQueue.length,
    contentEvidenceGateCount: keywords.filter((row) => row.contentEvidenceGates.length > 0).length,
    targetRankedKeywordCount: inventory.validation.targetRankedKeywordCount,
    competitorTopTenKeywordCount: inventory.validation.competitorTopTenKeywordCount,
    keywordDifficultyMinusOneCount: inventory.validation.keywordDifficultyMinusOneCount,
    byTopic: countBy(keywords, 'topic'),
    byDisposition: countBy(keywords, 'contentDisposition'),
    byExistingRoute: countBy(keywords.filter((row) => row.suggestedExistingRoute), 'suggestedExistingRoute'),
    bySourceIntentLabel,
    byPrimaryIntent: countBy(keywords.map((row) => ({ primary: row.searchIntent.primary })), 'primary'),
    byConfidence: countBy(keywords, 'confidence'),
  };

  const output = {
    schemaVersion: 1,
    generatedBy: IMPORTER_ID,
    classifierVersion: CLASSIFIER_VERSION,
    generatedAt: new Date().toISOString(),
    source: {
      inventoryFile: path.basename(inputPath),
      inventorySha256: crypto.createHash('sha256').update(fs.readFileSync(inputPath)).digest('hex'),
      workbookSha256: inventory.source.sha256,
      rowCount: inventory.keywords.length,
      analyzedDomain: inventory.source.analyzedDomain,
      competitors: inventory.source.competitors,
      sourceSettings: inventory.source.sourceSettings,
    },
    constraints: {
      onlyCurrentCourse: 'Financial Operations Masterclass',
      noNewCourseClaimsFromKeywordData: true,
      volumePriorityAssigned: false,
      reasonVolumePriorityNotAssigned: 'Semrush country/database and device settings were absent from the source workbook.',
      rulesDoNotEstablishCurriculumCoverage: true,
      humanReviewIsStillRequiredForFlaggedRows: true,
    },
    taxonomy: TAXONOMY,
    summary,
    keywords,
  };

  fs.mkdirSync(dataDirectory, { recursive: true });
  writeGeneratedFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, (content) => {
    try { return JSON.parse(content).generatedBy === IMPORTER_ID; } catch { return false; }
  });
  writeGeneratedFile(reviewCsvPath, toCsv(reviewQueue), (content) => content.startsWith('"Source row index","Keyword","Semrush volume"') || content.startsWith('"Source row index","Workbook row number","Keyword","Semrush volume"'));
  writeGeneratedFile(reportPath, markdownReport(output), (content) => content.startsWith(`<!-- generated-by: ${IMPORTER_ID};`));

  console.log(`Classified ${summary.total.toLocaleString('en-US')} of ${inventory.keywords.length.toLocaleString('en-US')} keywords; no source keyword was dropped.`);
  console.log(`Manual-review queue: ${summary.manualReviewRequired.toLocaleString('en-US')}; no review flag: ${summary.noManualReviewFlag.toLocaleString('en-US')}.`);
  console.log(`Outputs: ${path.relative(projectRoot, outputPath)}, ${path.relative(projectRoot, reviewCsvPath)}, ${path.relative(projectRoot, reportPath)}.`);
  console.log(`By topic: ${Object.entries(summary.byTopic).sort(([, left], [, right]) => right - left).map(([topic, count]) => `${topic}=${count}`).join('; ')}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Semrush keyword-gap classification failed');
  process.exit(1);
}
