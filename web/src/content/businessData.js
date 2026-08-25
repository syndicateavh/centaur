import { SITE_ORIGIN } from '../seo/siteConfig.js';

export const BUSINESS_DATA = Object.freeze({
  name: 'Centaur Careers',
  description:
    'Centaur Careers - 6-week Hire-Train-Deploy program for finance careers. 3 Pillars: IB Ops, Retail Banking, Finance Ops. Lucknow Advantage hometown jobs, unlimited interviews, Target CTC 3–12 LPA. Offline training with Mindsprout partner.',
  url: SITE_ORIGIN,
  logoUrl: `${SITE_ORIGIN}/images/brand/centaur-careers-logo.jpg`,
  telephone: '+919369213948',
  displayTelephone: '+91 93692 13948',
  email: 'contact@centaurcareers.in',
  trainingPartner: 'Mindsprout Careers Hub',
  whatsappUrl: 'https://wa.link/aviltt',
  enrollmentUrl: 'https://forms.gle/S27eFPLigM2gwumVA',
  address: Object.freeze({
    streetAddress: 'R K Tower, 70/2, Sector B, Badabirwa, Alambagh',
    addressLocality: 'Lucknow',
    addressRegion: 'Uttar Pradesh',
    postalCode: '226005',
    addressCountry: 'IN',
  }),
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=R%20K%20Tower%2070%2F2%20Sector%20B%20Badabirwa%20Alambagh%20Lucknow%20226005',
  sameAs: Object.freeze([
    'https://www.linkedin.com/company/centaur-careers/',
    'https://www.instagram.com/centaurcareers',
  ]),
});

export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
