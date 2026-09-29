import fs from 'node:fs';
import path from 'node:path';
import { MEASUREMENT_HISTORY_DIRECTORY } from '../src/content/seo/measurementSchema.js';

function safeFilePart(value) {
  return String(value || 'unknown').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '');
}

export function archiveSnapshotBeforeReplace({ outputPath, archiveName, nextPeriod, nextSourceFilters }) {
  if (!fs.existsSync(outputPath)) return null;

  let previous;
  try {
    previous = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  } catch {
    throw new Error(`Existing measurement snapshot is not valid JSON: ${path.relative(process.cwd(), outputPath)}`);
  }

  const previousFrom = previous.dateRange?.from || '';
  const previousTo = previous.dateRange?.to || '';
  const samePeriod = nextPeriod && previousFrom === nextPeriod.from && previousTo === nextPeriod.to;
  const sameFilters = JSON.stringify(previous.sourceFilters || null) === JSON.stringify(nextSourceFilters || null);
  if (samePeriod && sameFilters) return null;

  const historyDirectory = path.resolve(MEASUREMENT_HISTORY_DIRECTORY);
  fs.mkdirSync(historyDirectory, { recursive: true });
  const importStamp = safeFilePart(previous.importedAt || new Date().toISOString());
  const periodStamp = previousFrom && previousTo ? `${safeFilePart(previousFrom)}_to_${safeFilePart(previousTo)}` : 'undated';
  const baseName = `${safeFilePart(archiveName)}_${periodStamp}_${importStamp}`;
  let archivedPath = path.join(historyDirectory, `${baseName}.json`);
  let suffix = 2;
  while (fs.existsSync(archivedPath)) {
    archivedPath = path.join(historyDirectory, `${baseName}_${suffix}.json`);
    suffix += 1;
  }

  fs.copyFileSync(outputPath, archivedPath);
  return archivedPath;
}

export function writeSnapshot(outputPath, snapshot) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
}
