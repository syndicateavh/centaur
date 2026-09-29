import csv
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import analyze_keyword_sources as source
import analyze_top_pages as top_pages
import create_100_page_blog_plan as full_plan
import create_seo_keyword_plan as workbook
import create_top20_execution_pack as pack


ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://centaurcareers.in'
SITEMAP = ROOT / 'public' / 'sitemap.xml'
TOP_PAGES = Path(r'C:\Users\Virat Singh\Downloads\TopPages_imarticus-org_9_27_2026_SEO (1).csv')
KEYWORDI = Path(r'C:\Users\Virat Singh\Downloads\keywordi.xlsx')
COMPETITOR = Path(r'C:\Users\Virat Singh\Downloads\Keyword Tool Export - Analyze Competitors - imarticus org.xlsx')
SPY = Path(r'C:\Users\Virat Singh\Downloads\spy.xlsx')
workbook.OUTPUT = ROOT / 'SEO_Next20_Pages_Next20_Blogs_Plan_2026-09-27.xlsx'


PAGE_CONFIG = [
    {
        'slug': '/courses/finance-operations-syllabus/',
        'reason': 'Direct decision intent and a strong bridge from informational traffic to the existing Masterclass.',
        'owner': '/courses/',
        'conflict': 'Keep the page limited to the visible six-module syllabus; it is not a separate course.',
        'risk': 'Low',
    },
    {
        'slug': '/courses/finance-course-fees-eligibility/',
        'reason': 'High-conversion questions about fees, eligibility, duration, mode and current terms.',
        'owner': '/courses/',
        'conflict': 'Use current approved facts and link to FAQs/terms; do not hard-code stale fees in metadata.',
        'risk': 'Low',
    },
    {
        'slug': '/courses/finance-course-for-graduates/',
        'reason': 'Audience-specific commercial intent with a clear graduate-to-role decision path.',
        'owner': '/courses/',
        'conflict': 'Differentiate from the general course page through eligibility, skill-gap and role-fit content.',
        'risk': 'Medium',
    },
    {
        'slug': '/courses/finance-course-after-bcom/',
        'reason': 'High-fit audience page connecting accounting foundations with finance-operations roles.',
        'owner': '/courses/',
        'conflict': 'Do not duplicate the graduates page; focus specifically on BCom foundations and gaps.',
        'risk': 'Medium',
    },
    {
        'slug': '/compare/investment-banking-operations-vs-financial-analyst/',
        'reason': 'Decision-stage comparison with strong analyst and investment-banking demand signals.',
        'owner': '/courses/investment-banking-operations/',
        'conflict': 'Do not call Centaur a Financial Analyst course; compare role outputs and skill paths neutrally.',
        'risk': 'Medium',
    },
    {
        'slug': '/compare/banking-vs-finance-careers/',
        'reason': 'Broad career-decision demand that can distribute users into banking, operations and compliance clusters.',
        'owner': '/career-guides/',
        'conflict': 'Use a decision matrix rather than repeating the finance-careers-after-graduation guide.',
        'risk': 'Medium',
    },
    {
        'slug': '/career-guides/business-analyst-in-banking/',
        'reason': 'Large adjacent analyst demand, qualified to banking so it remains relevant to the site.',
        'owner': '/career-guides/',
        'conflict': 'Do not target generic BA certification; distinguish requirements/process work from operations execution.',
        'risk': 'Medium',
    },
    {
        'slug': '/career-guides/risk-operations-analyst/',
        'reason': 'Strong risk-demand proxy with direct relevance to controls, issues and finance operations.',
        'owner': '/blog/risk-management-in-banking/',
        'conflict': 'The existing blog owns risk concepts; this page owns role duties, evidence, skills and interviews.',
        'risk': 'Low',
    },
    {
        'slug': '/career-guides/operations-analyst-banking/',
        'reason': 'Qualified analyst-role intent spanning banking controls, queues and process ownership.',
        'owner': '/career-guides/finance-operations/',
        'conflict': 'Keep banking qualifiers throughout and avoid competing for generic operations analyst traffic.',
        'risk': 'Medium',
    },
    {
        'slug': '/career-guides/settlement-analyst/',
        'reason': 'High-fit specialist role connected to trade lifecycle, settlement fails and reconciliation.',
        'owner': '/career-guides/trade-lifecycle/',
        'conflict': 'The trade-lifecycle guide owns the process; this page owns the settlement-analyst role intent.',
        'risk': 'Low',
    },
    {
        'slug': '/career-guides/middle-office-operations/',
        'reason': 'Distinct investment-operations role family with useful comparison and interview intent.',
        'owner': '/career-guides/investment-banking-operations-roles/',
        'conflict': 'Focus on control and hand-off responsibilities, not front-office deal or trading claims.',
        'risk': 'Low',
    },
    {
        'slug': '/career-guides/back-office-banking-jobs/',
        'reason': 'Practical job-intent page for processing, records, settlement and reconciliation skills.',
        'owner': '/career-guides/investment-banking-operations-roles/',
        'conflict': 'No scraped vacancies, generic job-board copy, salary promise or employer guarantee.',
        'risk': 'Low',
    },
    {
        'slug': '/career-guides/custody-operations/',
        'reason': 'Specialist operations topic that deepens the settlement and asset-servicing cluster.',
        'owner': '/career-guides/investment-banking-operations/',
        'conflict': 'Use sourced role definitions and fictional workflows; do not imply custody services are offered.',
        'risk': 'Low',
    },
    {
        'slug': '/career-guides/credit-analyst/',
        'reason': 'High-intent finance role that links accounting, statements, lending and risk foundations.',
        'owner': '/courses/finance-operations/',
        'conflict': 'Do not market a dedicated Financial Analyst or Credit Analyst certification.',
        'risk': 'Medium',
    },
    {
        'slug': '/career-guides/credit-operations-analyst/',
        'reason': 'Operations-specific credit role with stronger program fit than broad investment analysis.',
        'owner': '/career-guides/credit-analyst/',
        'conflict': 'Separate policy/data/exception workflow from underwriting authority and lending advice.',
        'risk': 'Low',
    },
    {
        'slug': '/career-guides/transaction-monitoring-analyst/',
        'reason': 'Clear specialist intent within the published KYC/AML module and financial-crime cluster.',
        'owner': '/career-guides/kyc-aml-analyst/',
        'conflict': 'Role-focused page only; regulatory facts require dates and primary sources.',
        'risk': 'Low',
    },
    {
        'slug': '/career-guides/finance-learning-roadmap/',
        'reason': 'Top-of-funnel graduate roadmap that can route users into all six existing module areas.',
        'owner': '/career-guides/finance-careers-after-graduation/',
        'conflict': 'Use a sequenced learning plan; do not repeat the existing career-options content.',
        'risk': 'Medium',
    },
    {
        'slug': '/resources/capital-market-operations/',
        'reason': 'Measured capital-market demand with a strong operations angle and investment-banking bridge.',
        'owner': '/blog/financial-markets-instruments-participants-operations/',
        'conflict': 'The blog owns broad markets; this resource owns issuance-to-custody operational infrastructure.',
        'risk': 'Low',
    },
    {
        'slug': '/resources/financial-system-india/',
        'reason': 'Measured demand for the financial system and a natural authority hub for banking and markets.',
        'owner': '/resources/finance-gk/',
        'conflict': 'Use a sourced India institution/regulator map, not a generic glossary or current-affairs feed.',
        'risk': 'Low',
    },
    {
        'slug': '/resources/corporate-actions-workflow/',
        'reason': 'Measured specialist demand with clear links to settlement, custody and fund accounting.',
        'owner': '/blog/corporate-actions-analyst-career-path/',
        'conflict': 'The existing blog owns career intent; this resource owns event processing and controls.',
        'risk': 'Low',
    },
]


PAGE_CONFIG = [config for config in PAGE_CONFIG if config['slug'] != '/courses/finance-course-after-bcom/']
PAGE_CONFIG.append({
    'slug': '/resources/kyc-aml-compliance-guide/',
    'reason': 'Measured compliance demand and a needed information hub for KYC, AML and transaction-monitoring spokes.',
    'owner': '/courses/kyc-aml/',
    'conflict': 'This resource owns the combined framework; supporting blogs own KYC process, AML controls and alert workflow separately.',
    'risk': 'Low',
})


BLOG_CONFIG = [
    {
        'slug': '/blog/investment-banking-skills-graduates/',
        'reason': 'Strong investment-banking demand paired with a practical graduate skills gap.',
        'owner': '/career-guides/investment-banking-operations/',
        'conflict': 'Cover operations-relevant skills and explicitly separate front-office roles.',
        'risk': 'Medium',
    },
    {
        'slug': '/blog/front-middle-back-office-investment-banking/',
        'reason': 'Clear definitional and comparison intent supporting the investment-operations role hub.',
        'owner': '/career-guides/investment-banking-operations-roles/',
        'conflict': 'Own the office-model comparison; do not repeat the broad teams article.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/trade-capture-process-controls/',
        'reason': 'Deep workflow topic that builds topical authority beneath the trade-lifecycle guide.',
        'owner': '/career-guides/trade-lifecycle/',
        'conflict': 'Focus on data fields, validation and control evidence using fictional records.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/trade-confirmation-matching-process/',
        'reason': 'Distinct post-trade intent with strong internal-link value for settlement content.',
        'owner': '/career-guides/trade-lifecycle/',
        'conflict': 'Own matching/confirmation; leave full lifecycle coverage to the pillar.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/failed-settlement-reasons-resolution/',
        'reason': 'Problem-solving query with high role relevance and practical exception examples.',
        'owner': '/blog/settlement-trade-break-worked-example/',
        'conflict': 'Use multiple failure causes and controls; do not duplicate the existing single worked case.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/custody-operations-explained/',
        'reason': 'Specialist asset-servicing topic that supports settlement and corporate-actions authority.',
        'owner': '/career-guides/custody-operations/',
        'conflict': 'Informational workflow page; the career guide owns job and interview intent.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/clearing-and-settlement-explained/',
        'reason': 'Foundational market-infrastructure question with direct operations relevance.',
        'owner': '/career-guides/trade-lifecycle/',
        'conflict': 'Explain clearing-versus-settlement and participant hand-offs, not the whole trade lifecycle.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/loan-processing-steps-workflow/',
        'reason': 'Strong lending workflow fit and a practical bridge into finance operations.',
        'owner': '/blog/loan-operations-banking-roles-skills-career-path/',
        'conflict': 'The existing article owns role/career intent; this post owns process stages and checks.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/credit-analysis-basics-beginners/',
        'reason': 'Useful informational demand connecting statements, lending and credit roles.',
        'owner': '/career-guides/credit-analyst/',
        'conflict': 'Educational framework only; no recommendation, underwriting decision or analyst-course claim.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/credit-risk-management-banking/',
        'reason': 'Measured credit-risk demand with strong banking and controls relevance.',
        'owner': '/blog/risk-management-in-banking/',
        'conflict': 'The existing pillar owns all risk types; this article goes deep only on credit risk.',
        'risk': 'Medium',
    },
    {
        'slug': '/blog/what-is-kyc-process-documents/',
        'reason': 'Evergreen KYC process intent aligned to the current compliance module.',
        'owner': '/career-guides/kyc-aml-analyst/',
        'conflict': 'Use dated RBI sources; do not provide legal advice or copy document lists without context.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/what-is-aml-controls-workflow/',
        'reason': 'Evergreen AML foundation supporting transaction-monitoring and financial-crime paths.',
        'owner': '/career-guides/kyc-aml-analyst/',
        'conflict': 'Explain concepts and controls without presenting legal advice or accreditation.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/transaction-monitoring-alerts-escalation/',
        'reason': 'Specialist compliance workflow with strong career and interview relevance.',
        'owner': '/career-guides/transaction-monitoring-analyst/',
        'conflict': 'The career guide owns the role; this article owns alert handling and escalation logic.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/npa-meaning-banking-operations/',
        'reason': 'Banking concept with credit, servicing, reporting and operations relevance.',
        'owner': '/courses/finance-operations/',
        'conflict': 'Use current RBI terminology and avoid advice about any borrower or loan.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/upi-payment-lifecycle/',
        'reason': 'High-interest India payments topic with strong operational and current-data potential.',
        'owner': '/courses/digital-payments/',
        'conflict': 'Use current NPCI/RBI sources and clearly date statistics and process facts.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/payment-gateway-process-controls/',
        'reason': 'Commercially relevant payment-infrastructure query with clear workflow intent.',
        'owner': '/courses/digital-payments/',
        'conflict': 'Explain parties, statuses and controls; do not recommend vendors or imply partnerships.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/payment-processing-steps-exceptions/',
        'reason': 'Core payments workflow that connects customer events with operations exceptions.',
        'owner': '/courses/digital-payments/',
        'conflict': 'Own end-to-end processing; leave product definitions to existing banking content.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/payment-failure-reasons-resolution/',
        'reason': 'Problem-intent article suited to exception handling, reconciliation and support workflows.',
        'owner': '/courses/digital-payments/',
        'conflict': 'Use fictional examples and general resolution paths; no customer-specific financial advice.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/chargebacks-process-evidence-operations/',
        'reason': 'Distinct disputes workflow with evidence, controls and role relevance.',
        'owner': '/courses/digital-payments/',
        'conflict': 'Educational operations coverage only; do not promise dispute outcomes.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/money-market-instruments-operations/',
        'reason': 'Measured market demand not yet owned by a dedicated page and relevant to operations.',
        'owner': '/resources/capital-market-operations/',
        'conflict': 'Explain instruments and operations without giving trading or investment advice.',
        'risk': 'Low',
    },
]


REMOVED_BLOG_SLUGS = {
    '/blog/trade-capture-process-controls/',
    '/blog/trade-confirmation-matching-process/',
    '/blog/custody-operations-explained/',
    '/blog/npa-meaning-banking-operations/',
    '/blog/payment-gateway-process-controls/',
    '/blog/payment-processing-steps-exceptions/',
    '/blog/payment-failure-reasons-resolution/',
    '/blog/chargebacks-process-evidence-operations/',
}
BLOG_CONFIG = [config for config in BLOG_CONFIG if config['slug'] not in REMOVED_BLOG_SLUGS]
BLOG_CONFIG.extend([
    {
        'slug': '/blog/ai-in-banking-use-cases-risks/',
        'reason': 'Measured emerging demand with direct FinTech, controls and banking-operations relevance.',
        'owner': '/courses/fintech/',
        'conflict': 'Use current primary research and discuss limits, controls and human review; no automation promises.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/treasury-operations-roles-workflow/',
        'reason': 'Measured specialist demand that expands the markets and operations career cluster.',
        'owner': '/resources/capital-market-operations/',
        'conflict': 'Explain operational workflow and roles without trading recommendations or a treasury-course claim.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/bfsi-domain-banking-financial-services-insurance/',
        'reason': 'Measured BFSI-domain demand and a strong entry point into banking, payments, compliance and operations.',
        'owner': '/resources/finance-gk/',
        'conflict': 'Use a sector map and role families; do not repeat the general finance glossary.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/investment-management-meaning-process-roles/',
        'reason': 'Measured investment-management demand with a safe educational and operations angle.',
        'owner': '/blog/financial-markets-instruments-participants-operations/',
        'conflict': 'Explain process, participants and roles without investment advice or portfolio recommendations.',
        'risk': 'Medium',
    },
    {
        'slug': '/blog/banking-sector-india-structure-operations/',
        'reason': 'Measured India banking-sector demand suitable for a sourced structure-and-operations overview.',
        'owner': '/resources/financial-system-india/',
        'conflict': 'Date all institutional and market facts; avoid unsupported market-size or hiring claims.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/cost-accounting-vs-management-accounting/',
        'reason': 'Measured low-difficulty comparison demand with strong accounting and finance-operations relevance.',
        'owner': '/resources/cost-accounting-finance-operations/',
        'conflict': 'The existing cost article owns methods; this page owns purpose, users, outputs and differences.',
        'risk': 'Low',
    },
    {
        'slug': '/blog/financial-reporting-process-controls/',
        'reason': 'Measured reporting demand connecting statements, close, review controls and operational roles.',
        'owner': '/blog/financial-accounting-statements-process-examples/',
        'conflict': 'Differentiate through reporting workflow, review, disclosure hand-offs and controls.',
        'risk': 'Medium',
    },
    {
        'slug': '/blog/accounting-conventions-principles-examples/',
        'reason': 'Measured accounting-conventions demand with an opportunity for original practical examples.',
        'owner': '/blog/accounting-principles-explained/',
        'conflict': 'Focus on conventions and application choices; the existing article owns broad principles.',
        'risk': 'Medium',
    },
])


def custom_blog_candidates():
    items = []
    full_plan.add_blog(
        items,
        'BFSI Domain: Banking, Financial Services and Insurance',
        '/blog/bfsi-domain-banking-financial-services-insurance/',
        'Banking / industry',
        'bfsi domain',
        'informational',
        'Financial Operations Masterclass and all six module areas',
        'Explore the role and module map, then ask about current cohort coverage',
        '/courses/, /resources/finance-gk/, /career-guides/',
        'Use current India-sector sources and do not imply every BFSI role is covered by one course.',
        2,
        ['bfsi domain'],
        'Define BFSI, map institutions and business lines, show operations role families, skills, controls and learning paths.',
    )
    full_plan.add_blog(
        items,
        'Investment Management: Meaning, Process and Operations Roles',
        '/blog/investment-management-meaning-process-roles/',
        'Markets / instruments',
        'investment management',
        'informational',
        'Investment Banking Operations and Financial Markets',
        'Explore the markets and investment-operations learning path',
        '/blog/financial-markets-instruments-participants-operations/, /courses/investment-banking-operations/, /career-guides/investment-banking-operations/',
        'Educational only; no investment recommendation, performance claim or portfolio advice.',
        3,
        ['investment management'],
        'Explain mandate-to-reporting stages, participants, controls, operations hand-offs and related role families.',
    )
    full_plan.add_blog(
        items,
        'Banking Sector in India: Structure, Functions and Operations',
        '/blog/banking-sector-india-structure-operations/',
        'Banking / industry',
        'banking sector',
        'informational',
        'Retail Banking and Finance Operations',
        'Explore banking and finance-operations role pathways',
        '/resources/financial-system-india/, /courses/retail-banking/, /career-guides/retail-banking-operations/',
        'Use dated RBI and official sources; no unsupported market-size, hiring or employer claims.',
        3,
        ['banking sector'],
        'Map institution types, functions, regulators, operating workflows, current changes and role families in India.',
    )
    full_plan.add_blog(
        items,
        'Cost Accounting vs Management Accounting',
        '/blog/cost-accounting-vs-management-accounting/',
        'Accounting / fundamentals',
        'cost and management accounting',
        'decision',
        'Finance Operations and Accounting Basics',
        'Read the cost-accounting resource and compare the workflows',
        '/resources/cost-accounting-finance-operations/, /resources/accounting-basics/, /courses/finance-operations/',
        'Use original examples and do not imply a standalone accounting qualification or course.',
        2,
        ['cost and management accounting'],
        'Compare purpose, users, time horizon, reports, decisions, controls and a worked example using fictional data.',
    )
    full_plan.add_blog(
        items,
        'Financial Reporting: Process, Controls and Roles',
        '/blog/financial-reporting-process-controls/',
        'Accounting / fundamentals',
        'financial reporting',
        'informational',
        'Finance Operations and Accounting Basics',
        'Explore accounting and finance-operations foundations',
        '/blog/financial-accounting-statements-process-examples/, /resources/financial-statement-analysis/, /courses/finance-operations/',
        'Use fictional examples and current authoritative sources; no audit, tax or accounting advice.',
        2,
        ['financial reporting'],
        'Cover source-to-report workflow, close, review, controls, common exceptions, outputs and role relevance.',
    )
    full_plan.add_blog(
        items,
        'Accounting Conventions: Principles and Practical Examples',
        '/blog/accounting-conventions-principles-examples/',
        'Accounting / fundamentals',
        'accounting conventions',
        'informational',
        'Finance Operations and Accounting Basics',
        'Read accounting principles and practise with fictional examples',
        '/blog/accounting-principles-explained/, /resources/accounting-basics/, /courses/finance-operations/',
        'Explain concepts educationally and note that applicable accounting requirements vary by entity and jurisdiction.',
        2,
        ['accounting conventions'],
        'Define major conventions, show their use in judgement and reporting, add examples, limitations and review questions.',
    )
    return items


HELD_TOPICS = [
    ['Bank reconciliation article', 'Consolidate', '/resources/bank-reconciliation-process/', 'A second high-volume blog would compete with the current canonical resource.'],
    ['Risk management in banking resource/blog variants', 'Consolidate', '/blog/risk-management-in-banking/', 'The current 1,500+ word pillar already owns broad risk-management intent.'],
    ['Finance process associate variants', 'Consolidate', '/blog/finance-process-associate-role/', 'The published role article and specialist pathway already own the intent.'],
    ['Fund accounting workflow/career variants', 'Consolidate', '/blog/fund-accounting-nav-workflow-career-skills/', 'Refresh the current canonical rather than splitting NAV and career authority prematurely.'],
    ['Financial market intermediaries variants', 'Consolidate', '/blog/financial-market-intermediaries/', 'The current sourced article already owns this exact topic.'],
    ['Financial products/services resource variants', 'Consolidate', '/blog/financial-products-and-services-banking/', 'The current article owns the product-and-service overview.'],
    ['Investment banking operations vs CFA variants', 'Consolidate', '/blog/investment-banking-operations-vs-cfa-financial-modelling/', 'The current three-way comparison already covers CFA and modelling boundaries.'],
    ['New city pages', 'Hold', '/india/', 'The supplied exports do not provide distinct city-level demand/proof for the proposed locations.'],
    ['Salary pages', 'Evidence gate', '', 'Publish only with current, attributable salary datasets and careful role/location methodology.'],
    ['CFA/FRM course pages', 'Exclude', '', 'Centaur does not claim those standalone credentials; comparison-only coverage is safer.'],
    ['Separate classes for module topics', 'Exclude', '/courses/', 'All module information must remain part of the one published Financial Operations Masterclass.'],
]


def live_paths():
    xml = SITEMAP.read_text(encoding='utf-8')
    return {re.sub(rf'^{re.escape(SITE)}', '', url) for url in re.findall(r'<loc>([^<]+)</loc>', xml)}


def demand_confidence(item):
    evidence = item['evidence']
    if not evidence.get('volume'):
        return 'Strategic gap', 'No measured source volume; prioritize only for cluster completeness.'
    primary = full_plan.norm(item['primary'])
    keyword = full_plan.norm(evidence.get('keyword', ''))
    if primary == keyword or (primary and primary in keyword):
        return 'Direct/close', 'Observed keyword contains the planned primary phrase.'
    return 'Proxy', f"Observed volume comes from broader term '{evidence.get('keyword', '')}', not the full qualified query."


def adjusted_score(item, config):
    confidence, _ = demand_confidence(item)
    confidence_adjustment = {'Direct/close': 5, 'Proxy': -7, 'Strategic gap': -10}[confidence]
    risk_adjustment = 0 if config['risk'] == 'Low' else -4
    return max(1, min(100, item['blended_score'] + confidence_adjustment + risk_adjustment))


def get_relevant_top_rows():
    rows = top_pages.load(TOP_PAGES)
    return [
        row for row in rows
        if top_pages.RELEVANT.search(row['Title'] + ' ' + row['Top KW'])
        and not top_pages.NOISE.search(row['Title'] + ' ' + row['Top KW'])
    ]


def evidence_with_short_terms(item, corpus):
    base = full_plan.evidence_for(item.get('evidence_terms', []), corpus)
    short_terms = [full_plan.norm(term) for term in item.get('evidence_terms', []) if 1 < len(full_plan.norm(term)) < 4]
    matches = []
    matched_term = ''
    for term in short_terms:
        pattern = re.compile(rf'(^|\s){re.escape(term)}($|\s)')
        term_matches = [row for row in corpus if pattern.search(full_plan.norm(row.get('keyword', '')))]
        if term_matches:
            matches.extend(term_matches)
            matched_term = term
    matches.sort(key=lambda row: (row.get('volume', 0), full_plan.num(row.get('clicks'))), reverse=True)
    if not matches or matches[0].get('volume', 0) <= base.get('volume', 0):
        return base
    best = matches[0]
    return {
        **best,
        'matched_term': matched_term,
        'source_count': len({row['source'] for row in matches if row.get('volume', 0) > 0}),
    }


def refresh_scores(item, kind):
    evidence = item['evidence']
    competitor = item.get('competitor_page') or {}
    competitor_clicks = competitor.get('Est Monthly SEO Clicks', 0)
    item['reach_score'] = min(
        100,
        round(
            math.log10(1 + max(evidence.get('volume', 0), 1)) * 10
            + min(25, competitor_clicks / 50)
            + min(15, evidence.get('source_count', 0) * 3)
            + (8 if competitor else 0)
        ),
    )
    item['lead_score'] = pack.lead_score(item, kind)
    item['blended_score'] = round(item['reach_score'] * 0.58 + item['lead_score'] * 0.42)


def select_items(configs, candidates, kind, corpus, top_rows):
    candidate_map = {item['slug']: item for item in candidates}
    live = live_paths()
    selected = []
    for config in configs:
        slug = config['slug']
        if slug in live:
            raise RuntimeError(f'{kind} plan duplicates live sitemap path: {slug}')
        if slug not in candidate_map:
            raise RuntimeError(f'{kind} candidate is missing from the 100-topic source plan: {slug}')
        item = pack.enrich(candidate_map[slug], corpus, top_rows, kind)
        item['evidence'] = evidence_with_short_terms(item, corpus)
        refresh_scores(item, kind)
        item['plan_config'] = config
        item['priority_score'] = adjusted_score(item, config)
        item['source_impact_score'] = full_plan.impact_score(item, item['evidence'])
        selected.append(item)
    selected.sort(
        key=lambda row: (
            row['priority_score'],
            row['lead_score'],
            row['reach_score'],
            row['evidence'].get('volume', 0),
        ),
        reverse=True,
    )
    if len(selected) != 20:
        raise RuntimeError(f'Expected 20 {kind} items, found {len(selected)}')
    return selected


def wave_for(rank):
    if rank <= 5:
        return 'Wave 1'
    if rank <= 10:
        return 'Wave 2'
    if rank <= 15:
        return 'Wave 3'
    return 'Wave 4'


def evidence_values(item):
    evidence = item['evidence']
    confidence, note = demand_confidence(item)
    volume = int(evidence['volume']) if evidence.get('volume') else ''
    difficulty = int(evidence['difficulty']) if evidence.get('difficulty') else ''
    clicks = int(evidence['clicks']) if evidence.get('clicks') else ''
    return confidence, note, volume, difficulty, clicks


def external_sources(item):
    return ' | '.join(f'{name}: {url}' for name, url, _, _ in pack.external_profile(item))


def inbound_sources(item, kind):
    text = f"{item['cluster']} {item['title']}".lower()
    if kind == 'blog':
        if 'investment banking' in text or 'trade' in text or 'custody' in text or 'settlement' in text:
            return '/blog/, /career-guides/investment-banking-operations/, /career-guides/trade-lifecycle/'
        if 'payment' in text or 'upi' in text or 'chargeback' in text:
            return '/blog/, /courses/digital-payments/, /career-guides/digital-payments-operations/'
        if 'kyc' in text or 'aml' in text or 'transaction' in text:
            return '/blog/, /courses/kyc-aml/, /career-guides/kyc-aml-analyst/'
        return '/blog/, /courses/finance-operations/, /career-guides/finance-operations/'
    if item['slug'].startswith('/courses/'):
        return '/courses/, /india/, /faqs/finance-program/, relevant career guides'
    if item['slug'].startswith('/compare/'):
        return '/courses/, /career-guides/, related decision articles'
    if item['slug'].startswith('/career-guides/'):
        return '/career-guides/, /courses/, relevant role and workflow articles'
    return '/resources/, /courses/, relevant career guides and articles'


def page_rows(items):
    rows = []
    for rank, item in enumerate(items, 1):
        config = item['plan_config']
        evidence = item['evidence']
        confidence, confidence_note, volume, difficulty, clicks = evidence_values(item)
        title, description, h1, canonical = pack.metadata_for(item, 'page')
        links = pack.targets_for(item, 'page')
        competitor = item.get('competitor_page') or {}
        rows.append([
            rank,
            wave_for(rank),
            item['priority_score'],
            item['reach_score'],
            item['lead_score'],
            confidence,
            confidence_note,
            item['page_type'],
            item['title'],
            item['slug'],
            item['primary'],
            item['secondary'],
            item['intent'],
            evidence.get('keyword', ''),
            evidence.get('matched_term', ''),
            volume,
            difficulty,
            clicks,
            evidence.get('source', ''),
            competitor.get('Title', ''),
            int(competitor.get('Est Monthly SEO Clicks', 0)) if competitor else '',
            config['reason'],
            item['angle'],
            config['owner'],
            config['risk'],
            config['conflict'],
            item['offer'],
            item['cta'],
            title,
            description,
            h1,
            canonical,
            'index,follow',
            pack.schema_for(item, 'page'),
            pack.word_target(item, 'page'),
            inbound_sources(item, 'page'),
            ', '.join(f'{SITE}{path}' for path, _ in links),
            ' | '.join(anchor for _, anchor in links),
            external_sources(item),
            pack.authority_requirements(item, 'page'),
            'GSC impressions/clicks and query ownership; internal_pathway_click; lead_cta_click; qualified leads',
            item['guardrail'],
        ])
    return rows


def blog_rows(items):
    rows = []
    for rank, item in enumerate(items, 1):
        config = item['plan_config']
        evidence = item['evidence']
        confidence, confidence_note, volume, difficulty, clicks = evidence_values(item)
        title, description, h1, canonical = pack.metadata_for(item, 'blog')
        links = pack.targets_for(item, 'blog')
        competitor = item.get('competitor_page') or {}
        rows.append([
            rank,
            wave_for(rank),
            item['priority_score'],
            item['reach_score'],
            item['lead_score'],
            confidence,
            confidence_note,
            item['title'],
            item['slug'],
            item['cluster'],
            item['primary'],
            item['secondary'],
            item['intent'],
            evidence.get('keyword', ''),
            evidence.get('matched_term', ''),
            volume,
            difficulty,
            clicks,
            evidence.get('source', ''),
            competitor.get('Title', ''),
            int(competitor.get('Est Monthly SEO Clicks', 0)) if competitor else '',
            config['reason'],
            item['angle'],
            config['owner'],
            config['risk'],
            config['conflict'],
            item['module'],
            item['cta'],
            title,
            description,
            h1,
            canonical,
            'index,follow',
            pack.schema_for(item, 'blog'),
            1800,
            inbound_sources(item, 'blog'),
            ', '.join(f'{SITE}{path}' for path, _ in links),
            ' | '.join(anchor for _, anchor in links),
            '5-10 contextual links: pillar, course/module, related article, resource and one lead destination',
            external_sources(item),
            pack.authority_requirements(item, 'blog'),
            'GSC impressions/clicks and query coverage; internal_pathway_click; engaged sessions; assisted leads',
            item['guardrail'],
        ])
    return rows


def publishing_rows(pages, blogs):
    rows = []
    for wave_number in range(1, 5):
        start = (wave_number - 1) * 5
        end = start + 5
        wave_pages = pages[start:end]
        wave_blogs = blogs[start:end]
        rows.append([
            wave_number,
            f'Weeks {(wave_number - 1) * 2 + 1}-{wave_number * 2}',
            ' | '.join(f"{i + start + 1}. {item['title']}" for i, item in enumerate(wave_pages)),
            ' | '.join(f"{i + start + 1}. {item['title']}" for i, item in enumerate(wave_blogs)),
            'Freeze owner keywords and add inbound links before indexation; publish the pillar/role page before or with supporting blogs.',
            'Every URL passes metadata, self-canonical, schema, 200/indexability, content, source, internal-link and claim checks.',
            'Review GSC and GA4 after 28 days; make consolidation decisions after a comparable 56-day window.',
        ])
    return rows


def internal_link_rows(pages, blogs):
    rows = []
    for kind, items in (('Page', pages), ('Blog', blogs)):
        for rank, item in enumerate(items, 1):
            config = item['plan_config']
            rows.append([
                kind,
                rank,
                item['title'],
                item['slug'],
                inbound_sources(item, kind.lower()),
                config['owner'],
                'Contextual descriptive anchors; no repeated exact-match footer links.',
                '3-5 links for landing/career/resource pages; 5-10 links for blogs.',
                'Add links only after the surrounding section establishes relevance.',
            ])
    return rows


def quality_rows():
    return [
        ['Intent ownership', 'One primary intent and one self-canonical URL; compare against the current sitemap before build.', 'Every URL'],
        ['Title/meta', 'Unique 30-60 character title and 120-160 character description; primary topic early, no stuffing.', 'Every URL'],
        ['Depth', 'At least 900-1,200 useful words for pages and 1,800 words for blogs; original examples count more than filler.', 'Every URL'],
        ['Direct answer', 'Answer the main query in the introduction and use descriptive H2/H3 sections, lists and comparison tables.', 'Every URL'],
        ['E-E-A-T', 'Named author/reviewer, reviewed date, firsthand fictional workflow/example, primary sources and correction path.', 'Every URL'],
        ['Claims', 'Use only current approved Masterclass, module, delivery, fee, support and guarantee wording.', 'Every URL'],
        ['Schema', 'JSON-LD matching visible content: WebPage/Article or BlogPosting plus BreadcrumbList and Organization/Person where supported.', 'Before release'],
        ['FAQ', 'Visible maintained FAQs are allowed; do not treat FAQPage as a Google rich-result shortcut.', 'Where useful'],
        ['Internal links', 'Pages: 3-5 useful links. Blogs: 5-10 contextual links. Every new URL needs inbound links before indexation.', 'Every URL'],
        ['Images', 'Original or licensed image, descriptive alt, dimensions, responsive format and no text-heavy generic stock image.', 'Every URL'],
        ['Technical', '200 response, index,follow, self-canonical, trailing slash, sitemap/llms inclusion and prerendered content.', 'Before release'],
        ['Measurement', 'Test page_view, internal_pathway_click and lead_cta_click without query strings or personal data.', 'Before release'],
        ['Review gate', 'At 28/56 days, improve, consolidate or redirect overlapping URLs; do not keep weak duplicates live.', 'Post launch'],
    ]


def source_rows(relevant_top_rows):
    with TOP_PAGES.open('r', encoding='utf-8-sig', newline='') as handle:
        top_count = sum(1 for _ in csv.DictReader(handle))
    keywordi_rows = source.read_rows(KEYWORDI)
    competitor_rows = source.read_rows(COMPETITOR)
    spy_rows = source.read_rows(SPY)
    return [
        ['keywordi.xlsx', len(keywordi_rows), 'Keyword, volume, difficulty and click estimates.', 'Source-specific estimates; broad keywords are labelled as proxies when the planned query is narrower.'],
        ['Keyword Tool competitor export', len(competitor_rows), 'Competitor keyword volume, trend, bids and competition.', 'Contains unrelated topics; only finance/BFSI-relevant evidence is used.'],
        ['spy.xlsx', len(spy_rows), 'Keyword volume, ranking difficulty, rank, URL and SEO-click estimates.', 'Competitor performance is directional and is not a forecast for Centaur.'],
        ['Competitor top-pages CSV', top_count, 'Page-level competitor clicks and top-keyword patterns.', f'{len(relevant_top_rows)} finance/BFSI rows passed the relevance filter.'],
        ['Current Centaur sitemap', len(live_paths()), 'Canonical URLs already live in the deployment package.', 'All 40 proposed paths were checked against this set and are new.'],
        ['Planning rule', 40, '20 pages plus 20 supporting blogs.', 'Volumes are never summed across exports; rankings, traffic and leads are not guaranteed.'],
    ]


def main():
    required = [SITEMAP, TOP_PAGES, KEYWORDI, COMPETITOR, SPY]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise FileNotFoundError('Missing required planning sources: ' + ', '.join(missing))

    corpus = full_plan.compact_keyword_rows()
    relevant_top_rows = get_relevant_top_rows()
    pages = select_items(PAGE_CONFIG, full_plan.make_pages(), 'page', corpus, relevant_top_rows)
    blogs = select_items(BLOG_CONFIG, full_plan.make_blogs() + custom_blog_candidates(), 'blog', corpus, relevant_top_rows)

    summary = [
        ['Scope', 'The next 20 new pages and next 20 new blogs after the current 104-URL deployment package.'],
        ['Selection', 'Demand evidence + business relevance + lead intent + competitor page patterns, then manual canonical/cannibalization review.'],
        ['Volume rule', 'Observed volumes remain source-specific and are not summed. Broad supporting terms are labelled Proxy, not presented as exact query demand.'],
        ['Publishing model', 'Four waves; each wave publishes five pages and five supporting blogs over roughly two weeks.'],
        ['SEO quality', 'Pages target 900-1,200 useful words; blogs target 1,800 words with original examples, named review and primary sources.'],
        ['Commercial boundary', 'All commercial pages describe the existing Financial Operations Masterclass; no new standalone class or credential is implied.'],
        ['Regional boundary', 'No new city pages are in this wave because the supplied exports lack distinct city-level evidence and local proof.'],
        ['Risk boundary', 'Salary pages, CFA/FRM offer pages and duplicate high-volume topics remain held or consolidated.'],
        ['Outcome', 'This is a prioritized execution plan, not a ranking, traffic, lead or indexation guarantee.'],
    ]

    page_headers = [
        'Rank', 'Wave', 'Priority score', 'Reach score', 'Lead score', 'Demand confidence', 'Confidence note',
        'Page type', 'Page title', 'URL', 'Primary keyword', 'Secondary terms', 'Intent', 'Observed evidence keyword',
        'Matched evidence term', 'Observed source volume', 'Observed KD', 'Observed clicks', 'Evidence source',
        'Competitor top-page pattern', 'Competitor est. clicks', 'Why now', 'Content brief', 'Canonical parent/owner',
        'Cannibalization risk', 'Differentiation rule', 'Offer relationship', 'CTA', 'Title tag', 'Meta description', 'H1',
        'Canonical', 'Robots', 'Schema', 'Word target', 'Inbound link sources', 'Internal destinations', 'Anchor themes',
        'Primary external sources', 'E-E-A-T requirement', 'KPI', 'Claim/content guardrail',
    ]
    blog_headers = [
        'Rank', 'Wave', 'Priority score', 'Reach score', 'Lead score', 'Demand confidence', 'Confidence note',
        'Blog title', 'URL', 'Cluster', 'Primary keyword', 'Secondary terms', 'Intent', 'Observed evidence keyword',
        'Matched evidence term', 'Observed source volume', 'Observed KD', 'Observed clicks', 'Evidence source',
        'Competitor top-page pattern', 'Competitor est. clicks', 'Why now', 'Content angle', 'Canonical parent/owner',
        'Cannibalization risk', 'Differentiation rule', 'Course/module bridge', 'CTA', 'Title tag', 'Meta description',
        'H1', 'Canonical', 'Robots', 'Schema', 'Word target', 'Inbound link sources', 'Internal destinations',
        'Anchor themes', 'Internal link requirement', 'Primary external sources', 'E-E-A-T requirement', 'KPI',
        'Claim/content guardrail',
    ]
    sheets = [
        ('Executive Summary', 'Evidence-led next-wave plan after removing existing URLs, near-duplicate intents and unsupported offer claims.', ['Area', 'Decision'], summary),
        ('Next 20 Pages', 'New page opportunities ranked by adjusted demand, relevance, lead potential and cannibalization safety.', page_headers, page_rows(pages)),
        ('Next 20 Blogs', 'New supporting articles ranked after excluding topics already owned by a live canonical page.', blog_headers, blog_rows(blogs)),
        ('Publishing Sequence', 'Publish one connected page-and-blog cluster at a time; add inbound links before indexation.', ['Wave', 'Timing', 'Pages', 'Blogs', 'Build rule', 'Release acceptance', 'Measurement decision'], publishing_rows(pages, blogs)),
        ('Internal Link Map', 'Every proposed URL has an authority parent and an inbound-link requirement.', ['Type', 'Rank', 'Title', 'New URL', 'Recommended inbound sources', 'Primary authority destination', 'Anchor policy', 'Link count', 'Placement rule'], internal_link_rows(pages, blogs)),
        ('Held and Consolidated', 'High-volume ideas deliberately excluded to prevent duplication, weak-fit traffic or unsupported claims.', ['Topic', 'Decision', 'Existing owner / parent', 'Reason'], HELD_TOPICS),
        ('SEO Quality Gate', 'Mandatory content, technical, E-E-A-T and measurement standards for every planned URL.', ['Gate', 'Requirement', 'When'], quality_rows()),
        ('Source and Method', 'Audit trail for the supplied exports and current deployment package.', ['Source', 'Rows / URLs', 'Contribution', 'Limitation'], source_rows(relevant_top_rows)),
    ]
    workbook.write_workbook(sheets)
    print(f'Created {workbook.OUTPUT}')
    print(f'pages={len(pages)} blogs={len(blogs)} current_urls={len(live_paths())} corpus_rows={len(corpus)}')
    print('top_pages=' + ' | '.join(item['title'] for item in pages[:5]))
    print('top_blogs=' + ' | '.join(item['title'] for item in blogs[:5]))


if __name__ == '__main__':
    main()
