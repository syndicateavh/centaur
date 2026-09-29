#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { BUSINESS_DATA, ORGANIZATION_ID, WEBSITE_ID } from '../src/content/businessData.js';
import { getCareerGuide } from '../src/content/careerGuides.js';
import { GENERAL_FAQS } from '../src/content/faqData.js';
import { getResource } from '../src/content/resources.js';
import { REGIONAL_PAGES } from '../src/content/regionalPages.js';
import { CAREER_TRACKS, LEADERSHIP, PROGRAM } from '../src/content/sourceContent.js';
import {
  INDEXABLE_ROUTES,
  SEO_ROUTES,
  SITE_ORIGIN,
  TRAINING_LOCATION_ID,
  PRIMARY_COURSE_ID,
  ORGANIZATION_DISAMBIGUATING_DESCRIPTION,
  ORGANIZATION_KNOWS_ABOUT,
  canonicalUrl,
  createCourseInstancesSchema,
  createCourseOffersSchema,
  createStructuredData,
  personSchemaId,
  getBreadcrumbTrail,
} from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];

function fail(message) {
  failures.push(message);
}

function outputFileForRoute(route) {
  if (route.path === '/') return path.join(buildRoot, 'index.html');
  return path.join(buildRoot, route.path.slice(1), 'index.html');
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

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
}

function sameJson(left, right) {
  return JSON.stringify(sortKeys(left)) === JSON.stringify(sortKeys(right));
}

function typeIncludes(entity, type) {
  return Array.isArray(entity?.['@type'])
    ? entity['@type'].includes(type)
    : entity?.['@type'] === type;
}

function readSchema(route) {
  const outputFile = outputFileForRoute(route);
  if (!fs.existsSync(outputFile)) {
    fail(`${route.path}: missing ${path.relative(process.cwd(), outputFile)}`);
    return null;
  }

  const html = decodeHtml(fs.readFileSync(outputFile, 'utf8'));
  const matches = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];

  if (!route.indexable) {
    if (matches.length > 0) fail(`${route.path}: noindex route must not publish JSON-LD`);
    return null;
  }

  if (matches.length !== 1) {
    fail(`${route.path}: expected one JSON-LD block, found ${matches.length}`);
    return null;
  }

  try {
    return JSON.parse(matches[0][1].trim());
  } catch (error) {
    fail(`${route.path}: JSON-LD is not valid JSON (${error.message})`);
    return null;
  }
}

function graphEntity(graph, id, route) {
  const entity = graph.find((candidate) => candidate?.['@id'] === id);
  if (!entity) fail(`${route.path}: missing JSON-LD entity ${id}`);
  return entity;
}

function verifyOrganization(graph, route) {
  const organization = graphEntity(graph, ORGANIZATION_ID, route);
  if (!organization) return;

  if (organization['@type'] !== 'EducationalOrganization') {
    fail(`${route.path}: Centaur entity must be an EducationalOrganization`);
  }
  if (organization.name !== BUSINESS_DATA.name) fail(`${route.path}: organization name is inconsistent`);
  if (organization.legalName !== BUSINESS_DATA.legalName) fail(`${route.path}: organization legalName is inconsistent`);
  if (organization.description !== BUSINESS_DATA.description) fail(`${route.path}: organization description is inconsistent`);
  if (organization.disambiguatingDescription !== ORGANIZATION_DISAMBIGUATING_DESCRIPTION) {
    fail(`${route.path}: organization disambiguatingDescription is inconsistent`);
  }
  if (organization.url !== BUSINESS_DATA.url) fail(`${route.path}: organization URL is inconsistent`);
  if (organization.telephone !== BUSINESS_DATA.telephone) fail(`${route.path}: organization telephone is inconsistent`);
  if (organization.email !== BUSINESS_DATA.email) fail(`${route.path}: organization email is inconsistent`);
  if (!sameJson(organization.sameAs, BUSINESS_DATA.sameAs)) fail(`${route.path}: organization sameAs profiles are inconsistent`);
  if (!sameJson(organization.knowsAbout, [...ORGANIZATION_KNOWS_ABOUT])) {
    fail(`${route.path}: organization knowsAbout topics are inconsistent`);
  }
  if (!sameJson(organization.areaServed, [
    { '@type': 'City', name: BUSINESS_DATA.trainingLocation.address.addressLocality },
    BUSINESS_DATA.serviceArea,
  ])) fail(`${route.path}: organization areaServed is inconsistent`);
  if (!sameJson(organization.contactPoint, [{
    '@type': 'ContactPoint',
    contactType: 'customer support',
    telephone: BUSINESS_DATA.telephone,
    email: BUSINESS_DATA.email,
    areaServed: BUSINESS_DATA.serviceArea,
    availableLanguage: [BUSINESS_DATA.language],
  }])) fail(`${route.path}: organization contactPoint is inconsistent`);
  if (organization.address) fail(`${route.path}: partner training address must not be attached to the Centaur entity`);

  const logo = organization.logo;
  if (!logo || logo.url !== BUSINESS_DATA.logoUrl || logo.contentUrl !== BUSINESS_DATA.logoUrl) {
    fail(`${route.path}: organization logo URL is inconsistent`);
  }
  if (organization.image?.['@id'] !== logo?.['@id']) fail(`${route.path}: organization image must reference its logo entity`);
}

function verifyWebsite(graph, route) {
  const website = graphEntity(graph, WEBSITE_ID, route);
  if (!website) return;

  if (!typeIncludes(website, 'WebSite')) fail(`${route.path}: shared website entity has the wrong type`);
  if (website.url !== `${SITE_ORIGIN}/`) fail(`${route.path}: shared website URL is inconsistent`);
  if (website.name !== BUSINESS_DATA.name) fail(`${route.path}: shared website name is inconsistent`);
  if (!sameJson(website.publisher, { '@id': ORGANIZATION_ID })) fail(`${route.path}: website publisher is inconsistent`);
}

function verifyPage(graph, route) {
  const page = graphEntity(graph, `${canonicalUrl(route)}#webpage`, route);
  if (!page) return null;

  if (page['@type'] !== route.schemaType) fail(`${route.path}: WebPage type is inconsistent`);
  if (page.url !== canonicalUrl(route)) fail(`${route.path}: WebPage URL is inconsistent`);
  if (page.name !== route.title) fail(`${route.path}: WebPage name is inconsistent`);
  if (page.description !== route.description) fail(`${route.path}: WebPage description is inconsistent`);
  if (!sameJson(page.isPartOf, { '@id': WEBSITE_ID })) fail(`${route.path}: WebPage isPartOf is inconsistent`);
  if (!sameJson(page.about, { '@id': ORGANIZATION_ID })) fail(`${route.path}: WebPage about is inconsistent`);
  return page;
}

function verifyBreadcrumb(graph, route) {
  const breadcrumb = graph.find((entity) => typeIncludes(entity, 'BreadcrumbList'));
  const trail = getBreadcrumbTrail(route);

  if (trail.length === 1) {
    if (breadcrumb) fail(`${route.path}: homepage must not publish a breadcrumb list`);
    return;
  }

  if (!breadcrumb) {
    fail(`${route.path}: breadcrumb entity is missing`);
    return;
  }

  const expectedItems = trail.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.breadcrumbLabel,
    item: canonicalUrl(item),
  }));
  if (!sameJson(breadcrumb.itemListElement, expectedItems)) {
    fail(`${route.path}: breadcrumb labels or URLs are inconsistent`);
  }
}

function verifyCourse(graph, route, page) {
  const trackId = route.trackId || route.informationalModuleId;
  const track = trackId
    ? CAREER_TRACKS.find((candidate) => candidate.id === trackId)
    : null;

  if (!route.program && !track) {
    return;
  }

  if (track) {
    const learningResource = graphEntity(graph, `${canonicalUrl(route)}#learning-resource`, route);
    if (!learningResource) return;
    if (graph.some((entity) => typeIncludes(entity, 'Course'))) fail(`${route.path}: module page must not publish standalone Course data`);
    if (!typeIncludes(learningResource, 'LearningResource')) fail(`${route.path}: module learning entity has the wrong type`);
    if (learningResource.url !== canonicalUrl(route)) fail(`${route.path}: module learning URL is inconsistent`);
    if (learningResource.name !== `${track.title} module`) fail(`${route.path}: module learning name is inconsistent`);
    if (learningResource.description !== `${track.description}. This is a module within the ${PROGRAM.name}.`) fail(`${route.path}: module learning description is inconsistent`);
    if (!sameJson(learningResource.provider, { '@id': ORGANIZATION_ID })) fail(`${route.path}: module provider is inconsistent`);
    if (!sameJson(learningResource.isPartOf, { '@id': PRIMARY_COURSE_ID })) fail(`${route.path}: module parent course is inconsistent`);
    if (!sameJson(learningResource.teaches, track.description.split(', '))) fail(`${route.path}: module topics are inconsistent`);
    if (!sameJson(page?.mainEntity, { '@id': learningResource['@id'] })) fail(`${route.path}: module page mainEntity is inconsistent`);
    return;
  }

  const course = graphEntity(graph, PRIMARY_COURSE_ID, route);
  if (!course) return;
  const expected = {
    name: PROGRAM.name,
    description: PROGRAM.trainingDescription,
    teaches: CAREER_TRACKS.flatMap((candidate) => [candidate.title, candidate.description]),
    offers: createCourseOffersSchema(),
    hasCourseInstance: createCourseInstancesSchema(),
  };

  if (!typeIncludes(course, 'Course')) fail(`${route.path}: primary course entity has the wrong type`);
  if (course.url !== `${SITE_ORIGIN}/courses/`) fail(`${route.path}: primary course URL is inconsistent`);
  if (course.name !== expected.name) fail(`${route.path}: primary course name is inconsistent`);
  if (course.description !== expected.description) fail(`${route.path}: primary course description is inconsistent`);
  if (!sameJson(course.provider, { '@id': ORGANIZATION_ID })) fail(`${route.path}: primary course provider is inconsistent`);
  if (course.inLanguage !== BUSINESS_DATA.language || course.timeRequired !== 'P6W') fail(`${route.path}: primary course learning metadata is inconsistent`);
  if (course.educationalCredentialAwarded !== 'Course Completion Certificate') {
    fail(`${route.path}: primary course educationalCredentialAwarded is inconsistent`);
  }
  if (!sameJson(course.teaches, expected.teaches)) fail(`${route.path}: primary course topics are inconsistent`);
  if (!sameJson(course.offers, expected.offers)) fail(`${route.path}: primary course offers are inconsistent`);
  if (!sameJson(course.hasCourseInstance, expected.hasCourseInstance)) fail(`${route.path}: primary course instances are inconsistent`);
  if (!sameJson(page?.mainEntity, { '@id': course['@id'] })) fail(`${route.path}: primary course page mainEntity is inconsistent`);
}

function verifyLocation(graph, route, page) {
  if (route.id !== 'lucknow-location') return;

  const location = graphEntity(graph, TRAINING_LOCATION_ID, route);
  if (!location) return;
  if (!typeIncludes(location, 'Place')) fail(`${route.path}: training location has the wrong type`);
  if (location.name !== BUSINESS_DATA.trainingLocation.name) fail(`${route.path}: training location name is inconsistent`);
  if (location.url !== canonicalUrl(route)) fail(`${route.path}: training location URL is inconsistent`);
  if (!sameJson(location.address, { '@type': 'PostalAddress', ...BUSINESS_DATA.trainingLocation.address })) {
    fail(`${route.path}: training location address is inconsistent`);
  }
  if (location.hasMap !== BUSINESS_DATA.trainingLocation.mapUrl) fail(`${route.path}: training location map URL is inconsistent`);
  if (!sameJson(location.containedInPlace, {
    '@type': 'City',
    name: BUSINESS_DATA.trainingLocation.address.addressLocality,
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: BUSINESS_DATA.trainingLocation.address.addressRegion,
    },
  })) fail(`${route.path}: training location city relationship is inconsistent`);
  if (!sameJson(page?.mainEntity, { '@id': TRAINING_LOCATION_ID })) fail(`${route.path}: location page mainEntity is inconsistent`);
}

function verifyRegionalCoverage(graph, route, page) {
  if (!route.regionalPageId) return;

  const regionalPage = REGIONAL_PAGES.find((candidate) => candidate.id === route.regionalPageId);
  if (!regionalPage) {
    fail(`${route.path}: regional page content is missing`);
    return;
  }

  const coverageId = `${canonicalUrl(route)}#regional-coverage`;
  const coverage = graphEntity(graph, coverageId, route);
  if (!coverage) return;
  if (!typeIncludes(coverage, regionalPage.regionSchemaType)) fail(`${route.path}: regional coverage entity has the wrong type`);
  if (coverage.name !== regionalPage.regionName) fail(`${route.path}: regional coverage name is inconsistent`);
  if (regionalPage.regionAlternateName && coverage.alternateName !== regionalPage.regionAlternateName) {
    fail(`${route.path}: regional coverage alternate name is inconsistent`);
  }
  if (!sameJson(page?.spatialCoverage, { '@id': coverageId })) fail(`${route.path}: regional page spatialCoverage is inconsistent`);
}

function verifyCareerGuide(graph, route, page) {
  if (!route.careerGuideId) return;

  const guide = getCareerGuide(route.careerGuideId);
  if (!guide) {
    fail(`${route.path}: career-guide content is missing`);
    return;
  }

  const article = graphEntity(graph, `${canonicalUrl(route)}#article`, route);
  if (!article) return;
  if (!typeIncludes(article, 'Article')) fail(`${route.path}: career guide entity must be an Article`);
  if (article.url !== canonicalUrl(route)) fail(`${route.path}: career guide Article URL is inconsistent`);
  if (article.headline !== guide.h1) fail(`${route.path}: career guide headline is inconsistent`);
  if (article.description !== guide.description) fail(`${route.path}: career guide description is inconsistent`);
  if (article.datePublished !== `${guide.publishedAt}T00:00:00Z`) fail(`${route.path}: career guide publication date is inconsistent`);
  if (article.dateModified !== `${guide.updatedAt}T00:00:00Z`) fail(`${route.path}: career guide modification date is inconsistent`);
  if (article.author?.['@id'] !== `${SITE_ORIGIN}/about/#${guide.author.id}`) fail(`${route.path}: career guide author is inconsistent`);
  if (!sameJson(article.publisher, { '@id': ORGANIZATION_ID })) fail(`${route.path}: career guide publisher is inconsistent`);
  if (!sameJson(article.mainEntityOfPage, { '@id': `${canonicalUrl(route)}#webpage` })) fail(`${route.path}: career guide page relationship is inconsistent`);
  if (!sameJson(page?.mainEntity, { '@id': article['@id'] })) fail(`${route.path}: career guide page mainEntity is inconsistent`);
}

function verifyResource(graph, route, page) {
  if (!route.resourceId) return;

  const resource = getResource(route.resourceId);
  if (!resource) {
    fail(`${route.path}: resource content is missing`);
    return;
  }

  const article = graphEntity(graph, `${canonicalUrl(route)}#article`, route);
  if (!article) return;
  if (!typeIncludes(article, 'Article')) fail(`${route.path}: resource entity must be an Article`);
  if (article.url !== canonicalUrl(route)) fail(`${route.path}: resource Article URL is inconsistent`);
  if (article.headline !== resource.h1) fail(`${route.path}: resource headline is inconsistent`);
  if (article.description !== resource.description) fail(`${route.path}: resource description is inconsistent`);
  if (article.datePublished !== `${resource.publishedAt}T00:00:00Z`) fail(`${route.path}: resource publication date is inconsistent`);
  if (article.dateModified !== `${resource.updatedAt}T00:00:00Z`) fail(`${route.path}: resource modification date is inconsistent`);
  const expectedAuthorId = resource.author.type === 'Organization'
    ? ORGANIZATION_ID
    : `${SITE_ORIGIN}/about/#${resource.author.id}`;
  if (article.author?.['@id'] !== expectedAuthorId) fail(`${route.path}: resource author is inconsistent`);
  if (!sameJson(article.publisher, { '@id': ORGANIZATION_ID })) fail(`${route.path}: resource publisher is inconsistent`);
  if (!sameJson(article.mainEntityOfPage, { '@id': `${canonicalUrl(route)}#webpage` })) fail(`${route.path}: resource page relationship is inconsistent`);
  if (!sameJson(page?.mainEntity, { '@id': article['@id'] })) fail(`${route.path}: resource page mainEntity is inconsistent`);
}

function verifyFaqs(page, route) {
  if (route.id !== 'faqs') return;

  const expected = GENERAL_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));
  if (!sameJson(page?.mainEntity, expected)) fail(`${route.path}: FAQ structured data does not match the approved FAQ content`);
}

function verifyPeople(graph, page, route) {
  if (route.id !== 'about') return;

  const expectedPeople = LEADERSHIP.map((person) => ({
    '@type': 'Person',
    '@id': personSchemaId(person),
    name: person.name,
    jobTitle: person.role,
    worksFor: person.organization === BUSINESS_DATA.name
      ? { '@id': ORGANIZATION_ID }
      : { '@type': 'Organization', name: person.organization },
    description: person.experience,
    email: person.email,
  }));
  const people = graph.filter((entity) => typeIncludes(entity, 'Person'));
  if (!sameJson(people, expectedPeople)) fail(`${route.path}: leadership entities are inconsistent`);
  if (!sameJson(page?.mainEntity, expectedPeople.map((person) => ({ '@id': person['@id'] })))) {
    fail(`${route.path}: About page mainEntity people are inconsistent`);
  }
}

for (const route of SEO_ROUTES) {
  const schema = readSchema(route);
  if (!schema) continue;

  const expectedSchema = createStructuredData(route);
  if (!sameJson(schema, expectedSchema)) fail(`${route.path}: rendered JSON-LD differs from the shared schema registry`);
  if (schema['@context'] !== 'https://schema.org') fail(`${route.path}: JSON-LD @context is inconsistent`);
  if (!Array.isArray(schema['@graph'])) {
    fail(`${route.path}: JSON-LD @graph is missing`);
    continue;
  }

  const graph = schema['@graph'];
  const ids = graph.map((entity) => entity?.['@id']).filter(Boolean);
  if (new Set(ids).size !== ids.length) fail(`${route.path}: JSON-LD contains duplicate entity IDs`);
  if (graph.some((entity) => typeIncludes(entity, 'LocalBusiness'))) {
    fail(`${route.path}: LocalBusiness must not be used for the partner training location`);
  }

  verifyOrganization(graph, route);
  verifyWebsite(graph, route);
  const page = verifyPage(graph, route);
  verifyBreadcrumb(graph, route);
  verifyCourse(graph, route, page);
  verifyLocation(graph, route, page);
  verifyRegionalCoverage(graph, route, page);
  verifyCareerGuide(graph, route, page);
  verifyResource(graph, route, page);
  verifyFaqs(page, route);
  verifyPeople(graph, page, route);
}

const canonicalOrigin = new URL(SITE_ORIGIN);
for (const route of INDEXABLE_ROUTES) {
  const outputFile = outputFileForRoute(route);
  if (!fs.existsSync(outputFile)) continue;
  const html = fs.readFileSync(outputFile, 'utf8');
  for (const profile of BUSINESS_DATA.sameAs) {
    if (!html.includes(`href="${profile}"`)) fail(`${route.path}: visible social profile link is inconsistent with sameAs`);
  }
  if (canonicalOrigin.protocol !== 'https:') fail('SITE_ORIGIN must use HTTPS');
}

if (failures.length > 0) {
  console.error(`Structured data verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Structured data verified: ${INDEXABLE_ROUTES.length} indexable routes share consistent organization, website, page, breadcrumb, course, FAQ, people, regional coverage, and location entities.`);
