import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-investment-banking-operations');

export default function InvestmentBankingOperationsCareerGuide() {
  return <CareerGuidePage guideId="investment-banking-operations" />;
}
