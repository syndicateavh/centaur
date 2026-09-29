import math
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import analyze_top_pages as top_pages
import create_100_page_blog_plan as full_plan
import create_seo_keyword_plan as workbook


ROOT = Path(__file__).resolve().parents[1]
TOP_PAGES = Path(r'C:\Users\Virat Singh\Downloads\TopPages_imarticus-org_9_27_2026_SEO (1).csv')
workbook.OUTPUT = ROOT / 'SEO_Top20_Pages_Top20_Blogs_Execution_Pack_2026-09-27.xlsx'
SITE = 'https://centaurcareers.in'


def clean(value):
    return ' '.join(str(value or '').split())


def trim(value, limit):
    value = clean(value)
    if len(value) <= limit:
        return value
    return value[:limit - 1].rsplit(' ', 1)[0] + '…'


def broad_cluster(item):
    return clean(item.get('cluster', '').split('/')[0]).lower()


def intent_family(item):
    text = f"{item['title']} {item['primary']}".lower()
    if 'reconciliation' in text:
        return 'reconciliation'
    if 'investment banking' in text:
        return 'investment banking'
    if 'accounting' in text or 'balance sheet' in text or 'financial statement' in text:
        return 'accounting and statements'
    if 'kyc' in text or 'aml' in text or 'compliance' in text:
        return 'kyc aml compliance'
    if 'payment' in text or 'upi' in text or 'fintech' in text or 'neo-bank' in text:
        return 'payments fintech'
    if 'retail banking' in text or 'banking' in text:
        return 'banking'
    if 'career' in text or 'job' in text or 'analyst' in text:
        return 'career jobs'
    return broad_cluster(item)


def match_top_page(item, rows):
    terms = [full_plan.norm(term) for term in item.get('evidence_terms', [])]
    matches = []
    for row in rows:
        text = full_plan.norm(f"{row.get('Title', '')} {row.get('Top KW', '')}")
        if any(term and (term in text or text in term) for term in terms):
            matches.append(row)
    return max(matches, key=lambda row: (row['Est Monthly SEO Clicks'], row['Top KW Clicks']), default=None)


def lead_score(item, kind):
    qualification_text = f"{item['title']} {item['primary']}".lower()
    if kind == 'blog':
        base = {'career': 78, 'decision': 73, 'informational': 58}.get(item['intent'], 55)
        if any(word in item['primary'] for word in ('reconciliation', 'interview', 'career', 'finance jobs', 'process associate')):
            base += 8
        if 'cfa' in qualification_text or 'frm' in qualification_text:
            base -= 18
        elif 'financial modelling' in qualification_text or 'business analyst' in qualification_text:
            base -= 10
        return min(100, base)
    page_type = item.get('page_type', '')
    mapping = {
        'Commercial authority': 98,
        'Commercial landing': 94,
        'Module information landing': 88,
        'Audience landing': 91,
        'Delivery landing': 88,
        'Syllabus landing': 93,
        'Decision-support landing': 96,
        'Trust / terms landing': 97,
        'Support landing': 88,
        'Regional access landing': 72,
        'Career pillar': 84,
        'Career guide': 80,
        'Role guide': 77,
        'Role hub': 80,
        'Comparison guide': 82,
        'Comparison page': 84,
        'Definition pillar': 67,
        'Workflow guide': 73,
        'Resource authority': 76,
        'Resource guide': 72,
        'Learning guide': 73,
        'Glossary hub': 65,
        'Industry guide': 66,
        'Roadmap page': 82,
        'FAQ / trust page': 94,
    }
    score = mapping.get(page_type, 70)
    if item['intent'] == 'commercial':
        score += 2
    if 'cfa' in qualification_text or 'frm' in qualification_text:
        score -= 18
    elif 'financial modelling' in qualification_text or 'business analyst' in qualification_text or 'financial analyst' in qualification_text:
        score -= 10
    return min(100, score)


def enrich(item, corpus, top_rows, kind):
    evidence = full_plan.evidence_for(item['evidence_terms'], corpus)
    competitor_page = match_top_page(item, top_rows)
    volume = evidence['volume']
    competitor_clicks = competitor_page['Est Monthly SEO Clicks'] if competitor_page else 0
    reach = min(100, round(math.log10(1 + max(volume, 1)) * 10 + min(25, competitor_clicks / 50) + min(15, evidence.get('source_count', 0) * 3) + (8 if competitor_page else 0)))
    lead = lead_score(item, kind)
    blended = round(reach * 0.58 + lead * 0.42)
    return {**item, 'evidence': evidence, 'competitor_page': competitor_page, 'reach_score': reach, 'lead_score': lead, 'blended_score': blended}


def select_top(items, kind):
    ranked = sorted(items, key=lambda row: (row['blended_score'], row['reach_score'], row['lead_score'], row['evidence']['volume']), reverse=True)
    selected = []
    cluster_counts = Counter()
    family_counts = Counter()
    family_cap = 2 if kind == 'blog' else 3
    for row in ranked:
        cluster = broad_cluster(row)
        family = intent_family(row)
        if cluster_counts[cluster] >= 6:
            continue
        current_family_cap = 1 if kind == 'blog' and family == 'reconciliation' else family_cap
        if family_counts[family] >= current_family_cap:
            continue
        selected.append(row)
        cluster_counts[cluster] += 1
        family_counts[family] += 1
        if len(selected) == 20:
            break
    if len(selected) < 20:
        for row in ranked:
            if row not in selected:
                selected.append(row)
            if len(selected) == 20:
                break
    selected.sort(key=lambda row: (row['blended_score'], row['reach_score'], row['lead_score']), reverse=True)
    return selected


def schema_for(item, kind):
    if kind == 'blog':
        return 'BlogPosting + BreadcrumbList + Person/Organization; FAQPage only for visible maintained FAQs'
    if item.get('page_type') in {'Commercial authority', 'Commercial landing', 'Module information landing', 'Audience landing', 'Delivery landing', 'Syllabus landing', 'Trust / terms landing', 'Support landing'}:
        return 'WebPage + Organization + BreadcrumbList; Course only if real program fields are visible'
    if item.get('page_type') == 'Regional access landing':
        return 'WebPage + BreadcrumbList + Organization; LocalBusiness only if a real local location exists'
    return 'WebPage or Article + BreadcrumbList + Organization'


def metadata_for(item, kind):
    title = item['title']
    primary = item['primary']
    if kind == 'blog':
        description = f"Learn {primary} with a practical finance and banking explanation, examples, workflow context, role relevance and next steps."
    else:
        description = f"Explore {primary} with practical finance, banking and operations guidance, the relevant Centaur module and current access or terms."
    return trim(f'{title} | Centaur Careers', 60), trim(description, 158), title, f'{SITE}{item["slug"]}'


def targets_for(item, kind):
    text = f"{item['title']} {item['cluster']} {item.get('module', '')}".lower()
    if 'kyc' in text or 'aml' in text or 'compliance' in text or 'financial crime' in text:
        return [('/courses/kyc-aml/', 'KYC and AML compliance module'), ('/career-guides/kyc-aml-analyst/', 'KYC/AML analyst career guide'), ('/resources/finance-gk/', 'finance and BFSI basics'), ('/resources/finance-interview-questions/', 'finance interview questions')]
    if 'payment' in text or 'upi' in text or 'fintech' in text or 'neo-bank' in text or 'digital bank' in text:
        return [('/courses/digital-payments/', 'Digital Payments module'), ('/courses/fintech/', 'FinTech and Neo-Banking module'), ('/career-guides/digital-payments-operations/', 'payments operations career guide'), ('/contact/', 'ask about the current cohort and terms')]
    if 'investment banking' in text or 'trade' in text or 'settlement' in text or 'fund accounting' in text or 'corporate action' in text:
        return [('/courses/investment-banking-operations/', 'Investment Banking Operations module'), ('/career-guides/investment-banking-operations/', 'investment banking operations career guide'), ('/career-guides/trade-lifecycle/', 'trade lifecycle guide'), ('/resources/reconciliation-in-finance/', 'reconciliation in finance')]
    if 'account' in text or 'financial statement' in text or 'balance sheet' in text or 'cost accounting' in text:
        return [('/resources/accounting-basics/', 'accounting basics'), ('/resources/reconciliation-in-finance/', 'reconciliation in finance'), ('/courses/finance-operations/', 'Finance Operations module'), ('/resources/accounting-interview-questions/', 'accounting interview questions')]
    if 'retail banking' in text or 'banking' in text or 'loan' in text or 'credit' in text or 'risk' in text:
        return [('/courses/retail-banking/', 'Retail Banking module'), ('/courses/finance-operations/', 'Finance Operations module'), ('/career-guides/finance-operations/', 'finance operations career guide'), ('/resources/finance-interview-questions/', 'finance interview questions')]
    if 'career' in text or 'job' in text or 'analyst' in text or kind == 'blog':
        return [('/courses/', 'Financial Operations Masterclass'), ('/career-guides/', 'finance career guides'), ('/resources/finance-interview-questions/', 'finance interview questions'), ('/placements/', 'current career-support terms')]
    return [('/courses/', 'Financial Operations Masterclass'), ('/career-guides/', 'finance career guides'), ('/resources/', 'finance career resources'), ('/contact/', 'current cohort and terms')]


def external_profile(item):
    text = f"{item['title']} {item['cluster']} {item.get('module', '')}".lower()
    if 'kyc' in text or 'aml' in text or 'compliance' in text or 'financial crime' in text:
        return [
            ('RBI KYC Directions / amendment', 'https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12866', 'Cite for current KYC direction and amendment claims; check the latest version before release.', 'Quarterly'),
            ('FATF Recommendations', 'https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html', 'Cite for global AML/CFT definitions and principles.', 'Quarterly'),
        ]
    if 'payment' in text or 'upi' in text or 'fintech' in text or 'neo-bank' in text or 'digital bank' in text:
        return [
            ('NPCI UPI Product Statistics', 'https://www.npci.org.in/product/upi/product-statistics', 'Use dated UPI volume/value data and label the reporting month.', 'Monthly'),
            ('RBI Payment and Settlement Systems', 'https://rbi.org.in/scripts/RTGS_Notification.aspx?Id=12133', 'Cite payment-system ownership, access and settlement facts.', 'Quarterly'),
        ]
    if 'market' in text or 'capital' in text or 'derivative' in text or 'mutual fund' in text or 'investment banking' in text or 'trade' in text:
        return [
            ('SEBI Investor Education Material', 'https://investor.sebi.gov.in/iematerial.html', 'Cite definitions for securities markets, KYC, mutual funds, corporate actions and derivatives.', 'Quarterly'),
            ('SEBI Securities Market Guide', 'https://investor.sebi.gov.in/securities-stockmarket.html', 'Cite primary/secondary market, instruments and risk context; avoid investment advice.', 'Quarterly'),
        ]
    if 'account' in text or 'financial statement' in text or 'balance sheet' in text or 'cost accounting' in text:
        return [
            ('IFRS Accounting Standards Navigator', 'https://www.ifrs.org/issued-standards/list-of-standards/', 'Use only for standards context; explain that local accounting requirements may differ.', 'Quarterly'),
            ('RBI official site', 'https://www.rbi.org.in/', 'Use for India-specific banking, financial reporting or payment-system facts when applicable.', 'Before every update'),
        ]
    return [
        ('National Career Service', 'https://www.ncs.gov.in/', 'Use as a general career-market reference; cite dated role facts rather than copying listings.', 'Monthly'),
        ('RBI official site', 'https://www.rbi.org.in/', 'Use for current India banking and finance facts where relevant.', 'Before every update'),
    ]


def authority_requirements(item, kind):
    if kind == 'blog':
        return 'Named author; finance/BFSI reviewer; last-reviewed date; original example or workflow; source list; correction path; no anonymous AI-only draft.'
    if item.get('page_type') == 'Regional access landing':
        return 'Named local reviewer; real access details; local proof or market evidence; unique copy; contact and terms; no city-name template.'
    return 'Named subject reviewer; exact current offer/terms; original curriculum or workflow evidence; visible contact/about/trust links; updated date.'


def word_target(item, kind):
    if kind == 'blog':
        return 1800
    page_type = item.get('page_type', '')
    if 'Commercial' in page_type or 'Syllabus' in page_type or 'Trust' in page_type or 'Comparison' in page_type:
        return 1000
    if 'Regional' in page_type:
        return 700
    if 'Role' in page_type or 'Career' in page_type:
        return 850
    return 900


def page_rows(selected):
    rows = []
    for rank, item in enumerate(selected, 1):
        title, description, h1, canonical = metadata_for(item, 'page')
        e = item['evidence']
        tp = item['competitor_page'] or {}
        links = targets_for(item, 'page')
        external = external_profile(item)
        tier = 'Launch first' if rank <= 5 else 'High priority' if rank <= 12 else 'Authority/support'
        rows.append([
            rank, tier, item['blended_score'], item['reach_score'], item['lead_score'], item['score'] if 'score' in item else '', item['status'], item['page_type'], item['title'], item['slug'], item['cluster'], item['primary'], item['secondary'], item['intent'], e.get('keyword', ''), e.get('matched_term', ''), item['fit'],
            int(e['volume']) if e['volume'] else '', int(e['difficulty']) if e.get('difficulty') else '', int(e['clicks']) if e.get('clicks') else '', e['source'], tp.get('Title', ''), int(tp.get('Est Monthly SEO Clicks', 0)) if tp else '', tp.get('Top KW', '') if tp else '',
            item['offer'], item['angle'], item['cta'], trim(title, 60), trim(description, 158), h1, canonical, 'index,follow', schema_for(item, 'page'), word_target(item, 'page'), ', '.join(f'{SITE}{link[0]}' for link in links), ' | '.join(link[1] for link in links), '5-10 contextual links from the matching hub, related guides and high-authority resources', ' | '.join(f'{name}: {url}' for name, url, _, _ in external), authority_requirements(item, 'page'), 'Lead CTA click; WhatsApp/form submit; qualified-lead rate', item['guardrail'], f'Wave {item["wave"]}',
        ])
    return rows


def blog_rows(selected):
    rows = []
    for rank, item in enumerate(selected, 1):
        title, description, h1, canonical = metadata_for(item, 'blog')
        e = item['evidence']
        tp = item['competitor_page'] or {}
        links = targets_for(item, 'blog')
        external = external_profile(item)
        tier = 'Launch first' if rank <= 5 else 'High priority' if rank <= 12 else 'Authority/support'
        rows.append([
            rank, tier, item['blended_score'], item['reach_score'], item['lead_score'], item['score'] if 'score' in item else '', 'New or refresh', item['title'], item['slug'], item['cluster'], item['primary'], item['secondary'], item['intent'], e.get('keyword', ''), e.get('matched_term', ''),
            int(e['volume']) if e['volume'] else '', int(e['difficulty']) if e.get('difficulty') else '', int(e['clicks']) if e.get('clicks') else '', e['source'], tp.get('Title', ''), int(tp.get('Est Monthly SEO Clicks', 0)) if tp else '', tp.get('Top KW', '') if tp else '', item['module'], item['angle'], item['cta'], trim(title, 60), trim(description, 158), h1, canonical, 'index,follow', schema_for(item, 'blog'), word_target(item, 'blog'), ', '.join(f'{SITE}{link[0]}' for link in links), ' | '.join(link[1] for link in links), '5-10 contextual links: hub, module, related blog, resource and one lead destination', ' | '.join(f'{name}: {url}' for name, url, _, _ in external), authority_requirements(item, 'blog'), 'Organic landing clicks; CTA click; WhatsApp/form submit; qualified-lead rate', item['guardrail'], f'Wave {item["wave"]}',
        ])
    return rows


def internal_link_rows(selected_pages, selected_blogs):
    rows = []
    for kind, selected in (('Page', selected_pages), ('Blog', selected_blogs)):
        for rank, item in enumerate(selected, 1):
            destinations = targets_for(item, 'page' if kind == 'Page' else 'blog')
            for position, (path, anchor) in enumerate(destinations, 1):
                source_url = item['slug']
                rows.append([kind, rank, item['title'], source_url, position, anchor, f'{SITE}{path}', 'Contextual in-body link', 'High' if position <= 2 else 'Medium', 'Place after the section that proves why the destination is relevant; vary anchors and avoid repeating the exact primary keyword.'])
    return rows


def external_rows(selected_pages, selected_blogs):
    rows = []
    for kind, selected in (('Page', selected_pages), ('Blog', selected_blogs)):
        for rank, item in enumerate(selected, 1):
            for name, url, use, cadence in external_profile(item):
                rows.append([kind, rank, item['title'], item['slug'], name, url, 'Editorial citation', use, cadence, 'No sponsored attribute for a normal citation; use rel=sponsored only for paid placement.'])
            rows.append([kind, rank, item['title'], item['slug'], 'BFSI / university / practitioner outreach', '', 'Earned-link prospecting', 'Pitch an original workflow diagram, data brief, interview or student career resource; never buy bulk links.', 'Quarterly campaign', 'Keep outreach human, relevant and transparent; no automated guest-post network.'])
    return rows


def outreach_rows(selected_pages, selected_blogs):
    rows = []
    assets = [
        ('Reconciliation workflow visual', 'Reconciliation and break-management explainer', 'Finance operations communities, accounting educators, BFSI practitioners', 'High'),
        ('Trade lifecycle diagram', 'Capture-to-settlement visual with fictional records', 'Investment-operations practitioners, finance educators, career communities', 'High'),
        ('KYC/AML update brief', 'Source-dated India KYC/AML explainer', 'Compliance communities, university finance clubs, regulatory education audiences', 'High'),
        ('UPI/payment operations data brief', 'Dated NPCI/RBI statistics with methodology', 'FinTech publications, payment analysts, education newsletters', 'High'),
        ('Finance career decision map', 'BCom/graduate role map and interview checklist', 'University placement cells, student communities and career advisors', 'Medium'),
    ]
    for name, asset, prospects, priority in assets:
        rows.append([name, asset, prospects, 'Expert contribution, original data or visual asset', 'Do not request exact-match anchors; ask for an editorially useful reference.', priority, 'Earned links, referral sessions, brand searches and assisted leads'])
    return rows


def measurement_rows(selected_pages, selected_blogs):
    rows = []
    for rank, item in enumerate(selected_pages, 1):
        rows.append(['Page', rank, item['slug'], 'organic_landing_view; lead_cta_click; whatsapp_click; course_form_start; course_form_submit', 'GSC query/page performance; CTA CTR; lead quality; assisted conversion', '28-day baseline, then 56-day decision', 'Keep, improve, consolidate or redirect based on intent and lead quality.'])
    for rank, item in enumerate(selected_blogs, 1):
        rows.append(['Blog', rank, item['slug'], 'organic_landing_view; scroll_75; internal_link_click; lead_cta_click; whatsapp_click', 'GSC impressions/clicks; query coverage; engaged sessions; assisted leads', '28-day baseline, then 56-day decision', 'Refresh if impressions grow without clicks; improve CTA if engagement grows without leads.'])
    return rows


def checklist_rows():
    return [
        ['Indexing', 'Every published URL has 200 status, index,follow, self-canonical and sitemap inclusion.', 'Developer + SEO', 'Before release'],
        ['Metadata', 'Unique 30-60 character title, 120-160 character description, one H1 and matching search intent.', 'SEO + content', 'Every URL'],
        ['Content depth', 'Pages meet the type target; blogs target at least 1,500 words with original examples.', 'Content + reviewer', 'Every URL'],
        ['Internal links', 'Commercial pages have 3-5 useful links; blogs have 5-10 contextual links.', 'SEO + developer', 'Every URL'],
        ['External citations', 'Changing facts use official or primary sources with dates and source list.', 'Subject reviewer', 'Before release'],
        ['E-E-A-T', 'Named author/reviewer, experience, sources, update date, contact/about/trust links and corrections path.', 'Content lead', 'Every URL'],
        ['Schema', 'JSON-LD matches visible content; absolute URLs, valid dates and no placeholders.', 'Developer', 'Before release'],
        ['Regional pages', 'Unique local value, access details and proof; no city template at scale.', 'SEO + local reviewer', 'Before indexation'],
        ['Conversion', 'CTA is visible after the answer and uses approved cohort, fee and guarantee language.', 'Admissions + content', 'Every URL'],
        ['Measurement', 'GA4 events and GSC URL/query tracking are tested in production.', 'Analytics + developer', 'Before release'],
    ]


def main():
    corpus = full_plan.compact_keyword_rows()
    all_top_rows = top_pages.load(TOP_PAGES)
    relevant_top_rows = [row for row in all_top_rows if top_pages.RELEVANT.search(row['Title'] + ' ' + row['Top KW']) and not top_pages.NOISE.search(row['Title'] + ' ' + row['Top KW'])]
    page_items = [enrich(item, corpus, relevant_top_rows, 'page') for item in full_plan.make_pages()]
    blog_items = [enrich(item, corpus, relevant_top_rows, 'blog') for item in full_plan.make_blogs()]
    selected_pages = select_top(page_items, 'page')
    selected_blogs = select_top(blog_items, 'blog')
    for item in selected_pages + selected_blogs:
        item['score'] = full_plan.impact_score(item, item['evidence'])

    summary = [
        ['Purpose', 'Top 20 pages and top 20 blogs selected from the accumulated 100-page/100-blog plan for a combined reach and lead-generation execution order.'],
        ['Ranking method', 'Reach score uses observed source volume, competitor top-page estimated clicks and cross-dataset support. Lead score uses commercial fit, module relevance, career intent and CTA readiness. Blended score = 58% reach + 42% lead.'],
        ['Data limitation', 'Scores prioritize work; they do not guarantee Google rankings, traffic or leads. Do not sum search volumes from different exports.'],
        ['Top-page pattern', 'Use one commercial authority plus high-reach information pages that route readers to the matching module, current terms, interview resource or contact path.'],
        ['Top-blog pattern', 'Use complete definition/process/career pages with original examples, sources, visible authorship and contextual CTAs—not thin keyword variations.'],
        ['Internal SEO', 'Every selected URL has a hub, related-page and conversion-link path. Implement 5-10 contextual links for blogs and 3-5 for commercial pages.'],
        ['External SEO', 'Cite primary regulators and standards sources for changing facts, then earn links through original workflow visuals, data briefs, interviews and university/BFSI resources.'],
        ['Current offer alignment', 'Keep one Financial Operations Masterclass with module information; verify live cohort, fees, certificate, guarantee and employer wording before publishing.'],
    ]

    page_headers = ['Rank', 'Tier', 'Blended score', 'Reach score', 'Lead score', 'Source impact score', 'Status', 'Page type', 'Page title', 'URL', 'Cluster', 'Primary keyword', 'Secondary terms', 'Intent', 'Observed evidence keyword', 'Matched evidence term', 'Business fit', 'Observed volume', 'Observed KD', 'Observed clicks', 'Best evidence source', 'Competitor top page', 'Competitor est. clicks', 'Competitor top keyword', 'Offer/module relationship', 'Content outline', 'Primary CTA', 'Proposed title', 'Meta description', 'H1', 'Canonical', 'Robots', 'Schema', 'Word target', 'Internal destination URLs', 'Internal anchor themes', 'Internal link requirement', 'External citation sources', 'E-E-A-T requirement', 'KPI', 'Guardrail', 'Wave']
    blog_headers = ['Rank', 'Tier', 'Blended score', 'Reach score', 'Lead score', 'Source impact score', 'Status', 'Blog title', 'URL', 'Cluster', 'Primary keyword', 'Secondary terms', 'Intent', 'Observed evidence keyword', 'Matched evidence term', 'Observed volume', 'Observed KD', 'Observed clicks', 'Best evidence source', 'Competitor top page', 'Competitor est. clicks', 'Competitor top keyword', 'Course/module bridge', 'Content angle', 'CTA', 'Proposed title', 'Meta description', 'H1', 'Canonical', 'Robots', 'Schema', 'Word target', 'Internal destination URLs', 'Internal anchor themes', 'Internal link requirement', 'External citation sources', 'E-E-A-T requirement', 'KPI', 'Guardrail', 'Wave']
    sheets = [
        ('Executive Summary', 'Top 20 pages and top 20 blogs from the accumulated SEO plan. Reach and lead scores are planning signals, not ranking guarantees.', ['Area', 'Decision'], summary),
        ('Top 20 Pages', 'Priority pages ranked by blended reach and lead potential. Validate URL ownership against the current sitemap before implementation.', page_headers, page_rows(selected_pages)),
        ('Top 20 Blogs', 'Priority blog topics ranked by blended reach and lead potential. Refresh an existing canonical page instead of creating a duplicate intent URL.', blog_headers, blog_rows(selected_blogs)),
        ('Internal Link Map', 'Recommended contextual link graph for the 40 priority URLs. Use varied anchors and link only where the destination answers the section.', ['Content type', 'Rank', 'Source title', 'Source URL', 'Position', 'Anchor theme', 'Destination URL', 'Link type', 'Priority', 'Placement rule'], internal_link_rows(selected_pages, selected_blogs)),
        ('External SEO Sources', 'Primary citation sources and safe external-link rules for the 40 priority URLs. External references should support claims, not substitute for original expertise.', ['Content type', 'Rank', 'Target title', 'Target URL', 'External source', 'Source URL', 'Link purpose', 'Use on page', 'Refresh cadence', 'Link attribute / policy'], external_rows(selected_pages, selected_blogs)),
        ('Digital PR Outreach', 'Earned-link campaigns built around original assets. No bulk directories, paid link schemes or exact-match anchor requests.', ['Asset', 'Linkable asset', 'Prospect group', 'Outreach angle', 'Anchor policy', 'Priority', 'Success signal'], outreach_rows(selected_pages, selected_blogs)),
        ('Metadata and Schema', 'Implementation checklist is included in the two ranked tabs; this sheet lists shared metadata, schema and canonical rules.', ['Element', 'Implementation rule', 'Owner', 'Validation'], checklist_rows()),
        ('Measurement Plan', 'GA4, Search Console and lead-quality measurements for the selected pages and blogs.', ['Content type', 'Rank', 'URL', 'GA4 events', 'Search/lead metrics', 'Review window', 'Decision rule'], measurement_rows(selected_pages, selected_blogs)),
    ]
    workbook.write_workbook(sheets)
    print(f'Created {workbook.OUTPUT}')
    print(f'pages={len(selected_pages)} blogs={len(selected_blogs)} relevant_top_pages={len(relevant_top_rows)} corpus={len(corpus)}')
    print('top_pages=' + ' | '.join(item['title'] for item in selected_pages[:5]))
    print('top_blogs=' + ' | '.join(item['title'] for item in selected_blogs[:5]))


if __name__ == '__main__':
    main()
