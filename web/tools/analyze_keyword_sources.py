import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

NS = {
    'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'rel': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'pkgrel': 'http://schemas.openxmlformats.org/package/2006/relationships',
}


def col_index(ref):
    value = 0
    for ch in ''.join(c for c in ref if c.isalpha()):
        value = value * 26 + ord(ch.upper()) - 64
    return value - 1


def read_rows(path):
    with zipfile.ZipFile(path) as zf:
        names = set(zf.namelist())
        shared = []
        if 'xl/sharedStrings.xml' in names:
            root = ET.fromstring(zf.read('xl/sharedStrings.xml'))
            for si in root.findall('main:si', NS):
                shared.append(''.join(t.text or '' for t in si.iter('{%s}t' % NS['main'])))
        workbook = ET.fromstring(zf.read('xl/workbook.xml'))
        rels = ET.fromstring(zf.read('xl/_rels/workbook.xml.rels'))
        rel_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in rels.findall('{%s}Relationship' % NS['pkgrel'])}
        sheet = workbook.find('main:sheets/main:sheet', NS)
        target = rel_map[sheet.attrib['{%s}id' % NS['rel']]]
        target = ('xl/' + target.lstrip('./')) if not target.startswith('/') else target.lstrip('/')
        root = ET.fromstring(zf.read(target))
        raw_rows = []
        max_cols = 0
        for row in root.findall('.//main:sheetData/main:row', NS):
            values = {}
            for cell in row.findall('main:c', NS):
                idx = col_index(cell.attrib.get('r', ''))
                cell_type = cell.attrib.get('t')
                value_node = cell.find('main:v', NS)
                inline_node = cell.find('main:is', NS)
                if cell_type == 'inlineStr' and inline_node is not None:
                    value = ''.join(t.text or '' for t in inline_node.iter('{%s}t' % NS['main']))
                elif value_node is None:
                    value = ''
                else:
                    raw = value_node.text or ''
                    if cell_type == 's' and raw.isdigit() and int(raw) < len(shared):
                        value = shared[int(raw)]
                    elif cell_type == 'b':
                        value = raw == '1'
                    else:
                        value = raw
                values[idx] = value
                max_cols = max(max_cols, idx + 1)
            raw_rows.append([values.get(i, '') for i in range(max_cols)])
        if not raw_rows:
            return []
        headers = [str(value).strip() or f'column_{i + 1}' for i, value in enumerate(raw_rows[0])]
        return [dict(zip(headers, row + [''] * max(0, len(headers) - len(row)))) for row in raw_rows[1:]]


def number(value):
    try:
        return float(str(value).replace(',', '').strip())
    except (TypeError, ValueError):
        return 0.0


def normalize(value):
    return re.sub(r'[^a-z0-9]+', ' ', str(value).lower()).strip()


RELEVANT = re.compile(
    r'\b(finance|financial|bank|banking|investment|nbfc|loan|credit|risk|kyc|aml|compliance|fraud|fintech|payment|upi|swift|reconciliation|settlement|corporate action|fund accounting|accounting|cfa|frm|nism|analyst|bfs[i| ]|stock market|mutual fund|wealth management|insurance|treasury|derivatives|capital market|financial crime|money laundering|operations)\b',
    re.I,
)

NOISE = re.compile(r'\b(digital marketing|data analyst|data science|data scientist|coding|python|java|web development|full stack|graphic design|seo course|social media|machine learning|artificial intelligence|cyber security)\b', re.I)


def is_relevant(keyword):
    text = str(keyword)
    return bool(RELEVANT.search(text)) and not bool(NOISE.search(text))


def compact(row, source):
    keyword_key = 'Keywords' if source == 'competitor' else 'Keyword'
    volume_key = 'Search Volume (Average)' if source == 'competitor' else 'Search Volume'
    result = {
        'source': source,
        'keyword': str(row.get(keyword_key, '')).strip(),
        'volume': number(row.get(volume_key)),
    }
    if source == 'competitor':
        result.update({
            'trend': number(row.get('Trend')),
            'bid_low': number(row.get('Top of Page Bid (Low Range) (INR)')),
            'bid_high': number(row.get('Top of Page Bid (High Range) (INR)')),
            'competition': number(row.get('Competition')),
        })
    else:
        result.update({
            'url': str(row.get('Top Ranked URL', '')).strip(),
            'rank': number(row.get('Rank')),
            'difficulty': number(row.get('Ranking Difficulty')),
            'seo_clicks': number(row.get('SEO Clicks')),
            'clicks_change': number(row.get('SEO Clicks Change')),
            'no_click_percent': number(row.get('Searches Not Clicked Percent')),
            'organic_click_percent': number(row.get('Organic Clicks Percent')),
        })
    return result


def main(paths):
    competitor = [compact(row, 'competitor') for row in read_rows(paths[0]) if str(row.get('Keywords', '')).strip()]
    spy = [compact(row, 'spy') for row in read_rows(paths[1]) if str(row.get('Keyword', '')).strip()]
    relevant_comp = [row for row in competitor if is_relevant(row['keyword'])]
    relevant_spy = [row for row in spy if is_relevant(row['keyword'])]
    compact_mode = '--compact' in paths
    if compact_mode:
        def slim(rows):
            return [
                {key: row.get(key) for key in ('keyword', 'volume', 'trend', 'competition', 'difficulty', 'rank', 'url', 'seo_clicks') if key in row}
                for row in rows
            ]
        output = {
            'counts': {
                'competitor_total': len(competitor),
                'competitor_relevant': len(relevant_comp),
                'spy_total': len(spy),
                'spy_relevant': len(relevant_spy),
            },
            'competitor_top_relevant': slim(sorted(relevant_comp, key=lambda r: r['volume'], reverse=True)[:80]),
            'spy_top_relevant': slim(sorted(relevant_spy, key=lambda r: r['volume'], reverse=True)[:120]),
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))
        return
    output = {
        'counts': {
            'competitor_total': len(competitor),
            'competitor_relevant': len(relevant_comp),
            'spy_total': len(spy),
            'spy_relevant': len(relevant_spy),
        },
        'competitor_top_relevant': sorted(relevant_comp, key=lambda r: r['volume'], reverse=True)[:150],
        'spy_top_relevant': sorted(relevant_spy, key=lambda r: r['volume'], reverse=True)[:150],
        'spy_low_difficulty_relevant': sorted(relevant_spy, key=lambda r: (-r['volume'], r['difficulty']))[:150],
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main(sys.argv[1:])
