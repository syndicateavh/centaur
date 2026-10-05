#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { BUSINESS_DATA, ORGANIZATION_ID } from '../src/content/businessData.js';
import {
  INDEXABLE_ROUTES,
  TRAINING_LOCATION_ID,
  createStructuredData,
} from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];

function fail(message) {
  failures.push(message);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function graphFor(routeId) {
  const structuredData = createStructuredData(routeId);
  return structuredData?.['@graph'] || [];
}

function entityFor(graph, id, routeId) {
  const entity = graph.find((candidate) => candidate?.['@id'] === id);
  if (!entity) fail(`${routeId}: missing entity ${id}`);
  return entity;
}

function outputFile(publicPath) {
  return publicPath === '/'
    ? path.join(buildRoot, 'index.html')
    : path.join(buildRoot, publicPath.slice(1), 'index.html');
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

const expectedAreaServed = [
  { '@type': 'City', name: BUSINESS_DATA.trainingLocation.address.addressLocality },
  BUSINESS_DATA.serviceArea,
];

const expectedContactPoint = [{
  '@type': 'ContactPoint',
  contactType: 'customer support',
  telephone: BUSINESS_DATA.telephone,
  email: BUSINESS_DATA.email,
  areaServed: BUSINESS_DATA.serviceArea,
  availableLanguage: [BUSINESS_DATA.language],
}];

if (BUSINESS_DATA.country !== 'India') fail('business country must remain India');
if (BUSINESS_DATA.countryCode !== 'IN') fail('business countryCode must remain IN');
if (BUSINESS_DATA.language !== 'en-IN') fail('business language must remain en-IN');
if (BUSINESS_DATA.locale !== 'en_IN') fail('business locale must remain en_IN');
if ('address' in BUSINESS_DATA) fail('partner training address must not be exposed as the business address');
if ('trainingPartner' in BUSINESS_DATA || 'mapUrl' in BUSINESS_DATA) fail('training-location fields must be nested under trainingLocation');
if (BUSINESS_DATA.trainingLocation.address.addressCountry !== BUSINESS_DATA.countryCode) fail('training location country is inconsistent');
if (!BUSINESS_DATA.trainingLocation.path.endsWith('/best-finance-course-in-lucknow/')) fail('training location path must remain the published Lucknow route');

for (const route of INDEXABLE_ROUTES) {
  const graph = graphFor(route.id);
  const organization = entityFor(graph, ORGANIZATION_ID, route.id);
  if (!organization) continue;

  if (!sameJson(organization.areaServed, expectedAreaServed)) fail(`${route.path}: organization areaServed is inconsistent`);
  if (!sameJson(organization.contactPoint, expectedContactPoint)) fail(`${route.path}: organization contactPoint is inconsistent`);
  if (organization.address) fail(`${route.path}: organization must not claim the partner training address`);
}

const locationGraph = graphFor('lucknow-location');
const location = entityFor(locationGraph, TRAINING_LOCATION_ID, 'lucknow-location');
if (location) {
  if (location.name !== BUSINESS_DATA.trainingLocation.name) fail('Lucknow schema name is inconsistent');
  if (!sameJson(location.address, { '@type': 'PostalAddress', ...BUSINESS_DATA.trainingLocation.address })) fail('Lucknow schema address is inconsistent');
  if (location.hasMap !== BUSINESS_DATA.trainingLocation.mapUrl) fail('Lucknow schema map is inconsistent');
}

for (const routeId of ['home', 'contact', 'lucknow-location']) {
  const route = INDEXABLE_ROUTES.find((candidate) => candidate.id === routeId);
  const filePath = outputFile(route.path);
  if (!fs.existsSync(filePath)) {
    fail(`${route.path}: prerendered output is missing`);
    continue;
  }

  const html = decodeHtml(fs.readFileSync(filePath, 'utf8'));
  for (const required of [
    BUSINESS_DATA.name,
    BUSINESS_DATA.country,
    BUSINESS_DATA.trainingLocation.name,
    BUSINESS_DATA.trainingLocation.address.addressLocality,
    BUSINESS_DATA.displayTelephone,
    BUSINESS_DATA.email,
  ]) {
    if (!html.includes(required)) fail(`${route.path}: rendered entity signal is missing ${required}`);
  }

  if (html.includes('Our postal address is')) fail(`${route.path}: rendered legal copy still mislabels the partner training address as a postal address`);
}

if (failures.length > 0) {
  console.error(`India business entity verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('India business entity verified: India locale, contact point, service area, partner training location boundary, schema relationships, and rendered entity signals are consistent.');
