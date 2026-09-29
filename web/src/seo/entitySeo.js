import { BUSINESS_DATA, ORGANIZATION_ID, WEBSITE_ID } from '../content/businessData.js';
import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_ORIGIN,
} from './siteConfig.js';

const LOGO_ID = `${SITE_ORIGIN}/#logo`;

export const ORGANIZATION_DISAMBIGUATING_DESCRIPTION = 'Centaur Careers (CENTAURPRIVATE LIMITED) is an Indian finance and banking operations career-training provider offering the 6-week Financial Operations Masterclass, distinct from Centaur Pharmaceuticals and unrelated to AI or chess centaur metaphors.';

export const ORGANIZATION_KNOWS_ABOUT = Object.freeze([
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

export function createOrganizationSchema() {
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

export function createWebsiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_ORIGIN}/`,
    name: BUSINESS_DATA.name,
    inLanguage: BUSINESS_DATA.language,
    publisher: { '@id': ORGANIZATION_ID },
  };
}
