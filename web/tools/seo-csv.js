export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
  }
  return rows;
}

export function normalizeHeader(value) {
  return String(value).toLowerCase().replace(/[%()]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function findColumn(headers, patterns) {
  return headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
}

export function numberValue(value, fieldName, rowNumber) {
  const normalized = String(value || '').replace(/,/g, '').replace(/%/g, '').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Row ${rowNumber}: ${fieldName} must be a non-negative number`);
  return parsed;
}

export function percentageValue(value, fieldName, rowNumber) {
  const raw = String(value || '').trim();
  const parsed = numberValue(raw, fieldName, rowNumber);
  if (parsed === null) return null;
  return raw.includes('%') ? parsed : parsed <= 1 ? parsed * 100 : parsed;
}
