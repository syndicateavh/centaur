import re
import sys
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
import create_seo_keyword_plan as workbook


ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://centaurcareers.in'
SITEMAP = ROOT / 'public' / 'sitemap.xml'
OUTPUT = ROOT / 'SEO_Next20_Pages_Next20_Blogs_Plan_2026-09-29.xlsx'
workbook.OUTPUT = OUTPUT


# A page action is deliberately not an instruction to rewrite a route. It is a
# measured refresh target; retain the current owner if production data shows no
# useful gap. Regional rows are observation-only until page-filtered evidence
# and current, first-party access facts support a change.
PAGE_ITEMS = [
    {
        'wave': '1', 'priority': 'P0', 'action': 'Measured refresh; keep one offer URL',
        'title': 'Financial Operations Masterclass', 'url': '/courses/',
        'primary': 'investment banking operations course',
        'support': 'banking operations course; finance operations course; course eligibility and study mode',
        'intent': 'Commercial / enrolment',
        'basis': 'Approved India keyword map: P0 single-programme owner; commercial queries are assigned here.',
        'brief': 'Answer what the single Masterclass is, who it suits, its visible modules, verified format, current eligibility/terms, practical learning evidence, and the next enquiry step. Separate modules from standalone qualifications.',
        'links': '/career-guides/choosing-finance-career-course/; /career-guides/investment-banking-operations/; /career-guides/finance-operations/; current terms/contact',
        'meta_title': 'Financial Operations Masterclass | Centaur Careers',
        'meta_description': 'Explore Centaur Careers’ Financial Operations Masterclass, its finance and banking operations modules, verified learning format and current programme terms.',
        'h1': 'Financial Operations Masterclass',
        'guardrail': 'One programme only. Do not imply guaranteed placement, a new course, an unapproved credential, stale fees, or delivery beyond verified access.',
        'gate': 'Use page-filtered GSC queries for two equal completed 28-day periods; verify live terms with the business owner before changing copy.',
        'kpi': 'Relevant non-brand impressions/clicks; CTA-to-qualified-enquiry rate; correct enquiry attribution.',
    },
    {
        'wave': '1', 'priority': 'P0', 'action': 'Measured refresh; retain existing guide',
        'title': 'Finance Careers After Graduation', 'url': '/career-guides/finance-careers-after-graduation/',
        'primary': 'finance careers after graduation',
        'support': 'finance jobs after BCom; banking jobs after graduation; entry-level finance roles',
        'intent': 'Career exploration / commercial investigation',
        'basis': 'Approved India keyword map: P0 owner for graduate finance-career and BCom decision queries.',
        'brief': 'Improve the role-choice matrix: day-to-day work, common entry evidence, transferable skills, role-fit questions, and next learning step. Distinguish banking operations, investment operations, compliance, payments, and accounting.',
        'links': '/career-guides/finance-operations/; /career-guides/investment-banking-operations/; /career-guides/kyc-aml-analyst/; /courses/',
        'meta_title': 'Finance Careers After Graduation: Role Guide | Centaur',
        'meta_description': 'Compare finance and banking operations roles after graduation by daily work, skills, entry evidence and the questions to ask before choosing a path.',
        'h1': 'Finance Careers After Graduation: Compare Roles and Entry Paths',
        'guardrail': 'Do not imply every BCom occupation is covered, promise hiring, or publish unsupported salary/outcome figures.',
        'gate': 'Refresh only where page-filtered query data identifies an unanswered role or intent; check the current India SERP.',
        'kpi': 'Non-brand relevant query clicks; engaged visits to role guides; qualified enquiry assists.',
    },
    {
        'wave': '1', 'priority': 'P0', 'action': 'Measured refresh; role intent only',
        'title': 'Investment Banking Operations Career Guide', 'url': '/career-guides/investment-banking-operations/',
        'primary': 'investment banking operations',
        'support': 'investment banking operations roles; middle/back office tasks; entry skills',
        'intent': 'Role research / job exploration',
        'basis': 'Approved India keyword map: P0 role owner; sampled competitors use role and career-path explainers.',
        'brief': 'Show role boundaries, operational task examples, hand-offs and controls, common job-description wording, entry-level skill evidence, and a realistic learning path. Use a fictional workflow.',
        'links': '/career-guides/trade-lifecycle/; /resources/investment-banking-interview-questions/; /courses/; related operations blogs',
        'meta_title': 'Investment Banking Operations: Roles and Work | Centaur',
        'meta_description': 'Understand investment banking operations roles, daily workflows, control points, entry skills and how operations differs from front-office work.',
        'h1': 'What Investment Banking Operations Teams Do',
        'guardrail': 'Keep front-office deal/advisory roles distinct; no employer-specific hiring or salary guarantee.',
        'gate': 'Use exact page-filtered queries and current SERP intent; cite any changing India industry facts.',
        'kpi': 'Relevant role-query clicks; interview-resource progression; qualified enquiry assists.',
    },
    {
        'wave': '1', 'priority': 'P0', 'action': 'Measured refresh; workflow and career fit',
        'title': 'Trade Lifecycle Guide', 'url': '/career-guides/trade-lifecycle/',
        'primary': 'trade lifecycle in investment banking',
        'support': 'trade life cycle; trade capture; confirmation; clearing; settlement; reconciliation',
        'intent': 'Informational / career exploration',
        'basis': 'Approved India keyword map: P0 owner; competitor set includes investment-operations process explainers.',
        'brief': 'Make each stage scannable with input/output, control evidence, common breaks, role hand-offs, and links to original examples. Avoid duplicating standalone posts; link to them where they answer a deeper task.',
        'links': '/resources/reconciliation-in-finance/; settlement-break worked example; investment banking operations guide; interview resource',
        'meta_title': 'Trade Lifecycle in Investment Banking: Stages and Roles',
        'meta_description': 'Follow a trade from capture to settlement, including operations hand-offs, reconciliation checks, common exceptions and related analyst roles.',
        'h1': 'Trade Lifecycle: Operations Stages, Controls and Roles',
        'guardrail': 'Educational workflow only; source current market rules and do not offer investment advice.',
        'gate': 'Check query-to-page ownership against settlement and reconciliation URLs before changing the outline.',
        'kpi': 'Relevant query coverage; next-clicks to role/case resources; qualified enquiry assists.',
    },
    {
        'wave': '1', 'priority': 'P0', 'action': 'Measured refresh; date regulatory statements',
        'title': 'KYC and AML Analyst Career Guide', 'url': '/career-guides/kyc-aml-analyst/',
        'primary': 'KYC analyst job description',
        'support': 'KYC in banking; AML analyst tasks; customer due diligence; screening and escalation',
        'intent': 'Career / role research',
        'basis': 'Approved India keyword map: P0 role owner; existing competitor content includes KYC analyst career paths.',
        'brief': 'Separate KYC, AML, screening and transaction-monitoring work; show a fictional alert/onboarding decision, evidence notes, escalation limits and entry skills.',
        'links': '/courses/kyc-aml/; KYC onboarding case; transaction-monitoring article; finance interview resource',
        'meta_title': 'KYC Analyst Role: Duties, Skills and Workflow | Centaur',
        'meta_description': 'Explore KYC analyst duties, onboarding checks, documentation, screening hand-offs, entry skills and when a case should be escalated.',
        'h1': 'KYC Analyst Duties, Skills and a Typical Workflow',
        'guardrail': 'No legal advice, compliance certification or job guarantee. Verify current regulations with primary sources and label proposals accurately.',
        'gate': 'Compliance subject-matter review and source-date check before any regulatory copy change.',
        'kpi': 'Relevant KYC-role clicks; progression to learning/interview resources; qualified enquiries.',
    },
    {
        'wave': '1', 'priority': 'P1', 'action': 'Measured refresh; tie skills to actual tasks',
        'title': 'Finance Operations Career Guide', 'url': '/career-guides/finance-operations/',
        'primary': 'finance operations career',
        'support': 'finance operations jobs; process controls; reconciliations; reporting and exception handling',
        'intent': 'Career exploration',
        'basis': 'Approved India keyword map: P1 owner for finance-operations career queries.',
        'brief': 'Map common responsibilities to skills and demonstrable practice: reconciliations, exception queues, documentation, control checks and reporting. Add a role-fit checklist rather than generic job promises.',
        'links': '/career-guides/finance-careers-after-graduation/; accounting basics; reconciliation resource; /courses/',
        'meta_title': 'Finance Operations Careers: Tasks and Skills | Centaur',
        'meta_description': 'See what finance operations teams do, the skills behind reconciliation and controls, and how graduates can assess role fit.',
        'h1': 'Finance Operations Careers: Work, Skills and Entry Paths',
        'guardrail': 'No claim that Centaur provides a separate finance-operations course or guarantees a role.',
        'gate': 'Use page-filtered GSC and confirmed enquiry data; retain this as the canonical role owner.',
        'kpi': 'Role-query clicks; resource progression; qualified enquiry assists.',
    },
    {
        'wave': '2', 'priority': 'P1', 'action': 'Measured refresh; transparent comparison rubric',
        'title': 'Choosing a Finance Career Course', 'url': '/career-guides/choosing-finance-career-course/',
        'primary': 'best finance course after BCom',
        'support': 'course selection checklist; curriculum; delivery mode; fees and support terms',
        'intent': 'Commercial investigation',
        'basis': 'Approved India keyword map: P1 course-selection owner; competitors visibly use comparison formats.',
        'brief': 'Add a neutral decision checklist covering role goal, real curriculum, practice, schedule, support, credential status, terms, access and questions to ask providers.',
        'links': '/courses/; /compare/investment-banking-operations-courses/; finance-careers guide; current terms',
        'meta_title': 'How to Choose a Finance Course After BCom | Centaur',
        'meta_description': 'Use a practical checklist to compare finance courses by role fit, curriculum, practice, study mode, current terms and support.',
        'h1': 'How to Choose a Finance Career Course',
        'guardrail': 'Do not call Centaur “best” without substantiation or make unverifiable competitor comparisons.',
        'gate': 'Verify all Centaur facts and competitor facts on current first-party pages; date competitor observations.',
        'kpi': 'Commercial-intent organic visits; course-page progression; qualified enquiry rate.',
    },
    {
        'wave': '2', 'priority': 'P1', 'action': 'Maintain only with current evidence',
        'title': 'Investment Banking Operations Course Comparison', 'url': '/compare/investment-banking-operations-courses/',
        'primary': 'investment banking operations courses',
        'support': 'investment banking course comparison; syllabus; study mode; support and terms',
        'intent': 'Commercial comparison',
        'basis': 'Approved India keyword map: P1 factual comparison owner; competitor course pages inform comparison format, not performance claims.',
        'brief': 'Use a transparent side-by-side rubric for published course scope, delivery, prerequisites, practice and support. Link to primary sources and mark unavailable facts as not verified.',
        'links': '/courses/; choosing-course guide; current placement/support terms; contact',
        'meta_title': 'Compare Investment Banking Operations Courses | Centaur',
        'meta_description': 'Compare investment banking operations learning options by syllabus, practical work, format, eligibility and published support terms.',
        'h1': 'How to Compare Investment Banking Operations Courses',
        'guardrail': 'No unsupported competitor facts, superiority claims, implied affiliation, stale pricing or placement guarantees.',
        'gate': 'Business/legal fact review, dated source log, and live SERP review before substantive edits.',
        'kpi': 'Comparison-query clicks; progression to verified terms; qualified enquiries.',
    },
    {
        'wave': '2', 'priority': 'P1', 'action': 'Keep answers synchronized with approved terms',
        'title': 'Financial Operations Programme FAQ', 'url': '/career-guides/financial-operations-faq/',
        'primary': 'finance course eligibility and programme questions',
        'support': 'duration; study mode; modules; certificate wording; current fees and support terms',
        'intent': 'Commercial investigation / trust',
        'basis': 'Approved India keyword map: P1 FAQ owner; current-offer and delivery terms are high-risk facts.',
        'brief': 'Answer only approved learner questions in concise language; show where current details are confirmed and link to the authoritative programme/terms page.',
        'links': '/courses/; choosing-course guide; placement terms; contact/admissions',
        'meta_title': 'Financial Operations Programme FAQs | Centaur Careers',
        'meta_description': 'Find current answers about the Financial Operations Masterclass, including eligibility, learning mode, modules and where to confirm terms.',
        'h1': 'Financial Operations Masterclass: Frequently Asked Questions',
        'guardrail': 'No stale fees, certificate ambiguity, placement guarantee, or FAQ schema added as a rich-result shortcut.',
        'gate': 'Admissions/business owner must approve every answer and confirm the visible page matches structured data.',
        'kpi': 'FAQ organic clicks; fewer unresolved admissions questions; qualified enquiry conversion.',
    },
    {
        'wave': '2', 'priority': 'P1', 'action': 'Improve practical answers if query data supports it',
        'title': 'Investment Banking Operations Interview Questions', 'url': '/resources/investment-banking-interview-questions/',
        'primary': 'investment banking operations interview questions for freshers',
        'support': 'trade lifecycle interview; reconciliation; operations controls; exception escalation',
        'intent': 'Informational / job preparation',
        'basis': 'Approved India keyword map: P1 interview resource; competitor content commonly addresses career and interview preparation.',
        'brief': 'Add original role-specific scenarios, answer structure, scoring rubric and a clear boundary between operations and front-office interviews.',
        'links': '/career-guides/investment-banking-operations/; trade lifecycle; reconciliation resource; /courses/',
        'meta_title': 'Investment Banking Operations Interview Questions',
        'meta_description': 'Practice investment banking operations interview questions on trade workflows, reconciliations and controls, with answer frameworks and a self-check.',
        'h1': 'Investment Banking Operations Interview Questions and Answers',
        'guardrail': 'Do not present questions as leaked or employer-specific; do not imply hiring access.',
        'gate': 'Subject review all model answers and check overlap with the separate accounting-interview resource.',
        'kpi': 'Non-brand interview-query clicks; completion/download actions; qualified enquiry assists.',
    },
    {
        'wave': '2', 'priority': 'P1', 'action': 'Keep technical scope separate from broad interview guide',
        'title': 'Accounting Interview Questions and Answers', 'url': '/resources/accounting-interview-questions/',
        'primary': 'accounting interview questions and answers',
        'support': 'basic accounting interview questions; journal entries; trial balance; bank reconciliation',
        'intent': 'Informational / job preparation',
        'basis': 'Reviewed keyword decision: one resource owns both accounting interview query variants; no second URL.',
        'brief': 'Maintain the original fictional transaction set, checked answer key, self-scoring rubric and ICAI learning references; link from relevant accounting fundamentals.',
        'links': '/resources/accounting-basics/; /resources/reconciliation-in-finance/; finance interview blog; finance operations guide',
        'meta_title': 'Accounting Interview Questions with Worked Answers',
        'meta_description': 'Practice accounting interview questions with a fictional transaction case, worked entries, a trial balance and a practical self-check.',
        'h1': 'Accounting Interview Questions and Worked Answers',
        'guardrail': 'Preserve checked arithmetic; label the case fictional; do not claim employer-specific questions or individual expert review without evidence.',
        'gate': 'Re-run the case arithmetic and source-link QA after any edit; compare exact page-filtered queries before expanding.',
        'kpi': 'Accounting-interview clicks; worksheet use; progression to relevant learning resources.',
    },
    {
        'wave': '2', 'priority': 'P2', 'action': 'Refresh only if query and lead quality justify it',
        'title': 'Retail Banking Operations Career Guide', 'url': '/career-guides/retail-banking-operations/',
        'primary': 'retail banking operations meaning',
        'support': 'customer onboarding; loan servicing; branch/back-office operations; process controls',
        'intent': 'Career exploration / informational',
        'basis': 'Approved India keyword map: P2 owner; competitor materials cover banking functions and role routes.',
        'brief': 'Clarify customer-facing versus processing work, common hand-offs, example service journey, role names and transferable skills.',
        'links': 'commercial bank services blog; loan operations blog; finance operations guide; retail-banking module',
        'meta_title': 'Retail Banking Operations: Roles and Workflows | Centaur',
        'meta_description': 'Understand retail banking operations, customer and processing workflows, common controls and the skills used in entry-level roles.',
        'h1': 'Retail Banking Operations: Workflows, Roles and Skills',
        'guardrail': 'Do not imply separate retail banking course or promise bank employment; source current regulatory claims.',
        'gate': 'Review page-filtered Search Console data and current India intent before modifying; one canonical owner.',
        'kpi': 'Relevant role clicks; cross-links to loan and banking guides; qualified enquiry assists.',
    },
    {
        'wave': '2', 'priority': 'P2', 'action': 'Refresh only if query and lead quality justify it',
        'title': 'Digital Payments Operations Career Guide', 'url': '/career-guides/digital-payments-operations/',
        'primary': 'digital payment operations',
        'support': 'payment operations roles; settlement; reconciliation; disputes and exceptions',
        'intent': 'Career exploration / informational',
        'basis': 'Approved India keyword map: P2 owner; competitor inventory includes fintech/payment subject coverage.',
        'brief': 'Map payment lifecycle stages to ops roles, controls, common exceptions, escalation boundaries and skills. Link to the future payment workflow article cluster only after publication.',
        'links': 'UPI lifecycle blog; digital payments module; reconciliation resource; /courses/',
        'meta_title': 'Digital Payments Operations: Roles and Skills | Centaur',
        'meta_description': 'Explore digital payment operations roles, lifecycle checks, reconciliation, exception handling and practical skills for finance graduates.',
        'h1': 'Digital Payments Operations: Roles, Workflow and Skills',
        'guardrail': 'No standalone payments-course claim; date any RBI/NPCI statistics and distinguish examples from live system rules.',
        'gate': 'Check current India SERP and page-filtered queries; finance/BFSI reviewer validates operational facts.',
        'kpi': 'Payment-operations clicks; progression into course and job resources; qualified enquiry assists.',
    },
    {
        'wave': '3', 'priority': 'P1', 'action': 'Observe/refresh only when a real local intent gap appears',
        'title': 'Finance Learning Access in India', 'url': '/india/',
        'primary': 'investment banking operations course India',
        'support': 'online finance learning across India; access; verified in-person option',
        'intent': 'Local / commercial investigation',
        'basis': 'Approved India keyword map: P1 national access owner; it must stay distinct from the course sales page.',
        'brief': 'Keep a concise access answer, online delivery boundary, verified Lucknow information and routes to relevant regional guides. Avoid repeating programme sales copy.',
        'links': '/courses/; /best-finance-course-in-lucknow/; the five current regional access guides',
        'meta_title': 'Finance Learning Access Across India | Centaur Careers',
        'meta_description': 'See how learners across India can access Centaur Careers’ live online finance learning and where current in-person access is verified.',
        'h1': 'Finance Learning Access Across India',
        'guardrail': 'No national classroom network, new branch, cohort schedule or delivery claim without first-party verification.',
        'gate': 'Do not rewrite without page-filtered GSC evidence and confirmed current access facts.',
        'kpi': 'Relevant India access clicks; regional-to-course progression; qualified enquiries by landing page.',
    },
    {
        'wave': '3', 'priority': 'P1', 'action': 'Fact audit; do not add unsupported local claims',
        'title': 'Verified Lucknow Learning Access', 'url': '/best-finance-course-in-lucknow/',
        'primary': 'investment banking course in Lucknow',
        'support': 'finance training in Lucknow; current in-person learning access; course terms',
        'intent': 'Local / commercial',
        'basis': 'Approved India keyword map: P1 verified-local-access owner; local facts require direct confirmation.',
        'brief': 'Check the current venue/access, contact path, programme format, and local learner questions. Keep distinct from generic India-wide live-online access.',
        'links': '/courses/; /india/; current contact and approved terms',
        'meta_title': 'Finance Learning in Lucknow: Verified Access | Centaur',
        'meta_description': 'Review current finance-learning access in Lucknow, verified programme details and how to confirm the latest schedule and terms.',
        'h1': 'Finance Learning Access in Lucknow',
        'guardrail': 'Confirm address, facility, schedule, contact and in-person claims before publication; no placement guarantee.',
        'gate': 'Business owner verifies local facts; inspect live page and local intent. Do not infer demand from city keyword volume alone.',
        'kpi': 'Local non-brand clicks; call/form enquiries; qualified leads attributed to the page.',
    },
]

REGIONS = [
    ('Delhi-NCR', '/best-finance-course-in-delhi/', 'finance course in Delhi NCR', 'investment banking operations course in Delhi'),
    ('Bengaluru', '/best-finance-course-in-bangalore/', 'finance course in Bengaluru', 'investment banking operations course in Bangalore'),
    ('Mumbai', '/best-finance-course-in-mumbai/', 'finance course in Mumbai', 'finance operations course in Mumbai'),
    ('Pune', '/best-finance-course-in-pune/', 'finance course in Pune', 'finance operations course in Pune'),
    ('Hyderabad', '/best-finance-course-in-hyderabad/', 'finance course in Hyderabad', 'investment banking operations course in Hyderabad'),
]
for city, url, primary, secondary in REGIONS:
    PAGE_ITEMS.append({
        'wave': '4', 'priority': 'P2', 'action': 'Observe only; no rewrite without page-filtered evidence',
        'title': f'Finance Learning Access in {city}', 'url': url,
        'primary': primary, 'support': f'{secondary}; live online access; verified local information',
        'intent': 'Regional access / commercial investigation',
        'basis': 'Approved keyword map assigns one existing regional URL; market-specific Semrush/GSC demand is not validated.',
        'brief': f'Keep the page useful and truthful for {city}: online access boundary, one genuinely local learner context/source if verified, FAQs grounded in enquiries, and a clear path to the actual programme. Do not create another city URL.',
        'links': '/india/; /courses/; city guide only where contextually useful',
        'meta_title': f'Finance Learning in {city} | Live Online Access | Centaur',
        'meta_description': f'Explore verified finance-learning access for learners in {city}, including live online study and current programme information.',
        'h1': f'Finance Learning Access for Learners in {city}',
        'guardrail': f'Live online outside Lucknow. Do not claim a {city} classroom, local cohort, employer, placement or city-specific outcome.',
        'gate': 'Require two equal completed 28-day GSC periods with the exact page filter, a distinct learner question, and a checked local source before any substantive local expansion.',
        'kpi': 'City-page impressions/clicks by query; qualified enquiries; avoid counting aggregate India traffic as city demand.',
    })


BLOG_ITEMS = [
    {
        'wave': '1', 'priority': 'P1', 'title': 'Income Statement: Meaning, Format and Worked Example',
        'slug': 'income-statement-meaning-format-example', 'primary': 'income statement',
        'support': 'profit and loss statement; income statement format; revenue and expenses', 'intent': 'Informational / accounting fundamentals',
        'why': 'Distinct statement-level search topic in the 100-topic inventory; gives finance learners a practical foundation.',
        'angle': 'Use a fictional small-business dataset, clearly show revenue, expenses and profit, trace each figure to supporting records, and explain what the statement cannot show.',
        'owner': 'Keep distinct from /resources/accounting-basics/ and the financial-accounting process article; link, do not repeat their broad overviews.',
        'links': '/resources/accounting-basics/; financial accounting article; accounting interview resource; /career-guides/finance-operations/',
        'meta_title': 'Income Statement: Meaning, Format and Example | Centaur',
        'meta_description': 'Learn how an income statement is structured with a fictional worked example, common line items and limits for finance operations learners.',
        'source': 'ICAI primary learning material; use India-appropriate accounting references and distinguish standards from the example.',
        'guardrail': 'Educational only; label figures fictional; no investment or accounting advice.',
    },
    {
        'wave': '1', 'priority': 'P1', 'title': 'Cash Flow Statement: Meaning, Sections and Example',
        'slug': 'cash-flow-statement-meaning-example', 'primary': 'cash flow statement',
        'support': 'operating investing financing cash flows; cash flow statement example', 'intent': 'Informational / accounting fundamentals',
        'why': 'A separate financial-statement intent from balance sheet and income statement topics already on site.',
        'angle': 'Walk through a fictional month of cash receipts/payments, classify operating/investing/financing flows, reconcile opening to closing cash, and explain accrual-versus-cash limits.',
        'owner': 'Link to the existing financial-accounting and accounting-basics owners; do not create a second general statements hub.',
        'links': '/resources/accounting-basics/; financial accounting article; income-statement article; finance operations career guide',
        'meta_title': 'Cash Flow Statement: Sections and Example | Centaur',
        'meta_description': 'See how operating, investing and financing cash flows connect in a fictional example, with a reconciliation and practical limitations.',
        'source': 'ICAI/official accounting study material; primary standards context only where needed.',
        'guardrail': 'Keep the case fictional and explain that cash-flow presentation requirements depend on applicable accounting rules.',
    },
    {
        'wave': '1', 'priority': 'P1', 'title': 'Financial Statement Analysis: Ratios, Use and Limits',
        'slug': 'financial-statement-analysis-ratios-limits', 'primary': 'financial statement analysis',
        'support': 'financial ratios; liquidity and profitability analysis; statement analysis limits', 'intent': 'Informational / learning',
        'why': 'An adjacent but distinct analysis task supports credit, finance operations and entry-level analyst intent.',
        'angle': 'Use one fictional company across statements, calculate a small, explained set of ratios, show interpretation caveats and avoid treating a ratio as a decision by itself.',
        'owner': 'Keep separate from statement-definition posts; link to credit-analysis basics and financial-accounting content.',
        'links': '/career-guides/credit-analyst/; credit-analysis article; income-statement article; cash-flow article',
        'meta_title': 'Financial Statement Analysis: Ratios and Limits | Centaur',
        'meta_description': 'Follow a fictional company through selected financial ratios, what they can indicate, and why context and source data matter.',
        'source': 'ICAI learning materials; cite primary references for accounting terms and identify all examples as fictional.',
        'guardrail': 'No securities recommendations, credit decisions or universal ratio thresholds.',
    },
    {
        'wave': '1', 'priority': 'P1', 'title': 'Month-End Close: Workflow, Reconciliations and Controls',
        'slug': 'month-end-close-process-finance', 'primary': 'month end close process',
        'support': 'month-end close checklist; reconciliations; close exceptions and controls', 'intent': 'Informational / finance-operations workflow',
        'why': 'Job-relevant workflow term with clear first-party teaching potential and a practical internal link to reconciliation roles.',
        'angle': 'Show a fictional close calendar, owners, evidence, cut-off checks, reconciliations and an exception log; distinguish process examples from any company policy.',
        'owner': 'Do not duplicate the accounting-cycle article; focus on period-end operations, evidence and exception handling.',
        'links': '/resources/reconciliation-in-finance/; finance operations career guide; accounting basics; accounting interview resource',
        'meta_title': 'Month-End Close Process: Workflow and Controls | Centaur',
        'meta_description': 'Understand a month-end close workflow with a fictional checklist covering cut-off, reconciliations, supporting evidence and exceptions.',
        'source': 'Primary accounting references for terminology; example must be reviewed by an experienced finance-operations practitioner.',
        'guardrail': 'No claim that one close calendar or control design applies to every employer.',
    },
    {
        'wave': '1', 'priority': 'P2', 'title': 'Accrual vs Cash Accounting: Timing with Examples',
        'slug': 'accrual-vs-cash-accounting', 'primary': 'accrual vs cash accounting',
        'support': 'cash basis vs accrual basis; revenue and expense timing', 'intent': 'Informational / accounting fundamentals',
        'why': 'A distinct fundamentals comparison present in the keyword/topic inventory but not a reason for another course page.',
        'angle': 'Use a fictional invoice/payment timeline to show timing differences, journal effects and why cash balances differ from reported profit.',
        'owner': 'Link to the accounting-basics resource and financial-accounting process post; keep statement-specific articles focused.',
        'links': '/resources/accounting-basics/; financial accounting article; income-statement article; accounting interview resource',
        'meta_title': 'Accrual vs Cash Accounting: Differences and Example',
        'meta_description': 'Compare accrual and cash accounting through a simple fictional invoice timeline and see how timing changes reported activity.',
        'source': 'ICAI/primary accounting study material; check terminology and India context.',
        'guardrail': 'Do not frame this as tax advice; applicable accounting and tax rules can differ.',
    },
    {
        'wave': '2', 'priority': 'P1', 'title': 'Payment Reconciliation: Breaks, Matching and Controls',
        'slug': 'payment-reconciliation-breaks-controls', 'primary': 'payment reconciliation',
        'support': 'payment reconciliation process; unmatched transactions; settlement breaks', 'intent': 'Informational / operations workflow',
        'why': 'A payment-specific problem-solving intent that extends the site’s broader reconciliation owner into a clear workflow example.',
        'angle': 'Use fictional ledger, gateway and bank records; demonstrate matching keys, one break investigation, documented evidence and escalation.',
        'owner': 'Keep distinct from general reconciliation and securities trade-break examples; no copied real transaction data.',
        'links': '/resources/reconciliation-in-finance/; digital payments operations guide; UPI lifecycle article; payment-processing article',
        'meta_title': 'Payment Reconciliation: Breaks and Controls | Centaur',
        'meta_description': 'Follow a fictional payment mismatch through matching, investigation, evidence capture and escalation in an operations workflow.',
        'source': 'RBI/NPCI primary references for system context; example and control model independently authored.',
        'guardrail': 'Do not imply access to live payment networks or provide consumer-specific financial/legal advice.',
    },
    {
        'wave': '2', 'priority': 'P1', 'title': 'Payment Processing Steps and Exception Handling',
        'slug': 'payment-processing-steps-exceptions', 'primary': 'payment processing',
        'support': 'payment processing steps; authorization; clearing; settlement; exceptions', 'intent': 'Informational / workflow',
        'why': 'Broad process query with strong banking and job-skills relevance; competitor pages support lifecycle explainers as a format.',
        'angle': 'Map a generic payment from initiation to confirmation, name the participant hand-offs, then show where status, duplicate or timeout exceptions enter.',
        'owner': 'Do not repeat the UPI-specific lifecycle article; explain generic stages and link to rail-specific content.',
        'links': 'UPI lifecycle article; digital payments operations guide; payment gateway article; payment reconciliation article',
        'meta_title': 'Payment Processing: Steps and Exceptions | Centaur',
        'meta_description': 'See the main stages of a payment workflow, common hand-offs and how an operations team records and escalates exceptions.',
        'source': 'Use current RBI/NPCI primary sources and identify which details vary by payment rail.',
        'guardrail': 'No universal timing promise; distinguish illustrative workflow from live rail rules.',
    },
    {
        'wave': '2', 'priority': 'P2', 'title': 'Payment Gateway Workflow: Roles, Settlement and Controls',
        'slug': 'payment-gateway-process-controls', 'primary': 'payment gateway process',
        'support': 'payment gateway settlement; payment gateway operations; refunds and reconciliation', 'intent': 'Informational / workflow',
        'why': 'A narrower payment-infrastructure intent that can link into roles and operations learning without claiming software or gateway services.',
        'angle': 'Illustrate a fictional merchant, gateway, acquiring and settlement flow; identify records, refund hand-offs and reconciliation controls.',
        'owner': 'Keep separate from generic payment processing by focusing on gateway participants and records; merge if live SERPs show identical intent.',
        'links': 'payment-processing article; payment-reconciliation article; digital payments career guide; /courses/',
        'meta_title': 'Payment Gateway Process and Controls | Centaur Careers',
        'meta_description': 'Understand a payment gateway workflow, its operational hand-offs, settlement records, refunds and reconciliation checks.',
        'source': 'Current RBI/NPCI primary material and official payment-system references; verify payment terminology.',
        'guardrail': 'No endorsement of a provider or claim that Centaur builds or operates gateways.',
    },
    {
        'wave': '2', 'priority': 'P2', 'title': 'Payment Failures: Reasons, Investigation and Resolution',
        'slug': 'payment-failure-reasons-resolution', 'primary': 'payment failure reasons',
        'support': 'failed payment investigation; payment status mismatch; escalation workflow', 'intent': 'Informational / troubleshooting',
        'why': 'Problem-led query supports payment operations and practical job preparation.',
        'angle': 'Use fictional status examples to distinguish declined, pending, timeout and reversed states; show safe investigation steps and customer/operations hand-offs.',
        'owner': 'Do not repeat the UPI lifecycle overview or issue consumer-specific promises; focus on an operations decision tree.',
        'links': 'UPI lifecycle article; payment-processing article; payment-reconciliation article; digital payments operations guide',
        'meta_title': 'Payment Failure Reasons and Operations Checks | Centaur',
        'meta_description': 'Learn how an operations analyst can classify a fictional payment failure, check records and route unresolved cases safely.',
        'source': 'Official rail/provider documentation and current RBI/NPCI guidance for any live process claim.',
        'guardrail': 'Do not promise reversal timelines or advise users to disclose sensitive credentials.',
    },
    {
        'wave': '2', 'priority': 'P2', 'title': 'Chargebacks and Payment Disputes: Evidence and Operations',
        'slug': 'chargebacks-process-evidence-operations', 'primary': 'chargeback process',
        'support': 'payment dispute workflow; chargeback evidence; dispute operations', 'intent': 'Informational / operations workflow',
        'why': 'Specialized operational topic within digital payments, distinct from payment failures and reconciliation.',
        'angle': 'Explain a generic dispute lifecycle, evidence log and hand-off map with fictional records; identify where card-scheme or provider rules differ.',
        'owner': 'Merge sections if the current India SERP treats chargebacks and payment failure as one answer; do not publish unsupported deadlines.',
        'links': 'payment-processing article; payment-reconciliation article; digital payments career guide; finance operations interview resource',
        'meta_title': 'Chargebacks: Evidence and Operations Workflow | Centaur',
        'meta_description': 'Explore a generic chargeback workflow, the evidence an operations team records and how dispute cases move between participants.',
        'source': 'Current primary card-network/provider rules plus applicable RBI sources; date all timelines.',
        'guardrail': 'Not legal or consumer dispute advice; no unverified deadline, liability or success-rate claim.',
    },
    {
        'wave': '2', 'priority': 'P2', 'title': 'Fraud in Digital Payments: Signals and Controls',
        'slug': 'fraud-digital-payments-signals-controls', 'primary': 'digital payment fraud prevention',
        'support': 'payment fraud signals; transaction controls; exception escalation', 'intent': 'Informational / controls',
        'why': 'Relevant to payments and compliance careers; the keyword-gap export contains finance-adjacent fraud themes but market settings are unknown.',
        'angle': 'Describe high-level control concepts and a fictional alert review; focus on governance, false positives and escalation rather than evasion details.',
        'owner': 'Keep distinct from KYC/AML role and transaction-monitoring content by focusing on payment control design at a high level.',
        'links': '/career-guides/digital-payments-operations/; transaction-monitoring article; KYC/AML guide; payment-failure article',
        'meta_title': 'Digital Payment Fraud: Signals and Controls | Centaur',
        'meta_description': 'Understand high-level digital payment risk signals, operational controls and how a fictional alert should be documented and escalated.',
        'source': 'RBI/NPCI primary guidance; use a qualified compliance reviewer for all fraud-control claims.',
        'guardrail': 'Do not expose bypass tactics, provide fraud-enabling detail, or imply guaranteed fraud detection.',
    },
    {
        'wave': '3', 'priority': 'P2', 'title': 'Sanctions Screening in Compliance Operations',
        'slug': 'sanctions-screening-compliance-operations', 'primary': 'sanctions screening process',
        'support': 'screening operations; false positives; case escalation; audit trail', 'intent': 'Informational / compliance workflow',
        'why': 'A distinct compliance-operations task in the keyword inventory and a clear job-skills topic.',
        'angle': 'Show a fictional match review with data quality, false-positive handling, evidence notes, escalation and audit trail; clearly separate training illustration from policy.',
        'owner': 'Do not duplicate KYC, AML or transaction-monitoring guides; use this page only for screening workflow intent.',
        'links': '/career-guides/kyc-aml-analyst/; KYC/AML course module page; transaction-monitoring article; finance interview resource',
        'meta_title': 'Sanctions Screening: Compliance Operations Workflow',
        'meta_description': 'Follow a fictional sanctions-screening case through match review, false-positive checks, documentation and escalation.',
        'source': 'Current RBI/FATF/UN primary sources as applicable; obtain compliance review and state jurisdiction/date.',
        'guardrail': 'No legal advice, evasion guidance or assertion that one screening process satisfies every regime.',
    },
    {
        'wave': '3', 'priority': 'P3', 'title': 'Suspicious Transaction Reporting: Operational Workflow',
        'slug': 'suspicious-transaction-reporting-explained', 'primary': 'suspicious transaction reporting',
        'support': 'suspicious activity escalation; AML case documentation; reporting governance', 'intent': 'Informational / regulatory workflow',
        'why': 'Potential compliance query opportunity, but high fact and legal risk means publish only after primary-source validation.',
        'angle': 'Describe governance concepts and a fictional internal escalation flow without exposing thresholds, sensitive practices or unsupported filing instructions.',
        'owner': 'Keep distinct from transaction-monitoring alerts by focusing on governance/reporting concepts; consolidate if SERP intent overlaps.',
        'links': 'transaction-monitoring article; KYC/AML analyst guide; sanctions-screening article; KYC/AML learning module',
        'meta_title': 'Suspicious Transaction Reporting: Workflow Basics',
        'meta_description': 'Learn the high-level governance and documentation concepts behind suspicious-transaction escalation, with a fictional workflow.',
        'source': 'Current FIU-IND and RBI primary material; qualified compliance/legal reviewer must verify scope and terminology.',
        'guardrail': 'Do not give legal advice, publish filing thresholds, or treat a draft rule as effective.',
    },
    {
        'wave': '3', 'priority': 'P2', 'title': 'Corporate Actions: Types, Processing and Controls',
        'slug': 'corporate-actions-types-process', 'primary': 'corporate actions process',
        'support': 'corporate action types; event notification; election and reconciliation workflow', 'intent': 'Informational / investment-operations workflow',
        'why': 'Competitor analysis shows finance/investment operations explainers; this can complement the existing corporate-actions career-path post.',
        'angle': 'Use a fictional event lifecycle from announcement to entitlement/election/booking/reconciliation; distinguish mandatory and elective examples without advice.',
        'owner': 'Existing corporate-actions career post owns job-path intent; this proposed URL owns process intent only if live SERPs support a distinct page.',
        'links': '/career-guides/custody-operations/; trade lifecycle guide; investment-banking operations guide; existing corporate-actions career article',
        'meta_title': 'Corporate Actions Process: Types and Controls | Centaur',
        'meta_description': 'Follow a fictional corporate action through event capture, validation, processing, reconciliation and exception controls.',
        'source': 'SEBI, depositories and exchange primary material; verify current market terminology.',
        'guardrail': 'No investment advice, live event feed or corporate-action processing service claim.',
    },
    {
        'wave': '3', 'priority': 'P2', 'title': 'Trade Capture: Data, Validation and Controls',
        'slug': 'trade-capture-process-controls', 'primary': 'trade capture process',
        'support': 'trade booking; trade data validation; front-to-back operations controls', 'intent': 'Informational / investment-operations workflow',
        'why': 'Narrow workflow intent under the trade-lifecycle pillar; supports specialist job and interview questions.',
        'angle': 'Use fictional trade fields to demonstrate validation, duplicate detection, timestamps, correction evidence and escalation.',
        'owner': 'Trade lifecycle guide remains the overview; this article must focus on capture/booking controls and not re-explain every stage.',
        'links': '/career-guides/trade-lifecycle/; investment-banking operations guide; reconciliation resource; interview resource',
        'meta_title': 'Trade Capture Process: Data and Controls | Centaur',
        'meta_description': 'See how a fictional trade record is checked for completeness, duplicates and booking exceptions before downstream processing.',
        'source': 'SEBI/exchange/depository primary education material for market context; workflow example independently authored.',
        'guardrail': 'No live trading instruction or claim that all institutions use the same systems and fields.',
    },
    {
        'wave': '3', 'priority': 'P2', 'title': 'Trade Confirmation and Matching: Exceptions Explained',
        'slug': 'trade-confirmation-matching-process', 'primary': 'trade confirmation and matching',
        'support': 'trade matching process; confirmation breaks; post-trade controls', 'intent': 'Informational / investment-operations workflow',
        'why': 'A specific post-trade task can build on the existing trade lifecycle and settlement-break case without cloning either.',
        'angle': 'Create a fictional two-sided record comparison, identify field mismatches, show exception ownership and evidence before resolution.',
        'owner': 'Keep separate from failed-settlement reasons; merge if the live SERP treats confirmation and matching as the same broad trade-lifecycle intent.',
        'links': '/career-guides/trade-lifecycle/; settlement-break worked example; reconciliation resource; investment-banking operations roles',
        'meta_title': 'Trade Confirmation and Matching: Workflow | Centaur',
        'meta_description': 'Follow a fictional trade-matching break from record comparison to evidence, ownership and escalation in post-trade operations.',
        'source': 'Primary exchange/depository/SEBI material for any current process statements; use dated citations.',
        'guardrail': 'No claim of one universal confirmation standard or current settlement-cycle rule without a primary source.',
    },
    {
        'wave': '3', 'priority': 'P3', 'title': 'Securities Settlement Operations: Stages and Exceptions',
        'slug': 'settlement-process-investment-operations', 'primary': 'securities settlement process',
        'support': 'settlement operations; settlement status; reconciliation and fails', 'intent': 'Informational / investment-operations workflow',
        'why': 'Potentially useful job workflow, but high overlap with the existing trade lifecycle and clearing/settlement pages makes this a merge-first topic.',
        'angle': 'If separate intent is proven, focus only on operations tasks, status checks, records and escalation; otherwise add a missing section to the existing trade lifecycle owner.',
        'owner': 'Default owner: /career-guides/trade-lifecycle/ and existing clearing-and-settlement post. New URL is not approved without distinct query evidence.',
        'links': '/career-guides/trade-lifecycle/; clearing-and-settlement article; settlement-break example; reconciliation resource',
        'meta_title': 'Securities Settlement Operations: Workflow and Checks',
        'meta_description': 'Understand settlement operations through a fictional workflow covering status checks, exception ownership and reconciliation.',
        'source': 'Current SEBI, exchange and depository primary sources; verify any settlement-cycle facts immediately before publication.',
        'guardrail': 'No stale settlement-cycle claim, investment advice or duplicate lifecycle overview.',
    },
    {
        'wave': '4', 'priority': 'P3', 'title': 'Open Banking: APIs, Consent and Operations',
        'slug': 'open-banking-apis-consent-operations', 'primary': 'open banking in India',
        'support': 'account aggregator consent; API operations; data-sharing controls', 'intent': 'Informational / emerging topic',
        'why': 'Competitor/topic inventory includes FinTech and open-banking-adjacent interest; India relevance and SERP intent need fresh validation.',
        'angle': 'Explain the India-specific account-aggregator/data-consent context using current primary sources, a plain-language flow and operational controls; avoid generic global conflation.',
        'owner': 'Keep separate from neo-banking and digital payments; publish only if India results and the business audience support it.',
        'links': '/career-guides/fintech-operations/; neo-banking article; digital payments operations; /courses/ only where relevant',
        'meta_title': 'Open Banking in India: Consent and Operations | Centaur',
        'meta_description': 'Understand India’s consent-led financial data-sharing context, operational hand-offs and control questions using current primary sources.',
        'source': 'Current RBI and official account-aggregator ecosystem sources; subject review required.',
        'guardrail': 'Do not claim all Indian open banking equals one API framework or describe a service Centaur does not provide.',
    },
    {
        'wave': '4', 'priority': 'P1', 'title': 'How to Read Finance Operations Job Descriptions',
        'slug': 'finance-operations-job-description-decoded', 'primary': 'finance operations job description',
        'support': 'finance operations analyst duties; banking operations skills; entry-level finance roles', 'intent': 'Career / job preparation',
        'why': 'Directly supports the user’s job-seeker objective and turns broad role traffic into practical self-assessment.',
        'angle': 'Annotate a fictional job description, translate duties into evidence/skills, flag ambiguous requirements and provide a truthful application checklist.',
        'owner': 'Do not duplicate resume or interview posts; this one decodes role requirements and links readers to those next steps.',
        'links': '/career-guides/finance-operations/; graduate careers guide; resume article; finance interview article',
        'meta_title': 'Finance Operations Job Description: Skills Explained',
        'meta_description': 'Decode a fictional finance operations job description into daily tasks, skills, evidence to prepare and questions to ask.',
        'source': 'Use representative, fictional wording; optionally cite National Career Service for general role context, not live vacancy counts.',
        'guardrail': 'Do not scrape vacancies, imply employer endorsement or promise interview/job results.',
    },
    {
        'wave': '4', 'priority': 'P1', 'title': 'Finance Operations Interview Case: Investigate a Reconciliation Break',
        'slug': 'finance-operations-interview-case-reconciliation-break', 'primary': 'finance operations interview case study',
        'support': 'reconciliation interview question; exception handling; operations analyst interview', 'intent': 'Job preparation / lead support',
        'why': 'A practical original asset is a stronger competitor response than another generic list of interview questions.',
        'angle': 'Create a fictional ledger-versus-source-record case, candidate prompt, answer rubric, communication example and escalation decision; test arithmetic and ambiguity.',
        'owner': 'Keep distinct from the accounting interview resource (technical entries) and IB operations interview page (trade workflow questions).',
        'links': '/resources/accounting-interview-questions/; IB operations interview resource; reconciliation guide; finance operations career guide',
        'meta_title': 'Finance Operations Interview Case: Reconciliation Example',
        'meta_description': 'Practice a fictional finance operations reconciliation case with an answer framework, evidence checklist and escalation rubric.',
        'source': 'Original exercise; named finance-operations subject reviewer; no copied employer interview questions.',
        'guardrail': 'Label fictional; validate every calculation; do not claim an employer uses this exact question.',
    },
]


def sitemap_paths():
    if not SITEMAP.exists():
        raise FileNotFoundError(f'Missing current sitemap: {SITEMAP}')
    xml = SITEMAP.read_text(encoding='utf-8')
    return {
        urlparse(match).path
        for match in re.findall(r'<loc>(.*?)</loc>', xml, flags=re.IGNORECASE)
    }


def page_rows():
    return [[
        index, item['wave'], item['priority'], item['action'], item['title'], item['url'],
        item['primary'], item['support'], item['intent'], item['basis'], item['brief'],
        item['meta_title'], item['meta_description'], item['h1'], item['links'],
        item['guardrail'], item['gate'], item['kpi'],
    ] for index, item in enumerate(PAGE_ITEMS, 1)]


def blog_rows():
    return [[
        index, item['wave'], item['priority'], item['title'], f"/blog/{item['slug']}/",
        item['primary'], item['support'], item['intent'], item['why'], item['angle'],
        item['owner'], item['links'], item['meta_title'], item['meta_description'],
        item['title'], item['source'], item['guardrail'],
        'Live India SERP intent review; originality and overlap check; named finance/BFSI review; source and metadata QA.',
    ] for index, item in enumerate(BLOG_ITEMS, 1)]


def internal_link_rows():
    rows = []
    for index, item in enumerate(PAGE_ITEMS, 1):
        rows.append(['Page action', index, item['url'], item['links'],
                     'Use one or two contextual links in the section that answers the next user question; no forced footer anchors.'])
    for index, item in enumerate(BLOG_ITEMS, 1):
        rows.append(['Blog', index, f"/blog/{item['slug']}/", item['links'],
                     'Link to the relevant hub, one related resource/article, and one appropriate next step; vary natural anchors.'])
    return rows


def sequence_rows():
    return [
        ['0', 'Preflight', 'Before any new content release', 'Verify latest package deployed; live 200/index/canonical/sitemap checks; capture two equal completed 28-day Search Console Query and Page exports; pair organic landing pages with confirmed CRM enquiries.', 'No claims about ranking/indexation based on local build; record filters, property, country/device and deployment date.', 'SEO + developer + analytics + admissions'],
        ['1', 'Page wave 1 + blog wave 1', 'Weeks 1–3 after baseline', 'Review the P0 programme, graduate, investment-operations, trade-lifecycle and KYC owners. Draft the first five accounting/workflow blogs only after India SERP review.', 'Every page change has page-filtered query evidence; each article has a distinct query owner, useful example, named reviewer and primary citations.', 'SEO + subject reviewers'],
        ['2', 'Page wave 2 + blog wave 2', 'Weeks 4–6', 'Review decision, FAQ, interview and retail/payments owners. Publish payment workflow articles in a coherent cluster, not all at once.', 'Compare article SERPs for overlap; link each approved post from its relevant hub; track CTA and qualified enquiries.', 'SEO + content + developer'],
        ['3', 'National/local page wave + blog wave 3', 'Weeks 7–9', 'Audit India/Lucknow/regional pages. Draft compliance and investment-operations articles only after primary-source and expert review.', 'No city copy change without exact-page query evidence and checked local access facts; no duplicate route if an existing owner answers the query.', 'SEO + local/business + compliance reviewers'],
        ['4', 'Remaining blog wave + learn', 'Weeks 10–12', 'Review emerging Open Banking and job-preparation briefs; compare the first completed post-release window and select keep/expand/hold decisions.', 'Do not force publication to hit 20; hold any topic without unique value or verified demand. Record impressions, clicks, index status and qualified leads.', 'SEO + admissions + analytics'],
        ['5', '28/56-day review', 'After each release', 'Inspect URL/query pairs with exact page filters; compare like-for-like periods; review organic lead quality and user progression.', 'Missing data remains unknown, not zero. Keep, improve, consolidate or noindex/redirect only with evidence and an approved map.', 'SEO + analytics + business owner'],
    ]


def method_rows():
    return [
        ['Approved India keyword map', '728 approved phrases assigned to 24 existing URL owners (as recorded in the phase notes)', 'Intent ownership and P0/P1/P2 work-order signals', 'Semrush metric market/database/device are not verified; do not present source estimates as India demand or add the volumes.'],
        ['Semrush competitor keyword-gap inventory', '13,685 source phrases in the imported classification/mapping workflow', 'Topic candidates, competitor overlap and claim boundaries', 'Country/database/language/device unknown; many terms are ambiguous, credential-seeking or out of scope.'],
        ['Competitor Top Pages export', 'Supplied Imarticus top-page CSV', 'Competitor page formats and topical clusters (career, course, comparison, finance explanations)', 'Competitor-tool estimated clicks are not Centaur traffic, verified SERP positions, or proof of query demand.'],
        ['Competitor page/text analysis', 'docs/COMPETITOR_LED_CONTENT_PLAN_2026-09-26.md and docs/BLOG_COMPETITOR_SEO_GUIDANCE_2026-09-26.md', 'Observed content formats; practical workflows and original examples are candidate differentiators', 'Representative samples, not a complete crawl or competitor traffic analysis; intent is an editorial inference.'],
        ['Previous content plans and current sitemap', 'SEO_Next20_Pages_Next20_Blogs_Plan_2026-09-27.xlsx; public/sitemap.xml; current blog post files', 'Exclude the already planned/published first 20+20; page actions retain the canonical owners.', 'Local sitemap proves package inclusion only, not live deployment or Google indexation.'],
        ['Production measurement status', 'docs/PHASE4_EXPAND_FROM_RESULTS_2026-09-26.md and SEO_PLAN_STATUS.md', 'Gate page rewrites/new URLs on live GSC query/page data and qualified enquiry attribution.', 'No comparable production query/page exports, page-filtered query exports, observed index inspection, or confirmed organic leads by landing page were available in the audit.'],
        ['Google Search Central: people-first and spam policies', 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content ; https://developers.google.com/search/docs/essentials/spam-policies', 'Require original, useful content; prohibit doorway-style city scaling and low-value scaled pages.', 'Policy guidance informs the release gate; it does not predict ranking outcomes.'],
        ['Google Search Central: snippets and title links', 'https://developers.google.com/search/docs/appearance/title-link ; https://developers.google.com/search/docs/appearance/snippet', 'Draft unique metadata that accurately reflects visible content.', 'Google can select different title/snippet text; metadata is not a ranking or display guarantee.'],
    ]


def main():
    present_paths = sitemap_paths()
    missing_pages = [item['url'] for item in PAGE_ITEMS if item['url'] not in present_paths]
    if missing_pages:
        raise ValueError('Page action URL not found in current local sitemap: ' + ', '.join(missing_pages))
    duplicate_page_urls = len({item['url'] for item in PAGE_ITEMS}) != len(PAGE_ITEMS)
    if duplicate_page_urls:
        raise ValueError('Page action URLs must be unique.')
    proposed_blog_paths = [f"/blog/{item['slug']}/" for item in BLOG_ITEMS]
    already_live_blogs = [path for path in proposed_blog_paths if path in present_paths]
    if already_live_blogs:
        raise ValueError('Blog candidate already appears in sitemap; revise to refresh/merge: ' + ', '.join(already_live_blogs))
    if len(PAGE_ITEMS) != 20 or len(BLOG_ITEMS) != 20:
        raise ValueError(f'Expected exactly 20 page actions and 20 blog briefs; got {len(PAGE_ITEMS)} and {len(BLOG_ITEMS)}.')

    summary = [
        ['Purpose', 'Next-wave plan after the previous 20-page/20-blog round; includes exactly 20 existing-page actions and 20 candidate blog briefs.'],
        ['Page decision', 'No additional regional or near-duplicate indexable URLs are approved from current evidence. The 20 page rows are measured refresh/monitor actions on current canonical owners.'],
        ['Blog decision', '20 proposed articles from the keyword/topic and competitor analyses. A proposed blog slug is not approved until live India SERP, query ownership, expert review and originality checks pass.'],
        ['Immediate gate', 'Production deployment and measurement first: inspect live status/indexability; export two equal completed 28-day Search Console Query and Page windows; pair landing pages with confirmed organic enquiries.'],
        ['Evidence', 'The approved India keyword map informs intent owners and priority. Semrush estimates and competitor tool clicks remain source signals with unknown market/device settings, not India traffic forecasts.'],
        ['Competitor response', 'Use the observed formats—career paths, comparisons and workflow explainers—while adding original fictional cases, decision rubrics and verified program boundaries; do not copy competitor claims.'],
        ['Regional boundary', 'Keep the existing five regional pages and verified Lucknow access truthful. No new cities, local classrooms or location templates; alter a regional page only after exact-page query evidence and local fact review.'],
        ['Offer boundary', 'Describe only the existing Financial Operations Masterclass and its verified modules/terms. Do not imply standalone courses, qualifications, jobs, salary outcomes or placement guarantees.'],
        ['Content quality', 'No fixed word-count target. Each approved piece must fully answer one distinct intent, add original value, cite primary sources for current facts, and provide a useful contextual next step.'],
        ['Outcome', 'This is a prioritized work plan, not a promise of rankings, traffic, leads, indexation or top placement.'],
    ]

    page_headers = ['Rank', 'Wave', 'Priority', 'Recommended action', 'Page title', 'Canonical URL', 'Primary keyword', 'Supporting queries', 'Intent', 'Evidence basis', 'Content improvement brief', 'Draft title tag', 'Draft meta description', 'Proposed H1', 'Internal destinations', 'Claim guardrail', 'Evidence/publication gate', 'Success measures']
    blog_headers = ['Rank', 'Wave', 'Priority', 'Blog title', 'Proposed URL', 'Primary keyword', 'Supporting queries', 'Intent', 'Why selected', 'Distinctive content brief', 'Existing owner/overlap rule', 'Internal destinations', 'Draft title tag', 'Draft meta description', 'Proposed H1', 'Primary-source/reviewer requirement', 'Claim guardrail', 'Go/no-go gate']
    sheets = [
        ('Executive Summary', 'Next 20 page actions and next 20 blog briefs. Existing routes are retained; unverified keyword volumes are not converted into forecasts.', ['Area', 'Plan'], summary),
        ('Next 20 Page Actions', 'All listed page URLs are existing sitemap owners. Refresh only where production query and lead data shows an answer gap; regional pages are gated more strictly.', page_headers, page_rows()),
        ('Next 20 Blog Briefs', 'Candidate content topics after filtering the earlier implementation round and current blog inventory. New URLs require a distinct, useful answer and live SERP review.', blog_headers, blog_rows()),
        ('Publishing Sequence', 'Measurement-first sequence with release, reviewer, internal-link and decision gates.', ['Step', 'Wave', 'Timing', 'Work', 'Acceptance gate', 'Owner'], sequence_rows()),
        ('Internal Link Map', 'Suggested contextual routes from each planned page action or article to relevant existing owners.', ['Content type', 'Rank', 'Source URL', 'Contextual link destinations', 'Placement rule'], internal_link_rows()),
        ('Evidence and Guardrails', 'Source audit trail and explicit limits on keyword, competitor, regional and live performance evidence.', ['Source', 'Scope', 'What it informs', 'Limitation'], method_rows()),
    ]
    workbook.write_workbook(sheets)
    print(f'Created {OUTPUT}')
    print(f'page_actions={len(PAGE_ITEMS)} blog_briefs={len(BLOG_ITEMS)} current_sitemap_paths={len(present_paths)}')
    print('page_new_urls=0; blog_candidate_urls=20 (all require separate approval gate)')


if __name__ == '__main__':
    main()
