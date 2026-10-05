import { BUSINESS_DATA, ORGANIZATION_ID, WEBSITE_ID } from '../content/businessData.js';
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_ORIGIN,
} from './siteConfig.js';

const LOGO_ID = `${SITE_ORIGIN}/#logo`;

const ORGANIZATION_DISAMBIGUATING_DESCRIPTION = `${BUSINESS_DATA.name} (${BUSINESS_DATA.legalName}) is an Indian finance and banking operations career-training provider offering the 6-week Financial Operations Masterclass, distinct from Centaur Pharmaceuticals and unrelated to AI or chess centaur metaphors.`;

const ORGANIZATION_KNOWS_ABOUT = Object.freeze([
  'Investment banking operations',
  'Trade lifecycle and securities settlement',
  'Corporate actions and NAV fund accounting',
  'Reconciliation in finance and banking',
  'KYC and AML compliance operations',
  'Retail banking and branch operations',
  'Digital payments and UPI/IMPS/RTGS/SWIFT operations',
  'Finance operations, credit analysis, and NBFC loan processing',
  'FinTech and neo-banking operations',
]);

function createHomeOrganizationSchema() {
  return {
    '@type': 'EducationalOrganization',
    '@id': ORGANIZATION_ID,
    name: BUSINESS_DATA.name,
    legalName: BUSINESS_DATA.legalName,
    description: BUSINESS_DATA.description,
    disambiguatingDescription: ORGANIZATION_DISAMBIGUATING_DESCRIPTION,
    url: BUSINESS_DATA.url,
    logo: {
      '@type': 'ImageObject',
      '@id': LOGO_ID,
      url: BUSINESS_DATA.logoUrl,
      contentUrl: BUSINESS_DATA.logoUrl,
      width: Number(DEFAULT_OG_IMAGE_WIDTH),
      height: Number(DEFAULT_OG_IMAGE_HEIGHT),
      caption: BUSINESS_DATA.name,
    },
    image: { '@id': LOGO_ID },
    telephone: BUSINESS_DATA.telephone,
    email: BUSINESS_DATA.email,
    areaServed: [
      { '@type': 'City', name: 'Lucknow' },
      BUSINESS_DATA.serviceArea,
    ],
    knowsAbout: [...ORGANIZATION_KNOWS_ABOUT],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: BUSINESS_DATA.telephone,
        email: BUSINESS_DATA.email,
        areaServed: BUSINESS_DATA.serviceArea,
        availableLanguage: [BUSINESS_DATA.language],
      },
    ],
    sameAs: [...BUSINESS_DATA.sameAs],
  };
}

function createHomeWebsiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_ORIGIN}/`,
    name: BUSINESS_DATA.name,
    inLanguage: BUSINESS_DATA.language,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export const HOME_SEO_ROUTE = Object.freeze({
  id: 'home',
  path: '/',
  title: 'Finance Career Training for Graduates | Centaur Careers',
  description: 'Open to all graduates. Learn finance and BFSI operations in a six-week Masterclass, live online across India or in person in Lucknow.',
  h1: 'Get a ₹3–12 LPA Finance Job in 6 Weeks',
  breadcrumbLabel: 'Home',
  schemaType: 'WebPage',
  keywordPurpose: 'Brand/entity and Financial Operations Masterclass overview',
  primaryKeyword: 'Centaur Careers finance training',
  keywordOwnerUrl: null,
  indexable: true,
  lastModified: '2026-09-30',
});

const HOME_INTERNAL_LINKS = Object.freeze([
  { routeId: 'courses', to: '/courses/', label: 'Financial Operations Masterclass', authorityTier: 'priority-commercial' },
  { routeId: 'courses-banking-courses', to: '/courses/banking-courses/', label: 'Banking Courses and Career Directions', authorityTier: 'supporting' },
  { routeId: 'courses-banking-and-finance', to: '/courses/banking-and-finance/', label: 'Banking and Finance Course for Career Starters', authorityTier: 'supporting' },
  { routeId: 'career-guides', to: '/career-guides/', label: 'Finance Operations Career Guides', authorityTier: 'information-hub' },
  { routeId: 'career-guide-reconciliation-analyst', to: '/career-guides/reconciliation-analyst/', label: 'Reconciliation Analyst: Role, Skills and Career Path', authorityTier: 'supporting' },
  { routeId: 'resources', to: '/resources/', label: 'Finance Career Resources', authorityTier: 'information-hub' },
  { routeId: 'resource-bank-reconciliation-process', to: '/resources/bank-reconciliation-process/', label: 'Bank Reconciliation Process: Steps, Differences and Example', authorityTier: 'supporting' },
  { routeId: 'india', to: '/india/', label: 'Live Online Finance Course Across India', authorityTier: 'national-hub' },
  { routeId: 'placements', to: '/placements/', label: '100% Job Guarantee Program for Finance Careers in India', authorityTier: 'commercial-support' },
  { routeId: 'student-outcomes', to: '/placements/student-outcomes/', label: 'Student Placements and Career Outcomes', authorityTier: 'commercial-support' },
  { routeId: 'comparison-best-finance-institutes-india', to: '/compare/best-finance-institutes-india/', label: 'Top Finance Institutes in India: Compare Courses and Placement Terms', authorityTier: 'supporting' },
  { routeId: 'lead-best-investment-banking-course-india', to: '/best-investment-banking-course-india/', label: 'Best Investment Banking Institute in India: Compare by Career Goal', authorityTier: 'supporting' },
  { routeId: 'lead-online-finance-course-placement', to: '/online-finance-course-with-placement/', label: 'Online Finance Course with Placement in India: What to Verify', authorityTier: 'supporting' },
  { routeId: 'blog', to: '/blog/', label: 'Finance Career Insights & Industry Updates', authorityTier: 'supporting' },
  { routeId: 'faqs', to: '/faqs/', label: 'Finance Career Program FAQs', authorityTier: 'supporting' },
  { routeId: 'lucknow-location', to: '/best-finance-course-in-lucknow/', label: 'Finance and Investment Banking Course in Lucknow', authorityTier: 'local-commercial' },
  { routeId: 'contact', to: '/contact/', label: 'Contact Centaur Careers', authorityTier: 'supporting' },
  { routeId: 'privacy-policy', to: '/privacy-policy/', label: 'Privacy Policy', authorityTier: 'supporting' },
].map((link) => Object.freeze(link)));

export function getHomeInternalLinks() {
  return HOME_INTERNAL_LINKS;
}

export function createHomeStructuredData() {
  const canonical = `${SITE_ORIGIN}/`;
  const imageId = `${canonical}#primary-image`;
  const routeImage = {
    '@type': 'ImageObject',
    '@id': imageId,
    url: DEFAULT_OG_IMAGE,
    contentUrl: DEFAULT_OG_IMAGE,
    caption: `${HOME_SEO_ROUTE.title} image`,
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      createHomeOrganizationSchema(),
      createHomeWebsiteSchema(),
      {
        '@type': HOME_SEO_ROUTE.schemaType,
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: HOME_SEO_ROUTE.title,
        description: HOME_SEO_ROUTE.description,
        inLanguage: BUSINESS_DATA.language,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': ORGANIZATION_ID },
        primaryImageOfPage: { '@id': imageId },
        mainEntity: { '@id': ORGANIZATION_ID },
      },
      routeImage,
    ],
  };
}

export function createRouteMeta(id) {
  if (id !== HOME_SEO_ROUTE.id) throw new Error(`Unknown lightweight SEO route: ${id}`);

  const route = HOME_SEO_ROUTE;
  const canonical = `${SITE_ORIGIN}/`;
  const imageAlt = `${BUSINESS_DATA.name} logo`;

  return [
    { title: route.title },
    { name: 'description', content: route.description },
    { name: 'robots', content: 'index,follow' },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: BUSINESS_DATA.locale },
    { property: 'og:site_name', content: BUSINESS_DATA.name },
    { property: 'og:title', content: route.title },
    { property: 'og:description', content: route.description },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: DEFAULT_OG_IMAGE },
    { property: 'og:image:secure_url', content: DEFAULT_OG_IMAGE },
    { property: 'og:image:type', content: 'image/jpeg' },
    { property: 'og:image:width', content: DEFAULT_OG_IMAGE_WIDTH },
    { property: 'og:image:height', content: DEFAULT_OG_IMAGE_HEIGHT },
    { property: 'og:image:alt', content: imageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: route.title },
    { name: 'twitter:description', content: route.description },
    { name: 'twitter:url', content: canonical },
    { name: 'twitter:image', content: DEFAULT_OG_IMAGE },
    { name: 'twitter:image:alt', content: imageAlt },
    { 'script:ld+json': createHomeStructuredData() },
  ];
}
