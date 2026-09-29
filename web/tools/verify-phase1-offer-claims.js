#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { BUSINESS_DATA } from '../src/content/businessData.js';
import { TESTIMONIALS } from '../src/content/sourceContent.js';

const root = path.resolve('build/client');
const failures = [];

function readRoute(routePath) {
  const relative = routePath === '/' ? 'index.html' : path.join(routePath.slice(1), 'index.html');
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    failures.push(`${routePath}: prerendered page is missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireContent(routePath, html, values) {
  for (const value of values) {
    if (!html.includes(value)) failures.push(`${routePath}: missing ${value}`);
  }
}

function rejectContent(routePath, html, expressions) {
  for (const expression of expressions) {
    if (expression.test(html)) failures.push(`${routePath}: contains unsupported claim ${expression}`);
  }
}

function listPrerenderedPages(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return listPrerenderedPages(target);
    return entry.isFile() && entry.name === 'index.html' ? [target] : [];
  });
}

const home = readRoute('/');
const courses = readRoute('/courses/');
const placements = readRoute('/placements/');
const feeOwner = readRoute('/courses/finance-course-fees-eligibility/');
const eligibility = readRoute('/finance-course-eligibility/');
const contact = readRoute('/contact/');
const lucknow = readRoute('/locations/lucknow/');
const legalPages = [
  ['/terms-and-conditions/', readRoute('/terms-and-conditions/')],
  ['/refund-cancellation-policy/', readRoute('/refund-cancellation-policy/')],
  ['/disclaimer/', readRoute('/disclaimer/')],
];

requireContent('/', home, ['Check the offer in one place', 'graduates and job switchers', 'href="/placements/#job-guarantee-terms"']);
for (const { name } of TESTIMONIALS) {
  if (home.includes(name)) failures.push(`/: named testimonial ${name} is rendered without documented consent`);
}
rejectContent('/', home, [/₹\s*3\s*[–-]\s*12\s*LPA/i, /500\+ trained/i, /100\+ placed/i]);

for (const [routePath, html] of [['/courses/', courses], ['/placements/', placements], ['/courses/finance-course-fees-eligibility/', feeOwner]]) {
  requireContent(routePath, html, ['₹35,000', '₹50,000', 'graduates and job switchers']);
  rejectContent(routePath, html, [/₹70,000/, /limited-time cohort pricing/i]);
}
requireContent('/courses/', courses, ['href="/placements/#job-guarantee-terms"', 'request current written cohort terms']);
requireContent('/placements/', placements, [
  'Published program summary',
  'Graduation is the program entry requirement',
  'this page and the downloadable summary do not replace them',
  'href="/downloads/placement-support-terms.txt"',
]);
requireContent('/courses/finance-course-fees-eligibility/', feeOwner, ['Graduation is the program entry requirement', 'previous finance background is not required', 'written quote for your cohort']);
requireContent('/finance-course-eligibility/', eligibility, ['Graduation is the entry requirement', 'previous finance education or work experience is not required']);
requireContent('/contact/', contact, ['href="/courses/finance-course-fees-eligibility/"', 'href="/placements/#job-guarantee-terms"']);
requireContent('/locations/lucknow/', lucknow, [BUSINESS_DATA.trainingLocation.address.streetAddress]);
for (const [routePath, html] of legalPages) {
  requireContent(routePath, html, ['href="/placements/#job-guarantee-terms"', 'summary']);
  rejectContent(routePath, html, [/current published Job Guarantee Terms/i, /does not promise[^.]*individual outcome/i]);
}

const termsFile = path.resolve('public/downloads/placement-support-terms.txt');
if (!fs.existsSync(termsFile)) failures.push('downloadable placement summary is missing');
else requireContent('placement summary download', fs.readFileSync(termsFile, 'utf8'), [
  'plain-text summary',
  'current written program terms provided for the applicable cohort control',
]);

const staleClaimPatterns = [
  /80%\+? attendance/i,
  /minimum Bronze-tier score/i,
  /180-day (?:placement|support) window/i,
  /up to 8 direct interview opportunities/i,
];
for (const file of listPrerenderedPages(root)) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll('\\', '/');
  rejectContent(relative, html, staleClaimPatterns);
}

if (failures.length) {
  console.error(`Phase 1 offer and claims check failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Phase 1 offer and claims check passed: published prices, program entry, guarantee summary, contact paths, and rendered-claim safeguards are aligned. This check does not verify current business records or consent.');
