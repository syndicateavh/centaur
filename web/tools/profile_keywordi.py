import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import analyze_keyword_sources as source


def family(keyword):
    text = keyword.lower()
    groups = [
        ('exclude_broad_tech', ['digital marketing', 'machine learning', 'data science', 'data analyst', 'deep learning', 'python', 'coding', 'web development', 'cyber security', 'artificial intelligence']),
        ('credentials', ['cfa', 'frm', 'nism', 'acca', 'cma', 'ca ', 'chartered accountant', 'mba']),
        ('investment_banking', ['investment banking', 'investment banker', 'investment bank', 'trade life cycle', 'trade lifecycle', 'corporate action', 'fund accounting']),
        ('banking', ['banking', 'bank', 'retail bank', 'commercial bank', 'nbfc', 'loan', 'credit', 'mortgage', 'lending']),
        ('accounting', ['accounting', 'accountant', 'balance sheet', 'financial statement', 'trial balance', 'reconciliation', 'cost accounting', 'bookkeeping', 'journal entry', 'golden rules']),
        ('risk_compliance', ['risk management', 'risk analyst', 'kyc', 'aml', 'anti money laundering', 'compliance', 'fraud', 'financial crime', 'sanctions']),
        ('payments_fintech', ['fintech', 'payment', 'upi', 'digital banking', 'neobank', 'wallet']),
        ('markets_investments', ['stock market', 'financial market', 'capital market', 'mutual fund', 'derivatives', 'financial instrument', 'wealth management', 'treasury']),
        ('career_jobs', ['career', 'jobs', 'job', 'salary', 'interview', 'fresher', 'after graduation', 'process associate', 'operations analyst', 'analyst']),
        ('education_course', ['course', 'training', 'class', 'program', 'certification', 'institute']),
    ]
    for name, terms in groups:
        if any(term in text for term in terms):
            return name
    return 'other'


def main(path):
    rows = source.read_rows(path)
    relevant = [
        {
            **r,
            'volume': source.number(r.get('Search Volume')),
            'difficulty': source.number(r.get('Ranking Difficulty')),
            'seo_clicks': source.number(r.get('Total Monthly Clicks')),
            'rank': source.number(r.get('Number of Ranking Homepages')),
            'url': r.get('Serp First Result', ''),
            'keyword': r.get('Keyword', ''),
        }
        for r in rows
        if source.is_relevant(r['Keyword'])
    ]
    print(f'total={len(rows)} relevant={len(relevant)}')
    print('families:')
    counts = Counter(family(r['Keyword']) for r in relevant)
    for name, count in counts.most_common():
        print(f'  {name}: {count}')
    print('top_relevant_by_volume:')
    for r in sorted(relevant, key=lambda x: (x['volume'], x['seo_clicks'], -x['difficulty']), reverse=True):
        print('{keyword}\t{volume}\t{difficulty}\t{seo_clicks}\t{rank}\t{url}'.format(**r))


if __name__ == '__main__':
    main(sys.argv[1])
