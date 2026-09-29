import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path


RELEVANT = re.compile(
    r'\b(finance|financial|bank|banking|investment|nbfc|loan|credit|risk|kyc|aml|compliance|fraud|fintech|payment|upi|swift|reconciliation|settlement|corporate action|fund accounting|accounting|analyst|bfs[i| ]|stock market|mutual fund|wealth management|insurance|treasury|derivatives|capital market|financial crime|operations|commercial bank|retail banking|cfa|frm)\b',
    re.I,
)
NOISE = re.compile(r'\b(digital marketing|data analyst|data science|data scientist|coding|python|java|web development|full stack|graphic design|seo course|social media|machine learning|artificial intelligence|cyber security|keyword planner)\b', re.I)


def number(value):
    try:
        return float(str(value).replace(',', '').strip())
    except (TypeError, ValueError):
        return 0.0


def load(path):
    with Path(path).open('r', encoding='utf-8-sig', newline='') as handle:
        rows = []
        for row in csv.DictReader(handle):
            row['Keyword Count'] = number(row['Keyword Count'])
            row['Est Monthly SEO Clicks'] = number(row['Est Monthly SEO Clicks'])
            row['Top KW Position'] = number(row['Top KW Position'])
            row['Top KW Search Volume'] = number(row['Top KW Search Volume'])
            row['Top KW Clicks'] = number(row['Top KW Clicks'])
            rows.append(row)
        return rows


def main(path):
    rows = load(path)
    relevant = [row for row in rows if RELEVANT.search(row['Title'] + ' ' + row['Top KW']) and not NOISE.search(row['Title'] + ' ' + row['Top KW'])]
    top_relevant = sorted(relevant, key=lambda row: (row['Est Monthly SEO Clicks'], row['Top KW Clicks']), reverse=True)
    top_all = sorted(rows, key=lambda row: row['Est Monthly SEO Clicks'], reverse=True)
    output = {
        'counts': {'total': len(rows), 'relevant': len(relevant)},
        'top_all': top_all[:40],
        'top_relevant': top_relevant[:120],
        'title_words': Counter(word.lower() for row in relevant for word in re.findall(r'[A-Za-z][A-Za-z/&-]+', row['Title'])).most_common(30),
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main(sys.argv[1])
