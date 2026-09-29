#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { BUSINESS_DATA } from '../src/content/businessData.js';
import { DOWNLOAD_ASSETS } from '../src/content/downloads.js';
import { GENERAL_FAQS } from '../src/content/faqData.js';
import { CAREER_TRACKS, PROGRAM, PROGRAM_FEATURES } from '../src/content/sourceContent.js';
import { getSeoRoute } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];

function fail(message) {
  failures.push(message);
}

function outputFileForRoute(routePath) {
  return routePath === '/' ? path.join(buildRoot, 'index.html') : path.join(buildRoot, routePath.slice(1), 'index.html');
}

function readRoute(routeId) {
  const route = getSeoRoute(routeId);
  const outputFile = outputFileForRoute(route.path);
  if (!fs.existsSync(outputFile)) {
    fail(`${route.path}: prerendered output is missing`);
    return { route, html: '' };
  }
  return { route, html: fs.readFileSync(outputFile, 'utf8') };
}

function requireMarkers(routePath, html, markers) {
  for (const marker of markers) {
    if (!html.includes(`data-commercial-section="${marker}"`)) fail(`${routePath}: missing commercial section ${marker}`);
  }
}

function requireLinks(routePath, html, hrefs) {
  for (const href of hrefs) {
    const escapedHref = href.replaceAll('&', '&amp;');
    if (!html.includes(`href="${href}"`) && !html.includes(`href="${escapedHref}"`)) fail(`${routePath}: missing contextual link to ${href}`);
  }
}

const courses = readRoute('courses');
requireMarkers(courses.route.path, courses.html, [
  'program-modules',
  'program-benefits',
  'program-process',
  'learning-modes',
  'program-resources',
  'certificate',
  'program-comparison',
  'program-faq',
]);
requireLinks(courses.route.path, courses.html, CAREER_TRACKS.filter((track) => track.route).map((track) => track.route));
for (const phrase of [PROGRAM.name, PROGRAM.duration, PROGRAM_FEATURES[0].title, GENERAL_FAQS[0].question, GENERAL_FAQS[1].question]) {
  if (!courses.html.includes(phrase)) fail(`${courses.route.path}: missing verified program content: ${phrase}`);
}
for (const href of [
  DOWNLOAD_ASSETS.syllabus.path,
  '/blog/settlement-trade-break-worked-example/',
  '/blog/kyc-onboarding-case-file-example/',
  '/contact/',
]) {
  if (!courses.html.includes(`href="${href}"`)) fail(`${courses.route.path}: missing program resource link: ${href}`);
}

const location = readRoute('lucknow-location');
requireMarkers(location.route.path, location.html, ['location-details', 'location-program-access', 'local-faq', 'location-contact']);
requireLinks(location.route.path, location.html, ['/courses/', '/contact/']);
for (const phrase of [
  BUSINESS_DATA.trainingLocation.name,
  BUSINESS_DATA.trainingLocation.address.streetAddress,
  BUSINESS_DATA.trainingLocation.address.addressLocality,
  BUSINESS_DATA.trainingLocation.address.addressRegion,
  BUSINESS_DATA.trainingLocation.address.postalCode,
  BUSINESS_DATA.displayTelephone,
  BUSINESS_DATA.email,
  PROGRAM.name,
  GENERAL_FAQS[0].question,
  GENERAL_FAQS[2].question,
]) {
  if (!location.html.includes(phrase)) fail(`${location.route.path}: missing verified local/program content: ${phrase}`);
}
for (const href of [
  BUSINESS_DATA.trainingLocation.mapUrl,
  `tel:${BUSINESS_DATA.telephone}`,
  `mailto:${BUSINESS_DATA.email}`,
  BUSINESS_DATA.whatsappUrl,
  '/placements/',
  '/faqs/',
]) {
  const escapedHref = href.replaceAll('&', '&amp;');
  if (!location.html.includes(`href="${href}"`) && !location.html.includes(`href="${escapedHref}"`) && !location.html.includes(href) && !location.html.includes(escapedHref)) fail(`${location.route.path}: missing local action or contextual link: ${href}`);
}

for (const routeId of ['investment-banking-operations', 'retail-banking', 'finance-operations']) {
  const page = readRoute(routeId);
  requireMarkers(page.route.path, page.html, ['module-overview', 'module-process', 'module-directory', 'module-faq', 'decision-checklist']);
  requireLinks(page.route.path, page.html, ['/courses/', '/faqs/', '/placements/']);
  if (!page.html.includes('as a module, not as a separate program')) fail(`${page.route.path}: module relationship statement is missing`);
  if (!page.html.includes(PROGRAM.name)) fail(`${page.route.path}: primary program context is missing`);
  for (const phrase of ['current cohort schedule, learning mode, and fees', 'current certificate wording', 'written support and Job Guarantee Program terms']) {
    if (!page.html.includes(phrase)) fail(`${page.route.path}: commercial decision checklist is missing ${phrase}`);
  }
}

const kycModule = readRoute('kyc-aml-compliance');
if (!kycModule.html.includes('data-high-value-section="module-commercial-bridge"')) fail(`${kycModule.route.path}: high-value commercial bridge is missing`);
requireMarkers(kycModule.route.path, kycModule.html, ['decision-checklist']);
requireLinks(kycModule.route.path, kycModule.html, ['/courses/', '/placements/', '/contact/']);
for (const phrase of ['current cohort schedule, learning mode, and fees', 'current certificate wording', 'written support and Job Guarantee Program terms']) {
  if (!kycModule.html.includes(phrase)) fail(`${kycModule.route.path}: commercial decision checklist is missing ${phrase}`);
}

const allHtml = [courses.html, location.html, kycModule.html, ...['investment-banking-operations', 'retail-banking', 'finance-operations'].map((id) => readRoute(id).html)].join('\n');
if (/placement\s+guarantee|guaranteed\s+placement|100%\s+placement|refund\s+guarantee/i.test(allHtml)) {
  fail('commercial pages contain an unsupported guarantee variant');
}
for (const phrase of ['100% Job Guarantee Program', 'guarantees a finance job', 'Open to graduates and job switchers']) {
  if (!courses.html.includes(phrase)) fail(`${courses.route.path}: missing qualified job-guarantee wording: ${phrase}`);
}
if (!courses.html.includes('href="/placements/#job-guarantee-terms"')) {
  fail(`${courses.route.path}: canonical job-guarantee terms link is missing`);
}

if (failures.length > 0) {
  console.error(`Commercial page verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Commercial pages verified: the program hub publishes the qualified 100% Job Guarantee Program wording, and commercial routes contain the required sections, contextual links, and FAQs.');
