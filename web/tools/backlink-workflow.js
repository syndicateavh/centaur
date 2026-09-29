#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  BACKLINK_STATUSES,
  getBacklinkNextStatuses,
  isBacklinkTransitionAllowed,
  todayString,
  validateBacklinkCollection,
  validateBacklinkRecord,
} from '../src/content/seo/backlinkWorkflow.js';

const registryPath = path.resolve('src/content/seo/backlinkProspects.json');
const queueReportPath = path.resolve('OUTREACH_QUEUE.md');

function loadRecords() {
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

function saveRecords(records) {
  const temporaryPath = `${registryPath}.tmp-${process.pid}`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
  fs.renameSync(temporaryPath, registryPath);
}

function queueRecords(records) {
  return records.filter((record) => [
    BACKLINK_STATUSES.CANDIDATE,
    BACKLINK_STATUSES.QUALIFIED,
    BACKLINK_STATUSES.OUTREACH,
  ].includes(record.status));
}

function createQueueReport(records) {
  const actionable = queueRecords(records);
  const lines = [
    '# Outreach Queue',
    '',
    'Generated: ' + todayString(),
    '',
    'This queue contains manual, evidence-first outreach prospects. It does not claim that any external link has been earned. Do not contact a publisher until the evidence requirement is checked and the target page genuinely benefits its readers.',
    '',
    'Actionable prospects: ' + actionable.length,
    '',
  ];

  for (const status of [BACKLINK_STATUSES.CANDIDATE, BACKLINK_STATUSES.QUALIFIED, BACKLINK_STATUSES.OUTREACH]) {
    const group = actionable.filter((record) => record.status === status);
    if (group.length === 0) continue;
    lines.push('## ' + status, '');
    for (const record of group) {
      lines.push(
        '### ' + record.id,
        '',
        '- Target: ' + record.targetPath,
        '- Asset: ' + record.assetId,
        '- Acquisition method: ' + record.acquisitionMethod,
        '- Outreach angle: ' + record.outreachAngle,
        '- Evidence required: ' + record.evidenceNeeded,
        '- Source: ' + (record.sourceUrl || 'not recorded'),
        '- Notes: ' + (record.notes || 'none'),
        '- Next statuses: ' + (getBacklinkNextStatuses(status).join(', ') || 'none'),
        '',
      );
    }
  }

  lines.push(
    '## Workflow controls',
    '',
    '- A source URL is evidence only after manual HTTPS verification.',
    '- Paid links, automated submissions, link exchanges, and invented partnerships are prohibited.',
    '',
  );
  return lines.join('\n') + '\n';
}

function usage() {
  console.log(`Backlink workflow

Commands:
  list
  validate
  brief
  export
  mark <record-id> <status> [source-url]
`);
}

const [command, ...args] = process.argv.slice(2);

try {
  if (!command || command === 'help' || command === '--help') {
    usage();
  } else if (command === 'list') {
    for (const record of loadRecords()) console.log(`${record.id}\t${record.status}\t${record.targetPath}\t${record.sourceUrl || 'no source recorded'}`);
  } else if (command === 'validate') {
    const result = validateBacklinkCollection(loadRecords());
    if (result.errors.length > 0) {
      console.error(`Backlink registry validation failed:\n- ${result.errors.join('\n- ')}`);
      process.exitCode = 1;
    } else {
      for (const warning of result.warnings) console.warn(`warning: ${warning}`);
      console.log(`Backlink registry verified: ${loadRecords().length} prospects with no fabricated earned links.`);
    }
  } else if (command === 'brief') {
    process.stdout.write(createQueueReport(loadRecords()));
  } else if (command === 'export') {
    const report = createQueueReport(loadRecords());
    fs.writeFileSync(queueReportPath, report, 'utf8');
    console.log('Outreach queue written: ' + queueReportPath);
  } else if (command === 'mark') {
    const [recordId, status, sourceUrl] = args;
    if (!Object.values(BACKLINK_STATUSES).includes(status)) throw new Error(`Unknown status: ${status}`);
    const records = loadRecords();
    const record = records.find((candidate) => candidate.id === recordId);
    if (!record) throw new Error(`Backlink record not found: ${recordId}`);
    if (!isBacklinkTransitionAllowed(record.status, status)) {
      throw new Error('Invalid backlink transition: ' + record.status + ' -> ' + status + '. Allowed next statuses: ' + (getBacklinkNextStatuses(record.status).join(', ') || 'none'));
    }
    const nextRecord = {
      ...record,
      status,
      ...(sourceUrl ? { sourceUrl, sourceDomain: new URL(sourceUrl).hostname } : {}),
      ...(status === BACKLINK_STATUSES.OUTREACH || status === BACKLINK_STATUSES.EARNED || status === BACKLINK_STATUSES.MONITORING
        ? { firstContactedAt: record.firstContactedAt || todayString(), lastCheckedAt: todayString() }
        : {}),
    };
    const result = validateBacklinkRecord(nextRecord);
    if (result.errors.length > 0) throw new Error(`Backlink update rejected:\n- ${result.errors.join('\n- ')}`);
    saveRecords(records.map((candidate) => candidate.id === recordId ? nextRecord : candidate));
    console.log(`${recordId}: ${record.status} -> ${status}`);
  } else {
    throw new Error(`Unknown backlink workflow command: ${command}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Backlink workflow command failed');
  process.exitCode = 1;
}
