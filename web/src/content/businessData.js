import { SITE_ORIGIN } from '../seo/siteConfig.js';

export const SOCIAL_PROFILES = Object.freeze({
  linkedin: 'https://www.linkedin.com/company/centaur-careers/',
  instagram: 'https://www.instagram.com/centaurcareers',
});

export const BUSINESS_DATA = Object.freeze({
  name: 'Centaur Careers',
  legalName: 'Centaur Careers Private Limited',
  country: 'India',
  countryCode: 'IN',
  language: 'en-IN',
  locale: 'en_IN',
  description:
    'Centaur Careers guarantees a finance job to graduates and job switchers who complete the six-week Financial Operations Masterclass. Live online learning is available across India, with an in-person option in Lucknow.',
  url: `${SITE_ORIGIN}/`,
  logoUrl: `${SITE_ORIGIN}/images/brand/centaur-careers-logo.jpg`,
  telephone: '+919369213948',
  displayTelephone: '+91 93692 13948',
  email: 'contact@centaurcareers.in',
  whatsappUrl: 'https://wa.link/aviltt',
  enrollmentUrl: 'https://forms.gle/S27eFPLigM2gwumVA',
  serviceArea: Object.freeze({
    '@type': 'Country',
    name: 'India',
    identifier: 'IN',
  }),
  trainingLocation: Object.freeze({
    name: 'Mindsprout Career Hub',
    path: '/locations/lucknow/',
    address: Object.freeze({
      streetAddress: 'R K Tower, 70/2, Sector B, Barabirwa, Alambagh',
      addressLocality: 'Lucknow',
      addressRegion: 'Uttar Pradesh',
      postalCode: '226005',
      addressCountry: 'IN',
    }),
    mapUrl: 'https://maps.app.goo.gl/x52KpPa2icdo213d6',
  }),
  sameAs: Object.freeze([
    SOCIAL_PROFILES.linkedin,
    SOCIAL_PROFILES.instagram,
  ]),
});

export const FINANCE_CURRENT_AFFAIRS_WHATSAPP_MESSAGE =
  'Hi Centaur Careers, I would like to request access to the Finance Current Affairs WhatsApp updates.';

export const FINANCE_CURRENT_AFFAIRS_WHATSAPP_URL =
  `https://wa.me/${BUSINESS_DATA.telephone.replace(/\D/g, '')}?text=${encodeURIComponent(FINANCE_CURRENT_AFFAIRS_WHATSAPP_MESSAGE)}`;

export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
