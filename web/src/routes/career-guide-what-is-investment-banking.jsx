import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-what-is-investment-banking');
export default function WhatIsInvestmentBankingGuide() {
  return <CareerGuidePage guideId="what-is-investment-banking" />;
}
