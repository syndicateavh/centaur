#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { GENERAL_FAQS } from '../src/content/faqData.js';
import { RESOURCE_HUB, RESOURCES } from '../src/content/resources.js';
import { getInternalLinks } from '../src/seo/internalLinks.js';
import { getSeoRoute, SEO_ROUTES } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];

function fail(message) {
  failures.push(message);
}

function outputFile(publicPath) {
  return path.join(buildRoot, publicPath === '/' ? 'index.html' : publicPath.slice(1), 'index.html');
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

function readPage(publicPath) {
  const filePath = outputFile(publicPath);
  if (!fs.existsSync(filePath)) {
    fail(`${publicPath}: prerendered output is missing`);
    return '';
  }
  return decodeHtml(fs.readFileSync(filePath, 'utf8'));
}

function requireText(publicPath, html, expected) {
  if (!html.includes(expected)) fail(`${publicPath}: rendered content is missing ${expected}`);
}

function requireLink(publicPath, html, href) {
  if (!html.includes(`href="${href}"`)) fail(`${publicPath}: rendered link is missing ${href}`);
}

function verifyMetadata(publicPath, html, route) {
  requireText(publicPath, html, `<title>${route.title}</title>`);
  requireText(publicPath, html, `name="description" content="${route.description}"`);
  requireText(publicPath, html, `rel="canonical" href="https://centaurcareers.in${route.path}"`);
  requireText(publicPath, html, `name="robots" content="${route.indexable ? 'index,follow' : 'noindex,follow'}"`);
  requireText(publicPath, html, `<h1 id="${route.id}-page-title"`);
  requireText(publicPath, html, route.h1);
  requireText(publicPath, html, 'aria-label="Breadcrumb"');
}

const hubRoute = getSeoRoute(RESOURCE_HUB.id);
const hubHtml = readPage(RESOURCE_HUB.path);
verifyMetadata(RESOURCE_HUB.path, hubHtml, hubRoute);
requireText(RESOURCE_HUB.path, hubHtml, 'data-resource-cluster="hub"');
for (const resource of RESOURCES) requireLink(RESOURCE_HUB.path, hubHtml, resource.path);
for (const link of getInternalLinks(RESOURCE_HUB.id)) requireLink(RESOURCE_HUB.path, hubHtml, link.to);
if (!hubHtml.includes('"@type":"CollectionPage"') && !hubHtml.includes('"@type": "CollectionPage"')) {
  fail(`${RESOURCE_HUB.path}: CollectionPage structured data is missing`);
}

for (const resource of RESOURCES) {
  const route = getSeoRoute(resource.routeId);
  const html = readPage(resource.path);
  verifyMetadata(resource.path, html, route);
  requireText(resource.path, html, `data-resource="${resource.id}"`);
  requireText(resource.path, html, resource.author.name);
  requireText(resource.path, html, resource.author.role);
  requireText(resource.path, html, 'Updated');
  requireText(resource.path, html, resource.updatedAt);
  requireText(resource.path, html, resource.body[0].text);
  requireText(resource.path, html, 'data-resource-related');
  requireText(resource.path, html, '"@type":"Article"');
  requireText(resource.path, html, `"@id":"https://centaurcareers.in${resource.path}#article"`);
  requireText(resource.path, html, `"datePublished":"${resource.publishedAt}T00:00:00Z"`);
  requireText(resource.path, html, `"dateModified":"${resource.updatedAt}T00:00:00Z"`);
  requireText(resource.path, html, resource.author.type === 'Organization'
    ? '"author":{"@id":"https://centaurcareers.in/#organization"}'
    : `"@id":"https://centaurcareers.in/about/#${resource.author.id}"`);

  for (const block of resource.body.filter((candidate) => candidate.type === 'faq')) {
    requireText(resource.path, html, block.question);
    requireText(resource.path, html, block.answer);
  }

  for (const link of getInternalLinks(resource.routeId)) requireLink(resource.path, html, link.to);
  for (const routeId of resource.relatedRouteIds) {
    if (!SEO_ROUTES.some((candidate) => candidate.id === routeId)) fail(`${resource.path}: related route is unknown: ${routeId}`);
  }

  const claimNeutralHtml = html.replace(/<footer\b[\s\S]*?<\/footer>/gi, '').replace(/100%\s+Job Guarantee/gi, '');
  if (/(?:placement|job)\s+guarantee|guaranteed\s+(?:placement|job|interview)|typical\s+salary|average\s+salary|salary\s+claim/i.test(claimNeutralHtml)) {
    fail(`${resource.path}: resource contains unsupported guarantee or salary language`);
  }
  if (html.includes('"@type":"BlogPosting"') || html.includes('"@type": "BlogPosting"')) {
    fail(`${resource.path}: resource must use Article schema, not BlogPosting schema`);
  }
}

const faqRoute = getSeoRoute('faqs');
const faqHtml = readPage(faqRoute.path);
verifyMetadata(faqRoute.path, faqHtml, faqRoute);
requireText(faqRoute.path, faqHtml, 'data-faq-content="program"');
requireText(faqRoute.path, faqHtml, 'data-faq-supporting-resources');
for (const faq of GENERAL_FAQS) requireText(faqRoute.path, faqHtml, faq.question);
for (const href of ['/career-guides/financial-operations-faq/', '/resources/investment-banking-interview-questions/', '/resources/']) {
  requireLink(faqRoute.path, faqHtml, href);
}
if (!faqHtml.includes('"@type":"FAQPage"') && !faqHtml.includes('"@type": "FAQPage"')) {
  fail(`${faqRoute.path}: FAQPage structured data is missing`);
}

for (const resource of RESOURCES) {
  if (!SEO_ROUTES.some((route) => route.path === resource.path)) fail(`${resource.path}: resource path is not registered in SEO routes`);
}

const accountingResource = RESOURCES.find((resource) => resource.id === 'accounting-interview-questions');
if (!accountingResource?.caseStudy) {
  fail('Accounting interview resource or its worked case is missing');
} else {
  const study = accountingResource.caseStudy;
  const accountTotals = new Map();
  for (const entry of [...study.sourceEvents, study.bankFee]) {
    if (!Number.isInteger(entry.amount) || entry.amount <= 0) fail(`Accounting case has an invalid amount for ${entry.event}`);
    accountTotals.set(entry.debit, (accountTotals.get(entry.debit) || 0) + entry.amount);
    accountTotals.set(entry.credit, (accountTotals.get(entry.credit) || 0) - entry.amount);
  }
  for (const balance of study.closingBalances) {
    const expected = accountTotals.get(balance.account);
    if (expected !== balance.debit - balance.credit) fail(`Accounting case balance is wrong for ${balance.account}`);
    accountTotals.delete(balance.account);
  }
  if (accountTotals.size) fail(`Accounting case omits accounts: ${[...accountTotals.keys()].join(', ')}`);
  const debitTotal = study.closingBalances.reduce((total, balance) => total + balance.debit, 0);
  const creditTotal = study.closingBalances.reduce((total, balance) => total + balance.credit, 0);
  if (debitTotal !== 27000 || creditTotal !== debitTotal) fail('Accounting case trial balance must balance at ₹27,000');
  const accountAmount = (name) => study.closingBalances.find((balance) => balance.account === name)?.debit || 0;
  if (accountAmount('Bank') + accountAmount('Trade receivables') !== study.closingAssets) fail('Accounting case closing assets are wrong');
  if (7000 - accountAmount('Rent expense') - accountAmount('Bank charges expense') !== study.profit) fail('Accounting case profit is wrong');
  if (study.closingAssets !== 20000 + study.profit) fail('Accounting case equation does not balance');

  const caseHtml = readPage(accountingResource.path);
  requireText(accountingResource.path, caseHtml, 'data-accounting-interview-case');
  requireText(accountingResource.path, caseHtml, 'Answer key: journal entries');
  requireText(accountingResource.path, caseHtml, 'Answer key: closing trial balance');
  requireText(accountingResource.path, caseHtml, 'Self-check rubric');
  requireLink(accountingResource.path, caseHtml, 'https://www.icai.org/post/17894');
  for (const incomingPath of ['/resources/', '/resources/accounting-basics/', '/resources/reconciliation-in-finance/', '/blog/finance-interview-questions-freshers/']) {
    requireLink(incomingPath, readPage(incomingPath), accountingResource.path);
  }
}

if (failures.length > 0) {
  console.error(`Resources and FAQ verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Resources and FAQ content verified: ${RESOURCES.length} authored resource, resource hub, and program FAQ content have metadata, direct answers, internal links, structured data, and evidence-bound copy.`);
