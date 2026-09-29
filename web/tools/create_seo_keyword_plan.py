import html
import re
import sys
import zipfile
from pathlib import Path

from analyze_keyword_sources import compact, is_relevant, normalize, read_rows


ROOT = Path(__file__).resolve().parents[1]
SOURCE_A = Path(r'C:\Users\Virat Singh\Downloads\Keyword Tool Export - Analyze Competitors - imarticus org.xlsx')
SOURCE_B = Path(r'C:\Users\Virat Singh\Downloads\spy.xlsx')
OUTPUT = ROOT / 'SEO_Keyword_Implementation_Plan_2026-09-27.xlsx'


def num(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def fmt(value):
    if value is None or value == '':
        return ''
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


def evidence(rows_a, rows_b, a_terms=(), b_terms=()):
    a_matches = [r for r in rows_a if normalize(r['keyword']) in {normalize(t) for t in a_terms}]
    b_matches = [r for r in rows_b if normalize(r['keyword']) in {normalize(t) for t in b_terms}]
    a_best = max(a_matches, key=lambda r: r['volume'], default=None)
    b_best = max(b_matches, key=lambda r: (r['volume'], -r.get('difficulty', 999)), default=None)
    return {
        'a_volume': fmt(a_best['volume']) if a_best else '',
        'a_evidence': f"{fmt(a_best['volume'])}: {a_best['keyword']} (trend {fmt(a_best['trend'])}, competition {fmt(a_best['competition'])})" if a_best else 'No exact matching row in Keyword Tool export',
        'b_volume': fmt(b_best['volume']) if b_best else '',
        'b_kd': fmt(b_best['difficulty']) if b_best else '',
        'b_evidence': f"{fmt(b_best['volume'])}: {b_best['keyword']} (KD {fmt(b_best['difficulty'])}, rank {fmt(b_best['rank'])})" if b_best else 'No exact matching row in spy export',
    }


def page(seq, wave, priority, action, page_type, url, primary, cluster, intent, fit, why, brief, title, description, h1, schema, hub, targets, status, a=(), b=(), confidence='Moderate', caution=''):
    return {
        'Sequence': seq,
        'Wave': wave,
        'Priority': priority,
        'Action': action,
        'Page type': page_type,
        'URL': url,
        'Primary keyword owner': primary,
        'Cluster': cluster,
        'Intent': intent,
        'Business fit': fit,
        'Why now': why,
        'Content brief': brief,
        'Meta title': title,
        'Meta description': description,
        'H1': h1,
        'Schema': schema,
        'Main hub': hub,
        'Priority links to add': targets,
        'Status': status,
        'Keyword Tool volume': '',
        'Keyword Tool evidence': '',
        'Spy volume': '',
        'Spy KD': '',
        'Spy evidence': '',
        'Data confidence': confidence,
        'Risk / guardrail': caution,
        '_a': a,
        '_b': b,
    }


def blog(seq, wave, priority, action, url, title, primary, cluster, intent, angle, volume_note, cta, internal_links, sources, status, caution='', a=(), b=()):
    return {
        'Sequence': seq,
        'Wave': wave,
        'Priority': priority,
        'Action': action,
        'URL': url,
        'Working title': title,
        'Primary keyword': primary,
        'Cluster': cluster,
        'Intent': intent,
        'Editorial angle': angle,
        'Volume / evidence': volume_note,
        'Conversion CTA': cta,
        'Internal links': internal_links,
        'Evidence / freshness': sources,
        'Status': status,
        'Guardrail': caution,
        '_a': a,
        '_b': b,
    }


def build_data():
    rows_a = [compact(r, 'competitor') for r in read_rows(SOURCE_A) if r.get('Keywords')]
    rows_b = [compact(r, 'spy') for r in read_rows(SOURCE_B) if r.get('Keyword')]
    relevant_a = [r for r in rows_a if is_relevant(r['keyword'])]
    relevant_b = [r for r in rows_b if is_relevant(r['keyword'])]
    unique_a = {normalize(r['keyword']) for r in relevant_a}
    unique_b = {normalize(r['keyword']) for r in relevant_b}

    pages = [
        page(1, 'Wave 1', 99, 'Refresh + consolidate', 'Commercial program hub', '/courses/', 'investment banking operations course', 'Investment banking / banking and finance courses', 'Transactional / BOFU', 'Very high', 'The largest relevant commercial cluster in the supplied files is investment banking courses (18,100 in the Keyword Tool export; 2,600 in spy).', 'Make one authoritative program page own course, classes, training, online, India, fees, curriculum, eligibility and module variants. Keep Investment Banking Operations as a module within the Financial Operations Masterclass.', 'Investment Banking Operations Course | Centaur Careers', 'Learn investment banking operations, settlements, reconciliation, KYC, payments and finance workflows in a six-week live program across India.', 'Investment Banking Operations Course and Financial Operations Masterclass', 'Course + Organization + BreadcrumbList', 'Home / commercial hub', 'Placements; India hub; six module pages; interview resource; choosing-a-course guide', 'Existing route; Wave 1', a=('investment banking courses', 'banking and investment courses', 'courses for banking and finance', 'investment banking operations course'), b=('investment banking courses',), confidence='Strong', caution='Do not create separate pages for courses/classes/training variants; consolidate them here.'),
        page(2, 'Wave 1', 98, 'Refresh + clarify terms', 'Conversion support page', '/placements/', 'finance course with job guarantee', 'Job guarantee / placement intent', 'Transactional / BOFU', 'Very high', 'Job and placement variants are commercially valuable: banking placement courses 720, investment banking courses with placement 480, finance course with placement 320 in the Keyword Tool export; banking course with placement 260 in spy.', 'Make eligibility, process, support, exclusions, location expectations, and written terms explicit. Link every money page to this page without overstating employer, salary, location or selection claims.', 'Finance Course With Job Guarantee | Centaur Careers', 'Read the published eligibility, process and conditions for Centaur Careers’ 100% Job Guarantee Program before enrolling.', '100% Job Guarantee Program: Eligibility, Process and Terms', 'WebPage + FAQPage only where visible FAQs are maintained', 'Courses / conversion hub', 'Courses; India; Lucknow; choosing-a-course guide; contact', 'Existing route; Wave 1', a=('banking placement courses', 'investment banking courses with placement', 'finance course with placement'), b=('banking course with placement',), confidence='Strong', caution='All guarantee language must match the current written terms and be reviewed before publishing.'),
        page(3, 'Wave 1', 97, 'Refresh + deepen', 'Career / knowledge pillar', '/career-guides/investment-banking-operations/', 'what is investment banking operations', 'Investment banking operations knowledge', 'Informational / career', 'Very high', 'Investment banking is a major information cluster in spy at 18,700 volume and KD 16; what is investment banking is 3,000 at KD 18.', 'Explain front-to-back operations, trade support, settlements, reconciliation, corporate actions, fund accounting, controls, teams, skills and entry routes. Distinguish operations from front-office work.', 'What Is Investment Banking Operations? | Centaur Careers', 'Understand investment banking operations, trade support, settlements, reconciliation, controls and entry-level career skills.', 'What Is Investment Banking Operations?', 'Article + BreadcrumbList + FAQPage if maintained', 'Investment banking module', 'Courses; trade lifecycle; interview questions; reconciliation; finance careers after graduation', 'Existing route; Wave 1', a=(), b=('investment banking', 'what is investment banking'), confidence='Strong', caution='Use original workflow explanations; do not copy competitor wording or imply guaranteed employer outcomes.'),
        page(4, 'Wave 1', 96, 'Refresh + narrow', 'Career / role pillar', '/career-guides/finance-operations/', 'finance operations career', 'Finance operations / GCC / analyst roles', 'Informational / career', 'Very high', 'Spy shows broad operations demand (operations management 13,400; operations 9,200), but those terms are broader than finance. Capture finance-operations modifiers and job intent instead of targeting “operations” alone.', 'Own finance operations analyst, finance operations jobs, process controls, reconciliations, reporting, lending, credit and risk support. Add role examples and a job-description reading framework.', 'Finance Operations Career: Roles, Skills and Entry Routes', 'Explore finance operations careers, analyst responsibilities, workflow skills and entry-level preparation across banking and financial services.', 'Finance Operations Careers for Graduates', 'Article + BreadcrumbList + FAQPage if maintained', 'Finance operations module', 'Courses; finance careers after graduation; KYC/AML; digital payments; India', 'Existing route; Wave 1', a=(), b=('operations management', 'operations'), confidence='Moderate', caution='Do not optimize this page for generic operations-management intent; keep finance/BFSI modifiers prominent.'),
        page(5, 'Wave 1', 95, 'Refresh + expand', 'Career / knowledge pillar', '/career-guides/kyc-aml-analyst/', 'what is KYC in banking', 'KYC / AML / compliance', 'Informational / career', 'Very high', 'The supplied exports do not contain a reliable KYC/AML row, but the topic is a published course module and current career direction.', 'Explain KYC, AML, CDD, EDD, screening, transaction monitoring, case notes, escalation and entry-level roles. Use authoritative regulatory sources and avoid legal advice.', 'KYC and AML Analyst Careers in Banking | Centaur Careers', 'Learn KYC, AML, customer due diligence, transaction monitoring and analyst skills for banking and financial-services roles.', 'KYC and AML Analyst Careers', 'Article + BreadcrumbList + FAQPage if maintained', 'KYC/AML module', 'KYC/AML course; finance operations; interview resource; India; contact', 'Existing route; Wave 1', confidence='Site-fit only', caution='Validate volume in Search Console/Keyword Planner; cite current regulatory sources and date-sensitive rules.'),
        page(6, 'Wave 1', 94, 'Refresh + CRO', 'Learning resource', '/resources/reconciliation-in-finance/', 'reconciliation meaning', 'Reconciliation / finance operations', 'Informational with career bridge', 'Very high', 'This is the strongest traffic opportunity in spy: reconciliation 40,700 KD 21 and reconciliation meaning 21,500 KD 20.', 'Improve the definition, types, bank/finance examples, break investigation, controls, sample workflow and interview link. Add a restrained course CTA after the answer, not above it.', 'Reconciliation Meaning in Finance: Process, Types and Example', 'Learn what reconciliation means in finance, how breaks are investigated and why the workflow matters in banking operations.', 'What Is Reconciliation in Finance?', 'Article + BreadcrumbList + LearningResource', 'Resources hub', 'Investment banking operations; trade lifecycle; accounting basics; interview questions; courses', 'Existing route; Wave 1', a=('reconciliation meaning',), b=('reconciliation', 'reconciliation meaning'), confidence='Strong', caution='Keep the page useful for informational searchers; do not turn it into a thin sales page.'),
        page(7, 'Wave 1', 93, 'Refresh + CRO', 'Interview resource', '/resources/investment-banking-interview-questions/', 'investment banking interview questions', 'Interview / employability', 'Informational / job intent', 'Very high', 'Spy shows investment banking interview questions at 1,000 volume and KD 8, plus finance interview questions at 1,100.', 'Add role-specific questions, answer frameworks, trade lifecycle/reconciliation/KYC scenarios, self-scoring rubric and a clear next step to the course or career guide.', 'Investment Banking Interview Questions for Freshers | Centaur Careers', 'Practise investment banking operations interview questions for freshers with workflow examples, answer frameworks and self-review prompts.', 'Investment Banking Operations Interview Questions for Freshers', 'LearningResource + BreadcrumbList + FAQPage if maintained', 'Resources hub', 'Courses; IB operations guide; trade lifecycle; reconciliation; finance careers', 'Existing route; Wave 1', a=(), b=('investment banking interview questions', 'finance interview questions'), confidence='Strong', caution='Do not publish fabricated employer questions; label examples as practice prompts.'),
        page(8, 'Wave 1', 92, 'Refresh + differentiate', 'Graduate decision guide', '/career-guides/choosing-finance-career-course/', 'investment banking course with placement support', 'Course comparison / fees / fit', 'Commercial investigation', 'Very high', 'The supplied files show investment banking courses fees at 1,600, best financial course at 1,300, investment banking courses with placement at 480 and finance course with placement at 320.', 'Compare syllabus, duration, practice, credential wording, support terms, delivery, fees and role fit. Do not create a “best” claim without a transparent comparison method.', 'How to Choose a Finance Career Course | Centaur Careers', 'Compare finance-course scope, practical learning, interview preparation, credentials and written support terms before choosing a path.', 'How to Choose a Finance Career Course', 'Article + BreadcrumbList + FAQPage if maintained', 'Courses / comparison hub', 'Courses; placements; finance careers after graduation; comparison page; contact', 'Existing route; Wave 1', a=('investment banking courses fees', 'best financial course', 'investment banking courses with placement', 'finance course with placement'), b=(), confidence='Strong', caution='Do not use “best” as an unsupported claim; publish comparison criteria and dated evidence.'),
        page(9, 'Wave 1', 91, 'Refresh + validate', 'National access hub', '/india/', 'investment banking operations course India', 'India-wide online access', 'Commercial / regional', 'High', 'India variants appear in the Keyword Tool export: fintech courses in India 590, investment banker course in India 320 and financial analyst course in India 260. The current site publishes live online access across India.', 'Make the India page the canonical national access hub. Explain one masterclass, online delivery, Lucknow in-person option, modules, role research and links to selected regional guides.', 'Online Finance Course Across India | Centaur Careers', 'Join the Financial Operations Masterclass live online across India and compare banking, finance operations, KYC, payments and FinTech pathways.', 'Financial Operations Masterclass: Live Online Across India', 'WebPage + BreadcrumbList + FAQPage if maintained', 'National regional hub', 'All regional guides; courses; placements; career guides; Lucknow', 'Existing route; Wave 1', a=('fintech courses in india', 'investment banker course in india', 'financial analyst course in india'), b=('cfa in india', 'investment banks in india'), confidence='Moderate', caution='Do not imply a network of physical centres; keep provider-specific access separate from job-market research.'),
        page(10, 'Wave 1', 90, 'Refresh + local CRO', 'Real local page', '/locations/lucknow/', 'investment banking course in Lucknow', 'Lucknow local acquisition', 'Transactional / local', 'Very high', 'Lucknow is the published in-person location and should be the only physical-location page with local business claims unless new evidence is approved.', 'Add NAP, venue evidence, learning mode, current cohort question, local access, course scope and contact conversion. Keep local schema accurate.', 'Finance and Investment Banking Course in Lucknow | Centaur Careers', 'Explore the Financial Operations Masterclass, live online access and published in-person sessions at Mindsprout Career Hub in Lucknow.', 'Finance and Investment Banking Course in Lucknow', 'LocalBusiness/Organization + Course + BreadcrumbList', 'India hub / local hub', 'Courses; placements; contact; India; relevant career guides', 'Existing route; Wave 1', confidence='Site-fit only', caution='Do not create city doorway variants around Lucknow neighbourhoods without distinct, useful local evidence.'),
        page(11, 'Wave 2', 89, 'Refresh + consolidate', 'Graduate career pillar', '/career-guides/finance-careers-after-graduation/', 'best finance course after BCom', 'Graduate / fresher career paths', 'Informational / commercial', 'High', 'Existing keyword strategy marks this as a 62-keyword graduate-intent pillar. Use the supplied finance-course and placement terms only as supporting evidence.', 'Map BCom/BBA graduate routes to finance operations, banking, KYC/AML, payments and FinTech. Include decision criteria and employer-description research, not generic promises.', 'Finance Careers After Graduation: Courses, Roles and Skills', 'Compare finance career paths after graduation, role requirements and practical ways to prepare for banking and finance jobs.', 'Finance Careers After Graduation', 'Article + BreadcrumbList + FAQPage if maintained', 'Career guides hub', 'Choosing-a-course; courses; interview resource; role guides; India', 'Existing route; Wave 2', a=('banking placement courses', 'finance course with placement'), b=(), confidence='Moderate', caution='Do not make salary or placement claims without current, sourced and approved evidence.'),
        page(12, 'Wave 2', 88, 'Refresh + expand', 'Post-trade career pillar', '/career-guides/trade-lifecycle/', 'trade lifecycle in investment banking', 'Trade lifecycle / settlement / controls', 'Informational / job intent', 'High', 'The current site curriculum explicitly covers settlements and reconciliation; this page can convert high-intent workflow learners without pretending to be a generic investment-bank page.', 'Build a front-to-back lifecycle with trade capture, confirmation, settlement, reconciliation, exceptions, ownership and interview prompts. Link to the worked settlement case.', 'Trade Lifecycle in Investment Banking: Steps and Operations Roles', 'Follow the trade lifecycle from execution to settlement, reconciliation and exception handling with finance-operations examples.', 'Trade Lifecycle in Investment Banking', 'Article + BreadcrumbList + LearningResource', 'Investment banking module', 'Courses; settlement case; reconciliation; interview resource; Mumbai guide', 'Existing route; Wave 2', confidence='Site-fit only', caution='Use fictional examples and define where the page differs from front-office investment banking.'),
        page(13, 'Wave 2', 87, 'Refresh all five', 'Regional guide set', '/india/bengaluru/; /india/mumbai/; /india/delhi-ncr/; /india/pune/; /india/hyderabad/', 'investment banking course in [city]', 'Regional finance-career access', 'Local / commercial investigation', 'High', 'Regional keyword evidence is uneven but actionable: Mumbai 590, Bengaluru 480, Pune 390, Hyderabad 170, Delhi 140 in the Keyword Tool export. Spy also shows Bengaluru 155 for the same cluster.', 'Preserve one page per existing region. Add unique local hiring-market evidence, exact online/in-person distinction, role signals, employer-posting research steps, and city-specific FAQs.', 'Investment Banking Course in [City] | Online Career Guide', 'Study the Financial Operations Masterclass live online from [city] and research finance operations, banking and FinTech roles by workflow.', 'Finance Operations in [City]: Online Course and Career Guide', 'WebPage + BreadcrumbList + FAQPage if maintained', 'India hub', 'India hub; courses; city-specific guide; relevant role guide; contact', 'Existing five routes; Wave 2', a=('investment banking courses in mumbai', 'investment banking courses in bangalore', 'investment banking courses in pune', 'investment banking courses in hyderabad', 'investment banking courses in delhi'), b=('investment banking courses in bangalore',), confidence='Strong', caution='No doorway-page expansion beyond the existing five without unique research, access information and measurable demand.'),
        page(14, 'Wave 2', 86, 'Refresh + add module bridge', 'KYC / AML module', '/courses/kyc-aml/', 'KYC AML course', 'KYC / AML training', 'Commercial / module', 'High', 'This page is part of the existing approved architecture and matches the published curriculum, but supplied exports do not provide trustworthy volume for the cluster.', 'Clarify that KYC/AML is a module in one masterclass, list workflow coverage and link to the analyst guide, interview resource and national/regional pages.', 'KYC AML Course and Banking Compliance Module | Centaur Careers', 'Explore KYC, AML, due diligence and transaction-monitoring topics within the Financial Operations Masterclass.', 'KYC / AML Compliance Module', 'Course + BreadcrumbList', 'Courses hub', 'KYC/AML guide; interview resource; placements; India; contact', 'Existing route; Wave 2', confidence='Site-fit only', caution='Validate the cluster in first-party Search Console before forecasting traffic.'),
        page(15, 'Wave 2', 85, 'Refresh + add module bridge', 'Digital payments career guide', '/career-guides/digital-payments-operations/', 'digital payment operations', 'Payments / UPI / reconciliation', 'Informational / career', 'High', 'The current course page names SWIFT, RTGS, UPI/IMPS operations, disputes and wallet reconciliation as curriculum topics.', 'Explain payment-status flows, disputes, reconciliation, exceptions, controls and role skills. Use NPCI/RBI or other primary sources for current system facts.', 'Digital Payments Operations Careers for Graduates | Centaur Careers', 'Learn digital payments operations, reconciliation, disputes and workflow skills for banking and FinTech roles.', 'Digital Payments Operations Careers', 'Article + BreadcrumbList + FAQPage if maintained', 'Digital payments module', 'Digital payments module; reconciliation; fintech guide; interview resource; India', 'Existing route; Wave 2', confidence='Site-fit only', caution='Avoid outdated payment-process claims; date every current-statistic section.'),
        page(16, 'Wave 3', 84, 'Refresh + add module bridge', 'Retail banking career guide', '/career-guides/retail-banking-operations/', 'retail banking operations meaning', 'Retail banking / branch / lending', 'Informational / career', 'High', 'Spy shows retail banking at 3,100 volume and KD 14. The current curriculum includes retail banking, branch operations and loan officer work.', 'Explain retail-banking operations, service workflows, lending hand-offs, NRI banking context and entry-level role skills. Link to the commercial bank blog.', 'Retail Banking Operations: Meaning, Roles and Career Path', 'Understand retail banking operations, branch workflows, lending support and entry-level banking career skills.', 'Retail Banking Operations: Meaning and Careers', 'Article + BreadcrumbList + FAQPage if maintained', 'Retail banking module', 'Retail banking module; commercial bank blog; finance careers; interview resource', 'Existing route; Wave 3', b=('retail banking',), confidence='Strong', caution='Do not imply bank employment or guarantee a particular banking role.'),
        page(17, 'Wave 3', 83, 'Refresh + add module bridge', 'FinTech career guide', '/career-guides/fintech-operations/', 'fintech career for BCom graduates', 'FinTech / neo-banking / product ops', 'Informational / career', 'Medium-high', 'The Keyword Tool export contains fintech courses 3,600 and fintech courses in India 590; the current program explicitly teaches FinTech & Neo-Banking as a module.', 'Own the graduate/job angle: onboarding, digital lending, payment support, product operations, controls and compliance. Explain that FinTech is a broad sector, not one job.', 'FinTech Operations Careers for Graduates | Centaur Careers', 'Learn what FinTech operations teams do and how commerce graduates can explore digital finance, payments and compliance workflows.', 'FinTech Operations Careers for Graduates', 'Article + BreadcrumbList + FAQPage if maintained', 'FinTech module', 'FinTech module; digital payments; finance operations; India; interview resource', 'Existing route; Wave 3', a=('fintech courses', 'fintech courses in india'), b=('neo banking',), confidence='Moderate', caution='Keep regulation and product facts current; do not call every fintech product a bank.'),
        page(18, 'Wave 3', 82, 'Refresh + consolidate', 'High-volume accounting resource', '/resources/accounting-basics/', 'golden rules of accounting', 'Accounting foundations', 'Informational / learning', 'Medium-high', 'Spy shows golden rules of accounting at 12,300 KD 14 and accounting rules at 2,700 KD 13; use this as top-of-funnel for finance operations learners.', 'Strengthen examples, controls and finance-operations application; link to accounting interview questions, reconciliation, trial balance and course pages.', 'Golden Rules of Accounting: Examples for Finance Beginners', 'Learn the golden rules of accounting with clear examples and connect accounting fundamentals to finance operations work.', 'Golden Rules of Accounting', 'LearningResource + BreadcrumbList', 'Resources hub', 'Reconciliation; accounting interview questions; finance operations; courses', 'Existing route; Wave 3', b=('golden rules of accounting', 'accounting rules'), confidence='Strong', caution='Keep examples original and educational; do not let accounting traffic overwhelm the job-oriented site architecture.'),
        page(19, 'Wave 3', 81, 'Refresh + consolidate', 'Retail banking module', '/courses/retail-banking/', 'retail banking operations course', 'Retail banking training', 'Commercial / module', 'Medium-high', 'The module exists in the current route architecture and can capture course modifiers around the 3,100 retail-banking information cluster.', 'Position as a module within the masterclass, not a standalone external banking certification. Add curriculum, access, career guide and interview links.', 'Retail Banking Operations Course | Centaur Careers', 'Explore retail banking, branch operations, loan officer and NRI banking topics within the Financial Operations Masterclass.', 'Retail Banking Operations Module', 'Course + BreadcrumbList', 'Courses hub', 'Retail banking guide; commercial bank blog; placements; India', 'Existing route; Wave 3', b=('retail banking',), confidence='Moderate', caution='Do not create separate pages for branch banking, loan officer and NRI banking until demand and content depth justify them.'),
        page(20, 'Wave 3', 80, 'Refresh + consolidate', 'Digital payments module', '/courses/digital-payments/', 'digital payments course', 'Digital payments training', 'Commercial / module', 'Medium-high', 'Published curriculum covers SWIFT, RTGS, UPI/IMPS operations, disputes and wallet reconciliation.', 'Own course/training/certification variants on one module page and link to the payments career guide and reconciliation resource.', 'Digital Payments Course and Operations Module | Centaur Careers', 'Study digital payments operations, disputes and reconciliation as part of the Financial Operations Masterclass.', 'Digital Payments Module', 'Course + BreadcrumbList', 'Courses hub', 'Payments career guide; reconciliation; FinTech guide; placements', 'Existing route; Wave 3', confidence='Site-fit only', caution='Do not claim an external payments certification unless one exists and is documented.'),
        page(21, 'Wave 3', 79, 'Refresh + consolidate', 'FinTech module', '/courses/fintech/', 'fintech course for graduates', 'FinTech training', 'Commercial / module', 'Medium', 'FinTech course variants are visible in the Keyword Tool export, but the cluster is less directly job-conversion focused than the core course and role pages.', 'Explain module scope, digital lending, product operations, compliance analyst work and customer success without creating a false standalone credential.', 'FinTech Course for Graduates | Centaur Careers', 'Explore FinTech and neo-banking operations topics within the Financial Operations Masterclass.', 'FinTech and Neo-Banking Module', 'Course + BreadcrumbList', 'Courses hub', 'FinTech career guide; digital payments; finance operations; India', 'Existing route; Wave 3', a=('fintech courses', 'fintech courses in india'), b=(), confidence='Moderate', caution='Keep the page subordinate to core course and career pages until first-party demand proves otherwise.'),
        page(22, 'Wave 4', 74, 'Refresh with proof', 'Comparison guide', '/compare/investment-banking-operations-courses/', 'investment banking course comparison', 'Competitor comparison / selection', 'Commercial investigation', 'Medium-high', 'Competitor keyword data supports comparison intent, but the source export alone cannot support claims about competitors’ current fees, outcomes or curriculum.', 'Compare transparent criteria: workflow scope, mode, duration, assessment, certificate wording, support terms and evidence. Use source dates and link to official pages.', 'Investment Banking Operations Course Comparison | Centaur Careers', 'Compare investment banking operations course scope, delivery, practice, credentials and support terms using a transparent framework.', 'How to Compare Investment Banking Operations Courses', 'Article + BreadcrumbList', 'Courses / comparison hub', 'Courses; choosing-a-course; placements; contact', 'Existing route; Wave 4', confidence='Site-fit only', caution='No unsupported competitor claims, rankings, trademark stuffing or copied page structures.'),
    ]

    for row in pages:
        e = evidence(rows_a, rows_b, row.pop('_a'), row.pop('_b'))
        row.update({
            'Keyword Tool volume': e['a_volume'],
            'Keyword Tool evidence': e['a_evidence'],
            'Spy volume': e['b_volume'],
            'Spy KD': e['b_kd'],
            'Spy evidence': e['b_evidence'],
        })

    regional = [
        ['1', 'Existing local page', '/locations/lucknow/', 'Lucknow', 'investment banking course in Lucknow', '', '', 'Actual in-person location; maintain strongest local proof, NAP and conversion path.', 'Refresh first; do not clone into neighbourhood URLs.'],
        ['2', 'Existing regional guide', '/india/mumbai/', 'Mumbai', 'investment banking course in Mumbai', 590, 77, 'Highest supplied city volume; keep online-guide framing and city-specific finance-market evidence.', 'Refresh in Wave 2; no Mumbai classroom claim.'],
        ['3', 'Existing regional guide', '/india/bengaluru/', 'Bengaluru / Bangalore', 'investment banking course in Bangalore', 480, 71, 'Second-highest city volume; preserve Bangalore keyword variant while using Bengaluru entity naming.', 'Refresh in Wave 2; no Bangalore classroom claim.'],
        ['4', 'Existing regional guide', '/india/pune/', 'Pune', 'investment banking course in Pune', 390, 65, 'Relevant city demand and existing route; add role/workflow evidence.', 'Refresh in Wave 2; no Pune classroom claim.'],
        ['5', 'Existing regional guide', '/india/hyderabad/', 'Hyderabad', 'investment banking course in Hyderabad', 170, 60, 'Lower volume but existing page and finance/GCC relevance.', 'Refresh in Wave 2; no Hyderabad classroom claim.'],
        ['6', 'Existing regional guide', '/india/delhi-ncr/', 'Delhi-NCR', 'investment banking course in Delhi', 140, 63, 'Existing route; use Delhi, Gurugram and Noida distinctions rather than a doorway page.', 'Refresh in Wave 2; no Delhi classroom claim.'],
        ['7', 'National hub', '/india/', 'India', 'investment banking operations course India', 590, '', 'Use as canonical national access and regional navigation hub; do not duplicate city copy.', 'Refresh in Wave 1.'],
        ['8', 'Hold candidate', 'No new route', 'Chennai', 'investment banking courses in Chennai', 390, 56, 'Demand exists in the export, but no current route or distinct approved local evidence is in scope.', 'Do not publish yet; add only after unique research, access proof and conversion need.'],
        ['9', 'Hold candidate', 'No new route', 'Kolkata', 'investment banking courses in Kolkata', 30, 61, 'Low supplied volume and no current route; India hub is the safer destination.', 'Do not publish; review after Search Console evidence.'],
    ]

    keyword_signals = []
    signal_defs = [
        ('Investment banking courses', 'Commercial', '18,100 A / 2,600 B', '65 A / 9 B', 'Core program hub', 'Build/refresh /courses/; consolidate course/classes/training variants.', 'Very high'),
        ('Courses for banking and finance', 'Commercial', '5,400 A / not exact B', '46 A / not exact B', 'Core program hub', 'Secondary cluster on /courses/; do not create a separate generic page.', 'High'),
        ('Financial analyst course', 'Commercial adjacent', '8,100 A / 1,600 B', '67 A / 12 B', 'Validate only', 'Do not target as a product until the actual curriculum and offer support it; use finance operations/analyst wording carefully.', 'Medium'),
        ('FinTech courses', 'Module / career', '3,600 A / not exact B', '48 A / not exact B', 'FinTech pages', 'Use module and graduate-career pages; keep claims bounded to the published curriculum.', 'Medium-high'),
        ('Reconciliation', 'Editorial / career bridge', 'not exact A / 40,700 B', 'not exact A / 21 B', 'Resource + course bridge', 'Refresh reconciliation resource with a strong but restrained operations CTA.', 'Very high'),
        ('Risk management', 'Editorial / role support', 'not exact A / 19,700 B', 'not exact A / 8 B', 'Finance operations guide/blog', 'Build a sourced banking-risk explainer only if content depth and current evidence are available.', 'High'),
        ('Investment banking', 'Editorial / career', 'not exact A / 18,700 B', 'not exact A / 16 B', 'IB guide + blog', 'Separate broad definition, operations career and course intent across distinct owners.', 'Very high'),
        ('Accounting foundations', 'Editorial / top-of-funnel', 'not exact A / 12,300 B', 'not exact A / 14 B', 'Accounting resource', 'Keep as an acquisition feeder; interlink to reconciliation, interview and finance operations.', 'High'),
        ('Financial markets', 'Editorial', 'not exact A / 7,700 B', 'not exact A / 17 B', 'Blog', 'Use a market-participant explainer that links to trade lifecycle and operations, not a generic finance portal.', 'Medium-high'),
        ('Retail banking', 'Module / career', 'not exact A / 3,100 B', 'not exact A / 14 B', 'Retail banking pages', 'Refresh current module and guide; avoid branch-level doorway expansion.', 'Medium-high'),
        ('Investment banking salary', 'Editorial / time-sensitive', 'not exact A / 1,900 B', 'not exact A / 14 B', 'Blog only', 'Publish only with dated Indian sources and careful non-guarantee wording.', 'Medium'),
        ('Investment banking interviews', 'Job intent', 'not exact A / 1,000 B', 'not exact A / 8 B', 'Interview resource', 'High conversion support; use practice questions and answer rubrics, not fabricated employer claims.', 'High'),
        ('Regional investment banking course', 'Regional', 'Mumbai 590; Bengaluru 480; Pune 390; Hyderabad 170; Delhi 140 A', 'Bengaluru 155 B', 'Existing regional guides', 'Refresh five existing pages and Lucknow; do not mass-create city pages.', 'High'),
        ('Financial modelling course', 'Adjacent / excluded', '18,100 A / 3,200 B for related modelling term', '67 A / 15 B', 'Hold / comparison only', 'Not a published Centaur course; do not make it a primary acquisition cluster without a real offer.', 'Low'),
        ('CFA / FRM', 'Credential / excluded', 'not in A for exact top rows / 76,000 CFA and 18,300 FRM B', '13 CFA / 9 FRM B', 'Exclude as core', 'Do not build credential pages that imply CFA/FRM delivery or recognition; use one comparison explainer only if expert-reviewed.', 'Low'),
    ]
    for name, cluster, volume, kd, owner, decision, impact in signal_defs:
        keyword_signals.append([name, cluster, volume, kd, owner, decision, impact])

    blog_rows = [
        blog(1, 'Wave 2', 96, 'Refresh existing', '/blog/balance-sheet-meaning-format-example/', 'Balance Sheet Meaning, Format and a Worked Finance Example', 'balance sheet', 'Accounting / finance foundations', 'Informational', 'Retain broad reach, then connect the example to finance operations controls, reporting and interview preparation.', 'Current queue: 60,500 volume / KD 63', 'Finance operations career guide', 'Accounting basics; reconciliation; accounting interview questions; courses', 'Use a fictional example; review accounting accuracy.', 'Existing post; Wave 2', a=(), b=()),
        blog(2, 'Wave 2', 95, 'Refresh existing', '/blog/trial-balance-format-errors-reconciliation/', 'Trial Balance: Format, Errors and Reconciliation Checks', 'trial balance', 'Accounting / reconciliation', 'Informational', 'Own trial-balance format and error-check intent, then move readers to reconciliation and finance operations.', 'Current queue: 33,100 volume / KD 49', 'Reconciliation resource', 'Accounting basics; reconciliation; accounting interview questions', 'Use fictional records and clear limitations; no copied examples.', 'Existing post; Wave 2'),
        blog(3, 'Wave 2', 94, 'Refresh existing', '/blog/cost-accounting-methods-examples/', 'Cost Accounting Methods and a Worked Allocation Example', 'cost accounting', 'Accounting / management finance', 'Informational', 'Serve a broad finance learner while linking to finance operations and accounting fundamentals.', 'Current queue: 22,200 volume / KD 29; spy cost and management accounting 2,200 / KD 5', 'Finance operations career guide', 'Accounting basics; financial accounting; courses', 'Use original calculations and source accounting definitions.', 'Existing post; Wave 2', b=('cost and management accounting',)),
        blog(4, 'Wave 1', 93, 'Refresh existing', '/blog/investment-banking-teams-operations/', 'Investment Banking Teams: Front Office, Middle Office and Operations', 'investment banking', 'Investment banking / operations', 'Informational / career', 'Define the sector and map the reader to operations, settlements, controls and relevant course/career pages.', 'Current queue: 33,100 volume / KD 57; spy investment banking 18,700 / KD 16', 'Investment banking operations guide', 'Courses; IB operations guide; trade lifecycle; reconciliation', 'Use original team map and clearly distinguish operations from front office.', 'Existing post; Wave 1', b=('investment banking',)),
        blog(5, 'Wave 2', 92, 'Refresh existing', '/blog/commercial-banks-services-operations/', 'Commercial Banks: Services, Operations and Entry-Level Roles', 'commercial bank', 'Banking / retail banking', 'Informational / career', 'Capture broad banking demand and bridge to retail banking operations, lending, payments and KYC.', 'Current queue: 18,100 volume / KD 50', 'Retail banking career guide', 'Retail banking; finance careers; interview resource', 'Use current authoritative banking definitions; date any industry data.', 'Existing post; Wave 2'),
        blog(6, 'Wave 2', 91, 'Refresh existing', '/blog/financial-accounting-statements-process-examples/', 'Financial Accounting: Statements, Process and a Worked Example', 'financial accounting', 'Accounting / finance operations', 'Informational', 'Capture foundation searches and show the accounting cycle’s relevance to reconciliations and reporting.', 'Current queue: 14,800 volume / KD 28; spy financial accounting 4,800 / KD 16', 'Accounting interview resource', 'Accounting basics; reconciliation; finance operations guide', 'Use a fictional transaction and verify accounting treatment.', 'Existing post; Wave 2', b=('financial accounting',)),
        blog(7, 'Wave 2', 90, 'Refresh existing', '/blog/financial-markets-instruments-participants-operations/', 'Financial Markets: Instruments, Participants and Operations', 'financial market', 'Markets / trade lifecycle', 'Informational', 'Build market vocabulary that leads into post-trade and operations, not investment advice.', 'Current queue: 12,100 volume / KD 50; spy financial market 7,700 / KD 17', 'Trade lifecycle guide', 'Trade lifecycle; IB operations; financial GK; courses', 'Educational only; no investment recommendations.', 'Existing post; Wave 2', b=('financial market',)),
        blog(8, 'Wave 2', 89, 'Refresh existing', '/blog/financial-management-decisions-controls/', 'Financial Management: Decisions, Planning and Controls', 'financial management', 'Finance management / controls', 'Informational', 'Connect broad finance management concepts to risk, reporting, working capital and operations roles.', 'Current queue: 14,800 volume / KD 53; spy scope of financial management 2,300 / KD 12', 'Finance operations career guide', 'Finance operations; accounting; financial markets', 'Use current, sourced definitions and separate education from advice.', 'Existing post; Wave 2', b=('scope of financial management',)),
        blog(9, 'Wave 1', 88, 'Create or consolidate', '/blog/finance-interview-questions-freshers/', 'Finance Interview Questions for Freshers: Answer Framework and Rubric', 'finance interview questions', 'Interview / employability', 'Informational / job intent', 'Broaden the existing resource to cross-role finance questions while preserving the investment-banking-specific resource as the owner of that narrower intent.', 'Current queue: 12,100 volume / KD 29; spy finance interview questions 1,100 / KD 14', 'Courses or interview resource', 'Interview resource; finance careers; role guides; courses', 'Separate from investment banking operations interview questions; use practice prompts.', 'Existing post; Wave 1', b=('finance interview questions',)),
        blog(10, 'Wave 3', 87, 'Create', '/blog/risk-management-in-banking/', 'Risk Management in Banking: Types, Controls and Entry-Level Roles', 'risk management in banking', 'Risk / banking operations', 'Informational / career', 'Use the strong low-KD risk signal to support finance operations, credit and controls pathways.', 'Spy risk management 19,700 / KD 8; credit risk management 2,000 / KD 8', 'Finance operations guide', 'Finance operations; credit/risk module; interview resource', 'Cite current RBI/official sources where describing regulation; distinguish education from advice.', 'New post; Wave 3', b=('risk management', 'credit risk management'), caution='Time-sensitive controls and regulations require source dates.'),
        blog(11, 'Wave 3', 86, 'Create', '/blog/investment-banking-salary-in-india/', 'Investment Banking Salary in India: How to Research Roles Responsibly', 'investment banker salary in India', 'Career research / salary', 'Informational / high sensitivity', 'Capture salary intent with role, location, experience and source caveats, then guide users to skill and role pages.', 'Spy investment banker salary 1,900 / KD 14; investment banking salary in India 1,400 / KD 19', 'Finance careers after graduation', 'IB operations guide; finance careers; interview resource; courses', 'Use dated public sources; do not promise salary or imply course outcomes.', 'New post; Wave 3', b=('investment banker salary', 'investment banking salary in india'), caution='Refresh regularly and never present a salary range as a Centaur guarantee.'),
        blog(12, 'Wave 3', 85, 'Create', '/blog/investment-banks-in-india/', 'Investment Banks in India: Functions, Teams and Operations Roles', 'investment banks in India', 'Investment banking / employers', 'Informational / career', 'Answer employer/industry research intent, then explain that operations roles exist across banks, service providers and financial institutions.', 'Spy investment banks in India 1,900 / KD 11; investment banking companies in India 1,100 / KD 13', 'Investment banking operations guide', 'IB guide; trade lifecycle; finance careers; courses', 'Verify current company facts from official sources; avoid implying hiring or partnership.', 'New post; Wave 3', b=('investment banks in india', 'investment banking companies in india'), caution='Do not list a company as a hiring partner unless the relationship is approved and current.'),
        blog(13, 'Wave 3', 84, 'Create', '/blog/retail-banking-meaning-operations/', 'Retail Banking: Meaning, Services and Operations Careers', 'retail banking', 'Retail banking / banking basics', 'Informational / career', 'Capture 3,100-volume topic and route readers to the existing retail module and career guide.', 'Spy retail banking 3,100 / KD 14', 'Retail banking module', 'Retail banking guide; commercial bank blog; finance careers', 'Use current banking definitions; avoid product advice.', 'New post; Wave 3', b=('retail banking',)),
        blog(14, 'Wave 3', 83, 'Refresh existing', '/blog/fund-accounting-nav-workflow-career-skills/', 'Fund Accounting and NAV: Workflow, Checks and Career Skills', 'fund accounting', 'Fund accounting / operations', 'Informational / career', 'Connect a 1,700-volume operations topic to investment banking operations, reconciliation and role preparation.', 'Spy fund accounting 1,700 / KD 11', 'Investment banking operations guide', 'Reconciliation; IB guide; interview resource; courses', 'Use a fictional NAV/check example and disclose assumptions.', 'Existing post; Wave 3', b=('fund accounting',)),
        blog(15, 'Wave 1', 82, 'Do not duplicate; refresh resource', '/resources/reconciliation-in-finance/', 'Reconciliation Meaning in Finance: Process, Types and Example', 'reconciliation meaning', 'Reconciliation / career bridge', 'Informational', 'The supplied spy file gives this topic more demand than any other directly relevant workflow; keep one canonical owner.', 'Spy reconciliation 40,700 / KD 21; reconciliation meaning 21,500 / KD 20', 'Finance operations course', 'IB operations; trade lifecycle; accounting basics; interview resource', 'Refresh canonical resource; do not publish a second reconciliation blog.', 'Existing resource; Wave 1', b=('reconciliation', 'reconciliation meaning'), caution='Avoid keyword cannibalization with settlement and accounting pages.'),
    ]
    for row in blog_rows:
        e = evidence(rows_a, rows_b, row.pop('_a'), row.pop('_b'))
        if e['a_volume'] or e['b_volume']:
            row['Keyword Tool / Spy detail'] = f"A volume {e['a_volume'] or 'n/a'}; B volume {e['b_volume'] or 'n/a'}; B KD {e['b_kd'] or 'n/a'}"
        else:
            row['Keyword Tool / Spy detail'] = row.pop('Volume / evidence')

    internal = [
        ['Home', '/', 'Courses', '/courses/', 'Investment banking operations course', 'Primary commercial hand-off', 'High', 'Add in hero/supporting sections and footer.'],
        ['Home', '/', 'Placements', '/placements/', '100% Job Guarantee Program terms', 'High-intent conversion support', 'High', 'Use terms-qualified label.'],
        ['Home', '/', 'Career guides', '/career-guides/', 'Finance operations career guides', 'Discovery to informational cluster', 'High', 'Contextual section near career direction.'],
        ['Home', '/', 'India hub', '/india/', 'Finance course across India', 'National access path', 'High', 'Clarify live online vs Lucknow in-person.'],
        ['Courses', '/courses/', 'Investment banking operations guide', '/career-guides/investment-banking-operations/', 'What is investment banking operations', 'Commercial-to-informational support', 'High', 'Place beside module overview.'],
        ['Courses', '/courses/', 'Interview resource', '/resources/investment-banking-interview-questions/', 'Investment banking interview questions for freshers', 'Commercial-to-job-intent path', 'High', 'Add after curriculum and near CTA.'],
        ['Courses', '/courses/', 'Choosing a finance course', '/career-guides/choosing-finance-career-course/', 'How to choose a finance career course', 'Commercial investigation support', 'High', 'Use before fees/decision section.'],
        ['Courses', '/courses/', 'Placements', '/placements/', 'Read job guarantee terms', 'Conversion assurance', 'High', 'Never use an unqualified guarantee anchor.'],
        ['India', '/india/', 'Mumbai guide', '/india/mumbai/', 'Investment banking course in Mumbai', 'Regional discovery', 'High', 'Use city-specific card.'],
        ['India', '/india/', 'Bengaluru guide', '/india/bengaluru/', 'Investment banking course in Bangalore', 'Regional discovery', 'High', 'Use Bangalore keyword in visible copy where natural.'],
        ['India', '/india/', 'Delhi-NCR guide', '/india/delhi-ncr/', 'Investment banking course in Delhi-NCR', 'Regional discovery', 'High', 'Mention Delhi/Gurugram/Noida distinction.'],
        ['India', '/india/', 'Pune guide', '/india/pune/', 'Investment banking course in Pune', 'Regional discovery', 'Medium', 'Unique regional content.'],
        ['India', '/india/', 'Hyderabad guide', '/india/hyderabad/', 'Investment banking course in Hyderabad', 'Regional discovery', 'Medium', 'Unique regional content.'],
        ['India', '/india/', 'Lucknow location', '/locations/lucknow/', 'Finance and investment banking course in Lucknow', 'Actual local location', 'High', 'Use as physical-location path only.'],
        ['Mumbai guide', '/india/mumbai/', 'Courses', '/courses/', 'Financial Operations Masterclass', 'Regional-to-commercial', 'High', 'Explain online access.'],
        ['Mumbai guide', '/india/mumbai/', 'Trade lifecycle guide', '/career-guides/trade-lifecycle/', 'Trade lifecycle in investment banking', 'Regional-to-role fit', 'High', 'Best fit for Mumbai operations intent.'],
        ['Bengaluru guide', '/india/bengaluru/', 'FinTech guide', '/career-guides/fintech-operations/', 'FinTech operations careers', 'Regional-to-role fit', 'High', 'Use Bengaluru ecosystem context.'],
        ['Delhi-NCR guide', '/india/delhi-ncr/', 'KYC/AML guide', '/career-guides/kyc-aml-analyst/', 'KYC and AML analyst careers', 'Regional-to-role fit', 'High', 'Use local role signals, not vacancy claims.'],
        ['Pune guide', '/india/pune/', 'Finance operations guide', '/career-guides/finance-operations/', 'Finance operations careers', 'Regional-to-role fit', 'Medium', 'Link from role-signal section.'],
        ['Hyderabad guide', '/india/hyderabad/', 'Finance operations guide', '/career-guides/finance-operations/', 'Finance operations careers', 'Regional-to-role fit', 'Medium', 'Link from role-signal section.'],
        ['Reconciliation resource', '/resources/reconciliation-in-finance/', 'IB operations guide', '/career-guides/investment-banking-operations/', 'Investment banking operations', 'Topic-to-career bridge', 'High', 'Place after workflow example.'],
        ['Reconciliation resource', '/resources/reconciliation-in-finance/', 'Interview resource', '/resources/investment-banking-interview-questions/', 'Reconciliation interview questions', 'Topic-to-job bridge', 'High', 'Use contextual CTA.'],
        ['Accounting basics', '/resources/accounting-basics/', 'Finance operations guide', '/career-guides/finance-operations/', 'Finance operations career', 'Top-of-funnel-to-role', 'Medium', 'Avoid aggressive sales placement.'],
        ['Interview resource', '/resources/investment-banking-interview-questions/', 'Courses', '/courses/', 'Learn investment banking operations', 'Job intent to course', 'High', 'CTA after useful answer content.'],
        ['Interview resource', '/resources/investment-banking-interview-questions/', 'Trade lifecycle guide', '/career-guides/trade-lifecycle/', 'Trade lifecycle interview preparation', 'Job-intent depth', 'High', 'Use exact topic match.'],
        ['Investment banking blog', '/blog/investment-banking-teams-operations/', 'IB operations guide', '/career-guides/investment-banking-operations/', 'Investment banking operations career guide', 'Broad topic to role owner', 'High', 'Primary contextual link.'],
        ['Investment banking blog', '/blog/investment-banking-teams-operations/', 'Courses', '/courses/', 'Investment banking operations course', 'Broad topic to commercial', 'High', 'Use after explaining operations.'],
        ['Accounting blog cluster', 'Multiple /blog/ routes', 'Reconciliation resource', '/resources/reconciliation-in-finance/', 'Reconciliation meaning in finance', 'Accounting-to-operations', 'Medium', 'Keep one canonical reconciliation owner.'],
        ['Risk blog', '/blog/risk-management-in-banking/', 'Finance operations guide', '/career-guides/finance-operations/', 'Finance operations and risk skills', 'Risk-to-career', 'High', 'Use dated regulatory sources.'],
        ['Salary blog', '/blog/investment-banking-salary-in-india/', 'Finance careers guide', '/career-guides/finance-careers-after-graduation/', 'Finance careers after graduation', 'Time-sensitive research to evergreen guide', 'Medium', 'Do not use job-guarantee CTA as salary promise.'],
        ['Every indexable page', 'Sitewide', 'Contact', '/contact/', 'Ask about current cohort and terms', 'Conversion support', 'Medium', 'Use descriptive, non-spammy anchors.'],
    ]

    implementation = [
        ['0', 'Baseline', 'Export and freeze current URL/keyword ownership', 'SEO + developer', 'Use existing 728-keyword / 24-URL architecture as the ownership baseline; map new source signals without assigning one keyword to multiple pages.', 'Ownership sheet approved; no duplicate primary terms.', 'Before edits'],
        ['1', 'Measurement', 'Connect GA4 reporting / Search Console evidence', 'SEO + analytics', 'Use first-party data to validate the provisional volumes, query-to-page performance, conversions and regional demand.', 'A dated baseline exists for clicks, impressions, CTR, positions and lead events.', 'Before edits'],
        ['2', 'Wave 1', 'Refresh /courses/ and /placements/', 'SEO developer + content', 'Rewrite title/meta/H1, clarify module structure, terms, eligibility, access and CTAs; preserve one primary commercial owner.', 'No duplicate course pages; terms links visible; schema validates.', 'Week 1'],
        ['3', 'Wave 1', 'Refresh IB operations, finance operations and KYC/AML guides', 'Content + subject reviewer', 'Build role and workflow depth around published curriculum; add primary-source references where rules or market facts are used.', 'Each guide answers intent directly and links to its module, resource and course owner.', 'Week 1-2'],
        ['4', 'Wave 1', 'Refresh reconciliation and interview resources', 'Content + SEO', 'Prioritize the strongest supplied spy signals; improve answer sections, examples, FAQs and conversion bridges.', 'Canonical owners confirmed; no duplicate blog created.', 'Week 2'],
        ['5', 'Wave 1', 'Refresh national and Lucknow pages', 'Local SEO + developer', 'Separate India-wide online access from the actual Lucknow in-person location; audit NAP, local schema and terms.', 'No unsupported city/classroom claims.', 'Week 2'],
        ['6', 'Wave 2', 'Refresh five existing regional guides', 'Local SEO + researcher', 'Add distinct city research, role signals, local areas and exact access language; keep each page materially unique.', 'Five pages pass uniqueness/evidence review; no new city pages added.', 'Week 3'],
        ['7', 'Wave 2', 'Refresh trade lifecycle and graduate career guide', 'Content + subject reviewer', 'Connect role, workflow and course-decision intent; use practical examples and interview links.', 'Each guide has one primary intent and a visible next step.', 'Week 3'],
        ['8', 'Wave 2', 'Refresh accounting and finance foundation resources', 'Editorial', 'Use high-volume accounting topics for reach but route readers into reconciliation, finance operations and interviews.', 'Top-of-funnel pages have useful internal routes and no thin sales blocks.', 'Week 3-4'],
        ['9', 'Wave 3', 'Publish risk, salary, employer and retail banking articles', 'Editorial + research', 'Publish only with dated sources, clear scope and non-guarantee language; keep salary and employer facts fresh.', 'Each article has a source log and review date.', 'Week 4-5'],
        ['10', 'Technical', 'Implement metadata and schema QA', 'SEO developer', 'Check title uniqueness, descriptions, H1, canonical, robots, OG, JSON-LD, sitemap and rendered route content.', 'Automated SEO checks pass; no duplicate metadata.', 'Every release'],
        ['11', 'Internal linking', 'Implement hub-and-spoke links', 'SEO developer', 'Add the prioritized links in the Internal Linking sheet; keep anchors descriptive and contextual.', 'No orphaned indexable pages; reciprocal module/guide paths pass.', 'Every release'],
        ['12', 'Validation', 'Review SERPs and first-party performance', 'SEO analyst', 'Compare 28-day and 56-day performance by page, query, region and lead action; update priorities rather than chasing raw volume.', 'Decisions recorded with date and evidence source.', 'After 28/56 days'],
        ['13', 'Governance', 'Review regional/page scaling gate', 'SEO lead', 'Do not exceed the existing selective regional set without unique local evidence, meaningful conversions and a business reason.', 'Expansion is approved or explicitly held.', 'Monthly'],
    ]

    exclusions = [
        ['courses on digital marketing', 201000, '', 'Exclude from this finance funnel', 'Largest raw volume in the Keyword Tool export, but unrelated to the published banking/finance program. Do not dilute topical authority.'],
        ['data analyst course', 110000, '', 'Exclude from core pages', 'High volume but not the current published offer; target only if a real data-analytics program and evidence are added.'],
        ['data scientist course / data science full course', 90500, '', 'Exclude from core pages', 'Unrelated product intent and risk of attracting non-converting traffic.'],
        ['financial modelling course', 18100, 15, 'Hold / validate', 'Large adjacent cluster but not a published core module. Use only in a comparison article or future product page if the curriculum supports it.'],
        ['financial analyst course', 8100, 12, 'Validate before targeting', 'Relevant audience but current public curriculum is broader finance operations; do not imply a dedicated analyst course without approved offer evidence.'],
        ['CFA', 76000, 13, 'Exclude as core', 'The site must not imply CFA Institute affiliation, preparation or credential delivery unless documented. A careful comparison article is optional.'],
        ['FRM', 18300, 9, 'Exclude as core', 'Same credential/brand-risk rule; do not create a certification page for a credential not provided.'],
        ['business analyst course with placement', 1000, '', 'Hold / scope carefully', 'Adjacent intent may include unrelated business-analysis training. Use finance operations analyst wording only where the page content supports it.'],
        ['Investment banking courses in Chennai', 390, 56, 'Hold regional expansion', 'Do not mass-create a Chennai page solely from volume. Require unique regional research, access information and business approval.'],
        ['Generic “best course” claims', '', '', 'Use transparent comparison only', 'Avoid unsupported superlatives. Publish criteria, dates, sources and limitations instead.'],
        ['Salary and placement promises', '', '', 'Always source and qualify', 'Use current evidence, written program terms and review dates; never turn a keyword into a promise.'],
    ]

    metadata = []
    for row in pages:
        metadata.append([row['Wave'], row['URL'], row['Primary keyword owner'], row['Meta title'], row['Meta description'], row['H1'], row['Schema'], 'index, follow' if row['Status'].startswith('Existing') else 'index, follow after QA', 'Keep one canonical URL; update date only after substantive review.', row['Status']])
    for row in blog_rows:
        slug = row['URL'].strip('/').split('/')[-1]
        if row['Action'] == 'Do not duplicate; refresh resource':
            continue
        metadata.append([row['Wave'], row['URL'], row['Primary keyword'], row['Working title'] + ' | Centaur Careers', 'Practical, source-led guidance on ' + row['Primary keyword'] + ' for finance learners, operations applicants and graduates.', row['Working title'], 'Article + BreadcrumbList', 'index, follow', 'Add dateModified only after editorial review; avoid generic claims.', row['Status']])

    source_notes = [
        ['Keyword Tool Export - Analyze Competitors - imarticus org.xlsx', 'Keyword Tool / competitor export', 2219, 30, len(relevant_a), len(unique_a), 'Average search volume, 12-month trend, INR top-of-page bids and competition.', 'Broad file includes unrelated digital marketing, data science and other topics; filtered semantically for finance/BFSI relevance.'],
        ['spy.xlsx', 'Competitor organic keyword ranking export', 1000, 22, len(relevant_b), len(unique_b), 'Search volume, ranking difficulty, top ranked URL, rank and SEO clicks for Imarticus pages.', 'Rows repeat a keyword across URLs; use max volume once for cluster evidence and do not sum duplicate rows.'],
        ['Both files', 'Cross-source check', '', '', '', len(unique_a & unique_b), 'Only four normalized relevant keywords overlap between the two exports.', 'Do not add volumes across files; they represent different datasets, settings or time windows.'],
        ['Current project', 'Existing architecture', 728, 24, '', '', 'Approved keyword strategy baseline in src/content/seo/keywordStrategyData.js.', 'This workbook is an implementation prioritization layer; it should not silently replace existing keyword ownership.'],
        ['Live site sample', 'Current public positioning', '', '', '', '', 'Homepage and course page publish live online access across India, in-person access in Lucknow, and finance-operations modules.', 'Recheck live claims, guarantee terms, cohort details and employer references before each release.'],
    ]

    summary = [
        ['Recommendation', 'Execute Wave 1 on existing commercial, career and high-signal resource pages before creating new URL families.'],
        ['Highest direct traffic opportunity', 'Reconciliation resource: spy shows 40,700 volume / KD 21; retain one canonical owner and strengthen the course/career bridge.'],
        ['Highest commercial cluster', 'Investment banking courses: Keyword Tool export shows 18,100; spy shows 2,600 for the same broad term. Keep the sources separate.'],
        ['Highest job-intent opportunity', 'Investment banking interview questions, finance interview questions, placement and course-comparison pages.'],
        ['Regional strategy', 'Refresh India, Lucknow and the five existing regional guides. Do not mass-create city pages from keyword volume alone.'],
        ['Content strategy', 'Use accounting, banking, investment-banking, risk and market explainers as top-of-funnel feeders into owned finance-operations pages.'],
        ['Measurement gate', 'Validate with GA4/Search Console by query, page, city, CTA and cohort before expanding beyond the current architecture.'],
    ]
    return summary, keyword_signals, pages, regional, blog_rows, internal, metadata, implementation, exclusions, source_notes


def xml_escape(value):
    return html.escape(str(value), quote=False)


def col_letter(index):
    result = ''
    index += 1
    while index:
        index, remainder = divmod(index - 1, 26)
        result = chr(65 + remainder) + result
    return result


def cell_xml(row_num, col_num, value, style=0):
    if value is None:
        return ''
    ref = f'{col_letter(col_num)}{row_num}'
    if isinstance(value, bool):
        return f'<c r="{ref}" s="{style}" t="b"><v>{1 if value else 0}</v></c>'
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return f'<c r="{ref}" s="{style}"><v>{value}</v></c>'
    text = xml_escape(value)
    preserve = ' xml:space="preserve"' if str(value).startswith(' ') or str(value).endswith(' ') else ''
    return f'<c r="{ref}" s="{style}" t="inlineStr"><is><t{preserve}>{text}</t></is></c>'


def styles_xml():
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="0"/>
  <fonts count="3">
    <font><sz val="11"/><name val="Aptos"/></font>
    <font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Aptos Display"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font>
  </fonts>
  <fills count="8">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF17365D"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1F4E78"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEAF2F8"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CC"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE2F0D9"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFCE4D6"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFD9E2F3"/></left><right style="thin"><color rgb="FFD9E2F3"/></right><top style="thin"><color rgb="FFD9E2F3"/></top><bottom style="thin"><color rgb="FFD9E2F3"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="9">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="6" borderId="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="7" borderId="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
  </cellXfs>
</styleSheet>'''


def worksheet_xml(title, subtitle, headers, rows):
    all_rows = []
    all_rows.append([title])
    all_rows.append([subtitle])
    all_rows.append([])
    all_rows.append(headers)
    all_rows.extend(rows)
    max_cols = max([len(row) for row in all_rows] + [1])
    xml_rows = []
    for row_num, row in enumerate(all_rows, start=1):
        style = 1 if row_num == 1 else (2 if row_num == 4 else (4 if row_num == 2 else 0))
        cells = ''.join(cell_xml(row_num, col_num, value, style) for col_num, value in enumerate(row))
        xml_rows.append(f'<row r="{row_num}">{cells}</row>')
    last_col = col_letter(max_cols - 1)
    last_row = len(all_rows)
    widths = []
    for col_num in range(max_cols):
        header = str(headers[col_num]) if col_num < len(headers) else ''
        if any(term in header.lower() for term in ('url', 'description', 'brief', 'evidence', 'why', 'angle', 'links', 'guardrail', 'risk', 'notes', 'decision', 'source', 'title', 'h1')):
            width = 34
        elif 'keyword' in header.lower() or 'cluster' in header.lower() or 'intent' in header.lower():
            width = 27
        else:
            width = 16
        widths.append(f'<col min="{col_num + 1}" max="{col_num + 1}" width="{width}" customWidth="1"/>')
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:{last_col}{last_row}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A5" sqref="A5"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>{''.join(widths)}</cols>
  <sheetData>{''.join(xml_rows)}</sheetData>
  <autoFilter ref="A4:{last_col}{last_row}"/>
  <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>
</worksheet>'''


def workbook_xml(sheet_names):
    sheets = ''.join(f'<sheet name="{xml_escape(name)}" sheetId="{i}" r:id="rId{i}"/>' for i, name in enumerate(sheet_names, start=1))
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView/></bookViews><sheets>{sheets}</sheets>
</workbook>'''


def rels_xml(count):
    rels = ''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1, count + 1))
    rels += f'<Relationship Id="rId{count + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{rels}</Relationships>'''


def content_types_xml(count):
    sheets = ''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1, count + 1))
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  {sheets}
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>'''


def write_workbook(sheets):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT, 'w', zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('[Content_Types].xml', content_types_xml(len(sheets)))
        archive.writestr('_rels/.rels', '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>''')
        archive.writestr('xl/workbook.xml', workbook_xml([sheet[0] for sheet in sheets]))
        archive.writestr('xl/_rels/workbook.xml.rels', rels_xml(len(sheets)))
        archive.writestr('xl/styles.xml', styles_xml())
        for index, (_, subtitle, headers, rows) in enumerate(sheets, start=1):
            archive.writestr(f'xl/worksheets/sheet{index}.xml', worksheet_xml(sheets[index - 1][0], subtitle, headers, rows))


def main():
    summary, keyword_signals, pages, regional, blog_rows, internal, metadata, implementation, exclusions, source_notes = build_data()
    page_keys = [key for key in pages[0] if not key.startswith('_')]
    blog_keys = [key for key in blog_rows[0] if not key.startswith('_')]
    sheets = [
        ('Executive Summary', 'Senior SEO implementation plan based on the two supplied keyword exports, current site architecture and a live positioning check. Scores are prioritization signals, not traffic forecasts.', ['Area', 'Decision'], summary),
        ('Keyword Signals', 'High-impact keyword clusters. Volumes are kept source-specific because the two exports represent different datasets and overlap only minimally.', ['Keyword cluster', 'Cluster type', 'Keyword Tool signal', 'Spy signal', 'Primary owner', 'Decision', 'Impact'], keyword_signals),
        ('Page Roadmap', 'Implement in sequence. One URL owns one primary intent; variants belong in the same page unless a distinct SERP intent and business need justify a new route.', page_keys, [[row[k] for k in page_keys] for row in pages]),
        ('Regional Rollout', 'Refresh the existing selective regional set. Hold new city pages until unique local evidence, access information and conversion need exist.', ['Seq', 'Page status', 'URL', 'Region', 'Primary keyword', 'Keyword Tool volume', 'Keyword Tool competition', 'Implementation direction', 'Gate'], regional),
        ('Blog Plan', 'Editorial sequence for reach plus finance-job relevance. Existing posts should be refreshed and differentiated before new pages are added.', blog_keys, [[row[k] for k in blog_keys] for row in blog_rows]),
        ('Internal Linking', 'Priority hub-and-spoke links. Add only where the destination genuinely answers the surrounding section.', ['Source page', 'Source URL', 'Destination page', 'Destination URL', 'Recommended anchor', 'Purpose', 'Priority', 'Placement note'], internal),
        ('Metadata Plan', 'Proposed metadata and on-page ownership. Validate final claims, dates, URLs and schema against the rendered route before release.', ['Wave', 'URL', 'Primary keyword', 'Proposed title', 'Proposed meta description', 'Proposed H1', 'Schema', 'Robots', 'Implementation note', 'Status'], metadata),
        ('Implementation Sequence', 'Suggested rollout order for the next 5-8 weeks, followed by measurement and governance.', ['Step', 'Wave', 'Task', 'Owner', 'Implementation detail', 'Acceptance criteria', 'Timing'], implementation),
        ('Exclusions & Risks', 'Terms with volume but weak product fit, credential risk, data risk or thin-content risk. These are deliberately not in the first implementation sequence.', ['Term / risk', 'Keyword Tool volume', 'Spy KD', 'Decision', 'Reason'], exclusions),
        ('Source Notes', 'Audit trail for source files, filters, live positioning and planning limits.', ['Source / scope', 'Type', 'Rows / value', 'Columns', 'Relevant rows', 'Unique / overlap', 'What it contributes', 'Limitation'], source_notes),
    ]
    write_workbook(sheets)
    print(f'Created {OUTPUT}')


if __name__ == '__main__':
    main()
