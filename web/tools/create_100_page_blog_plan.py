import csv
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import analyze_keyword_sources as source
import create_seo_keyword_plan as workbook


ROOT = Path(__file__).resolve().parents[1]
KEYWORDI = Path(r'C:\Users\Virat Singh\Downloads\keywordi.xlsx')
COMPETITOR = Path(r'C:\Users\Virat Singh\Downloads\Keyword Tool Export - Analyze Competitors - imarticus org.xlsx')
SPY = Path(r'C:\Users\Virat Singh\Downloads\spy.xlsx')
TOP_PAGES = Path(r'C:\Users\Virat Singh\Downloads\TopPages_imarticus-org_9_27_2026_SEO (1).csv')
workbook.OUTPUT = ROOT / 'SEO_100_Page_100_Blog_Impact_Plan_2026-09-27_v2.xlsx'


def norm(value):
    return re.sub(r'[^a-z0-9]+', ' ', str(value).lower()).strip()


def num(value):
    try:
        return float(str(value).replace(',', '').strip())
    except (TypeError, ValueError):
        return 0.0


def compact_keyword_rows():
    rows = []
    for row in source.read_rows(KEYWORDI):
        keyword = str(row.get('Keyword', '')).strip()
        if keyword:
            rows.append({'source': 'keywordi.xlsx', 'keyword': keyword, 'volume': num(row.get('Search Volume')), 'difficulty': num(row.get('Ranking Difficulty')), 'clicks': num(row.get('Total Monthly Clicks')), 'rank': ''})
    for row in source.read_rows(COMPETITOR):
        keyword = str(row.get('Keywords', '')).strip()
        if keyword:
            rows.append({'source': 'imarticus keyword export', 'keyword': keyword, 'volume': num(row.get('Search Volume (Average)')), 'difficulty': '', 'clicks': '', 'rank': ''})
    for row in source.read_rows(SPY):
        keyword = str(row.get('Keyword', '')).strip()
        if keyword:
            rows.append({'source': 'spy.xlsx', 'keyword': keyword, 'volume': num(row.get('Search Volume')), 'difficulty': num(row.get('Ranking Difficulty')), 'clicks': num(row.get('SEO Clicks')), 'rank': num(row.get('Rank'))})
    with TOP_PAGES.open('r', encoding='utf-8-sig', newline='') as handle:
        for row in csv.DictReader(handle):
            keyword = str(row.get('Top KW', '')).strip()
            if keyword:
                rows.append({'source': 'competitor top-pages CSV', 'keyword': keyword, 'volume': num(row.get('Top KW Search Volume')), 'difficulty': '', 'clicks': num(row.get('Top KW Clicks')), 'rank': num(row.get('Top KW Position'))})
    return rows


def evidence_for(terms, corpus):
    terms = [norm(term) for term in (terms or []) if norm(term)]
    matches = []
    matched_term = ''
    for term in terms:
        if len(term) < 4:
            continue
        candidate_matches = [row for row in corpus if term == norm(row['keyword']) or term in norm(row['keyword'])]
        if candidate_matches:
            matches = candidate_matches
            matched_term = term
            break
    matches.sort(key=lambda row: (row['volume'], num(row['clicks'])), reverse=True)
    if not matches:
        return {'keyword': 'No exact source match; strategic gap', 'volume': 0, 'difficulty': '', 'clicks': '', 'source': 'Strategic gap', 'source_count': 0}
    best = matches[0]
    return {**best, 'matched_term': matched_term, 'source_count': len({row['source'] for row in matches if row['volume'] > 0})}


def impact_score(item, evidence):
    fit = {'direct offer': 30, 'module topic': 27, 'career bridge': 24, 'adjacent qualified': 19, 'informational': 17}.get(item['fit'], 17)
    intent = {'commercial': 25, 'career': 22, 'decision': 20, 'informational': 16}.get(item['intent'], 16)
    volume = evidence['volume']
    volume_score = 20 if volume >= 10000 else 17 if volume >= 3000 else 14 if volume >= 1000 else 10 if volume >= 500 else 7 if volume >= 100 else 4 if volume else 2
    difficulty = num(evidence.get('difficulty'))
    difficulty_score = 8 if not difficulty else max(1, round(8 - difficulty / 4))
    source_score = min(12, evidence.get('source_count', 0) * 3)
    return min(100, fit + intent + volume_score + difficulty_score + source_score)


def add_page(items, title, slug, cluster, primary, intent, fit, page_type, offer, cta, links, angle, guardrail, wave, evidence_terms=None, status='New planned page'):
    items.append({'title': title, 'slug': slug, 'cluster': cluster, 'primary': primary, 'secondary': ', '.join(evidence_terms or [primary]), 'intent': intent, 'fit': fit, 'page_type': page_type, 'offer': offer, 'cta': cta, 'links': links, 'angle': angle, 'guardrail': guardrail, 'wave': wave, 'status': status, 'evidence_terms': evidence_terms or [primary]})


def make_pages():
    items = []
    course_links = '/courses/, /contact/, /faqs/'
    add_page(items, 'Financial Operations Masterclass', '/courses/', 'Commercial / masterclass', 'finance courses', 'commercial', 'direct offer', 'Commercial authority', 'One six-week Financial Operations Masterclass', 'Ask for current cohort, fees, eligibility and guarantee terms', course_links, 'Program promise, six modules, delivery, eligibility, projects, interview support, current terms and FAQs.', 'Do not create separate classes or claim any term not approved for the current cohort.', 1, ['finance courses', 'financial operations masterclass'], 'Expand existing authority page')
    add_page(items, 'Finance Courses in India for Graduates', '/courses/finance-courses-india/', 'Commercial / masterclass', 'finance courses in india', 'commercial', 'direct offer', 'Commercial landing', 'Financial Operations Masterclass', 'Request the current India-wide online cohort details', '/courses/, /india/, /contact/', 'Compare the actual six-week offer with learner goals, access mode, eligibility and outcomes.', 'Do not imply a physical campus in every city.', 1, ['finance courses in india', 'finance courses'])
    add_page(items, 'Banking and Finance Course', '/courses/banking-and-finance/', 'Commercial / masterclass', 'banking and finance course', 'commercial', 'direct offer', 'Commercial landing', 'Financial Operations Masterclass', 'Ask which published module fits the learner goal', '/courses/, /career-guides/, /contact/', 'Explain banking operations, accounting, KYC/AML, payments, credit and FinTech.', 'One course page owns this intent; module pages explain topics rather than sell separate classes.', 1, ['banking and finance course', 'banking courses'])
    add_page(items, 'Banking Courses and Career Directions', '/courses/banking-courses/', 'Commercial / masterclass', 'banking courses', 'commercial', 'direct offer', 'Commercial landing', 'Financial Operations Masterclass', 'Talk to the team about the banking track and current terms', '/courses/, /career-guides/retail-banking-operations/, /contact/', 'Map banking operations, retail banking, loan processing, KYC/AML and payments to roles.', 'Do not target government bank exam coaching or promise bank employment.', 1, ['banking courses', 'banking course'])
    add_page(items, 'Investment Banking Operations Course', '/courses/investment-banking-operations/', 'Commercial / IB operations', 'investment banking course', 'commercial', 'module topic', 'Module information landing', 'Investment Banking Operations module within the Masterclass', 'Explore the module and ask about current cohort coverage', '/courses/, /career-guides/investment-banking-operations/, /career-guides/trade-lifecycle/', 'Trade settlements, reconciliation, corporate actions, fund accounting, workflow tools and entry-role skills.', 'Do not present front-office deal-making, CFA preparation or a standalone certification.', 1, ['investment banking course', 'investment banking courses'], 'Expand existing module route')
    add_page(items, 'Finance Operations Training', '/courses/finance-operations-training/', 'Commercial / finance operations', 'finance operations training', 'commercial', 'module topic', 'Module information landing', 'Finance Operations module within the Masterclass', 'Ask for syllabus, delivery mode and current terms', '/courses/, /career-guides/finance-operations/, /resources/accounting-basics/', 'Loan processing, credit analysis, reporting, controls and risk-management foundations.', 'Use finance/BFSI qualifiers; do not target generic operations-management training.', 1, ['finance operations', 'operations management'])
    add_page(items, 'Retail Banking Module Guide', '/courses/retail-banking/', 'Commercial / retail banking', 'retail banking course', 'commercial', 'module topic', 'Module information landing', 'Retail Banking module within the Masterclass', 'Ask how retail banking topics are covered in the current cohort', '/courses/, /career-guides/retail-banking-operations/, /blog/commercial-banks-services-operations/', 'Relationship management, branch operations, loan officer work and NRI banking concepts.', 'Do not imply a separate retail-banking class or bank placement.', 1, ['retail banking', 'banking course'], 'Expand existing module route')
    add_page(items, 'KYC and AML Compliance Module', '/courses/kyc-aml/', 'Commercial / compliance', 'kyc aml course', 'commercial', 'module topic', 'Module information landing', 'KYC / AML Compliance module within the Masterclass', 'Ask for current KYC/AML syllabus and support terms', '/courses/, /career-guides/kyc-aml-analyst/, /blog/kyc-aml-basics/', 'Due diligence, transaction monitoring, SAR concepts, regulatory reporting and compliance workflow.', 'Do not claim regulatory accreditation or guarantee compliance employment.', 1, ['kyc aml course', 'aml course', 'compliance course'], 'Expand existing module route')
    add_page(items, 'Digital Payments Operations Module', '/courses/digital-payments/', 'Commercial / payments', 'digital payments course', 'commercial', 'module topic', 'Module information landing', 'Digital Payments module within the Masterclass', 'Ask for current payments syllabus and cohort access', '/courses/, /career-guides/digital-payments-operations/, /blog/digital-payments-operations-career-india/', 'SWIFT, RTGS, UPI/IMPS operations, disputes and wallet reconciliation.', 'Do not present this as payment certification or financial advice.', 1, ['digital payments', 'payment operations'], 'Expand existing module route')
    add_page(items, 'FinTech and Neo-Banking Module', '/courses/fintech/', 'Commercial / FinTech', 'fintech courses', 'commercial', 'module topic', 'Module information landing', 'FinTech and Neo-Banking module within the Masterclass', 'Ask which FinTech topics and projects are in the current cohort', '/courses/, /career-guides/fintech-operations/, /blog/fintech-operations-careers-after-graduation/', 'Digital lending, product operations, compliance analyst and customer-success context.', 'Do not claim software-development training or FinTech employment partnerships without proof.', 1, ['fintech courses', 'fintech course'], 'Expand existing module route')
    add_page(items, 'Online Finance Course Across India', '/courses/online-finance-course-india/', 'Commercial / delivery', 'online finance course', 'commercial', 'direct offer', 'Delivery landing', 'Live online access to the Financial Operations Masterclass', 'Request online cohort, schedule and current terms', '/courses/, /india/, /contact/', 'Explain online delivery, learner support, practice, cohort communication and how city pages differ.', 'State that online access is available across India; do not create fake local classrooms.', 1, ['online finance course', 'finance course online'])
    add_page(items, 'Finance Course for Graduates', '/courses/finance-course-for-graduates/', 'Commercial / audience', 'finance course for graduates', 'commercial', 'direct offer', 'Audience landing', 'Financial Operations Masterclass for graduates and job switchers', 'Check eligibility and current cohort terms', '/courses/, /career-guides/finance-careers-after-graduation/, /contact/', 'Map graduate backgrounds to finance operations, banking, compliance, payments and FinTech topics.', 'Do not guarantee a specific title, employer, salary or city.', 1, ['finance course for graduates', 'career in finance'])
    add_page(items, 'Finance Course After BCom', '/courses/finance-course-after-bcom/', 'Commercial / audience', 'finance course after bcom', 'commercial', 'direct offer', 'Audience landing', 'Financial Operations Masterclass', 'See the current path from BCom knowledge to finance operations practice', '/courses/, /career-guides/finance-careers-after-graduation/, /resources/accounting-basics/', 'Bridge accounting foundations to banking workflows, reconciliation, KYC/AML, payments and interviews.', 'Do not suggest this replaces a university degree or professional credential.', 1, ['finance course after bcom', 'finance careers after graduation'])
    add_page(items, 'Job-Oriented Finance Training', '/courses/job-oriented-finance-training/', 'Commercial / job intent', 'job oriented finance training', 'commercial', 'direct offer', 'Commercial landing', 'Financial Operations Masterclass and published career-support terms', 'Ask for current job-guarantee eligibility and terms', '/courses/, /placements/, /faqs/, /contact/', 'Explain learning, practical scenarios, interview preparation and the exact current guarantee terms.', 'Every job or guarantee claim must match the approved terms page and current cohort.', 1, ['job oriented finance training', 'finance jobs'])
    add_page(items, 'Finance Operations Syllabus', '/courses/finance-operations-syllabus/', 'Commercial / decision', 'finance course syllabus', 'decision', 'direct offer', 'Syllabus landing', 'The six module areas in the Masterclass', 'Request the current syllabus and cohort schedule', '/courses/, /career-guides/, /contact/', 'Show module outcomes, topic depth, projects, practice and what is informational versus hands-on.', 'Do not turn every syllabus topic into a separate course product.', 1, ['finance course syllabus', 'finance courses'])
    add_page(items, 'Finance Course Fees, Eligibility and Terms', '/courses/finance-course-fees-eligibility/', 'Commercial / decision', 'finance course fees', 'decision', 'direct offer', 'Decision-support landing', 'Current Masterclass cohort terms', 'Ask for current fees, eligibility, schedule and guarantee terms', '/courses/, /faqs/, /terms-and-conditions/, /contact/', 'Answer fees, eligibility, duration, mode, refund and guarantee questions using approved current data.', 'Never hard-code stale price, salary or job figures in metadata.', 1, ['finance course fees', 'finance course eligibility', 'cfa course fees'])
    add_page(items, 'Six-Week Finance Course', '/courses/six-week-finance-course/', 'Commercial / duration', 'six week finance course', 'commercial', 'direct offer', 'Duration landing', 'Six-week Financial Operations Masterclass', 'Ask about the next six-week cohort', '/courses/, /contact/', 'Explain the weekly progression, practice, projects, interview preparation and current access mode.', 'Do not create a thin duplicate of the main courses page; canonicalize if intent is not distinct.', 2, ['six week finance course', 'finance courses'])
    add_page(items, 'Finance Career Support and Job-Guarantee Terms', '/placements/finance-career-support-terms/', 'Commercial / trust', 'finance job guarantee terms', 'decision', 'direct offer', 'Trust / terms landing', 'Published career-support and job-guarantee terms', 'Review eligibility and ask the team about current terms', '/placements/, /faqs/, /terms-and-conditions/, /contact/', 'Define eligibility, completion, support, opportunities, exclusions and evidence for every claim.', 'Do not use the guarantee as a blanket promise outside the published terms.', 1, ['finance job guarantee', 'finance jobs'], 'Expand existing placements route')
    add_page(items, 'Finance Interview Preparation Program', '/courses/finance-interview-preparation/', 'Commercial / interview', 'finance interview course', 'decision', 'direct offer', 'Support landing', 'Interview preparation support connected to the Masterclass', 'Ask what practice and interview support the current cohort includes', '/courses/, /resources/finance-interview-questions/, /contact/', 'Interview workflow, role-specific practice, resume discussion and how the program handles current opportunity access.', 'Do not sell interview preparation as an independent class unless approved.', 2, ['finance interview questions', 'finance course'])
    add_page(items, 'Corporate Readiness for Finance Roles', '/courses/corporate-readiness-finance/', 'Commercial / job readiness', 'finance job readiness course', 'commercial', 'direct offer', 'Support landing', 'Corporate-readiness activities within the Masterclass', 'Ask about current projects, assessments and interview activities', '/courses/, /career-guides/finance-operations/, /contact/', 'Communication, workflow explanation, spreadsheet discipline, documentation, interview and workplace readiness.', 'Avoid vague employability claims; list only delivered activities.', 2, ['finance job readiness', 'finance courses'])

    regional = [
        ('Finance Course in Lucknow', '/india-lucknow/', 'finance course in lucknow', 'Lucknow', 'Live online plus published in-person access; local schedule, address and cohort proof.', 'Use exact current Lucknow access details; never invent a campus or batch.', 'Expand existing Lucknow location page'),
        ('Finance Course in Delhi NCR', '/india-delhi-ncr/', 'finance course in delhi', 'Delhi NCR', 'Online access for Delhi NCR learners plus local finance-role context and commute/access FAQs.', 'Do not imply in-person Delhi classes unless officially available.', 'Expand existing regional page'),
        ('Finance Course in Bengaluru', '/india-bengaluru/', 'finance course in bangalore', 'Bengaluru', 'Online access plus Bengaluru BFSI/FinTech role research with dated employer sources.', 'Unique local evidence is required; no copied city template or placement promise.', 'Expand existing regional page'),
        ('Finance Course in Mumbai', '/india-mumbai/', 'finance course in mumbai', 'Mumbai', 'Online access plus capital-markets, banking-operations and employer research relevant to Mumbai.', 'Do not claim office access or employer tie-ups without proof.', 'Expand existing regional page'),
        ('Finance Course in Pune', '/india-pune/', 'finance course in pune', 'Pune', 'Online access plus finance-operations, technology and graduate audience information.', 'Unique local content must justify indexation.', 'Expand existing regional page'),
        ('Finance Course in Hyderabad', '/india-hyderabad/', 'finance course in hyderabad', 'Hyderabad', 'Online access plus BFSI, payments and operations-role research.', 'No fake classroom or local hiring claim.', 'Expand existing regional page'),
        ('Finance Course in Chennai', '/india-chennai/', 'finance course in chennai', 'Chennai', 'Online access plus banking operations, payments and shared-services context.', 'Publish only with unique local sources, FAQs and access information.', 'New planned page'),
        ('Finance Course in Kolkata', '/india-kolkata/', 'finance course in kolkata', 'Kolkata', 'Online access plus banking, NBFC and finance-operations context.', 'No near-me doorway language; page must have local usefulness.', 'New planned page'),
        ('Finance Course in Ahmedabad', '/india-ahmedabad/', 'finance course in ahmedabad', 'Ahmedabad', 'Online access plus banking, lending and FinTech role research.', 'No local placement guarantee unless documented.', 'New planned page'),
        ('Finance Course in Jaipur', '/india-jaipur/', 'finance course in jaipur', 'Jaipur', 'Online access plus graduate and finance-operations context.', 'Use a real local decision reason before indexation.', 'New planned page'),
        ('Finance Course in Gurugram', '/india-gurugram/', 'finance course in gurgaon', 'Gurugram', 'Online access plus BFSI operations and shared-services research.', 'Keep separate from Delhi NCR only if SERP and business evidence justify it.', 'New planned page'),
    ]
    for title, slug, primary, region, angle, guardrail, status in regional:
        add_page(items, title, slug, 'Regional / online access', primary, 'commercial', 'adjacent qualified', 'Regional access landing', 'Financial Operations Masterclass; online across India; in-person only where published', 'Ask for current cohort, mode, schedule and terms', '/courses/, /india/, /contact/', angle, guardrail, 2, [primary, 'finance courses'], status=status)

    career_pages = [
        ('Finance Career After Graduation', '/career-guides/finance-career-after-graduation/', 'finance career', 'career', 'career bridge', 'Career guide', 'Masterclass and career-guides hub', 'Career options, role families, skill gaps, learning path, interview preparation and terms.', 'Do not guarantee a role or salary.', ['finance career', 'career in finance']),
        ('Finance Careers After BCom', '/career-guides/finance-careers-after-bcom/', 'finance careers after bcom', 'career', 'career bridge', 'Career guide', 'Masterclass and accounting basics', 'Role map for BCom graduates: accounting, operations, banking, compliance, payments and credit.', 'Do not imply a degree or certification is unnecessary for every role.', ['finance careers after bcom', 'finance course after bcom']),
        ('Investment Banking Operations Career', '/career-guides/investment-banking-operations/', 'investment banking career', 'career', 'module topic', 'Career pillar', 'Investment Banking Operations module', 'Front/middle/back office distinction, settlements, reconciliation, corporate actions, fund accounting, skills and interviews.', 'Do not promise an investment-banker title or front-office role.', ['investment banking career', 'investment banking operations']),
        ('Banking Operations Career Path', '/career-guides/banking-operations-career/', 'banking operations career', 'career', 'career bridge', 'Career guide', 'Retail Banking and Finance Operations modules', 'Bank operations roles, workflow controls, service processes, loan/credit support and entry skills.', 'Do not target bank-exam coaching or claim bank recruitment.', ['banking operations', 'banking course']),
        ('Finance Operations Career Path', '/career-guides/finance-operations/', 'finance operations career', 'career', 'module topic', 'Career pillar', 'Finance Operations module', 'Process, reporting, accounting, lending, credit, risk, controls and interview preparation.', 'Keep BFSI context explicit and distinguish learning from employment.', ['finance operations', 'operations management']),
        ('Finance Process Associate: Duties and Skills', '/career-guides/finance-process-associate/', 'process associate', 'career', 'career bridge', 'Role guide', 'Finance Operations module and interview resource', 'Daily workflow, queues, quality checks, reconciliations, escalation, documentation and entry skills.', 'Do not target generic BPO process-associate traffic.', ['process associate', 'finance process associate']),
        ('Finance Operations Analyst Career', '/career-guides/finance-operations-analyst/', 'finance operations analyst', 'career', 'career bridge', 'Role guide', 'Finance Operations module', 'Responsibilities, reports, controls, exceptions, tools, competencies and interview prompts.', 'Do not claim a dedicated analyst certification.', ['financial analyst', 'finance operations analyst']),
        ('Operations Analyst in Banking', '/career-guides/operations-analyst-banking/', 'operations analyst banking', 'career', 'career bridge', 'Role guide', 'Investment Banking Ops and Finance Operations modules', 'Role scope, process ownership, quality metrics, risk controls and progression.', 'Use banking modifiers; do not compete for generic analyst intent alone.', ['operations analyst', 'banking operations']),
        ('Investment Banking Operations Roles', '/career-guides/investment-banking-operations-roles/', 'investment banking roles', 'career', 'module topic', 'Role hub', 'Investment Banking Operations module', 'Analyst, associate, trade support, settlements, corporate actions and fund accounting role families.', 'Separate operations from front-office advisory and trading.', ['investment banking roles', 'investment banking']),
        ('Trade Support Analyst Career', '/career-guides/trade-support-analyst/', 'trade support analyst', 'career', 'career bridge', 'Role guide', 'Investment Banking Operations module', 'Trade capture, confirmation, exceptions, stakeholder hand-offs and interview skills.', 'Use fictional workflow examples; no live employer access claim.', ['trade support analyst', 'investment banking']),
        ('Settlement Analyst Career', '/career-guides/settlement-analyst/', 'settlement analyst', 'career', 'career bridge', 'Role guide', 'Investment Banking Operations module', 'Settlement lifecycle, fails, matching, cut-offs, escalation and controls.', 'Do not imply the site processes live trades.', ['settlement process', 'trade lifecycle']),
        ('Reconciliation Analyst Career', '/career-guides/reconciliation-analyst/', 'reconciliation analyst', 'career', 'career bridge', 'Role guide', 'Investment Banking Ops, Payments and Finance Operations modules', 'Source-to-ledger matching, breaks, evidence, root cause, escalation and skills.', 'Use synthetic records and protect confidential data.', ['reconciliation analyst', 'reconciliation']),
        ('Fund Accounting Career Path', '/career-guides/fund-accounting-career/', 'fund accounting career', 'career', 'module topic', 'Role guide', 'Investment Banking Operations module', 'Fund accounting workflow, NAV checks, reconciliations, controls and interview preparation.', 'Do not promise fund-accounting placement or live NAV production.', ['fund accounting', 'nav calculation']),
        ('Corporate Actions Analyst Career', '/career-guides/corporate-actions-analyst/', 'corporate actions analyst', 'career', 'module topic', 'Role guide', 'Investment Banking Operations module', 'Event notices, entitlement checks, elections, reconciliation, exceptions and role skills.', 'Use fictional events and current sources.', ['corporate actions', 'corporate action analyst']),
        ('Middle Office Operations Career', '/career-guides/middle-office-operations/', 'middle office operations', 'career', 'career bridge', 'Role guide', 'Investment Banking Operations module', 'Risk checks, trade support, confirmations, controls and front/back-office hand-offs.', 'Do not imply middle-office training equals an investment-banking credential.', ['middle office', 'investment banking operations']),
        ('Back Office Banking Jobs and Skills', '/career-guides/back-office-banking-jobs/', 'back office banking', 'career', 'career bridge', 'Role guide', 'Investment Banking Ops and Finance Operations modules', 'Back-office workflows, documentation, reconciliations, settlements and role-entry skills.', 'Avoid low-quality generic job-board pages.', ['back office banking', 'banking operations']),
        ('Securities Operations Career', '/career-guides/securities-operations/', 'securities operations', 'career', 'module topic', 'Role guide', 'Investment Banking Operations module', 'Trade processing, settlement, custody, reconciliation and controls.', 'Educational overview only; no investment advice.', ['securities operations', 'investment banking']),
        ('Custody Operations Career', '/career-guides/custody-operations/', 'custody operations', 'career', 'module topic', 'Role guide', 'Investment Banking Operations module', 'Safekeeping, settlement, asset servicing, corporate actions and exception management.', 'Use current, sourced definitions; no service offering claim.', ['custody operations', 'corporate actions']),
        ('Retail Banking Operations Career', '/career-guides/retail-banking-operations/', 'retail banking career', 'career', 'module topic', 'Career pillar', 'Retail Banking module', 'Branch operations, relationship manager, loan officer, NRI banking and controls.', 'Do not claim bank employment or a separate class.', ['retail banking', 'banking operations']),
        ('Loan Operations Career', '/career-guides/loan-operations/', 'loan operations', 'career', 'module topic', 'Role guide', 'Finance Operations module', 'Application intake, documentation, credit checks, disbursal, servicing and exceptions.', 'Do not give lending advice or imply loan approval authority.', ['loan operations', 'loan processing']),
        ('Credit Analyst Career', '/career-guides/credit-analyst/', 'credit analyst', 'career', 'career bridge', 'Role guide', 'Finance Operations module', 'Financial information, credit review, documentation, risk signals and analyst skills.', 'Do not call this a dedicated financial-analyst course.', ['credit analyst', 'financial analyst']),
        ('Credit Operations Analyst Career', '/career-guides/credit-operations-analyst/', 'credit operations analyst', 'career', 'career bridge', 'Role guide', 'Finance Operations module', 'Credit workflow, data quality, policy checks, exceptions and reporting.', 'No credit approval or regulated advisory claims.', ['credit operations', 'credit analyst']),
        ('Risk Operations Analyst Career', '/career-guides/risk-operations-analyst/', 'risk operations analyst', 'career', 'module topic', 'Role guide', 'Finance Operations module', 'Operational risk, controls, issue tracking, reporting and first-line risk work.', 'Do not present FRM preparation or risk certification.', ['risk management', 'risk analyst']),
        ('KYC Analyst Career', '/career-guides/kyc-analyst/', 'kyc analyst', 'career', 'module topic', 'Role guide', 'KYC / AML Compliance module', 'Customer due diligence, remediation, documentation, screening and quality checks.', 'Use current regulatory sources; no legal advice.', ['kyc analyst', 'kyc']),
        ('AML Analyst Career', '/career-guides/aml-analyst/', 'aml analyst', 'career', 'module topic', 'Role guide', 'KYC / AML Compliance module', 'Alert review, investigation, escalation, reporting and communication skills.', 'Do not claim regulatory accreditation or legal qualification.', ['aml analyst', 'aml']),
        ('Transaction Monitoring Analyst Career', '/career-guides/transaction-monitoring-analyst/', 'transaction monitoring', 'career', 'module topic', 'Role guide', 'KYC / AML Compliance module', 'Alert lifecycle, typologies, case notes, escalation and quality controls.', 'Regulatory content must be dated and sourced.', ['transaction monitoring', 'aml']),
        ('Financial Crime Analyst Career', '/career-guides/financial-crime-analyst/', 'financial crime analyst', 'career', 'module topic', 'Role guide', 'KYC / AML Compliance module', 'Financial-crime concepts, investigations, sanctions, case management and skills.', 'Educational scope only; no legal or investigative authority claims.', ['financial crime analyst', 'financial crime']),
        ('Compliance Analyst Career', '/career-guides/compliance-analyst/', 'compliance analyst', 'career', 'module topic', 'Role guide', 'KYC / AML Compliance module', 'Policy checks, regulatory reporting, documentation, controls and escalation.', 'Do not market it as a compliance license.', ['compliance analyst', 'compliance']),
        ('Payments Operations Analyst Career', '/career-guides/payments-operations-analyst/', 'payments operations analyst', 'career', 'module topic', 'Role guide', 'Digital Payments module', 'Payment lifecycle, exceptions, settlement, disputes, reconciliation and controls.', 'Do not imply a payment network partnership.', ['payments operations', 'digital payments']),
        ('FinTech Operations Career', '/career-guides/fintech-operations/', 'fintech operations career', 'career', 'module topic', 'Career guide', 'FinTech and Neo-Banking module', 'Product operations, digital lending, onboarding, compliance and customer success.', 'Do not claim software-engineering training unless separately offered.', ['fintech operations', 'fintech careers']),
        ('Digital Banking Operations Career', '/career-guides/digital-banking-operations/', 'digital banking operations', 'career', 'module topic', 'Role guide', 'FinTech and Neo-Banking module', 'Digital account servicing, payments, onboarding, controls and customer journeys.', 'Use current product/regulatory sources.', ['digital banking', 'banking operations']),
        ('Entry-Level Finance Jobs and Skills', '/career-guides/entry-level-finance-jobs/', 'entry level finance jobs', 'career', 'career bridge', 'Career guide', 'Masterclass and career hub', 'Role families, transferable skills, portfolio evidence, interview preparation and realistic job-search steps.', 'Do not publish unverified vacancies or guaranteed salary data.', ['finance jobs', 'finance careers']),
        ('Financial Analyst vs Finance Operations', '/career-guides/financial-analyst-vs-finance-operations/', 'financial analyst', 'decision', 'adjacent qualified', 'Comparison guide', 'Finance Operations module; informational comparison', 'Compare duties, tools, outputs, entry routes and where the published curriculum fits.', 'Do not claim a Financial Analyst course if it is not offered.', ['financial analyst', 'finance operations']),
        ('Business Analyst in Banking', '/career-guides/business-analyst-in-banking/', 'business analyst banking', 'career', 'adjacent qualified', 'Career guide', 'Informational banking context plus Masterclass bridge', 'Explain business-analysis work in banking, stakeholder needs, process mapping and how it differs from operations.', 'Do not target generic business-analyst certification or promise a BA role.', ['business analyst', 'business analyst course']),
        ('Finance Executive Roles in Banking', '/career-guides/finance-executive-roles-banking/', 'finance executive', 'career', 'career bridge', 'Role guide', 'Finance Operations and Retail Banking modules', 'Explain finance-executive responsibilities, documentation, reporting, controls and transferable skills.', 'Do not publish generic job-board listings or promise a title.', ['finance executive', 'finance jobs']),
        ('Business Analyst Finance Career Path', '/career-guides/business-analyst-finance-career/', 'business analyst finance', 'career', 'adjacent qualified', 'Career guide', 'Informational comparison plus Masterclass bridge', 'Cover process mapping, requirements, controls, stakeholder work and differences from finance operations.', 'Keep the finance qualifier and do not sell business-analyst certification.', ['business analyst', 'financial analyst']),
    ]
    for title, slug, primary, intent, fit, page_type, offer, angle, guardrail, terms in career_pages:
        status = 'Expand existing guide' if slug in {'/career-guides/investment-banking-operations/', '/career-guides/finance-operations/', '/career-guides/retail-banking-operations/', '/career-guides/fintech-operations/'} else 'New planned page'
        add_page(items, title, slug, 'Career / role intent', primary, intent, fit, page_type, offer, 'Explore the relevant module and ask for current cohort and career-support terms', '/courses/, /career-guides/, /resources/finance-interview-questions/', angle, guardrail, 2, terms, status)

    topic_pages = [
        ('Accounting Basics for Finance Jobs', '/resources/accounting-basics-for-finance-jobs/', 'accounting basics', 'informational', 'informational', 'Resource hub', 'Accounting foundation plus Finance Operations bridge', 'Definitions, entries, ledgers, controls and role relevance.', 'Do not create thin duplicate definitions.', ['accounting basics', 'finance basics']),
        ('Reconciliation in Finance', '/resources/reconciliation-in-finance/', 'reconciliation', 'informational', 'module topic', 'Resource authority', 'Investment Banking Ops, Payments and Finance Operations modules', 'Meaning, matching, breaks, evidence, escalation, examples and interview prompts.', 'One canonical reconciliation owner; do not duplicate it in multiple URLs.', ['reconciliation meaning', 'reconciliation']),
        ('Bank Reconciliation Process', '/resources/bank-reconciliation-process/', 'bank reconciliation', 'informational', 'informational', 'Resource guide', 'Accounting basics and Digital Payments modules', 'Bank statement matching, timing differences, exceptions and controls.', 'Distinguish bank reconciliation from broader investment-operations reconciliation.', ['bank reconciliation', 'reconciliation']),
        ('Financial Accounting for Banking Operations', '/resources/financial-accounting-banking/', 'financial accounting', 'informational', 'informational', 'Resource guide', 'Finance Operations module', 'Accounting cycle, reporting hand-offs, controls and banking context.', 'Educational examples only; no qualification claim.', ['financial accounting', 'accounting']),
        ('Financial Statements for Finance Operations', '/resources/financial-statements-finance-operations/', 'financial statements', 'informational', 'informational', 'Resource guide', 'Finance Operations module', 'Balance sheet, income statement, cash flow and operational use cases.', 'Use fictional examples and dated sources.', ['financial statements', 'balance sheet']),
        ('Financial Statement Analysis', '/resources/financial-statement-analysis/', 'financial statement analysis', 'informational', 'informational', 'Resource guide', 'Finance Operations and Credit Analysis topics', 'Ratios, limitations, comparisons, credit context and worked example.', 'Do not offer investment advice or call this a dedicated analyst course.', ['financial statement analysis', 'financial analyst']),
        ('Cost Accounting for Finance Operations', '/resources/cost-accounting-finance-operations/', 'cost accounting', 'informational', 'informational', 'Resource guide', 'Accounting foundation and Finance Operations bridge', 'Cost behavior, allocation, methods and finance-workflow relevance.', 'No separate cost-accounting course claim.', ['cost accounting', 'accounting']),
        ('What Is Investment Banking?', '/career-guides/what-is-investment-banking/', 'investment banking definition', 'informational', 'informational', 'Definition pillar', 'Investment Banking Operations module', 'Definition, business lines, roles, operations pathway and career scope.', 'Distinguish investment banking from investment advice and front-office claims.', ['investment banking', 'what is investment banking']),
        ('Investment Banking Operations Workflow', '/career-guides/investment-banking-operations-workflow/', 'investment banking operations', 'informational', 'module topic', 'Workflow guide', 'Investment Banking Operations module', 'Trade support, settlements, reconciliation, corporate actions and fund accounting.', 'Use fictional data; do not imply live processing.', ['investment banking operations', 'investment banking']),
        ('Trade Lifecycle in Investment Banking', '/career-guides/trade-lifecycle/', 'trade lifecycle', 'informational', 'module topic', 'Workflow guide', 'Investment Banking Operations module', 'Capture, confirmation, matching, settlement, fails, reconciliation and controls.', 'No front-office trading instruction or investment advice.', ['trade life cycle', 'trade lifecycle']),
        ('Corporate Actions Workflow', '/resources/corporate-actions-workflow/', 'corporate actions', 'informational', 'module topic', 'Workflow guide', 'Investment Banking Operations module', 'Event types, notices, entitlements, elections, reconciliation and exceptions.', 'Use fictional events and current source references.', ['corporate actions', 'corporate action']),
        ('Fund Accounting and NAV Guide', '/resources/fund-accounting-nav/', 'fund accounting', 'informational', 'module topic', 'Workflow guide', 'Investment Banking Operations module', 'NAV inputs, pricing, checks, exceptions and role skills.', 'Do not imply live NAV production or fund-management advice.', ['fund accounting', 'nav calculation']),
        ('Retail Banking Meaning and Services', '/resources/retail-banking-meaning/', 'retail banking', 'informational', 'module topic', 'Definition pillar', 'Retail Banking module', 'Meaning, products, branch operations, lending, NRI banking and roles.', 'Do not create a separate class claim.', ['retail banking', 'what is retail banking']),
        ('Commercial Bank Services and Operations', '/resources/commercial-bank-services/', 'commercial banks', 'informational', 'module topic', 'Definition pillar', 'Retail Banking and Finance Operations modules', 'Commercial banking products, customer journeys, credit and operations hand-offs.', 'Use current sourced facts, not employer promises.', ['commercial banks', 'banking services']),
        ('Loan Processing Operations', '/resources/loan-processing-operations/', 'loan processing', 'informational', 'module topic', 'Workflow guide', 'Finance Operations and Retail Banking modules', 'Application, KYC, underwriting hand-offs, documentation, approval, disbursal and servicing.', 'Not lending advice; do not claim approval authority.', ['loan processing', 'loan operations']),
        ('Credit Analysis Basics', '/resources/credit-analysis-basics/', 'credit analysis', 'informational', 'module topic', 'Learning guide', 'Finance Operations module', 'Purpose, information, ratios, risk signals, limitations and operational workflow.', 'Educational content only; no lending decisions.', ['credit analysis', 'credit analyst']),
        ('Risk Management in Banking', '/resources/risk-management-banking/', 'risk management', 'informational', 'module topic', 'Definition pillar', 'Finance Operations module', 'Credit, operational and process risk, controls, reporting and role skills.', 'Regulatory terminology must be dated and sourced; no FRM claim.', ['risk management', 'financial risk management']),
        ('KYC and AML Compliance Guide', '/resources/kyc-aml-compliance-guide/', 'kyc aml', 'informational', 'module topic', 'Learning guide', 'KYC / AML Compliance module', 'CDD, EDD, screening, transaction monitoring, SAR concepts and controls.', 'No legal advice or compliance certification claim.', ['kyc', 'aml', 'compliance']),
        ('Digital Payments Operations Guide', '/resources/digital-payments-operations/', 'digital payments', 'informational', 'module topic', 'Workflow guide', 'Digital Payments module', 'Payment rails, lifecycle, disputes, settlement and reconciliation.', 'Use current India-specific payment facts with sources.', ['digital payments', 'payment operations']),
        ('FinTech and Neo-Banking Explained', '/resources/fintech-neo-banking/', 'fintech neobanking', 'informational', 'module topic', 'Definition pillar', 'FinTech and Neo-Banking module', 'Digital lending, product operations, onboarding, compliance and customer journeys.', 'No software-development or investment recommendation claims.', ['fintech', 'neo banking']),
        ('Financial Markets and Instruments', '/resources/financial-markets-instruments/', 'financial markets', 'informational', 'informational', 'Definition pillar', 'Investment Banking Operations module', 'Markets, participants, instruments, operations and risk basics.', 'Educational only; no trading calls or advice.', ['financial markets', 'financial instruments']),
        ('Financial Products and Services Explained', '/resources/financial-products-services/', 'financial products', 'informational', 'informational', 'Glossary hub', 'Retail Banking, Payments and FinTech modules', 'Banking, lending, payments, investment and FinTech product map.', 'No product recommendation or financial advice.', ['financial products', 'financial services']),
        ('Financial System in India', '/resources/financial-system-india/', 'financial system', 'informational', 'informational', 'Industry guide', 'All six module areas', 'Institutions, banks, NBFCs, markets, payments, regulators and operations roles.', 'Verify current institutional and regulatory facts before publication.', ['financial system', 'financial services']),
        ('Capital Market Operations', '/resources/capital-market-operations/', 'capital market', 'informational', 'module topic', 'Industry guide', 'Investment Banking Operations module', 'Issuance, trading, clearing, settlement, custody and operations roles.', 'No investment advice or market prediction.', ['capital market', 'financial markets']),
        ('Financial Market Intermediaries', '/resources/financial-market-intermediaries/', 'financial intermediaries', 'informational', 'informational', 'Industry guide', 'Investment Banking Operations module', 'Banks, brokers, custodians, exchanges, clearing and workflow hand-offs.', 'Use current authoritative sources and explain operational scope.', ['financial market intermediaries', 'financial markets']),
    ]
    for title, slug, primary, intent, fit, page_type, offer, angle, guardrail, terms in topic_pages:
        status = 'Expand existing resource' if slug in {'/resources/reconciliation-in-finance/', '/career-guides/trade-lifecycle/'} else 'New planned page'
        add_page(items, title, slug, 'Information / topic authority', primary, intent, fit, page_type, offer, 'Read the matching module guide and ask for current cohort or terms', '/courses/, /resources/, /career-guides/', angle, guardrail, 2 if fit == 'module topic' else 3, terms, status)

    decision_pages = [
        ('Finance Course Comparison', '/compare/finance-courses/', 'best finance courses', 'decision', 'adjacent qualified', 'Comparison page', 'Financial Operations Masterclass', 'Compare curriculum, practical work, access, eligibility, support and terms using a transparent rubric.', 'Do not publish unverifiable competitor claims or use “best” as an unsupported guarantee.', ['best finance courses', 'finance courses']),
        ('Finance Operations vs Financial Modelling vs CFA', '/compare/finance-operations-vs-financial-modelling-cfa/', 'financial modelling course', 'decision', 'adjacent qualified', 'Comparison page', 'Masterclass plus honest scope comparison', 'Compare goals, syllabus, credential status, time, role fit and what Centaur does or does not provide.', 'Never imply CFA affiliation, exam preparation or financial-modelling delivery unless approved.', ['financial modelling course', 'cfa', 'investment banking operations']),
        ('Investment Banking Operations vs Financial Analyst', '/compare/investment-banking-operations-vs-financial-analyst/', 'financial analyst course', 'decision', 'adjacent qualified', 'Comparison page', 'Investment Banking Operations module', 'Compare workflows, outputs, skills and entry paths without collapsing distinct careers.', 'Do not call the program a Financial Analyst course.', ['financial analyst', 'investment banking']),
        ('Banking vs Finance Careers', '/compare/banking-vs-finance-careers/', 'banking and finance careers', 'decision', 'career bridge', 'Comparison page', 'Masterclass and career guides', 'Clarify banking, finance operations, investment operations, compliance, payments and FinTech pathways.', 'No guarantee that a comparison leads to a specific job.', ['banking and finance', 'career in finance']),
        ('Online vs Offline Finance Training in India', '/compare/online-vs-offline-finance-training/', 'online finance course', 'decision', 'direct offer', 'Comparison page', 'Online across India; in-person only where published', 'Compare access, interaction, practice, travel, schedules and support for the actual modes.', 'Do not imply offline access outside the published location.', ['online finance course', 'finance courses']),
        ('How to Choose a Finance Career Course', '/career-guides/choosing-finance-career-course/', 'choose finance course', 'decision', 'career bridge', 'Decision guide', 'Masterclass and career hub', 'Decision checklist: role goal, curriculum, evidence, terms, support, practice and access.', 'Do not manipulate learners with unsupported ranking claims.', ['finance related courses', 'best finance courses']),
        ('Finance Learning Roadmap for Graduates', '/career-guides/finance-learning-roadmap/', 'finance learning roadmap', 'career', 'career bridge', 'Roadmap page', 'Masterclass and resources', 'Sequence accounting, banking, operations, compliance, payments, projects and interviews.', 'Make clear which topics are taught, referenced or self-study.', ['finance basics', 'career in finance']),
        ('Finance Program FAQs and Current Terms', '/faqs/finance-program/', 'finance course faq', 'decision', 'direct offer', 'FAQ / trust page', 'Financial Operations Masterclass', 'Answer duration, eligibility, mode, fees process, support, certificate wording and guarantee terms.', 'FAQ content must match visible approved answers; no rich-result shortcut claims.', ['finance course', 'finance courses']),
    ]
    for title, slug, primary, intent, fit, page_type, offer, angle, guardrail, terms in decision_pages:
        status = 'Expand existing FAQ route' if slug == '/faqs/finance-program/' else 'New planned page'
        add_page(items, title, slug, 'Decision / comparison', primary, intent, fit, page_type, offer, 'Ask for the current cohort, syllabus, access and terms', '/courses/, /career-guides/, /faqs/, /contact/', angle, guardrail, 2 if fit in {'direct offer', 'career bridge'} else 3, terms, status)

    assert len(items) == 100, len(items)
    return items


def add_blog(items, title, slug, cluster, primary, intent, module, cta, links, guardrail, wave, evidence_terms=None, angle=''):
    fit = 'career bridge' if intent == 'career' else 'adjacent qualified' if intent == 'decision' else 'module topic' if any(term in module.lower() for term in ('operations', 'banking', 'compliance', 'payments', 'fintech', 'accounting')) else 'informational'
    items.append({'title': title, 'slug': slug, 'cluster': cluster, 'primary': primary, 'secondary': ', '.join(evidence_terms or [primary]), 'intent': intent, 'fit': fit, 'module': module, 'cta': cta, 'links': links, 'guardrail': guardrail, 'wave': wave, 'evidence_terms': evidence_terms or [primary], 'angle': angle or 'Answer the query directly, then add a worked example, common mistakes, role relevance, FAQs and dated sources.'})


def make_blogs():
    items = []
    accounting = ('Accounting / fundamentals', 'Finance Operations and Accounting Basics', 'Read the accounting basics resource and explore Finance Operations', '/resources/accounting-basics/, /resources/reconciliation-in-finance/, /career-guides/finance-operations/')
    accounting_rows = [
        ('What Is Accounting?', 'what-is-accounting', 'what is accounting', 'informational', ['what is accounting', 'accounting meaning']),
        ('Golden Rules of Accounting', 'golden-rules-of-accounting', 'golden rules of accounting', 'informational', ['golden rules of accounting', 'accounting principles']),
        ('Accounting Principles Explained', 'accounting-principles-explained', 'accounting principles', 'informational', ['accounting principles', 'accounting']),
        ('Accounting Equation: Examples and Applications', 'accounting-equation-examples', 'accounting equation', 'informational', ['accounting equation']),
        ('Debit and Credit Rules for Beginners', 'debit-credit-rules-beginners', 'debit credit', 'informational', ['debit credit']),
        ('Journal Entries in Finance Operations', 'journal-entries-finance-operations', 'journal entries', 'informational', ['journal entry']),
        ('Ledger Accounts: Format, Posting and Example', 'ledger-accounts-format-posting-example', 'ledger account', 'informational', ['ledger account']),
        ('Trial Balance: Format, Purpose and Example', 'trial-balance-format-purpose-example', 'trial balance', 'informational', ['trial balance', 'accounting']),
        ('Trial Balance Errors and Reconciliation', 'trial-balance-errors-reconciliation', 'trial balance errors', 'informational', ['trial balance', 'reconciliation']),
        ('Reconciliation Meaning in Finance', 'reconciliation-meaning-in-finance', 'reconciliation meaning', 'informational', ['reconciliation meaning', 'reconciliation']),
        ('Reconciliation Process and Steps', 'reconciliation-process-steps-finance', 'reconciliation process', 'informational', ['reconciliation process', 'reconciliation']),
        ('Bank Reconciliation: Process and Example', 'bank-reconciliation-process-example', 'bank reconciliation', 'informational', ['bank reconciliation', 'reconciliation']),
        ('Accounts Receivable vs Accounts Payable', 'accounts-receivable-vs-payable', 'accounts receivable payable', 'informational', ['accounts receivable', 'accounts payable', 'accounting']),
        ('Accounting Cycle: Steps and Controls', 'accounting-cycle-steps-controls', 'accounting cycle', 'informational', ['accounting cycle']),
        ('Financial Accounting: Process and Statements', 'financial-accounting-process-statements', 'financial accounting', 'informational', ['financial accounting', 'financial statements']),
        ('Balance Sheet: Meaning, Format and Example', 'balance-sheet-meaning-format-example', 'balance sheet', 'informational', ['balance sheet', 'financial statements']),
        ('Income Statement: Meaning, Format and Example', 'income-statement-meaning-format-example', 'income statement', 'informational', ['income statement', 'financial statements']),
        ('Cash Flow Statement: Meaning and Example', 'cash-flow-statement-meaning-example', 'cash flow statement', 'informational', ['cash flow statement', 'financial statements']),
        ('Financial Statement Analysis: Ratios and Limits', 'financial-statement-analysis-ratios-limits', 'financial statement analysis', 'informational', ['financial statement analysis', 'financial analyst']),
        ('Cost Accounting Methods and Worked Example', 'cost-accounting-methods-worked-example', 'cost accounting', 'informational', ['cost accounting', 'cost accounting methods']),
        ('Management Accounting vs Financial Accounting', 'management-accounting-vs-financial-accounting', 'management accounting', 'decision', ['management accounting', 'financial accounting']),
        ('Accrual vs Cash Accounting', 'accrual-vs-cash-accounting', 'accrual accounting', 'informational', ['accrual accounting']),
        ('Month-End Close Process in Finance', 'month-end-close-process-finance', 'month end close', 'informational', ['month end close']),
        ('General Ledger: Purpose and Controls', 'general-ledger-purpose-controls', 'general ledger', 'informational', ['general ledger']),
        ('Accounting Controls in Banking Operations', 'accounting-controls-banking-operations', 'accounting controls', 'informational', ['accounting controls']),
    ]
    for title, slug, primary, intent, terms in accounting_rows:
        wave = 1 if primary in {'reconciliation meaning', 'reconciliation process', 'financial accounting', 'balance sheet', 'cost accounting'} else 2
        add_blog(items, title, f'/blog/{slug}/', accounting[0], primary, intent, accounting[1], accounting[2], accounting[3], 'Use original examples, keep one canonical intent owner and avoid qualification claims.', wave, terms, 'Definition, accounting treatment, worked example, controls, role relevance and interview/application notes.')

    ib = ('Investment Banking Operations / workflow', 'Investment Banking Operations', 'Explore the Investment Banking Operations module and interview resource', '/career-guides/investment-banking-operations/, /career-guides/trade-lifecycle/, /resources/reconciliation-in-finance/, /resources/investment-banking-interview-questions/')
    ib_rows = [
        ('What Is Investment Banking?', 'what-is-investment-banking', 'what is investment banking', 'informational', ['investment banking', 'investment banking definition']),
        ('Investment Banking Roles and Teams', 'investment-banking-roles-teams', 'investment banking roles', 'career', ['investment banking roles', 'investment banking']),
        ('Front Office vs Middle Office vs Back Office', 'front-middle-back-office-investment-banking', 'front middle back office', 'informational', ['front office', 'middle office', 'back office']),
        ('What Is Investment Banking Operations?', 'what-is-investment-banking-operations', 'investment banking operations', 'informational', ['investment banking operations', 'investment banking']),
        ('Trade Life Cycle in Investment Banking', 'trade-life-cycle-investment-banking', 'trade life cycle', 'informational', ['trade life cycle', 'trade lifecycle']),
        ('Trade Capture: Process, Data and Controls', 'trade-capture-process-controls', 'trade capture', 'informational', ['trade capture', 'trade lifecycle']),
        ('Trade Confirmation and Matching', 'trade-confirmation-matching-process', 'trade confirmation', 'informational', ['trade confirmation', 'trade lifecycle']),
        ('Settlement Process in Investment Operations', 'settlement-process-investment-operations', 'settlement process', 'informational', ['settlement process', 'settlement']),
        ('Failed Settlement: Reasons and Resolution', 'failed-settlement-reasons-resolution', 'failed settlement', 'informational', ['failed settlement', 'settlement']),
        ('Trade Reconciliation and Break Management', 'trade-reconciliation-break-management', 'trade reconciliation', 'informational', ['trade reconciliation', 'reconciliation']),
        ('Securities Operations: Workflow and Roles', 'securities-operations-workflow-roles', 'securities operations', 'career', ['securities operations', 'investment banking']),
        ('Custody Operations Explained', 'custody-operations-explained', 'custody operations', 'informational', ['custody operations', 'securities operations']),
        ('Clearing and Settlement Explained', 'clearing-and-settlement-explained', 'clearing settlement', 'informational', ['clearing and settlement', 'settlement']),
        ('Corporate Actions: Types and Process', 'corporate-actions-types-process', 'corporate actions', 'informational', ['corporate actions', 'corporate action']),
        ('Fund Accounting: Workflow and Skills', 'fund-accounting-workflow-skills', 'fund accounting', 'career', ['fund accounting', 'fund accounting skills']),
        ('NAV Calculation: Inputs, Checks and Exceptions', 'nav-calculation-inputs-checks-exceptions', 'nav calculation', 'informational', ['nav calculation', 'fund accounting']),
        ('Investment Banking Operations Interview Questions', 'investment-banking-operations-interview-questions', 'investment banking interview questions', 'career', ['investment banking interview questions', 'finance interview questions']),
        ('Trade Support Analyst: Duties and Skills', 'trade-support-analyst-duties-skills', 'trade support analyst', 'career', ['trade support analyst', 'investment banking']),
        ('Corporate Actions Analyst Career Path', 'corporate-actions-analyst-career-path', 'corporate actions analyst', 'career', ['corporate actions analyst', 'corporate actions']),
        ('Investment Banks in India: Functions and Operations Roles', 'investment-banks-in-india-functions-roles', 'investment banks in india', 'informational', ['investment banks in india', 'investment banking']),
        ('Investment Banking Career Path in India', 'investment-banking-career-path-india', 'investment banking career path', 'career', ['investment banking career', 'investment banking']),
        ('Investment Banking Salary in India: What Changes It?', 'investment-banking-salary-india-factors', 'investment banking salary', 'informational', ['investment banking salary', 'investment banking']),
        ('Investment Banking Operations vs Financial Modelling', 'investment-banking-operations-vs-financial-modelling', 'investment banking financial modelling', 'decision', ['financial modelling course', 'investment banking']),
        ('Investment Banking Operations vs CFA', 'investment-banking-operations-vs-cfa', 'investment banking cfa', 'decision', ['cfa', 'investment banking']),
        ('Investment Banking Skills for Graduates', 'investment-banking-skills-graduates', 'investment banking skills', 'career', ['investment banking skills', 'investment banking']),
    ]
    for title, slug, primary, intent, terms in ib_rows:
        wave = 1 if primary in {'trade life cycle', 'investment banking operations', 'investment banking interview questions'} else 2
        add_blog(items, title, f'/blog/{slug}/', ib[0], primary, intent, ib[1], ib[2], ib[3], 'Use fictional records, distinguish operations from front-office activity and do not imply certification or live employer access.', wave, terms, 'Show stages, owners, controls, exceptions, a fictional example, role relevance and interview questions.')

    banking = ('Banking / credit / compliance', 'Retail Banking, Finance Operations and KYC / AML', 'Explore the matching module guide and ask for current cohort and terms', '/courses/, /career-guides/finance-operations/, /career-guides/retail-banking-operations/, /courses/kyc-aml/')
    banking_rows = [
        ('Retail Banking Meaning, Products and Roles', 'retail-banking-meaning-products-roles', 'retail banking meaning', 'informational', ['retail banking', 'what is retail banking']),
        ('Commercial Bank Services and Operations', 'commercial-bank-services-operations', 'commercial bank services', 'informational', ['commercial banks', 'banking services']),
        ('Bank Operations: Processes, Controls and Roles', 'bank-operations-processes-controls-roles', 'bank operations', 'career', ['bank operations', 'banking operations']),
        ('Types of Banking Services Explained', 'types-of-banking-services-explained', 'types of banking services', 'informational', ['types of banking services']),
        ('Loan Processing Steps and Workflow', 'loan-processing-steps-workflow', 'loan processing', 'informational', ['loan processing', 'loan operations']),
        ('Loan Lifecycle: Application to Servicing', 'loan-lifecycle-application-to-servicing', 'loan lifecycle', 'informational', ['loan lifecycle', 'loan processing']),
        ('Credit Analysis Basics for Beginners', 'credit-analysis-basics-beginners', 'credit analysis', 'informational', ['credit analysis', 'credit analyst']),
        ('Credit Risk Management in Banking', 'credit-risk-management-banking', 'credit risk', 'informational', ['credit risk', 'risk management']),
        ('Risk Management in Banking: Types and Controls', 'risk-management-banking-types-controls', 'risk management', 'informational', ['risk management', 'financial risk management']),
        ('What Is KYC? Meaning, Process and Documents', 'what-is-kyc-process-documents', 'kyc meaning', 'informational', ['kyc', 'kyc meaning']),
        ('What Is AML? Meaning, Controls and Workflow', 'what-is-aml-controls-workflow', 'aml meaning', 'informational', ['aml', 'anti money laundering']),
        ('KYC vs AML: Difference and Relationship', 'kyc-vs-aml-difference', 'kyc vs aml', 'decision', ['kyc', 'aml']),
        ('Transaction Monitoring: Alerts and Escalation', 'transaction-monitoring-alerts-escalation', 'transaction monitoring', 'informational', ['transaction monitoring', 'aml']),
        ('Sanctions Screening in Compliance Operations', 'sanctions-screening-compliance-operations', 'sanctions screening', 'informational', ['sanctions screening', 'compliance']),
        ('Suspicious Transaction Reporting Explained', 'suspicious-transaction-reporting-explained', 'suspicious transaction reporting', 'informational', ['suspicious transaction', 'aml']),
        ('Financial Crime Analyst: Role and Skills', 'financial-crime-analyst-role-skills', 'financial crime analyst', 'career', ['financial crime analyst', 'financial crime']),
        ('Compliance Analyst: Duties and Career Path', 'compliance-analyst-duties-career-path', 'compliance analyst', 'career', ['compliance analyst', 'compliance']),
        ('Operational Risk in Banking', 'operational-risk-banking', 'operational risk', 'informational', ['operational risk', 'risk management']),
        ('NPA Meaning and Banking Operations Context', 'npa-meaning-banking-operations', 'npa meaning', 'informational', ['npa meaning']),
        ('Banking Interview Questions for Freshers', 'banking-interview-questions-freshers', 'banking interview questions', 'career', ['banking interview questions', 'finance interview questions']),
        ('Process Associate Meaning and Responsibilities', 'process-associate-meaning-responsibilities', 'process associate', 'career', ['process associate', 'process associate meaning']),
        ('Finance Process Associate Duties and Interview Tips', 'finance-process-associate-duties-interview', 'finance process associate', 'career', ['finance process associate', 'process associate']),
    ]
    for title, slug, primary, intent, terms in banking_rows:
        wave = 1 if primary in {'loan processing', 'kyc meaning', 'aml meaning', 'risk management'} else 2
        add_blog(items, title, f'/blog/{slug}/', banking[0], primary, intent, banking[1], banking[2], banking[3], 'Use current authoritative regulatory sources, no legal advice, no bank-employment promise and no thin definition pages.', wave, terms, 'Cover meaning, lifecycle, controls, a practical example, role relevance, India context where appropriate and FAQs.')

    payments = ('Payments / FinTech', 'Digital Payments and FinTech / Neo-Banking', 'Read the Digital Payments or FinTech module guide and ask about current cohort coverage', '/courses/digital-payments/, /courses/fintech/, /career-guides/digital-payments-operations/')
    payments_rows = [
        ('Digital Payments: Meaning and Types', 'digital-payments-meaning-types', 'digital payments', 'informational', ['digital payments', 'payment operations']),
        ('UPI Payment Lifecycle: From Initiation to Settlement', 'upi-payment-lifecycle', 'upi payment lifecycle', 'informational', ['upi', 'payment lifecycle']),
        ('Payment Gateway: Process, Roles and Controls', 'payment-gateway-process-controls', 'payment gateway', 'informational', ['payment gateway', 'payment processing']),
        ('Payment Processing: Steps and Exceptions', 'payment-processing-steps-exceptions', 'payment processing', 'informational', ['payment processing', 'payments']),
        ('Payment Settlement and Reconciliation', 'payment-settlement-reconciliation', 'payment settlement', 'informational', ['payment settlement', 'reconciliation']),
        ('Payment Reconciliation: Breaks and Controls', 'payment-reconciliation-breaks-controls', 'payment reconciliation', 'informational', ['payment reconciliation', 'reconciliation']),
        ('Payment Failure Reasons and Resolution', 'payment-failure-reasons-resolution', 'payment failure', 'informational', ['payment failure', 'payment processing']),
        ('Chargebacks: Process, Evidence and Operations', 'chargebacks-process-evidence-operations', 'chargeback', 'informational', ['chargeback', 'payment operations']),
        ('Digital Banking: Services and Operations', 'digital-banking-services-operations', 'digital banking', 'informational', ['digital banking', 'banking']),
        ('FinTech Operations: Roles and Workflows', 'fintech-operations-roles-workflows', 'fintech operations', 'career', ['fintech operations', 'fintech']),
        ('Neo-Banking Explained: Products and Controls', 'neo-banking-products-controls', 'neo banking', 'informational', ['neo banking', 'fintech']),
        ('AI in Banking: Operations Use Cases and Risks', 'ai-in-banking-use-cases-risks', 'ai in banking', 'informational', ['ai in banking', 'banking']),
        ('Open Banking: APIs, Consent and Operations', 'open-banking-apis-consent-operations', 'open banking', 'informational', ['open banking', 'fintech']),
        ('Fraud in Digital Payments: Signals and Controls', 'fraud-digital-payments-signals-controls', 'fraud digital payments', 'informational', ['fraud', 'digital payments']),
    ]
    for title, slug, primary, intent, terms in payments_rows:
        wave = 2 if primary in {'digital payments', 'payment reconciliation', 'fintech operations'} else 3
        add_blog(items, title, f'/blog/{slug}/', payments[0], primary, intent, payments[1], payments[2], payments[3], 'Use current payment and regulatory sources, no financial advice and no payment-network partnership claim.', wave, terms, 'Explain lifecycle, control points, exceptions, reconciliation, role relevance and current India-specific context.')

    markets = ('Markets / instruments', 'Investment Banking Operations and Financial Markets', 'Read the markets resource and connect to trade lifecycle or Investment Banking Operations', '/resources/financial-markets-instruments/, /career-guides/trade-lifecycle/, /career-guides/investment-banking-operations/')
    markets_rows = [
        ('Financial Markets: Participants and Functions', 'financial-markets-participants-functions', 'financial markets', 'informational', ['financial markets', 'financial market']),
        ('Financial Instruments Explained for Beginners', 'financial-instruments-explained-beginners', 'financial instruments', 'informational', ['financial instruments', 'financial products']),
        ('Capital Markets: Primary, Secondary and Operations', 'capital-markets-primary-secondary-operations', 'capital markets', 'informational', ['capital markets', 'capital market']),
        ('Money Market Instruments and Operations', 'money-market-instruments-operations', 'money market', 'informational', ['money market', 'financial instruments']),
        ('Derivatives Meaning, Types and Operations', 'derivatives-meaning-types-operations', 'derivatives meaning', 'informational', ['derivatives meaning', 'derivatives']),
        ('Bonds vs Equities: Difference and Operations Context', 'bonds-vs-equities-difference', 'bonds vs equities', 'decision', ['bonds', 'equities', 'financial instruments']),
        ('Mutual Fund NAV and Operations', 'mutual-fund-nav-operations', 'mutual fund nav', 'informational', ['mutual fund', 'nav calculation']),
        ('Financial Market Intermediaries and Their Roles', 'financial-market-intermediaries-roles', 'financial market intermediaries', 'informational', ['financial market intermediaries', 'financial markets']),
        ('Treasury Operations: Roles and Workflow', 'treasury-operations-roles-workflow', 'treasury operations', 'career', ['treasury', 'financial operations']),
        ('Business Analyst vs Financial Analyst in Finance', 'business-analyst-vs-financial-analyst-finance', 'business analyst financial analyst', 'decision', ['business analyst', 'financial analyst']),
    ]
    for title, slug, primary, intent, terms in markets_rows:
        add_blog(items, title, f'/blog/{slug}/', markets[0], primary, intent, markets[1], markets[2], markets[3], 'Educational content only; no trading calls, investment advice or unverified market facts.', 3, terms, 'Define the topic, show participants and workflow, explain operations relevance, controls and learner/job context.')

    careers = ('Career / job readiness', 'Finance Operations Masterclass and career guides', 'Explore the Masterclass, role guides and current career-support terms', '/courses/, /career-guides/, /resources/finance-interview-questions/, /placements/')
    career_rows = [
        ('Career in Finance After Graduation', 'career-in-finance-after-graduation', 'career in finance', 'career', ['career in finance', 'finance careers']),
        ('Finance Jobs After BCom', 'finance-jobs-after-bcom', 'finance jobs after bcom', 'career', ['finance jobs after bcom', 'finance careers']),
        ('Finance Interview Questions for Freshers', 'finance-interview-questions-freshers', 'finance interview questions', 'career', ['finance interview questions', 'finance interview questions for freshers']),
        ('Finance Operations Resume: Skills and Examples', 'finance-operations-resume-skills-examples', 'finance operations resume', 'career', ['finance operations', 'finance jobs']),
    ]
    for title, slug, primary, intent, terms in career_rows:
        wave = 1 if primary in {'career in finance', 'finance jobs after bcom', 'finance interview questions'} else 2
        add_blog(items, title, f'/blog/{slug}/', careers[0], primary, intent, careers[1], careers[2], careers[3], 'Do not promise a job, salary or employer outcome; use current approved support terms and original examples.', wave, terms, 'Give a realistic role map, skills checklist, examples, interview prompts, decision support and an honest CTA.')

    assert len(items) == 100, len(items)
    return items


def prepare_rows(items, corpus, kind):
    ranked = []
    for item in items:
        evidence = evidence_for(item['evidence_terms'], corpus)
        ranked.append({**item, 'evidence': evidence, 'score': impact_score(item, evidence)})
    ranked.sort(key=lambda row: (row['wave'], -row['score'], row['title']))
    rows = []
    for rank, item in enumerate(ranked, 1):
        e = item['evidence']
        volume = int(e['volume']) if e['volume'] else ''
        difficulty = int(e['difficulty']) if e.get('difficulty') not in ('', 0, 0.0) else ''
        clicks = int(e['clicks']) if e.get('clicks') not in ('', 0, 0.0) else ''
        if kind == 'page':
            meta_title = f"{item['title']} | Centaur Careers"
            meta_desc = f"Understand {item['primary']} with practical finance, banking and operations guidance. Explore the relevant Centaur module, current access and terms."
            schema = 'Course + Organization + BreadcrumbList' if item['page_type'] in {'Commercial authority', 'Commercial landing', 'Module information landing', 'Audience landing', 'Delivery landing', 'Syllabus landing', 'Duration landing', 'Trust / terms landing'} else 'Article + BreadcrumbList'
            rows.append([rank, item['wave'], item['score'], item['status'], item['page_type'], item['title'], item['slug'], item['cluster'], item['primary'], item['secondary'], item['intent'], item['fit'], volume, difficulty, clicks, e['source'], item['offer'], item['angle'], item['cta'], item['links'], meta_title[:65], meta_desc[:160], item['title'], schema, item['guardrail'], 'One URL owns one primary intent; check against existing routes before build.'])
        else:
            meta_title = f"{item['title']} | Centaur Careers"
            meta_desc = f"Learn {item['primary']} through a clear finance and banking explanation with examples, workflow context, role relevance and practical next steps."
            schema = 'Article + BreadcrumbList' if item['intent'] != 'career' else 'Article + BreadcrumbList + Person/Organization where supported'
            rows.append([rank, item['wave'], item['score'], 'New or refresh', item['title'], item['slug'], item['cluster'], item['primary'], item['secondary'], item['intent'], volume, difficulty, clicks, e['source'], item['module'], item['angle'], item['cta'], item['links'], meta_title[:65], meta_desc[:160], item['title'], schema, item['guardrail'], 'Use original examples, sources and a visible author/update date.'])
    return rows, ranked


def keyword_evidence(corpus):
    direct = [row for row in corpus if source.is_relevant(row['keyword'])]
    deduped = {}
    for row in direct:
        key = norm(row['keyword'])
        if key not in deduped or row['volume'] > deduped[key]['volume']:
            deduped[key] = row
    rows = []
    for row in sorted(deduped.values(), key=lambda r: r['volume'], reverse=True):
        rows.append([row['keyword'], int(row['volume']) if row['volume'] else '', int(row['difficulty']) if row['difficulty'] else '', int(row['clicks']) if row['clicks'] else '', row['rank'], row['source'], 'Direct relevance' if row['volume'] else 'Topic signal'])
    return rows


def create_internal_links():
    return [
        ['All commercial pages', 'Commercial landing', 'Financial Operations Masterclass', '/courses/', 'Financial Operations Masterclass', 'Centralize commercial authority', 'High', 'Place after the answer/fit section and near the first CTA.'],
        ['All regional pages', 'Regional landing', 'Current access and terms', '/courses/', 'online finance course across India', 'Avoid regional doorway pages', 'High', 'Link to one course authority and one contact path.'],
        ['Accounting blogs', '/blog/*accounting*/', 'Accounting basics', '/resources/accounting-basics/', 'accounting basics for finance jobs', 'Foundation to resource', 'High', 'Use contextual links, not sitewide exact-match anchors.'],
        ['Reconciliation content', '/resources/reconciliation-in-finance/', 'Finance Operations career', '/career-guides/finance-operations/', 'finance operations roles', 'Workflow to career', 'High', 'Link after explaining breaks, controls or escalation.'],
        ['Investment Banking blogs', '/blog/*investment-banking*/', 'IB Operations guide', '/career-guides/investment-banking-operations/', 'investment banking operations', 'Discovery to role', 'High', 'Use operations qualifier to avoid front-office ambiguity.'],
        ['Trade lifecycle content', '/career-guides/trade-lifecycle/', 'Reconciliation resource', '/resources/reconciliation-in-finance/', 'reconciliation in finance', 'Process depth', 'High', 'Link at settlement, break and exception sections.'],
        ['KYC / AML blogs', '/blog/*kyc* or *aml*/', 'KYC / AML module', '/courses/kyc-aml/', 'KYC and AML compliance module', 'Information to module', 'High', 'Add source dates and current regulatory caveat.'],
        ['Payments blogs', '/blog/*payment*/', 'Digital Payments module', '/courses/digital-payments/', 'Digital Payments module', 'Workflow to module', 'High', 'Link from lifecycle, disputes and reconciliation sections.'],
        ['FinTech blogs', '/blog/*fintech* or *neo-banking*/', 'FinTech module', '/courses/fintech/', 'FinTech and Neo-Banking module', 'Discovery to module', 'Medium', 'Do not imply software-development delivery.'],
        ['Career guides', '/career-guides/*', 'Interview resource', '/resources/finance-interview-questions/', 'finance interview questions', 'Career to lead', 'High', 'Use role-specific anchors and qualifying context.'],
        ['Comparison pages', '/compare/*', 'Program FAQs/terms', '/faqs/finance-program/', 'current finance course terms', 'Decision to trust', 'High', 'Link to visible terms before lead CTA.'],
        ['New informational pages', 'All new resources', 'Contact', '/contact/', 'ask about the current cohort and terms', 'Qualified conversion', 'Medium', 'CTA follows complete answer; no aggressive interstitial.'],
    ]


def create_sequence():
    return [
        [1, 'Preparation', 'Freeze keyword ownership and URL map', 'SEO + developer', 'Compare every proposed slug with existing routes, canonical owners and current sitemap.', 'No duplicate intent or orphan page.', 'Before publishing'],
        [2, 'Wave 1', 'Refresh the commercial authority and terms', 'Content + admissions', 'Update /courses/, syllabus, fees/eligibility, support and approved guarantee terms.', 'Every commercial question answered with current evidence.', 'Week 1'],
        [3, 'Wave 1', 'Publish/refresh reconciliation and accounting foundations', 'Content + subject reviewer', 'Own the strongest transferable informational demand with original examples and links.', 'One canonical owner per reconciliation/accounting intent.', 'Weeks 1-2'],
        [4, 'Wave 1', 'Build investment-banking operations cluster', 'Content + subject reviewer', 'Launch operations definition, trade lifecycle, settlement, roles and interview pathways.', 'Operations scope clearly separated from front office.', 'Weeks 2-3'],
        [5, 'Wave 1', 'Publish high-intent role pages', 'Content + careers', 'Finance operations, process associate, reconciliation, KYC/AML and payments roles.', 'Each page has role duties, skills, examples and honest CTA.', 'Weeks 3-4'],
        [6, 'Wave 2', 'Expand banking, credit, compliance and payments hubs', 'Content + SME', 'Add topic pages and supporting blogs with current sources.', 'Module links and regulatory review completed.', 'Weeks 4-6'],
        [7, 'Wave 2', 'Roll out only qualified regional pages', 'SEO + local reviewer', 'Keep the selective 11-location set; require unique local access and demand evidence.', 'No templated doorway pages; online/in-person wording accurate.', 'Weeks 5-7'],
        [8, 'Wave 2', 'Publish comparison and decision pages', 'Content + admissions', 'Answer finance-course, online/offline and career-path comparisons transparently.', 'No unsupported competitor or credential claims.', 'Weeks 6-7'],
        [9, 'Wave 3', 'Publish markets, FinTech and AI-in-banking articles', 'Content + SME', 'Use educational, sourced material and link to operations modules.', 'No investment advice or outdated regulatory claims.', 'Weeks 7-9'],
        [10, 'Measurement', 'Connect GA4 and Search Console reporting', 'Analytics + SEO', 'Track impressions, clicks, query ownership, CTA clicks, WhatsApp/form leads and qualified-lead rate by cluster.', 'Dashboard by page, query, region and funnel stage.', 'After each release'],
        [11, 'Governance', 'Run 28/56-day cannibalization review', 'SEO', 'Merge, redirect or reframe pages that share intent or attract unqualified queries.', 'One canonical owner; no near-duplicate clusters.', '28 and 56 days'],
    ]


def create_exclusions(keywordi_rows):
    top = sorted(keywordi_rows, key=lambda r: num(r.get('Search Volume')), reverse=True)
    wanted = ['digital marketing', 'machine learning', 'data science', 'upgrad', 'cfa', 'frm', 'stock market courses', 'business analyst']
    rows = []
    for phrase in wanted:
        match = next((row for row in top if phrase in str(row.get('Keyword', '')).lower()), None)
        if not match:
            continue
        keyword = match['Keyword']
        volume = int(num(match.get('Search Volume')))
        if phrase == 'business analyst':
            decision = 'Use only with banking/finance qualifier'
            reason = 'Large demand, but generic intent would attract a different audience; keep a qualified comparison/role page.'
        elif phrase in {'cfa', 'frm'}:
            decision = 'Exclude core offer; comparison only'
            reason = 'Credential intent and brand/trust risk; Centaur should not imply official preparation or affiliation.'
        elif phrase == 'stock market courses':
            decision = 'Exclude commercial targeting'
            reason = 'Investment-learning intent is not the published job-focused BFSI offer; educational markets content is safer.'
        else:
            decision = 'Exclude'
            reason = 'High volume but unrelated to the published finance and banking offer; relevance and lead quality would suffer.'
        rows.append([keyword, volume, match.get('Ranking Difficulty', ''), decision, reason])
    rows.extend([
        ['Generic city pages beyond the qualified set', '', '', 'Hold', 'Do not create 30+ templated location pages; each location needs unique demand, access details and local usefulness.'],
        ['Separate class page for every module', '', '', 'Do not create', 'The current offer is one Financial Operations Masterclass with module areas; use module information pages and one commercial owner.'],
        ['Unverified salary, placement or employer pages', '', '', 'Source before publishing', 'Use dated sources and current approved terms; never convert keyword volume into a guarantee.'],
    ])
    return rows


def main():
    corpus = compact_keyword_rows()
    pages = make_pages()
    blogs = make_blogs()
    page_rows, _ = prepare_rows(pages, corpus, 'page')
    blog_rows, _ = prepare_rows(blogs, corpus, 'blog')
    keywordi_rows = source.read_rows(KEYWORDI)
    direct_keywordi = [row for row in keywordi_rows if source.is_relevant(row.get('Keyword', ''))]
    evidence_rows = keyword_evidence(corpus)

    summary = [
        ['Scope', 'Exactly 100 planned page opportunities and exactly 100 blog topics, prioritized using keywordi.xlsx plus the earlier keyword exports and competitor top-page CSV.'],
        ['Keywordi result', f"1,000 rows reviewed; {len(direct_keywordi)} directly finance/BFSI-relevant after excluding broad unrelated terms."],
        ['Scoring', 'Impact score combines business fit, intent, observed volume, difficulty where available and number of supporting datasets. It is a prioritization score—not a traffic forecast.'],
        ['Page architecture', 'One commercial authority plus module, career, resource, comparison and selective regional pages. Every URL has one primary intent.'],
        ['Blog architecture', '100 supporting articles across accounting, investment-banking operations, banking/compliance, payments/FinTech, markets and career readiness.'],
        ['Lead model', 'Answer first, demonstrate practical relevance, then route to the matching module, current cohort/terms, interview resource or contact path.'],
        ['Offer guardrail', 'The plan maps to the current six-week Financial Operations Masterclass and its published module areas; it does not invent standalone classes or credentials.'],
        ['Regional guardrail', 'The plan keeps a selective regional set and uses online-access wording outside published in-person availability; no templated city doorway expansion.'],
        ['Measurement', 'Track query ownership, impressions, clicks, CTA clicks, WhatsApp/form leads, qualified-lead rate and unqualified-query rate by cluster.'],
    ]

    page_headers = ['Rank', 'Wave', 'Impact score', 'Status', 'Page type', 'Page title', 'Recommended URL', 'Cluster', 'Primary keyword', 'Secondary/evidence terms', 'Intent', 'Business fit', 'Observed volume', 'Observed KD', 'Observed clicks', 'Best evidence source', 'Offer/module relationship', 'Content scope', 'Primary CTA', 'Internal links', 'Proposed title', 'Proposed meta description', 'H1', 'Schema direction', 'Guardrail', 'Implementation note']
    blog_headers = ['Rank', 'Wave', 'Impact score', 'Status', 'Blog title', 'Recommended URL', 'Cluster', 'Primary keyword', 'Secondary/evidence terms', 'Intent', 'Observed volume', 'Observed KD', 'Observed clicks', 'Best evidence source', 'Course/module bridge', 'Content angle', 'CTA', 'Internal links', 'Proposed title', 'Proposed meta description', 'H1', 'Schema direction', 'Guardrail', 'Implementation note']

    source_notes = [
        ['keywordi.xlsx', 'Keyword export', 1000, 30, len(direct_keywordi), '', 'New keyword universe and volume/KD/click signals.', 'High-volume unrelated terms were intentionally excluded.'],
        ['Keyword Tool Export - Analyze Competitors - imarticus org.xlsx', 'Competitor keyword export', 2219, 30, 421, '', 'Competitor finance/BFSI keyword demand and commercial signals.', 'Not combined with other volumes; source-specific evidence kept.'],
        ['spy.xlsx', 'Competitor keyword/ranking export', 1000, 22, 327, '', 'Keyword volume, KD, ranking and SEO-click signals.', 'Competitor performance is directional, not a forecast for Centaur.'],
        ['TopPages_imarticus-org_9_27_2026_SEO (1).csv', 'Competitor top-page export', 1822, 8, 715, '', 'Page formats and estimated SEO clicks for transferable information architecture.', 'Estimated competitor clicks do not equal Centaur traffic potential.'],
        ['Live Centaur positioning', 'Public website check', '', '', '', '', 'One six-week Financial Operations Masterclass; online across India and published in-person access in Lucknow; module areas include IB Ops, Retail Banking, KYC/AML, Payments, Finance Operations and FinTech/Neo-Banking.', 'Validate current cohort, guarantee, certificate, employer and support wording before release.'],
        ['Scoring rule', 'Planning method', '', '', '', '', 'Impact = fit + intent + observed volume bucket + difficulty signal + dataset support.', 'Do not add volumes across exports or promise rankings.'],
    ]

    sheets = [
        ('Executive Summary', '100-page and 100-blog SEO impact plan. Attached workbooks are treated as research data, not instructions; unrelated or credential-led demand is separated.', ['Area', 'Decision'], summary),
        ('100 Page Plan', 'Exactly 100 page opportunities. Build, expand or hold each URL only after checking the existing route map and canonical ownership.', page_headers, page_rows),
        ('100 Blog Plan', 'Exactly 100 blog topics. Publish only with original examples, expert review, sources and one clear internal-link path to a relevant module or lead destination.', blog_headers, blog_rows),
        ('Keyword Evidence', 'Relevant keyword evidence from all supplied datasets. Volumes are source-specific and must not be summed.', ['Keyword', 'Observed volume', 'Observed KD', 'Observed clicks', 'Rank', 'Best source', 'Evidence type'], evidence_rows),
        ('Internal Linking', 'Hub-and-spoke implementation rules for the 200 planned URLs. Add links where they answer the surrounding section; avoid exact-match repetition.', ['Source group', 'Source URL/pattern', 'Destination page', 'Destination URL', 'Recommended anchor', 'Purpose', 'Priority', 'Placement note'], create_internal_links()),
        ('Execution Sequence', 'Recommended release sequence with dependencies, acceptance criteria and measurement.', ['Step', 'Wave', 'Task', 'Owner', 'Implementation detail', 'Acceptance criteria', 'Timing'], create_sequence()),
        ('Exclusions & Risks', 'High-volume terms and scaling patterns deliberately excluded or qualified because of relevance, trust, regulatory or doorway-page risk.', ['Term / risk', 'Keyword Tool volume', 'Spy KD', 'Decision', 'Reason'], create_exclusions(keywordi_rows)),
        ('Source Notes', 'Audit trail for files, filters, live positioning and planning limits.', ['Source / scope', 'Type', 'Rows / value', 'Columns', 'Relevant rows', 'Unique / overlap', 'What it contributes', 'Limitation'], source_notes),
    ]
    workbook.write_workbook(sheets)
    print(f'Created {workbook.OUTPUT}')
    print(f'pages={len(page_rows)} blogs={len(blog_rows)} keyword_evidence={len(evidence_rows)} corpus={len(corpus)}')


if __name__ == '__main__':
    main()
