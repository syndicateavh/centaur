#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { BUSINESS_DATA } from '../src/content/businessData.js';
import { PROGRAM } from '../src/content/sourceContent.js';
import { getSeoRoute } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const route = getSeoRoute('lucknow-location');
const outputFile = path.join(buildRoot, route.path.slice(1), 'index.html');
const failures = [];

function fail(message) {
  failures.push(message);
}

function hasHtmlValue(html, value) {
  const escapedValue = value.replaceAll('&', '&amp;');
  return html.includes(value) || html.includes(escapedValue);
}

if (!route.indexable) fail(`${route.path}: Lucknow location route must remain indexable`);

if (!fs.existsSync(outputFile)) {
  fail(`${route.path}: prerendered output is missing`);
} else {
  const html = fs.readFileSync(outputFile, 'utf8');
  const requiredFragments = [
    route.title,
    route.h1,
    PROGRAM.name,
    'data-commercial-page="lucknow-location"',
    'data-location-facts',
    'data-location-address',
    'data-location-directions',
    'data-location-phone',
    'data-location-email',
    'data-location-whatsapp',
    'data-commercial-section="location-details"',
    'data-commercial-section="location-program-access"',
    'data-commercial-section="local-faq"',
    'data-commercial-section="location-contact"',
    'In-person sessions',
    'Alambagh, Lucknow',
    `${BUSINESS_DATA.trainingLocation.address.addressRegion} ${BUSINESS_DATA.trainingLocation.address.postalCode}`,
    BUSINESS_DATA.trainingLocation.name,
    BUSINESS_DATA.trainingLocation.address.streetAddress,
    BUSINESS_DATA.trainingLocation.address.addressLocality,
    BUSINESS_DATA.trainingLocation.address.postalCode,
    BUSINESS_DATA.trainingLocation.mapUrl,
    `tel:${BUSINESS_DATA.telephone}`,
    BUSINESS_DATA.displayTelephone,
    `mailto:${BUSINESS_DATA.email}`,
    BUSINESS_DATA.email,
    BUSINESS_DATA.whatsappUrl,
    'href="/courses/"',
    'href="/contact/"',
    'href="/placements/"',
    'href="/faqs/"',
  ];

  for (const fragment of requiredFragments) {
    if (!hasHtmlValue(html, fragment)) fail(`${route.path}: rendered location content is missing ${fragment}`);
  }

  if (html.includes('"@type":"LocalBusiness"') || html.includes('"@type": "LocalBusiness"')) {
    fail(`${route.path}: partner training location must not be represented as Centaur Careers LocalBusiness`);
  }
}

if (failures.length > 0) {
  console.error(`Lucknow location verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Lucknow location verified: local intent, approved address, contact paths, program discovery, FAQs, internal links, and evidence-bound schema content are present in the prerendered route.');
