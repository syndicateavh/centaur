import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {
    'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'rel': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'pkgrel': 'http://schemas.openxmlformats.org/package/2006/relationships',
}


def col_index(ref):
    letters = ''.join(ch for ch in ref if ch.isalpha())
    value = 0
    for ch in letters:
        value = value * 26 + ord(ch.upper()) - 64
    return value - 1


def inspect(path, sample_rows=8):
    path = Path(path)
    with zipfile.ZipFile(path) as zf:
        names = set(zf.namelist())
        shared = []
        if 'xl/sharedStrings.xml' in names:
            root = ET.fromstring(zf.read('xl/sharedStrings.xml'))
            for si in root.findall('main:si', NS):
                shared.append(''.join(t.text or '' for t in si.iter('{%s}t' % NS['main'])))

        workbook = ET.fromstring(zf.read('xl/workbook.xml'))
        rels = ET.fromstring(zf.read('xl/_rels/workbook.xml.rels'))
        rel_map = {
            rel.attrib['Id']: rel.attrib['Target']
            for rel in rels.findall('{%s}Relationship' % NS['pkgrel'])
        }
        sheets = []
        for sheet in workbook.findall('main:sheets/main:sheet', NS):
            rid = sheet.attrib['{%s}id' % NS['rel']]
            target = rel_map[rid]
            if not target.startswith('/'):
                target = 'xl/' + target.lstrip('./')
            target = target.replace('xl/../', '')
            if target not in names:
                target = 'xl/' + Path(target).name
            root = ET.fromstring(zf.read(target))
            rows = []
            max_cols = 0
            for row in root.findall('.//main:sheetData/main:row', NS):
                values = {}
                for cell in row.findall('main:c', NS):
                    ref = cell.attrib.get('r', '')
                    idx = col_index(ref)
                    cell_type = cell.attrib.get('t')
                    value_node = cell.find('main:v', NS)
                    inline_node = cell.find('main:is', NS)
                    if cell_type == 'inlineStr' and inline_node is not None:
                        value = ''.join(t.text or '' for t in inline_node.iter('{%s}t' % NS['main']))
                    elif value_node is None:
                        value = ''
                    else:
                        raw = value_node.text or ''
                        if cell_type == 's':
                            value = shared[int(raw)] if raw.isdigit() and int(raw) < len(shared) else raw
                        elif cell_type == 'b':
                            value = raw == '1'
                        else:
                            value = raw
                    values[idx] = value
                    max_cols = max(max_cols, idx + 1)
                rows.append([values.get(i, '') for i in range(max_cols)])

            header = rows[0] if rows else []
            data = []
            for values in rows[1:sample_rows + 1]:
                padded = values + [''] * max(0, len(header) - len(values))
                data.append(dict(zip([str(x) or f'column_{i+1}' for i, x in enumerate(header)], padded)))
            sheets.append({
                'name': sheet.attrib.get('name'),
                'target': target,
                'row_count': max(0, len(rows) - 1),
                'column_count': len(header),
                'headers': header,
                'sample': data,
            })

    return {'file': str(path), 'sheets': sheets}


if __name__ == '__main__':
    for filename in sys.argv[1:]:
        print(json.dumps(inspect(filename), ensure_ascii=False))
